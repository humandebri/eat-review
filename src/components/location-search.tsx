'use client';

import { useState } from 'react';

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;

    setSearching(true);
    try {
      // Geocoding API（Google Maps Geocoding APIを使用する場合）
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        alert('Google Maps APIキーが設定されていません');
        return;
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        onLocationSelect({
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address,
        });
      } else {
        alert('場所が見つかりませんでした');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('検索中にエラーが発生しました');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        場所を検索
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="例: 東京駅、銀座三越"
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !searchQuery}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {searching ? '検索中...' : '検索'}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        住所や施設名で検索すると、自動的に緯度・経度を取得します
      </p>
    </div>
  );
}