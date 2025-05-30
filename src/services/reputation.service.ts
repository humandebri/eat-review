import { setDoc, getDoc, listDocs } from '@junobuild/core';
import { UserReputation } from '@/types/review';

const USER_REPUTATION_COLLECTION = 'user_reputation';

export class ReputationService {
  static async calculateReputationScore(helpfulVotes: number, notHelpfulVotes: number): Promise<number> {
    // レピュテーションスコア計算式
    // rep = log10(1 + up) - log10(1 + down) を 0.5–1.5 に正規化
    const rawScore = Math.log10(1 + helpfulVotes) - Math.log10(1 + notHelpfulVotes);
    
    // -2 to 2 の範囲を 0.5 to 1.5 にマッピング
    const normalizedScore = Math.max(0.5, Math.min(1.5, (rawScore + 2) / 4 + 0.5));
    
    return Number(normalizedScore.toFixed(2));
  }
  
  static async getUserReputation(userId: string): Promise<UserReputation | null> {
    try {
      const doc = await getDoc({
        collection: USER_REPUTATION_COLLECTION,
        key: userId
      });
      
      if (!doc) {
        // 新規ユーザーのデフォルトレピュテーション
        return {
          userId,
          totalHelpfulVotes: 0,
          totalNotHelpfulVotes: 0,
          reputationScore: 1.0,
          lastUpdated: new Date()
        };
      }
      
      return JSON.parse(doc.data as string);
    } catch (error) {
      // コレクションが存在しない場合はデフォルト値を返す
      console.warn('User reputation collection not found, returning default values');
      return {
        userId,
        totalHelpfulVotes: 0,
        totalNotHelpfulVotes: 0,
        reputationScore: 1.0,
        lastUpdated: new Date()
      };
    }
  }
  
  static async updateUserReputation(
    userId: string, 
    helpfulVotes: number, 
    notHelpfulVotes: number
  ): Promise<UserReputation> {
    const reputationScore = await this.calculateReputationScore(helpfulVotes, notHelpfulVotes);
    
    const reputation: UserReputation = {
      userId,
      totalHelpfulVotes: helpfulVotes,
      totalNotHelpfulVotes: notHelpfulVotes,
      reputationScore,
      lastUpdated: new Date()
    };
    
    await setDoc({
      collection: USER_REPUTATION_COLLECTION,
      doc: {
        key: userId,
        data: JSON.stringify(reputation)
      }
    });
    
    return reputation;
  }
  
  static async incrementVotes(
    userId: string, 
    voteType: 'helpful' | 'not_helpful', 
    increment: number = 1
  ): Promise<UserReputation> {
    const currentRep = await this.getUserReputation(userId);
    
    if (!currentRep) {
      throw new Error('User reputation not found');
    }
    
    const newHelpfulVotes = voteType === 'helpful' 
      ? currentRep.totalHelpfulVotes + increment 
      : currentRep.totalHelpfulVotes;
      
    const newNotHelpfulVotes = voteType === 'not_helpful' 
      ? currentRep.totalNotHelpfulVotes + increment 
      : currentRep.totalNotHelpfulVotes;
    
    return await this.updateUserReputation(userId, newHelpfulVotes, newNotHelpfulVotes);
  }
  
  static async getAuthorWeight(authorId: string): Promise<number> {
    const reputation = await this.getUserReputation(authorId);
    
    if (!reputation) {
      return 1.0; // デフォルトの重み
    }
    
    // 重み付け計算: 0.5 + repScore * 0.2
    // reputationScore (0.5-1.5) → weight (0.6-1.8)
    const weight = 0.5 + reputation.reputationScore * 0.2;
    
    return Math.max(0.5, Math.min(2.0, weight));
  }
  
  static async getTopContributors(limit: number = 10): Promise<UserReputation[]> {
    try {
      const result = await listDocs({
        collection: USER_REPUTATION_COLLECTION,
        filter: {
          paginate: {
            limit: 1000
          }
        }
      });
      
      if (!result || !result.items) {
        return [];
      }
      
      const reputations = result.items
        .map((doc) => JSON.parse(doc.data as string))
        .sort((a: UserReputation, b: UserReputation) => b.reputationScore - a.reputationScore)
        .slice(0, limit);
      
      return reputations;
    } catch (error) {
      console.warn('User reputation collection not found, returning empty array');
      return [];
    }
  }
}