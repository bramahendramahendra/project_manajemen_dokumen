import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kotak Masuk",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
