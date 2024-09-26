import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/unduhDokumen";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const UnduhDokumen = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Unduh Dokumen" />
      <div className="col-span-12 xl:col-span-12">
        <MainPage />
      </div>
    </DefaultLayout>
  );
};

export default UnduhDokumen;