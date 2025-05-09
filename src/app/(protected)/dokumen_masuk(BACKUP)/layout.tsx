import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumen Masuk",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
