"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import Cookies from "js-cookie";
import { HiOutlineDocumentMagnifyingGlass, HiOutlineXMark, HiOutlineArrowDownTray, HiOutlineExclamationTriangle, HiOutlineDocumentText, HiOutlinePencilSquare, HiMagnifyingGlass, HiOutlineXCircle } from "react-icons/hi2";
import { DaftarUpload, FileItem, DaftarUploadResponse } from "@/types/daftarUpload";
import Pagination from "@/components/pagination/Pagination";

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case '001':
      return 'bg-yellow-100 text-yellow-800'; // Warna kuning untuk Proses
    case '002':
      return 'bg-red-100 text-red-800'; // Warna merah untuk Tolak
    case '003':
      return 'bg-green-100 text-green-800'; // Warna hijau untuk Diterima
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const MainPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<DaftarUpload[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const [showRejectStatusModal, setShowRejectStatusModal] = useState(false);
  const [rejectedItem, setRejectedItem] = useState<DaftarUpload | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState({
    sort_by: 'jenis,id',
    sort_dir: 'ASC,DESC',
    search: ''
  });

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

  // Function untuk fetch data dengan parameter
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      
      // Buat query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong - PERSIS seperti master dinas
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      const response = await apiRequest(`/daftar_upload/${user.dinas}?${queryParams.toString()}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result : DaftarUploadResponse = await response.json();
      
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      const res: DaftarUpload[] = result.responseData.items.map((item: any) => ({
        id: item.id,
        jenis: item.jenis,
        uraian: item.subjenis,
        tanggal: new Date(item.maker_date),
        status_code: item.status_code,
        status_doc: item.status_doc,
        total_files: item.total_files || 0,
        files: item.files || [],
        catatan: item.catatan || ""
      }));

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
  };

  // useEffect untuk fetch data
  useEffect(() => {
    if (filters.search !== searchTerm) {
      setSearchLoading(true);
    }
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
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk retry ketika error
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

  // Fungsi untuk menangani klik perbaikan dokumen
  const handlePerbaikanClick = (id: number) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    
    if (!user) {
      alert("Sesi Anda telah berakhir, silakan login kembali!");
      return;
    }

    if (!key) {
      alert("Konfigurasi aplikasi tidak valid!");
      return;
    }
    
    try {
      const encrypted = encryptObject({ id }, user);
      
      router.push(`/daftar_upload/admin/perbaikan?${key}=${encrypted}`);
    } catch (error) {
      console.error("Error encrypting data:", error);
      alert("Terjadi kesalahan saat memproses data!");
    }
  };

  // Fungsi untuk menangani klik status tolak
  const handleRejectStatusClick = async (item: DaftarUpload) => {
    setRejectedItem(item);
    
    // Fetch catatan penolakan dari API jika diperlukan
    try {
      const response = await apiRequest(`/document_managements/rejection-note/${item.id}`, "GET");
      if (response.ok) {
        const result = await response.json();
        setRejectionNote(result.responseData?.catatan || "Tidak ada catatan penolakan.");
      } else {
        setRejectionNote(item.catatan || "Tidak ada catatan penolakan.");
      }
    } catch (error) {
      setRejectionNote(item.catatan || "Tidak ada catatan penolakan.");
    }
    
    setShowRejectStatusModal(true);
  };

  // Fungsi untuk menutup modal status tolak
  const handleCloseRejectStatusModal = () => {
    setShowRejectStatusModal(false);
    setRejectedItem(null);
    setRejectionNote("");
  };

  // Fungsi untuk membuka modal review
  const handleOpenReviewModal = (files: FileItem[], uraian: string) => {
    setSelectedFiles(files);
    setSelectedUraian(uraian);
    setShowReviewModal(true);
  };

  // Fungsi untuk menutup modal review
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedFiles([]);
    setSelectedUraian("");
  };

  // Fungsi untuk download file
  const handleDownloadFile = async (file: FileItem) => {
    setDownloadingFile(file.id);
    try {
      const response = await downloadFileRequest(`/files/download/${file.file_name}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Ekstrak nama file dari path
        const fileName = file.file_name.split('/').pop() || `file_${file.id}`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Gagal mendownload file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Terjadi kesalahan saat mendownload file');
    } finally {
      setDownloadingFile(null);
    }
  };

  // Fungsi untuk download semua file sebagai ZIP
  const handleDownloadAllFiles = async () => {
    if (!selectedFiles || selectedFiles.length <= 1) return;
    
    setDownloadingAll(true);
    try {
      // Buat request body dengan list filepath
      const requestBody = {
        files: selectedFiles.map(file => file.file_name),
        zip_name: selectedUraian.replace(/[^a-zA-Z0-9]/g, '_') || 'document_files'
      };

      const response = await apiRequest('/files/download/multiple', 'POST', requestBody);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Nama file ZIP berdasarkan uraian
        const fileName = `${selectedUraian.replace(/[^a-zA-Z0-9]/g, '_')}_all_files.zip`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Download semua file gagal:', response.status);
        setError('Gagal mendownload semua file');
      }
    } catch (error) {
      console.error('Error downloading all files:', error);
      setError('Terjadi kesalahan saat mendownload semua file');
    } finally {
      setDownloadingAll(false);
    }
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
      </tr>
    ))
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={6} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            {filters.search ? "Tidak ada hasil pencarian" : "Data belum tersedia"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {filters.search 
              ? `Tidak ditemukan hasil untuk &quot;${filters.search}&quot;`
              : "Belum ada dokumen yang diupload"
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

  // Render error state
  const renderErrorState = () => (
    <tr>
      <td colSpan={6} className="px-4 py-20 text-center">
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
    <div className="col-span-12 xl:col-span-12">
      {/* Alert Messages */}
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

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        {/* Header Section with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              Daftar dokumen
            </h2>
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
                placeholder="Cari uraian, jenis, tanggal, files, atau status..."
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all duration-200"
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

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="px-2 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  No
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Uraian
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal Upload
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-dark dark:text-white">
                  Total Files
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-dark dark:text-white">
                  Status
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && renderLoadingSkeleton()}
              {!loading && error && renderErrorState()}
              {!loading && !error && dataList.length === 0 && renderEmptyState()}
              {!loading && !error && dataList.length > 0 && dataList.map((item, index) => (
                <tr key={item.id}
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 xl:pl-7.5">
                    <p className="font-medium text-dark dark:text-white">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </p>
                  </td>

                  <td className="px-4 py-4 xl:pl-7.5">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <HiOutlineDocumentText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark dark:text-white">{item.uraian}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Jenis: {item.jenis}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {formatDate(new Date(item.tanggal))}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {item.total_files} file(s)
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <button
                      onClick={() => item.status_code === '002' ? handleRejectStatusClick(item) : undefined}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status_code)} ${
                        item.status_code === '002' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                      }`}
                      disabled={item.status_code !== '002'}
                    >
                      {item.status_doc}
                    </button>
                  </td>

                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenReviewModal(item.files, item.uraian)}
                        className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#059669] to-[#10B981] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#059669] hover:to-[#059669] hover:pr-6"
                        title={`Review ${item.uraian}`}
                        // disabled={loading}
                      >
                        <span className="text-[20px]">
                          <HiOutlineDocumentMagnifyingGlass />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Review
                        </span>
                      </button>

                      {/* Button Perbaikan - hanya muncul jika status ditolak */}
                      {item.status_code === '002' && (
                        <button
                          onClick={() => handlePerbaikanClick(item.id)}
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#DC2626] to-[#EF4444] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#DC2626] hover:to-[#DC2626] hover:pr-6"
                          title={`Perbaikan ${item.uraian}`}
                        >
                          <span className="text-[20px]">
                            <HiOutlinePencilSquare />
                          </span>
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Perbaikan
                          </span>
                        </button>
                      )}
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
              totalRecords={totalRecords}
              loading={loading}
              isSearchActive={!!filters.search}
              searchTerm={filters.search}
            />
          )}
        </div>
      </div>

      {/* Modal Status Tolak */}
      {showRejectStatusModal && rejectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="relative z-10 w-full max-w-md mx-4 rounded-lg bg-white p-6 shadow-xl dark:bg-gray-dark">
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mr-3">
                  <HiOutlineExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dokumen Ditolak
                </h3>
              </div>
              <button
                onClick={handleCloseRejectStatusModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
                <strong>Pengelolaan Dokumen ditolak</strong>
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Catatan Penolakan:</p>
                <div className="text-sm text-gray-600 whitespace-pre-wrap dark:text-gray-400">
                  {rejectionNote || "Tidak ada catatan penolakan."}
                </div>
              </div>
              
              {rejectedItem && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p><strong>Dokumen:</strong> {rejectedItem.uraian}</p>
                  <p><strong>Tanggal Upload:</strong> {formatDate(new Date(rejectedItem.tanggal))}</p>
                </div>
              )}
            </div>

            {/* Footer Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseRejectStatusModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleCloseRejectStatusModal();
                  handlePerbaikanClick(rejectedItem.id);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                Perbaikan Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Review Files */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-[1000]"
          aria-labelledby="review-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl dark:bg-gray-dark">
                {/* Header Modal */}
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-dark">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <HiOutlineDocumentMagnifyingGlass className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3
                          className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                          id="review-modal-title"
                        >
                          Review Dokumen
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                          {selectedUraian}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none dark:hover:text-gray-300"
                      onClick={handleCloseReviewModal}
                    >
                      <HiOutlineXMark className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Daftar Files */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Daftar File ({selectedFiles.length} file)
                      </h4>
                      {/* Button Download Semua - Tampil jika lebih dari 1 file */}
                      {selectedFiles.length > 1 && (
                        <button
                          onClick={handleDownloadAllFiles}
                          disabled={downloadingAll}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingAll ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Download Semua...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <HiOutlineArrowDownTray className="h-4 w-4 mr-2" />
                              Download Semua ({selectedFiles.length} file)
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {selectedFiles.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 dark:text-gray-400">
                          Tidak ada file tersedia
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                  {file.file_name.split('/').pop() || `File ${idx + 1}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                  ID: {file.id} | Document ID: {file.id_document}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                disabled={downloadingFile === file.id}
                                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFile === file.id ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Download...
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <HiOutlineArrowDownTray className="h-4 w-4 mr-1" />
                                    Download
                                  </span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-800">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                    onClick={handleCloseReviewModal}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;