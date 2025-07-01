import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
// import MainPage from "@/components/settingSubjenis";
import TablePage from "@/components/laporan_dokumen/tablePage";
import MainPage from "@/components/dokumen_masuk";

export const metadata: Metadata = {
    title: "Pesan Masuk",
    // description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};


const DokumenMasuk = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Dokumen Masuk"},
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <MainPage/>
    </>
    // </DefaultLayout>
  );
};

export default DokumenMasuk;