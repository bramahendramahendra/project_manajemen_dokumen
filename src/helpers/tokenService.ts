// "use client";
import { tokenConfig, API_URL, DEBUG_MODE  } from '../utils/config';

/**
 * Function untuk refresh access token menggunakan refresh token
 * @returns Response dari fetch
 */
export const refreshAccessToken = async (): Promise<Response> => {
    try {
      if (DEBUG_MODE) {
        console.log('Mencoba refresh token dari:', `${API_URL}/auths/refresh`);
      }

      const response = await fetch(`${API_URL}/auths/refresh`, {
        method: "POST",
        credentials: "include", // Penting untuk menyertakan cookies
      });
  
      return response;
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
};

/**
 * Fungsi untuk mengecek apakah perlu melakukan refresh token
 * Akan merefresh token jika waktu login sudah lebih dari threshold
 * @returns Promise<boolean> true jika refresh berhasil, false jika gagal
 */
export const checkAndRefreshTokenIfNeeded = async (): Promise<boolean> => {
  try {
    // Ambil waktu login terakhir dari localStorage
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    
    if (!lastLoginTime) {
      // Jika tidak ada waktu login, kemungkinan belum login
      return false;
    }
    
    const now = Date.now();
    const loginTime = parseInt(lastLoginTime, 10);
    
    // Threshold untuk refresh token - 80% dari waktu expired
    const refreshThreshold = tokenConfig.accessTokenDuration * tokenConfig.refreshThreshold;

    if (DEBUG_MODE) {
      console.log('Token age:', (now - loginTime) / 1000 / 60, 'menit');
      console.log('Refresh threshold:', refreshThreshold / 1000 / 60, 'menit');
    }
    
    if (now - loginTime > refreshThreshold) {
      // Perlu refresh token
      if (DEBUG_MODE) {
        console.log('Token perlu direfresh');
      }
      const response = await refreshAccessToken();
      
      if (response.ok) {
        // Update waktu login terakhir
        localStorage.setItem('lastLoginTime', now.toString());
        return true;
      }
      
      return false;
    }
    
    return true; // Tidak perlu refresh, token masih valid
  } catch (error) {
    console.error("Token check error:", error);
    return false;
  }
};