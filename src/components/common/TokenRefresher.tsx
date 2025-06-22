"use client";

import { useEffect, useRef } from 'react';
import { checkAndRefreshTokenIfNeeded } from '@/helpers/tokenService';
import { tokenConfig } from '@/utils/config';

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
          console.log('Token refreshed successfully by TokenRefresher');
          
          // Notify SSE client untuk reconnect dengan token baru
          try {
            const notificationClient = await getNotificationClient();
            if (notificationClient) {
              console.log('Notifying SSE client to reconnect after token refresh');
              notificationClient.reconnect();
            }
          } catch (sseError) {
            console.error('Error notifying SSE client in TokenRefresher:', sseError);
          }
        } else {
          console.log('Token refresh failed, redirecting to login');
          
          // Close SSE connection before redirect
          try {
            const notificationClient = await getNotificationClient();
            if (notificationClient) {
              notificationClient.close();
            }
          } catch (sseError) {
            console.error('Error closing SSE connection before redirect:', sseError);
          }
          
          // Redirect ke login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to refresh token in TokenRefresher:', error);
        
        // Close SSE connection before redirect
        try {
          const notificationClient = await getNotificationClient();
          if (notificationClient) {
            notificationClient.close();
          }
        } catch (sseError) {
          console.error('Error closing SSE connection on error:', sseError);
        }
        
        window.location.href = '/login';
      } finally {
        isRefreshingRef.current = false;
      }
    };
    
    // Set interval untuk refresh token
    const intervalDuration = tokenConfig?.refreshCheckInterval || 5 * 60 * 1000; // Default 5 minutes
    
    refreshIntervalRef.current = setInterval(
      refreshTokenHandler, 
      intervalDuration
    );

    // Juga check saat komponen di-mount setelah delay kecil
    const timeoutId = setTimeout(() => {
      refreshTokenHandler();
    }, 2000); // Delay 2 detik untuk memberi waktu aplikasi ter-initialize

    // Cleanup interval dan timeout saat komponen di-unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  // Listen for visibility change untuk refresh saat tab menjadi aktif
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && !isRefreshingRef.current) {
        // Tab menjadi aktif, cek apakah perlu refresh token
        try {
          const success = await checkAndRefreshTokenIfNeeded();
          if (success) {
            console.log('Token refreshed on visibility change');
            
            // Reconnect SSE jika diperlukan
            try {
              const notificationClient = await getNotificationClient();
              if (notificationClient && notificationClient.getConnectionStatus() !== 'connected') {
                notificationClient.reconnect();
              }
            } catch (sseError) {
              console.error('Error reconnecting SSE on visibility change:', sseError);
            }
          }
        } catch (error) {
          console.error('Error checking token on visibility change:', error);
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
        try {
          const success = await checkAndRefreshTokenIfNeeded();
          if (success) {
            console.log('Token refreshed on window focus');
            
            // Ensure SSE connection is active
            try {
              const notificationClient = await getNotificationClient();
              if (notificationClient && notificationClient.getConnectionStatus() !== 'connected') {
                notificationClient.connect();
              }
            } catch (sseError) {
              console.error('Error ensuring SSE connection on focus:', sseError);
            }
          }
        } catch (error) {
          console.error('Error checking token on window focus:', error);
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