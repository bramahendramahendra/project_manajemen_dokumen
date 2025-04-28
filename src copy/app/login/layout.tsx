import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";

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

export const metadata: Metadata = {
  title: "Sipaduke - Login",
  description:
    "menertibkan dan mengarsipkan dokumen kamu bisa lakukan login terlebih dahulu",
  themeColor: "#0C479F",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`body-login relative bg-white`}>{children}</div>;
}
