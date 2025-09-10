import { Metadata } from "next";

const formatTitle = (title: string) => {
  return title
    .replace(/-/g, " ") 
    .replace(/\b\w/g, (char) => char.toUpperCase()); 
};

export async function generateMetadata({
  params,
}: {
  params: { dinas: string };
}): Promise<Metadata> {
  const titlePage = formatTitle(params.dinas);
  return {
    title: titlePage ? `Laporan Dokumen - ${titlePage}` : "Laporan Dokumen",
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}