"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import Pagination from "../pagination/Pagination9";

type DataDinas = {
  id: number;
  nama_dinas: string;
  jumlah_dokumen_baru: number;
  icon?: string; // Opsional untuk ikon kustom
};

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<DataDinas[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest("/kotak_masuk/all-dinas", "GET");
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Data dinas tidak ditemukan");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Map data dari API ke format yang dibutuhkan komponen
        const formattedData: DataDinas[] = result.responseData.items.map((item: any) => ({
          id: item.dinas,
          nama_dinas: item.nama_dinas,
          jumlah_dokumen_baru: item.jumlah_dokumen_baru,
          icon: getIconByDinasName(item.nama_dinas), // Assign icon berdasarkan nama dinas
        }));

        setDataList(formattedData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message === "Failed to fetch" ? "Gagal mengambil data. Silakan coba lagi." : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk menentukan icon berdasarkan nama dinas
  const getIconByDinasName = (namaDinas: string): string => {
    const dinasName = namaDinas.toLowerCase();
    
    if (dinasName.includes('pendidikan') || dinasName.includes('sekolah')) return 'school';
    if (dinasName.includes('kesehatan') || dinasName.includes('medis')) return 'medical';
    if (dinasName.includes('lingkungan') || dinasName.includes('hidup')) return 'leaf';
    if (dinasName.includes('perhubungan') || dinasName.includes('transport')) return 'transport';
    if (dinasName.includes('sosial') || dinasName.includes('masyarakat')) return 'people';
    if (dinasName.includes('pekerjaan umum') || dinasName.includes('pu')) return 'building';
    if (dinasName.includes('pariwisata') || dinasName.includes('budaya')) return 'landmark';
    if (dinasName.includes('industri') || dinasName.includes('perdagangan')) return 'shop';
    if (dinasName.includes('pangan') || dinasName.includes('ketahanan')) return 'food';
    if (dinasName.includes('kependudukan') || dinasName.includes('sipil')) return 'id-card';
    if (dinasName.includes('tenaga kerja') || dinasName.includes('ketenagakerjaan')) return 'briefcase';
    if (dinasName.includes('ekonomi kreatif') || dinasName.includes('kreatif')) return 'camera';
    
    return 'default';
  };

  // Filter data berdasarkan pencarian
  const filteredData = dataList.filter(item => 
    item.nama_dinas.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'leaf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'transport':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'people':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197V9a3 3 0 00-3-3v0a3 3 0 00-3 3v6.5z" />
          </svg>
        );
      case 'building':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'landmark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
          </svg>
        );
      case 'shop':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'food':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
      case 'id-card':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      case 'briefcase':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2h8z" />
          </svg>
        );
      case 'camera':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

  // Handle navigasi ke detail dokumen
  const handleDinasClick = (item: DataDinas) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    if (!user) return alert("Token tidak ditemukan!");

    // console.log(item);
    

    const dinas = item.id
    const nama_dinas = item.nama_dinas
    const encrypted = encryptObject({ dinas, nama_dinas }, user);
    const formattedDinasName = item.nama_dinas.toLowerCase().replace(/\s+/g, "-");
    router.push(`/dokumen_masuk/${formattedDinasName}?${key}=${encrypted}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-dark">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded dark:bg-gray-600"></div>
            <div className="mt-2 h-4 w-80 bg-gray-200 animate-pulse rounded dark:bg-gray-600"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded dark:bg-gray-600"></div>
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded dark:bg-gray-600"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <div className="flex">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.length > 0 ? currentData.map((item) => (
            <div
              key={item.id}
              className="relative flex flex-col h-44 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 cursor-pointer overflow-hidden"
              onClick={() => handleDinasClick(item)}
            >
              {/* Badge notifikasi - hanya tampil jika ada notifikasi */}
              {item.jumlah_dokumen_baru > 0 && (
                <div className="absolute right-4 top-4 bg-red-500 text-white rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center text-xs font-bold">
                  {item.jumlah_dokumen_baru}
                </div>
              )}
              
              {/* Ikon dan konten */}
              <div className="flex flex-col items-center justify-center h-full">
                <div className="mb-4 text-blue-600 dark:text-blue-400">
                  {item.icon ? getIcon(item.icon) : getIcon('default')}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-white">
                    {item.nama_dinas}
                  </h3>
                </div>
              </div>
              
              {/* Hiasan kustom - lingkaran dekoratif */}
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-blue-50 opacity-50 dark:bg-blue-900 dark:opacity-20"></div>
            </div>
          )) : !loading && !error ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-12">
              <div className="h-24 w-24 text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="mb-1 text-xl font-medium text-gray-700">Tidak Ada Dinas Ditemukan</h3>
              <p className="text-gray-500">
                {searchTerm ? "Tidak ada dinas yang sesuai dengan pencarian Anda" : "Belum ada data dinas tersedia"}
              </p>
            </div>
          ) : null}
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