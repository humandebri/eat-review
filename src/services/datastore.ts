import { setDoc, getDoc, listDocs, deleteDoc } from '@junobuild/core';
import type { Restaurant, Review, User } from '@/types/restaurant';
import { StatsService } from './stats.service';

const RESTAURANT_COLLECTION = 'restaurants';
const REVIEW_COLLECTION = 'reviews';
const USER_COLLECTION = 'users';

export class DatastoreService {
  // レストラン関連の操作
  static async createRestaurant(restaurant: Restaurant): Promise<Restaurant> {
    const timestamp = Date.now();
    const data = {
      ...restaurant,
      createdAt: timestamp,
      updatedAt: timestamp,
      reviewCount: 0,
      averageRating: 0
    };
    
    const doc = await setDoc({
      collection: RESTAURANT_COLLECTION,
      doc: {
        key: crypto.randomUUID(),
        data: JSON.stringify(data)
      }
    });
    
    return { ...data, id: doc.key };
  }

  static async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const doc = await getDoc({
        collection: RESTAURANT_COLLECTION,
        key: id
      });
      
      if (!doc) return null;
      
      return {
        ...JSON.parse(doc.data as string),
        id: doc.key
      };
    } catch (error) {
      console.warn('Restaurant collection not found or error occurred');
      return null;
    }
  }

  static async listRestaurants(): Promise<Restaurant[]> {
    try {
      const result = await listDocs({
        collection: RESTAURANT_COLLECTION,
        filter: {
          order: {
            desc: true,
            field: 'updated_at'
          }
        }
      });
      
      // itemsがない場合は空配列を返す
      if (!result || !result.items) {
        return [];
      }
      
      // items は直接オブジェクトの配列
      const restaurants = result.items.map((doc) => ({
        ...JSON.parse(doc.data as string),
        id: doc.key
      }));
      
      // 統計情報を追加
      const restaurantsWithStats = await Promise.all(
        restaurants.map(async (restaurant) => {
          const stats = await StatsService.getRestaurantStats(restaurant.id);
          if (stats) {
            return {
              ...restaurant,
              reviewCount: stats.totalReviews,
              averageRating: stats.weightedAverageRating
            };
          }
          return restaurant;
        })
      );
      
      return restaurantsWithStats;
    } catch (error) {
      // コレクションが存在しない場合は空配列を返す
      if (error instanceof Error && error.message?.includes('not found')) {
        return [];
      }
      throw error;
    }
  }

  static async updateRestaurant(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant> {
    const existing = await this.getRestaurant(id);
    if (!existing) throw new Error('Restaurant not found');
    
    const updated = {
      ...existing,
      ...restaurant,
      updatedAt: Date.now()
    };
    
    await setDoc({
      collection: RESTAURANT_COLLECTION,
      doc: {
        key: id,
        data: JSON.stringify(updated)
      }
    });
    
    return updated;
  }

  // レビュー関連の操作
  static async createReview(review: Review): Promise<Review> {
    const timestamp = Date.now();
    const data = {
      ...review,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const doc = await setDoc({
      collection: REVIEW_COLLECTION,
      doc: {
        key: crypto.randomUUID(),
        data: JSON.stringify(data)
      }
    });
    
    // レストランの評価を更新
    await this.updateRestaurantRating(review.restaurantId);
    
    return { ...data, id: doc.key };
  }

  static async getReviewsByRestaurant(restaurantId: string): Promise<Review[]> {
    try {
      const result = await listDocs({
        collection: REVIEW_COLLECTION,
        filter: {
          order: {
            desc: true,
            field: 'created_at'
          }
        }
      });
      
      if (!result || !result.items) {
        return [];
      }
      
      return result.items
        .map((doc) => ({
          ...JSON.parse(doc.data as string),
          id: doc.key
        }))
        .filter((review) => review.restaurantId === restaurantId);
    } catch (error) {
      console.warn('Reviews collection not found, returning empty array');
      return [];
    }
  }

  static async deleteReview(id: string): Promise<void> {
    const review = await this.getReview(id);
    if (!review) throw new Error('Review not found');
    
    await deleteDoc({
      collection: REVIEW_COLLECTION,
      doc: {
        key: id,
        data: ''
      }
    });
    
    // レストランの評価を更新
    await this.updateRestaurantRating(review.restaurantId);
  }

  private static async getReview(id: string): Promise<Review | null> {
    try {
      const doc = await getDoc({
        collection: REVIEW_COLLECTION,
        key: id
      });
      
      if (!doc) return null;
      
      return {
        ...JSON.parse(doc.data as string),
        id: doc.key
      };
    } catch (error) {
      console.warn('Review collection not found or error occurred');
      return null;
    }
  }

  private static async updateRestaurantRating(restaurantId: string): Promise<void> {
    const reviews = await this.getReviewsByRestaurant(restaurantId);
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
    
    await this.updateRestaurant(restaurantId, {
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10
    });
  }

  // ユーザー関連の操作
  static async createOrUpdateUser(user: User): Promise<User> {
    const timestamp = Date.now();
    const data = {
      ...user,
      updatedAt: timestamp,
      createdAt: user.createdAt || timestamp
    };
    
    const doc = await setDoc({
      collection: USER_COLLECTION,
      doc: {
        key: user.id || crypto.randomUUID(),
        data: JSON.stringify(data)
      }
    });
    
    return { ...data, id: doc.key };
  }

  static async getUser(id: string): Promise<User | null> {
    const doc = await getDoc({
      collection: USER_COLLECTION,
      key: id
    });
    
    if (!doc) return null;
    
    return {
      ...JSON.parse(doc.data as string),
      id: doc.key
    };
  }

  // ユーザーのレビューを取得
  static async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const result = await listDocs({
        collection: REVIEW_COLLECTION,
        filter: {
          order: {
            desc: true,
            field: 'created_at'
          }
        }
      });
      
      if (!result || !result.items) {
        return [];
      }
      
      // Filter reviews by userId
      const userReviews = result.items
        .map((doc) => ({
          ...JSON.parse(doc.data as string),
          id: doc.key
        }))
        .filter((review) => review.userId === userId);
      
      return userReviews;
    } catch (error) {
      console.error('Failed to get user reviews:', error);
      return [];
    }
  }
}