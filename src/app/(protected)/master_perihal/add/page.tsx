"use client";
import Breadcrumb from "@/components/breadcrumbs";
import FormAddPage from "@/components/masterPerihal/formAddPage";

const AddPage = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Master Perihal", href: "/master_perihal" },
    { name: "Tambah Perihal" },
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
