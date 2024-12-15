"use client";
import { useState, useEffect } from "react";
import Pagination from "../pagination.tsx/Pagination";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { useRouter } from "next/navigation";

type LaporanDokumen = {
  id: number;
  nama: string;
};

const dataLaporanDokumen: LaporanDokumen[] = [
  { id: 1, nama: "Dinas Pendidikan Pemuda dan Olahraga" },
  { id: 2, nama: "Dinas Kesehatan" },
  { id: 3, nama: "Dinas Pekerjaan Umum dan Penataan Ruang" },
  { id: 4, nama: "Dinas Sosial" },
  { id: 5, nama: "Dinas Perhubungan" },
  { id: 6, nama: "Dinas Pariwisata dan Kebudayaan" },
  { id: 7, nama: "Dinas Lingkungan Hidup" },
  { id: 8, nama: "Dinas Tenaga Kerja dan Transmigrasi" },
  { id: 9, nama: "Dinas Komunikasi dan Informatika" },
  { id: 10, nama: "Dinas Perindustrian dan Perdagangan" },
];

const MainPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDokumen = dataLaporanDokumen.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDokumen.length / itemsPerPage);

  const currentItems = filteredDokumen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatNamaForUrl = (nama: string) =>
    encodeURIComponent(nama.toLowerCase().replace(/\s+/g, "-"));

  const handleDetailsClick = (nama: string) => {
    const formattedNama = encodeURIComponent(
      nama.toLowerCase().replace(/\s+/g, "-")
    );
    router.push(`/laporan_dokumen/${formattedNama}`);
  };
  

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-4.5">
          <div className="flex items-center justify-between">
            <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
              {/* Cari Dokumen */}
            </label>
            <input
              type="text"
              placeholder="Cari Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px] rounded-[7px] bg-transparent px-5 py-2 text-dark ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="px-2 py-4 text-left font-medium text-dark dark:bg-gray-dark xl:pl-7.5">
                  Nama
                </th>
                <th className="px-4 py-4 pb-3.5 text-right font-medium text-dark xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item) => (
                <tr
                  className="hover:bg-gray-2 border-b border-stroke dark:border-dark-3"
                  key={item.id}
                >
                  <td className="px-2 py-4 dark:bg-gray-dark 2xsm:w-7 sm:w-60 md:w-90 xl:pl-7.5">
                    <div className="flex items-center gap-3.5">
                      <p className="font-medium text-dark dark:text-white">
                        {item.nama}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end">
                      <button
                        className="group active:scale-[.97]"
                        onClick={() => handleDetailsClick(item.nama)}
                      >
                        <div className="flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6">
                          <span className="text-[20px]">
                            <HiOutlineArrowTopRightOnSquare />
                          </span>
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Detail
                          </span>
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
