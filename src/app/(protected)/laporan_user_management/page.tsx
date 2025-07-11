import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
// import MainPage from "@/components/settingSubjenis";
import TablePage from "@/components/laporan_user_management/tablePage";

export const metadata: Metadata = {
    title: "Laporan User Manajemen",
    // description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const LaporanUserManagement = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan User Manajemen"},
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <TablePage />
      </div>
    </>
    // </DefaultLayout>
  );
};

export default LaporanUserManagement;