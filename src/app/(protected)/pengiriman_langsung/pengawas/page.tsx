"use client"
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import MainPage from "@/components/pengirimanLangsung/FormPengirimanLangsungPengawas";

import Breadcrumb from "@/components/breadcrumbs";
// import MainPage from "@/components/settingSubjenis";

// export const metadata: Metadata = {
//     title: "Titel Tab",
//     description: "This is Next.js Home page for NextAdmin Dashboard Kit",
// };

const PengirimanLangsungPengawas = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Pengiriman Langsung Pengawas"},
  ];

  return (
    <DefaultLayout>
        <Breadcrumb breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <MainPage />
        </div>
    </DefaultLayout>
  );
};

export default PengirimanLangsungPengawas;