"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TableAllUser from "@/components/userManagement/tableAllUser";
import UserStats from "@/components/userManagement/userStats";
import TopUser from "@/components/userManagement/topUser";
import { HiPlus } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const UserManagement = () => {
  const Router = useRouter();
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "User Management"},
  ];  

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="mb-6 grid grid-cols-12">
        <button
          onClick={() => Router.push('user_management/add_user')}
          className="active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11"
        >
          <div className="flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]">
            <span>
              <HiPlus />
            </span>
            <span>Tambah User</span>
          </div>
        </button>
        
      </div>
      <div className="grid grid-cols-12 gap-4  md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <TableAllUser />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UserManagement;
