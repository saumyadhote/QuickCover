import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';

// -----------------------------------------------------------------------
// Resolve the backend URL for every environment automatically:
//   Android emulator  →  10.0.2.2  (maps to host machine)
//   iOS simulator     →  localhost
//   Physical device   →  EXPO_PUBLIC_API_URL  (must be set in .env)
// -----------------------------------------------------------------------
function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl !== 'http://localhost:4000') return envUrl;
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
}

const API_URL = resolveApiUrl();

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
};

type MockDataContextType = {
  state: AppState | null;
  loading: boolean;
  backendOnline: boolean;
  acceptTrip: () => Promise<void>;
  completeTrip: () => Promise<void>;
};

const FALLBACK_STATE: AppState = {
  isTripActive: false,
  disruption: null,
  claimStatus: 'none',
  weeklyEarnings: 3200,
  weeklyProtected: 0,
};

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  // Track whether we've already warned so we don't spam the console
  const warnedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`, { timeout: 2000 });
        if (!cancelled) {
          setState(res.data);
          setBackendOnline(true);
          warnedRef.current = false; // reset so we log recovery
        }
      } catch {
        if (!cancelled) {
          setBackendOnline(false);
          if (!state) setState(FALLBACK_STATE);
          if (!warnedRef.current) {
            console.warn(
              `[QuickCover] Backend unavailable at ${API_URL}. ` +
              `Running in offline mode.\n` +
              `Physical device? Set EXPO_PUBLIC_API_URL=http://<your-wifi-ip>:4000 in mobile/.env`
            );
            warnedRef.current = true;
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000); // reduced from 2 s to 4 s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- acceptTrip -------------------------------------------------------
  const acceptTrip = async () => {
    if (!backendOnline) {
      // Offline: mutate local state so the UI still responds
      setState(prev => prev ? { ...prev, isTripActive: true } : prev);
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/accept-trip`);
      setState(res.data.state);
    } catch {
      setState(prev => prev ? { ...prev, isTripActive: true } : prev);
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
      const res = await axios.post(`${API_URL}/complete-trip`);
      setState(res.data.state);
    } catch {
      setState(prev =>
        prev ? { ...prev, isTripActive: false } : prev
      );
    }
  };

  return (
    <MockDataContext.Provider value={{ state, loading, backendOnline, acceptTrip, completeTrip }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) throw new Error('useMockData must be used within MockDataProvider');
  return context;
}
