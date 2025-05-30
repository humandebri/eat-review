'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { setDoc, getDoc } from '@junobuild/core';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 管理者のプリンシパルID（あなたのプリンシパルIDに置き換えてください）
  const ADMIN_PRINCIPALS = [
    'YOUR_PRINCIPAL_ID_HERE', // TODO: あなたのプリンシパルIDに置き換える
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user && !ADMIN_PRINCIPALS.includes(user.key)) {
      router.push('/');
      return;
    }

    if (user) {
      loadConfig();
    }
  }, [user, loading, router, ADMIN_PRINCIPALS]);

  const loadConfig = async () => {
    try {
      const config = await getDoc({
        collection: 'config',
        key: 'google_maps_api_key'
      });
      
      if (config?.data && typeof config.data === 'object' && 'value' in config.data) {
        setApiKey((config.data as { value: string }).value);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('APIキーを入力してください');
      return;
    }

    setSaving(true);
    try {
      await setDoc({
        collection: 'config',
        doc: {
          key: 'google_maps_api_key',
          data: {
            value: apiKey.trim(),
            updatedAt: new Date().toISOString(),
            updatedBy: user?.key || 'unknown'
          }
        }
      });
      
      alert('APIキーを保存しました');
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!user || !ADMIN_PRINCIPALS.includes(user.key)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス権限がありません</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full hover:from-orange-600 hover:to-red-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8">
            管理者設定
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Maps API設定</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">設定手順：</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Google Cloud Consoleでプロジェクトを作成</li>
                  <li>Maps Embed APIを有効化（無料）</li>
                  <li>APIキーを作成し、HTTPリファラー制限を設定</li>
                  <li>下記にAPIキーを入力して保存</li>
                </ol>
                <p className="mt-2 text-xs text-orange-700">
                  ※ Geocoding APIは課金が発生するため使用しません。位置情報は手動で入力してください。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps APIキー
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  このAPIキーはCanister内に安全に保存されます
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">現在のプリンシパルID：</h3>
              <code className="block p-3 bg-gray-100 rounded text-xs font-mono break-all">
                {user.key}
              </code>
              <p className="mt-2 text-xs text-gray-500">
                このIDを <code>ADMIN_PRINCIPALS</code> 配列に追加してください
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}