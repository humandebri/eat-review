'use client';

import { useAuth } from '@/contexts/auth-context';

interface LoginButtonProps {
  junoReady?: boolean;
}

export function LoginButton({ junoReady = true }: LoginButtonProps) {
  const { user, loading, isInitialized, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <button
        onClick={logout}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-full hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 shadow-md"
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        if (isInitialized && junoReady) {
          login();
        } else {
          console.warn('Juno is not ready yet. Please wait...');
          alert('システムを初期化中です。しばらくお待ちください。');
        }
      }}
      disabled={!isInitialized || !junoReady}
      className={`px-4 sm:px-6 py-2 sm:py-2.5 font-semibold rounded-full transform transition-all duration-200 shadow-lg text-sm sm:text-base flex items-center space-x-2 ${
        isInitialized && junoReady 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105' 
          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
      }`}
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 1 21 9z" />
      </svg>
      <span>{isInitialized && junoReady ? 'ログイン' : '初期化中...'}</span>
    </button>
  );
}