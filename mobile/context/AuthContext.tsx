import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../utils/apiUrl';

export { API_URL };
const TOKEN_KEY = 'qc_auth_token';

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  driverId: string;
  platform: string;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  driverId: string;
  platform: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${stored}` },
            timeout: 3000,
          });
          setToken(stored);
          setUser(res.data.user);
        }
      } catch {
        // Token expired or backend unavailable — clear it
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password }, { timeout: 5000 });
    await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const register = async (data: RegisterData) => {
    const res = await axios.post(`${API_URL}/auth/register`, data, { timeout: 5000 });
    await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
