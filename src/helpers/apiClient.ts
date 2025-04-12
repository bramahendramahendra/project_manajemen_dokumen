import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

/**
 * Helper function untuk request API dengan token
 * @param endpoint URL endpoint yang dituju
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param body Payload data untuk request (optional)
 * @returns Response dari fetch
 */
export const apiRequest = async (endpoint: string, method: string = "GET", body?: any) => {
  try {
    // Ambil token dari cookies
    const token = Cookies.get("token");
    if (!token) {
      console.error("Token is missing");
      throw new Error("Token is missing");
    }
    

    const response = await fetch(`${process.env.NEXT_PUBLIC_API}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      // mode: "cors",
      body: body ? JSON.stringify(body) : undefined,
    });

    // Periksa jika token expired (status 401)
    if (response.status === 401) {
      // Hapus token dan data pengguna jika token sudah expired
      Cookies.remove("token");
      Cookies.remove("user");

      // Jika Anda ingin mengarahkan pengguna kembali ke halaman login
      const router = useRouter();
      router.push("/login");  // Arahkan ke halaman login

      throw new Error("Token expired, please log in again.");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
  
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
  const response = await apiRequest(endpoint, "POST");
  if (response.ok) {
    Cookies.remove("token", { path: "/" }); // Hapus token dari cookies
  }
  return response;
};