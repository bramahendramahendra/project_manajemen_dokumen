"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../pagination/Pagination9";

type DataDinas = {
  id: number;
  nama: string;
  namaDinas: string;
};

const data: DataDinas[] = [
  { id: 1, nama: "Andi Wijaya", namaDinas: "Dinas Pendidikan Pemuda dan Olahraga" },
  { id: 2, nama: "Rina Suryani", namaDinas: "Dinas Kesehatan" },
  { id: 3, nama: "Dewi Lestari", namaDinas: "Dinas Lingkungan Hidup" },
  { id: 4, nama: "Budi Santoso", namaDinas: "Dinas Perhubungan" },
  { id: 5, nama: "Siti Aminah", namaDinas: "Dinas Sosial" },
  { id: 6, nama: "Eko Prasetyo", namaDinas: "Dinas Pekerjaan Umum" },
  { id: 7, nama: "Yulianto", namaDinas: "Dinas Kebudayaan dan Pariwisata" },
  { id: 8, nama: "Lina Marlina", namaDinas: "Dinas Perindustrian dan Perdagangan" },
  { id: 9, nama: "Agus Saputra", namaDinas: "Dinas Ketahanan Pangan" },
  { id: 10, nama: "Ratna Dewi", namaDinas: "Dinas Kependudukan dan Pencatatan Sipil" },
  { id: 11, nama: "Joko Pranoto", namaDinas: "Dinas Tenaga Kerja" },
  { id: 12, nama: "Maria Lestari", namaDinas: "Dinas Pariwisata dan Ekonomi Kreatif" }
];

const MainPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Hitung total halaman
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Data yang ditampilkan di halaman saat ini
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="col-span-12 xl:col-span-12 ">
      <div className="rounded-[10px] px-7.5 pt-4 bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          {/* Dinas dan Pegawai */}
        </h4>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 py gap-4">
          {currentData.map((item) => (
            <div
              key={item.id}
              className="flex rounded-[7px] flex-col py-16 items-center justify-center border border-gray-300 p-4 cursor-pointer transition duration-300 hover:bg-[#0C479F] hover:text-white"
              onClick={() => router.push(`/dokumen_masuk/${item.nama}`)}
            >
              {/* <div className="w-full h-24 border mb-2" /> */}
              <p className="text-center text-[22px] font-medium">
                {item.nama || "Nama Kosong"}
              </p>
              <p className="text-center text-[14px] text-gray-400">
                {item.namaDinas}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="my-4 border-t pb-4 pl-7.5">
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
