"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TokenRefresher from '@/components/common/TokenRefresher';
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

  return (
    <MenuProvider>
      {/* <ToastProvider> */}
      {/* TokenRefresher untuk auto refresh token */}
      <TokenRefresher />
      
      {/* Render children (konten halaman) */}
      <DefaultLayout>
        {children}
      </DefaultLayout>
      
      {/* </ToastProvider> */}
    </MenuProvider>
  );
}