import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/profile"
// import MainPage from "@/components/settingSubjenis";
// import TablePage from "@/components/laporan_dokumen/tablePage";
// import MainPage from "@/components/pesanMasuk";

export const metadata: Metadata = {
    title: "Profile",
};


const KotakMasuk = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Profile"},
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="gap-4 md:gap-6 2xl:gap-7.5">
        <MainPage />
      </div>
    </>
    // </DefaultLayout>
  );
};

export default KotakMasuk;