"use client";
import { useState, useEffect, ReactNode } from "react";
import Loader from "@/components/common/Loader";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <Loader />;
  return <>{children}</>;
}
