// Note: cronJob/serverlessFunction is not available in @junobuild/core
// This file is kept as a placeholder for future implementation
// when Juno provides serverless function APIs

import { listDocs, setDoc, getDoc } from '@junobuild/core';
import type { RestaurantStats, RestaurantDailyStats } from '../types/review';

// This function would be called by a cron job in the future
export async function updateDailyStats() {
  console.log('Starting daily stats update...');
  
  try {
    // 全レストランを取得
    const restaurantsResult = await listDocs({
      collection: 'restaurants',
      filter: { paginate: { limit: 1000 } }
    });
    
    if (!restaurantsResult || !restaurantsResult.items) {
      console.log('No restaurants found');
      return;
    }
    
    const restaurants = restaurantsResult.items.map((doc) => ({
      ...JSON.parse(doc.data as string),
      id: doc.key
    }));
    
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 各レストランの統計を更新
    for (const restaurant of restaurants) {
      await updateRestaurantStats(restaurant.id, today, thirtyDaysAgo);
    }
    
    console.log('Daily stats update completed');
  } catch (error) {
    console.error('Failed to update daily stats:', error);
  }
}

async function updateRestaurantStats(restaurantId: string, today: string, thirtyDaysAgo: Date) {
  try {
    // 全レビューを取得
    const reviewsResult = await listDocs({
      collection: 'reviews',
      filter: { paginate: { limit: 10000 } }
    });
    
    if (!reviewsResult || !reviewsResult.items) {
      return;
    }
    
    const reviews = reviewsResult.items
      .map((doc) => ({
        ...JSON.parse(doc.data as string),
        id: doc.key
      }))
      .filter((review) => review.restaurantId === restaurantId);
    
    // 今日のレビューを集計
    const todayReviews = reviews.filter((review) => {
      const reviewDate = new Date(review.createdAt).toISOString().split('T')[0];
      return reviewDate === today;
    });
    
    // 日次統計を保存
    if (todayReviews.length > 0) {
      const dailyStats: RestaurantDailyStats = {
        restaurantId,
        date: today,
        reviewCount: todayReviews.length,
        totalRating: todayReviews.reduce((sum, r) => sum + r.rating, 0),
        averageRating: todayReviews.reduce((sum, r) => sum + r.rating, 0) / todayReviews.length
      };
      
      await setDoc({
        collection: 'stats_restaurant_daily',
        doc: {
          key: `${restaurantId}_${today}`,
          data: JSON.stringify(dailyStats)
        }
      });
    }
    
    // 30日間のローリング統計を計算
    const recentReviews = reviews.filter((review) => 
      new Date(review.createdAt) >= thirtyDaysAgo
    );
    
    // レピュテーション加重平均を計算
    let weightedSum = 0;
    let weightSum = 0;
    
    for (const review of reviews) {
      const authorWeight = await getAuthorWeight(review.authorId);
      weightedSum += review.rating * authorWeight;
      weightSum += authorWeight;
    }
    
    const stats: RestaurantStats = {
      restaurantId,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2))
        : 0,
      weightedAverageRating: weightSum > 0 
        ? Number((weightedSum / weightSum).toFixed(2))
        : 0,
      reviewCount30d: recentReviews.length,
      averageRating90d: recentReviews.length > 0 
        ? Number((recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length).toFixed(2))
        : 0,
      lastUpdated: new Date()
    };
    
    await setDoc({
      collection: 'stats_restaurant_rolling',
      doc: {
        key: restaurantId,
        data: JSON.stringify(stats)
      }
    });
  } catch (error) {
    console.error(`Failed to update stats for restaurant ${restaurantId}:`, error);
  }
}

async function getAuthorWeight(authorId: string): Promise<number> {
  try {
    const doc = await getDoc({
      collection: 'user_reputation',
      key: authorId
    });
    
    if (!doc) {
      return 1.0;
    }
    
    const reputation = JSON.parse(doc.data as string);
    const weight = 0.5 + reputation.reputationScore * 0.2;
    
    return Math.max(0.5, Math.min(2.0, weight));
  } catch (error) {
    console.error(`Failed to get author weight for ${authorId}:`, error);
    return 1.0;
  }
}