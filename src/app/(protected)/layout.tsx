// src/app/(protected)/layout.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TokenRefresher from '@/components/common/TokenRefresher';
import Cookies from 'js-cookie';

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

  return (
    <>
      {/* TokenRefresher untuk auto refresh token */}
      <TokenRefresher />
      
      {/* Render children (konten halaman) */}
      {children}
    </>
  );
}