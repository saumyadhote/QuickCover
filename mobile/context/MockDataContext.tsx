import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
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
  claimStatus: 'none' | 'processing' | 'approved' | 'paid';
  weeklyEarnings: number;
  weeklyProtected: number;
  currentMicroFee: number;
  currentRiskLevel: 'Low' | 'Medium' | 'High';
};

type Eligibility = {
  eligible: boolean;
  tripCount: number;
  required: number;
};

type MockDataContextType = {
  state: AppState;
  loading: boolean;
  backendOnline: boolean;
  eligibility: Eligibility;
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
  currentMicroFee: 2.0,
  currentRiskLevel: 'Low',
};

const MockDataContext = createContext<MockDataContextType | null>(null);

const FALLBACK_ELIGIBILITY: Eligibility = { eligible: false, tripCount: 0, required: 25 };

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<AppState>(FALLBACK_STATE);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [eligibility, setEligibility] = useState<Eligibility>(FALLBACK_ELIGIBILITY);
  // Track whether we've already warned so we don't spam the console
  const warnedRef = useRef(false);

  const authHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};

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

    fastPoll(); // fire immediately — don't wait 2s for first tick
    const interval = setInterval(fastPoll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [state.claimStatus]); // backendOnline removed — catch handles offline silently

  // ---- acceptTrip -------------------------------------------------------
  const acceptTrip = async () => {
    if (!backendOnline) {
      // Offline: mutate local state so the UI still responds
      setState(prev => prev ? { ...prev, isTripActive: true } : prev);
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/accept-trip`, {}, { headers: authHeaders() });
      setState(res.data.state);
    } catch {
      setState(prev => prev ? { ...prev, isTripActive: true } : prev);
    }
  };

  // ---- submitClaim -------------------------------------------------------
  const submitClaim = async (type: string, message: string, hoursWorked: number) => {
    // Optimistically show timeline immediately — prevents flash back to empty state
    // while the backend processes the claim (4s delay before DB updates)
    setState(prev => prev ? { ...prev, claimStatus: 'processing' } : prev);
    if (!backendOnline) return;
    try {
      const res = await axios.post(`${API_URL}/trigger-disruption`, {
        type,
        zone: 'ZONE_A',
        severity: 'HIGH',
        message,
        hours_worked: hoursWorked,
      }, { headers: authHeaders() });
      setState(res.data.state);
    } catch {
      // Keep processing state on error — fast-poll will sync actual state
    }
  };

  // ---- completeTrip -----------------------------------------------------
  const completeTrip = async () => {
    if (!backendOnline) {
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
      return;
    }
    try {
      const headers = authHeaders();
      const res = await axios.post(`${API_URL}/complete-trip`, {}, { headers });
      setState(res.data.state);
      // Refresh eligibility — trip count just increased
      const eligRes = await axios.get(`${API_URL}/eligibility`, { timeout: 4000, headers });
      setEligibility(eligRes.data);
    } catch {
      setState(prev =>
        prev ? { ...prev, isTripActive: false } : prev
      );
    }
  };

  return (
    <MockDataContext.Provider value={{ state, loading, backendOnline, eligibility, acceptTrip, completeTrip, submitClaim }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) throw new Error('useMockData must be used within MockDataProvider');
  return context;
}
