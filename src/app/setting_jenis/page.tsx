import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/settingJenis";
import TablePage from "@/components/settingJenis/tablePage";


export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const SettingJenis = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Setting Jenis"},
  ];
  
  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl">
        <TablePage />
      </div>
    </DefaultLayout>
  );
};

export default SettingJenis;