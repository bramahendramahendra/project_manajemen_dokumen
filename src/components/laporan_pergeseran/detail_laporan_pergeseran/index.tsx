"use client";
import { useState, useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import { HiOutlineDocumentDownload, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";

type LaporanPergeseran = {
  id: number;
  deskripsi: string;
  tanggal: string;
  file_unduh: string;
  dateObject: Date; // Untuk sorting dan display
};

// Interface untuk response API
interface ApiResponseItem {
  deskripsi: string;
  tanggal: string;
  file_unduh: string;
}

interface ApiResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: ApiResponseItem[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<LaporanPergeseran[]>([]);
  const [dinasName, setDinasName] = useState<string>("");
  const [dinasId, setDinasId] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State untuk modal download
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDownloadData, setSelectedDownloadData] = useState<{
    documentTitle: string;
    filePath: string;
    fileName: string;
  } | null>(null);
  
  // State untuk loading download
  const [downloadingFile, setDownloadingFile] = useState(false);

  // Mendapatkan informasi dinas dari URL parameters
  useEffect(() => {
    try {
      const key = process.env.NEXT_PUBLIC_APP_KEY;
      const user = Cookies.get("user");
      
      if (!key) {
        console.error("NEXT_PUBLIC_APP_KEY tidak ditemukan");
        setError("Konfigurasi aplikasi tidak lengkap");
        setLoading(false);
        return;
      }

      if (!user) {
        console.error("Token user tidak ditemukan");
        setError("Token tidak ditemukan, silakan login ulang");
        setLoading(false);
        return;
      }

      // Cari parameter dengan format $key
      const encryptedParam = searchParams.get(`$${key}`);
      
      if (encryptedParam) {
        try {
          // Dekripsi parameter
          const decrypted = decryptObject(encryptedParam, user);
          if (decrypted && decrypted.nama && decrypted.id) {
            setDinasName(decrypted.nama);
            setDinasId(decrypted.id); // id dari decrypt adalah id_dinas
            console.log("Decrypted data:", decrypted);
          } else {
            throw new Error("Data dekripsi tidak valid");
          }
        } catch (decryptError) {
          console.error("Error dekripsi:", decryptError);
          setError("Gagal dekripsi data parameter");
          setLoading(false);
        }
      } else {
        setError("Parameter tidak ditemukan");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing dinas data:", error);
      setError("Terjadi kesalahan dalam memproses data");
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!dinasId) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest(`/reports/pergeseran-detail/${dinasId}`, "GET");
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Data laporan pergeseran tidak ditemukan");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        
        // Format data sesuai dengan interface LaporanPergeseran
        const formattedData: LaporanPergeseran[] = result.responseData.items.map((item: ApiResponseItem, index: number) => {
          const dateObject = new Date(item.tanggal);
          
          return {
            id: index + 1, // Generate ID untuk keperluan UI
            deskripsi: item.deskripsi,
            tanggal: dateObject.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            file_unduh: item.file_unduh,
            dateObject: dateObject
          };
        });

        setDataList(formattedData);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message === "Failed to fetch" ? "Gagal memuat data dari server" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dinasId]);

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

  // Fungsi untuk mendapatkan nama file dari path
  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || 'download';
  };

  // Fungsi untuk membuka modal download
  const openDownloadModal = (deskripsi: string, filePath: string) => {
    const fileName = getFileName(filePath);
    setSelectedDownloadData({
      documentTitle: deskripsi,
      filePath: filePath,
      fileName: fileName
    });
    setIsDownloadModalOpen(true);
  };

  // Fungsi untuk menutup modal download
  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
    setSelectedDownloadData(null);
  };

  // Function untuk handle download file
  const handleDownloadFile = async () => {
    if (!selectedDownloadData) return;

    try {
      setDownloadingFile(true);
      
      // Pastikan filePath tidak kosong
      if (!selectedDownloadData.filePath || selectedDownloadData.filePath.trim() === '') {
        throw new Error('Path file tidak valid');
      }

      // Hapus leading slash jika ada dan encode path
      const cleanFilePath = selectedDownloadData.filePath.startsWith('/') 
        ? selectedDownloadData.filePath.substring(1) 
        : selectedDownloadData.filePath;
      const encodedFilePath = encodeURIComponent(cleanFilePath);
      
      console.log('Downloading file from path:', cleanFilePath);
      
      // Menggunakan downloadFileRequest helper untuk download
      const response = await downloadFileRequest(`/kotak_masuk/download/${encodedFilePath}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File tidak ditemukan: ${cleanFilePath}`);
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.ResponseDesc || 'Format file tidak valid');
          } catch (parseError) {
            throw new Error('Format file tidak valid');
          }
        } else {
          throw new Error(`Error ${response.status}: Gagal mengunduh file`);
        }
      }

      // Membuat blob dari response
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File kosong atau tidak dapat dibaca');
      }
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Membuat link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = selectedDownloadData.fileName;
      link.style.display = 'none';
      
      // Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('Download completed successfully');
      
      // Tutup modal setelah download berhasil
      closeDownloadModal();
      
    } catch (error) {
      console.error('Error downloading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh file';
      alert(`Gagal mengunduh file: ${errorMessage}`);
    } finally {
      setDownloadingFile(false);
    }
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
      
      // TODO: Implementasi API call untuk delete
      // const deleteResponse = await apiRequest(`/reports/pergeseran-detail/${id}`, "DELETE");
    }
  };
  
  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <td className="px-5 py-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
            <td className="px-5 py-4 text-center">
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center justify-end gap-3">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </td>
          </tr>
        </div>
      ))}
    </div>
  );
  
  // Tampilkan error jika ada
  if (error) {
    return (
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-lg bg-white px-6 py-6 shadow-md dark:bg-gray-800 dark:shadow-none">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
                {loading ? "Memuat data..." : `Total: ${filteredDokumen.length} dokumen`}
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
              {loading ? (
                <tr>
                  <td colSpan={3}>
                    <LoadingSkeleton />
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
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
                          onClick={() => openDownloadModal(item.deskripsi, item.file_unduh)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="text-lg font-medium">Tidak ada data yang ditemukan</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm ? "Coba ubah kata kunci pencarian" : "Belum ada laporan pergeseran untuk dinas ini"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {currentItems.length > 0 && !loading && (
            <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
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

        {/* Modal Download */}
        {isDownloadModalOpen && selectedDownloadData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
                <h3 className="text-xl font-bold text-gray-800">Konfirmasi Download</h3>
                <button
                  onClick={closeDownloadModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              
              {/* Konten Modal */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {/* Informasi Dokumen */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Dokumen yang akan diunduh:
                    </h4>
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedDownloadData.documentTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedDownloadData.fileName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Apakah Anda yakin ingin mengunduh file ini?
                  </p>
                </div>
              </div>
              
              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={closeDownloadModal}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDownloadFile}
                  disabled={downloadingFile}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {downloadingFile ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengunduh...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;