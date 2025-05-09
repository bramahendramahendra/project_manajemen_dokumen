import { Metadata } from "next";

const formatSkpdForTitle = (skpd: string) => {
  return skpd
    .replace(/-/g, " ") 
    .replace(/\b\w/g, (char) => char.toUpperCase()); 
};

export async function generateMetadata({
  params,
}: {
  params: { skpd: string };
}): Promise<Metadata> {
  const skpd = formatSkpdForTitle(params.skpd);
  return {
    title: skpd ? `Validation Upload - ${skpd}` : "Validation Upload",
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
