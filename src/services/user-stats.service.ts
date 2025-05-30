import { listDocs } from '@junobuild/core';
import { Review } from '@/types/review';
import { ReputationService } from './reputation.service';

export interface UserStats {
  totalReviews: number;
  averageRating: number;
  reputationScore: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  reviewsByCategory: Record<string, number>;
  recentReviews: Review[];
  authorWeight: number;
  trustLevel: 'beginner' | 'experienced' | 'trusted' | 'expert';
}

export class UserStatsService {
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      // ユーザーのレビューを取得
      let userReviews: Review[] = [];
      
      try {
        const reviewsResult = await listDocs({
          collection: 'reviews',
          filter: {
            order: {
              desc: true,
              field: 'updated_at',
            },
          },
        });

        userReviews = reviewsResult.items
          .map(item => ({
            id: item.key,
            ...JSON.parse(item.data as string),
          } as Review))
          .filter(review => review.authorId === userId);
      } catch {
        console.warn('Reviews collection not found, using empty array');
        userReviews = [];
      }

      // レピュテーション情報を取得
      const reputation = await ReputationService.getUserReputation(userId);
      const reputationScore = reputation?.reputationScore || 1.0;

      // 統計計算
      const totalReviews = userReviews.length;
      const averageRating = totalReviews > 0 
        ? Number((userReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2))
        : 0;

      // カテゴリー別レビュー数
      const reviewsByCategory: Record<string, number> = {};
      
      // レストラン情報を取得してカテゴリーを集計
      try {
        const restaurantResult = await listDocs({
          collection: 'restaurants',
          filter: {
            order: {
              desc: true,
              field: 'updated_at',
            },
          },
        });

        for (const review of userReviews) {
          const restaurant = restaurantResult.items.find(item => item.key === review.restaurantId);
          if (restaurant) {
            const restaurantData = JSON.parse(restaurant.data as string);
            if (restaurantData.category) {
              const category = restaurantData.category as string;
              reviewsByCategory[category] = (reviewsByCategory[category] || 0) + 1;
            }
          }
        }
      } catch {
        console.warn('Restaurants collection not found, skipping category analysis');
      }

      // 最近のレビュー（最新5件）
      const recentReviews = userReviews.slice(0, 5);

      // 著者重み（レピュテーションベース）
      const authorWeight = 0.5 + reputationScore * 0.2;

      // 信頼レベルの判定
      let trustLevel: UserStats['trustLevel'] = 'beginner';
      if (reputationScore >= 2.0 && totalReviews >= 20) {
        trustLevel = 'expert';
      } else if (reputationScore >= 1.5 && totalReviews >= 10) {
        trustLevel = 'trusted';
      } else if (reputationScore >= 1.2 && totalReviews >= 5) {
        trustLevel = 'experienced';
      }

      return {
        totalReviews,
        averageRating,
        reputationScore,
        helpfulVotes: reputation?.totalHelpfulVotes || 0,
        notHelpfulVotes: reputation?.totalNotHelpfulVotes || 0,
        reviewsByCategory,
        recentReviews,
        authorWeight,
        trustLevel,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  static getTrustLevelLabel(trustLevel: UserStats['trustLevel']): string {
    const labels = {
      beginner: '初心者レビュアー',
      experienced: '経験者レビュアー',
      trusted: '信頼できるレビュアー',
      expert: 'エキスパートレビュアー',
    };
    return labels[trustLevel];
  }

  static getTrustLevelColor(trustLevel: UserStats['trustLevel']): string {
    const colors = {
      beginner: 'from-gray-100 to-gray-200 text-gray-700',
      experienced: 'from-blue-100 to-blue-200 text-blue-700',
      trusted: 'from-purple-100 to-purple-200 text-purple-700',
      expert: 'from-gold-100 to-gold-200 text-gold-700',
    };
    return colors[trustLevel];
  }
}