'use client';

interface GoogleMapProps {
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  className?: string;
}

export function GoogleMap({ address, location, className = '' }: GoogleMapProps) {
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Google Maps APIキーが設定されていません</p>
          <p className="text-sm text-gray-400">.env.localファイルに設定してください</p>
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