'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { UserStatsService, UserStats } from '@/services/user-stats.service';
import { UserStatsDashboard } from '@/components/user-stats-dashboard';
import { TokenService } from '@/services/token.service';
import { UserService } from '@/services/user.service';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading, isInitialized } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews' | 'settings'>('dashboard');
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user && isInitialized) {
      const loadUserData = async () => {
        if (!user?.key) return;
        
        try {
          setLoading(true);
          
          // ユーザープロフィールを取得
          const profile = await UserService.getUserProfile(user.key);
          if (profile) {
            setDisplayName(profile.displayName);
          } else {
            setDisplayName(`User-${user.key.substring(0, 8)}`);
          }
          
          // 統計情報を取得
          const stats = await UserStatsService.getUserStats(user.key);
          setUserStats(stats);
          
          // Canisterからトークン残高を取得
          const balance = await TokenService.getBalance(user.key);
          const formattedBalance = TokenService.formatTokenAmount(balance);
          setTokenBalance(parseFloat(formattedBalance));
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadUserData();
    }
  }, [authLoading, user, router, isInitialized]);

  const handleSaveDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return;
    
    try {
      setSavingName(true);
      
      // 表示名が既に使用されているかチェック
      const isTaken = await UserService.isDisplayNameTaken(newDisplayName, user.key);
      if (isTaken) {
        alert('この名前は既に使用されています');
        return;
      }
      
      // プロフィールを更新
      await UserService.updateUserProfile(user.key, newDisplayName);
      setDisplayName(newDisplayName);
      setIsEditingName(false);
      UserService.clearCache(user.key);
      alert('ユーザー名を更新しました');
    } catch (error) {
      console.error('Failed to save display name:', error);
      alert('ユーザー名の更新に失敗しました');
    } finally {
      setSavingName(false);
    }
  };


  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">統計情報を読み込めませんでした</h1>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  const userName = displayName || `User-${user.key}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームに戻る
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              マイページ
            </h1>
            <div></div> {/* Spacer */}
          </div>
        </div>
      </nav>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              レビュー履歴
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              設定
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="py-8">
        {activeTab === 'dashboard' ? (
          <UserStatsDashboard userStats={userStats} userName={userName} tokenBalance={tokenBalance} principalId={user.key} />
        ) : activeTab === 'reviews' ? (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                レビュー履歴 ({userStats.recentReviews.length})
              </h2>
              {userStats.recentReviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-60">📝</div>
                  <p className="text-gray-500 mb-4">まだレビューがありません</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    レストランを探す
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userStats.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ★
                              </span>
                            ))}
                            <span className="font-semibold text-lg ml-2">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">設定</h2>
              
              <div className="space-y-6">
                {/* ユーザー名設定 */}
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー名</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      {isEditingName ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            placeholder="新しいユーザー名を入力"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            maxLength={50}
                          />
                          <button
                            onClick={handleSaveDisplayName}
                            disabled={savingName || !newDisplayName.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingName ? '保存中...' : '保存'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingName(false);
                              setNewDisplayName('');
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-medium text-gray-900">{displayName}</p>
                            <p className="text-sm text-gray-500">このユーザー名がレビューに表示されます</p>
                          </div>
                          <button
                            onClick={() => {
                              setIsEditingName(true);
                              setNewDisplayName(displayName);
                            }}
                            className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium"
                          >
                            編集
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* アカウント情報 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント情報</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Principal ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{user.key}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">総レビュー数</p>
                        <p className="text-sm text-gray-900">
                          {userStats?.totalReviews || 0} 件
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}