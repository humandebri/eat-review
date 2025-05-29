import { RestaurantCategory } from '@/types/restaurant';

// 詳細カテゴリーから大カテゴリーへのマッピング
export const categoryMapping: Record<RestaurantCategory, string> = {
  '和食': '和食',
  '寿司': '和食',
  'ラーメン': '和食',
  '焼肉': '和食',
  '洋食': '洋食',
  'イタリアン': '洋食',
  'フレンチ': '洋食',
  'カフェ': '洋食',
  '中華': '中華',
  'その他': 'その他'
};

// 大カテゴリーのリスト
export const mainCategories = ['すべて', '和食', '洋食', '中華', 'その他'];

// カテゴリーの説明
export const categoryDescriptions: Record<string, string> = {
  '和食': '和食・寿司・ラーメン・焼肉',
  '洋食': '洋食・イタリアン・フレンチ・カフェ',
  '中華': '中華料理',
  'その他': 'その他の料理'
};