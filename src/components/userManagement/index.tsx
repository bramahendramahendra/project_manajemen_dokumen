import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import Cookies from "js-cookie";
import { HiOutlineLockClosed, HiOutlineLockOpen, HiOutlinePencilSquare, HiOutlineArrowTopRightOnSquare, HiOutlineTrash, HiOutlineKey, HiMagnifyingGlass, HiOutlineXCircle } from "react-icons/hi2";
import { User, UserResponse } from "@/types/user";
import Pagination from "@/components/pagination/Pagination";
import SuccessModalLink from '../modals/successModalLink';

const MainPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dataList, setDataList] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // State untuk pagination dan filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [suspendedStatus, setSuspendedStatus] = useState<{
    [key: string]: boolean;
  }>({});

  // State untuk modal delete - diperlukan untuk fitur hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDelete, setItemDelete] = useState<number | string | null>(null);

  // State untuk modal reset lupa password
  const [showResetModal, setShowResetModal] = useState(false);
  const [itemReset, setItemReset] = useState<string | null>(null);

  // State untuk modal reset password
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [itemResetPassword, setItemResetPassword] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);

  // State untuk SuccessModalLink
const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

  // Function untuk fetch data dengan parameter - dibungkus dengan useCallback
  const fetchData = useCallback(async (page = 1, perPage = 10, filterParams = {}) => {
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

      const response = await apiRequest(`/users/?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data user tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserResponse = await response.json();

      // Validasi struktur response - PERSIS seperti master dinas
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      const res: User[] = result.responseData.items.map((item: any) => ({
          userid: item.userid,
          username: item.username,
          name: item.name,
          role: item.role,
          dinas: item.nama_dinas,
          isActive: item.is_active,
          lupaPass: item.lupa_pass || 0, // Tambahan field lupa_pass
      }));

      // Set data dari response
      setDataList(res);
      setTotalPages(result.responseMeta.total_pages);
      setTotalRecords(result.responseMeta.total_records);

      // Inisialisasi suspendedStatus berdasarkan isActive
      const initialSuspendedStatus: { [key: string]: boolean } = {};
      res.forEach(user => {
        // isActive === 0 berarti suspended (true), isActive === 1 berarti active (false)
        initialSuspendedStatus[user.userid] = user.isActive === 0;
      });
      setSuspendedStatus(initialSuspendedStatus);

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
  }, []);

  useEffect(() => {
    if (filters.search !== searchTerm) {
      setSearchLoading(true);
    }
    fetchData(currentPage, itemsPerPage, filters);
  }, [searchTerm, currentPage, itemsPerPage, filters, fetchData]);

  // Auto hide success message after 5 seconds - PERSIS seperti master dinas
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
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


  // Handler untuk activate/suspend user
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
      
      const response = await apiRequest(`/users/is-active/${userid}`, "POST", {
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

  // Handler untuk edit user
  const handleEdit = (userid: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    
    if (!user) return alert("Token tidak ditemukan!");
    const encrypted = encryptObject({ userid }, user);

    router.push(`/user_management/edit_user/mz?${key}=${encrypted}`);
  };

  // Handler untuk detail user
  const handleDetailsClick = (userid: string) => {
     const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
   
    if (!user) return alert("Token tidak ditemukan!");
    const encrypted = encryptObject({ userid }, user);

    router.push(`/user_management/detail/mz?${key}=${encrypted}`);
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
      const response = await apiRequest(`/users/delete/${itemDelete}`, 'POST');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Gagal menghapus data');
      }

      setSuccess(true);
      // Refresh data setelah hapus
      fetchData(currentPage, itemsPerPage, filters);
      setShowDeleteModal(false);
      setItemDelete(null);
      
      // Tampilkan modal sukses
      setIsSuccessModalOpen(true);
      
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

  // Handler untuk SuccessModalLink
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  // Handler untuk reset lupa password
  const handleResetLupaPassClick = (userid: string) => {
    setItemReset(userid);
    setShowResetModal(true);
  };

  // Handler untuk konfirmasi reset lupa password
  const handleConfirmResetLupaPass = async () => {
    if (!itemReset) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiRequest(`/users/reset-lupa-pass/${itemReset}`, 'POST', {
        lupa_pass: null
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Gagal mereset lupa password');
      }

      setSuccess(true);
      // Refresh data setelah reset
      fetchData(currentPage, itemsPerPage, filters);
      setShowResetModal(false);
      setItemReset(null);
      
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mereset lupa password');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk membatalkan reset lupa password
  const handleCancelResetLupaPass = () => {
    setShowResetModal(false);
    setItemReset(null);
  };

  // Handler untuk reset password
  const handleResetPasswordClick = (userid: string) => {
    setItemResetPassword(userid);
    setResetPassword('');
    setIsDefaultPassword(false);
    setShowResetPasswordModal(true);
  };

  // Handler untuk checkbox password default
  const handleCheckboxChange = () => {
    setIsDefaultPassword(!isDefaultPassword);
    setResetPassword(!isDefaultPassword ? 'm@nAj3mendokumen' : '');
  };

  // Handler untuk konfirmasi reset password
  const handleConfirmResetPassword = async () => {
    if (!itemResetPassword) return;

    if (!resetPassword || resetPassword.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiRequest(`/users/reset-password/${itemResetPassword}`, 'POST', {
        password: resetPassword
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Gagal mereset password');
      }

      setSuccess(true);
      // Refresh data setelah reset password
      fetchData(currentPage, itemsPerPage, filters);
      setShowResetPasswordModal(false);
      setItemResetPassword(null);
      setResetPassword('');
      setIsDefaultPassword(false);
      
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mereset password');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk membatalkan reset password
  const handleCancelResetPassword = () => {
    setShowResetPasswordModal(false);
    setItemResetPassword(null);
    setResetPassword('');
    setIsDefaultPassword(false);
  };

  // Render loading skeleton - PERSIS seperti master dinas
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
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
            {filters.search ? "Tidak ada hasil pencarian" : "Data user management belum tersedia"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {filters.search 
              ? `Tidak ditemukan hasil untuk &quot;${filters.search}&quot;`
              : "Belum ada user management yang ditambah"
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

  return (
    <>
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

      {/* Data Table */}
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-md dark:bg-gray-dark dark:shadow-card">
        {/* Header Section with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              Data User
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
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Dinas
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
                      <td className="border-[#eee] px-4 py-4 dark:border-dark-3">
                        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                      </td>
                    </tr>
                  )
                ) : dataList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                        Data belum tersedia
                    </td>
                  </tr>
                ) : dataList.map((item, index) => (
                    <tr 
                      key={index} 
                      className={item.lupaPass === 1 ? "bg-red-50 dark:bg-red-900/20" : ""}
                    >
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                        item.lupaPass === 1 ? "border-red-200 dark:border-red-800" : ""
                      }`}>
                        <p className="mt-[3px] text-body-sm font-medium">
                          {item.userid}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                        item.lupaPass === 1 ? "border-red-200 dark:border-red-800" : ""
                      }`}>
                        <p className="text-dark dark:text-white">
                          {item.name}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                        item.lupaPass === 1 ? "border-red-200 dark:border-red-800" : ""
                      }`}>
                        <p className="text-dark dark:text-white">
                          {item.username}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                        item.lupaPass === 1 ? "border-red-200 dark:border-red-800" : ""
                      }`}>
                        <p className="text-dark dark:text-white">
                          {item.role}
                        </p>
                      </td>
                       <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${
                        item.lupaPass === 1 ? "border-red-200 dark:border-red-800" : ""
                      }`}>
                        <p className="text-dark dark:text-white">
                          {item.dinas}
                        </p>
                      </td>
                      <td className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${
                        item.lupaPass === 1 ? "border-red-200 dark:border-red-800" : ""
                      }`}>
                        <div className="flex items-center justify-end space-x-2">
                          {/* Button Lupa Password - hanya muncul jika lupa_pass === 1 */}
                          {item.lupaPass === 1 && (
                            <button
                              onClick={() => handleResetPasswordClick(item.userid)}
                              className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-3 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:opacity-90 hover:pr-5"
                            >
                              <span className="text-[18px]">
                                <HiOutlineKey />
                              </span>
                              <span className="max-w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100 whitespace-nowrap overflow-hidden">
                                Reset Pass
                              </span>
                            </button>
                          )}

                          {/* Button Activate/Suspend */}
                          <button
                            onClick={() => handleActivate(item.userid)}
                            className={`group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r ${
                              suspendedStatus[item.userid] 
                                ? 'from-[#4CAF50] to-[#2E7D32]' // Warna hijau untuk mengaktifkan
                                : 'from-[#F44336] to-[#B71C1C]'  // Warna merah untuk men-suspend
                            } px-3 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:opacity-90 hover:pr-5`}
                          >
                            <span className="text-[18px]">
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

                          {/* Button Detail */}
                          <button
                            onClick={() => handleDetailsClick(item.userid)}
                            className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-3 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-5"
                          >
                            <span className="text-[18px]">
                              <HiOutlineArrowTopRightOnSquare />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Detail
                            </span>
                          </button>

                          {/* Button Edit */}
                          <button
                            onClick={() => handleEdit(item.userid)}
                            className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-3 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#d97706] hover:to-[#b45309] hover:pr-5"
                          >
                            <span className="text-[18px]">
                              <HiOutlinePencilSquare />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Edit
                            </span>
                          </button>

                          {/* Button Delete */}
                          <button
                            onClick={() => handleDeleteClick(item.userid)}
                            className="bg-gradient-to-r from-[#B91C1C] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#B91C1C] transition-all duration-300 text-white dark:bg-white/10 dark:text-white group relative flex items-center justify-center rounded-[7px] px-3 py-[10px] duration-300 ease-in-out overflow-hidden hover:px-5"
                          >
                            <span className="text-[18px]">
                              <HiOutlineTrash />
                            </span>
                            <span className="ml-0 w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100 whitespace-nowrap">
                              Hapus
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Pagination - Server Side */}
          {!loading && dataList.length > 0 && (
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

      {/* SuccessModalLink Component untuk Delete User */}
      <SuccessModalLink
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="User Berhasil Dihapus!"
        message="User telah berhasil dihapus dari sistem."
        showTwoButtons={true}
        primaryButtonText="Ke Dashboard"
        secondaryButtonText="Lanjutkan Kelola User"
        redirectPath="/dashboard"
      />

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Konfirmasi Hapus
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Apakah anda yakin ingin menghapus user ini?
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Iya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset Lupa Password */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Konfirmasi Reset Lupa Password
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Apakah anda yakin ingin mereset status lupa password untuk user ini?
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelResetLupaPass}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmResetLupaPass}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Iya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
                Reset Password User
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                Masukkan password baru untuk user ini
              </p>
            </div>
            
            <div className="mb-4">
              <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                Password Baru
              </label>
              <input
                type="text"
                placeholder="Masukkan password baru"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                disabled={isDefaultPassword}
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="defaultPasswordReset"
                  checked={isDefaultPassword}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label
                  htmlFor="defaultPasswordReset"
                  className="text-body-sm font-medium text-dark dark:text-white"
                >
                  Gunakan password default
                </label>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelResetPassword}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmResetPassword}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Mereset...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainPage;