export interface Review {
  id: string;
  restaurantId: string;
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  comment?: string;
  photoUrls?: string[];
  atmosphereRating?: number;
  tasteRating?: number;
  serviceRating?: number;
  valuePriceRating?: number;
  cleanlinessRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewVote {
  id: string;
  reviewId: string;
  voterId: string;
  voteType: 'helpful' | 'not_helpful';
  createdAt: Date;
}

export interface UserReputation {
  userId: string;
  totalHelpfulVotes: number;
  totalNotHelpfulVotes: number;
  reputationScore: number; // 0.5 - 1.5
  lastUpdated: Date;
}

export interface RestaurantStats {
  restaurantId: string;
  totalReviews: number;
  averageRating: number;
  weightedAverageRating: number; // レピュテーション加重平均
  reviewCount30d: number; // 直近30日のレビュー数
  lastUpdated: Date;
}

export interface RestaurantDailyStats {
  restaurantId: string;
  date: string; // YYYY-MM-DD
  reviewCount: number;
  totalRating: number;
  averageRating: number;
}