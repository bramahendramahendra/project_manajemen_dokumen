import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
// import MainPage from "@/components/settingSubjenis";
import TablePage from "@/components/laporan_dokumen/tablePage";
import MainPage from "@/components/pesanMasuk";

export const metadata: Metadata = {
    title: "Kotak Masuk",
    // description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};


const KotakMasuk = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Pesan Masuk"},
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* <MainPage /> */}
        <MainPage/>
      </div>
    </DefaultLayout>
  );
};

export default KotakMasuk;