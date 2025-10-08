export const isDev = process.env.NODE_ENV !== 'production';

// Konfigurasi durasi token
export const tokenConfig = {
  accessTokenDuration: parseInt(
    process.env.NEXT_PUBLIC_ACCESS_TOKEN_DURATION || '60'
  ) * 60 * 1000,
    
  // Threshold untuk refresh (80% dari total durasi)
  refreshThreshold: 0.8,

  refreshCheckInterval: parseInt(
    process.env.NEXT_PUBLIC_REFRESH_CHECK_INTERVAL || '5'
  ) * 60 * 1000
};

// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// App URL
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Base Path - extracted from APP_URL
// export const BASE_PATH = APP_URL.includes('/testing') ? '/testing' : '';
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Debug mode (opsional)
export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Helper function untuk mendapatkan asset path
export const getAssetPath = (path: string): string => {
  // Pastikan path dimulai dengan /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
};

// App Configuration Object (untuk kemudahan akses)
export const APP_CONFIG = {
  isDev,
  API_URL,
  APP_URL,
  BASE_PATH,
  DEBUG_MODE,
  tokenConfig,
} as const;

// Log konfigurasi saat aplikasi dimulai (hanya di development)
if (DEBUG_MODE) {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL:', API_URL);
  console.log('APP URL:', APP_URL);
  console.log('BASE PATH:', BASE_PATH);
  console.log('Token config:', {
    accessTokenDuration: `${tokenConfig.accessTokenDuration / (60 * 1000)} menit`,
    refreshCheckInterval: `${tokenConfig.refreshCheckInterval / (60 * 1000)} menit`,
  });
}