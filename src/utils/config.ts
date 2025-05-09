export const isDev = process.env.NODE_ENV !== 'production';
console.log(`Aplikasi berjalan dalam mode: ${process.env.NODE_ENV}`);
console.log(`Duration Token: ${process.env.NEXT_PUBLIC_ACCESS_TOKEN_DURATION}`);


// Konfigurasi durasi token
export const tokenConfig = {
  // Access token (dalam milidetik)
  // accessTokenDuration: isDev 
  //   ? parseInt(process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN_DURATION || '120') * 60 * 1000 // 2 jam default
  //   : parseInt(process.env.NEXT_PUBLIC_PROD_ACCESS_TOKEN_DURATION || '10') * 60 * 1000, // 10 menit default

  accessTokenDuration: parseInt(
      process.env.NEXT_PUBLIC_ACCESS_TOKEN_DURATION || '60'
  ) * 60 * 1000,

  
      
    
  // Threshold untuk refresh (80% dari total durasi)
  refreshThreshold: 0.8,
  
  // Interval pengecekan refresh (dalam milidetik)
  // refreshCheckInterval: isDev
  //   ? 30 * 60 * 1000  // 30 menit untuk dev
  //   : 2 * 60 * 1000   // 2 menit untuk prod

  refreshCheckInterval: parseInt(
    process.env.NEXT_PUBLIC_REFRESH_CHECK_INTERVAL || '5'
  ) * 60 * 1000
};

// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


// Debug mode (opsional)
export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Log konfigurasi saat aplikasi dimulai (hanya di development)
if (DEBUG_MODE) {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL:', API_URL);
  console.log('Token config:', {
    accessTokenDuration: `${tokenConfig.accessTokenDuration / (60 * 1000)} menit`,
    refreshCheckInterval: `${tokenConfig.refreshCheckInterval / (60 * 1000)} menit`,
  });
}