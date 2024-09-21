import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { HiPlus } from "react-icons/hi2";
import DataStatsPage from "@/components/dashboard/dataStatsPage";
import TablePage from "@/components/dashboard/tablePage";
import ChatCardPage from "@/components/dashboard/chatCard";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Dashboard",
};

const Dashboard = () => {
  return (
    <DefaultLayout>
      <div className="grid grid-cols-12 mb-6">
        <div className="xl:col-span-9 md:col-span-9 lg:col-span-9 md:mb-0 2xsm:col-span-12 2xsm:mb-2 ">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Welcome back, Erick Thohir
          </h2>
          <span>
            Lakukan aktifitas untuk menata dokumenmu
          </span>
        </div>
        
        
          <Link href={`#`} className="xl:col-span-3 md:col-span-3 lg:col-span-3 2xsm:col-span-12">
            <div className="text-white text-[16px] text- rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:from-[#0C479F] hover:to-[#0C479F] py-[10px] flex items-center justify-center space-x-2">
              <span><HiPlus /></span>
              <span>Add Document</span>
            </div>
          </Link>
      </div>
    
      <DataStatsPage />
      <div className="mt-0">

      </div>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <TablePage />
        </div>
        {/* <ChatCardPage /> */}
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;