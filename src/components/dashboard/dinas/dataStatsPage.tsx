"use client";

import React, { useState, useEffect } from "react";
import DocumentModal from "../../modals/documentModal";
import { dataStats } from "@/types/dataStats";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import { 
  HiDocument, 
  HiClock, 
  HiCheck, 
  HiXMark 
} from "react-icons/hi2";

// Definisikan tipe dokumen berdasarkan response API
interface DocumentItem {
  id: number;
  subjenis: string;
  maker_date: string;
  status_code: string;
  status_doc: string;
}

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

interface DocumentListResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: DocumentItem[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

const DataStatsOne: React.FC<dataStats> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([]);
  const [modalTitle, setModalTitle] = useState("");
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

  // Fetch count data dari API
  const fetchCountData = async () => {
    if (!dinas) {
      setError("ID Dinas tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest(`/dashboard/document-dinas/count/${dinas}`, "GET");
      
      if (!response.ok) {
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: CountResponse = await response.json();
      
      if (result.responseCode === 200 && result.responseData?.items) {
        setCountData(result.responseData.items);
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data count");
      }
    } catch (err: any) {
      console.error("Error fetching count data:", err);
      setError(err.message || "Gagal mengambil data count dokumen");
      setCountData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch document list berdasarkan status
  const fetchDocumentsByStatus = async (statusCode: string) => {
    if (!dinas) {
      setError("ID Dinas tidak ditemukan");
      return [];
    }

    try {
      const response = await apiRequest(`/dashboard/document-dinas/list-status/${dinas}/${statusCode}`, "GET");
      
      if (!response.ok) {
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: DocumentListResponse = await response.json();
      
      if (result.responseCode === 200 && result.responseData?.items) {
        return result.responseData.items;
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data dokumen");
      }
    } catch (err: any) {
      console.error("Error fetching documents by status:", err);
      setError(err.message || "Gagal mengambil data dokumen");
      return [];
    }
  };

  // Load data saat component mount
  useEffect(() => {
    fetchCountData();
  }, [dinas]);

  // Fungsi untuk menampilkan modal dan fetch dokumen berdasarkan status
  const handleCardClick = async (statusCode: string, title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
    
    // Cek apakah count untuk status ini adalah 0
    const countItem = countData.find(item => item.status_code === statusCode);
    const count = countItem?.total_documnet || 0;
    
    if (count === 0) {
      // Jika count 0, tidak perlu panggil API, langsung set dokumen kosong
      setFilteredDocuments([]);
    } else {
      // Jika count > 0, fetch documents for this status
      const documents = await fetchDocumentsByStatus(statusCode);
      setFilteredDocuments(documents);
    }
  };

  // Render loading skeleton
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

  // Render error state
  const renderErrorState = () => (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark text-center">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
      <button 
        onClick={fetchCountData}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );

  if (loading) {
    return renderLoadingSkeleton();
  }

  if (error) {
    return renderErrorState();
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
        documents={filteredDocuments}
        title={modalTitle}
      />
    </>
  );
};

export default DataStatsOne;