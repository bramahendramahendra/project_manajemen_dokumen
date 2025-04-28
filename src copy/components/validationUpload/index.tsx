"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import { HiOutlineArrowTopRightOnSquare} from "react-icons/hi2";
import { ValidationUpload } from "@/types/validationUpload";
import Pagination from "@/components/pagination/Pagination";

// const validationUpload: ValidationUpload[] = [
//   { skpd: "Dinas Pendidikan", belumValidasi: 1 },
//   { skpd: "Dinas Kesehatan", belumValidasi: 3 },
//   { skpd: "Dinas Pertanian", belumValidasi: 5 },
//   { skpd: "Dinas Kelautan", belumValidasi: 0 },
//   { skpd: "Dinas Kesejahteraan", belumValidasi: 1 },
//   { skpd: "Dinas Politik", belumValidasi: 4 },
//   { skpd: "Dinas Pertahanan", belumValidasi: 1 },
//   { skpd: "Dinas Keuangan", belumValidasi: 5 },
// ];

// const itemsPerPage = 5;

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<boolean>(false);
  const [dataList, setDataList] = useState<ValidationUpload[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(dataList.length / itemsPerPage);
  const currentItems = dataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/document_managements/all-data/verif-pending/officials", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Document management verifikasi data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const data: ValidationUpload[] = result.responseData.items.map((item: any) => ({
          id: item.dinas_id,
          skpd: item.dinas,
          validasiPending: item.total_validasi_pending,
        }));

        setDataList(data);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatSkpdForUrl = (skpd: string) =>
    skpd.toLowerCase().replace(/\s+/g, "-");

  const handleDetailClick = (id: number, skpd: string, total: number) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const token = Cookies.get("token");
    if (!token) return alert("Token tidak ditemukan!");
     const encrypted = encryptObject({ id, skpd, total }, token);

    const formattedSkpd = formatSkpdForUrl(skpd);
    router.push(`/validation_upload/${formattedSkpd}?${key}=${encrypted}`);
    // router.push(`/validation_upload/${formattedSkpd}`);
  };

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Lakukan validasi dokumen dengan cermat
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="px-2 py-4 text-left font-medium text-dark dark:bg-gray-dark xl:pl-7.5">
                  SKPD
                </th>
                <th className="px-4 py-4 pb-3.5 font-medium text-dark">
                  Belum di validasi
                </th>
                <th className="px-4 py-4 pb-3.5 text-right font-medium text-dark xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {
                loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
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
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="text-center text-red-500 font-semibold py-6">
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                      Data belum tersedia
                    </td>
                  </tr>
                ) : currentItems.map((item, key) => (
                  <tr className={`hover:bg-gray-2 ${
                      key === currentItems.length - 1
                        ? ""
                        : "border-b border-stroke dark:border-dark-3"
                    }`}
                    key={key}
                  >
                    <td className="px-2 py-4 dark:bg-gray-dark 2xsm:w-7 sm:w-60 md:w-90 xl:pl-7.5">
                      <div className="flex items-center gap-3.5">
                        <p className="font-medium text-dark dark:text-white">
                          {item.skpd.replace(/_/g, " ")}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center">
                        <div className="pl-1 capitalize text-dark dark:text-white">
                          {item.validasiPending}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 xl:pr-7.5">
                      <div className="flex items-center justify-end">
                        <div className="pl-1 capitalize text-dark dark:text-white">
                          <button className="group active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11">
                            <div
                              className="flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                              onClick={() => handleDetailClick(item.id, item.skpd, item.validasiPending)}
                            >
                              <span className="text-[20px]">
                                <HiOutlineArrowTopRightOnSquare />
                              </span>
                              {/* Teks Detail yang muncul saat hover */}
                              <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                                Detail
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
