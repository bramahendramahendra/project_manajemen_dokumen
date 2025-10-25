import React, { useState, useEffect, useCallback } from "react";
import { HiX } from "react-icons/hi";
import { HiMagnifyingGlass, HiOutlineXCircle, HiCheck, HiXMark } from "react-icons/hi2";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import { DocumentItem, DocumentItemResponse } from "@/types/dashboard";
import { formatIndonesianDateOnly } from "@/utils/dateFormatter";
import { statusColor, statusIcon, documentIcon } from "@/utils/status";
import Pagination from "@/components/pagination/Pagination";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusCode: string;
  title: string;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, statusCode, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<DocumentItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC',
    search: ''
  });

  // Get user data untuk mendapatkan id_dinas - PERSIS seperti master dinas
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  const dinas = user.dinas;

  // Reset halaman ke 1 ketika melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Debounced search function
  const debounceSearch = useCallback(() => {
    if (searchTerm.trim() !== '') {
      const timeoutId = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(1); // Reset to first page when searching
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    } else {
      // Jika searchTerm kosong, langsung clear search filter tanpa delay
      setFilters(prev => ({ ...prev, search: '' }));
      setCurrentPage(1);
    }
  }, [searchTerm]); // Menambahkan searchTerm ke dependency array

  // Effect untuk debounced search
  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [debounceSearch]);
  

  // Function untuk fetch data dengan parameter - PERSIS seperti master dinas
  const fetchData = useCallback(async (page = 1, perPage = 10, filterParams = {}) => {
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

      // Hapus parameter kosong
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value || value.trim() === '') queryParams.delete(key);
      });

      const response = await apiRequest(`/dashboard/document-dinas/list-status/${dinas}/${statusCode}?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: DocumentItemResponse = await response.json();
      
      // Validasi struktur response - PERSIS seperti master dinas
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }

      const res: DocumentItem[] = result.responseData.items.map((item: any) => ({
            id: item.id,
            jenis: item.jenis,
            subjenis: item.subjenis,
            maker_date: item.maker_date,
            status_code: item.status_code,
            status_doc: item.status_doc,
        }));
      
      // Set data dari response - PERSIS seperti master dinas
      setDataList(res);
      setTotalPages(result.responseMeta.total_pages);
      setTotalRecords(result.responseMeta.total_records);
    } catch (err: any) {
      setError(
        err.message === "Failed to fetch" 
          ? "Tidak dapat terhubung ke server"
          : err.message === "Document data not found"
          ? "Data tidak ditemukan"
          : err.message
      );
      setDataList([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [statusCode, dinas]);

  // useEffect PERSIS seperti master dinas
  useEffect(() => {
    if (isOpen && statusCode && dinas) {
      fetchData(currentPage, itemsPerPage, filters);
    }
  }, [isOpen, statusCode, dinas, currentPage, itemsPerPage, filters, fetchData]);

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

  // Handler untuk clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilters(prev => ({ ...prev, search: "" }));
    setCurrentPage(1);
  };

  // Handler untuk search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mb-2"></div>
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
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
            {filters.search ? "Tidak ada hasil pencarian" : "Data dokumen belum tersedia"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {filters.search 
              ? `Tidak ditemukan hasil untuk &quot;${filters.search}&quot;`
              : "Belum ada dokumen untuk status ini"
            }
          </p>
          {filters.search && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hapus Pencarian
            </button>
          )}
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
    // PERBAIKAN LAYOUT: Modal Container dengan fixed positioning dan proper overflow
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* PERBAIKAN LAYOUT: Modal Content dengan height constraints yang tepat */}
      <div className="relative w-full max-w-5xl bg-white shadow-2xl dark:bg-gray-dark rounded-[10px] z-10 flex flex-col max-h-[90vh]">
        
        {/* PERBAIKAN LAYOUT: Header Section - Fixed di atas */}
        <div className="flex-shrink-0 p-4 sm:p-7.5 border-b border-gray-200 dark:border-gray-700">
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
              {searchLoading && (
                <div className="ml-3">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Cari uraian, dinas, tanggal dibuat, atau..."
                  className="w-full pl-10 pr-3 py-2.5 text-[15px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiMagnifyingGlass className="h-5 w-5 text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <HiOutlineXCircle className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <HiX className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Active Search Indicator */}
          {filters.search && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <div className="flex items-center">
                <HiMagnifyingGlass className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm text-blue-800 dark:text-blue-300">
                  Menampilkan hasil pencarian untuk: <span className="font-semibold">&quot;{filters.search}&quot;</span>
                </span>
                {totalRecords > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                    {totalRecords} hasil
                  </span>
                )}
              </div>
              <button
                onClick={handleClearSearch}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                title="Hapus pencarian"
              >
                <HiOutlineXCircle className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        {/* PERBAIKAN LAYOUT: Scrollable Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 sm:px-7.5">
            {/* Content - Table PERSIS seperti master dinas */}
            <div className="max-w-full overflow-x-auto rounded-lg">
              <table className="w-full table-auto">
                <thead className="sticky top-0 bg-[#F7F9FC] dark:bg-gray-800 z-10">
                  <tr className="text-[20px] text-left">
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
                            {documentIcon(item.status_code)}
                          </div>
                          <div>
                            <p className="font-medium text-[19px] text-dark dark:text-white">
                              {item.subjenis}
                            </p>
                            <p className="text-[17px] text-gray-500 dark:text-gray-400">
                              Jenis: {item.jenis}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-dark text-[19px] dark:text-white">
                          {formatIndonesianDateOnly(item.maker_date)}
                        </p>
                      </td>
                      <td className="px-4 py-4 xl:pr-7.5">
                        <span className={`${statusColor(item.status_code)} inline-flex items-center px-3 py-1 rounded-full text-[19px] font-medium`}>
                          {statusIcon(item.status_code)}
                          {/* {getDisplayStatusName(item.status_code, item.status_doc)} */}
                          {item.status_doc}
                        </span>
                      </td> 
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* PERBAIKAN LAYOUT: Pagination Fixed di bawah */}
          {!loading && !error && totalPages > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-7.5 py-4">
              {/* Pagination - PERSIS seperti master dinas */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalRecords={totalRecords}
                loading={loading}
                isSearchActive={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;