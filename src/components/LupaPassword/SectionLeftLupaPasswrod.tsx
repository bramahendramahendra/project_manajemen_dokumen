import Image from "next/image";
import Background1 from "../../../public/assets/login-left2.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { lupaPassRequest } from "@/helpers/apiClient";

const SectionLeftLupaPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  
  const router = useRouter();

  const handleSubmitLupaPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await lupaPassRequest(`/auths/lupa-pass/${username}`, 'PUT');

      if (response.ok) {
        setSuccess(true);
        setUsername('');
      } else {
        const result = await response.json();
        setError(result.message || 'Terjadi kesalahan saat menambahkan user');
      }
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
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

        {/* Form Mobile untuk Lupa Password */}
        <div className="pt-[40px] sm:block md:hidden">
          <motion.div
            className="rounded-[8px] bg-white p-[15px] shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {/* Tombol Back Mobile */}
            <div className="mb-3">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 rounded-[7px] bg-gray-100 px-3 py-2 font-inter text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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

            <div className="font-poppins text-[20px] font-bold leading-none text-[#1D92F9]">
              Jika Lupa Password Sipaduke
            </div>
            <div className="mt-2 font-inter text-[14px] font-normal leading-none text-[#0C479F]">
              Silahkan inputkan Username anda
            </div>
            <section>
              <form onSubmit={handleSubmitLupaPassword}>
                <input
                  id="mobileUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Masukkan Username..."
                  className="mt-[15px] block w-full rounded-[7px] border-0 px-[15px] py-[15px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-[10px] w-full rounded-[7px] bg-[#0C479F] py-[10px] font-poppins text-[14px] font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
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
                      Melaporkan...
                    </>
                  ) : (
                    "Lapor Admin"
                  )}
                </button>

                {/* Error and Success Messages Mobile */}
                {error && (
                  <div className="mt-3 rounded-[7px] bg-red-50 p-2 border border-red-200">
                    <p className="text-red-600 text-xs font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mt-3 rounded-[7px] bg-green-50 p-2 border border-green-200">
                    <p className="text-green-600 text-xs font-medium">
                      Berhasil melaporkan ke Admin! 
                      <br />
                      <span className="text-green-500 text-xs">
                        Silakan tunggu konfirmasi dari admin.
                      </span>
                    </p>
                  </div>
                )}  
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

export default SectionLeftLupaPassword;