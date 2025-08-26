"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { HiOutlineDocumentText } from "react-icons/hi";
import { Document, DocumentResponse } from "@/types/dashboard";
import Pagination from "@/components/pagination/Pagination";

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

const TablePage = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<Document[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC'
  });

  // Function untuk fetch data dengan parameter
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
    const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
    const idDinas = user.dinas;

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

      const response = await apiRequest(`/dashboard/document-dinas/list/${idDinas}?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: DocumentResponse = await response.json();

      // Validasi struktur response
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }

      const res: Document[] = result.responseData.items.map((item: any) => ({
          id: item.id,
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
        <td className="px-4 py-4 xl:pl-7.5">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4 xl:pr-7.5">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
        </td>
      </tr>
    ))
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={3} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
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
      <td colSpan={3} className="px-4 py-20 text-center">
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
    <>
      {/* Alert Messages */}
      {error && !loading && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">{success}</p>
        </div>
      )}

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            Document Information
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!loading && totalRecords > 0 && (
              <>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data</>
            )}
            {!loading && totalRecords === 0 && "Tidak ada data"}
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="min-w-[300px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Uraian
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal Dibuat
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white xl:pr-7.5">
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
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 xl:pl-7.5">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <HiOutlineDocumentText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark dark:text-white">{item.subjenis}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {item.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {formatDate(item.maker_date)}
                    </p>
                  </td>
                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className={`${getStatusColor(item.status_code)} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium`}>
                      <span>{getDisplayStatusName(item.status_code, item.status_doc)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
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
      </div>
    </>
  );
};

export default TablePage;