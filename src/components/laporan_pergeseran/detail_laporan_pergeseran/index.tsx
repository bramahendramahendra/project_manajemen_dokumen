"use client";
import { useState, useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import { HiOutlineDocumentDownload, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";

type LaporanPergeseran = {
  id: number;
  deskripsi: string;
  tanggal: string;
};

// Data hardcode untuk pengujian
const hardcodedData: LaporanPergeseran[] = [
  { 
    id: 1, 
    deskripsi: "pergeseran anggaran atas uraian dari sub rincian obyek belanja", 
    tanggal: "20 Mei 2025" 
  },
  { 
    id: 2, 
    deskripsi: "pergeseran anggaran antar rincian obyek belanja dalam obyek belanja yang sama dan/atau pergeseran anggaran antar sub rincian obyek belanja dalam obyek belanja yang sama", 
    tanggal: "21 Mei 2025" 
  },
  { 
    id: 3, 
    deskripsi: "usulan pergeseran anggaran antar obyek belanja dalam jenis belanja yang sama", 
    tanggal: "22 Mei 2025" 
  }
];

const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(true);
  const [dataList, setDataList] = useState<LaporanPergeseran[]>(hardcodedData);
  const [dinasName, setDinasName] = useState<string>("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Mendapatkan informasi dinas dari URL parameters
  useEffect(() => {
    try {
      const key = process.env.NEXT_PUBLIC_APP_KEY || "defaultKey";
      const token = Cookies.get("token");
      const encryptedParam = searchParams.get(key);
      const idParam = searchParams.get("id");
      const namaParam = searchParams.get("nama");
      
      if (encryptedParam && token) {
        // Mode enkripsi
        const decrypted = decryptObject(encryptedParam, token);
        if (decrypted && decrypted.nama) {
          setDinasName(decrypted.nama);
        }
      } else if (idParam && namaParam) {
        // Mode parameter langsung
        setDinasName(decodeURIComponent(namaParam));
      } else {
        // Mencoba mendapatkan dari URL path (jika menggunakan routing dinamis)
        const pathSegments = window.location.pathname.split("/");
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment) {
          const formattedName = lastSegment.split("?")[0].replace(/-/g, " ");
          setDinasName(formattedName
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
          );
        }
      }
    } catch (error) {
      console.error("Error parsing dinas data:", error);
    }
  }, [searchParams]);

  const filteredDokumen = dataList.filter((item) =>
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDokumen.length / itemsPerPage);
  const currentItems = filteredDokumen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Function untuk memotong string dan hanya mengambil 5 kata pertama
  const truncateText = (text: string, wordCount: number = 5) => {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // ketika tombol download ini di tekan harusnya ke download EXCEL yang di simpan oleh usernya dan lampiran pembuatan dianya
  const handleDownloadClick = (id: number, deskripsi: string) => {
    const key = process.env.NEXT_PUBLIC_APP_KEY || "defaultKey";
    const token = Cookies.get("token");
    
    // Simulasi animasi loading tombol download
    const buttonElement = document.getElementById(`download-btn-${id}`);
    if (buttonElement) {
      buttonElement.classList.add("animate-pulse");
      
      setTimeout(() => {
        buttonElement.classList.remove("animate-pulse");
        // Tampilkan notifikasi sukses
        alert(`Dokumen "${truncateText(deskripsi, 3)}" berhasil diunduh`);
      }, 1000);
    }
    
    // Logika download sebenarnya bisa ditambahkan di sini
    console.log(`Mendownload dokumen dengan ID: ${id}`);
  };

  // Function untuk handle delete
  const handleDeleteClick = (id: number, deskripsi: string) => {
    // Konfirmasi sebelum menghapus
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus dokumen "${truncateText(deskripsi, 5)}"?`
    );
    
    if (isConfirmed) {
      // Simulasi animasi loading tombol delete
      const buttonElement = document.getElementById(`delete-btn-${id}`);
      if (buttonElement) {
        buttonElement.classList.add("animate-pulse");
        
        setTimeout(() => {
          buttonElement.classList.remove("animate-pulse");
          
          // Hapus item dari dataList
          setDataList(prevData => prevData.filter(item => item.id !== id));
          
          // Tampilkan notifikasi sukses
          alert(`Dokumen "${truncateText(deskripsi, 3)}" berhasil dihapus`);
          
          // Reset ke halaman 1 jika halaman saat ini kosong setelah delete
          const newFilteredData = dataList.filter(item => item.id !== id);
          const newTotalPages = Math.ceil(newFilteredData.length / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(1);
          }
        }, 1000);
      }
      
      // Logika delete ke API bisa ditambahkan di sini
      console.log(`Menghapus dokumen dengan ID: ${id}`);
    }
  };
  
  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-lg bg-white px-6 py-6 shadow-md dark:bg-gray-800 dark:shadow-none transition-all duration-300 hover:shadow-lg">
        <div className="mb-5">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Laporan Pergeseran Anggaran
            </h3>
            {dinasName && (
              <h4 className="text-[18px] font-medium text-blue-800 dark:text-blue-300">
                {dinasName}
              </h4>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {/* Menampilkan data pergeseran anggaran */}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari Deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-gray-700 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                />
                <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
          <table className="w-full table-auto" style={{ minWidth: '800px' }}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <th className="px-5 py-4 text-left font-medium text-dark dark:text-gray-200" style={{ width: '40%' }}>
                  Deskripsi
                </th>
                <th className="px-5 py-4 text-center font-medium text-dark dark:text-gray-200" style={{ width: '20%' }}>
                  Tanggal
                </th>
                <th className="px-5 py-4 text-right font-medium text-dark dark:text-gray-200" style={{ width: '40%', minWidth: '300px' }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item) => (
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150"
                  key={item.id}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <p className="font-medium text-dark dark:text-white" title={item.deskripsi}>
                        {truncateText(item.deskripsi, 8)}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-dark dark:text-white">
                      {item.tanggal}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ minWidth: '280px' }}>
                    <div className="flex items-center justify-end gap-3 flex-nowrap">
                      {/* Tombol Download */}
                      <button
                        id={`download-btn-${item.id}`}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6 focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 active:scale-[.98]"
                        onClick={() => handleDownloadClick(item.id, item.deskripsi)}
                      >
                        <span className="text-[20px]">
                          <HiOutlineDocumentDownload />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Download
                        </span>
                      </button>

                      {/* Tombol Delete */}
                      <button
                        id={`delete-btn-${item.id}`}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#DC2626] to-[#EF4444] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#DC2626] hover:to-[#DC2626] hover:pr-6 focus:ring-2 focus:ring-red-300 focus:ring-offset-1 active:scale-[.98]"
                        onClick={() => handleDeleteClick(item.id, item.deskripsi)}
                      >
                        <span className="text-[20px]">
                          <HiOutlineTrash />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-lg font-medium">Tidak ada data yang ditemukan</p>
                      <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
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
    </div>
  );
};

export default MainPage;