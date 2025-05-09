import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unduh Dokumen",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
