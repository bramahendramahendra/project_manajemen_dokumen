import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import Cookies from "js-cookie";
import { loginRequest, apiRequest, downloadFileRequest } from "@/helpers/apiClient"; // Import apiRequest
import { FaEye, FaEyeSlash, FaTimes, FaDownload } from "react-icons/fa";
import { useMenu } from "@/contexts/MenuContext";
import { DEBUG_MODE } from '@/utils/config';

const SectionRight = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const [captchaID, setCaptchaID] = useState<string>("");
  const [captchaURL, setCaptchaURL] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  // State untuk floating guide button
  const [showGuidePopup, setShowGuidePopup] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Gunakan menu context
  const { fetchMenuData } = useMenu();

  // Generate CAPTCHA menggunakan apiClient
  const fetchCaptcha = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiRequest("/auths/generate-captcha", "GET");
      
      if (response.ok) {
        const data = await response.json();
        
        // Validasi response structure
        if (data.responseCode === 200 && data.responseData) {
          setCaptchaID(data.responseData.captcha_id);
          setCaptchaURL(`${process.env.NEXT_PUBLIC_API_URL}${data.responseData.captcha_url}`);
        } else {
          console.error("Invalid captcha response:", data);
          setErrorMessage("Gagal memuat CAPTCHA. Silakan refresh halaman.");
        }
      } else {
        console.error("Failed to fetch captcha:", response.status);
        setErrorMessage("Gagal memuat CAPTCHA. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      setErrorMessage("Terjadi kesalahan saat memuat CAPTCHA.");
    } finally {
      // Tambahkan delay kecil untuk efek visual
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);
  
  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoggingIn(true);

    if (!captchaInput) {
      setErrorMessage("Captcha is required");
      setIsLoggingIn(false);
      return;
    }

    try {
      const payload = {
        username: username,
        password: password,
        captcha_id: captchaID,
        captcha: captchaInput,
      };
      
      const response = await loginRequest("/auths/login", "POST", payload);
      const data = await response.json();

      if (response.ok && data.responseCode === 200) {
        localStorage.setItem("hasVisited", "true");
        Cookies.set("user", JSON.stringify(data.responseData.user), { path: "/" });

        // Simpan waktu login untuk refresh token check
        const loginTime = Date.now();
        localStorage.setItem('lastLoginTime', loginTime.toString());

        // Debug logging untuk token configuration
        if (DEBUG_MODE) {
          console.log('='.repeat(60));
          console.log('✅ LOGIN SUCCESSFUL');
          console.log('='.repeat(60));
          console.log('Login Time:', new Date(loginTime).toLocaleTimeString('id-ID'));
          console.log('User:', data.responseData.user.username);
          
          // Jika backend mengirim token config
          if (data.responseData?.token_config) {
            const tokenConfigFromBackend = data.responseData.token_config;
            console.log('Token Configuration from Backend:');
            console.log(`  ├─ Access Token Duration: ${tokenConfigFromBackend.access_token_duration} minutes`);
            console.log(`  └─ Refresh Token Duration: ${tokenConfigFromBackend.refresh_token_duration} minutes`);
            
            // Validasi apakah config frontend sama dengan backend
            const frontendAccessDuration = parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_DURATION || '15');
            const frontendRefreshDuration = parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_DURATION || '10080');
            
            console.log('Frontend Token Configuration:');
            console.log(`  ├─ Access Token Duration: ${frontendAccessDuration} minutes`);
            console.log(`  └─ Refresh Token Duration: ${frontendRefreshDuration} minutes`);
            
            // Warning jika ada mismatch
            if (tokenConfigFromBackend.access_token_duration !== frontendAccessDuration) {
              console.warn('⚠️  WARNING: Access token duration mismatch!');
              console.warn(`   Backend: ${tokenConfigFromBackend.access_token_duration} minutes`);
              console.warn(`   Frontend: ${frontendAccessDuration} minutes`);
              console.warn('   → Please update NEXT_PUBLIC_ACCESS_TOKEN_DURATION in .env.local');
            }
            
            if (tokenConfigFromBackend.refresh_token_duration !== frontendRefreshDuration) {
              console.warn('⚠️  WARNING: Refresh token duration mismatch!');
              console.warn(`   Backend: ${tokenConfigFromBackend.refresh_token_duration} minutes`);
              console.warn(`   Frontend: ${frontendRefreshDuration} minutes`);
              console.warn('   → Please update NEXT_PUBLIC_REFRESH_TOKEN_DURATION in .env.local');
            }
            
            // Success message jika config match
            if (tokenConfigFromBackend.access_token_duration === frontendAccessDuration &&
                tokenConfigFromBackend.refresh_token_duration === frontendRefreshDuration) {
              console.log('✅ Token configuration is synchronized between frontend and backend');
            }
          } else {
            console.warn('⚠️  Backend did not send token_config in response');
            console.warn('   Using frontend configuration from .env.local');
          }
          
          console.log('='.repeat(60));
        }

        // Fetch menu data setelah login berhasil
        try {
          await fetchMenuData();
        } catch (menuError) {
          console.error("Failed to fetch menu after login:", menuError);
          // Tetap lanjutkan ke dashboard meskipun menu gagal dimuat
        }

        // Navigasi ke dashboard
        router.push("/dashboard");
      } else {
        setErrorMessage(data.responseDesc || "Login failed. Please try again.");
        // Reset captcha input dan refresh captcha baru saat login gagal
        setCaptchaInput("");
        fetchCaptcha();
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again later.");
      // Reset captcha input dan refresh captcha baru jika terjadi error
      setCaptchaInput("");
      fetchCaptcha();
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Function untuk download manual book - KONSISTEN DENGAN REFERENSI
  const downloadManualBook = async () => {
    setIsDownloading(true);
    try {
      // console.log('Downloading manual book from API: /auths/manual-book');
      
      // Menggunakan downloadFileRequest helper untuk konsistensi dengan referensi
      const response = await downloadFileRequest("/auths/manual-book");
      
      // console.log('Download response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Coba ambil detail error dari response
          try {
            const errorData = await response.json();
            console.error('Manual book not found details:', errorData);
            throw new Error('Manual book tidak ditemukan di server');
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error('Manual book tidak ditemukan di server');
          }
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            console.error('Bad request details:', errorData);
            throw new Error(errorData.ResponseDesc || 'Format permintaan tidak valid');
          } catch (parseError) {
            throw new Error('Format permintaan tidak valid');
          }
        } else {
          throw new Error(`Error ${response.status}: Gagal mengunduh manual book`);
        }
      }

      // Membuat blob dari response
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File manual book kosong atau tidak dapat dibaca');
      }
      
      // console.log('Blob size:', blob.size, 'bytes');
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tentukan nama file untuk download
      let downloadFileName = 'Manual_Book.pdf';
      
      // Coba dapatkan nama file dari header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch) {
          downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // console.log('Download filename:', downloadFileName);
      
      // Membuat link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      link.style.display = 'none'; // Sembunyikan link
      
      // Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      // console.log('Manual book download completed successfully');
      
      // Tutup popup setelah berhasil download
      setShowGuidePopup(false);
      
      // Tampilkan notifikasi sukses (opsional)
      // alert(`Manual book "${downloadFileName}" berhasil diunduh!`);
      
    } catch (error) {
      console.error('Error downloading manual book:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh manual book';
      alert(`Gagal mengunduh manual book: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] flex h-screen flex-col items-center justify-center px-12 lg:px-[100px] xl:px-[120px] 2xl:px-[150px]">
          <div className="2xl:w-full">
            <div className="w-full font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
              Masuk ke dalam Sipaduke
            </div>
            <div className="w-full pt-1 font-inter font-normal leading-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
              Silahkan masuk untuk melakukan aktifitas anda
            </div>
            <section className="w-full">
              <form onSubmit={handleSubmitLogin}>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoggingIn}
                  placeholder="Masukkan Username..."
                  className="mt-[15px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="relative mt-[15px]">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    placeholder="Masukkan Password..."
                    className="block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <FaEye size={20} />
                    ) : (
                      <FaEyeSlash size={20} />
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <p className="mt-[10px] text-sm text-red-500">
                    {errorMessage}
                  </p>
                )}

                {/* CAPTCHA */}
                <div className="mt-[15px]">
                  <div className="mt-2 flex items-center">
                    {captchaURL && (
                      <Image
                        src={captchaURL}
                        alt="captcha"
                        width={240}
                        height={80}
                        unoptimized
                      />
                    )}
                    <div className="group relative inline-block">
                      <button
                        type="button"
                        onClick={fetchCaptcha}
                        disabled={isRefreshing || isLoggingIn}
                        className="ml-2 rounded-full bg-blue-100 p-2.5 text-blue-600 shadow-md transition-all duration-300 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Refresh captcha"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform ${isRefreshing ? "animate-spin" : "hover:rotate-90"}`}
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                      </button>
                      <div className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 scale-0 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                        Refresh Captcha
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    placeholder="Masukkan CAPTCHA..."
                    className="mt-[10px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-[#1D92F9] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <span className="float-right mt-[20px] mb-2 font-poppins text-[#1D92F9] hover:text-[#0C479F] md:text-[15px] lg:text-[16px]">
                    <Link href={`lupa-password`}>Lupa Password?</Link>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-[20px] w-full rounded-[7px] bg-[#0C479F] font-poppins font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:py-[16px] lg:py-[16px] lg:text-[16px] xl:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoggingIn ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sedang Masuk...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </form>
            </section>
          </div>
        </div>

        <motion.div
          className="margin absolute right-0 top-0 z-[1] overflow-hidden"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            className="pointer-events-none relative top-0 max-h-full max-w-full select-none object-cover md:right-[-50px] md:top-[-60px] lg:right-[-10px] lg:top-[-50px]"
            src={Background1}
            alt=""
            priority
          />
        </motion.div>

        {/* Floating Guide Button */}
        <div className="fixed bottom-6 right-[70px] z-50">
          <button
            onClick={() => setShowGuidePopup(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:bg-green-600 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
            aria-label="Panduan Penggunaan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap">
              Panduan Penggunaan
            </div>
          </button>
        </div>

        {/* Guide Popup - UPDATED */}
        {showGuidePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-sm w-full mx-4 rounded-lg bg-white p-6 text-center shadow-lg"
            >
              {/* Gambar Manual Book - sekarang button untuk download */}
              <button
                onClick={downloadManualBook}
                disabled={isDownloading}
                className="relative w-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image
                  src="https://storage.googleapis.com/fastwork-static/d4d162c2-2ab3-4414-9827-4663627c807e.jpg"
                  alt="Manual Book"
                  width={150}
                  height={150}
                  className="mx-auto h-auto w-full cursor-pointer transition-all duration-200 group-hover:opacity-80 rounded-lg group-hover:scale-105"
                />
                {/* Overlay download icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg">
                  {isDownloading ? (
                    <svg
                      className="animate-spin h-8 w-8 text-white opacity-0 group-hover:opacity-100"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <FaDownload className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </div>
              </button>

              <p className="mb-4 mt-4 text-center text-sm font-medium text-gray-700">
                {isDownloading 
                  ? "Sedang mendownload manual book..." 
                  : "Klik gambar untuk mendownload Manual Book"
                }
              </p>
              
              <button
                onClick={() => setShowGuidePopup(false)}
                disabled={isDownloading}
                className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default SectionRight;