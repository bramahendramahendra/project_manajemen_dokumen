import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail User Management",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}