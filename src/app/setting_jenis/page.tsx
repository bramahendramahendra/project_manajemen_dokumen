import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/settingJenis";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const SettingJenis = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Setting Jenis" />
      <div className="mx-auto max-w-7xl">
        <MainPage />
      </div>
    </DefaultLayout>
  );
};

export default SettingJenis;