import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import {
  HiOutlinePencilSquare,
  HiOutlineDocument,
  // HiX,
} from "react-icons/hi2";
import { formatIndonesianDateTime } from "@/utils/dateFormatter";
import Pagination from "@/components/pagination/Pagination";

// Interface untuk Files
interface Files {
  id: number;
  files: string;
  deskripsi?: string;
  createdDate: string;
  updatedDate: string;
}

// Interface untuk API Response
interface FilesResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: any[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<Files[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // State untuk modal upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // State untuk file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [filters, setFilters] = useState({
    files: '',
    sort_by: '',
    sort_dir: 'DESC'
  });

  // Function untuk fetch data dengan parameter
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
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
        if (!value) queryParams.delete(key);
      });

      const response = await apiRequest(`/master_files/?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data files tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: FilesResponse = await response.json();
      
      // Validasi struktur response
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      const res: Files[] = result.responseData.items.map((item: any) => ({
          id: item.files,
          files: item.nama_files || '',
          deskripsi: item.deskripsi,
          createdDate: item.created_at,
          updatedDate: item.updated_at,
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
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk menampilkan modal upload
  const handleUpdateClick = (id: number, fileName: string) => {
    setSelectedFileId(id);
    setSelectedFileName(fileName);
    setShowUploadModal(true);
    setSelectedFile(null);
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedFileId(null);
    setSelectedFileName("");
    setSelectedFile(null);
  };

  // Handler untuk file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (maksimal 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Ukuran file terlalu besar (maksimal 10MB)");
      return;
    }

    setSelectedFile(file);
  };

  // Handler untuk menyimpan upload
  const handleSaveUpload = async () => {
    if (!selectedFileId || !selectedFile) {
      alert("File harus dipilih");
      return;
    }

    setUploadLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Buat FormData untuk upload file
      const formData = new FormData();
      formData.append("file", selectedFile);

      console.log("Uploading file:", {
        id: selectedFileId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });

      const response = await apiRequest(`/master_files/update/${selectedFileId}`, 'POST', formData);
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.responseDesc || 'Gagal mengupdate file');
      }

      const result = await response.json();
      console.log("Upload response:", result);

      setSuccess('File berhasil diupdate!');
      
      // Refresh data setelah update
      await fetchData(currentPage, itemsPerPage, filters);
      
      // Close modal
      handleCloseModal();
    } catch (error: any) {
      console.error("Error updating file:", error);
      setError(error.message || 'Terjadi kesalahan saat mengupdate file');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handler untuk retry ketika error
  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage, filters);
  };

  // Handler untuk filter files
  const handleFilesFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      files: value
    }));
    setCurrentPage(1);
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end space-x-2">
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
      </tr>
    ))
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={5} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Data files belum tersedia
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Files akan muncul setelah upload
          </p>
        </div>
      </td>
    </tr>
  );

  // Render error state
  const renderErrorState = () => (
    <tr>
      <td colSpan={5} className="px-4 py-20 text-center">
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

  // Helper untuk mendapatkan nama file dari path
  const getFileName = (filePath: string): string => {
    if (!filePath) return 'No File';
    return filePath.split('/').pop() || filePath;
  };

  return (
    <>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">Master Data Files</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!loading && totalRecords > 0 && (
              <>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data</>
            )}
            {!loading && totalRecords === 0 && "Tidak ada data"}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari berdasarkan nama file..."
                value={filters.files}
                onChange={handleFilesFilter}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="min-w-[100px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  ID
                </th>
                <th className="min-w-[250px] px-4 py-4 font-medium text-dark dark:text-white">
                  Nama File
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Deskripsi
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal Dibuat
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Terakhir Diubah
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
                <tr key={item.id} className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-4 xl:pl-7.5">
                    <p className="font-medium text-dark dark:text-white">
                      {item.id}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <HiOutlineDocument className="h-5 w-5 text-blue-500 mr-2" />
                      <p className="text-dark dark:text-white">
                        {getFileName(item.files)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {item.deskripsi || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {formatIndonesianDateTime(item.createdDate)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {formatIndonesianDateTime(item.updatedDate)}
                    </p>
                  </td>
                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleUpdateClick(item.id, getFileName(item.files))}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-blue-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-blue-600 hover:pr-6"
                        title={`Update ${getFileName(item.files)}`}
                      >
                        <span className="text-[20px]">
                          <HiOutlinePencilSquare />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Update
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

      {/* Modal Upload File */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
              <h3 className="text-xl font-bold text-gray-800">Update File</h3>
              <button
                onClick={handleCloseModal}
                disabled={uploadLoading}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                {/* <HiX className="h-5 w-5" /> */}
                X
              </button>
            </div>

            {/* Body Modal */}
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">File saat ini:</p>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <HiOutlineDocument className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700 font-medium">{selectedFileName}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File Baru
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <HiOutlineDocument className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-700">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                <p>• Maksimal ukuran file: 10MB</p>
                <p>• File baru akan menggantikan file yang sudah ada</p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                disabled={uploadLoading}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={uploadLoading || !selectedFile}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {uploadLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {uploadLoading ? 'Mengupload...' : 'Update File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainPage;