"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TokenRefresher from '@/components/common/TokenRefresher';
import RouteGuard from '@/components/common/RouteGuard';
import Cookies from 'js-cookie';
import { initNotificationManager, closeNotificationConnection } from "@/utils/notificationManager";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { MenuProvider } from "@/contexts/MenuContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  // List halaman yang tidak perlu route protection (public dalam protected area)
  const publicProtectedPages = [
    '/dashboard', 
    '/unauthorized',
    '/profile', // jika ada halaman profile
    // tambahkan halaman lain yang bisa diakses semua role
  ];

  // Periksa apakah user sudah login
  useEffect(() => {
    const user = Cookies.get('user');
    if (!user) {
      // console.log('No user found, redirecting to login...');
      router.push('/login2');
    } else {
      setIsInitialized(true);
    }
  }, [router]);

  // Initialize notification manager setelah user terverifikasi
  useEffect(() => {
    if (isInitialized) {
      // console.log('Initializing notification manager in protected layout...');
      
      // Delay initialization sedikit untuk memastikan semua komponen sudah ready
      const initTimeout = setTimeout(() => {
        try {
          initNotificationManager();
        } catch (error) {
          console.error('Error initializing notification manager:', error);
        }
      }, 1000);

      // Cleanup saat component unmount atau user logout
      return () => {
        clearTimeout(initTimeout);
        // console.log('Cleaning up notification manager...');
        try {
          closeNotificationConnection();
        } catch (error) {
          console.error('Error closing notification connection:', error);
        }
      };
    }
  }, [isInitialized]);

  // Listen for user changes (logout)
  useEffect(() => {
    const checkUserStatus = () => {
      const user = Cookies.get('user');
      if (!user && isInitialized) {
        // console.log('User logged out, cleaning up...');
        setIsInitialized(false);
        closeNotificationConnection();
        router.push('/login3');
      }
    };

    // Check every 5 seconds for user status
    const interval = setInterval(checkUserStatus, 5000);

    return () => clearInterval(interval);
  }, [isInitialized, router]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isInitialized) {
        // console.log('Page became visible, checking notification connection...');
        // Notification manager akan handle reconnection otomatis
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialized]);

  // Cek apakah halaman current termasuk public page
  const isPublicPage = publicProtectedPages.includes(pathname);

  // Don't render anything until initialization check is complete
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MenuProvider>
      {/* TokenRefresher untuk auto refresh token */}
      <TokenRefresher />
      
      {/* Render children dengan atau tanpa RouteGuard */}
      <DefaultLayout>
        {isPublicPage ? (
          // Halaman public tidak perlu route guard
          children
        ) : (
          // Halaman yang memerlukan akses khusus menggunakan route guard
          <RouteGuard>
            {children}
          </RouteGuard>
        )}
      </DefaultLayout>
    </MenuProvider>
  );
}