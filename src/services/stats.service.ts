import { setDoc, getDoc, listDocs } from '@junobuild/core';
import { RestaurantStats, RestaurantDailyStats } from '@/types/review';
import { ReviewService } from './review.service';
import { ReputationService } from './reputation.service';

const STATS_DAILY_COLLECTION = 'stats_restaurant_daily';
const STATS_ROLLING_COLLECTION = 'stats_restaurant_rolling';

export class StatsService {
  static async updateDailyStats(restaurantId: string, date: string): Promise<RestaurantDailyStats> {
    const key = `${restaurantId}_${date}`;
    
    // 当日のレビューを取得
    const reviews = await ReviewService.getRestaurantReviews(restaurantId);
    const todayReviews = reviews.filter(review => {
      const reviewDate = new Date(review.createdAt).toISOString().split('T')[0];
      return reviewDate === date;
    });
    
    const reviewCount = todayReviews.length;
    const totalRating = todayReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    const stats: RestaurantDailyStats = {
      restaurantId,
      date,
      reviewCount,
      totalRating,
      averageRating
    };
    
    await setDoc({
      collection: STATS_DAILY_COLLECTION,
      doc: {
        key,
        data: JSON.stringify(stats)
      }
    });
    
    return stats;
  }
  
  static async calculateRollingStats(restaurantId: string): Promise<RestaurantStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // 全レビューを取得
    const allReviews = await ReviewService.getRestaurantReviews(restaurantId);
    
    // 30日以内のレビューをフィルタ
    const recentReviews = allReviews.filter(review => 
      new Date(review.createdAt) >= thirtyDaysAgo
    );
    
    // 90日以内のレビューをフィルタ
    const reviews90d = allReviews.filter(review => 
      new Date(review.createdAt) >= ninetyDaysAgo
    );
    
    // 90日平均評価の計算
    const averageRating90d = reviews90d.length > 0
      ? reviews90d.reduce((sum, r) => sum + r.rating, 0) / reviews90d.length
      : 0;
    
    // 重み付き平均の計算
    let weightedSum = 0;
    let weightSum = 0;
    
    for (const review of allReviews) {
      const authorWeight = await ReputationService.getAuthorWeight(review.authorId);
      weightedSum += review.rating * authorWeight;
      weightSum += authorWeight;
    }
    
    const weightedAverageRating = weightSum > 0 ? weightedSum / weightSum : 0;
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;
    
    const stats: RestaurantStats = {
      restaurantId,
      totalReviews: allReviews.length,
      averageRating: Number(averageRating.toFixed(2)),
      weightedAverageRating: Number(weightedAverageRating.toFixed(2)),
      reviewCount30d: recentReviews.length,
      averageRating90d: Number(averageRating90d.toFixed(2)),
      lastUpdated: new Date()
    };
    
    await setDoc({
      collection: STATS_ROLLING_COLLECTION,
      doc: {
        key: restaurantId,
        data: JSON.stringify(stats)
      }
    });
    
    return stats;
  }
  
  static async getRestaurantStats(restaurantId: string): Promise<RestaurantStats | null> {
    try {
      const doc = await getDoc({
        collection: STATS_ROLLING_COLLECTION,
        key: restaurantId
      });
      
      if (!doc) {
        // 統計がない場合は空の統計を返す（レビューがまだない状態）
        return null;
      }
      
      return JSON.parse(doc.data as string);
    } catch (error) {
      // コレクションが存在しない場合は無視
      console.warn('Restaurant stats collection not found, returning null');
      return null;
    }
  }
  
  static async getDailyStats(restaurantId: string, date: string): Promise<RestaurantDailyStats | null> {
    const key = `${restaurantId}_${date}`;
    
    try {
      const doc = await getDoc({
        collection: STATS_DAILY_COLLECTION,
        key
      });
      
      if (!doc) {
        return null;
      }
      
      return JSON.parse(doc.data as string);
    } catch (error) {
      // コレクションが存在しない場合は無視
      console.warn('Daily stats collection not found, returning null');
      return null;
    }
  }
  
  static async getTopRatedRestaurants(limit: number = 10): Promise<RestaurantStats[]> {
    try {
      const result = await listDocs({
        collection: STATS_ROLLING_COLLECTION,
        filter: {
          paginate: {
            limit: 1000
          }
        }
      });
      
      if (!result || !result.items) {
        return [];
      }
      
      const stats = result.items
        .map((doc) => JSON.parse(doc.data as string))
        .filter((stat: RestaurantStats) => stat.totalReviews >= 3) // 最低3件のレビューが必要
        .sort((a: RestaurantStats, b: RestaurantStats) => b.weightedAverageRating - a.weightedAverageRating)
        .slice(0, limit);
      
      return stats;
    } catch (error) {
      // コレクションが存在しない場合は空配列を返す
      console.warn('Restaurant stats collection not found, returning empty array');
      return [];
    }
  }
}