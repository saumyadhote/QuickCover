import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';

// Replacing localhost and 10.0.2.2 with explicit local IP address
// so physical devices (Expo Go) and all emulators can reliably connect.
const API_URL = 'http://10.9.191.124:4000';

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
  acceptTrip: () => Promise<void>;
  completeTrip: () => Promise<void>;
};

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  const fallbackState: AppState = {
    isTripActive: false,
    disruption: null,
    claimStatus: 'none',
    weeklyEarnings: 3200,
    weeklyProtected: 0
  };

  // Poll backend every 2 seconds to check for triggers
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Set a short timeout so the UI doesn't hang if the IP is unreachable
        const res = await axios.get(`${API_URL}/status`, { timeout: 2000 });
        setState(res.data);
      } catch (err) {
        // If it fails, fallback immediately to local state so the UI loads instantly
        if (!state) setState(fallbackState);
        console.warn(`Backend unavailable at ${API_URL}... Using local fallback state. If you are on a physical phone, you need to change 172.25.x.x to your computer's local WiFi IP Address in context/MockDataContext.tsx!`);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const acceptTrip = async () => {
    try {
      const res = await axios.post(`${API_URL}/accept-trip`);
      setState(res.data.state);
    } catch (err) {
      console.error('Error accepting trip:', err);
    }
  };

  const completeTrip = async () => {
    try {
      const res = await axios.post(`${API_URL}/complete-trip`);
      setState(res.data.state);
    } catch (err) {
      console.error('Error completing trip:', err);
    }
  };

  return (
    <MockDataContext.Provider value={{ state, loading, acceptTrip, completeTrip }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within MockDataProvider');
  }
  return context;
}
