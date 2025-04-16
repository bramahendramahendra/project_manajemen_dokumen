import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { Menu } from "@/types/menu";

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<Menu[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/menus/", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Menu data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const menus: Menu[] = result.responseData.items.map((item: any) => ({
          code: item.code,
          codeParent: item.code_parent,
          menu: item.menu,
          url: item.url,
          icon: item.icon,
        }));

        setDataList(menus);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (code: string, menu: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const token = Cookies.get("token");
    if (!token) return alert("Token tidak ditemukan!");

    const encrypted = encryptObject({ code, menu }, token);
    
    router.push(`/menu/edit_menu/mz?${key}=${encrypted}`);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
              <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                Code
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Code Parent
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Menu
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                URL
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Icon
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
                      {item.code}
                    </p>
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                  >
                    <p className="text-dark dark:text-white">
                      {item.codeParent}
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
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                  >
                    <p className="text-dark dark:text-white">
                      {item.url}
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
                        onClick={() => handleEdit(item.code, item.menu)}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-yellow-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:pr-6"
                      >
                        <span className="text-[20px]">
                          <HiOutlinePencilSquare />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Edit
                        </span>
                      </button>

                      <button className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-red-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:pr-6">
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
  );
};

export default MainPage;
