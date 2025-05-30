'use client';

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {

  return (
    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        位置情報の取得方法
      </h4>
      
      <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <li className="flex gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">1.</span>
          <div>
            <a 
              href="https://www.google.com/maps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
            >
              Google Maps
            </a>
            を新しいタブで開く
          </div>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">2.</span>
          <span>お店の名前や住所で検索</span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">3.</span>
          <span>地図上でお店の場所を右クリック</span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">4.</span>
          <span>表示される座標（例: 35.6762, 139.6503）をコピー</span>
        </li>
        <li className="flex gap-2">
          <span className="font-medium text-blue-600 dark:text-blue-400">5.</span>
          <span>下の緯度・経度欄に貼り付け</span>
        </li>
      </ol>
      
      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
          <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            スマートフォンの場合: 地図を長押しすると座標が表示されます
          </span>
        </p>
      </div>
    </div>
  );
}