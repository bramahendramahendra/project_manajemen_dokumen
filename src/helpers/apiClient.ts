import Cookies from "js-cookie";

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
    const token = Cookies.get("token"); // Mengambil token dengan js-cookie
    if (!token) {
      console.error("Token is missing");
      throw new Error("Token is missing");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

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