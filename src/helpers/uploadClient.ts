import axios from "axios";
import { refreshAccessToken } from "./tokenService";

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
        }
      }
    });

    return {
      response: response.data,
      status: response.status
    };
  } catch (error: any) {
    // Periksa jika error 401 (Unauthorized) - token expired
    if (error.response && error.response.status === 401 && !retried) {
      // Jika tidak sedang refresh token, lakukan refresh
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshResponse = await refreshAccessToken();
          
          if (refreshResponse.ok) {
            isRefreshing = false;
            
            // Update waktu login terakhir
            localStorage.setItem('lastLoginTime', Date.now().toString());
            
            // Retry semua request yang gagal
            processFailedRequests(true);
            
            // Retry request saat ini
            return apiRequestUpload(endpoint, file, onProgress, true);
          } else {
            // Jika refresh gagal, redirect ke login
            isRefreshing = false;
            localStorage.removeItem('lastLoginTime');
            window.location.href = "/login";
            throw new Error("Session expired, please log in again.");
          }
        } catch (refreshError) {
          isRefreshing = false;
          localStorage.removeItem('lastLoginTime');
          window.location.href = "/login";
          throw refreshError;
        }
      } else {
        // Jika sedang refresh, tambahkan request ke antrian
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
    
    console.error("Upload error:", error);
    
    // Kembalikan format error yang konsisten
    throw new Error(
      error.response?.data?.responseDesc || 
      error.message || 
      "Terjadi kesalahan saat mengupload file."
    );
  }
};