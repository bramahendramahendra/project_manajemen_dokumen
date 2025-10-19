"use client";
import { useState, useEffect, useCallback } from "react";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";
import { HiOutlineDocumentDownload, HiOutlineTrash } from "react-icons/hi";
import { HiMagnifyingGlass, HiOutlineXCircle } from "react-icons/hi2";
import { LaporanPergeseranDocument, LaporanPergeseranDocumentResponse } from "@/types/laporanPergeseran";
import { formatIndonesianDateOnly } from "@/utils/dateFormatter";
import Pagination from "@/components/pagination/Pagination";

interface Props {
  idDinas: number | null;
}

const MainPage = ({ idDinas }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<LaporanPergeseranDocument[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // State untuk modal download
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDownloadData, setSelectedDownloadData] = useState<{
    documentTitle: string;
    filePath: string;
    fileName: string;
  } | null>(null);
  
  // State untuk loading download
  const [downloadingFile, setDownloadingFile] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC',
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

  // Wrap fetchData dengan useCallback untuk mencegah re-render yang tidak perlu
  const fetchData = useCallback(async (page = 1, perPage = 10, filterParams = {}) => {
    if (!idDinas) {
      setError("ID tidak ditemukan");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Buat query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value || value.trim() === '') queryParams.delete(key);
      });

      const response = await apiRequest(`/reports/pergeseran-dokumen/${idDinas}?${queryParams.toString()}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data laporan pergeseran dokumen tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: LaporanPergeseranDocumentResponse = await response.json();

      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      // Format data sesuai dengan interface LaporanPergeseran
      const res: LaporanPergeseranDocument[] = result.responseData.items.map((item: any) => ({
          id: item.pergeseran, // Generate ID untuk keperluan UI
          deskripsi: item.deskripsi,
          tanggal: item.tanggal,
          file_unduh: item.file_unduh
          // tanggal: formatIndonesianDateOnly(item.tanggal),
          // dateObject: dateObject
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
  }, [idDinas]); // Hanya idDinas yang menjadi dependency

  // Fetch data dari API
  useEffect(() => {
    if (filters.search !== searchTerm) {
      setSearchLoading(true);
    }
    fetchData(currentPage, itemsPerPage, filters);
  }, [searchTerm, currentPage, itemsPerPage, filters, fetchData]);

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
  const handleRetry = useCallback(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [fetchData, currentPage, itemsPerPage, filters]);

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

  // Function untuk memotong string dan hanya mengambil 5 kata pertama
  const truncateText = (text: string, wordCount: number = 5) => {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Fungsi untuk mendapatkan nama file dari path
  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || 'download';
  };

  // Fungsi untuk membuka modal download
  const openDownloadModal = (deskripsi: string, filePath: string) => {
    const fileName = getFileName(filePath);
    setSelectedDownloadData({
      documentTitle: deskripsi,
      filePath: filePath,
      fileName: fileName
    });
    setIsDownloadModalOpen(true);
  };

  // Fungsi untuk menutup modal download
  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
    setSelectedDownloadData(null);
  };

  // Function untuk handle download file
  const handleDownloadFile = async () => {
    if (!selectedDownloadData) return;

    try {
      setDownloadingFile(true);
      
      // Pastikan filePath tidak kosong
      if (!selectedDownloadData.filePath || selectedDownloadData.filePath.trim() === '') {
        throw new Error('Path file tidak valid');
      }

      // Hapus leading slash jika ada dan encode path
      const cleanFilePath = selectedDownloadData.filePath.startsWith('/') 
        ? selectedDownloadData.filePath.substring(1) 
        : selectedDownloadData.filePath;
      const encodedFilePath = encodeURIComponent(cleanFilePath);
      
      console.log('Downloading file from path:', cleanFilePath);
      
      // Menggunakan downloadFileRequest helper untuk download
      const response = await downloadFileRequest(`/files/download/${encodedFilePath}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File tidak ditemukan: ${cleanFilePath}`);
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.ResponseDesc || 'Format file tidak valid');
          } catch (parseError) {
            throw new Error('Format file tidak valid');
          }
        } else {
          throw new Error(`Error ${response.status}: Gagal mengunduh file`);
        }
      }

      // Membuat blob dari response
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File kosong atau tidak dapat dibaca');
      }
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Membuat link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = selectedDownloadData.fileName;
      link.style.display = 'none';
      
      // Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('Download completed successfully');
      
      // Tutup modal setelah download berhasil
      closeDownloadModal();
      
    } catch (error) {
      console.error('Error downloading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh file';
      alert(`Gagal mengunduh file: ${errorMessage}`);
    } finally {
      setDownloadingFile(false);
    }
  };

  // Function untuk handle delete
  const handleDeleteClick = async (id: number, deskripsi: string) => {
    // Konfirmasi sebelum menghapus
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus dokumen "${truncateText(deskripsi, 5)}"?`
    );
    
    if (isConfirmed) {
      // const payload = {
      //   id: id,
      //   deskripsi: deskripsi,
      // };

      try {
        const response = await apiRequest(`/direct-shipping/delete/${id}`, 'POST');
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.responseDesc || 'Gagal menghapus data dinas');
        }

        setSuccess('Data pergeseran berhasil dihapus!');
        
        // Refresh data setelah delete
        await fetchData(currentPage, itemsPerPage, filters);

      } catch (error) {
        setError("Terjadi kesalahan saat mengirim data penghapusan");
      } finally {
        setLoading(false);
      }
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
              : "Belum ada dokumen laporan pergeseran yang diupload"
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

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
         

        {/* Header Section with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              Daftar Dokumen Laporan Pergeseran
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
                placeholder="Cari uraian, tanggal upload, total files, atau status..."
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

        <div className="max-w-full overflow-x-auto rounded-lg">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Deskripsi
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal
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
                <tr
                  key={index}
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <p className="font-medium text-dark dark:text-white" title={item.deskripsi}>
                        {truncateText(item.deskripsi, 8)}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-dark dark:text-white">
                      {formatIndonesianDateOnly(item.tanggal)}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ minWidth: '280px' }}>
                    <div className="flex items-center justify-end gap-3 flex-nowrap">
                      {/* Tombol Download */}
                      <button
                        id={`download-btn-${index}`}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6 focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 active:scale-[.98]"
                        onClick={() => openDownloadModal(item.deskripsi, item.file_unduh)}
                      >
                        <span className="text-[20px]">
                          <HiOutlineDocumentDownload />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Download
                        </span>
                      </button>

                      {/* Tombol Delete */}
                      <button
                        id={`delete-btn-${index}`}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#DC2626] to-[#EF4444] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#DC2626] hover:to-[#DC2626] hover:pr-6 focus:ring-2 focus:ring-red-300 focus:ring-offset-1 active:scale-[.98]"
                        onClick={() => handleDeleteClick(item.id, item.deskripsi)}
                      >
                        <span className="text-[20px]">
                          <HiOutlineTrash />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination - hanya tampil jika ada data dan tidak loading */}
          {!loading && !error && totalPages > 0 && (
            // <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
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
            // </div>
          )}
        </div>

        {/* Modal Download */}
        {isDownloadModalOpen && selectedDownloadData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
                <h3 className="text-xl font-bold text-gray-800">Konfirmasi Download</h3>
                <button
                  onClick={closeDownloadModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              
              {/* Konten Modal */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {/* Informasi Dokumen */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Dokumen yang akan diunduh:
                    </h4>
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedDownloadData.documentTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedDownloadData.fileName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Apakah Anda yakin ingin mengunduh file ini?
                  </p>
                </div>
              </div>
              
              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={closeDownloadModal}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDownloadFile}
                  disabled={downloadingFile}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {downloadingFile ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengunduh...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;