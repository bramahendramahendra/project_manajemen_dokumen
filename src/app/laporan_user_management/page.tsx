import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/settingSubjenis";
import TablePage from "@/components/laporan_user_management/tablePage";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const PengirimanLangsung = () => {
  return (
    <DefaultLayout>
        <Breadcrumb pageName="Laporan User Management" />
      <div className="mx-auto max-w-7xl">
        <TablePage />
      </div>
    </DefaultLayout>
  );
};

export default PengirimanLangsung;