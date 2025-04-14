"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/menu";
import { HiPlus } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const Menu = () => {
  const Router = useRouter();
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Menu"},
  ];
  
  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="mb-6 grid grid-cols-12">
        <button
          onClick={() => Router.push('menu/add_menu')}
          className="active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11"
        >
          <div className="flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]">
            <span className="text-[20px]">
              <HiPlus />
            </span>
            <span>Tambah Menu</span>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-12 gap-4  md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <MainPage />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Menu;