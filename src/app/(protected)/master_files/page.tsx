"use client";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/masterFiles";

const MasterFiles = () => {
  const Router = useRouter();
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Master Files"},
  ];
  
  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      
      <div className="grid grid-cols-12 gap-4  md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <MainPage />
        </div>
      </div>
    </>
  );
};

export default MasterFiles;