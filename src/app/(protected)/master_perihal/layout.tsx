import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Perihal",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
