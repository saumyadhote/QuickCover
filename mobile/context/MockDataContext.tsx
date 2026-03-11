import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';

// For physical devices on Expo Go, you MUST use your computer's local WiFi IP (e.g. 192.168.x.x).
// 10.0.2.2 only works for the official Android Studio emulator.
// localhost only works for iOS simulator or Web browser.
// If the user's phone cannot reach the backend, they should replace 'localhost' below with their IPv4 address.
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
// Fallback override: 
// const API_URL = 'http://192.168.1.100:4000'; // Replace with your computer's local IP Address if using a physical phone!

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
        console.warn(`Backend unavailable at ${API_URL}... Are you running the mock server? If you are on a physical phone, you need to change localhost/10.0.2.2 to your computer's local WiFi IP Address in context/MockDataContext.tsx !`);
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
