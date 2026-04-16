import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { API_URL } from '../utils/apiUrl';
import { useAuth } from './AuthContext';

type Disruption = {
  type: string;
  zone: string;
  severity: string;
  message: string;
  timestamp: string;
};

type AppState = {
  isTripActive: boolean;
  disruption: Disruption | null;
  // 'coverage_honored' = shift-level cap applied — payout already issued for
  // this disruption type within the 8-hour shift window; no transfer needed.
  claimStatus: 'none' | 'processing' | 'approved' | 'paid' | 'coverage_honored';
  weeklyEarnings: number;
  weeklyProtected: number;
  lastPayoutAmount: number;
  lastTxnId: string | null;
  currentMicroFee: number;
  currentRiskLevel: 'Low' | 'Medium' | 'High';
};

type Eligibility = {
  eligible: boolean;
  tripCount: number;
  required: number;
};

export type RecentClaim = {
  id: number;
  status: string;
  earnings: number;
  protectedAmount: number;
  timestamp: string;
  hoursWorked: number | null;
  disruptionType: string | null;
};

export type AppStats = {
  monthly: {
    claimCount: number;
    totalPaid: number;
  };
  allTime: {
    claimsFiled: number;
    claimsApproved: number;
    totalPaid: number;
    avgPayout: number;
    approvalRate: number;
    annualRemaining: number;
  };
  recent: Array<{
    id: number;
    disruptionType: string | null;
    protectedAmount: number;
    hoursWorked: number | null;
    timestamp: string;
  }>;
};

// One GPS ping captured during a trip. Sent with claims for fraud scoring.
type GpsPing = {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy: number;
};

type MockDataContextType = {
  state: AppState;
  loading: boolean;
  backendOnline: boolean;
  eligibility: Eligibility;
  recentClaims: RecentClaim[];
  stats: AppStats;
  acceptTrip: () => Promise<void>;
  completeTrip: () => Promise<void>;
  submitClaim: (type: string, message: string, hoursWorked: number) => Promise<void>;
};

const FALLBACK_STATE: AppState = {
  isTripActive: false,
  disruption: null,
  claimStatus: 'none',
  weeklyEarnings: 3200,
  weeklyProtected: 0,
  lastPayoutAmount: 0,
  lastTxnId: null,
  currentMicroFee: 2.0,
  currentRiskLevel: 'Low',
};

const MockDataContext = createContext<MockDataContextType | null>(null);

const FALLBACK_ELIGIBILITY: Eligibility = { eligible: false, tripCount: 0, required: 25 };

const FALLBACK_STATS: AppStats = {
  monthly:  { claimCount: 0, totalPaid: 0 },
  allTime:  { claimsFiled: 0, claimsApproved: 0, totalPaid: 0, avgPayout: 0, approvalRate: 100, annualRemaining: 8165 },
  recent:   [],
};

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<AppState>(FALLBACK_STATE);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [eligibility, setEligibility] = useState<Eligibility>(FALLBACK_ELIGIBILITY);
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [stats, setStats] = useState<AppStats>(FALLBACK_STATS);
  // Track whether we've already warned so we don't spam the console
  const warnedRef = useRef(false);
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ── Network Resilience Interceptors ───────────────────────────────────────
  useEffect(() => {
    const defaultTimeout = axios.defaults.timeout;
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
          console.warn('[Network] Connection dropped! Triggering offline queue persistence.');
          // You can dispatch a global UI toast here if needed
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const authHeaders = () => tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};

  // ── GPS tracking ─────────────────────────────────────────────────────────
  // Permission is requested once on mount. GPS pings are collected while a trip
  // is active and sent with claim submissions for fraud scoring on the backend.
  // All GPS paths degrade gracefully: if permission is denied or the platform
  // doesn't support location, the trace stays empty and the backend uses clean defaults.
  const [locationPermitted, setLocationPermitted] = useState(false);
  const gpsTraceRef = useRef<GpsPing[]>([]);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Request foreground location permission once when the provider mounts.
  // We do this early so the OS dialog appears during normal app startup rather
  // than mid-claim when the user is under stress.
  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        setLocationPermitted(status === 'granted');
        if (status !== 'granted') {
          console.log('[GPS] Permission denied — GPS fraud signals will be absent from claims');
        }
      })
      .catch(() => {
        // requestForegroundPermissionsAsync can reject on some Android builds; silently skip
      });
  }, []);

  // Start/stop position watching based on trip state and permission.
  // Pings are capped at 10 per trace to keep the claim payload small.
  useEffect(() => {
    if (!locationPermitted || !state.isTripActive) {
      // Stop any existing subscription when the trip ends or permission is absent
      locationSubRef.current?.remove();
      locationSubRef.current = null;
      return;
    }

    // Fresh trace for each new trip
    gpsTraceRef.current = [];

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,   // at most one ping per 30s
        distanceInterval: 50,  // or every 50m of movement
      },
      (position) => {
        const ping: GpsPing = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(position.timestamp).toISOString(),
          accuracy: Math.round(position.coords.accuracy ?? 15),
        };
        // Keep last 10 pings — enough for teleportation detection, small payload
        gpsTraceRef.current = [...gpsTraceRef.current.slice(-9), ping];
      }
    ).then(sub => {
      locationSubRef.current = sub;
    }).catch(err => {
      console.log('[GPS] watchPositionAsync failed:', err.message);
    });

    return () => {
      locationSubRef.current?.remove();
      locationSubRef.current = null;
    };
  }, [locationPermitted, state.isTripActive]);

  const fetchRecentClaims = async () => {
    try {
      const res = await axios.get(`${API_URL}/trips/recent`, { timeout: 4000, headers: authHeaders() });
      setRecentClaims(res.data.trips ?? []);
    } catch { /* silent — list stays stale */ }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`, { timeout: 4000, headers: authHeaders() });
      setStats(res.data);
    } catch { /* silent — stats stay at fallback */ }
  };

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 6;

    const fetchStatus = async (attempt = 1) => {
      try {
        console.log(`[QuickCover] Connecting to ${API_URL}...`);
        const headers = authHeaders();
        const [statusRes, eligRes] = await Promise.all([
          axios.get(`${API_URL}/status`, { timeout: 4000, headers }),
          axios.get(`${API_URL}/eligibility`, { timeout: 4000, headers }).catch(() => null),
        ]);
        if (!cancelled) {
          // Don't overwrite state with a stale poll while a claim is in-flight —
          // fast-poll handles updates during processing/approved
          setState(prev => {
            const inFlight = prev.claimStatus === 'processing' || prev.claimStatus === 'approved';
            return inFlight ? prev : statusRes.data;
          });
          if (eligRes) {
            setEligibility(eligRes.data);
            console.log(`✅ [QuickCover] Connected! Eligible: ${eligRes.data.eligible} (${eligRes.data.tripCount}/${eligRes.data.required} trips)`);
          } else {
            console.log(`✅ [QuickCover] Connected! (eligibility endpoint not yet available)`);
          }
          setBackendOnline(true);
          warnedRef.current = false;
          fetchRecentClaims();
          fetchStats();
        }
      } catch (err: any) {
        if (!cancelled) {
          const errMsg = err.code || err.message || 'Unknown';
          console.log(`❌ [QuickCover] Connection failed (${errMsg}) - attempt ${attempt}/${maxRetries}`);
          setBackendOnline(false);

          if (attempt < maxRetries) {
            // Fixed 3s retry — don't exponentially back off, just keep trying quietly
            setTimeout(() => {
              if (!cancelled) fetchStatus(attempt + 1);
            }, 3000);
          } else if (!warnedRef.current) {
            console.warn(`[QuickCover] ⚠️  Backend unavailable — running in offline mode.`);
            warnedRef.current = true;
          }
        }
      }
    };

    fetchStatus();
    const interval = setInterval(() => fetchStatus(), 12000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fast-poll while a claim is in-flight so the timeline updates within ~2s of each transition
  useEffect(() => {
    const isInFlight = state.claimStatus === 'processing' || state.claimStatus === 'approved';
    if (!isInFlight) return;

    let cancelled = false;
    const fastPoll = async () => {
      if (cancelled) return;
      try {
        const res = await axios.get(`${API_URL}/status`, { timeout: 4000, headers: authHeaders() });
        if (!cancelled) setState(res.data);
      } catch { /* silent */ }
    };

    // Don't fire immediately — the backend needs ~4s to write 'processing' to DB.
    // Firing instantly would fetch stale 'none' state and wipe the optimistic update.
    const interval = setInterval(fastPoll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state.claimStatus]); // backendOnline removed — catch handles offline silently

  // ---- acceptTrip -------------------------------------------------------
  const acceptTrip = async () => {
    // Optimistic update for immediate UI response
    setState(prev => prev ? { ...prev, isTripActive: true } : prev);

    if (!backendOnline) return;

    // Fire and forget the GPS & network calls so we don't block the button
    (async () => {
      let gpsBody: { lat?: number; lon?: number } = {};
      if (locationPermitted) {
        try {
          // getLastKnown resolves instantly; if null, fallback to getCurrent
          const pos = await Location.getLastKnownPositionAsync() || await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (pos) {
            gpsBody = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            console.log(`[GPS] Trip start position: ${gpsBody.lat?.toFixed(4)}, ${gpsBody.lon?.toFixed(4)}`);
          }
        } catch {
          // Proceed without exact coordinates if GPS is disabled/fetching fails
        }
      }

      try {
        const res = await axios.post(`${API_URL}/accept-trip`, gpsBody, { headers: authHeaders() });
        setState(res.data.state);
      } catch {
        // It failed, but we already updated optimistically above to keep UI smooth
      }
    })();
  };

  // ---- submitClaim -------------------------------------------------------
  const submitClaim = async (type: string, message: string, hoursWorked: number) => {
    // Optimistically show timeline immediately — prevents flash back to empty state
    // while the backend processes the claim (4s delay before DB updates)
    setState(prev => prev ? { ...prev, claimStatus: 'processing' } : prev);
    
    // Capture the accumulated GPS trace and device metadata for fraud scoring.
    // The backend scoreClaim() uses these for mock-location detection, teleportation
    // checks, and behavioural sanity — no GPS = defaults to clean (no penalty).
    const gpsTrace = [...gpsTraceRef.current]; // snapshot, not a live ref
    const lastPing = gpsTrace[gpsTrace.length - 1];

    const deviceData = {
      platform: Platform.OS,
      mockLocationEnabled: false,
      locationAccuracy: lastPing?.accuracy ?? 15,
    };

    const claimPayload = {
      type,
      zone: 'ZONE_A',
      severity: 'HIGH',
      message,
      hours_worked: hoursWorked,
      deviceData,
      gpsTrace,
    };

    if (!backendOnline) {
       console.log('[MockDataContext] Offline mode: Queuing claim directly to AsyncStorage');
       const existingQueueStr = await AsyncStorage.getItem('@offline_claims');
       const existingQueue = existingQueueStr ? JSON.parse(existingQueueStr) : [];
       await AsyncStorage.setItem('@offline_claims', JSON.stringify([...existingQueue, claimPayload]));
       return;
    }

    console.log(
      `[GPS] Claim submitted — trace length: ${gpsTrace.length}, ` +
      `last accuracy: ${deviceData.locationAccuracy}m, platform: ${deviceData.platform}`
    );

    try {
      const res = await axios.post(`${API_URL}/trigger-disruption`, claimPayload, { headers: authHeaders() });
      setState(res.data.state);
      fetchRecentClaims();
      fetchStats();
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        console.warn('[MockDataContext] Timeout during claim submission, queueing to AsyncStorage.');
        const existingQueueStr = await AsyncStorage.getItem('@offline_claims');
        const existingQueue = existingQueueStr ? JSON.parse(existingQueueStr) : [];
        await AsyncStorage.setItem('@offline_claims', JSON.stringify([...existingQueue, claimPayload]));
      } else {
        // Backend rejected the claim (e.g. ineligible)
        const serverMsg = err?.response?.data?.error;
        console.warn('[submitClaim] rejected:', serverMsg);
        setState(prev => prev ? { ...prev, claimStatus: 'none' } : prev);
      }
    }
  };

  // ---- completeTrip -----------------------------------------------------
  const completeTrip = async () => {
    // Optimistic update for immediate UI response
    setState(prev =>
      prev
        ? {
            ...prev,
            isTripActive: false,
            weeklyEarnings: prev.weeklyEarnings + 45,
            weeklyProtected: prev.weeklyProtected + prev.weeklyEarnings * 0.1,
          }
        : prev
    );

    if (!backendOnline) return;

    // Fire and forget the network calls
    (async () => {
      try {
        const headers = authHeaders();
        const res = await axios.post(`${API_URL}/complete-trip`, {}, { headers });
        setState(res.data.state);
        // Refresh eligibility silently in the background
        const eligRes = await axios.get(`${API_URL}/eligibility`, { timeout: 4000, headers });
        setEligibility(eligRes.data);
      } catch {
        // It failed, but optimistic UI handled it
      }
    })();
  };

  return (
    <MockDataContext.Provider value={{ state, loading, backendOnline, eligibility, recentClaims, stats, acceptTrip, completeTrip, submitClaim }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) throw new Error('useMockData must be used within MockDataProvider');
  return context;
}
