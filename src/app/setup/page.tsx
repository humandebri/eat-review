'use client';

import { useState } from 'react';
import { initializeCollections } from '@/utils/init-collections';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await initializeCollections();
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セットアップに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          🍽️ Eat Review セットアップ
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          初回起動時は、データベースコレクションの初期設定が必要です。
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 rounded">
            セットアップが完了しました！リダイレクトしています...
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading || success}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'セットアップ中...' : 'セットアップを開始'}
        </button>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p className="font-semibold mb-2">以下のコレクションが作成されます：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>restaurants - レストラン情報</li>
            <li>reviews - レビュー情報</li>
            <li>users - ユーザー情報</li>
          </ul>
        </div>
      </div>
    </div>
  );
}