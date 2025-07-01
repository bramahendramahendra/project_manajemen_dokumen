import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Setting Subperihal",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}