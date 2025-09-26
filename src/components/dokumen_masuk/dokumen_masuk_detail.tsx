"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, downloadFileRequest  } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";
import Cookies from "js-cookie";
import { DokumenMasuk, DokumenMasukResponse } from "@/types/dokumenMasuk";
import { formatIndonesianDateOnly } from "@/utils/dateFormatter";
import Pagination from "../pagination/Pagination";

// Interface untuk data API response
interface KirimanDokumen {
  id_table: number;
  pengirim_nama_dinas: string;
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
  id_table: number;
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

// Interface untuk response detail message
interface MessageDetailResponse {
  title: string;
  content: string;
  jenisSubjenis: string[];
}

// Interface untuk response detail download
interface DownloadDetailResponse {
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
}
const DokumenMasukDetailDokumen = ({ dinas, namaDinas }: { dinas: number | null, namaDinas: string | null }) => {
// const DokumenMasukDetailDokumen = ({ dinas, namaDinas }: { dinas: number | null, namaDinas: string | null }) => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<DokumenMasuk[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetailResponse | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  // State untuk modal download
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDownloadData, setSelectedDownloadData] = useState<DownloadDetailResponse | null>(null);
  const [loadingDownload, setLoadingDownload] = useState(false);
  
  // State untuk loading download
  const [downloadingGroupIndex, setDownloadingGroupIndex] = useState<number | null>(null);
  const [downloadingAllFiles, setDownloadingAllFiles] = useState(false);

  // const [dinas, setDinas] = useState<number | null>(null);
  // const [namaDinas, setNamaDinas] = useState<string | null>(null);


  // Filters state
  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC',
    search: ''
  });

  const user = JSON.parse(Cookies.get("user") || "{}");
  const userDinas = user.dinas || "";

  // Reset halaman ke 1 ketika melakukan pencarian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Debounced search function
  const debounceSearch = useCallback(() => {
    if (searchTerm.trim() !== '') {
      const timeoutId = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
        setCurrentPage(1); // Reset to first page when searching
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    } else {
      // Jika searchTerm kosong, langsung clear search filter tanpa delay
      setFilters(prev => ({ ...prev, search: '' }));
      setCurrentPage(1);
    }
  }, [searchTerm]); // Menambahkan searchTerm ke dependency array

  // Effect untuk debounced search
  useEffect(() => {
    const cleanup = debounceSearch();
    return cleanup;
  }, [debounceSearch]);

  const fetchData = useCallback(async (page = 1, perPage = 10, filterParams = {}) => {
    setLoading(true);
    setError(null);

    if (!userDinas) {
      setError("ID Dinas tidak ditemukan");
      setLoading(false);
      return;
    }

    if (!dinas) {
      setError("ID tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      // Buat query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value || value.trim() === '') queryParams.delete(key);
      });

      const response = await apiRequest(`/inbox/detail/${userDinas}/${dinas}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data kiriman dokumen tidak ditemukan");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result : DokumenMasukResponse = await response.json();

      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      // Format data sesuai dengan interface
      const res: DokumenMasuk[] = result.responseData.items.map((item: any) => ({
        id: item.id_table,
        senderDinas: namaDinas || "",
        dinas_pengirim: item.pengirim_nama_dinas,
        tanggal_pengirim: item.pengirim_date,
        judul: item.judul,
      }));

        // const dateObject = new Date(item.pengirim_date);
        
        // // Format jenis dan subjenis menjadi array "jenis - subjenis"
        // // const jenisSubjenisArray = item.documnet?.map(doc => `${doc.jenis} - ${doc.subjenis}`) || [];
        
        // return {
        //   id: `${dinas}_${index}`,
        //   id_table: item.id_table,
        //   sender: item.pengirim_nama_dinas,
        //   senderDinas: namaDinas || senderNamaDinas || "",
        //   date: dateObject.toLocaleDateString('id-ID'),
        //   dateObject: dateObject, 
        //   lampiran: item.judul,
        // };
    

      setDataList(res);
      setTotalPages(result.responseMeta.total_pages);
      setTotalRecords(result.responseMeta.total_records);
      
    } catch (err: any) {
      setError(
        err.message === "Failed to fetch" 
          ? "Tidak dapat terhubung ke server"
          : err.message === "Document data not found"
          ? "Data tidak ditemukan"
          : err.message
      );
      setDataList([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  },[userDinas, dinas]);

  // useEffect untuk fetch data
  useEffect(() => {
    if (dinas) {
      if (filters.search !== searchTerm) {
        setSearchLoading(true);
      }
      fetchData(currentPage, itemsPerPage, filters);
    }
  }, [dinas, searchTerm, currentPage, itemsPerPage, filters, fetchData]);

  // Filter data berdasarkan nama dinas
  const filteredData = dataList.filter(
    (item) => item.senderDinas === namaDinas
  );

  // Auto hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handler untuk perubahan items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk retry ketika error
  const handleRetry = useCallback(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [fetchData, currentPage, itemsPerPage, filters]);

  // Handler untuk clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilters(prev => ({ ...prev, search: "" }));
    setCurrentPage(1);
  };

  // Handler untuk search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  // Fungsi untuk fetch detail message dari API
  const fetchMessageDetail = async (id: number): Promise<MessageDetailResponse | null> => {
    try {
      setLoadingMessage(true);
      const response = await apiRequest(`/inbox/message/${id}`, "GET");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const jenisSubjenisArray = result.responseData.documents?.map((doc: any) => `${doc.jenis} - ${doc.subjenis}`) || [];
    
      // Sesuaikan dengan struktur response API Anda
      return {
        title: result.responseData.judul || "",
        content: result.responseData.lampiran || "",
        jenisSubjenis: jenisSubjenisArray 
      };
      
    } catch (error) {
      console.error("Error fetching message detail:", error);
      alert("Gagal memuat detail pesan");
      return null;
    } finally {
      setLoadingMessage(false);
    }
  };

  // Fungsi untuk fetch detail download dari API
  const fetchDownloadDetail = async (id: number): Promise<DownloadDetailResponse | null> => {
    try {
      setLoadingDownload(true);
      const response = await apiRequest(`/inbox/download/${id}`, "GET");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Sesuaikan dengan struktur response API Anda
      return {
        documentTitle: result.responseData.judul || "" ,
        documentFiles: result.responseData.documents || [],
        fileName: result.responseData.file_name || ""
      };      
    } catch (error) {
      console.error("Error fetching download detail:", error);
      alert("Gagal memuat detail download");
      return null;
    } finally {
      setLoadingDownload(false);
    }
  };

  // Fungsi untuk membuka modal pesan - UPDATED
  const openMessageModal = async (id: number) => {
    const messageDetail = await fetchMessageDetail(id);
    if (messageDetail) {
      setSelectedMessage(messageDetail);
      setIsModalOpen(true);
    }
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Fungsi untuk membuka modal download - UPDATED
  const openDownloadModal = async (id: number) => {
    const downloadDetail = await fetchDownloadDetail(id);
    if (downloadDetail) {
      setSelectedDownloadData(downloadDetail);
      setIsDownloadModalOpen(true);
    }
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
      {Array.from({ length: itemsPerPage }).map((_, index) => (
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

   // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={6} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            {filters.search ? "Tidak ada hasil pencarian" : "Data belum tersedia"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {filters.search 
              ? `Tidak ditemukan hasil untuk &quot;${filters.search}&quot;`
              : "Belum ada dokumen yang diupload"
            }
          </p>
          {filters.search && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hapus Pencarian
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  // Render error state
  const renderErrorState = () => (
    <tr>
      <td colSpan={6} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-xl bg-white px-8 pt-6 pb-4 shadow-md dark:bg-gray-dark">
        {/* Header dengan nama dinas */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{namaDinas}</h2>
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
            {dataList.length > 0 ? (
              dataList.map((item) => {
                // const daysRemaining = calculateDaysRemaining(item.dateObject);
                const daysRemaining = calculateDaysRemaining(item.tanggal_pengirim);
                const badgeColor = getBadgeColor(daysRemaining);
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-5 hover:bg-gray-50 transition rounded-lg px-4"
                  >
                    {/* Informasi Utama */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-xl font-medium text-blue-600">{item.judul}</p>
                        
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
                        <span className="text-sm text-gray-600 mr-3">{item.dinas_pengirim}</span>
                        
                        <div className="h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{formatIndonesianDateOnly(item.tanggal_pengirim)}</span>
                      </div>
                    </div>
                  
                    {/* Tombol Aksi */}
                    <div className="flex space-x-3">
                      {/* Tombol Isi Pesan - UPDATED */}
                      <button
                        onClick={() => openMessageModal(item.id)}
                        disabled={loadingMessage}
                        className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center">
                          {loadingMessage ? (
                            <svg className="animate-spin h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                            </svg>
                          )}
                          {loadingMessage ? 'Loading...' : 'Isi Pesan'}
                        </div>
                      </button>
                      
                      {/* Tombol Download - UPDATED */}
                      <button
                        onClick={() => openDownloadModal(item.id)}
                        disabled={loadingDownload}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center">
                          {loadingDownload ? (
                            <svg className="animate-spin h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {loadingDownload ? 'Loading...' : 'Download'}
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
        {!loading && !error && totalPages > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              totalRecords={totalRecords}
              loading={loading}
              isSearchActive={!!filters.search}
              searchTerm={filters.search}
            />
          </div>
        )}
        
        {/* Modal Isi Pesan - UPDATED */}
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

        {/* Modal Download - UPDATED */}
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