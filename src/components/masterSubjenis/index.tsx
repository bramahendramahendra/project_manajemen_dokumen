import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import Cookies from "js-cookie";
import { HiOutlinePencilSquare, HiOutlineTrash, HiMagnifyingGlass, HiOutlineXCircle } from "react-icons/hi2";
import { Subjenis, SubjenisResponse } from "@/types/subjenis";
import Pagination from "@/components/pagination/Pagination";

const MainPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<Subjenis[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDelete, setItemDelete] = useState<number | string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    sort_by: 'terakhir_diubah,tanggal_dibuat',
    sort_dir: 'DESC,DESC',
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

      const response = await apiRequest(`/master_subjenis/?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data subjenis tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: SubjenisResponse = await response.json();
      
      // Validasi struktur response
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }
      
      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }

      const res: Subjenis[] = result.responseData.items.map((item: any) => ({
        id: item.subjenis,
        idJenis: item.jenis,
        jenis: item.nama_jenis,
        subjenis: item.nama_subjenis,
        roles: (item.roles || []).map((role: any) => ({
          levelId: role.level_id,
          role: role.role
        })),
        createdDate: item.created_at,
        updatedDate: item.updated_at,
      }));

      // Set data dari response
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

  useEffect(() => {
    if (filters.search !== searchTerm) {
      setSearchLoading(true);
    }
    fetchData(currentPage, itemsPerPage, filters);
  }, [searchTerm, currentPage, itemsPerPage, filters]);

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

  // Handler untuk edit
  const handleEdit = (id: number, subjenis: string) => {
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
      const encrypted = encryptObject({ id, subjenis }, user);
      router.push(`/master_subjenis/edit/mz?${key}=${encrypted}`);
    } catch (error) {
      console.error("Error encrypting data:", error);
      alert("Terjadi kesalahan saat memproses data!");
    }
  };

  // Handler untuk menampilkan modal delete
  const handleDeleteClick = (id: number) => {
    setItemDelete(id);
    setShowDeleteModal(true);
  };

  // Handler untuk konfirmasi delete
  const handleConfirmDelete = async () => {
    if (!itemDelete) return;

    setDeleteLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiRequest(`/master_subjenis/delete/${itemDelete}`, 'POST');
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.responseDesc || 'Gagal menghapus data subjenis');
      }

      setSuccess('Data subjenis berhasil dihapus!');
      
      // Refresh data setelah delete
      await fetchData(currentPage, itemsPerPage, filters);
      
      // Close modal
      setShowDeleteModal(false);
      setItemDelete(null);
    } catch (error: any) {
      console.error("Error deleting data:", error);
      setError(error.message || 'Terjadi kesalahan saat menghapus data');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handler untuk membatalkan hapus
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemDelete(null);
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex space-x-1">
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end space-x-2">
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
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
            {filters.search ? "Tidak ada hasil pencarian" : "Data subjenis belum tersedia"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {filters.search 
              ? `Tidak ditemukan hasil untuk &quot;${filters.search}&quot;`
              : "Silakan tambah data subjenis terlebih dahulu"
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
        {/* Header Section with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              Master Data Subjenis
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
        
        <div className="max-w-full overflow-x-auto rounded-lg">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Nama Jenis
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Nama Subjenis
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Akses User
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
                      {item.jenis}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {item.subjenis}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.roles.map((role) => (
                        <span
                          key={`${role.levelId}-${role.role}`}
                          className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                            role.levelId === "DNS"
                              ? "bg-[#219653]/[0.08] text-[#219653]"
                              : role.levelId === "ADM"
                                ? "bg-[#D34053]/[0.08] text-[#D34053]"
                                : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                          }`}
                        >
                          {role.role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(item.id, item.subjenis)}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-yellow-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:pr-6"
                        title={`Edit ${item.subjenis}`}
                      >
                        <span className="text-[20px]">
                          <HiOutlinePencilSquare />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Edit
                        </span>
                      </button>

                      <button 
                        onClick={() => handleDeleteClick(item.id)}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-red-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:pr-6"
                        title={`Hapus ${item.subjenis}`}
                      >
                        <span className="text-[20px]">
                          <HiOutlineTrash />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Hapus
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
              totalRecords={totalRecords}
              loading={loading}
              isSearchActive={!!filters.search}
              searchTerm={filters.search}
            />
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-dark">
            <div className="mb-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <HiOutlineTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Konfirmasi Hapus Data
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Apakah Anda yakin ingin menghapus data subjenis ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleteLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainPage;