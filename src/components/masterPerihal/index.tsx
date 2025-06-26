import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import { Perihal, PerihalResponse } from "@/types/perihal";
import { formatIndonesianDateTime } from "@/utils/dateFormatter";
import Pagination from "@/components/pagination/Pagination";

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dataList, setDataList] = useState<Perihal[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDelete, setItemDelete] = useState<number | string | null>(null);

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

      const response = await apiRequest(`/master_perihal/?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data perihal tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PerihalResponse = await response.json();
      
      const res: Perihal[] = result.responseData.items.map((item: any) => ({
        perihal: item.perihal,
        nama_perihal: item.nama_perihal,
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
          ? "Gagal mengambil data perihal"
          : err.message,
      );
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [currentPage, itemsPerPage, filters]);

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handler untuk perubahan items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk detail user
  const handleDetailsClick = (id: number) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    if (!user) return alert("Token tidak ditemukan!");

    const encrypted = encryptObject({ id }, user);
    
    router.push(`/master_perihal/detail_master_perihal/mz?${key}=${encrypted}`);


    // router.push(`/user_management/detail/${userid}`);
  };

  const handleEdit = (id: number, perihal: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    if (!user) return alert("Token tidak ditemukan!");

    const encrypted = encryptObject({ id, perihal }, user);
    
    router.push(`/master_perihal/edit/mz?${key}=${encrypted}`);
  };

  const handleDeleteClick = (id: number) => {
    setItemDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemDelete) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiRequest(`/master_perihal/${itemDelete}`, 'DELETE');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Gagal menghapus data');
      }

      setDataList(prevItems => prevItems.filter(item => 
        !(item.perihal === itemDelete)
      ));

      setShowDeleteModal(false);
      setSuccess(true);
      // Bisa tambahkan aksi tambahan seperti refresh data atau notifikasi
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat menghapus data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemDelete(null);
  };

  return (
    <>
      {/* Error and Success Messages */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Data berhasil dihapus!</p>}  
        
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Data Perihal</h2>
          <div className="text-sm text-gray-600">
            Menampilkan {dataList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Perihal
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                  Created
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Updated
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {
                loading ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <tr key={index}>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center text-red-500 font-semibold py-6">
                      {error}
                    </td>
                  </tr>
                ) : dataList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                      Data belum tersedia
                    </td>
                  </tr>
                ) : dataList.map((item, index) => (
                  <tr key={index}>
                    <td className={`border-[#eee] px-4 py-4 dark:border-dark-3`} >
                      <p className="text-dark dark:text-white">
                        {item.nama_perihal}
                      </p>
                    </td>
                    <td className={`border-[#eee] px-4 py-4 dark:border-dark-3`} >
                      <p className="text-dark dark:text-white">
                        {formatIndonesianDateTime(item.createdDate)}
                      </p>
                    </td>
                    <td className={`border-[#eee] px-4 py-4 dark:border-dark-3`} >
                      <p className="text-dark dark:text-white">
                        {formatIndonesianDateTime(item.updatedDate)}
                      </p>
                    </td>
                    <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}>
                      <div className="flex items-center justify-end space-x-3.5">
                        <button
                          onClick={() => handleDetailsClick(item.perihal)}
                          className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                        >
                          <span className="text-[20px]">
                            <HiOutlineArrowTopRightOnSquare />
                          </span>
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Detail
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(item.perihal, item.nama_perihal)}
                          className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-yellow-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:pr-6"
                        >
                          <span className="text-[20px]">
                            <HiOutlinePencilSquare />
                          </span>
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Edit
                          </span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.perihal)}
                          className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-red-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:pr-6"
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
                ))
              }
            </tbody>
          </table>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Konfirmasi Hapus
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Apakah anda yakin ingin menghapus jenis ini?
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainPage;
