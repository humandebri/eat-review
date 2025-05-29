// アイコン生成スクリプト
// 実行: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// 簡易的なSVGからPNGへの変換はサーバーサイドで難しいため、
// 以下のようなプレースホルダーSVGを作成します

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-icon.png', size: 180 },
];

const createSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.4}" text-anchor="middle" fill="white">🍽️</text>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
`;

// Note: 実際のプロジェクトでは、sharp や canvas などのライブラリを使用して
// SVGからPNGに変換することをお勧めします。

console.log('アイコン生成の手順:');
console.log('1. 以下のSVGコードを使用してオンラインコンバーター等でPNGに変換してください');
console.log('2. または、デザインツール（Figma, Illustrator等）で作成してください\n');

sizes.forEach(({ name, size }) => {
  console.log(`\n=== ${name} (${size}x${size}) ===`);
  console.log(createSvg(size));
});

console.log('\n推奨: https://cloudconvert.com/svg-to-png などのツールを使用してPNGに変換');
console.log('または、以下のコマンドでsharpをインストールして変換:');
console.log('pnpm add -D sharp');
console.log('その後、このスクリプトを更新して自動変換を実装');