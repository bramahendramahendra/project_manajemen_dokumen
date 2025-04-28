import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";

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
  body?: any
): Promise<Response> => {
  try {
    // Ambil token dari cookies
    const token = Cookies.get("token");
    if (!token) {
      // console.error("Token is missing");
      throw new Error("Token is missing");
    }
    
    const headers: Record<string, string> = {
      Authorization: `${token}`,
    };

    let finalBody: any = undefined;

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      finalBody = JSON.stringify(body);
    } else if (body instanceof FormData) {
      finalBody = body;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API}${endpoint}`, {
      method,
      headers,
      body: finalBody,
    });

    // Periksa jika token expired (status 401)
    if (response.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");

      window.location.href = "/login";
      // return;
      throw new Error("Token expired, please log in again.");
    }

    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};


/**
 * Upload file ke endpoint tertentu dengan tracking progress real-time.
 * @param endpoint endpoint tujuan (tanpa baseURL, contoh: "/document_managements/upload-temp")
 * @param file file yang akan diupload
 * @param onProgress callback menerima persentase upload (0–100)
 * @returns { response, status }
 */
export const apiRequestUpload = (
  endpoint: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<{ response: any; status: number }> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const token = Cookies.get("token");

    if (!token) {
      reject(new Error("Token not found."));
      return;
    }

    formData.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        resolve({ response, status: xhr.status });
      } catch (error) {
        reject(new Error("Gagal parsing response dari server."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Terjadi kesalahan saat mengupload file."));
    };

    xhr.open("POST", `${process.env.NEXT_PUBLIC_API}${endpoint}`, true);
    xhr.setRequestHeader("Authorization", token);
    xhr.send(formData);
  });
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