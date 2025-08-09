import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Dinas, DinasResponse } from "@/types/dinas";
import { formatIndonesianDateTime } from "@/utils/dateFormatter";
import Pagination from "@/components/pagination/Pagination";

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<Dinas[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDelete, setItemDelete] = useState<number | string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [filters, setFilters] = useState({
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

      const response = await apiRequest(`/master_dinas/?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dinas tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: DinasResponse = await response.json();
      
      // Validasi struktur response
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      const res: Dinas[] = result.responseData.items.map((item: any) => ({
          id: item.dinas,
          dinas: item.nama_dinas,
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

  // Handler untuk edit
  const handleEdit = (id: number, dinas: string) => {
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
      const encrypted = encryptObject({ id, dinas }, user);
      router.push(`/master_dinas/edit/mz?${key}=${encrypted}`);
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
      const response = await apiRequest(`/master_dinas/delete/${itemDelete}`, 'POST');
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.responseDesc || 'Gagal menghapus data dinas');
      }

      setSuccess('Data dinas berhasil dihapus!');
      
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

  // Handler untuk retry ketika error
  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage, filters);
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
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
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
      </tr>
    ))
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={4} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Data dinas belum tersedia
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Silakan tambah data dinas terlebih dahulu
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
          <h2 className="text-xl font-semibold text-dark dark:text-white">Master Data Dinas</h2>
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
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Nama Dinas
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
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
                      {item.dinas}
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
                        onClick={() => handleEdit(item.id, item.dinas)}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-yellow-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:pr-6"
                        title={`Edit ${item.dinas}`}
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
                        title={`Hapus ${item.dinas}`}
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
                Apakah Anda yakin ingin menghapus data dinas ini? Tindakan ini tidak dapat dibatalkan.
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