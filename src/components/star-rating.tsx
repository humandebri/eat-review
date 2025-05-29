interface StarRatingProps {
  rating: number; // 0-5
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export function StarRating({ rating, size = 'md', showNumber = false }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className={`${sizeClasses[size]} text-yellow-400`} style={{ color: '#fbbf24' }}>
            ★
          </span>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <span className={`${sizeClasses[size]} relative`}>
            <span className="text-gray-300" style={{ color: '#d1d5db' }}>☆</span>
            <span className="absolute inset-0 text-yellow-400 overflow-hidden" style={{ width: '50%', color: '#fbbf24' }}>
              ★
            </span>
          </span>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} style={{ color: '#d1d5db' }}>
            ☆
          </span>
        ))}
      </div>
      
      {showNumber && (
        <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}