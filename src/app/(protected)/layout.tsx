// src/app/(protected)/layout.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TokenRefresher from '@/components/common/TokenRefresher';
import RouteGuard from '@/components/common/RouteGuard';
import Cookies from 'js-cookie';
import { initNotificationManager } from "@/utils/notificationManager";
// import { ToastProvider } from "@/components/Toast";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { MenuProvider } from "@/contexts/MenuContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

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
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    initNotificationManager();
  }, []);

  // Cek apakah halaman current termasuk public page
  const isPublicPage = publicProtectedPages.includes(pathname);

  return (
    <MenuProvider>
      {/* <ToastProvider> */}
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
      
      {/* </ToastProvider> */}
    </MenuProvider>
  );
}