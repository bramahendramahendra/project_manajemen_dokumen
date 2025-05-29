"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// SVG Pattern Component dengan warna yang konsisten
const DotPatternBackground = () => (
  <div className="absolute inset-0 opacity-30">
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <pattern 
          id="dot-pattern" 
          x="0" 
          y="0" 
          width="60" 
          height="60" 
          patternUnits="userSpaceOnUse"
        >
          <circle cx="30" cy="30" r="1" fill="#0C479F" fillOpacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  </div>
);

const UnauthorizedPage = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Animated Background - Menggunakan blue theme konsisten */}
      <div className="absolute inset-0">
        {/* Gradient Orbs dengan warna blue theme */}
        <div 
          className="absolute w-96 h-96 bg-[#0C479F]/10 rounded-full blur-3xl animate-pulse"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-[#1D92F9]/8 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            top: '60%',
            right: '10%',
            transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            bottom: '20%',
            left: '30%',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          }}
        />
        
        {/* Grid Pattern */}
        <DotPatternBackground />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div 
          className={`text-center max-w-2xl mx-auto transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Card dengan warna konsisten */}
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-500/10">
            {/* Animated Lock Icon dengan blue theme */}
            <div className="mb-8 relative">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[#0C479F] to-[#1D92F9] rounded-full mb-6 shadow-2xl shadow-blue-500/25 transform hover:scale-110 transition-transform duration-300">
                <div className="relative">
                  {/* Lock Icon dengan animasi */}
                  <svg
                    className="w-16 h-16 text-white animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2M7 13h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z"
                    />
                  </svg>
                  
                  {/* Glowing Ring dengan warna blue */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-300/50 animate-ping" />
                </div>
              </div>
              
              {/* Floating Elements dengan accent colors konsisten */}
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-[#1D92F9] rounded-full animate-pulse opacity-80" />
              <div className="absolute -bottom-2 -left-4 w-4 h-4 bg-[#0C479F] rounded-full animate-pulse delay-500 opacity-60" />
              <div className="absolute top-8 -left-8 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-1000 opacity-70" />
            </div>

            {/* Error Message dengan gradient konsisten */}
            <div className="mb-10">
              <div className="relative mb-6">
                <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-[#0C479F] via-[#1D92F9] to-blue-600 bg-clip-text text-transparent animate-pulse">
                  403
                </h1>
                <div className="absolute inset-0 text-8xl md:text-9xl font-black text-gray-200/20 blur-sm">
                  403
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
                Akses Ditolak
              </h2>
              
              <div className="space-y-3 text-gray-600">
                <p className="text-lg md:text-xl leading-relaxed">
                  Whoops! Sepertinya Anda tersesat di area terlarang 🚫
                </p>
                <p className="text-base opacity-80">
                  Halaman ini memerlukan izin khusus yang tidak Anda miliki saat ini.
                </p>
              </div>
            </div>

            {/* Action Buttons dengan warna konsisten */}
            <div className="space-y-4 mb-8">
              <button
                onClick={() => router.back()}
                className="group relative w-full md:w-auto px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Kembali ke Halaman Sebelumnya</span>
                </div>
              </button>
              
              <Link
                href="/dashboard"
                className="group relative block w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#0C479F] to-[#1D92F9] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1775C7] to-[#0C479F] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Pergi ke Dashboard</span>
                </div>
              </Link>
            </div>

            {/* Info Card dengan blue theme konsisten */}
            <div className="relative bg-gradient-to-r from-blue-50 to-[#1D92F9]/5 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1D92F9] to-[#0C479F] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-[#0C479F] font-semibold text-lg mb-2">
                    💡 Informasi
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Akses dibatasi berdasarkan level pengguna Anda. Hubungi administrator 
                    atau coba login dengan akun yang memiliki akses yang sesuai.
                  </p>
                </div>
              </div>
              
              {/* Decorative elements dengan warna konsisten */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#1D92F9] rounded-full animate-ping opacity-60" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#0C479F] rounded-full animate-pulse delay-700 opacity-40" />
            </div>
          </div>

          {/* Additional Floating Elements dengan blue theme */}
          <div className="absolute -z-10 inset-0">
            <div className="absolute top-1/4 left-10 w-2 h-2 bg-[#1D92F9] rounded-full animate-pulse opacity-60" />
            <div className="absolute top-3/4 right-16 w-3 h-3 bg-[#0C479F] rounded-full animate-bounce delay-300 opacity-50" />
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-1000 opacity-70" />
            <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500 opacity-40" />
          </div>
        </div>
      </div>

      {/* Bottom Wave Effect dengan warna konsisten */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24 text-gray-200/20"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,120 C150,100 350,0 600,20 C850,40 1050,120 1200,100 L1200,120 Z"
            fill="currentColor"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default UnauthorizedPage;