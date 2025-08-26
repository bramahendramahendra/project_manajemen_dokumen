// DocumentModal.tsx - PERSIS seperti master dinas dengan pagination lengkap
import React, { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { 
  HiDocument, 
  HiClock, 
  HiCheck, 
  HiXMark 
} from "react-icons/hi2";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import Pagination from "@/components/pagination/Pagination";

// Interface sesuai dengan response API - PERSIS seperti master dinas
interface DocumentItem {
  id: number;
  subjenis: string;
  maker_date: string;
  status_code: string;
  status_doc: string;
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

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusCode: string;
  title: string;
}

// Fungsi untuk mendapatkan warna status berdasarkan status_code
const getStatusColor = (statusCode: string) => {
  switch (statusCode) {
    case '001': // Pending/Proses
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case '002': // Ditolak
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case '003': // Diterima
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// Fungsi untuk mendapatkan ikon status berdasarkan status_code
const getStatusIcon = (statusCode: string) => {
  switch (statusCode) {
    case '001': // Pending/Proses
      return <HiClock className="inline-block mr-1.5 h-4 w-4" />;
    case '002': // Ditolak
      return <HiXMark className="inline-block mr-1.5 h-4 w-4" />;
    case '003': // Diterima
      return <HiCheck className="inline-block mr-1.5 h-4 w-4" />;
    default:
      return null;
  }
};

// Fungsi untuk mendapatkan ikon dokumen dengan warna sesuai status
const getDocumentIcon = (statusCode: string) => {
  switch (statusCode) {
    case '001': // Pending/Proses
      return <HiDocument className="h-5 w-5 text-yellow-500" />;
    case '002': // Ditolak
      return <HiDocument className="h-5 w-5 text-red-500" />;
    case '003': // Diterima
      return <HiDocument className="h-5 w-5 text-green-500" />;
    default:
      return <HiDocument className="h-5 w-5 text-gray-400" />;
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
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Tanggal tidak valid";
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

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, statusCode, title }) => {
  // State management PERSIS seperti master dinas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<DocumentItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC'
  });

  // Get user data untuk mendapatkan id_dinas - PERSIS seperti master dinas
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  const dinas = user.dinas;

  // Function untuk fetch data dengan parameter - PERSIS seperti master dinas
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
    if (!dinas || !statusCode) {
      setError("ID Dinas atau status code tidak ditemukan");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buat query parameters - PERSIS seperti master dinas
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong - PERSIS seperti master dinas
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      const response = await apiRequest(`/dashboard/document-dinas/list-status/${dinas}/${statusCode}?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: DocumentListResponse = await response.json();
      
      // Validasi struktur response - PERSIS seperti master dinas
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      // Set data dari response - PERSIS seperti master dinas
      setDataList(result.responseData.items);
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

  // useEffect PERSIS seperti master dinas
  useEffect(() => {
    if (isOpen && statusCode && dinas) {
      fetchData(currentPage, itemsPerPage, filters);
    }
  }, [isOpen, statusCode, dinas, currentPage, itemsPerPage, filters]);

  // Auto hide success message after 5 seconds - PERSIS seperti master dinas
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Reset state ketika modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setDataList([]);
      setError(null);
      setLoading(true);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalRecords(0);
    }
  }, [isOpen]);

  // Handler untuk perubahan halaman - PERSIS seperti master dinas
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handler untuk perubahan items per page - PERSIS seperti master dinas
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk retry ketika error - PERSIS seperti master dinas
  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage, filters);
  };

  // Render loading skeleton - PERSIS seperti master dinas
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div>
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mb-1"></div>
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
      </tr>
    ))
  );

  // Render empty state - PERSIS seperti master dinas
  const renderEmptyState = () => (
    <tr>
      <td colSpan={3} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Data dokumen belum tersedia
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Belum ada dokumen untuk status ini
          </p>
        </div>
      </td>
    </tr>
  );

  // Render error state - PERSIS seperti master dinas
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl max-h-full mx-auto rounded-[10px] bg-white shadow-2xl dark:bg-gray-dark p-4 sm:p-7.5 z-10 m-4">
        {/* Alert Messages - PERSIS seperti master dinas */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">{success}</p>
          </div>
        )}

        {/* Header - PERSIS seperti master dinas */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-dark dark:text-white">{title}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {!loading && totalRecords > 0 && (
                <>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data</>
              )}
              {!loading && totalRecords === 0 && "Tidak ada data"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            <HiX className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Content - Table PERSIS seperti master dinas */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="min-w-[280px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Dokumen
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal Dibuat
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white xl:pr-7.5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && renderLoadingSkeleton()}
              {!loading && error && renderErrorState()}
              {!loading && !error && dataList.length === 0 && renderEmptyState()}
              {!loading && !error && dataList.length > 0 && dataList.map((item, index) => (
                <tr key={item.id} className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-4 xl:pl-7.5">
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {getDocumentIcon(item.status_code)}
                      </div>
                      <div>
                        <p className="font-medium text-dark dark:text-white">
                          {item.subjenis}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <span className={`${getStatusColor(item.status_code)} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium`}>
                      {getStatusIcon(item.status_code)}
                      {getDisplayStatusName(item.status_code, item.status_doc)}
                    </span>
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination - PERSIS seperti master dinas */}
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
    </div>
  );
};

export default DocumentModal;