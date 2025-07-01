import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload & Pengelolaan",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
