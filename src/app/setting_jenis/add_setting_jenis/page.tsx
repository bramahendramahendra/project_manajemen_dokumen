"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TableAllUser from "@/components/userManagement/tableAllUser";
import UserStats from "@/components/userManagement/userStats";
import TopUser from "@/components/userManagement/topUser";

import { HiPlus } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import FormAddPage from "@/components/settingJenis/formAddPage";

const AddPage = () => {
  const Router = useRouter();
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Setting Jenis", href: "/setting_jenis" },
    { name: "Tambah Jenis" },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <FormAddPage />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddPage;
