import { Metadata } from "next";

const formatTitle = (text: string) => {
  return text
    .replace(/-/g, " ") 
    .replace(/\b\w/g, (char) => char.toUpperCase()); 
};

export async function generateMetadata({
  params,
}: {
  params: { skpd: string };
}): Promise<Metadata> {
  const skpd = formatTitle(params.skpd);
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
