import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengiriman Langsung Pengawas",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
