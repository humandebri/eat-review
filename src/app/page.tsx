"use client";

import { useEffect, useState } from "react";
import { initSatellite } from "@junobuild/core";
import { RestaurantCard } from "@/components/restaurant-card";
import { RestaurantForm } from "@/components/restaurant-form";
import { LoginButton } from "@/components/login-button";
import { DatastoreService } from "@/services/datastore";
import { insertDemoData } from "@/utils/demo-data";
import { useAuth } from "@/contexts/auth-context";
import { categoryMapping, mainCategories } from "@/utils/category-mapping";
import type { Restaurant, RestaurantCategory } from "@/types/restaurant";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const { user } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await initSatellite({
        workers: {
          auth: true,
        },
      });
      loadRestaurants();
    })();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await DatastoreService.listRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (restaurant: Omit<Restaurant, 'id'>) => {
    try {
      await DatastoreService.createRestaurant(restaurant);
      setShowForm(false);
      loadRestaurants();
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      alert('レストランの登録に失敗しました');
    }
  };

  const handleInsertDemoData = async () => {
    if (confirm('デモデータを追加しますか？')) {
      try {
        await insertDemoData();
        await loadRestaurants();
        alert('デモデータを追加しました！');
      } catch (error) {
        console.error('デモデータの追加に失敗しました:', error);
        alert('デモデータの追加に失敗しました。コンソールをご確認ください。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ヘッダー */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex items-center">
              <span className="text-3xl mr-3">🍽️</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Eat Review
              </h1>
            </div>
            
            {/* アクション */}
            <div className="flex items-center gap-3">
              {/* デモデータボタン（開発用） */}
              <button
                onClick={handleInsertDemoData}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                デモデータ
              </button>
              
              {/* レストラン追加ボタン */}
              <button
                onClick={() => {
                  if (user) {
                    setShowForm(true);
                  } else {
                    setShowLoginMessage(true);
                    setTimeout(() => setShowLoginMessage(false), 3000);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">レストランを追加</span>
                <span className="sm:hidden">追加</span>
              </button>
              
              {/* ログインボタン */}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            美味しい体験をシェアしよう
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            お気に入りのレストランを見つけて、レビューを共有しましょう
          </p>
        </div>

        {/* ログインメッセージ */}
        {showLoginMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-pulse">
            レストランを追加するにはログインが必要です
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">😔</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                まだレストランが登録されていません
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                最初のレストランを追加して、美味しい体験をシェアしましょう！
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (user) {
                      setShowForm(true);
                    } else {
                      setShowLoginMessage(true);
                      setTimeout(() => setShowLoginMessage(false), 3000);
                    }
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <span className="mr-2">✨</span>
                  最初のレストランを追加
                </button>
                {showLoginMessage && (
                  <div className="text-sm text-red-600 dark:text-red-400 animate-pulse">
                    レストランを追加するにはログインが必要です
                  </div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="block sm:hidden">または</span>
                  <span className="hidden sm:inline">または</span>
                  <button
                    onClick={handleInsertDemoData}
                    className="text-orange-600 hover:text-orange-700 underline mx-2 block sm:inline mt-2 sm:mt-0"
                  >
                    デモデータを追加
                  </button>
                  <span className="hidden sm:inline">してください</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* カテゴリーフィルター */}
            <div className="mb-6 sm:mb-8 overflow-x-auto">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full bg-white dark:bg-gray-800 shadow-lg p-1 min-w-max">
                  {mainCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 dark:from-orange-900/30 dark:to-red-900/30 dark:text-orange-300 shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      } ${category === '中華' || category === 'その他' ? 'hidden sm:inline-block' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* レストラングリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {restaurants
                .filter(restaurant => {
                  if (selectedCategory === 'すべて') return true;
                  // カテゴリーマッピングを使用してフィルター
                  const mappedCategory = categoryMapping[restaurant.category as RestaurantCategory];
                  return mappedCategory === selectedCategory;
                })
                .map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => {
                      window.location.href = `/restaurant?id=${restaurant.id}`;
                    }}
                  />
                ))}
            </div>
            
            {/* フィルター結果が0件の場合 */}
            {restaurants.filter(restaurant => {
              if (selectedCategory === 'すべて') return true;
              const mappedCategory = categoryMapping[restaurant.category as RestaurantCategory];
              return mappedCategory === selectedCategory;
            }).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  「{selectedCategory}」のレストランはまだ登録されていません
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-10 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Built with ❤️ on Internet Computer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
