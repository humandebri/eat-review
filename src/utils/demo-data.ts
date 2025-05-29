import type { Restaurant } from '@/types/restaurant';
import { DatastoreService } from '@/services/datastore';

export const demoRestaurants: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'averageRating' | 'reviewCount'>[] = [
  {
    name: '銀座 寿司 八',
    category: '寿司',
    address: '東京都中央区銀座4-5-6',
    location: { lat: 35.6715, lng: 139.7642 },
    phoneNumber: '03-1234-5678',
    businessHours: '11:30-14:00, 17:00-22:00 (月曜定休)',
    description: '職人が握る本格江戸前寿司。新鮮な魚介を使用した握りは絶品です。',
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80'
  },
  {
    name: 'ラーメン 一風堂',
    category: 'ラーメン',
    address: '東京都渋谷区神南1-22-7',
    location: { lat: 35.6580, lng: 139.7016 },
    phoneNumber: '03-2345-6789',
    businessHours: '11:00-23:00',
    description: '博多発の本格豚骨ラーメン。濃厚でクリーミーなスープが自慢です。',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80'
  },
  {
    name: 'トラットリア ピッツェリア',
    category: 'イタリアン',
    address: '東京都港区南青山3-8-40',
    location: { lat: 35.6654, lng: 139.7104 },
    phoneNumber: '03-3456-7890',
    businessHours: '11:30-15:00, 17:30-23:00',
    description: '本場ナポリの味を再現した石窯ピザと手打ちパスタが人気のイタリアンレストラン。',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80'
  },
  {
    name: '炭火焼肉 牛角',
    category: '焼肉',
    address: '東京都新宿区歌舞伎町1-16-3',
    location: { lat: 35.6939, lng: 139.7037 },
    phoneNumber: '03-4567-8901',
    businessHours: '17:00-24:00',
    description: '上質な和牛を炭火で焼き上げる本格焼肉店。食べ放題コースも人気です。',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80'
  },
  {
    name: 'カフェ ド フルール',
    category: 'カフェ',
    address: '東京都世田谷区代官山1-35-17',
    location: { lat: 35.6484, lng: 139.6857 },
    phoneNumber: '03-5678-9012',
    businessHours: '8:00-22:00',
    description: 'パリの雰囲気を感じられるおしゃれなカフェ。自家製スイーツとコーヒーが絶品。',
    imageUrl: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800&q=80'
  },
  {
    name: '天ぷら 銀座 ほそ川',
    category: '和食',
    address: '東京都中央区銀座6-9-5',
    location: { lat: 35.6695, lng: 139.7638 },
    phoneNumber: '03-6789-0123',
    businessHours: '11:30-14:00, 17:30-21:00 (日曜定休)',
    description: '旬の食材を使った江戸前天ぷら。カウンター席で職人の技を間近で楽しめます。',
    imageUrl: 'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?w=800&q=80'
  }
];

export async function insertDemoData() {
  console.log('デモデータの挿入を開始します...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const restaurant of demoRestaurants) {
    try {
      await DatastoreService.createRestaurant(restaurant as Restaurant);
      console.log(`✅ ${restaurant.name} を追加しました`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${restaurant.name} の追加に失敗:`, error);
      errorCount++;
    }
  }
  
  console.log(`デモデータの挿入が完了しました！ 成功: ${successCount}件, 失敗: ${errorCount}件`);
  
  if (errorCount > 0) {
    throw new Error(`${errorCount}件のデモデータの追加に失敗しました`);
  }
}