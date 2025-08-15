// File: src\components\LupaPassword\SectionLupaPassword.tsx
import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { lupaPassRequest } from "@/helpers/apiClient";

const SectionLupaPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await lupaPassRequest(`/auths/lupa-pass/${username}`, 'POST');

      if (response.ok) {
        setSuccess(true);
        setUsername('');
      } else {
        const result = await response.json();
        // Perbaikan pesan error yang lebih spesifik untuk lupa password
        if (result.responseDesc && result.responseDesc.includes('tidak ditemukan')) {
          setError('Username tidak ditemukan. Pastikan username yang dimasukkan benar.');
        } else {
          setError(result.message || result.responseDesc || 'Terjadi kesalahan saat memproses permintaan lupa password');
        }
      }
    } catch (error: any) {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <>
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] mt-[250px] md:mt-[220px] md:px-12 lg:mt-[230px] lg:px-[100px] xl:mt-[250px] xl:px-[120px] 2xl:px-[200px]">
          
          {/* Tombol Back */}
          <div className="mb-4">
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 rounded-[7px] bg-gray-100 px-4 py-2 font-inter text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Kembali ke Login
            </button>
          </div>

          <div className="font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
            Jika Lupa Password Sipaduke
          </div>
          <div className="pt-1 font-inter font-normal leading-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
            Silahkan inputkan Username anda
          </div>
          <section>
            <form onSubmit={handleSubmitLogin}>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Masukkan Username..."
                className="mt-[15px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-[10px] w-full rounded-[7px] bg-[#0C479F] font-poppins font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:py-[16px] lg:py-[16px] lg:text-[16px] xl:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
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
                    Melaporkan...
                  </>
                ) : (
                  'Lapor Admin'
                )}
              </button>

              {/* Error and Success Messages */}
              {error && (
                <div className="mt-3 rounded-[7px] bg-red-50 p-3 border border-red-200">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="mt-3 rounded-[7px] bg-green-50 p-3 border border-green-200">
                  <p className="text-green-600 text-sm font-medium">
                    Berhasil melaporkan ke Admin! 
                    <br />
                    <span className="text-green-500 text-xs">
                      Silakan tunggu konfirmasi dari admin atau hubungi admin secara langsung.
                    </span>
                  </p>
                </div>
              )}  
            </form>
          </section>
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
      </div>
    </>
  );
};

export default SectionLupaPassword;