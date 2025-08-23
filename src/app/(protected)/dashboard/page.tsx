"use client";
import { useState, useEffect } from "react";
import ModalPopup from "@/components/popup";
import Cookies from "js-cookie";

// Import components untuk masing-masing role
import DinasDataStats from "@/components/dashboard/dinas/dataStatsPage";
import DinasTable from "@/components/dashboard/dinas/tablePage";
import AdminPengawasDataStats from "@/components/dashboard/admin-pengawas/dataStatsPage";
import AdminPengawasTable from "@/components/dashboard/admin-pengawas/tablePage";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userLevelId, setUserLevelId] = useState<string>("");

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  
  useEffect(() => {
    // Set user level_id dari cookies
    setUserLevelId(user.level_id || "");
    
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited === "true") {
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.setItem("hasVisited", "false");
  };

  // Function untuk render component berdasarkan level_id
  const renderDashboardContent = () => {
    // Admin (ADM) dan Pengawas (PGW) menggunakan component yang sama
    if (userLevelId === 'ADM' || userLevelId === 'PGW') {
      return (
        <>
          <AdminPengawasDataStats />
          <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
            <div className="col-span-12 xl:col-span-12">
              <AdminPengawasTable />
            </div>
          </div>
        </>
      );
    }
    
    // Default untuk level_id dinas (DNS)
    return (
      <>
        <DinasDataStats />
        <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <div className="col-span-12 xl:col-span-12">
            <DinasTable />
          </div>
        </div>
      </>
    );
  };

  // Function untuk mendapatkan greeting berdasarkan level_id
  const getGreetingMessage = () => {
    if (userLevelId === 'ADM' || userLevelId === 'PGW') {
      return userLevelId === 'ADM' 
        ? "Kelola sistem dan monitor seluruh aktivitas"
        : "Monitor dan awasi proses dokumen";
    }
    return "Perform activities to organize documents";
  };

  return (
    <>
      <ModalPopup isOpen={isModalOpen} onClose={handleCloseModal} />

      <div className="mb-6 grid grid-cols-12">
        <div className="2xsm:col-span-12 2xsm:mb-2 md:col-span-9 md:mb-0 lg:col-span-9 xl:col-span-10">
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Welcome, {user.name || "User Andalanku"}
          </h2>
          <span>{getGreetingMessage()}</span>
        </div>
      </div>

      {/* Render content berdasarkan role */}
      {renderDashboardContent()}
    </>
  );
};

export default Dashboard;