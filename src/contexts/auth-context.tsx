'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authSubscribe, signIn, signOut, User as JunoUser } from '@junobuild/core';

interface AuthContextType {
  user: JunoUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JunoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証状態の変更を監視
    const unsubscribe = authSubscribe((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      await signIn({
        maxTimeToLive: BigInt(30 * 24 * 60 * 60 * 1000 * 1000 * 1000) // 30日間
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}