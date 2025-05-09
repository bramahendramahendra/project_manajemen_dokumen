import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";
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
    // Ambil token dari cookies
    // const token = Cookies.get("token");
    // if (!token) {
    //   // console.error("Token is missing");
    //   throw new Error("Token is missing");
    // }
    
    // const headers: Record<string, string> = {
    //   Authorization: `${token}`,
    // };
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
    // if (response.status === 401) {
    //   // Cookies.remove("token");
    //   Cookies.remove("user");

    //   window.location.href = "/login";
    //   // return;
    //   throw new Error("Authentication required, please log in again.");
    // }

    // Periksa jika token expired (status 401)
    if (response.status === 401 && !retried) {
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
            return apiRequest(endpoint, method, body, true);
          } else {
            // Jika refresh gagal, redirect ke login
            isRefreshing = false;
            Cookies.remove("user");
            localStorage.removeItem('lastLoginTime');
            window.location.href = "/login";
            throw new Error("Session expired, please log in again.");
          }
        } catch (error) {
          isRefreshing = false;
          Cookies.remove("user");
          localStorage.removeItem('lastLoginTime');
          window.location.href = "/login";
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
    console.error("API request error:", error);
    throw error;
  }
};

/**
 * Helper function untuk request API dengan token
 * @param endpoint URL endpoint yang dituju
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Payload data untuk request (optional)
 * @returns Response dari fetch
 */
export const loginRequest = async (endpoint: string, method: string = "POST", body?: any) => {
    try {
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
      }
  
      return response;
    } catch (error) {
      console.error("LOGIN request error:", error);
      throw error;
    }
};

/**
 * Helper function untuk logout
 * @param endpoint URL endpoint logout
 */
export const logoutRequest = async (endpoint: string) => {
  try {
    // const response = await apiRequest(endpoint, "POST");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      Cookies.remove("user", { path: "/" }); // Hapus token dari cookies
      localStorage.removeItem('lastLoginTime');
    }

    return response;
  } catch (error) {
    console.error("LOGOUT request error:", error);
    throw error;
  }
};