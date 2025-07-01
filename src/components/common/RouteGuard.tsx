// src/components/common/RouteGuard.tsx
"use client";
import React from 'react';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import Loader from '@/components/common/Loader';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { hasAccess, loading, error } = useRouteProtection();

  // Tampilkan loading saat masih mengecek akses
  if (loading) {
    return <Loader />;
  }

  // Jika ada error, tampilkan error message
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error
          </div>
          <div className="text-gray-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Jika punya akses, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Jika tidak punya akses, tidak render apa-apa (akan di-redirect oleh hook)
  return <Loader />;
};

export default RouteGuard;