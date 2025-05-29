'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { DatastoreService } from '@/services/datastore';
import { WalletService } from '@/services/wallet.service';
import type { Review, Restaurant } from '@/types/restaurant';
import type { WalletInfo } from '@/types/wallet';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [restaurants, setRestaurants] = useState<Map<string, Restaurant>>(new Map());
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserData = async () => {
    if (!user?.key) return;
    
    try {
      setLoading(true);
      
      // Load user reviews
      const userReviews = await DatastoreService.getUserReviews(user.key);
      setReviews(userReviews);
      
      // Load restaurant data for each review
      const restaurantMap = new Map<string, Restaurant>();
      for (const review of userReviews) {
        if (!restaurantMap.has(review.restaurantId)) {
          const restaurant = await DatastoreService.getRestaurant(review.restaurantId);
          if (restaurant) {
            restaurantMap.set(review.restaurantId, restaurant);
          }
        }
      }
      setRestaurants(restaurantMap);
      
      // Load wallet balance
      const balance = await WalletService.getICPBalance(user.key);
      setWalletInfo(balance);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-blue-50 via-white to-lavender-blue-100 flex items-center justify-center">
        <div className="animate-pulse text-lavender-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-blue-50 via-white to-lavender-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-lavender-blue-600 hover:text-lavender-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-lavender-blue-900">マイページ</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-lavender-blue-800 mb-6">プロフィール</h2>
              
              {/* User Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                  {user.key?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <p className="text-sm text-gray-600 break-all">
                  {user.key}
                </p>
              </div>

              {/* Wallet Balance */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">ウォレット残高</h3>
                <div className="bg-gradient-to-r from-lavender-blue-50 to-lavender-blue-100 rounded-lg p-4">
                  {loading ? (
                    <div className="animate-pulse h-8 bg-lavender-blue-200 rounded"></div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold text-lavender-blue-800">
                        {walletInfo ? WalletService.formatICPAmount(walletInfo.balance) : '0'} ICP
                      </p>
                      <p className="text-xs text-lavender-blue-600 mt-1">
                        ≈ {walletInfo?.rawBalance.toString() || '0'} e8s
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">統計</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">レビュー数</span>
                    <span className="font-semibold text-lavender-blue-800">{reviews.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-lavender-blue-800 mb-4">設定</h2>
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  今後の機能拡張で設定項目が追加される予定です
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-lavender-blue-800 mb-6">
                あなたのレビュー ({reviews.length})
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">まだレビューがありません</p>
                  <Link
                    href="/"
                    className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    レストランを探す
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const restaurant = restaurants.get(review.restaurantId);
                    return (
                      <div
                        key={review.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <Link
                              href={`/restaurants/${review.restaurantId}`}
                              className="text-lg font-semibold text-lavender-blue-800 hover:text-lavender-blue-600"
                            >
                              {restaurant?.name || 'Unknown Restaurant'}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {restaurant?.category} • {restaurant?.address}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl mr-1">⭐</span>
                            <span className="font-semibold text-lg">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3 line-clamp-2">{review.comment}</p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>訪問日: {review.visitDate}</span>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}