'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';

export function LoginButton() {
  const { user, loading, login, logout } = useAuth();

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
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Link href="/mypage" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-shadow">
            {user.key?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 max-w-[150px]">
            <FaUser className="w-3 h-3" />
            <span className="truncate">マイページ</span>
          </span>
        </Link>
        <button
          onClick={logout}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-full hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 shadow-md"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base flex items-center space-x-2"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
      <span>ログイン</span>
    </button>
  );
}