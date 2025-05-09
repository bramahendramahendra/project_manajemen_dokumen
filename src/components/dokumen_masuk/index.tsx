"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../pagination/Pagination9";

type DataDinas = {
  id: number;
  nama: string;
  namaDinas: string;
  notificationCount: number;
  icon?: string; // Opsional untuk ikon kustom
};

const data: DataDinas[] = [
  { id: 1, nama: "Andi Wijaya", namaDinas: "Dinas Pendidikan Pemuda dan Olahraga", notificationCount: 5, icon: "school" },
  { id: 2, nama: "Rina Suryani", namaDinas: "Dinas Kesehatan", notificationCount: 3, icon: "medical" },
  { id: 3, nama: "Dewi Lestari", namaDinas: "Dinas Lingkungan Hidup", notificationCount: 0, icon: "leaf" },
  { id: 4, nama: "Budi Santoso", namaDinas: "Dinas Perhubungan", notificationCount: 8, icon: "transport" },
  { id: 5, nama: "Siti Aminah", namaDinas: "Dinas Sosial", notificationCount: 2, icon: "people" },
  { id: 6, nama: "Eko Prasetyo", namaDinas: "Dinas Pekerjaan Umum", notificationCount: 0, icon: "building" },
  { id: 7, nama: "Yulianto", namaDinas: "Dinas Kebudayaan dan Pariwisata", notificationCount: 1, icon: "landmark" },
  { id: 8, nama: "Lina Marlina", namaDinas: "Dinas Perindustrian dan Perdagangan", notificationCount: 4, icon: "shop" },
  { id: 9, nama: "Agus Saputra", namaDinas: "Dinas Ketahanan Pangan", notificationCount: 7, icon: "food" },
  { id: 10, nama: "Ratna Dewi", namaDinas: "Dinas Kependudukan dan Pencatatan Sipil", notificationCount: 0, icon: "id-card" },
  { id: 11, nama: "Joko Pranoto", namaDinas: "Dinas Tenaga Kerja", notificationCount: 9, icon: "briefcase" },
  { id: 12, nama: "Maria Lestari", namaDinas: "Dinas Pariwisata dan Ekonomi Kreatif", notificationCount: 2, icon: "camera" }
];

const MainPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data berdasarkan pencarian
  const filteredData = data.filter(item => 
    item.namaDinas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hitung total halaman
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Data yang ditampilkan di halaman saat ini
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fungsi untuk mendapatkan ikon berdasarkan tipe dinas
  const getIcon = (icon: string) => {
    switch(icon) {
      case 'school':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20v-6" />
          </svg>
        );
      case 'medical':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'building':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-dark">
        {/* Header dengan judul dan pencarian */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Dinas</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pilih dinas untuk melihat dokumen yang telah dikirimkan
            </p>
          </div>
          
          {/* Search Box */}
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <input
              type="text"
              placeholder="Cari dinas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset halaman saat pencarian
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.length > 0 ? currentData.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-col h-44 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 cursor-pointer overflow-hidden"
              onClick={() => router.push(`/dokumen_masuk/${item.namaDinas}`)}
            >
              {/* Badge notifikasi - hanya tampil jika ada notifikasi */}
              {item.notificationCount > 0 && (
                <div className="absolute right-4 top-4 bg-red-500 text-white rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center text-xs font-bold">
                  {item.notificationCount}
                </div>
              )}
              
              {/* Ikon dan konten */}
              <div className="flex flex-col items-center justify-center h-full">
                <div className="mb-4 text-blue-600 dark:text-blue-400">
                  {item.icon ? getIcon(item.icon) : getIcon('default')}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-white">
                    {item.namaDinas}
                  </h3>
                  {/* <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.nama}
                  </p> */}
                </div>
              </div>
              
              {/* Hiasan kustom - lingkaran dekoratif */}
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-blue-50 opacity-50 dark:bg-blue-900 dark:opacity-20"></div>
            </div>
          )) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-12">
              <div className="h-24 w-24 text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="mb-1 text-xl font-medium text-gray-700">Tidak Ada Dinas Ditemukan</h3>
              <p className="text-gray-500">Tidak ada dinas yang sesuai dengan pencarian Anda</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;