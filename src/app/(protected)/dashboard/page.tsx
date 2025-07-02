"use client";
import DataStatsPage from "@/components/dashboard/dataStatsPage";
import TablePage from "@/components/dashboard/tablePage";
import { useState, useEffect } from "react";
import ModalPopup from "@/components/popup"; // Import komponen popup
import Cookies from "js-cookie";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  console.log(user);
  

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited === "true") {
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.setItem("hasVisited", "false");
    // console.log("🛑 hasVisited set to false on modal close:", localStorage.getItem("hasVisited"));
  };

  return (
    <>
      <ModalPopup isOpen={isModalOpen} onClose={handleCloseModal} />

      <div className="mb-6 grid grid-cols-12">
        <div className="2xsm:col-span-12 2xsm:mb-2 md:col-span-9 md:mb-0 lg:col-span-9 xl:col-span-10">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Welcome, {user.name || "User Andalanku"}
          </h2>
          <span>Perform activities to organize documents</span>
        </div>
      </div>

      {/* DataStatsOne digunakan sebagai pengganti DataStatsPage */}
      <DataStatsPage />

      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <TablePage />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
