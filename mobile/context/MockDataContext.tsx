import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 for localhost. For iOS simulator / Web, use localhost.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

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

  // Poll backend every 2 seconds to check for triggers
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`);
        setState(res.data);
      } catch (err) {
        console.warn('Backend unavailable... Are you running the mock server?', err);
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
      console.error(err);
    }
  };

  const completeTrip = async () => {
    try {
      const res = await axios.post(`${API_URL}/complete-trip`);
      setState(res.data.state);
    } catch (err) {
      console.error(err);
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
