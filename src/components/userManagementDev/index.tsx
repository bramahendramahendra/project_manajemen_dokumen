import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import {
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowTopRightOnSquare
} from "react-icons/hi2";
import { User, UserResponse } from "@/types/user";
import Pagination from "@/components/pagination/Pagination";

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dataList, setDataList] = useState<User[]>([]);
  const [suspendedStatus, setSuspendedStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  
  // State untuk filter
  const [filters, setFilters] = useState({
    username: '',
    department_id: '',
    level_id: '',
    is_active: '',
    sort_by: '',
    sort_dir: 'DESC'
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDelete, setItemDelete] = useState<number | string | null>(null);

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

      const response = await apiRequest(`/users/with-deleted?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data user tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserResponse = await response.json();
      
       const users: User[] = result.responseData.items.map((item: any) => ({
          userid: item.userid,
          username: item.username,
          name: item.name,
          role: item.role,
          dinas: item.nama_dinas,
          isActive: item.is_active,
      }));

      // Set data dari response
      setDataList(users);
      setTotalPages(result.responseMeta.total_pages);
      setTotalRecords(result.responseMeta.total_records);

      // Inisialisasi suspendedStatus berdasarkan is_active
      const initialSuspendedStatus: { [key: string]: boolean } = {};
      result.responseData.items.forEach(user => {
        // is_active === 0 berarti suspended (true), is_active === 1 berarti active (false)
        initialSuspendedStatus[user.userid] = user.isActive === 0;
      });
      setSuspendedStatus(initialSuspendedStatus);

    } catch (err: any) {
      setError(
        err.message === "Failed to fetch"
          ? "Gagal mengambil data user"
          : err.message,
      );
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [currentPage, itemsPerPage]);

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handler untuk perubahan items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk filter
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handler untuk apply filter
  const handleApplyFilter = () => {
    setCurrentPage(1); // Reset ke halaman pertama saat filter
    fetchData(1, itemsPerPage, filters);
  };

  // Handler untuk reset filter
  const handleResetFilter = () => {
    setFilters({
      username: '',
      department_id: '',
      level_id: '',
      is_active: '',
      sort_by: '',
      sort_dir: 'ASC'
    });
    setCurrentPage(1);
    fetchData(1, itemsPerPage, {});
  };

  const handleEdit = (userid: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
   
    if (!user) return alert("Token tidak ditemukan!");
    const encrypted = encryptObject({ userid }, user);

    router.push(`/user_management/edit_user/mz?${key}=${encrypted}`);
  };

  const handleActivate = async (userid: string) => {
    // Toggle suspendedStatus untuk UI
    const newStatus = !suspendedStatus[userid];
    setSuspendedStatus((prevStatus) => ({
      ...prevStatus,
      [userid]: newStatus
    }));
    
    try {
      // Nilai is_active: 0 = suspen, 1 = active
      const newIsActive = newStatus ? 0 : 1;
      
      const response = await apiRequest(`/users/is-active/${userid}`, "PUT", {
        is_active: newIsActive
      });

      if (!response.ok) {
        throw new Error("Gagal mengubah status user");
      }
      
      // Refresh data untuk memastikan konsistensi
      fetchData(currentPage, itemsPerPage, filters);
      
    } catch (err: any) {
      // Jika gagal, kembalikan status ke nilai semula
      setSuspendedStatus((prevStatus) => ({
        ...prevStatus,
        [userid]: !newStatus
      }));
      
      alert("Gagal mengubah status user: " + (err.message || "Terjadi kesalahan"));
    }
  };

  // Handler untuk detail user
  const handleDetailsClick = (userid: string) => {
    router.push(`/user_management/detail/${userid}`);
  };

  // Handler untuk membuka modal konfirmasi hapus
  const handleDeleteClick = (userid: string) => {
    setItemDelete(userid);
    setShowDeleteModal(true);
  };

  // Handler untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (!itemDelete) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiRequest(`/users/${itemDelete}`, 'DELETE');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Gagal menghapus data');
      }

      setSuccess(true);
      // Refresh data setelah hapus
      fetchData(currentPage, itemsPerPage, filters);
      setShowDeleteModal(false);
      setItemDelete(null);
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat menghapus data');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk membatalkan hapus
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemDelete(null);
  };

  // if (error) {
  //   return <UserManagement error="Data tidak ditemukan" />;
  // }

  return (
    <>
    {/* Filter Section */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card mb-4">
        <h2 className="text-lg font-semibold mb-4">Filter & Pencarian</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="Cari username..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C479F]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange('is_active', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C479F]"
            >
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Tidak Aktif</option>
            </select>
          </div>
          {/* <div>
            <label className="block text-sm font-medium mb-1">Urutkan</label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C479F]"
            >
              <option value="">Default</option>
              <option value="username">Username</option>
              <option value="name">Nama</option>
              <option value="email">Email</option>
              <option value="created_at">Tanggal Dibuat</option>
            </select>
          </div> */}
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleApplyFilter}
            className="px-4 py-2 bg-[#0C479F] text-white rounded-md hover:bg-[#0A3A7A] transition-colors"
          >
            Terapkan Filter
          </button>
          <button
            onClick={handleResetFilter}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Data berhasil dihapus!</p>}  
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Data User</h2>
          <div className="text-sm text-gray-600">
            Menampilkan {dataList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data
          </div>
        </div>
        <div className="flex flex-col overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  User ID
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Name
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Username
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Role
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: itemsPerPage }).map((_, index) => (
                    <tr key={index}>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                    </tr>
                  )
                ) : dataList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                      {filters.username || filters.is_active 
                        ? "Tidak ada data yang sesuai dengan filter" 
                         : "Data belum tersedia"
                      } 
                    </td>
                  </tr>
                ) : dataList.map((item, index) => (
                    <tr key={index}>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5`}>
                        <p className="mt-[3px] text-body-sm font-medium">
                          {item.userid}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3`}>
                        <p className="text-dark dark:text-white">
                          {item.name}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3`} >
                        <p className="text-dark dark:text-white">
                          {item.username}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3`} >
                        <p className="text-dark dark:text-white">
                          {item.role}
                        </p>
                      </td>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}
                      >
                        <div className="flex items-center justify-end space-x-3.5">
                          <button
                            onClick={() => handleActivate(item.userid)}
                            className={`group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r ${
                              suspendedStatus[item.userid] 
                                ? 'from-[#4CAF50] to-[#2E7D32]' // Warna hijau untuk mengaktifkan
                                : 'from-[#F44336] to-[#B71C1C]'  // Warna merah untuk men-suspend
                            } px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:opacity-90 hover:pr-6`}
                          >
                            <span className="text-[20px]">
                              {suspendedStatus[item.userid] ? (
                                <HiOutlineLockOpen />
                              ) : (
                                <HiOutlineLockClosed />
                              )}
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              {suspendedStatus[item.userid]
                                ? "Aktivasi"
                                : "Suspend"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDetailsClick(item.userid)}
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
                            onClick={() => handleEdit(item.userid)}
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
                            onClick={() => handleDeleteClick(item.userid)}
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
                  ))}
            </tbody>
          </table>
          {/* Pagination */}
          {!loading && dataList.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
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
                Apakah anda yakin ingin menghapus user ini?
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
