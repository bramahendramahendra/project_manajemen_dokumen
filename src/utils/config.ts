export const isDev = process.env.NODE_ENV !== 'production';

// Konfigurasi durasi token - HARUS SAMA DENGAN BACKEND
export const tokenConfig = {
  // Durasi dalam milliseconds (converted dari menit)
  accessTokenDuration: parseInt(
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_DURATION || '15'
  ) * 60 * 1000,
  
  refreshTokenDuration: parseInt(
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_DURATION || '10080'
  ) * 60 * 1000,
    
  // Threshold untuk refresh (default 0.5 = 50% dari total durasi)
  // Untuk 2 menit = mulai refresh setelah 1 menit
  // Untuk 15 menit = mulai refresh setelah 7.5 menit
  refreshThreshold: parseFloat(
    process.env.NEXT_PUBLIC_REFRESH_THRESHOLD || '0.5'
  ),

  // Interval pengecekan (dalam milliseconds)
  refreshCheckInterval: parseFloat(
    process.env.NEXT_PUBLIC_REFRESH_CHECK_INTERVAL || '5'
  ) * 60 * 1000
};

// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// App URL
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Base Path
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Debug mode
export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Helper function untuk mendapatkan asset path
export const getAssetPath = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
};

// App Configuration Object
export const APP_CONFIG = {
  isDev,
  API_URL,
  APP_URL,
  BASE_PATH,
  DEBUG_MODE,
  tokenConfig,
} as const;

// Helper untuk format durasi
const formatDuration = (ms: number): string => {
  const minutes = ms / (60 * 1000);
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(1)} jam`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)} hari`;
};

// Log konfigurasi saat aplikasi dimulai (hanya di development)
if (DEBUG_MODE && typeof window !== 'undefined') {
  console.log('='.repeat(60));
  console.log('🔧 FRONTEND TOKEN CONFIGURATION');
  console.log('='.repeat(60));
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL:', API_URL);
  console.log('APP URL:', APP_URL);
  console.log('BASE PATH:', BASE_PATH || '(none)');
  console.log('-'.repeat(60));
  console.log('Token Settings:');
  console.log(`  ├─ Access Token Duration: ${formatDuration(tokenConfig.accessTokenDuration)}`);
  console.log(`  ├─ Refresh Token Duration: ${formatDuration(tokenConfig.refreshTokenDuration)}`);
  console.log(`  ├─ Refresh Threshold: ${(tokenConfig.refreshThreshold * 100).toFixed(0)}% of token duration`);
  console.log(`  │  └─ Will refresh after: ${formatDuration(tokenConfig.accessTokenDuration * tokenConfig.refreshThreshold)}`);
  console.log(`  └─ Check Interval: ${formatDuration(tokenConfig.refreshCheckInterval)}`);
  console.log('='.repeat(60));
  
  // Warning jika konfigurasi tidak masuk akal
  if (tokenConfig.refreshCheckInterval >= tokenConfig.accessTokenDuration) {
    console.warn('⚠️  WARNING: Check interval >= access token duration!');
    console.warn('   Token might expire before being checked.');
  }
  
  const refreshTime = tokenConfig.accessTokenDuration * tokenConfig.refreshThreshold;
  if (refreshTime <= tokenConfig.refreshCheckInterval) {
    console.warn('⚠️  WARNING: Refresh threshold too low for check interval!');
    console.warn(`   Token should refresh at ${formatDuration(refreshTime)}`);
    console.warn(`   But check only runs every ${formatDuration(tokenConfig.refreshCheckInterval)}`);
  }
}