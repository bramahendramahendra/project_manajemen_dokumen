"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Assets
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";

// Hooks
import { useLogin } from "@/hooks/useLogin";
import { useManualBook } from "@/hooks/useManualBook";

// Icons
import { FaEye, FaEyeSlash, FaDownload } from "react-icons/fa";

// Components
import { LoginErrorAlert } from "@/components/alerts/LoginErrorAlert";
import { InputWithError } from "@/components/elements/InputWithError";

const SectionRight = () => {
  // Custom Hooks
  const {
    formState,
    captchaState,
    uiState,
    formErrors,
    updateFormField,
    updateUIState,
    fetchCaptcha,
    handleSubmitLogin,
  } = useLogin();

  const { isDownloading, downloadManualBook } = useManualBook();

  // Load CAPTCHA on mount
  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  // Handle manual book download and close popup
  const handleDownloadAndClose = async () => {
    await downloadManualBook();
    updateUIState('showGuidePopup', false);
  };

  return (
    <>
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] flex h-screen flex-col items-center justify-center px-12 lg:px-[100px] xl:px-[120px] 2xl:px-[150px]">
          <div className="2xl:w-full">
            {/* Header */}
            <div className="w-full font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
              Masuk ke dalam Sipaduke
            </div>
            <div className="w-full pt-1 font-inter font-normal leading-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
              Silahkan masuk untuk melakukan aktifitas anda
            </div>

            {/* Login Form */}
            <section className="w-full">
              <form onSubmit={handleSubmitLogin} noValidate>
                {/* General Error Alert - IMMERSIVE 3D DESIGN */}
                <AnimatePresence mode="wait">
                  {uiState.errorMessage && (
                    <LoginErrorAlert
                      message={uiState.errorMessage}
                      onRetry={uiState.errorMessage.includes('CAPTCHA') ? fetchCaptcha : undefined}
                      onClose={() => updateUIState('errorMessage', null)}
                    />
                  )}
                </AnimatePresence>
                
                {/* Username Input */}
                <div className="mt-[15px]">
                  <InputWithError
                    id="username"
                    type="text"
                    value={formState.username}
                    onChange={(e) => updateFormField('username', e.target.value)}
                    disabled={uiState.isLoggingIn}
                    placeholder="Masukkan Username..."
                    autoComplete="username"
                    error={formErrors.username}
                  />
                </div>

                {/* Password Input */}
                <div className="mt-[15px]">
                  <InputWithError
                    id="password"
                    type={uiState.showPassword ? "text" : "password"}
                    value={formState.password}
                    onChange={(e) => updateFormField('password', e.target.value)}
                    disabled={uiState.isLoggingIn}
                    placeholder="Masukkan Password..."
                    autoComplete="current-password"
                    error={formErrors.password}
                    icon={
                      <button
                        type="button"
                        onClick={() => updateUIState('showPassword', !uiState.showPassword)}
                        disabled={uiState.isLoggingIn}
                        tabIndex={-1}
                        className="text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
                        aria-label={uiState.showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {uiState.showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                      </button>
                    }
                  />
                </div>

                {/* CAPTCHA Section */}
                <div className="mt-[15px]">
                  <div className="mt-2 flex items-center gap-2">
                    {/* CAPTCHA Image */}
                    {captchaState.url ? (
                      <div className="flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
                        <Image
                          src={captchaState.url}
                          alt="captcha"
                          width={240}
                          height={80}
                          unoptimized
                          priority
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[80px] w-[240px] flex-shrink-0 items-center justify-center rounded-lg border-2 border-gray-200 bg-gray-50">
                        <div className="animate-pulse">
                          <span className="text-xs text-gray-400">Memuat CAPTCHA...</span>
                        </div>
                      </div>
                    )}

                    {/* Refresh CAPTCHA Button */}
                    <div className="group relative inline-block">
                      <button
                        type="button"
                        onClick={() => fetchCaptcha(true)}
                        disabled={uiState.isRefreshing || uiState.isLoggingIn}
                        className="rounded-full bg-blue-100 p-2.5 text-blue-600 shadow-md transition-all duration-300 hover:bg-blue-200 hover:text-blue-800 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
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
                          className={`transition-transform duration-500 ${
                            uiState.isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                          }`}
                        >
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                      </button>
                      <div className="absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 scale-0 rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap">
                        Refresh Captcha
                      </div>
                    </div>
                  </div>

                  {/* CAPTCHA Input */}
                  <div className="mt-[10px]">
                    <InputWithError
                      id="captcha"
                      name="captcha"
                      type="text"
                      value={formState.captchaInput}
                      onChange={(e) => updateFormField('captchaInput', e.target.value)}
                      disabled={uiState.isLoggingIn || uiState.isRefreshing}
                      placeholder="Masukkan CAPTCHA..."
                      autoComplete="off"
                      error={formErrors.captchaInput}
                    />
                  </div>
                </div>

                {/* Lupa Password Link */}
                <div>
                  <span className="float-right mt-[20px] mb-2 font-poppins text-[#1D92F9] hover:text-[#0C479F] transition-colors duration-200 md:text-[15px] lg:text-[16px]">
                    <Link href="/lupa-password">Lupa Password?</Link>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uiState.isLoggingIn || uiState.isRefreshing}
                  className="mt-[20px] w-full rounded-[7px] bg-[#0C479F] font-poppins font-normal text-white shadow-sm transition-all hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:py-[16px] lg:py-[16px] lg:text-[16px] xl:text-[16px] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
                >
                  {uiState.isLoggingIn ? (
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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

        {/* Background Image */}
        <motion.div
          className="margin absolute right-0 top-0 z-[1] overflow-hidden"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            className="pointer-events-none relative top-0 max-h-full max-w-full select-none object-cover md:right-[-50px] md:top-[-60px] lg:right-[-10px] lg:top-[-50px]"
            src={Background1}
            alt="Background"
            priority
          />
        </motion.div>

        {/* Floating Guide Button */}
        <div className="fixed bottom-6 right-[70px] z-50">
          <button
            onClick={() => updateUIState('showGuidePopup', true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 active:scale-95"
            style={{
              boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)',
            }}
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
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap shadow-lg">
              Panduan Penggunaan
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
        </div>

        {/* Guide Popup */}
        <AnimatePresence>
          {uiState.showGuidePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => updateUIState('showGuidePopup', false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative max-w-sm w-full mx-4 rounded-2xl bg-white p-6 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => updateUIState('showGuidePopup', false)}
                  disabled={isDownloading}
                  className="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Tutup"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Panduan Penggunaan
                </h3>

                {/* Manual Book Image Button */}
                <button
                  onClick={handleDownloadAndClose}
                  disabled={isDownloading}
                  className="relative w-full group disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl">
                    <Image
                      src="https://storage.googleapis.com/fastwork-static/d4d162c2-2ab3-4414-9827-4663627c807e.jpg"
                      alt="Manual Book"
                      width={400}
                      height={400}
                      className="mx-auto h-auto w-full transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <FaDownload className="h-5 w-5" />
                        <span>Download Manual Book</span>
                      </div>
                    </div>
                    {isDownloading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <svg
                          className="animate-spin h-10 w-10 text-white"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                <p className="text-sm text-gray-600 mb-6">
                  {isDownloading
                    ? "Sedang mengunduh manual book..."
                    : "Klik gambar di atas untuk mengunduh Manual Book dan pelajari cara menggunakan aplikasi"
                  }
                </p>

                {/* Button Tutup */}
                <button
                  onClick={() => updateUIState('showGuidePopup', false)}
                  disabled={isDownloading}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tutup
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SectionRight;