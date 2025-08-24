"use client";
import { useState, useEffect } from "react";
import Pagination from "../pagination/Pagination";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";

type LaporanDokumen = {
  id: number;
  nama: string;
};

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<LaporanDokumen[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter data berdasarkan pencarian
  const filteredDokumen = dataList.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDokumen.length / itemsPerPage);
  const currentItems = filteredDokumen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset halaman ke 1 ketika melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest("/reports/document", "GET");
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Data laporan dokumen tidak ditemukan");
          }
          throw new Error(`Terjadi kesalahan: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Validasi struktur response
        if (!result.responseData || !result.responseData.items) {
          throw new Error("Format data tidak valid");
        }
        
        const documents: LaporanDokumen[] = result.responseData.items.map((item: any) => ({
          id: item.id,
          nama: item.dinas,
        }));

        setDataList(documents);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(
          err.message === "Failed to fetch" 
            ? "Tidak dapat terhubung ke server" 
            : err.message
        );
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler untuk tombol detail
  const handleDetailsClick = (id: number, nama: string) => {
    // console.log(id);
    // console.log(nama);
    
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    
    if (!user) {
      alert("Sesi Anda telah berakhir, silakan login kembali!");
      return;
    }

    if (!key) {
      alert("Konfigurasi aplikasi tidak valid!");
      return;
    }
    
    try {
      const encrypted = encryptObject({ id, nama }, user);
      const formattedNama = encodeURIComponent(
        nama.toLowerCase().replace(/\s+/g, "-")
      );
      
      router.push(`/laporan_dokumen/${formattedNama}?${key}=${encrypted}`);
    } catch (error) {
      console.error("Error encrypting data:", error);
      alert("Terjadi kesalahan saat memproses data!");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Memuat data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Header dengan Search */}
        <div className="mb-4.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark dark:text-white">
              Laporan Dokumen
            </h2>
            <input
              type="text"
              placeholder="Cari nama dinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[250px] rounded-[7px] bg-transparent px-5 py-2 text-dark ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] dark:bg-gray-800">
                <th className="px-2 py-4 text-left font-medium text-dark dark:text-white xl:pl-7.5">
                  Nama Dinas
                </th>
                <th className="px-4 py-4 pb-3.5 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Kondisi ketika tidak ada data atau hasil pencarian kosong */}
              {currentItems.length === 0 && !loading ? (
                <tr>
                  <td colSpan={2} className="px-2 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-400 text-6xl mb-4">📄</div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        {searchTerm ? "Data tidak ditemukan" : "Data belum tersedia"}
                      </p>
                      {searchTerm && (
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                          Coba ubah kata kunci pencarian Anda
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr
                    className="hover:bg-gray-2 dark:hover:bg-gray-800 border-b border-stroke dark:border-dark-3 transition-colors"
                    key={item.id}
                  >
                    <td className="px-2 py-4 dark:bg-gray-dark xl:pl-7.5">
                      <div className="flex items-center gap-3.5">
                        <p className="font-medium text-dark dark:text-white">
                          {item.nama}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4 xl:pr-7.5">
                      <div className="flex items-center justify-end">
                        <button
                          className="group active:scale-[.97] transition-transform"
                          onClick={() => handleDetailsClick(item.id, item.nama)}
                          title={`Lihat detail ${item.nama}`}
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
                ))
              )}
            </tbody>
          </table>

          {/* Pagination hanya ditampilkan jika ada data */}
          {currentItems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;