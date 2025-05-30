'use client';

import { useEffect, useState } from 'react';
import { getDoc } from '@junobuild/core';

interface GoogleMapProps {
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  className?: string;
}

export function GoogleMap({ address, location, className = '' }: GoogleMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Canisterから設定を取得
    const fetchApiKey = async () => {
      try {
        const config = await getDoc({
          collection: 'config',
          key: 'google_maps_api_key'
        });
        
        if (config?.data && typeof config.data === 'object' && 'value' in config.data) {
          setApiKey((config.data as { value: string }).value);
        }
      } catch (error) {
        console.error('Failed to fetch API key:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  // Google Maps Embed API用のクエリを生成
  const query = location 
    ? `${location.lat},${location.lng}`
    : address 
    ? encodeURIComponent(address)
    : '';

  if (!query) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">地図を表示できません</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!apiKey) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300 mb-3">地図を表示するにはGoogle Maps APIキーの設定が必要です</p>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Google Mapsで開く
          </a>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=16`;

  return (
    <iframe
      src={mapUrl}
      className={`w-full ${className}`}
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Google Maps"
    />
  );
}