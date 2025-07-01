"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TableAllUser from "@/components/userManagement";
import UserStats from "@/components/userManagement/userStats";
import TopUser from "@/components/userManagement/topUser";

import { HiPlus } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import FormAddUser from "@/components/userManagement/formAddUser";

const AddUser = () => {
  const Router = useRouter();
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "User Management", href: "/user_management" },
    { name: "Tambah User" },
  ];

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      {/* <div className="mb-6 grid grid-cols-12">
        <div className="2xsm:col-span-12 2xsm:mb-2 md:col-span-9 md:mb-0 lg:col-span-9 xl:col-span-12">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            
          </h2>
          <span>asd</span>
        </div>
      </div> */}

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <FormAddUser />

        </div>
        
        {/* <div className="col-span-12 xl:col-span-6"> */}

        {/* </div> */}
      </div>
    </>
    // </DefaultLayout>
  );
};

export default AddUser;
