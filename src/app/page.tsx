"use client";

import { useEffect, useState } from "react";
import { initSatellite } from "@junobuild/core";
import { RestaurantCard } from "@/components/restaurant-card";
import { RestaurantForm } from "@/components/restaurant-form";
import { DatastoreService } from "@/services/datastore";
import { StatsService } from "@/services/stats.service";
import { insertDemoData } from "@/utils/demo-data";
import { useAuth } from "@/contexts/auth-context";
import { categoryMapping, mainCategories } from "@/utils/category-mapping";
import type { Restaurant, RestaurantCategory } from "@/types/restaurant";
import type { RestaurantStats } from "@/types/review";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantStats, setRestaurantStats] = useState<Map<string, RestaurantStats>>(new Map());
  const [loading, setLoading] = useState(true);
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
      
      // Load stats for each restaurant
      const statsMap = new Map<string, RestaurantStats>();
      await Promise.all(
        data.map(async (restaurant) => {
          if (restaurant.id) {
            const stats = await StatsService.getRestaurantStats(restaurant.id);
            if (stats) {
              statsMap.set(restaurant.id, stats);
            }
          }
        })
      );
      setRestaurantStats(statsMap);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        {/* ヒーローセクション */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent mb-6 leading-tight">
            美味しい体験を<br className="sm:hidden" />
            シェアしよう
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4 leading-relaxed">
            お気に入りのレストランを発見し、素晴らしい食体験をコミュニティと共有しましょう
          </p>
        </div>



        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 border-t-orange-500 dark:border-gray-700 dark:border-t-orange-400"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">レストランを読み込み中...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">美味しい発見をお待ちください</p>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="text-4xl absolute opacity-60">🔍</div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                まだレストランが登録されていません
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                レストランを追加して、<br />
                美味しい体験をコミュニティと共有しましょう！
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>ナビゲーションバーの「レストランを追加」ボタンまたは</span>
                <button
                  onClick={() => {
                    if (confirm('デモデータを追加しますか？')) {
                      try {
                        insertDemoData().then(() => {
                          alert('デモデータを追加しました！');
                          window.location.reload();
                        });
                      } catch (error) {
                        console.error('デモデータの追加に失敗しました:', error);
                        alert('デモデータの追加に失敗しました。');
                      }
                    }
                  }}
                  className="text-orange-600 hover:text-orange-700 underline mx-2"
                >
                  デモデータを追加
                </button>
                <span>してください</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* カテゴリーフィルターとカウント表示 */}
            <div className="mb-8 sm:mb-10">
              <div className="text-center mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {restaurants.filter(restaurant => {
                    if (selectedCategory === 'すべて') return true;
                    const mappedCategory = categoryMapping[restaurant.category as RestaurantCategory];
                    return mappedCategory === selectedCategory;
                  }).length}件のレストランが見つかりました
                </p>
              </div>
              
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex justify-center px-4">
                  <div className="inline-flex rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-1.5 sm:p-2 min-w-max border border-gray-200 dark:border-gray-700">
                    {mainCategories.map((category) => {
                      const count = restaurants.filter(restaurant => {
                        if (category === 'すべて') return true;
                        const mappedCategory = categoryMapping[restaurant.category as RestaurantCategory];
                        return mappedCategory === category;
                      }).length;
                      
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`relative px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm lg:text-base font-semibold transition-all duration-300 group whitespace-nowrap ${
                            selectedCategory === category
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } ${category === '中華' || category === 'その他' ? 'hidden sm:inline-block' : ''}`}
                        >
                          <span className="relative z-10">{category}</span>
                          {count > 0 && (
                            <span className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                              selectedCategory === category
                                ? 'bg-white text-orange-600'
                                : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              <span className="text-xs">{count > 99 ? '99+' : count}</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* レストラングリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {restaurants
                .filter(restaurant => {
                  if (selectedCategory === 'すべて') return true;
                  // カテゴリーマッピングを使用してフィルター
                  const mappedCategory = categoryMapping[restaurant.category as RestaurantCategory];
                  return mappedCategory === selectedCategory;
                })
                .map((restaurant) => {
                  if (!restaurant.id) return null;
                  const stats = restaurantStats.get(restaurant.id);
                  return (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      averageRating90d={stats?.averageRating90d}
                      onClick={() => {
                        window.location.href = `/restaurant?id=${restaurant.id}`;
                      }}
                    />
                  );
                })
                .filter(Boolean)}
            </div>
            
            {/* フィルター結果が0件の場合 */}
            {restaurants.filter(restaurant => {
              if (selectedCategory === 'すべて') return true;
              const mappedCategory = categoryMapping[restaurant.category as RestaurantCategory];
              return mappedCategory === selectedCategory;
            }).length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4 opacity-60">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    「{selectedCategory}」のレストランが見つかりません
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    他のカテゴリーをお試しいただくか、新しいレストランを追加してください
                  </p>
                  <button
                    onClick={() => setSelectedCategory('すべて')}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    すべてのカテゴリーを表示
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-gradient-to-r from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Eat Review
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
              分散型食べログ · Internet Computer上で構築
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Built with ❤️ using Next.js, Juno & ICP
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}