"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { DokumenTerupload } from "@/types/dokumenTerupload";

// const dokumenTeruploadData: DokumenTerupload[] = [
//   {
//     uraian: "DPA",
//     tanggal: new Date("2022-08-21T10:00:00Z"),
//     jumlahDocument: 6,
//   },
//   {
//     uraian: "RKA",
//     tanggal: new Date("2024-08-21T10:00:00Z"),
//     jumlahDocument: 3,
//   },
//   {
//     uraian: "Anggaran Kas",
//     tanggal: new Date("2023-08-21T10:00:00Z"),
//     jumlahDocument: 2,
//   },
// ];

const PengelolaanDokumen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dataList, setDataList] = useState<DokumenTerupload[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/document_managements/all-data/verif-done/type", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Document management data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const documents: DokumenTerupload[] = result.responseData.items.map((item: any) => ({
          typeID: item.type_id,
          uraian: item.jenis,
          jumlahDocument: item.total_validasi_done,
        }));

        setDataList(documents);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDetailsClick = (typeID: number, uraian: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    if (!user) return alert("Token tidak ditemukan!");
     const encrypted = encryptObject({ typeID, uraian }, user);

    // Ganti spasi dengan tanda hubung untuk URL-friendly
    const formattedUraian = uraian.replace(/\s+/g, "-").toLowerCase();
    // console.log(formattedUraian);
    // router.push(`/upload_dan_pengelolaan/${formattedUraian}?`);
    router.push(`/upload_dan_pengelolaan_admin/${formattedUraian}?${key}=${encrypted}`);
  };

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Dokumen yang sudah terupload
        </h4>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
              <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                Uraian
              </th>
              <th className="min-w-[150px] px-4 py-4 text-center font-medium text-dark dark:text-white">
                Jumlah
              </th>
              <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                Action
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
              ) : dataList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                    Data belum tersedia
                  </td>
                </tr>
              ) : dataList.map((item, index) => (
                <tr key={index}>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${
                      index === dataList.length - 1
                        ? "border-b-0"
                        : "border-b"
                    }`}
                  >
                    <p className="text-dark dark:text-white">{item.uraian}</p>
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 text-center dark:border-dark-3 ${
                      index === dataList.length - 1
                        ? "border-b-0"
                        : "border-b"
                    }`}
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.jumlahDocument}
                    </p>
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 text-right dark:border-dark-3 xl:pr-7.5 ${
                      index === dataList.length - 1
                        ? "border-b-0"
                        : "border-b"
                    }`}
                  >
                    <div className="flex items-center justify-end">
                      <div className="pl-1 capitalize text-dark dark:text-white">
                        <button
                          onClick={() => handleDetailsClick(item.typeID, item.uraian)}
                          className="group active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11"
                        >
                          <div
                            className="flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
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
      </div>
    </div>
  );
};

export default PengelolaanDokumen;
