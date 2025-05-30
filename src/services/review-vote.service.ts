import { setDoc, listDocs, deleteDoc } from '@junobuild/core';
import { ReviewVote } from '@/types/review';
import { nanoid } from 'nanoid';

const REVIEW_VOTES_COLLECTION = 'review_votes';

export class ReviewVoteService {
  static async vote(reviewId: string, voterId: string, voteType: 'helpful' | 'not_helpful'): Promise<ReviewVote> {
    // 既存の投票を確認
    const existingVote = await this.getUserVoteForReview(reviewId, voterId);
    
    if (existingVote) {
      // 既存の投票を更新
      const updatedVote: ReviewVote = {
        ...existingVote,
        voteType,
        createdAt: existingVote.createdAt
      };
      
      await setDoc({
        collection: REVIEW_VOTES_COLLECTION,
        doc: {
          key: existingVote.id,
          data: JSON.stringify(updatedVote)
        }
      });
      
      return updatedVote;
    } else {
      // 新規投票を作成
      const id = nanoid();
      const newVote: ReviewVote = {
        id,
        reviewId,
        voterId,
        voteType,
        createdAt: new Date()
      };
      
      await setDoc({
        collection: REVIEW_VOTES_COLLECTION,
        doc: {
          key: id,
          data: JSON.stringify(newVote)
        }
      });
      
      return newVote;
    }
  }
  
  static async removeVote(reviewId: string, voterId: string): Promise<void> {
    const existingVote = await this.getUserVoteForReview(reviewId, voterId);
    
    if (existingVote) {
      await deleteDoc({
        collection: REVIEW_VOTES_COLLECTION,
        doc: {
          key: existingVote.id,
          data: ''
        }
      });
    }
  }
  
  static async getUserVoteForReview(reviewId: string, voterId: string): Promise<ReviewVote | null> {
    try {
      const result = await listDocs({
        collection: REVIEW_VOTES_COLLECTION,
        filter: {
          paginate: {
            limit: 1000
          }
        }
      });
      
      if (!result || !result.items) {
        return null;
      }
      
      const vote = result.items
        .map((doc) => ({
          ...JSON.parse(doc.data as string),
          id: doc.key
        }))
        .find((vote: ReviewVote) => vote.reviewId === reviewId && vote.voterId === voterId);
      
      return vote || null;
    } catch {
      console.warn('Review votes collection not found, returning null');
      return null;
    }
  }
  
  static async getVotesForReview(reviewId: string): Promise<{ helpful: number; notHelpful: number }> {
    try {
      const result = await listDocs({
        collection: REVIEW_VOTES_COLLECTION,
        filter: {
          paginate: {
            limit: 10000
          }
        }
      });
      
      if (!result || !result.items) {
        return { helpful: 0, notHelpful: 0 };
      }
      
      const votes = result.items
        .map((doc) => JSON.parse(doc.data as string))
        .filter((vote: ReviewVote) => vote.reviewId === reviewId);
      
      const helpful = votes.filter((vote: ReviewVote) => vote.voteType === 'helpful').length;
      const notHelpful = votes.filter((vote: ReviewVote) => vote.voteType === 'not_helpful').length;
      
      return { helpful, notHelpful };
    } catch {
      console.warn('Review votes collection not found, returning zero counts');
      return { helpful: 0, notHelpful: 0 };
    }
  }
  
  static async getVotesByUser(userId: string): Promise<ReviewVote[]> {
    try {
      const result = await listDocs({
        collection: REVIEW_VOTES_COLLECTION,
        filter: {
          paginate: {
            limit: 10000
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
        .filter((vote: ReviewVote) => vote.voterId === userId);
    } catch {
      console.warn('Review votes collection not found, returning empty array');
      return [];
    }
  }
}