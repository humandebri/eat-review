'use client';

import { useEffect } from 'react';
import { initSatellite } from '@junobuild/core';

export default function ClientSetupPage() {
  useEffect(() => {
    const initJuno = async () => {
      try {
        console.log('Initializing Juno Satellite in setup page...');
        await initSatellite({
          workers: {
            auth: true,
          },
        });
        console.log('Juno Satellite initialized successfully');
        // 初期化成功後、ホームページにリダイレクト
        window.location.href = '/';
      } catch (error) {
        console.error('Failed to initialize Juno Satellite:', error);
      }
    };

    initJuno();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Eat Review を初期化中...</h1>
        <p className="text-gray-600">少々お待ちください</p>
      </div>
    </div>
  );
}