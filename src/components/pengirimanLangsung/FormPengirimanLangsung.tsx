import React, { useState,  useEffect, useRef, ChangeEvent } from "react";
import SuccessModal from "../modals/successModal";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import Image from "next/image";

interface Document {
  id: number;
  type_id: number;
  jenis: string;
  subtype_id: number;
  subjenis: string;
  dinas_id: number;
  dinas: string;
  tahun: string;
}

// Tipe data untuk dinas/official
interface Official {
  id: number;
  dinas: string;
  created_at?: string;
  updated_at?: string;
}

// Modal untuk error message
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          {/* Icon container with red background */}
          <div className="relative mb-6">
            {/* Background circular gradient */}
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-20"></div>
            
            {/* Small dots around the circle */}
            <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full top-1/4 -right-1"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full -bottom-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full top-1/4 -left-1"></div>
            
            {/* Main circle with X mark */}
            <div className="w-16 h-16 flex items-center justify-center bg-red-500 rounded-full relative z-10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 text-lg mb-8">
            {message}
          </p>
          
          {/* Small dot indicator */}
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mb-6"></div>
          
          {/* Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-medium rounded-xl transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

const FormPengirimanLangsung = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // Untuk pencarian
  const [showAll, setShowAll] = useState<boolean>(false); // Untuk mengatur apakah semua data ditampilkan
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]); // Dokumen yang dipilih
  const [judul, setJudul] = useState<string>(""); // Judul
  const [lampiran, setLampiran] = useState<string>(""); // Lampiran
  const [loading, setLoading] = useState<boolean>(false); // State loading
  // State untuk file upload
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Error state
  const [success, setSuccess] = useState<boolean>(false);

  const [documents, setDocuments] = useState<Document[]>([]); // Semua dokumen

  // State untuk dropdown officials/dinas
  const [officials, setOfficials] = useState<Official[]>([]);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [isLoadingOfficials, setIsLoadingOfficials] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [officialSearchTerm, setOfficialSearchTerm] = useState<string>("");
  
  // State untuk SuccessModal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // State untuk menampilkan ErrorModal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Ref untuk dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mendapatkan icon berdasarkan tipe file
  const getFileIcon = (file: File) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileName.endsWith('.zip')) {
      return '📦';
    } else if (fileName.endsWith('.rar')) {
      return '🗜️';
    } else if (fileName.endsWith('.pdf')) {
      return '📄';
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return '📝';
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return '📊';
    } else {
      return '📎';
    }
  };

  // Fungsi untuk memvalidasi tipe file
  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'image/png',
      'image/jpg', 
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/octet-stream' // Untuk RAR di beberapa browser
    ];
    
    const allowedExtensions = ['.zip', '.rar', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.doc', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  };

  // Fungsi untuk format ukuran file
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Effect untuk menangani klik diluar dropdown untuk menutupnya
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Mengambil data dokumen dari API saat komponen dimuat
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/direct-shipping/", "GET");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        // Pastikan data dokumen ada dan memiliki format yang benar
        if (result.responseData && result.responseData.items) {
          setDocuments(result.responseData.items);
        } else {
          throw new Error("Format data tidak sesuai");
        }
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data dokumen");
        showErrorModal("Kesalahan", "Gagal memuat daftar dokumen. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Mengambil data officials/dinas dari API
  useEffect(() => {
    const fetchOfficials = async () => {
      setIsLoadingOfficials(true);
      try {
        const response = await apiRequest("/officials/", "GET");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        // Pastikan data officials ada dan memiliki format yang benar
        if (result.responseData && result.responseData.items) {
          setOfficials(result.responseData.items);
        } else {
          throw new Error("Format data officials tidak sesuai");
        }
      } catch (err: any) {
        console.error("Gagal mengambil data officials:", err);
      } finally {
        setIsLoadingOfficials(false);
      }
    };

    fetchOfficials();
  }, []);

  // Fungsi untuk memfilter officials berdasarkan pencarian
  const filteredOfficials = officialSearchTerm === ''
  ? officials
  : officials.filter((official) =>
      official.dinas
        .toLowerCase()
        .includes(officialSearchTerm.toLowerCase())
    );
  
  // Format display name untuk dokumen
  const getDocumentDisplayName = (doc: Document): string => {
    return `${doc.jenis} - ${doc.subjenis} - ${doc.tahun}`;
  };

  // Filter dokumen berdasarkan pencarian
  const filteredDocuments = documents.filter((doc) =>
    getDocumentDisplayName(doc).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Tentukan jumlah data yang ditampilkan
  const displayedDocuments = showAll
  ? filteredDocuments
  : filteredDocuments.slice(0, 10);

  // Handle toggle dropdown
  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Handle pilih official dari dropdown
  const handleSelectOfficial = (official: Official) => {
    setSelectedOfficial(official);
    setIsDropdownOpen(false);
    setOfficialSearchTerm("");
  };
  
  // Handle perubahan search term untuk official
  const handleOfficialSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfficialSearchTerm(e.target.value);
  };

  // Handle perubahan checkbox
  const handleCheckboxChange = (document: Document, isChecked: boolean) => {
    if (isChecked) {
      setSelectedDocuments((prev) => [...prev, document]);
    } else {
      setSelectedDocuments((prev) => 
        prev.filter((doc) => doc.id !== document.id)
      );
    }
  };

  // Handle hapus dokumen
  const handleRemoveDocument = (docId: number) => {
    setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };
  
  // Fungsi untuk menampilkan error modal
  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };
  
  // Handle file change untuk upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      
      // Validasi tipe file
      const invalidFiles = fileList.filter(file => !isValidFileType(file));
      if (invalidFiles.length > 0) {
        showErrorModal("File Tidak Didukung", `File tidak didukung: ${invalidFiles.map(f => f.name).join(', ')}. Hanya mendukung PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, dan RAR.`);
        return;
      }

      // Validasi ukuran file (maksimal 100MB untuk ZIP/RAR, 10MB untuk file lainnya)
      const oversizedFiles = fileList.filter(file => {
        const maxSize = file.name.toLowerCase().match(/\.(zip|rar)$/) ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB untuk ZIP/RAR, 10MB untuk file lainnya
        return file.size > maxSize;
      });
      
      if (oversizedFiles.length > 0) {
        const oversizedFileInfo = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
        showErrorModal("File Terlalu Besar", `File terlalu besar: ${oversizedFileInfo}. Maksimal 100MB untuk ZIP/RAR dan 10MB untuk file lainnya.`);
        return;
      }

      setFiles(fileList);
      
      // Inisialisasi progress untuk setiap file
      setUploadProgress(fileList.map(() => 0));
      
      // Simulasi upload
      simulateFileUpload(fileList);
    }
  };
  
  // Simulasi upload file
  const simulateFileUpload = (fileList: File[]) => {
    setIsUploading(true);
    setError("");
    
    // Simulasi progressbar untuk masing-masing file
    fileList.forEach((_, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Periksa jika semua file sudah 100%
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            
            // Jika semua sudah 100%
            if (newProgress.every(p => p === 100)) {
              setIsUploading(false);
              setIsUploadComplete(true);
              setSuccess(true);
              
              // Simulasi path file yang diupload
              setTempFilePaths(fileList.map(file => `/uploads/${file.name}`));
            }
            
            return newProgress;
          });
        } else {
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            return newProgress;
          });
        }
      }, 200);
    });
  };
  
  // Handle remove file
  const handleRemoveFile = () => {
    setFiles([]);
    setUploadProgress([]);
    setTempFilePaths([]);
    setIsUploadComplete(false);
    setSuccess(false);
  };
  
  // Handle pengiriman dokumen
  const handleSubmit = async () => {

    console.log("Form submission started");
    console.log("Selected official:", selectedOfficial);
    console.log("Judul:", judul);
    console.log("Selected documents:", selectedDocuments);
    console.log("Lampiran:", lampiran);

    // ✅ VALIDASI MINIMAL - HANYA DINAS DAN JUDUL YANG WAJIB
    if (!selectedOfficial) {
      showErrorModal("Validasi Gagal", "Nama Dinas harus dipilih");
      return;
    }
    
    if (!judul) {
      showErrorModal("Validasi Gagal", "Judul harus diisi");
      return;
    }
    
    // ✅ HAPUS VALIDASI/PERINGATAN UNTUK DOKUMEN DAN FILE
    // Sekarang bisa kirim tanpa dokumen dan tanpa file
    
    // Reset error
    setError("");
    
    // Set loading
    setLoading(true);
    
    try {
      // ✅ Menyiapkan data dokumen yang dipilih - BISA KOSONG
      const documentIds = selectedDocuments.map(doc => doc.id);
      const user = JSON.parse(Cookies.get("user") || "{}");
      if (!user.userid || !user.name || user.department_id == '' || !user.department_name) {
        console.error("User tidak ditemukan di cookie.");
        return;
      }

      // ✅ Siapkan payload untuk API - BISA KOSONG UNTUK DOKUMEN DAN FILE
      const payload = {
        kepada_id: selectedOfficial.id,
        kepada_dinas: selectedOfficial.dinas,
        judul: judul,
        dokumen_ids: documentIds, // Bisa array kosong []
        lampiran: lampiran, // Bisa string kosong ""
        file_paths: tempFilePaths, // Bisa array kosong []
        pengirim_userid: user.userid,
        pengirim_name: user.name,
        pengirim_department_id: user.department_id,
        pengirim_department_name: user.department_name
      };
      
      console.log("Starting actual API call with payload:", payload);

      const response = await apiRequest("/direct-shipping/", "POST", payload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseDesc || "Gagal mengirim dokumen");
      }
      
      // Jika berhasil, tampilkan modal sukses
      setSuccess(true);
      setIsSuccessModalOpen(true);
      
    } catch (error) {
      // Handle error
      console.error("Error sending documents:", error);
      showErrorModal("Pengiriman Gagal", "Terjadi kesalahan saat mengirim dokumen. Silakan coba lagi.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menutup modal
  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
  };
  
  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };
  
  // Fungsi untuk menangani klik pada tombol di modal
  const handleSuccessButtonClick = () => {
    setIsSuccessModalOpen(false);
    
    // Reset form setelah berhasil
    setSelectedOfficial(null);
    setJudul("");
    setLampiran("");
    setSelectedDocuments([]);
    setFiles([]);
    setUploadProgress([]);
    setTempFilePaths([]);
    setIsUploadComplete(false);
    setSuccess(false);
    setSearchTerm("");
    setOfficialSearchTerm("");
    
    // Opsional: redirect ke halaman lain
    // window.location.href = "/dokumen/daftar";
  };

  return (
    <>
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-5.5 font-medium text-dark dark:text-white">
            Pengiriman dokumen secara langsung pada Dinas
          </h4>
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="grid grid-cols-12 gap-6 p-6.5">
                {/* Kolom Kiri */}
                <div className="col-span-12 lg:col-span-6">
                  {/* Kepada Dinas */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Kepada Dinas
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <div 
                        className="flex items-center w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition cursor-pointer"
                        onClick={handleToggleDropdown}
                      >
                        {selectedOfficial ? (
                          <div className="flex-grow text-dark dark:text-white">
                            {selectedOfficial.dinas}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Pilih atau cari dinas..."
                            value={officialSearchTerm}
                            onChange={handleOfficialSearchChange}
                            autoComplete="off"
                            className="flex-grow bg-transparent focus:outline-none text-dark dark:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDropdownOpen) {
                                setIsDropdownOpen(true);
                              }
                            }}
                          />
                        )}
                        <div className="ml-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
                          {selectedOfficial && (
                            <div 
                              className="px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-red-50 text-red-500 flex items-center"
                              onClick={() => {
                                setSelectedOfficial(null);
                                setOfficialSearchTerm("");
                                setIsDropdownOpen(false);
                              }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 mr-2"
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Hapus Pilihan
                            </div>
                          )}
                          {isLoadingOfficials ? (
                            <div className="text-center py-2 text-gray-500">Memuat data...</div>
                          ) : filteredOfficials.length === 0 ? (
                            <div className="text-center py-2 text-gray-500">Tidak ada data ditemukan</div>
                          ) : (
                            filteredOfficials.map((official) => (
                              <div
                                key={official.id}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${selectedOfficial?.id === official.id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleSelectOfficial(official)}
                              >
                                {official.dinas}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Judul */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Judul
                    </label>
                    <input
                      type="text"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Masukkan Nama Judul..."
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      required
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Dokumen Yang Dipilih
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(opsional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center space-x-2 rounded-md bg-gray-100 px-3 py-2 shadow-sm dark:bg-gray-700"
                        >
                          <span className="text-sm text-gray-700 dark:text-white">
                            {getDocumentDisplayName(doc)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {selectedDocuments.length === 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Belum ada dokumen yang dipilih.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lampiran */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Lampiran (opsional)
                    </label>
                    <textarea
                      rows={6}
                      value={lampiran}
                      placeholder="Isi Lampiran..."
                      onChange={(e) => setLampiran(e.target.value)}
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    ></textarea>
                  </div>
                  
                  {/* File Upload (Opsional) */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Upload File (opsional)
                    </label>
                    
                    <div
                      id="FileUpload"
                      className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-[#1D92F9] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:py-7.5"
                    >
                      <input
                        type="file"
                        multiple
                        name="profilePhoto"
                        id="profilePhoto"
                        accept="image/png, image/jpg, image/jpeg, image/gif, image/svg+xml, .pdf, .doc, .docx, .zip, .rar, application/zip, application/x-zip-compressed, application/x-rar-compressed, application/vnd.rar"
                        className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center justify-center">
                        <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4613 2.07827C10.3429 1.94876 10.1755 1.875 10 1.875C9.82453 1.875 9.65714 1.94876 9.53873 2.07827L6.2054 5.7241C5.97248 5.97885 5.99019 6.37419 6.24494 6.6071C6.49969 6.84002 6.89502 6.82232 7.12794 6.56756L9.375 4.10984V13.3333C9.375 13.6785 9.65482 13.9583 10 13.9583C10.3452 13.9583 10.625 13.6785 10.625 13.3333V4.10984L12.8721 6.56756C13.105 6.82232 13.5003 6.84002 13.7551 6.6071C14.0098 6.37419 14.0275 5.97885 13.7946 5.7241L10.4613 2.07827Z"
                              fill="#1D92F9"
                            />
                            <path
                              d="M3.125 12.5C3.125 12.1548 2.84518 11.875 2.5 11.875C2.15482 11.875 1.875 12.1548 1.875 12.5V12.5457C1.87498 13.6854 1.87497 14.604 1.9721 15.3265C2.07295 16.0765 2.2887 16.7081 2.79029 17.2097C3.29189 17.7113 3.92345 17.9271 4.67354 18.0279C5.39602 18.125 6.31462 18.125 7.45428 18.125H12.5457C13.6854 18.125 14.604 18.125 15.3265 18.0279C16.0766 17.9271 16.7081 17.7113 17.2097 17.2097C17.7113 16.7081 17.9271 16.0765 18.0279 15.3265C18.125 14.604 18.125 13.6854 18.125 12.5457V12.5C18.125 12.1548 17.8452 11.875 17.5 11.875C17.1548 11.875 16.875 12.1548 16.875 12.5C16.875 13.6962 16.8737 14.5304 16.789 15.1599C16.7068 15.7714 16.5565 16.0952 16.3258 16.3258C16.0952 16.5565 15.7714 16.7068 15.1599 16.789C14.5304 16.8737 13.6962 16.875 12.5 16.875H7.5C6.30382 16.875 5.46956 16.8737 4.8401 16.789C4.22862 16.7068 3.90481 16.5565 3.67418 16.3258C3.44354 16.0952 3.29317 15.7714 3.21096 15.1599C3.12633 14.5304 3.125 13.6962 3.125 12.5Z"
                              fill="#1D92F9"
                            />
                          </svg>
                        </span>
                        <p className="mt-2.5 text-body-sm font-medium">
                          <span className="text-[#1D92F9]">Click to upload</span> atau
                          drag and drop
                        </p>
                        <p className="mt-1 text-body-xs">
                          PNG, JPG, GIF, SVG, PDF, DOC, DOCX, ZIP, RAR (maksimal 100MB untuk arsip, 10MB untuk file lainnya)
                        </p>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h5 className="mb-3 font-semibold text-dark dark:text-white">
                          File Terpilih
                        </h5>
                        {files.map((file, index) => {
                          const isImage = file.type.startsWith("image/");
                          const percent = uploadProgress[index];
                          const fileIcon = getFileIcon(file);

                          return (
                            <div
                              key={index}
                              className="relative flex items-center gap-4 rounded-md border bg-white p-3 shadow-sm dark:bg-dark-2 mb-2"
                            >
                              {isImage ? (
                                <Image
                                  src={URL.createObjectURL(file)}
                                  alt="preview"
                                  width={48}
                                  height={48}
                                  className="rounded-md border object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-gray-50 dark:bg-gray-700 text-2xl">
                                  {fileIcon}
                                </div>
                              )}

                              <div className="flex-1 overflow-hidden">
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="max-w-[70%] truncate text-sm font-medium">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {percent}%
                                  </span>
                                </div>
                                <div className="mb-1 text-xs text-gray-400">
                                  {formatFileSize(file.size)}
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                  <div
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                      percent === 100 ? "bg-green-500" : "bg-blue-600"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Cancel Button */}
                              {!isUploadComplete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFiles([]);
                                    setUploadProgress([]);
                                    setTempFilePaths([]);
                                    setIsUploading(false);
                                    setIsUploadComplete(false);
                                  }}
                                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                                  title="Batalkan Upload"
                                >
                                  ✖
                                </button>
                              )}

                              {/* Tombol Hapus setelah upload selesai */}
                              {isUploadComplete && (
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="mt-1 flex-shrink-0 text-sm text-red-500 hover:text-red-700"
                                  title="Hapus File"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Pesan Error/Success */}
                    {error && !isErrorModalOpen && (
                      <p className="mt-2 text-red-500 text-sm">{error}</p>
                    )}
                    {success && (
                      <p className="mt-2 text-green-500 text-sm">
                        Upload Dokumen berhasil ditambahkan!
                      </p>
                    )}
                  </div>

                  {/* Tombol Kirim */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
                    >
                      {loading ? "Mengirim..." : "Kirim"}
                    </button>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="mb-4.5">
                    <div className="flex items-center justify-between">
                      <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                        Dokumen
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(opsional)</span>
                      </label>
                      {/* Input Pencarian */}
                      <input
                        type="text"
                        placeholder="Cari dokumen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[200px] rounded-[7px] bg-transparent px-5 py-2 text-dark ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      />
                    </div>
                    <fieldset>
                      <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
                        {loading ? (
                          // Tampilkan loading state
                          Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-start py-4">
                              <div className="min-w-0 flex-1">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                              </div>
                              <div className="ml-3 flex h-6 items-center">
                                <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Tampilkan data dokumen
                          displayedDocuments.length > 0 ? (
                            displayedDocuments.map((doc) => (
                              <div
                                key={doc.id}
                                className="relative flex items-start py-4"
                              >
                                <div className="min-w-0 flex-1 text-[12px]">
                                  <label
                                    htmlFor={`person-${doc.id}`}
                                    className="select-none font-medium text-gray-500"
                                  >
                                    {getDocumentDisplayName(doc)}
                                  </label>
                                </div>
                                <div className="ml-3 flex h-6 items-center">
                                  <input
                                    id={`person-${doc.id}`}
                                    name={`person-${doc.id}`}
                                    type="checkbox"
                                    checked={selectedDocuments.some(
                                      (selectedDoc) => selectedDoc.id === doc.id
                                    )}
                                    onChange={(e) =>
                                      handleCheckboxChange(
                                        doc,
                                        e.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-4 text-center">
                              <span className="text-gray-500">
                                {error ? "Terjadi kesalahan saat memuat data" : "Tidak ada dokumen yang tersedia"}
                              </span>
                            </div>
                          )
                        )}

                        {filteredDocuments.length > 10 && !showAll && (
                          <div className="py-4 text-center">
                            <button
                              type="button"
                              onClick={() => setShowAll(true)}
                              className="text-[#0C479F] hover:underline"
                            >
                              Lihat Semua Dokumen
                            </button>
                          </div>
                        )}
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* SuccessModal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Berhasil!"
        message="Dokumen berhasil dikirim ke Dinas."
        buttonText="Kembali ke Daftar Dokumen"
        onButtonClick={handleSuccessButtonClick}
      />

      {/* ErrorModal Component */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={errorTitle}
        message={errorMessage}
      />
    </>
  );
};

export default FormPengirimanLangsung;