// import { Metadata } from "next";
// import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/validationUpload";

const ValidationUpload = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Validation Upload"},
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <MainPage />
      </div>
    </>
    // </DefaultLayout>
  );
};

export default ValidationUpload;