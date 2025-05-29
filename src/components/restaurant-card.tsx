import type { Restaurant } from '@/types/restaurant';
import { StarRating } from './star-rating';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
  averageRating90d?: number;
}

export function RestaurantCard({ restaurant, onClick, averageRating90d }: RestaurantCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-100 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-50 to-red-100 dark:from-orange-900/50 dark:via-amber-900/30 dark:to-red-900/50 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            <span className="text-6xl sm:text-7xl opacity-60 relative z-10">🍽️</span>
          </div>
        )}
        
        {/* Rating badge with improved design */}
        {restaurant.averageRating && restaurant.averageRating > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-white/20">
            <StarRating rating={restaurant.averageRating} size="sm" showNumber={true} />
            {averageRating90d && averageRating90d > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                90日: {averageRating90d.toFixed(1)}
              </div>
            )}
          </div>
        )}
        
        {/* Category tag overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-orange-700 dark:text-orange-300 rounded-full border border-white/20 shadow-sm">
            {restaurant.category}
          </span>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight mb-2">
            {restaurant.name}
          </h3>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{restaurant.address}</span>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 leading-relaxed">{restaurant.businessHours}</span>
          </div>
        </div>
        
        {restaurant.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          {restaurant.reviewCount && restaurant.reviewCount > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {restaurant.reviewCount}件のレビュー
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              レビューはまだありません
            </span>
          )}
          
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform duration-200">
            <span className="text-sm font-semibold">詳細を見る</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}