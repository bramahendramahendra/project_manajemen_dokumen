"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import FormAddPage from "@/components/masterDinas/formAddPage";

const AddPage = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Master Dinas", href: "/master_dinas" },
    { name: "Tambah Dinas" },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <FormAddPage />
        </div>
      </div>
    </>
  );
};

export default AddPage;
