import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { BACKEND_URL } from '../services/config';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  backendReady: boolean;
  join: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ai_gateway_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const joinAttempted = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        if (res.ok) {
          setBackendReady(true);
          return true;
        }
      } catch {}
      return false;
    };

    const poll = async () => {
      const ready = await checkHealth();
      if (!ready) {
        interval = setInterval(async () => {
          const ready = await checkHealth();
          if (ready) clearInterval(interval);
        }, 1500);
      }
    };

    poll();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!backendReady) return;

    const loadUser = async () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          setUser(JSON.parse(storedAuth));
        } else if (!joinAttempted.current) {
          joinAttempted.current = true;
          await join();
        }
      } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [backendReady]);

  const join = async () => {
    const response = await fetch(`${BACKEND_URL}/auth/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to join');
    const userData = await response.json();
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    joinAttempted.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, backendReady, join, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
