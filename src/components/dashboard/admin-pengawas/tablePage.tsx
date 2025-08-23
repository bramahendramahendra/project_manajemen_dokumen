"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { HiOutlineDocumentText } from "react-icons/hi";
import { Document, DocumentResponse } from "@/types/dashboard";
import Pagination from "@/components/pagination/Pagination";

// Extend interface Document untuk admin/pengawas
interface AdminPengawasDocument extends Document {
  dinas?: string; // Tambahan field untuk nama dinas
}

interface AdminPengawasDocumentResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: AdminPengawasDocument[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

// Fungsi untuk mendapatkan warna status berdasarkan status_code
const getStatusColor = (statusCode: string) => {
  switch (statusCode) {
    case '001': // Pending/Proses
      return 'bg-yellow-100 text-yellow-800';
    case '002': // Ditolak
      return 'bg-red-100 text-red-800';
    case '003': // Diterima
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Fungsi untuk mengubah nama status sesuai dengan mapping
const getDisplayStatusName = (statusCode: string, statusDoc: string) => {
  switch (statusCode) {
    case '001':
      return 'Diproses';
    case '002':
      return 'Ditolak';
    case '003':
      return 'Diterima';
    default:
      return statusDoc; // fallback ke status dari API
  }
};

// Format tanggal dalam bahasa Indonesia dari ISO string
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Tanggal tidak valid";
  }
};

const AdminPengawasTable = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<AdminPengawasDocument[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC'
  });

  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  const userLevelId = user.level_id || ""; // ADM atau PGW

  // Function untuk fetch data dengan parameter
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Buat query parameters untuk pagination
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      const response = await apiRequest(`/dashboard/document-monitoring/list?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: AdminPengawasDocumentResponse = await response.json();

      // Validasi struktur response
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }

      const res: AdminPengawasDocument[] = result.responseData.items.map((item: any) => ({
          id: item.id,
          dinas: item.dinas || '',
          subjenis: item.subjenis,
          maker_date: item.maker_date,
          status_code: item.status_code,
          status_doc: item.status_doc,
      }));

      // Set data dari response
      setDataList(res);
      setTotalPages(result.responseMeta.total_pages);
      setTotalRecords(result.responseMeta.total_records);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server"
          : err.message,
      );
      setDataList([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Load data saat component mount atau parameter berubah
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [currentPage, itemsPerPage, filters]);

  // Auto hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Handler untuk perubahan items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama saat mengubah items per page
  };

  // Handler untuk retry ketika error
  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage);
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-5">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
        <td className="px-4 py-5 text-center">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-5 text-center">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-5 text-center">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
      </tr>
    ))
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={4} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <HiOutlineDocumentText className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Belum ada dokumen
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Dokumen akan muncul di sini setelah diunggah
          </p>
        </div>
      </td>
    </tr>
  );

  // Render error state
  const renderErrorState = () => (
    <tr>
      <td colSpan={4} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark">
      <div className="flex justify-between items-center mb-5.5">
        <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
          All Documents - {userLevelId === 'ADM' ? 'Admin' : 'Pengawas'} View
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {!loading && totalRecords > 0 && (
            <>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data</>
          )}
          {!loading && totalRecords === 0 && "Tidak ada data"}
        </div>
      </div>

      {/* Alert untuk error */}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] dark:bg-gray-dark">
              <th className="px-4 py-4 pb-3.5 text-left font-medium text-dark dark:text-gray-300">
                Uraian
              </th>
              <th className="px-4 py-4 pb-3.5 text-center font-medium text-dark dark:text-gray-300">
                Dinas
              </th>
              <th className="px-4 py-4 pb-3.5 text-center font-medium text-dark dark:text-gray-300">
                Tanggal Dibuat
              </th>
              <th className="px-4 py-4 pb-3.5 text-center font-medium text-dark dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && renderLoadingSkeleton()}
            {!loading && error && renderErrorState()}
            {!loading && !error && dataList.length === 0 && renderEmptyState()}
            {!loading && !error && dataList.length > 0 && dataList.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-2 ${
                  index === dataList.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-dark-3"
                }`}
              >
                <td className="px-4 py-5 text-sm font-medium text-dark dark:text-white">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <HiOutlineDocumentText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium">{item.subjenis}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {item.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-center text-sm text-dark dark:text-white">
                  {item.dinas || '-'}
                </td>
                <td className="px-4 py-5 text-center text-sm text-dark dark:text-white">
                  {formatDate(item.maker_date)}
                </td>
                <td className="px-4 py-5 text-center">
                  <div className="flex items-center justify-center">
                    <div className={`${getStatusColor(item.status_code)} flex items-center px-3 py-1 rounded-full text-xs`}>
                      <span>{getDisplayStatusName(item.status_code, item.status_doc)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - hanya tampil jika ada data dan tidak loading */}
      {!loading && !error && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default AdminPengawasTable;