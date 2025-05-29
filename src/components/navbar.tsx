'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { LoginButton } from '@/components/login-button';

interface NavbarProps {
  onAddRestaurant: () => void;
  onInsertDemoData: () => void;
}

export function Navbar({ onAddRestaurant, onInsertDemoData }: NavbarProps) {
  const { user } = useAuth();

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Eat Review
            </h1>
          </Link>
          
          {/* ナビゲーションメニュー */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* レストラン追加ボタン */}
                <button
                  onClick={onAddRestaurant}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">レストランを追加</span>
                  <span className="sm:hidden">追加</span>
                </button>
                
                {/* 3Pボタン（将来の機能用） */}
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50"
                  disabled
                  title="Coming Soon"
                >
                  <span className="hidden sm:inline">3P</span>
                  <span className="sm:hidden">3P</span>
                </button>
                
                {/* マイページリンク */}
                <Link
                  href="/mypage"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a2 2 0 11-4 0 2 2 0 014 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">マイページ</span>
                </Link>
                
                {/* ログアウトボタン */}
                <LoginButton />
              </>
            ) : (
              <>
                {/* 未ログイン時 */}
                <button
                  onClick={onAddRestaurant}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50"
                  disabled
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">レストランを追加</span>
                  <span className="sm:hidden">追加</span>
                </button>
                <LoginButton />
              </>
            )}
            
            {/* デモデータボタン（開発用） */}
            <button
              onClick={onInsertDemoData}
              className="hidden lg:flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="デモデータを追加"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}