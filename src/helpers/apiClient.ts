import Cookies from "js-cookie";
import { refreshAccessToken } from "./tokenService";
import { BASE_PATH, DEBUG_MODE } from "@/utils/config";

// Import notification client untuk koordinasi SSE
let notificationClient: any = null;

// Dynamic import untuk menghindari circular dependency
const getNotificationClient = async () => {
  if (!notificationClient) {
    const notificationModule = await import('./notificationClient');
    notificationClient = notificationModule.default;
  }
  return notificationClient;
};

// Helper function untuk redirect dengan base path
const redirectToLogin = () => {
  const loginPath = BASE_PATH ? `${BASE_PATH}/login` : '/login';
  if (DEBUG_MODE) {
    console.log('[apiClient] Redirecting to:', loginPath);
  }
  window.location.href = loginPath;
};

// Variabel untuk mencegah multiple refresh token secara bersamaan
let isRefreshing = false;
let failedRequests: Function[] = [];

// Fungsi untuk retry request yang gagal setelah token direfresh
const processFailedRequests = (success: boolean) => {
  failedRequests.forEach(callback => callback(success));
  failedRequests = [];
};

// Fungsi helper untuk membersihkan menu data dari localStorage
const clearMenuData = () => {
  try {
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (user.level_id) {
      localStorage.removeItem(`menu_${user.level_id}`);
    }
    
    // Bersihkan semua menu data yang mungkin tersimpan
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('menu_')) {
        localStorage.removeItem(key);
      }
    });
    
    if (DEBUG_MODE) {
      console.log('[apiClient] Menu data cleared');
    }
  } catch (error) {
    console.error("[apiClient] Error clearing menu data:", error);
  }
};

/**
 * Helper function untuk request API dengan token
 * @param endpoint URL endpoint yang dituju
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Payload data untuk request (optional)
 * @returns Response dari fetch
 */
export const apiRequest = async (
  endpoint: string, 
  method: string = "GET", 
  body?: any,
  retried: boolean = false // Flag untuk mencegah retry loop tak terbatas
): Promise<Response> => {
  try {
    const headers: Record<string, string> = {};

    let finalBody: any = undefined;

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      finalBody = JSON.stringify(body);
    } else if (body instanceof FormData) {
      finalBody = body;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers,
      body: finalBody,
      // Penting: Sertakan credentials agar cookies dikirim dengan request
      credentials: "include",
    });

    // Periksa jika token expired (status 401)
    if (response.status === 401 && !retried) {
      // Jika tidak sedang refresh token, lakukan refresh
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          if (DEBUG_MODE) {
            console.log('[apiRequest] Token expired, attempting refresh...');
          }
          
          const refreshResponse = await refreshAccessToken();
          
          if (refreshResponse.ok) {
            isRefreshing = false;
            
            // Update waktu login terakhir
            localStorage.setItem('lastLoginTime', Date.now().toString());
            
            if (DEBUG_MODE) {
              console.log('[apiRequest] Token refreshed successfully');
            }
            
            // Notify SSE client untuk reconnect dengan token baru
            try {
              const notifClient = await getNotificationClient();
              if (DEBUG_MODE) {
                console.log('[apiRequest] Notifying SSE client to reconnect after token refresh...');
              }
              notifClient.reconnect();
            } catch (sseError) {
              console.error('[apiRequest] Error notifying SSE client:', sseError);
            }
            
            // Retry semua request yang gagal
            processFailedRequests(true);
            
            // Retry request saat ini
            return apiRequest(endpoint, method, body, true);
          } else {
            // Jika refresh gagal, redirect ke login
            isRefreshing = false;
            if (DEBUG_MODE) {
              console.log('[apiRequest] Token refresh failed, redirecting to login...');
            }
            await handleLogout();
            throw new Error("Session expired, please log in again.");
          }
        } catch (error) {
          isRefreshing = false;
          console.error('[apiRequest] Error during token refresh:', error);
          await handleLogout();
          throw error;
        }
      } else {
        // Jika sedang refresh, tambahkan request ke antrian
        return new Promise((resolve, reject) => {
          failedRequests.push((success: boolean) => {
            if (success) {
              resolve(apiRequest(endpoint, method, body, true));
            } else {
              reject("Session expired");
            }
          });
        });
      }
    }

    return response;
  } catch (error) {
    console.error("[apiRequest] API request error:", error);
    throw error;
  }
};

// Helper function untuk handle logout
const handleLogout = async () => {
  try {
    // Close SSE connection
    const notifClient = await getNotificationClient();
    notifClient.close();
    
    if (DEBUG_MODE) {
      console.log('[handleLogout] SSE connection closed');
    }
  } catch (error) {
    console.error('[handleLogout] Error closing SSE connection:', error);
  }

  // Clear data
  Cookies.remove("user");
  localStorage.removeItem('lastLoginTime');
  clearMenuData();
  
  if (DEBUG_MODE) {
    console.log('[handleLogout] User data cleared');
  }
  
  // Redirect dengan base path
  redirectToLogin();
};

/**
 * Helper function khusus untuk download file
 * @param endpoint URL endpoint yang dituju untuk download
 * @param retried Flag untuk mencegah retry loop tak terbatas
 * @returns Response dari fetch
 */
export const downloadFileRequest = async (
  endpoint: string,
  retried: boolean = false
): Promise<Response> => {
  try {
    if (DEBUG_MODE) {
      console.log(`[downloadFileRequest] Making download request: ${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "GET",
      credentials: "include",
      // Tidak perlu set headers khusus untuk download
    });

    if (DEBUG_MODE) {
      console.log(`[downloadFileRequest] Response status: ${response.status} for ${endpoint}`);
    }
    
    // Periksa jika token expired (status 401) - sama seperti apiRequest
    if (response.status === 401 && !retried) {
      if (DEBUG_MODE) {
        console.log('[downloadFileRequest] Token expired during download, attempting refresh...');
      }
      
      // Jika tidak sedang refresh token, lakukan refresh
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshResponse = await refreshAccessToken();
          
          if (refreshResponse.ok) {
            isRefreshing = false;
            
            // Update waktu login terakhir
            localStorage.setItem('lastLoginTime', Date.now().toString());
            
            if (DEBUG_MODE) {
              console.log('[downloadFileRequest] Token refreshed successfully');
            }
            
            // Notify SSE client untuk reconnect
            try {
              const notifClient = await getNotificationClient();
              notifClient.reconnect();
            } catch (sseError) {
              console.error('[downloadFileRequest] Error notifying SSE client:', sseError);
            }
            
            // Retry semua request yang gagal
            processFailedRequests(true);
            
            // Retry download request saat ini
            return downloadFileRequest(endpoint, true);
          } else {
            // Jika refresh gagal, redirect ke login
            isRefreshing = false;
            await handleLogout();
            throw new Error("Session expired, please log in again.");
          }
        } catch (error) {
          isRefreshing = false;
          await handleLogout();
          throw error;
        }
      } else {
        // Jika sedang refresh, tambahkan request ke antrian
        return new Promise((resolve, reject) => {
          failedRequests.push((success: boolean) => {
            if (success) {
              resolve(downloadFileRequest(endpoint, true));
            } else {
              reject("Session expired");
            }
          });
        });
      }
    }
    
    return response;
  } catch (error) {
    console.error("[downloadFileRequest] Download request error:", error);
    throw error;
  }
};

/**
 * Helper function untuk request login
 * @param endpoint URL endpoint yang dituju
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Payload data untuk request (optional)
 * @returns Response dari fetch
 */
export const loginRequest = async (endpoint: string, method: string = "POST", body?: any) => {
  try {
    if (DEBUG_MODE) {
      console.log('[loginRequest] Attempting login...');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      // Sertakan credentials untuk menerima cookies
      credentials: "include", 
    });

    // Jika login berhasil, simpan waktu login untuk refresh token
    if (response.ok) {
      localStorage.setItem('lastLoginTime', Date.now().toString());
      
      if (DEBUG_MODE) {
        console.log('[loginRequest] Login successful, initializing SSE connection...');
      }
      
      // Initialize SSE connection setelah login berhasil
      try {
        const notifClient = await getNotificationClient();
        // Tunggu sebentar sebelum mulai SSE
        setTimeout(() => {
          notifClient.connect();
        }, 1000);
      } catch (sseError) {
        console.error('[loginRequest] Error starting SSE after login:', sseError);
      }
    } else {
      if (DEBUG_MODE) {
        console.log('[loginRequest] Login failed with status:', response.status);
      }
    }

    return response;
  } catch (error) {
    console.error("[loginRequest] LOGIN request error:", error);
    throw error;
  }
};

/**
 * Helper function untuk logout
 * @param endpoint URL endpoint logout
 */
export const logoutRequest = async (endpoint: string) => {
  try {
    if (DEBUG_MODE) {
      console.log('[logoutRequest] Attempting logout...');
    }

    // Close SSE connection before logout
    try {
      const notifClient = await getNotificationClient();
      notifClient.close();
      
      if (DEBUG_MODE) {
        console.log('[logoutRequest] SSE connection closed');
      }
    } catch (sseError) {
      console.error('[logoutRequest] Error closing SSE during logout:', sseError);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
    });
    
    if (response.ok) {
      Cookies.remove("user", { path: "/" }); // Hapus token dari cookies
      localStorage.removeItem('lastLoginTime');
      localStorage.removeItem('selectedMenu'); // Hapus selected menu
      clearMenuData(); // Bersihkan menu data
      
      if (DEBUG_MODE) {
        console.log('[logoutRequest] Logout successful, data cleared');
      }
    }

    return response;
  } catch (error) {
    console.error("[logoutRequest] LOGOUT request error:", error);
    // Tetap bersihkan data lokal meskipun request gagal
    Cookies.remove("user", { path: "/" });
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem('selectedMenu');
    clearMenuData();
    
    // Close SSE connection
    try {
      const notifClient = await getNotificationClient();
      notifClient.close();
    } catch (sseError) {
      console.error('[logoutRequest] Error closing SSE during logout cleanup:', sseError);
    }
    
    throw error;
  }
};

/**
 * Helper function untuk lupa password request
 * @param endpoint URL endpoint yang dituju
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @returns Response dari fetch
 */
export const lupaPassRequest = async (endpoint: string, method: string = "POST") => {
  try {
    if (DEBUG_MODE) {
      console.log('[lupaPassRequest] Requesting password reset...');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      // Sertakan credentials untuk menerima cookies
      credentials: "include", 
    });

    if (DEBUG_MODE) {
      console.log('[lupaPassRequest] Response status:', response.status);
    }

    return response;
  } catch (error) {
    console.error("[lupaPassRequest] Lupa Password request error:", error);
    throw error;
  }
};