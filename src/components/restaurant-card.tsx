import type { Restaurant } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative h-36 sm:h-48 overflow-hidden">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 flex items-center justify-center">
            <span className="text-5xl sm:text-6xl opacity-50">🍽️</span>
          </div>
        )}
        {restaurant.averageRating && restaurant.averageRating > 0 && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-1 shadow-md">
            <span className="text-yellow-500 text-sm sm:text-base">★</span>
            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{restaurant.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {restaurant.name}
          </h3>
          <span className="inline-block self-start px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full">
            {restaurant.category}
          </span>
        </div>
        
        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-2">{restaurant.address}</span>
          </p>
          
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="line-clamp-1">{restaurant.businessHours}</span>
          </p>
        </div>
        
        {restaurant.description && (
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {restaurant.description}
          </p>
        )}
        
        {restaurant.reviewCount && restaurant.reviewCount > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {restaurant.reviewCount}件のレビュー
            </span>
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              詳細を見る →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}