"use client";

import { useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
import { checkAndRefreshTokenIfNeeded } from '../../helpers/tokenService';
import { tokenConfig } from '../../utils/config';

const TokenRefresher = () => {
  // const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fungsi untuk melakukan pengecekan dan refresh token jika perlu
    const refreshTokenHandler = async () => {
      try {
        const success = await checkAndRefreshTokenIfNeeded();
        
        if (!success) {
          // Jika refresh gagal, redirect ke login
          // router.push('/login');
          // Gunakan window.location untuk menghindari masalah dengan router
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // router.push('/login');
        window.location.href = '/login';
      }
    };
    
    // Set interval untuk refresh token
    refreshIntervalRef.current = setInterval(
      refreshTokenHandler, 
      tokenConfig.refreshCheckInterval
    );

    // Juga check saat komponen di-mount
    refreshTokenHandler();

    // Cleanup interval saat komponen di-unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Komponen ini tidak merender apapun
  return null;
};

export default TokenRefresher;