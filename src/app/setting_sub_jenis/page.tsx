import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/settingSubJenis";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const SettingSubJenis = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Setting Sub Jenis" />
      <div className="mx-auto max-w-7xl">
        <MainPage />
      </div>
    </DefaultLayout>
  );
};

export default SettingSubJenis;