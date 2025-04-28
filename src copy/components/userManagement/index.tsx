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
import { User } from "@/types/user";
import Pagination from "@/components/pagination/Pagination";
// import UserManagement from "../404/UserManagement/userManagement";

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
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(dataList.length / itemsPerPage);
  const currentItems = dataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemDelete, setItemDelete] = useState<number | string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/users/", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const users: User[] = result.responseData.items.map((item: any) => ({
          userid: item.userid,
          username: item.username,
          name: item.name,
          level_id: item.level_id,
          role: item.role,
        }));

        setDataList(users);
      } catch (err: any) {
        setError(
          err.message === "Failed to fetch"
            ? "Data tidak ditemukan"
            : err.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (userid: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const token = Cookies.get("token");
    if (!token) return alert("Token tidak ditemukan!");

    const encrypted = encryptObject({ userid }, token);

    router.push(`/user_management/edit_user/mz?${key}=${encrypted}`);
  };

  const handleActivate = (userid: string) => {
    setSuspendedStatus((prevStatus) => ({
      ...prevStatus,
      [userid]: !prevStatus[userid],
    }));
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
      const response = await apiRequest(`/setting_types/${itemDelete}`, 'DELETE');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.responseDesc || 'Gagal menghapus data');
      }

      setSuccess(true);
      // Bisa tambahkan aksi tambahan seperti refresh data atau notifikasi
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
      {/* Error and Success Messages */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Data berhasil dihapus!</p>}  
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
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
                ? Array.from({ length: 5 }).map((_, index) => (
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
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                      Data belum tersedia
                    </td>
                  </tr>
                ) : currentItems.map((item, index) => (
                    <tr key={index}>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5`}
                      >
                        <p className="mt-[3px] text-body-sm font-medium">
                          {item.userid}
                        </p>
                      </td>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                      >
                        <p className="text-dark dark:text-white">
                          {item.name}
                        </p>
                      </td>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                      >
                        <p className="text-dark dark:text-white">
                          {item.username}
                        </p>
                      </td>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                      >
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
                            className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                          >
                            <span className="text-[20px]">
                              {suspendedStatus[item.userid] ? (
                                <HiOutlineLockClosed />
                              ) : (
                                <HiOutlineLockOpen />
                              )}
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              {suspendedStatus[item.userid]
                                ? "Suspend"
                                : "Continue"}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
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
                Apakah anda yakin ingin menghapus?
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
