'use client';

import { Restaurant } from '@/types/restaurant';
import { Review } from '@/types/review';
import { GoogleMap } from './google-map';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  reviews?: Review[];
}

export function RestaurantDetail({ restaurant, reviews = [] }: RestaurantDetailProps) {
  // レビューから画像を抽出（評価の高い順）
  const reviewImages = reviews
    .filter(review => review.photoUrls && review.photoUrls.length > 0)
    .sort((a, b) => b.rating - a.rating)
    .flatMap(review => review.photoUrls || []);
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* ヘッダー画像 */}
      <div className="relative h-64 sm:h-96 mb-6 rounded-2xl overflow-hidden">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center">
            <span className="text-8xl opacity-50">🍽️</span>
          </div>
        )}
        {restaurant.averageRating && restaurant.averageRating > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-yellow-500 text-xl">★</span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">{restaurant.averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({restaurant.reviewCount}件)
            </span>
          </div>
        )}
      </div>

      {/* 基本情報 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {restaurant.name}
          </h1>
          <span className="inline-block px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full">
            {restaurant.category}
          </span>
        </div>

        {restaurant.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {restaurant.description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">住所</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{restaurant.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">営業時間</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{restaurant.businessHours}</p>
            </div>
          </div>

          {restaurant.phoneNumber && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">電話番号</p>
                <a href={`tel:${restaurant.phoneNumber}`} className="text-sm text-blue-600 hover:text-blue-700">
                  {restaurant.phoneNumber}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* レビュー画像ギャラリー */}
      {reviewImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            みんなの写真 ({reviewImages.length}枚)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {reviewImages.slice(0, 8).map((imageUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <img
                  src={imageUrl}
                  alt={`${restaurant.name}の写真 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {reviewImages.length > 8 && (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    +{reviewImages.length - 8}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    枚の写真
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 地図 */}
      {(restaurant.location || restaurant.address) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">アクセス</h2>
          </div>
          <GoogleMap
            address={restaurant.address}
            location={restaurant.location}
            className="h-64 sm:h-96"
          />
        </div>
      )}
    </div>
  );
}