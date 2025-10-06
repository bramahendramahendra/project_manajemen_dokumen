import axios from "axios";
import { refreshAccessToken } from "./tokenService";
import { BASE_PATH, DEBUG_MODE } from "@/utils/config";

// Import notification client untuk koordinasi SSE
let notificationClient: any = null;

// Dynamic import untuk menghindari circular dependency
// const getNotificationClient = async () => {
//   if (!notificationClient) {
//     const notificationModule = await import('./notificationClient');
//     notificationClient = notificationModule.default;
//   }
//   return notificationClient;
// };

// Helper function untuk redirect dengan base path
const redirectToLogin = () => {
  const loginPath = BASE_PATH ? `${BASE_PATH}/login` : '/login';
  if (DEBUG_MODE) {
    console.log('[uploadClient] Redirecting to:', loginPath);
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

/**
 * Upload file ke endpoint tertentu dengan tracking progress real-time.
 * @param endpoint endpoint tujuan (tanpa baseURL, contoh: "/document_managements/upload-temp")
 * @param file file yang akan diupload
 * @param onProgress callback menerima persentase upload (0–100)
 * @returns Response dari axios
 */
export const apiRequestUpload = async (
  endpoint: string,
  file: File,
  onProgress: (percent: number) => void,
  retried: boolean = false // Flag untuk mencegah retry loop tak terbatas
): Promise<{ response: any; status: number }> => {
  try {
    if (DEBUG_MODE) {
      console.log('[apiRequestUpload] Starting upload:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await axios({
      method: 'POST',
      url: `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      data: formData,
      headers: {
        // Content-Type secara otomatis akan diatur sebagai multipart/form-data oleh axios
      },
      // Penting: Sertakan credentials agar cookies dikirim dengan request
      withCredentials: true,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
          
          if (DEBUG_MODE && percentCompleted % 25 === 0) {
            console.log(`[apiRequestUpload] Upload progress: ${percentCompleted}%`);
          }
        }
      }
    });

    if (DEBUG_MODE) {
      console.log('[apiRequestUpload] Upload successful:', response.status);
    }

    return {
      response: response.data,
      status: response.status
    };
  } catch (error: any) {
    // Periksa jika error 401 (Unauthorized) - token expired
    if (error.response && error.response.status === 401 && !retried) {
      if (DEBUG_MODE) {
        console.log('[apiRequestUpload] Token expired during upload, attempting refresh...');
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
              console.log('[apiRequestUpload] Token refreshed successfully, retrying upload...');
            }
            
            // Notify SSE client untuk reconnect dengan token baru
            // try {
            //   // const notifClient = await getNotificationClient();
            //   // notifClient.reconnect();
            // } catch (sseError) {
            //   console.error('[apiRequestUpload] Error notifying SSE client:', sseError);
            // }
            
            // Retry semua request yang gagal
            processFailedRequests(true);
            
            // Retry request saat ini
            return apiRequestUpload(endpoint, file, onProgress, true);
          } else {
            // Jika refresh gagal, redirect ke login
            isRefreshing = false;
            localStorage.removeItem('lastLoginTime');
            
            if (DEBUG_MODE) {
              console.log('[apiRequestUpload] Token refresh failed, redirecting to login...');
            }
            
            // Close SSE connection
            // try {
            //   const notifClient = await getNotificationClient();
            //   notifClient.close();
            // } catch (sseError) {
            //   console.error('[apiRequestUpload] Error closing SSE connection:', sseError);
            // }
            
            redirectToLogin();
            throw new Error("Session expired, please log in again.");
          }
        } catch (refreshError) {
          isRefreshing = false;
          localStorage.removeItem('lastLoginTime');
          
          console.error('[apiRequestUpload] Error during token refresh:', refreshError);
          
          // Close SSE connection
          // try {
          //   const notifClient = await getNotificationClient();
          //   notifClient.close();
          // } catch (sseError) {
          //   console.error('[apiRequestUpload] Error closing SSE connection:', sseError);
          // }
          
          redirectToLogin();
          throw refreshError;
        }
      } else {
        // Jika sedang refresh, tambahkan request ke antrian
        if (DEBUG_MODE) {
          console.log('[apiRequestUpload] Queueing upload request while refresh in progress...');
        }

        return new Promise((resolve, reject) => {
          failedRequests.push((success: boolean) => {
            if (success) {
              resolve(apiRequestUpload(endpoint, file, onProgress, true));
            } else {
              reject("Session expired");
            }
          });
        });
      }
    }
    
    console.error("[apiRequestUpload] Upload error:", error);
    
    // Kembalikan format error yang konsisten
    throw new Error(
      error.response?.data?.responseDesc || 
      error.message || 
      "Terjadi kesalahan saat mengupload file."
    );
  }
};