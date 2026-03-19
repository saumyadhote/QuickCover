import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../utils/apiUrl';

export { API_URL };
const TOKEN_KEY = 'qc_auth_token';

// Platform-aware token storage: localStorage on web, SecureStore on native
const tokenStorage = {
  get: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  set: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  },
  delete: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  },
};

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
        const stored = await tokenStorage.get(TOKEN_KEY);
        if (stored) {
          // Local token (offline/web fallback) — restore from localStorage
          if (Platform.OS === 'web' && stored.startsWith('local_')) {
            const raw = localStorage.getItem('qc_local_user');
            if (raw) { setToken(stored); setUser(JSON.parse(raw)); }
            else await tokenStorage.delete(TOKEN_KEY);
          } else {
            const res = await axios.get(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${stored}` },
              timeout: 3000,
            });
            setToken(stored);
            setUser(res.data.user);
          }
        }
      } catch {
        await tokenStorage.delete(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password }, { timeout: 8000 });
      await tokenStorage.set(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      // If backend is unreachable (cold start / offline), fall back to local auth on web
      if (Platform.OS === 'web' && (!err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK')) {
        const stored = localStorage.getItem('qc_local_users');
        const users: (RegisterData & { id: number; createdAt: string })[] = stored ? JSON.parse(stored) : [];
        const match = users.find(u => u.email === email && u.password === password);
        if (!match) throw new Error('Invalid email or password.');
        const fakeToken = `local_${Date.now()}`;
        const fakeUser: User = { id: match.id, name: match.name, email: match.email, phone: match.phone, driverId: match.driverId, platform: match.platform, createdAt: match.createdAt };
        await tokenStorage.set(TOKEN_KEY, fakeToken);
        localStorage.setItem('qc_local_user', JSON.stringify(fakeUser));
        setToken(fakeToken);
        setUser(fakeUser);
        return;
      }
      throw err;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data, { timeout: 8000 });
      await tokenStorage.set(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      // If backend is unreachable, register locally on web
      if (Platform.OS === 'web' && (!err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK')) {
        const stored = localStorage.getItem('qc_local_users');
        const users: any[] = stored ? JSON.parse(stored) : [];
        if (users.find(u => u.email === data.email)) throw new Error('An account with this email already exists.');
        const newUser = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('qc_local_users', JSON.stringify(users));
        const fakeToken = `local_${Date.now()}`;
        const fakeUser: User = { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, driverId: newUser.driverId, platform: newUser.platform, createdAt: newUser.createdAt };
        await tokenStorage.set(TOKEN_KEY, fakeToken);
        localStorage.setItem('qc_local_user', JSON.stringify(fakeUser));
        setToken(fakeToken);
        setUser(fakeUser);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    await tokenStorage.delete(TOKEN_KEY);
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
