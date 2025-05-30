export interface Restaurant {
  id?: string;
  name: string;
  category: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  businessHours: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  website?: string;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: number;
  updatedAt?: number;
  owner?: string;
}

export interface Review {
  id?: string;
  restaurantId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  visitDate: string;
  imageUrls?: string[];
  atmosphereRating?: number;
  tasteRating?: number;
  serviceRating?: number;
  valuePriceRating?: number;
  cleanlinessRating?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface User {
  id?: string;
  name: string;
  email?: string;
  profileImageUrl?: string;
  reviewCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export type RestaurantCategory = 
  | '和食'
  | '洋食'
  | '中華'
  | 'イタリアン'
  | 'フレンチ'
  | 'カフェ'
  | 'ラーメン'
  | '焼肉'
  | '寿司'
  | 'その他';