'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/types/review';
import { ReviewVoteService } from '@/services/review-vote.service';
import { ReputationService } from '@/services/reputation.service';
import { TokenService } from '@/services/token.service';
import { StarRating } from './star-rating';

interface ReviewItemProps {
  review: Review;
  currentUserId: string;
  onVote: () => void;
}

export function ReviewItem({ review, currentUserId, onVote }: ReviewItemProps) {
  const [votes, setVotes] = useState({ helpful: 0, notHelpful: 0 });
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(null);
  const [authorReputation, setAuthorReputation] = useState<number>(1.0);
  const [loading, setLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  
  useEffect(() => {
    loadVotesAndReputation();
    loadLikeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review.id, currentUserId]);
  
  const loadVotesAndReputation = async () => {
    try {
      // 投票数を取得
      const voteCounts = await ReviewVoteService.getVotesForReview(review.id);
      setVotes(voteCounts);
      
      // ユーザーの投票状態を取得
      const userVoteData = await ReviewVoteService.getUserVoteForReview(review.id, currentUserId);
      setUserVote(userVoteData?.voteType || null);
      
      // 著者のレピュテーションを取得
      const reputation = await ReputationService.getUserReputation(review.authorId);
      if (reputation) {
        setAuthorReputation(reputation.reputationScore);
      }
    } catch (error) {
      console.error('Failed to load votes and reputation:', error);
    }
  };
  
  const loadLikeData = async () => {
    try {
      // Canisterから現在のいいね数とユーザーの状態を取得
      const likeCount = await TokenService.getReviewLikes(review.id);
      const hasUserLiked = await TokenService.hasUserLikedReview(review.id, currentUserId);
      setLikeCount(likeCount);
      setHasLiked(hasUserLiked);
    } catch (error) {
      console.error('Failed to load like data:', error);
    }
  };

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (userVote === voteType) {
        // 同じ投票タイプの場合は投票を取り消す
        await ReviewVoteService.removeVote(review.id, currentUserId);
        setUserVote(null);
      } else {
        // 新規投票または投票タイプの変更
        await ReviewVoteService.vote(review.id, currentUserId, voteType);
        setUserVote(voteType);
        
        // レピュテーションを更新
        if (userVote === null) {
          // 新規投票の場合のみレピュテーションを更新
          await ReputationService.incrementVotes(
            review.authorId,
            voteType,
            1
          );
        }
      }
      
      // 投票数を再取得
      const voteCounts = await ReviewVoteService.getVotesForReview(review.id);
      setVotes(voteCounts);
      
      onVote();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (loading || hasLiked) return;
    
    setLoading(true);
    try {
      // Canisterのlike_review関数を呼び出し
      const result = await TokenService.likeReview(review.id, currentUserId);
      
      if (result.success) {
        // ローカル状態を更新
        setHasLiked(true);
        setLikeCount(prev => prev + 1);
        onVote();
      } else {
        console.error('Failed to like review:', result.message);
        // 既にいいねしている場合のエラーハンドリング
        if (result.message.includes('Already liked')) {
          setHasLiked(true);
        }
      }
    } catch (error) {
      console.error('Failed to like review:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {review.authorName}
            </h4>
            {authorReputation > 1.2 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                信頼できるレビュアー
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      </div>
      
      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {review.comment}
        </p>
      )}
      
      {/* 詳細評価 */}
      {(review.tasteRating || review.atmosphereRating || review.serviceRating || 
        review.valuePriceRating || review.cleanlinessRating) && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">詳細評価</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {review.tasteRating && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">味:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.tasteRating! ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
            {review.atmosphereRating && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">雰囲気:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.atmosphereRating! ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
            {review.serviceRating && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">サービス:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.serviceRating! ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
            {review.valuePriceRating && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">コスパ:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.valuePriceRating! ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
            {review.cleanlinessRating && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600 dark:text-gray-400">清潔さ:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.cleanlinessRating! ? 'text-yellow-400 text-xs' : 'text-gray-300 text-xs'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* レビュー画像 */}
      {review.photoUrls && review.photoUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {review.photoUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`レビュー画像 ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(url, '_blank')}
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => handleVote('helpful')}
          disabled={loading}
          className={`flex items-center gap-1 transition-colors ${
            userVote === 'helpful'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          役に立った ({votes.helpful})
        </button>
        <button
          onClick={() => handleVote('not_helpful')}
          disabled={loading}
          className={`flex items-center gap-1 transition-colors ${
            userVote === 'not_helpful'
              ? 'text-gray-700 dark:text-gray-200'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
          役に立たなかった ({votes.notHelpful})
        </button>
        <button
          onClick={handleLike}
          disabled={loading || hasLiked}
          className={`flex items-center gap-1 transition-colors ${
            hasLiked
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          いいね ({likeCount})
        </button>
      </div>
    </div>
  );
}