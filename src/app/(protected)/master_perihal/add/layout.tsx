import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Master Perihal",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
