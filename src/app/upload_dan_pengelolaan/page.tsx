import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/uploadDanPengelolaan";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const UploadDanPengelolaan = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Upload Dan Pengelolaan" />
      <div className="mx-auto max-w-7xl">
        <MainPage />
      </div>
    </DefaultLayout>
  );
};

export default UploadDanPengelolaan;