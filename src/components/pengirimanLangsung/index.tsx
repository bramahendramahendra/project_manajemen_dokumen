"use client";
import { useState } from "react";
import FormPengirimanLangsung from "./FormPengirimanLangsung";
import FormPengirimanLangsungPenilai from "./FormPengirimanLangsungPenilai";

const MainPage = () => {
  const [activeTab, setActiveTab] = useState("dinas");

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Pengiriman dokumen secara langsung
        </h4>
        <div className="flex space-x-4 mb-5">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "dinas" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setActiveTab("dinas")}
          >
            Dinas
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "penilai" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setActiveTab("penilai")}
          >
            Pengawas
          </button>
        </div>
        {activeTab === "dinas" ? <FormPengirimanLangsung /> : <FormPengirimanLangsungPenilai />}
      </div>
    </div>
  );
};

export default MainPage;
