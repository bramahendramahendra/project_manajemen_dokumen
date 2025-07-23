import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import Cookies from "js-cookie";
import { loginRequest, apiRequest } from "@/helpers/apiClient"; // Import apiRequest
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useMenu } from "@/contexts/MenuContext";

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
        localStorage.setItem('lastLoginTime', Date.now().toString());

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

        {/* Guide Popup */}
        {showGuidePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-sm w-full mx-4 rounded-lg bg-white p-6 text-center shadow-lg"
            >
              {/* Tombol silang (X) */}
              {/* <button
                onClick={() => setShowGuidePopup(false)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes size={20} />
              </button> */}

              <Link href="/guide_book" onClick={() => setShowGuidePopup(false)}>
                <Image
                  src="https://storage.googleapis.com/fastwork-static/d4d162c2-2ab3-4414-9827-4663627c807e.jpg"
                  alt="Guide Book"
                  width={150}
                  height={150}
                  className="mx-auto h-auto w-full cursor-pointer transition-opacity duration-200 hover:opacity-80 rounded-lg"
                />
              </Link>
              <p className="mb-4 mt-4 text-center text-sm font-medium text-gray-700">
                Panduan Lengkap Penggunaan Sipaduke
              </p>
              
              <button
                onClick={() => setShowGuidePopup(false)}
                className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 transition-colors duration-200"
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