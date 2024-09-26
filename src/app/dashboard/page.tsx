"use client"
// import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { HiPlus } from "react-icons/hi2";
import DataStatsPage from "@/components/dashboard/dataStatsPage";
import TablePage from "@/components/dashboard/tablePage";
import ChatCardPage from "@/components/dashboard/chatCard";
import Link from "next/link";
import { useState } from "react";
import AddDocument from "@/components/modals/addDocument";

// export const metadata: Metadata = {
//   title: "Dashboard",
// };

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <DefaultLayout>
      <div className="mb-6 grid grid-cols-12">
        <div className="2xsm:col-span-12 2xsm:mb-2 md:col-span-9 md:mb-0 lg:col-span-9 xl:col-span-10">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Welcome, Erick Thohir
          </h2>
          <span>Perform activities to organize documents</span>
        </div>

        {/* <button
           onClick={toggleModal}
          className="2xsm:col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2 active:scale-[.97]"
        >
          <div className="text- flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]">
            <span>
              <HiPlus />
            </span>
            <span>Add Document</span>
          </div>
        </button> */}
      </div>
      {/* <AddDocument isOpen={isModalOpen} onClose={toggleModal} /> */}

      <DataStatsPage />
      <div className="mt-0"></div>
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
