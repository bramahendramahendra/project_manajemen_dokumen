// import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/validationUpload";


// export const metadata: Metadata = {
//     title: "Titel Tab",
//     description: "This is Next.js Home page for NextAdmin Dashboard Kit",
// };

const ValidationUpload = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Validation Upload"},
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl">
        <MainPage />
      </div>
    </DefaultLayout>
  );
};

export default ValidationUpload;