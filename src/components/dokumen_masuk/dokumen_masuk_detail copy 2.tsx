"use client";
import Pagination from "../pagination/Pagination";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Interface untuk data API response
interface KirimanDokumen {
  dokumen: string;
  pengirim_nama: string;
  pengirim_date: string;
  judul: string;
  lampiran: string;
  file_name: string;
}

// Interface untuk data yang sudah diformat
interface FormattedKirimanDokumen {
  id: string;
  sender: string;
  senderDinas: string;
  date: string;
  lampiran: string;
  messageTitle: string;
  messageContent: string;
  fileName: string;
}

const DokumenMasukDetailDokumen = ({ senderNamaDinas }: { senderNamaDinas: string | null }) => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataKiriman, setDataKiriman] = useState<FormattedKirimanDokumen[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const [dinas, setDinas] = useState<number | null>(null);
  const [namaDinas, setNamaDinas] = useState<string | null>(null);

  const key = process.env.NEXT_PUBLIC_APP_KEY;
  const encrypted = searchParams.get(`${key}`);
  const user = Cookies.get("user");

  // Filter data berdasarkan nama dinas
  const filteredData = dataKiriman.filter(
    (item) => item.senderDinas === senderNamaDinas
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Data yang ditampilkan pada halaman saat ini
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dekripsi parameter URL
  useEffect(() => {
    if (!encrypted || !user) {
      setError("Token atau data tidak tersedia.");
      setLoading(false);
      return;
    }
    const result = decryptObject(encrypted, user);
    if (!result) {
      setError("Gagal dekripsi atau data rusak.");
      setLoading(false);
      return;
    }
    const { dinas, nama_dinas } = result;
    setDinas(dinas);
    setNamaDinas(nama_dinas);
  }, [encrypted, user]);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!dinas) return;
      
      try {
        setLoading(true);
        const response = await apiRequest(`/kotak_masuk/all-dinas/${dinas}`, "GET");
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Data kiriman dokumen tidak ditemukan");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Format data sesuai dengan interface
        const formattedData: FormattedKirimanDokumen[] = result.responseData.items.map((item: KirimanDokumen, index: number) => ({
          id: `${dinas}_${index}`, // Membuat ID unik dari dinas dan index
          sender: item.pengirim_nama,
          senderDinas: namaDinas || senderNamaDinas || "", // Menggunakan nama dinas dari parameter
          date: new Date(item.pengirim_date).toLocaleDateString('id-ID'), // Format tanggal Indonesia
          lampiran: item.dokumen,
          messageTitle: item.judul,
          messageContent: item.lampiran,
          fileName: item.file_name,
        }));

        setDataKiriman(formattedData);
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message === "Failed to fetch" ? "Gagal memuat data dari server" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dinas, namaDinas, senderNamaDinas]);

  // Fungsi untuk membuka modal pesan
  const openMessageModal = (title: string, content: string) => {
    setSelectedMessage({ title, content });
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Fungsi untuk download file
  const handleDownload = async (fileName: string, documentName: string) => {
    try {
      // Encode filename untuk URL (menghindari masalah dengan karakter khusus)
      const encodedFileName = encodeURIComponent(fileName);
      
      // Menggunakan apiRequest helper untuk download
      const response = await apiRequest(`/kotak_masuk/download/${encodedFileName}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("File tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Membuat blob dari response
      const blob = await response.blob();
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Membuat link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = documentName || fileName.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Gagal mengunduh file. Silakan coba lagi.');
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between py-5 px-4">
          <div>
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 mb-2"></div>
            <div className="flex items-center space-x-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="flex space-x-3">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-xl bg-white px-8 pt-6 pb-4 shadow-md dark:bg-gray-dark">
        {/* Header dengan nama dinas */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{senderNamaDinas || namaDinas}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Dokumen Masuk: <span className="font-medium text-blue-600">{filteredData.length}</span> item
            </p>
          </div>
          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Dinas
          </div>
        </div>

        {/* Konten */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="h-16 w-16 text-red-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium text-center">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-5 hover:bg-gray-50 transition rounded-lg px-4"
                >
                  {/* Informasi Utama */}
                  <div>
                    <p className="text-xl font-medium text-blue-600">{item.lampiran}</p>
                    <div className="flex items-center mt-1">
                      <div className="h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600 mr-3">{item.sender}</span>
                      
                      <div className="h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{item.date}</span>
                    </div>
                  </div>
                
                  {/* Tombol Aksi */}
                  <div className="flex space-x-3">
                    {/* Tombol Isi Pesan */}
                    <button
                      onClick={() => openMessageModal(item.messageTitle, item.messageContent)}
                      className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        Isi Pesan
                      </div>
                    </button>
                    
                    {/* Tombol Download */}
                    <button
                      onClick={() => handleDownload(item.fileName, item.lampiran)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                      </div>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="h-16 w-16 text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Tidak ada dokumen dari dinas ini</p>
                <p className="text-gray-400 text-sm mt-1">Dokumen akan muncul saat dinas mengirimkan dokumen</p>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination - hanya tampil jika ada data */}
        {currentData.length > 0 && !loading && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
        
        {/* Modal Isi Pesan */}
        {isModalOpen && selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
              {/* Header Modal */}
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Detail Pesan</h3>
                <button
                  onClick={closeModal}
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
              <div className="rounded-lg bg-blue-50 p-4 mb-5">
                <h4 className="mb-3 text-lg font-semibold text-blue-700">
                  {selectedMessage.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">{selectedMessage.content}</p>
              </div>
              
              {/* Footer Modal */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DokumenMasukDetailDokumen;