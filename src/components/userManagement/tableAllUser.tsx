import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";
import { useState } from "react";

const userData: User[] = [
  {
    userid: "M00001",
    name: "Free package",
    username: "freepackage",
    levelId: 1,
    levelUser: "Admin",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00002",
    name: "Standard Package",
    username: "standardackage",
    levelId: 2,
    levelUser: "Dinas",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00003",
    name: "Business Package",
    username: "usinessackage",
    levelId: 2,
    levelUser: "Dinas",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00004",
    name: "Standard Package",
    username: "tandardackage",
    levelId: 2,
    levelUser: "Dinas",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
];

const TableAllUser = () => {
  const router = useRouter();
  const [suspendedStatus, setSuspendedStatus] = useState<{ [key: string]: boolean }>({});


  const handleEdit = (userid: string) => {
    router.push(`/user_management/edit_user/${userid}`);
  };

  const handleActivate = (userid: string) => {
    setSuspendedStatus(prevStatus => ({
      ...prevStatus,
      [userid]: !prevStatus[userid] // Toggle status hanya untuk pengguna tertentu
    }));
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Users
      </h4> */}

      <div className="flex flex-col overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
              <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                User
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                SKPD
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                No HP
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Email
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                Keterangan
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                Created
              </th>
              <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {userData.map((userItem, index) => (
              <tr key={index}>
                <td
                  className={`sticky border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
                >
                  <h5 className="font-medium text-dark dark:text-white">
                    {userItem.name}
                  </h5>
                  <p className="mt-[3px] text-body-sm font-medium">
                    No ID. {userItem.userid}
                  </p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
                >
                  <p className="text-dark dark:text-white">{userItem.skpd}</p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
                >
                  <p className="text-dark dark:text-white">{userItem.notelp}</p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
                >
                  <p className="text-dark dark:text-white">{userItem.email}</p>
                </td>

                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
                >
                  <p
                    className={`inline-flex rounded-full px-3.5 py-1 text-body-sm font-medium ${
                      userItem.levelId === 2
                        ? "bg-[#219653]/[0.08] text-[#219653]"
                        : userItem.levelId === 1
                          ? "bg-[#D34053]/[0.08] text-[#D34053]"
                          : "bg-[#FFA70B]/[0.08] text-[#FFA70B]"
                    }`}
                  >
                    {userItem.levelUser}
                  </p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
                >
                  <p className="text-dark dark:text-white">
                    {userItem.createdDate}
                  </p>
                </td>
                <td
                  className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${index === userData.length - 1 ? "border-b-0" : "border-b"}`}
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
                        {suspendedStatus[userItem.userid] ? "Suspend" : "Continue"}
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

export default TableAllUser;
