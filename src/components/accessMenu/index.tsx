import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { AccessMenu } from "@/types/accessMenu";

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<AccessMenu[]>([]);
  
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AccessMenu | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/access_menus/", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Access Menu data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const accessMenus: AccessMenu[] = result.responseData.items.map((item: any) => ({
          levelId: item.level_id,
          role: item.role,
          codeMenu: item.code_menu,
          menu: item.menu,
        }));

        setDataList(accessMenus);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (levelId: string, codeMenu: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const token = Cookies.get("token");
    if (!token) return alert("Token tidak ditemukan!");

    const encrypted = encryptObject({ levelId, codeMenu }, token);
    
    router.push(`/menu/edit_access_menu/mz?${key}=${encrypted}`);
  };

  // Handler untuk membuka modal konfirmasi hapus
  const handleDeleteClick = (item: AccessMenu) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Handler untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        // Logika untuk menghapus item
        // const response = await apiRequest(`/access_menus/${itemToDelete.codeMenu}`, "DELETE");
        // if (response.ok) {
        //   // Filter item yang dihapus dari state
        //   setMenuData(prevItems => prevItems.filter(item => item.codeMenu !== itemToDelete.codeMenu));
        // }
        
        // Untuk sementara hanya simulasi penghapusan dari state lokal
        setDataList(prevItems => prevItems.filter(item => 
          !(item.codeMenu === itemToDelete.codeMenu && item.levelId === itemToDelete.levelId)
        ));
        
        // Tutup modal setelah selesai
        setShowDeleteModal(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  // Handler untuk membatalkan hapus
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  return (
    <>
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Level ID
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Role
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Code Menu
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Menu
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {
                loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
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
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center text-red-500 font-semibold py-6">
                      {error}
                    </td>
                  </tr>
                ) :  dataList.map((item, index) => (
                  <tr key={index}>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                    >
                      <p className="text-dark dark:text-white">
                        {item.levelId}
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
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                    >
                      <p className="text-dark dark:text-white">
                        {item.codeMenu}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                    >
                      <p className="text-dark dark:text-white">
                        {item.menu}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}
                    >
                      <div className="flex items-center justify-end space-x-3.5">
                        <button
                          onClick={() => handleEdit(item.levelId, item.codeMenu)}
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
                          onClick={() => handleDeleteClick(item)}
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
                Apakah anda yakin ingin menghapus menu <span className="font-semibold">{itemToDelete?.menu}</span>?
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