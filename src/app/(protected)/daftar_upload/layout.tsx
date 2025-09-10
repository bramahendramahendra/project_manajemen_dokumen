import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Upload",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
