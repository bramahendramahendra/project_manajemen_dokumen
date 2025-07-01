import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Subperihal",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
