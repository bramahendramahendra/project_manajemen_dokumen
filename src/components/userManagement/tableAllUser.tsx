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
} from "react-icons/hi2";
import { User } from "@/types/user";
import UserManagement from "../404/UserManagement/userManagement";

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User[]>([]);
  const [suspendedStatus, setSuspendedStatus] = useState<{
    [key: string]: boolean;
  }>({});

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

        setUserData(users);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
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

  
  if (error) {
    return (
      <UserManagement error="Data tidak ditemukan" />
    );
  }

  return (
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
              ?
                Array.from({ length: 5 }).map((_, index) => (
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
              : // Data sebenarnya ditampilkan di sini
                userData.map((userItem, index) => (
                  <tr key={index}>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5`}
                    >
                      <p className="mt-[3px] text-body-sm font-medium">
                        {userItem.userid}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                    >
                      <p className="text-dark dark:text-white">
                        {userItem.name}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                    >
                      <p className="text-dark dark:text-white">
                        {userItem.username}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3`}
                    >
                      <p className="text-dark dark:text-white">
                        {userItem.role}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5`}
                    >
                      <div className="flex items-center justify-end space-x-3.5">
                        <button
                          onClick={() => handleActivate(userItem.userid)}
                          className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                        >
                          <span className="text-[20px]">
                            {suspendedStatus[userItem.userid] ? (
                              <HiOutlineLockClosed />
                            ) : (
                              <HiOutlineLockOpen />
                            )}
                          </span>
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            {suspendedStatus[userItem.userid]
                              ? "Suspend"
                              : "Continue"}
                          </span>
                        </button>

                        <button
                          onClick={() => handleEdit(userItem.userid)}
                          className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-red-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:pr-6"
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
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MainPage;
