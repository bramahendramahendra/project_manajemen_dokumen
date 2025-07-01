"use client";
import Breadcrumb from "@/components/breadcrumbs";
import FormAddPage from "@/components/masterSubperihal/formAddPage";

const AddPage = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Master Subperihal", href: "/master_subperihal" },
    { name: "Tambah Subperihal" },
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
