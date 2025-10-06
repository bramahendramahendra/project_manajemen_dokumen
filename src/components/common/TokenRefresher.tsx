"use client";

import { useEffect, useRef } from 'react';
import { checkAndRefreshTokenIfNeeded } from '@/helpers/tokenService';
import { DEBUG_MODE, tokenConfig, BASE_PATH } from '@/utils/config';

// Dynamic import untuk notificationClient untuk menghindari circular dependency
const getNotificationClient = async () => {
  try {
    const notificationModule = await import('@/helpers/notificationClient');
    return notificationModule.default;
  } catch (error) {
    console.error('Error importing notification client:', error);
    return null;
  }
};

// Helper function untuk redirect dengan base path
const redirectToLogin = () => {
  const loginPath = BASE_PATH ? `${BASE_PATH}/login` : '/login';
  window.location.href = loginPath;
};

const TokenRefresher = () => {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    // Fungsi untuk melakukan pengecekan dan refresh token jika perlu
    const refreshTokenHandler = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshingRef.current) {
        return;
      }

      try {
        isRefreshingRef.current = true;
        const success = await checkAndRefreshTokenIfNeeded();
        
        if (success) {
          if (DEBUG_MODE) {
            console.log('[TokenRefresher] Token refreshed successfully');
          }
          
          // Notify SSE client untuk reconnect dengan token baru
          try {
            const notificationClient = await getNotificationClient();
            if (notificationClient) {
              if (DEBUG_MODE) {
                console.log('[TokenRefresher] Notifying SSE client to reconnect after token refresh');
              }
              notificationClient.reconnect();
            }
          } catch (sseError) {
            console.error('[TokenRefresher] Error notifying SSE client:', sseError);
          }
        } else {
          if (DEBUG_MODE) {
            console.log('[TokenRefresher] Token refresh failed, redirecting to login');
          }
          
          // Close SSE connection before redirect
          try {
            const notificationClient = await getNotificationClient();
            if (notificationClient) {
              notificationClient.close();
            }
          } catch (sseError) {
            console.error('[TokenRefresher] Error closing SSE connection before redirect:', sseError);
          }
          
          // Redirect ke login dengan base path
          redirectToLogin();
        }
      } catch (error) {
        console.error('[TokenRefresher] Failed to refresh token:', error);
        
        // Close SSE connection before redirect
        try {
          const notificationClient = await getNotificationClient();
          if (notificationClient) {
            notificationClient.close();
          }
        } catch (sseError) {
          console.error('[TokenRefresher] Error closing SSE connection on error:', sseError);
        }
        
        // Redirect ke login dengan base path
        redirectToLogin();
      } finally {
        isRefreshingRef.current = false;
      }
    };
    
    // Set interval untuk refresh token
    const intervalDuration = tokenConfig?.refreshCheckInterval || 5 * 60 * 1000; // Default 5 minutes
    
    if (DEBUG_MODE) {
      console.log('[TokenRefresher] Initialized with interval:', intervalDuration / 1000, 'seconds');
      console.log('[TokenRefresher] BASE_PATH:', BASE_PATH || '(none)');
    }
    
    refreshIntervalRef.current = setInterval(
      refreshTokenHandler, 
      intervalDuration
    );

    // Juga check saat komponen di-mount setelah delay kecil
    const timeoutId = setTimeout(() => {
      if (DEBUG_MODE) {
        console.log('[TokenRefresher] Running initial token check');
      }
      refreshTokenHandler();
    }, 2000); // Delay 2 detik untuk memberi waktu aplikasi ter-initialize

    // Cleanup interval dan timeout saat komponen di-unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      clearTimeout(timeoutId);
      
      if (DEBUG_MODE) {
        console.log('[TokenRefresher] Cleanup completed');
      }
    };
  }, []);

  // Listen for visibility change untuk refresh saat tab menjadi aktif
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && !isRefreshingRef.current) {
        // Tab menjadi aktif, cek apakah perlu refresh token
        if (DEBUG_MODE) {
          console.log('[TokenRefresher] Tab became visible, checking token');
        }
        
        try {
          const success = await checkAndRefreshTokenIfNeeded();
          if (success) {
            if (DEBUG_MODE) {
              console.log('[TokenRefresher] Token refreshed on visibility change');
            }
            
            // Reconnect SSE jika diperlukan
            try {
              const notificationClient = await getNotificationClient();
              if (notificationClient && notificationClient.getConnectionStatus() !== 'connected') {
                if (DEBUG_MODE) {
                  console.log('[TokenRefresher] Reconnecting SSE after visibility change');
                }
                notificationClient.reconnect();
              }
            } catch (sseError) {
              console.error('[TokenRefresher] Error reconnecting SSE on visibility change:', sseError);
            }
          }
        } catch (error) {
          console.error('[TokenRefresher] Error checking token on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for focus event untuk refresh saat window mendapat focus
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (!isRefreshingRef.current) {
        if (DEBUG_MODE) {
          console.log('[TokenRefresher] Window focused, checking token');
        }
        
        try {
          const success = await checkAndRefreshTokenIfNeeded();
          if (success) {
            if (DEBUG_MODE) {
              console.log('[TokenRefresher] Token refreshed on window focus');
            }
            
            // Ensure SSE connection is active
            try {
              const notificationClient = await getNotificationClient();
              if (notificationClient && notificationClient.getConnectionStatus() !== 'connected') {
                if (DEBUG_MODE) {
                  console.log('[TokenRefresher] Connecting SSE after window focus');
                }
                notificationClient.connect();
              }
            } catch (sseError) {
              console.error('[TokenRefresher] Error ensuring SSE connection on focus:', sseError);
            }
          }
        } catch (error) {
          console.error('[TokenRefresher] Error checking token on window focus:', error);
        }
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Komponen ini tidak merender apapun
  return null;
};

export default TokenRefresher;