"use client";

import { useEffect, useRef, useCallback } from 'react';
import { checkAndRefreshTokenIfNeeded, getTokenStatus } from '@/helpers/tokenService';
import { DEBUG_MODE, tokenConfig, BASE_PATH } from '@/utils/config';

// Dynamic import untuk notificationClient
const getNotificationClient = async () => {
  try {
    const notificationModule = await import('@/helpers/notificationClient');
    return notificationModule.default;
  } catch (error) {
    console.error('Error importing notification client:', error);
    return null;
  }
};

// Helper function untuk redirect
const redirectToLogin = () => {
  const loginPath = BASE_PATH ? `${BASE_PATH}/login` : '/login';
  window.location.href = loginPath;
};

// Format duration helper
const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const TokenRefresher = () => {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  const mountTimeRef = useRef<number>(Date.now());

  // Fungsi untuk log status token (hanya di development)
  const logTokenStatus = useCallback(() => {
    if (!DEBUG_MODE) return;
    
    const status = getTokenStatus();
    if (status.isLoggedIn) {
      const uptime = Date.now() - mountTimeRef.current;
      console.log('📊 [TokenRefresher] Status Update');
      console.log(`   ├─ Component Uptime: ${formatDuration(uptime)}`);
      console.log(`   ├─ Token Age: ${status.tokenAgeFmt}`);
      console.log(`   ├─ Until Refresh: ${status.timeUntilRefreshFmt}`);
      console.log(`   ├─ Until Expiry: ${status.timeUntilExpiryFmt}`);
      console.log(`   ├─ Needs Refresh: ${status.needsRefresh ? '⚠️  YES' : '✅ NO'}`);
      console.log(`   └─ Is Expired: ${status.isExpired ? '❌ YES' : '✅ NO'}`);
    }
  }, []);

  // Fungsi untuk melakukan pengecekan dan refresh token
  const refreshTokenHandler = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      if (DEBUG_MODE) {
        console.log('⏸️  [TokenRefresher] Refresh already in progress, skipping...');
      }
      return;
    }

    try {
      isRefreshingRef.current = true;
      
      if (DEBUG_MODE) {
        console.log('🔄 [TokenRefresher] Starting token check...');
      }
      
      const success = await checkAndRefreshTokenIfNeeded();
      
      if (success) {
        if (DEBUG_MODE) {
          console.log('✅ [TokenRefresher] Token check completed successfully');
        }
        
        // Notify SSE client untuk reconnect dengan token baru jika di-refresh
        try {
          const notificationClient = await getNotificationClient();
          if (notificationClient) {
            const status = getTokenStatus();
            
            // Type guard: Check if status has tokenAge property and is logged in
            if (status.isLoggedIn && typeof status.tokenAge === 'number') {
              // Hanya reconnect jika baru saja refresh (token age < 10 detik)
              if (status.tokenAge < 10000) {
                if (DEBUG_MODE) {
                  console.log('🔌 [TokenRefresher] Reconnecting SSE after token refresh');
                }
                notificationClient.reconnect();
              }
            }
          }
        } catch (sseError) {
          console.error('[TokenRefresher] Error with SSE client:', sseError);
        }
      } else {
        console.error('❌ [TokenRefresher] Token check failed, redirecting to login');
        
        // Close SSE connection before redirect
        try {
          const notificationClient = await getNotificationClient();
          if (notificationClient) {
            notificationClient.close();
          }
        } catch (sseError) {
          console.error('[TokenRefresher] Error closing SSE:', sseError);
        }
        
        // Clear login time
        localStorage.removeItem('lastLoginTime');
        
        // Redirect ke login
        redirectToLogin();
      }
    } catch (error) {
      console.error('[TokenRefresher] Error during token refresh:', error);
      
      // Close SSE connection
      try {
        const notificationClient = await getNotificationClient();
        if (notificationClient) {
          notificationClient.close();
        }
      } catch (sseError) {
        console.error('[TokenRefresher] Error closing SSE on error:', sseError);
      }
      
      // Clear login time
      localStorage.removeItem('lastLoginTime');
      
      // Redirect ke login
      redirectToLogin();
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Setup refresh interval
  useEffect(() => {
    const intervalDuration = tokenConfig?.refreshCheckInterval || 5 * 60 * 1000;
    
    if (DEBUG_MODE) {
      console.log('='.repeat(60));
      console.log('🚀 [TokenRefresher] Component Initialized');
      console.log('='.repeat(60));
      console.log(`Check Interval: ${formatDuration(intervalDuration)}`);
      console.log(`Access Token Duration: ${formatDuration(tokenConfig.accessTokenDuration)}`);
      console.log(`Refresh Threshold: ${(tokenConfig.refreshThreshold * 100).toFixed(0)}%`);
      console.log(`Will refresh after: ${formatDuration(tokenConfig.accessTokenDuration * tokenConfig.refreshThreshold)}`);
      console.log(`BASE_PATH: ${BASE_PATH || '(none)'}`);
      console.log('='.repeat(60));
    }
    
    // Set interval untuk refresh token
    refreshIntervalRef.current = setInterval(
      refreshTokenHandler, 
      intervalDuration
    );

    // Set interval untuk log status (hanya di development, setiap 30 detik)
    if (DEBUG_MODE) {
      statusIntervalRef.current = setInterval(logTokenStatus, 30000);
      
      // Log status awal setelah 5 detik
      setTimeout(logTokenStatus, 5000);
    }

    // Check pertama kali setelah 2 detik
    const timeoutId = setTimeout(() => {
      if (DEBUG_MODE) {
        console.log('🎯 [TokenRefresher] Running initial token check');
      }
      refreshTokenHandler();
    }, 2000);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      clearTimeout(timeoutId);
      
      if (DEBUG_MODE) {
        console.log('🛑 [TokenRefresher] Component cleanup completed');
      }
    };
  }, [refreshTokenHandler, logTokenStatus]);

  // Listen for visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && !isRefreshingRef.current) {
        if (DEBUG_MODE) {
          console.log('👁️  [TokenRefresher] Tab visible, checking token');
        }
        
        await refreshTokenHandler();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshTokenHandler]);

  // Listen for window focus
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (!isRefreshingRef.current) {
        if (DEBUG_MODE) {
          console.log('🎯 [TokenRefresher] Window focused, checking token');
        }
        
        await refreshTokenHandler();
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [refreshTokenHandler]);

  // Komponen ini tidak merender apapun
  return null;
};

export default TokenRefresher;