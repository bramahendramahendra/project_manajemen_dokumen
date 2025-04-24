import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Setting Dinas",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
