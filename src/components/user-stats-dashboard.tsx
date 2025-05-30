'use client';

import { UserStats } from '@/services/user-stats.service';
import { StarRating } from './star-rating';

interface UserStatsDashboardProps {
  userStats: UserStats;
  userName: string;
  tokenBalance?: number;
  principalId?: string;
}

export function UserStatsDashboard({ userStats, userName, tokenBalance = 0, principalId }: UserStatsDashboardProps) {
  const trustLevelColors = {
    beginner: 'from-gray-100 to-gray-200 text-gray-700 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300',
    experienced: 'from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300',
    trusted: 'from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300',
    expert: 'from-yellow-100 to-yellow-200 text-yellow-700 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300',
  };

  const trustLevelLabels = {
    beginner: '初心者レビュアー',
    experienced: '経験者レビュアー',
    trusted: '信頼できるレビュアー',
    expert: 'エキスパートレビュアー',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ユーザー情報ヘッダー */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-all">{userName}</h1>
            <p className="text-gray-600 dark:text-gray-400">レビュアープロフィール</p>
            {principalId && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Principal ID:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs sm:text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
                    {principalId}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(principalId);
                      alert('Principal IDをコピーしました');
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="コピー"
                  >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${trustLevelColors[userStats.trustLevel]} flex-shrink-0`}>
            {trustLevelLabels[userStats.trustLevel]}
          </div>
        </div>

        {/* レピュテーションメーター */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">レピュテーションスコア</span>
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {userStats.reputationScore.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((userStats.reputationScore / 3) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1.0</span>
            <span>2.0</span>
            <span>3.0+</span>
          </div>
        </div>

        {/* 著者重み */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">投稿の重み付け係数</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {userStats.authorWeight.toFixed(2)}x
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              あなたのレビューは通常の{userStats.authorWeight.toFixed(1)}倍の重みで評価に反映されます
            </span>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 総レビュー数 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">総レビュー数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalReviews}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        {/* 平均評価 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均評価</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={userStats.averageRating} size="sm" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {userStats.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>

        {/* 役に立った票 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">役に立った票</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userStats.helpfulVotes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                役に立たなかった: {userStats.notHelpfulVotes}
              </p>
            </div>
            <div className="text-4xl">👍</div>
          </div>
        </div>

        {/* ERTトークン残高 */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">ERTトークン</p>
              <p className="text-3xl font-bold">{tokenBalance.toFixed(2)}</p>
              <p className="text-xs text-purple-200 mt-1">
                レビューにいいねされると獲得
              </p>
            </div>
            <div className="text-4xl">🪙</div>
          </div>
        </div>
      </div>

      {/* カテゴリー別投稿 */}
      {Object.keys(userStats.reviewsByCategory).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">カテゴリー別レビュー</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(userStats.reviewsByCategory).map(([category, count]) => (
              <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近のレビュー */}
      {userStats.recentReviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">最近のレビュー</h2>
          <div className="space-y-4">
            {userStats.recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}