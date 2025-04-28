import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setting Dinas",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
