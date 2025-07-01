import { Metadata } from "next";
import Breadcrumb from "@/components/breadcrumbs";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import LaporanDokumenInstansiIndex from "@/components/laporan_dokumen/detail_laporan_dokumen/";

const formatTitle = (text: string) => {
  return text
    .replace(/-/g, " ") // Ganti '-' dengan spasi
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Ubah huruf pertama setiap kata menjadi kapital
};

export async function generateMetadata({ params }: { params: { namaDokumen: string } }): Promise<Metadata> {
  const detailUraian = formatTitle(params.namaDokumen || "");
  return {
    title: `Laporan Dokumen - ${detailUraian}`,
  };
}

const LaporanDokumenInstansi = ({ params }: { params: { namaDokumen: string } }) => {
  const detailUraianString = formatTitle(params.namaDokumen || "");

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Dokumen", href: "/laporan_dokumen" },
    { name: detailUraianString || "Detail Laporan Dokumen" },
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <LaporanDokumenInstansiIndex />
    </>
    // </DefaultLayout>
  );
};

export default LaporanDokumenInstansi;
