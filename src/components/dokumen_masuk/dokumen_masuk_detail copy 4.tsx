"use client";
import Pagination from "../pagination/Pagination";
import { apiRequest, downloadFileRequest  } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Interface untuk data API response
interface KirimanDokumen {
  pengirim_nama: string;
  pengirim_date: string;
  judul: string;
  lampiran: string;
  file_name: string;
  total_documents: number;
  documnet: {
    jenis: string;
    subjenis: string;
    total_files: number;
    files: Array<{
      file_doc: string;
    }>;
  }[];
}

// Interface untuk data yang sudah diformat
interface FormattedKirimanDokumen {
  id: string;
  sender: string;
  senderDinas: string;
  date: string;
  dateObject: Date; // Tambahan untuk perhitungan countdown
  lampiran: string;
  messageTitle: string;
  messageContent: string;
  messageJenisSubjenis: string[]; // Array untuk menyimpan "jenis - subjenis"
  fileName: string;
  documentFiles: { // Data lengkap dokumen untuk download
    jenis: string;
    subjenis: string;
    total_files: number;
    files: Array<{
      file_doc: string;
    }>;
  }[];
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
    jenisSubjenis: string[];
  } | null>(null);

  // State untuk modal download
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDownloadData, setSelectedDownloadData] = useState<{
    documentTitle: string;
    documentFiles: {
      jenis: string;
      subjenis: string;
      total_files: number;
      files: Array<{
        file_doc: string;
      }>;
    }[];
    fileName: string;
  } | null>(null);
  
  // State untuk loading download
  const [downloadingGroupIndex, setDownloadingGroupIndex] = useState<number | null>(null);
  const [downloadingAllFiles, setDownloadingAllFiles] = useState(false);

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

  // Fungsi untuk menghitung sisa hari sebelum terhapus otomatis
  const calculateDaysRemaining = (dateObject: Date): number => {
    const now = new Date();
    const deleteDate = new Date(dateObject);
    deleteDate.setDate(deleteDate.getDate() + 30); // Tambah 30 hari
    
    const timeDiff = deleteDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff); // Jangan biarkan negatif
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan sisa hari
  const getBadgeColor = (daysRemaining: number): string => {
    if (daysRemaining <= 5) return "bg-red-100 text-red-700 border-red-200";
    if (daysRemaining <= 10) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

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
        const user = JSON.parse(Cookies.get("user") || "{}");

        const response = await apiRequest(`/kotak_masuk/all/detail/${user.dinas}/${dinas}`, "GET");
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Data kiriman dokumen tidak ditemukan");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Format data sesuai dengan interface
        const formattedData: FormattedKirimanDokumen[] = result.responseData.items.map((item: KirimanDokumen, index: number) => {
          const dateObject = new Date(item.pengirim_date);
          
          // Format jenis dan subjenis menjadi array "jenis - subjenis"
          const jenisSubjenisArray = item.documnet?.map(doc => `${doc.jenis} - ${doc.subjenis}`) || [];
          
          return {
            id: `${dinas}_${index}`,
            sender: item.pengirim_nama,
            // sender: "",
            senderDinas: namaDinas || senderNamaDinas || "", // Menggunakan nama dinas dari parameter
            // senderDinas: "", // Menggunakan nama dinas dari parameter
            date: dateObject.toLocaleDateString('id-ID'), // Format tanggal Indonesia
            dateObject: dateObject, // Simpan object Date untuk perhitungan
            lampiran: item.judul,
            messageTitle: item.judul,
            messageContent: item.lampiran,
            messageJenisSubjenis: jenisSubjenisArray,
            fileName: item.file_name,
            documentFiles: item.documnet || [], // Simpan data dokumen lengkap
          };
        });

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
  const openMessageModal = (title: string, content: string, jenisSubjenis: string[]) => {
    setSelectedMessage({ title, content, jenisSubjenis });
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Fungsi untuk membuka modal download
  const openDownloadModal = (documentTitle: string, documentFiles: any[], fileName: string) => {
    setSelectedDownloadData({ documentTitle, documentFiles, fileName });
    setIsDownloadModalOpen(true);
  };

  // Fungsi untuk menutup modal download
  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
    setSelectedDownloadData(null);
  };

  // Fungsi untuk download file individual - VERSI YANG DIPERBAIKI
  const handleDownloadFile = async (filePath: string, documentName: string = '') => {
    try {
      // console.log('Downloading file from path:', filePath);
      
      // Pastikan filePath tidak kosong
      if (!filePath || filePath.trim() === '') {
        throw new Error('Path file tidak valid');
      }

      // Hapus leading slash jika ada dan encode path
      const cleanFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const encodedFilePath = encodeURIComponent(cleanFilePath);
      
      // console.log('Clean file path:', cleanFilePath);
      // console.log('Encoded file path:', encodedFilePath);
      
      // Menggunakan downloadFileRequest helper untuk download dengan path yang sudah di-encode
      const response = await downloadFileRequest(`/files/download/${encodedFilePath}`);
      
      // console.log('Download response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Coba ambil detail error dari response
          try {
            const errorData = await response.json();
            console.error('File not found details:', errorData);
            throw new Error(`File tidak ditemukan: ${cleanFilePath}`);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error(`File tidak ditemukan di server: ${cleanFilePath}`);
          }
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            console.error('Bad request details:', errorData);
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
      
      // console.log('Blob size:', blob.size, 'bytes');
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tentukan nama file untuk download
      let downloadFileName = documentName || 'download';
      
      // Jika documentName tidak ada ekstensi, ambil dari filePath
      if (documentName && !documentName.includes('.')) {
        const fileExtension = cleanFilePath.split('.').pop();
        if (fileExtension) {
          downloadFileName = `${documentName}.${fileExtension}`;
        }
      } else if (!documentName) {
        // Jika tidak ada documentName, gunakan nama file dari path
        downloadFileName = cleanFilePath.split('/').pop() || 'download';
      }
      
      // console.log('Download filename:', downloadFileName);
      
      // Membuat link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      link.style.display = 'none'; // Sembunyikan link
      
      // Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      // console.log('Download completed successfully');
      
      // Tampilkan notifikasi sukses (opsional)
      // alert(`File "${downloadFileName}" berhasil diunduh!`);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh file';
      alert(`Gagal mengunduh file: ${errorMessage}`);
    }
  };

  // Fungsi untuk mendapatkan nama file dari path
  const getFileName = (filePath: string): string => {
    return filePath.split('/').pop() || 'download';
  };

  // Fungsi untuk download semua file dalam satu kelompok jenis-subjenis
  const handleDownloadGroupFiles = async (groupIndex: number, jenis: string, subjenis: string, files: Array<{file_doc: string}>) => {
    if (!files || files.length === 0) return;
    
    setDownloadingGroupIndex(groupIndex);
    try {
      // Buat request body dengan list filepath
      const requestBody = {
        files: files.map(file => file.file_doc),
        zip_name: `${jenis}_${subjenis}`.replace(/[^a-zA-Z0-9]/g, '_') || 'document_group_files'
      };

      // console.log('Download group request:', requestBody);

      const response = await apiRequest('/files/download/multiple', 'POST', requestBody);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Nama file ZIP berdasarkan jenis dan subjenis
        const fileName = `${jenis}_${subjenis}_files.zip`.replace(/[^a-zA-Z0-9_.]/g, '_');
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // console.log(`File grup ${jenis} - ${subjenis} berhasil didownload sebagai ${fileName}`);
      } else {
        console.error('Download grup file gagal:', response.status);
        alert('Gagal mendownload file grup');
      }
    } catch (error) {
      console.error('Error downloading group files:', error);
      alert('Terjadi kesalahan saat mendownload file grup');
    } finally {
      setDownloadingGroupIndex(null);
    }
  };

  // Fungsi untuk download semua file (jenis-subjenis + file lainnya)
  const handleDownloadAllFiles = async () => {
    if (!selectedDownloadData) return;
    
    // Kumpulkan semua file path
    const allFiles: string[] = [];
    
    // Tambahkan file dari semua jenis-subjenis
    if (selectedDownloadData.documentFiles && selectedDownloadData.documentFiles.length > 0) {
      selectedDownloadData.documentFiles.forEach(docGroup => {
        docGroup.files.forEach(file => {
          allFiles.push(file.file_doc);
        });
      });
    }
    
    // Tambahkan file lainnya jika ada
    if (selectedDownloadData.fileName && selectedDownloadData.fileName.trim() !== '') {
      allFiles.push(selectedDownloadData.fileName);
    }
    
    if (allFiles.length === 0) {
      alert('Tidak ada file yang tersedia untuk didownload');
      return;
    }
    
    setDownloadingAllFiles(true);
    try {
      // Buat request body dengan list filepath
      const requestBody = {
        files: allFiles,
        zip_name: selectedDownloadData.documentTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'all_document_files'
      };

      // console.log('Download all request:', requestBody);

      const response = await apiRequest('/files/download/multiple', 'POST', requestBody);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Nama file ZIP berdasarkan judul dokumen
        const fileName = `${selectedDownloadData.documentTitle}_all_files.zip`.replace(/[^a-zA-Z0-9_.]/g, '_');
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // console.log(`Semua file berhasil didownload sebagai ${fileName}`);
      } else {
        console.error('Download semua file gagal:', response.status);
        alert('Gagal mendownload semua file');
      }
    } catch (error) {
      console.error('Error downloading all files:', error);
      alert('Terjadi kesalahan saat mendownload semua file');
    } finally {
      setDownloadingAllFiles(false);
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
              currentData.map((item) => {
                const daysRemaining = calculateDaysRemaining(item.dateObject);
                const badgeColor = getBadgeColor(daysRemaining);
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-5 hover:bg-gray-50 transition rounded-lg px-4"
                  >
                    {/* Informasi Utama */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-xl font-medium text-blue-600">{item.lampiran}</p>
                        
                        {/* Badge Countdown dengan Tooltip */}
                        <div className="relative group">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColor} cursor-help`}>
                            <svg 
                              className="w-3 h-3 mr-1" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                              />
                            </svg>
                            {daysRemaining === 0 ? 'Hari ini' : `${daysRemaining} hari`}
                          </span>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            <div className="text-center">
                              Pesan ini akan terhapus otomatis dalam {daysRemaining === 0 ? 'hari ini' : `${daysRemaining} hari lagi`}
                            </div>
                            {/* Arrow tooltip */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                      
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
                        onClick={() => openMessageModal(item.messageTitle, item.messageContent, item.messageJenisSubjenis)}
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
                        onClick={() => openDownloadModal(item.lampiran, item.documentFiles, item.fileName)}
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
                );
              })
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
              <div className="space-y-4">
                {/* Judul */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="text-lg font-semibold text-blue-700 mb-2">
                    {selectedMessage.title}
                  </h4>
                </div>

                {/* Jenis dan Subjenis */}
                {selectedMessage.jenisSubjenis && selectedMessage.jenisSubjenis.length > 0 && (
                  <div className="rounded-lg bg-amber-50 p-4">
                    <h5 className="text-sm font-semibold text-amber-700 mb-2">
                      Kategori Dokumen:
                    </h5>
                    <div className="space-y-1">
                      {selectedMessage.jenisSubjenis.map((jenisSubjenis, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                          <span className="text-amber-800 text-sm">{jenisSubjenis}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Isi Pesan */}
                {selectedMessage.content && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                      Isi Pesan:
                    </h5>
                    <p className="text-gray-700 leading-relaxed">{selectedMessage.content}</p>
                  </div>
                )}
              </div>
              
              {/* Footer Modal */}
              <div className="flex justify-end mt-6">
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

        {/* Modal Download */}
        {isDownloadModalOpen && selectedDownloadData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[80vh] rounded-xl bg-white shadow-xl overflow-hidden">
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
                <h3 className="text-xl font-bold text-gray-800">Download File</h3>
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

              {/* Header Document Title dengan Download All Button */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">
                  {selectedDownloadData.documentTitle}
                </h4>
                
                {/* Button Download Semua File */}
                {((selectedDownloadData.documentFiles && selectedDownloadData.documentFiles.length > 0) || 
                  (selectedDownloadData.fileName && selectedDownloadData.fileName.trim() !== '')) && (
                  <button
                    onClick={handleDownloadAllFiles}
                    disabled={downloadingAllFiles}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingAllFiles ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Download...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download Semua File ({
                          (selectedDownloadData.documentFiles?.reduce((total, docGroup) => total + docGroup.files.length, 0) || 0) +
                          (selectedDownloadData.fileName && selectedDownloadData.fileName.trim() !== '' ? 1 : 0)
                        } file)
                      </span>
                    )}
                  </button>
                )}
              </div>
              
              {/* Konten Modal - Scrollable */}
              <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
                <div className="space-y-6">
                  {/* File Dokumen berdasarkan Jenis dan Subjenis */}
                  {selectedDownloadData.documentFiles && selectedDownloadData.documentFiles.length > 0 && (
                    <>
                      {selectedDownloadData.documentFiles.map((docGroup, groupIndex) => (
                        <div key={groupIndex} className="rounded-lg border border-gray-200 p-4">
                          {/* Header Jenis - Subjenis dengan Download All Button */}
                          <div className="mb-3 pb-2 border-b border-gray-100 flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-blue-700">
                              {docGroup.jenis} - {docGroup.subjenis} ({docGroup.total_files} file):
                            </h5>
                            
                            {/* Button Download All untuk grup ini */}
                            {docGroup.files && docGroup.files.length > 1 && (
                              <button
                                onClick={() => handleDownloadGroupFiles(groupIndex, docGroup.jenis, docGroup.subjenis, docGroup.files)}
                                disabled={downloadingGroupIndex === groupIndex}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingGroupIndex === groupIndex ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Download...
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download All
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                          
                          {/* List File */}
                          <div className="space-y-2">
                            {docGroup.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <span className="text-sm text-gray-700 font-medium">
                                    {getFileName(file.file_doc)}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDownloadFile(file.file_doc)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* File Lainnya (fileName) */}
                  {selectedDownloadData.fileName && selectedDownloadData.fileName.trim() !== '' && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      {/* Header File Lainnya */}
                      <div className="mb-3 pb-2 border-b border-gray-100">
                        <h5 className="text-sm font-semibold text-green-700">
                          File Lainnya (1 file):
                        </h5>
                      </div>
                      
                      {/* File Download */}
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="flex items-center">
                          <div className="h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {getFileName(selectedDownloadData.fileName)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(selectedDownloadData.fileName)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pesan jika tidak ada file */}
                  {(!selectedDownloadData.documentFiles || selectedDownloadData.documentFiles.length === 0) && 
                   (!selectedDownloadData.fileName || selectedDownloadData.fileName.trim() === '') && (
                    <div className="text-center py-8">
                      <div className="h-12 w-12 text-gray-300 mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Tidak ada file yang tersedia untuk diunduh</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={closeDownloadModal}
                  className="rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
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