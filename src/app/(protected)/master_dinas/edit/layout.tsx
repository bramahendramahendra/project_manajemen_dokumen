import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Master Dinas",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}