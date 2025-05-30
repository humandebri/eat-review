'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';
import { Review } from '@/types/review';
import { RestaurantStats } from '@/types/review';
import { DatastoreService } from '@/services/datastore';
import { ReviewService } from '@/services/review.service';
import { StatsService } from '@/services/stats.service';
import { ReviewItem } from '@/components/review-item';
import { StarRating } from '@/components/star-rating';
import { GoogleMap } from '@/components/google-map';
import { useAuth } from '@/contexts/auth-context';
import { ImageUpload } from '@/components/image-upload';
import { UserService } from '@/services/user.service';

function RestaurantDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isInitialized } = useAuth();
  const restaurantId = searchParams.get('id');
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAddPhotos, setShowAddPhotos] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    atmosphereRating: undefined as number | undefined,
    tasteRating: undefined as number | undefined,
    serviceRating: undefined as number | undefined,
    valuePriceRating: undefined as number | undefined,
    cleanlinessRating: undefined as number | undefined,
    imageUrls: [] as string[]
  });
  
  
  useEffect(() => {
    if (!restaurantId) {
      router.push('/');
      return;
    }
    
    // Juno初期化後にデータを読み込む
    if (isInitialized) {
      loadRestaurantData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, isInitialized]);
  
  const loadRestaurantData = async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      const [restaurantData, reviewsData, statsData] = await Promise.all([
        DatastoreService.getRestaurant(restaurantId),
        ReviewService.getRestaurantReviews(restaurantId),
        StatsService.getRestaurantStats(restaurantId)
      ]);
      
      setRestaurant(restaurantData);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantId) {
      alert('レストラン情報が取得できませんでした');
      return;
    }
    
    if (!user) {
      alert('レビューを投稿するにはログインが必要です');
      return;
    }
    
    if (newReview.rating === 0) {
      alert('総合評価を選択してください');
      return;
    }
    
    try {
      // ユーザーの表示名を取得
      const displayName = await UserService.getDisplayName(user.key);
      
      await ReviewService.createReview({
        restaurantId,
        rating: newReview.rating,
        comment: newReview.comment.trim() || undefined,
        authorId: user.key,
        authorName: displayName,
        atmosphereRating: newReview.atmosphereRating,
        tasteRating: newReview.tasteRating,
        serviceRating: newReview.serviceRating,
        valuePriceRating: newReview.valuePriceRating,
        cleanlinessRating: newReview.cleanlinessRating,
        photoUrls: newReview.imageUrls
      });
      
      // 統計情報を更新
      await StatsService.calculateRollingStats(restaurantId);
      
      // リロード
      await loadRestaurantData();
      
      // フォームをリセット
      setNewReview({
        rating: 0,
        comment: '',
        atmosphereRating: undefined,
        tasteRating: undefined,
        serviceRating: undefined,
        valuePriceRating: undefined,
        cleanlinessRating: undefined,
        imageUrls: []
      });
      setShowReviewForm(false);
      
      alert('レビューを投稿しました！');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('レビューの投稿に失敗しました');
    }
  };
  
  const handleAddPhotos = async (imageUrls: string[]) => {
    if (!restaurantId || !restaurant) return;
    
    try {
      setUploadingPhotos(true);
      
      // 既存の画像URLと新しい画像URLを結合
      const updatedImageUrls = [...(restaurant.imageUrls || []), ...imageUrls];
      
      // レストラン情報を更新
      await DatastoreService.updateRestaurant(restaurantId, {
        ...restaurant,
        imageUrls: updatedImageUrls
      });
      
      // データを再読み込み
      await loadRestaurantData();
      
      setShowAddPhotos(false);
      alert('写真を追加しました！');
    } catch (error) {
      console.error('Failed to add photos:', error);
      alert('写真の追加に失敗しました');
    } finally {
      setUploadingPhotos(false);
    }
  };
  
  if (!restaurantId) {
    return <div>レストランが見つかりません</div>;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">レストランが見つかりません</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* 戻るボタン */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </button>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* レストラン情報 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* レストランの画像表示 */}
              {(restaurant.imageUrls && restaurant.imageUrls.length > 0) ? (
                <div className="relative">
                  <img
                    src={restaurant.imageUrls[0]}
                    alt={restaurant.name}
                    className="w-full h-64 object-cover"
                  />
                  {restaurant.imageUrls.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      +{restaurant.imageUrls.length - 1} 枚の写真
                    </div>
                  )}
                </div>
              ) : restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-64 object-cover"
                />
              ) : null}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                    <p className="text-gray-600">{restaurant.category} • {restaurant.address}</p>
                  </div>
                  {stats && (
                    <div className="text-center">
                      <StarRating rating={stats.averageRating} size="lg" showNumber={true} />
                      <div className="text-sm text-gray-500 mt-1">
                        {stats.totalReviews}件のレビュー
                      </div>
                      {stats.averageRating90d > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          90日平均: {stats.averageRating90d}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {restaurant.description && (
                  <p className="text-gray-700 mb-6">{restaurant.description}</p>
                )}
                
                {/* オーナー用の写真追加ボタン */}
                {user && restaurant.owner === user.key && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowAddPhotos(true)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      写真を追加
                    </button>
                  </div>
                )}
                
                {/* 追加者情報 */}
                {restaurant.owner && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          追加者: <span className="font-mono">{restaurant.owner.slice(0, 8)}...{restaurant.owner.slice(-4)}</span>
                        </span>
                      </div>
                      {user && user.key !== restaurant.owner && (
                        <button
                          onClick={() => {
                            if (confirm('このレストランが重複している場合、報告しますか？')) {
                              // TODO: 重複報告機能を実装
                              alert('報告機能は現在開発中です');
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700 hover:underline"
                        >
                          重複を報告
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {restaurant.phoneNumber && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {restaurant.phoneNumber}
                    </div>
                  )}
                  {restaurant.businessHours && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {restaurant.businessHours}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* レストラン写真ギャラリー */}
            {restaurant.imageUrls && restaurant.imageUrls.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  レストランの写真 ({restaurant.imageUrls.length}枚)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {restaurant.imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <img
                        src={url}
                        alt={`${restaurant.name}の写真 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* レビュー画像ギャラリー */}
            {(() => {
              const reviewImages = reviews
                .filter(review => review.photoUrls && review.photoUrls.length > 0)
                .sort((a, b) => b.rating - a.rating)
                .flatMap(review => 
                  (review.photoUrls || []).map(url => ({ 
                    url, 
                    rating: review.rating,
                    authorName: review.authorName,
                    createdAt: review.createdAt
                  }))
                );
              
              if (reviewImages.length > 0) {
                return (
                  <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      みんなの写真 ({reviewImages.length}枚)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {reviewImages.slice(0, 8).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <img
                            src={image.url}
                            alt={`${restaurant.name}の写真 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-yellow-400">★</span>
                                <span>{image.rating.toFixed(1)}</span>
                              </div>
                              <p className="truncate">{image.authorName}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {reviewImages.length > 8 && (
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">
                              +{reviewImages.length - 8}
                            </p>
                            <p className="text-sm text-gray-500">
                              枚の写真
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* レビュー一覧 */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">レビュー</h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
                >
                  レビューを書く
                </button>
              </div>
              
              {reviews.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">まだレビューがありません</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    最初のレビューを書く
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewItem
                      key={review.id}
                      review={review}
                      currentUserId={user?.key || ''}
                      onVote={async () => {
                        await loadRestaurantData();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
              
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">カテゴリー</p>
                  <p className="text-gray-900">{restaurant.category}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-500">住所</p>
                  <p className="text-gray-900">{restaurant.address}</p>
                </div>
                
                {restaurant.phoneNumber && (
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">電話番号</p>
                    <p className="text-gray-900">{restaurant.phoneNumber}</p>
                  </div>
                )}
                
                {restaurant.website && (
                  <div className="border-b pb-3">
                    <p className="text-sm text-gray-500">ウェブサイト</p>
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      公式サイト
                    </a>
                  </div>
                )}
                
                {restaurant.businessHours && (
                  <div>
                    <p className="text-sm text-gray-500">営業時間</p>
                    <p className="text-gray-900">{restaurant.businessHours}</p>
                  </div>
                )}
              </div>
              
              {/* Google Map */}
              {(restaurant.location || restaurant.address) && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">地図</h3>
                  <GoogleMap 
                    location={restaurant.location}
                    address={restaurant.address}
                    className="h-64 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* レビュー投稿フォーム（モーダル） */}
      {showReviewForm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowReviewForm(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">レビューを投稿</h2>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  総合評価 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setNewReview(prev => ({ ...prev, rating: star }));
                      }}
                      className={`text-3xl transition-colors cursor-pointer`}
                    >
                      <span 
                        className={star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                        style={{ color: star <= newReview.rating ? '#fbbf24' : undefined }}
                      >
                        {star <= newReview.rating ? '★' : '☆'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              
              {/* 詳細評価（オプション） */}
              <div className="mb-4 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">詳細評価（任意）</h3>
                
                {/* 味 */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">味</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, tasteRating: star }))}
                        className={`text-2xl transition-colors cursor-pointer`}
                      >
                        <span 
                          className={newReview.tasteRating && star <= newReview.tasteRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                          style={{ color: newReview.tasteRating && star <= newReview.tasteRating ? '#fbbf24' : undefined }}
                        >
                          {newReview.tasteRating && star <= newReview.tasteRating ? '★' : '☆'}
                        </span>
                      </button>
                    ))}
                    {newReview.tasteRating && (
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, tasteRating: undefined }))}
                        className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 雰囲気 */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">雰囲気</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, atmosphereRating: star }))}
                        className={`text-2xl transition-colors cursor-pointer`}
                      >
                        <span 
                          className={newReview.atmosphereRating && star <= newReview.atmosphereRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                          style={{ color: newReview.atmosphereRating && star <= newReview.atmosphereRating ? '#fbbf24' : undefined }}
                        >
                          {newReview.atmosphereRating && star <= newReview.atmosphereRating ? '★' : '☆'}
                        </span>
                      </button>
                    ))}
                    {newReview.atmosphereRating && (
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, atmosphereRating: undefined }))}
                        className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>
                
                {/* サービス */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">サービス</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, serviceRating: star }))}
                        className={`text-2xl transition-colors cursor-pointer`}
                      >
                        <span 
                          className={newReview.serviceRating && star <= newReview.serviceRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                          style={{ color: newReview.serviceRating && star <= newReview.serviceRating ? '#fbbf24' : undefined }}
                        >
                          {newReview.serviceRating && star <= newReview.serviceRating ? '★' : '☆'}
                        </span>
                      </button>
                    ))}
                    {newReview.serviceRating && (
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, serviceRating: undefined }))}
                        className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>
                
                {/* コストパフォーマンス */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">コストパフォーマンス</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, valuePriceRating: star }))}
                        className={`text-2xl transition-colors cursor-pointer`}
                      >
                        <span 
                          className={newReview.valuePriceRating && star <= newReview.valuePriceRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                          style={{ color: newReview.valuePriceRating && star <= newReview.valuePriceRating ? '#fbbf24' : undefined }}
                        >
                          {newReview.valuePriceRating && star <= newReview.valuePriceRating ? '★' : '☆'}
                        </span>
                      </button>
                    ))}
                    {newReview.valuePriceRating && (
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, valuePriceRating: undefined }))}
                        className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 清潔さ */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">清潔さ</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, cleanlinessRating: star }))}
                        className={`text-2xl transition-colors cursor-pointer`}
                      >
                        <span 
                          className={newReview.cleanlinessRating && star <= newReview.cleanlinessRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
                          style={{ color: newReview.cleanlinessRating && star <= newReview.cleanlinessRating ? '#fbbf24' : undefined }}
                        >
                          {newReview.cleanlinessRating && star <= newReview.cleanlinessRating ? '★' : '☆'}
                        </span>
                      </button>
                    ))}
                    {newReview.cleanlinessRating && (
                      <button
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, cleanlinessRating: undefined }))}
                        className="text-xs text-gray-500 hover:text-gray-700 ml-2"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コメント（任意）
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="料理の感想、雰囲気、サービスなどについて教えてください"
                />
              </div>
              
              {/* 画像アップロード */}
              <div className="mb-4">
                <ImageUpload
                  label="レビュー画像（任意）"
                  maxImages={3}
                  onImagesUploaded={(urls) => {
                    setNewReview(prev => ({ ...prev, imageUrls: urls }));
                  }}
                />
              </div>
              
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  投稿する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 写真追加フォーム（モーダル） */}
      {showAddPhotos && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddPhotos(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">レストランの写真を追加</h2>
              <button
                onClick={() => setShowAddPhotos(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                レストランの外観、内装、料理などの写真を追加できます
              </p>
              <ImageUpload
                label="写真を選択"
                maxImages={5}
                onImagesUploaded={handleAddPhotos}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddPhotos(false)}
                disabled={uploadingPhotos}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    }>
      <RestaurantDetailContent />
    </Suspense>
  );
}