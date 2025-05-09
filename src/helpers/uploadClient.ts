import Cookies from "js-cookie";

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
  
      xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, true);
      xhr.setRequestHeader("Authorization", token);
      xhr.send(formData);
    });
  };
  