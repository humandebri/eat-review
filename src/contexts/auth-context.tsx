'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authSubscribe, signIn, signOut, initSatellite, User as JunoUser } from '@junobuild/core';
import { AUTH_CONFIG } from '@/config/auth';

interface AuthContextType {
  user: JunoUser | null;
  loading: boolean;
  isInitialized: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JunoUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Juno Satelliteの初期化
    const initJuno = async () => {
      try {
        console.log('Initializing Juno Satellite in AuthProvider...');
        await initSatellite({
          workers: {
            auth: true,
          },
        });
        console.log('Juno Satellite initialized successfully in AuthProvider');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Juno Satellite in AuthProvider:', error);
        setIsInitialized(true); // エラーでも続行
      }
    };

    initJuno();

    // 認証状態の変更を監視
    const unsubscribe = authSubscribe((user) => {
      setUser(user);
      setLoading(false);
    });

    // 初期化時にloadingをfalseに設定するタイマー（フォールバック）
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      console.log('Attempting login...');
      
      console.log('Calling signIn with config...');
      const result = await signIn({
        maxTimeToLive: AUTH_CONFIG.MAX_TIME_TO_LIVE,
        windowed: AUTH_CONFIG.WINDOWED,
        allowPin: AUTH_CONFIG.ALLOW_PIN,
      });
      console.log('Login successful, result:', result);
    } catch (error) {
      console.error('Login failed:', error);
      // 開発環境では詳細なエラー情報を表示
      if (error instanceof Error) {
        if (error.message.includes('No client is ready')) {
          alert('システムがまだ初期化中です。もう一度お試しください。');
        } else {
          alert(`ログインに失敗しました: ${error.message}`);
        }
      }
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
    <AuthContext.Provider value={{ user, loading, isInitialized, login, logout }}>
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