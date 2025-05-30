'use client';

import { useState } from 'react';
import type { Restaurant, RestaurantCategory } from '@/types/restaurant';
import { ImageUpload } from '@/components/image-upload';

interface RestaurantFormProps {
  onSubmit: (restaurant: Omit<Restaurant, 'id'>) => void;
  onCancel: () => void;
}

const categories: RestaurantCategory[] = [
  '和食', '洋食', '中華', 'イタリアン', 'フレンチ',
  'カフェ', 'ラーメン', '焼肉', '寿司', 'その他'
];

export function RestaurantForm({ onSubmit, onCancel }: RestaurantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '和食' as RestaurantCategory,
    address: '',
    location: {
      lat: 0,
      lng: 0
    },
    phoneNumber: '',
    businessHours: '',
    description: '',
    imageUrl: '',
    website: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          店舗名 *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
          placeholder="例: 銀座 寿司 八"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          カテゴリー *
        </label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as RestaurantCategory })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none bg-white dark:bg-gray-700 text-sm sm:text-base"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          住所 *
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
          placeholder="例: 東京都中央区銀座4-5-6"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            緯度
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.location?.lat || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...(formData.location || { lat: 0, lng: 0 }), lat: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
            placeholder="例: 35.6762"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            経度
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.location?.lng || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...(formData.location || { lat: 0, lng: 0 }), lng: parseFloat(e.target.value) || 0 }
            })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
            placeholder="例: 139.6503"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          電話番号
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
          placeholder="例: 03-1234-5678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          営業時間 *
        </label>
        <input
          type="text"
          required
          placeholder="例: 11:00-22:00 (月曜定休)"
          value={formData.businessHours}
          onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
        />
      </div>

      {/* 画像アップロード */}
      <div>
        <ImageUpload
          label="レストランの画像"
          maxImages={1}
          existingImages={formData.imageUrl ? [formData.imageUrl] : []}
          onImagesUploaded={(urls) => {
            setFormData({ ...formData, imageUrl: urls[0] || '' });
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          アップロードできない場合は、下の画像URL欄に直接URLを入力してください
        </p>
      </div>
      
      {/* 画像URL（フォールバック） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          画像URL（直接入力）
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          説明
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm sm:text-base"
          placeholder="お店の特徴やおすすめポイントを入力してください"
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>※ 位置情報は<a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Google Maps</a>で住所を検索し、右クリックで緯度・経度を取得できます</p>
      </div>

      <div className="flex gap-3 sm:gap-4 justify-end pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm sm:text-base"
        >
          登録する
        </button>
      </div>
    </form>
  );
}