import { setDoc, getDoc, listDocs, deleteDoc } from '@junobuild/core';
import { Review } from '@/types/review';
import { nanoid } from 'nanoid';

const REVIEW_COLLECTION = 'reviews';

export class ReviewService {
  static async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const id = nanoid();
    const now = new Date();
    
    const newReview: Review = {
      ...review,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc({
      collection: REVIEW_COLLECTION,
      doc: {
        key: id,
        data: JSON.stringify(newReview)
      }
    });
    
    return newReview;
  }
  
  static async getReview(id: string): Promise<Review | null> {
    try {
      const doc = await getDoc({
        collection: REVIEW_COLLECTION,
        key: id
      });
      
      if (!doc) {
        return null;
      }
      
      return {
        ...JSON.parse(doc.data as string),
        id: doc.key
      };
    } catch (error) {
      console.error('Failed to get review:', error);
      return null;
    }
  }
  
  static async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    try {
      const result = await listDocs({
        collection: REVIEW_COLLECTION,
        filter: {
          paginate: {
            limit: 1000
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
        .filter((review: Review) => review.restaurantId === restaurantId)
        .sort((a: Review, b: Review) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
      console.warn('Reviews collection not found, returning empty array');
      return [];
    }
  }
  
  static async getUserReviews(authorId: string): Promise<Review[]> {
    try {
      const result = await listDocs({
        collection: REVIEW_COLLECTION,
        filter: {
          paginate: {
            limit: 1000
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
        .filter((review: Review) => review.authorId === authorId)
        .sort((a: Review, b: Review) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
      console.warn('Reviews collection not found, returning empty array');
      return [];
    }
  }
  
  static async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const existingReview = await this.getReview(id);
    
    if (!existingReview) {
      throw new Error('Review not found');
    }
    
    const updatedReview: Review = {
      ...existingReview,
      ...updates,
      id: existingReview.id,
      createdAt: existingReview.createdAt,
      updatedAt: new Date()
    };
    
    await setDoc({
      collection: REVIEW_COLLECTION,
      doc: {
        key: id,
        data: JSON.stringify(updatedReview)
      }
    });
    
    return updatedReview;
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
  }
  
  static async getRecentReviews(limit: number = 10): Promise<Review[]> {
    const result = await listDocs({
      collection: REVIEW_COLLECTION,
      filter: {
        paginate: {
          limit
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
      .sort((a: Review, b: Review) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}