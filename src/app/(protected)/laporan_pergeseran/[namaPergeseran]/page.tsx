import { Metadata } from "next";
import Breadcrumb from "@/components/breadcrumbs";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import LaporanPergeseranInstansiIndex from "@/components/laporan_pergeseran/detail_laporan_pergeseran/";

const formatTitle = (text: string) => {
  return text
    .replace(/-/g, " ") // Ganti '-' dengan spasi
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Ubah huruf pertama setiap kata menjadi kapital
};

export async function generateMetadata({ params }: { params: { namaPergeseran: string } }): Promise<Metadata> {
  const detailUraian = formatTitle(params.namaPergeseran || "");
  return {
    title: `Laporan Dokumen - ${detailUraian}`,
  };
}

const LaporanPergeseranInstansi = ({ params }: { params: { namaPergeseran: string } }) => {
  const detailUraianString = formatTitle(params.namaPergeseran || "");

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Pergeseran", href: "/laporan_pergeseran" },
    { name: detailUraianString || "Detail Laporan Pergeseran" },
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <LaporanPergeseranInstansiIndex />
    </>
    // </DefaultLayout>
  );
};

export default LaporanPergeseranInstansi;