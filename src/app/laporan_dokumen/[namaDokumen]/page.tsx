import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TablePage from "@/components/laporan_dokumen_management/tablePage";

export const metadata: Metadata = {
  title: "Laporan Dokumen Manajemen",
};

const LaporanDokumen = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Dokumen Menajemen" },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <TablePage />
      </div>
    </DefaultLayout>
  );
  
};

export default LaporanDokumen;
