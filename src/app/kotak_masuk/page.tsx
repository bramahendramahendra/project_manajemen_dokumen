import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
// import MainPage from "@/components/settingSubjenis";
import TablePage from "@/components/laporan_dokumen/tablePage";

export const metadata: Metadata = {
    title: "Kotak Masuk",
    // description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};


const KotakMasuk = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Kotak Masuk"},
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl">
        {/* <MainPage /> */}
      </div>
    </DefaultLayout>
  );
};

export default KotakMasuk;