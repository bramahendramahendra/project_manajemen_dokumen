import { tokenConfig, API_URL, DEBUG_MODE } from '../utils/config';

// Helper untuk format waktu
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

// Helper untuk format duration
const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Function untuk refresh access token menggunakan refresh token
 * @returns Response dari fetch
 */
export const refreshAccessToken = async (): Promise<Response> => {
  try {
    const startTime = Date.now();
    
    if (DEBUG_MODE) {
      console.log('🔄 [refreshAccessToken] Starting token refresh...');
      console.log(`   ├─ Time: ${formatTime(new Date())}`);
      console.log(`   └─ Endpoint: ${API_URL}/auths/refresh`);
    }

    const response = await fetch(`${API_URL}/auths/refresh`, {
      method: "POST",
      credentials: "include", // Penting untuk menyertakan cookies
    });

    const duration = Date.now() - startTime;

    if (DEBUG_MODE) {
      if (response.ok) {
        console.log(`✅ [refreshAccessToken] Token refreshed successfully (${duration}ms)`);
        console.log(`   ├─ Status: ${response.status}`);
        console.log(`   └─ New login time: ${formatTime(new Date())}`);
      } else {
        console.error(`❌ [refreshAccessToken] Refresh failed (${duration}ms)`);
        console.error(`   ├─ Status: ${response.status}`);
        console.error(`   └─ Status Text: ${response.statusText}`);
      }
    }
  
    return response;
  } catch (error) {
    console.error("❌ [refreshAccessToken] Error:", error);
    throw error;
  }
};

/**
 * Fungsi untuk mengecek apakah perlu melakukan refresh token
 * Akan merefresh token jika waktu login sudah lebih dari threshold
 * @returns Promise<boolean> true jika refresh berhasil atau tidak perlu refresh, false jika gagal
 */
export const checkAndRefreshTokenIfNeeded = async (): Promise<boolean> => {
  try {
    // Ambil waktu login terakhir dari localStorage
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    
    if (!lastLoginTime) {
      if (DEBUG_MODE) {
        console.log('ℹ️  [checkAndRefreshTokenIfNeeded] No login time found');
      }
      return false;
    }
    
    const now = Date.now();
    const loginTime = parseInt(lastLoginTime, 10);
    const tokenAge = now - loginTime;
    
    // Threshold untuk refresh token
    const refreshThreshold = tokenConfig.accessTokenDuration * tokenConfig.refreshThreshold;
    const timeUntilRefresh = refreshThreshold - tokenAge;
    const timeUntilExpiry = tokenConfig.accessTokenDuration - tokenAge;

    if (DEBUG_MODE) {
      console.log('⏰ [checkAndRefreshTokenIfNeeded] Token Status Check');
      console.log(`   ├─ Current Time: ${formatTime(new Date())}`);
      console.log(`   ├─ Login Time: ${formatTime(new Date(loginTime))}`);
      console.log(`   ├─ Token Age: ${formatDuration(tokenAge)}`);
      console.log(`   ├─ Refresh Threshold: ${formatDuration(refreshThreshold)}`);
      console.log(`   ├─ Time Until Refresh: ${formatDuration(Math.max(0, timeUntilRefresh))}`);
      console.log(`   └─ Time Until Expiry: ${formatDuration(Math.max(0, timeUntilExpiry))}`);
    }
    
    // Jika token sudah kadaluwarsa
    if (tokenAge > tokenConfig.accessTokenDuration) {
      console.warn('⚠️  [checkAndRefreshTokenIfNeeded] Token already expired!');
      console.warn(`   └─ Expired ${formatDuration(tokenAge - tokenConfig.accessTokenDuration)} ago`);
      return false;
    }
    
    // Jika sudah waktunya refresh
    if (tokenAge > refreshThreshold) {
      if (DEBUG_MODE) {
        console.log('🔄 [checkAndRefreshTokenIfNeeded] Token needs refresh');
        console.log(`   └─ Threshold exceeded by ${formatDuration(tokenAge - refreshThreshold)}`);
      }
      
      const response = await refreshAccessToken();
      
      if (response.ok) {
        // Update waktu login terakhir
        const newLoginTime = now.toString();
        localStorage.setItem('lastLoginTime', newLoginTime);
        
        if (DEBUG_MODE) {
          console.log('✅ [checkAndRefreshTokenIfNeeded] Token refresh successful');
          console.log(`   ├─ New login time set: ${formatTime(new Date(now))}`);
          console.log(`   └─ Next refresh in: ${formatDuration(refreshThreshold)}`);
        }
        
        return true;
      } else {
        console.error('❌ [checkAndRefreshTokenIfNeeded] Token refresh failed');
        return false;
      }
    }
    
    // Token masih valid, tidak perlu refresh
    if (DEBUG_MODE) {
      console.log('✅ [checkAndRefreshTokenIfNeeded] Token still valid');
      console.log(`   └─ Will refresh in: ${formatDuration(timeUntilRefresh)}`);
    }
    
    return true;
  } catch (error) {
    console.error("❌ [checkAndRefreshTokenIfNeeded] Error:", error);
    return false;
  }
};

/**
 * Get token status info (untuk debugging)
 */
export const getTokenStatus = () => {
  const lastLoginTime = localStorage.getItem('lastLoginTime');
  
  if (!lastLoginTime) {
    return {
      isLoggedIn: false,
      message: 'No login time found'
    };
  }
  
  const now = Date.now();
  const loginTime = parseInt(lastLoginTime, 10);
  const tokenAge = now - loginTime;
  const refreshThreshold = tokenConfig.accessTokenDuration * tokenConfig.refreshThreshold;
  const timeUntilRefresh = refreshThreshold - tokenAge;
  const timeUntilExpiry = tokenConfig.accessTokenDuration - tokenAge;
  
  return {
    isLoggedIn: true,
    loginTime: new Date(loginTime),
    tokenAge,
    tokenAgeFmt: formatDuration(tokenAge),
    refreshThreshold,
    refreshThresholdFmt: formatDuration(refreshThreshold),
    timeUntilRefresh,
    timeUntilRefreshFmt: formatDuration(Math.max(0, timeUntilRefresh)),
    timeUntilExpiry,
    timeUntilExpiryFmt: formatDuration(Math.max(0, timeUntilExpiry)),
    needsRefresh: tokenAge > refreshThreshold,
    isExpired: tokenAge > tokenConfig.accessTokenDuration
  };
};

// Expose ke window untuk debugging (hanya di development)
if (DEBUG_MODE && typeof window !== 'undefined') {
  (window as any).tokenDebug = {
    getStatus: getTokenStatus,
    checkAndRefresh: checkAndRefreshTokenIfNeeded,
    forceRefresh: refreshAccessToken,
    config: tokenConfig
  };
  
  console.log('💡 Token debugging available via window.tokenDebug');
  console.log('   Commands:');
  console.log('   - window.tokenDebug.getStatus()');
  console.log('   - window.tokenDebug.checkAndRefresh()');
  console.log('   - window.tokenDebug.forceRefresh()');
  console.log('   - window.tokenDebug.config');
}