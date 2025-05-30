export const AUTH_CONFIG = {
  MAX_TIME_TO_LIVE: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7日間（ナノ秒）
  WINDOWED: true, // ポップアップウィンドウでログイン
  ALLOW_PIN: false, // PINログインを無効
};