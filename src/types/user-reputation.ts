// ユーザー評価・信頼度関連の型定義

export interface UserReputation {
  id?: string;
  userId: string; // 評価対象のユーザーID
  totalScore: number; // 総合信頼スコア（-100〜100）
  duplicateReports: number; // 重複レストラン追加の報告数
  verifiedReports: number; // 確認済みの違反数
  contributionScore: number; // 貢献スコア（有益なレビューや正確な情報提供）
  lastUpdated?: number;
}

export interface DuplicateReport {
  id?: string;
  reporterId: string; // 報告者のID
  reportedUserId: string; // 報告されたユーザーのID
  restaurantId: string; // 重複しているレストランのID
  originalRestaurantId: string; // 元のレストランのID
  reason: string; // 報告理由
  status: 'pending' | 'verified' | 'rejected'; // 報告のステータス
  createdAt?: number;
  reviewedAt?: number;
  reviewedBy?: string; // レビューした管理者のID
}

export interface UserVote {
  id?: string;
  voterId: string; // 投票者のID
  targetUserId: string; // 評価対象のユーザーID
  voteType: 'trust' | 'distrust'; // 信頼/不信任
  reason?: string; // 投票理由
  createdAt?: number;
}

// 信頼度レベル
export enum TrustLevel {
  VERY_LOW = 'very_low', // -100 〜 -50
  LOW = 'low', // -49 〜 -20
  NEUTRAL = 'neutral', // -19 〜 19
  HIGH = 'high', // 20 〜 49
  VERY_HIGH = 'very_high' // 50 〜 100
}

// 信頼度レベルを判定する関数
export function getTrustLevel(score: number): TrustLevel {
  if (score <= -50) return TrustLevel.VERY_LOW;
  if (score <= -20) return TrustLevel.LOW;
  if (score <= 19) return TrustLevel.NEUTRAL;
  if (score <= 49) return TrustLevel.HIGH;
  return TrustLevel.VERY_HIGH;
}

// 信頼度による制限
export interface TrustRestrictions {
  canAddRestaurant: boolean;
  canReview: boolean;
  reviewNeedsModeration: boolean;
  maxReviewsPerDay: number;
}