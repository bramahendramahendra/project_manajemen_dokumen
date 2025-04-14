import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Menu",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
