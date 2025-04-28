"use client";
import "@/css/satoshi.css";
import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/login") {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    } else {
      setLoading(false);
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${poppins.variable}`}
      >
        {loading ? <Loader /> : children}
      </body>
    </html>
  );
}
