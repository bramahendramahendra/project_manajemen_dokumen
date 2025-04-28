import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { dokumen_masuk_namaOrang: string };
}): Promise<Metadata> {
  const decodedName = decodeURIComponent(params.dokumen_masuk_namaOrang);
  return {
    title: `Dokumen Masuk - ${decodedName}`,
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
