export interface User {
  id: string; // Principal ID
  name: string;
  email?: string;
  avatarUrl?: string;
  joinedAt: Date;
  isVerified: boolean;
  totalReviews: number;
  reputation: UserReputation;
}

export interface UserReputation {
  score: number; // 0.5 - 1.5
  totalHelpfulVotes: number;
  totalNotHelpfulVotes: number;
  level: 'beginner' | 'contributor' | 'expert' | 'master';
}

export interface AuthSession {
  userId: string;
  principal: string;
  expiresAt: Date;
}