import { Metadata } from "next";

const formatTitle = (text: string) => {
  return text
    .replace(/-/g, " ") // Ganti '-' dengan spasi
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Ubah huruf pertama setiap kata menjadi kapital
};

export async function generateMetadata({ 
  params
}: { 
  params: { namaPergeseran: string }; 
}): Promise<Metadata> {
  const detailUraian = formatTitle(params.namaPergeseran || "");
  return {
    title: `Laporan Pergeseran - ${detailUraian}`,
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
