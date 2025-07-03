import Image from "next/image";
import Background1 from "../../../public/assets/login-left2.svg";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Cookies from "js-cookie";
import { loginRequest, apiRequest } from "@/helpers/apiClient";
import { useMenu } from "@/contexts/MenuContext";

const SectionLeft = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // State untuk CAPTCHA
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaID, setCaptchaID] = useState<string>("");
  const [captchaURL, setCaptchaURL] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  
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
      <div className="relative z-[2] mt-[100px] 2xsm:mx-[32px] md:mx-[30px] lg:mx-[58px]">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-poppins text-[42px] font-bold leading-[15px] text-white 2xsm:text-[28px] xl:text-[42px]">
            Sipaduke
            <span className="ml-1 font-poppins text-[72px] text-[#1D92F9]">
              .
            </span>
          </h1>
          <h2 className="pt-4 font-poppins text-white 2xsm:pt-2 2xsm:text-[15px] 2xsm:font-medium md:pr-7 md:text-[14px] lg:text-[14px] lg:font-bold xl:pt-4 xl:text-[21px]">
            Sistem Penyimpanan Dokumen Keuangan Daerah{" "}
          </h2>
        </motion.div>

        <div className="pt-[40px] sm:block md:hidden">
          <motion.div
            className="rounded-[8px] bg-white p-[15px] shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="font-poppins text-[20px] font-bold leading-none text-[#1D92F9]">
              Masuk ke dalam Sipaduke
            </div>
            <div className="mt-2 font-inter text-[14px] font-normal leading-none text-[#0C479F]">
              Silahkan masuk untuk melakukan aktifitas anda
            </div>
            <section>
              <form onSubmit={handleSubmitLogin}>
                <input
                  id="mobileUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoggingIn}
                  placeholder="Masukkan Username..."
                  className="mt-[15px] block w-full rounded-[7px] border-0 px-[15px] py-[15px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="relative mt-[15px]">
                  <input
                    id="mobilePassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoggingIn}
                    placeholder="Masukkan Password..."
                    className="block w-full rounded-[7px] border-0 px-[15px] py-[15px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <p className="mt-[10px] text-sm text-red-500">
                    {errorMessage}
                  </p>
                )}

                {/* CAPTCHA Section */}
                <div className="mt-[15px]">
                  <div className="mt-2 flex items-center">
                    {captchaURL && (
                      <Image
                        src={captchaURL}
                        alt="captcha"
                        width={200}
                        height={60}
                        unoptimized
                        className="rounded border"
                      />
                    )}
                    <div className="group relative inline-block">
                      <button
                        type="button"
                        onClick={fetchCaptcha}
                        disabled={isRefreshing || isLoggingIn}
                        className="ml-2 rounded-full bg-blue-100 p-2 text-blue-600 shadow-md transition-all duration-300 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label="Refresh captcha"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
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
                    className="mt-[10px] block w-full rounded-[7px] border-0 px-[15px] py-[15px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="mt-[20px] w-full text-right font-poppins text-[14px] text-[#1D92F9] hover:text-[#0C479F]">
                    <Link href={`lupa-password`}>Lupa Password?</Link>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-[10px] w-full rounded-[7px] bg-[#0C479F] py-[10px] font-poppins text-[14px] font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoggingIn ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
          </motion.div>
        </div>
      </div>
      <motion.div
        className="absolute bottom-[0px] left-[0px] z-[1] block overflow-hidden sm:block md:block lg:block lg:w-[98%] xl:block xl:w-[80%] 2xl:w-[100%]"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          className="pointer-events-none relative max-h-full max-w-full select-none object-contain"
          src={Background1}
          alt=""
          priority
        />
      </motion.div>
    </>
  );
};

export default SectionLeft;