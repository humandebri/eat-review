'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { LoginButton } from '@/components/login-button';
import { RestaurantForm } from '@/components/restaurant-form';
import { DatastoreService } from '@/services/datastore';
import { insertDemoData } from '@/utils/demo-data';
import type { Restaurant } from '@/types/restaurant';

export function GlobalNavbar() {
  const { user, loading, isInitialized } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  // デバッグ用ログ
  console.log('GlobalNavbar - Auth state:', { user, loading, isInitialized });

  const handleCreateRestaurant = async (restaurant: Omit<Restaurant, 'id'>) => {
    try {
      // ownerフィールドを追加
      const restaurantWithOwner = {
        ...restaurant,
        owner: user?.key || 'anonymous'
      };
      await DatastoreService.createRestaurant(restaurantWithOwner);
      setShowForm(false);
      // ページリロードして最新データを表示
      window.location.reload();
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      alert('レストランの登録に失敗しました');
    }
  };

  const handleInsertDemoData = async () => {
    if (confirm('デモデータを追加しますか？')) {
      try {
        await insertDemoData();
        alert('デモデータを追加しました！');
        // ページリロードして最新データを表示
        window.location.reload();
      } catch (error) {
        console.error('デモデータの追加に失敗しました:', error);
        alert('デモデータの追加に失敗しました。コンソールをご確認ください。');
      }
    }
  };

  const handleAddRestaurant = () => {
    if (user) {
      setShowForm(true);
    } else {
      setShowLoginMessage(true);
      setTimeout(() => setShowLoginMessage(false), 3000);
    }
  };

  // Juno初期化が完了するまでローディング状態のNavbarを表示
  if (!isInitialized) {
    return (
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Eat Review
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
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
              {loading ? (
                <>
                  {/* 認証読み込み中 */}
                  <div className="animate-pulse">
                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  </div>
                </>
              ) : user ? (
                <>
                  {/* レストラン追加ボタン */}
                  <button
                    onClick={handleAddRestaurant}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">レストランを追加</span>
                    <span className="sm:hidden">追加</span>
                  </button>
                  
                  {/* マイページボタン */}
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
                  <LoginButton junoReady={isInitialized} />
                </>
              ) : (
                <>
                  {/* 未ログイン時 */}
                  <button
                    onClick={handleAddRestaurant}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">レストランを追加</span>
                    <span className="sm:hidden">追加</span>
                  </button>
                  <LoginButton junoReady={isInitialized} />
                </>
              )}
              
              {/* デモデータボタン（開発用） */}
              <button
                onClick={handleInsertDemoData}
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

      {/* ログインメッセージ */}
      {showLoginMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-pulse">
          レストランを追加するにはログインが必要です
        </div>
      )}

      {/* レストラン追加フォーム（モーダル） */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                レストラン登録
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RestaurantForm
              onSubmit={handleCreateRestaurant}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}