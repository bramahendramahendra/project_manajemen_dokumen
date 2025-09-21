"use client";

import React, { useState, useEffect } from "react";
import DocumentModal from "./documentModal";
import { dataStats } from "@/types/dataStats";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import { 
  HiDocument, 
  HiClock, 
  HiCheck, 
  HiXMark 
} from "react-icons/hi2";

// Definisikan tipe untuk count response
interface CountItem {
  status_code: string;
  status_doc: string;
  total_documnet: number;
}

interface CountResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: CountItem[];
  };
}

const DataStatsOne: React.FC<dataStats> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStatusCode, setModalStatusCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countData, setCountData] = useState<CountItem[]>([]);

  // Get user data untuk mendapatkan id_dinas
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  const dinas = user.dinas;

  // Mapping status code ke display name dan warna
  const statusMapping = {
    "001": { 
      title: "Dokumen Diproses", 
      color: "#3FD97F",
      icon: (
        <div className="flex items-center justify-center relative">
          <HiDocument className="w-8 h-8 text-white" />
          <HiClock className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
        </div>
      )
    },
    "002": { 
      title: "Dokumen Ditolak", 
      color: "#8155FF",
      icon: (
        <div className="flex items-center justify-center relative">
          <HiDocument className="w-8 h-8 text-white" />
          <HiXMark className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
        </div>
      )
    },
    "003": { 
      title: "Dokumen Diterima", 
      color: "#FF9C55",
      icon: (
        <div className="flex items-center justify-center relative">
          <HiDocument className="w-8 h-8 text-white" />
          <HiCheck className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
        </div>
      )
    }
  };

  // Fetch count data dari API - konsisten dengan master dinas
  const fetchCountData = async () => {
    if (!dinas) {
      setError("ID Dinas tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Konsisten dengan format master dinas
      const response = await apiRequest(`/dashboard/document-dinas/count/${dinas}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: CountResponse = await response.json();
      
      // Validasi struktur response - konsisten dengan master dinas
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }
      
      if (result.responseCode === 200) {
        setCountData(result.responseData.items);
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data count");
      }
    } catch (err: any) {
      console.error("Error fetching count data:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server"
          : err.message,
      );
      setCountData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data saat component mount
  useEffect(() => {
    fetchCountData();
  }, [dinas, fetchCountData]);

  // Auto hide error message after 5 seconds - konsisten dengan master dinas
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fungsi untuk menampilkan modal - tidak ada fetch di sini, biarkan modal yang handle
  const handleCardClick = (statusCode: string, title: string) => {
    setModalTitle(title);
    setModalStatusCode(statusCode);
    setIsModalOpen(true);
  };

  // Handler untuk retry ketika error - konsisten dengan master dinas
  const handleRetry = () => {
    fetchCountData();
  };

  // Render loading skeleton - konsisten dengan master dinas
  const renderLoadingSkeleton = () => (
    <div className="flex grid-cols-1 gap-4 overflow-x-auto lg:grid lg:grid-cols-3 lg:gap-3 md:grid md:grid-cols-3 md:gap-6 2xl:gap-7.5">
      {[1, 2, 3].map((index) => (
        <div key={index} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
          <div className="h-14.5 w-14.5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mb-2"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render error state - konsisten dengan master dinas
  const renderErrorState = () => (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark text-center">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    return (
      <>
        {/* Alert Messages - konsisten dengan master dinas */}
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
        {renderErrorState()}
      </>
    );
  }

  return (
    <>
      <div 
        className="flex grid-cols-1 gap-4 overflow-x-auto 
          lg:grid lg:grid-cols-3 lg:gap-3
          md:grid md:grid-cols-3 md:gap-6 
          2xl:gap-7.5
        "
      >
        {Object.entries(statusMapping).map(([statusCode, config]) => {
          // Cari data count untuk status ini
          const countItem = countData.find(item => item.status_code === statusCode);
          const count = countItem?.total_documnet || 0;

          return (
            <div
              key={statusCode}
              className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark cursor-pointer transition-all hover:shadow-xl"
              onClick={() => handleCardClick(statusCode, config.title)}
            >
              <div
                className="flex h-14.5 w-14.5 items-center justify-center rounded-full relative"
                style={{ backgroundColor: config.color }}
              >
                {config.icon}
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                    {count.toString()}
                  </h4>
                  <span className="text-body-sm font-medium">{config.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal untuk menampilkan daftar dokumen */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        statusCode={modalStatusCode}
        title={modalTitle}
      />
    </>
  );
};

export default DataStatsOne;