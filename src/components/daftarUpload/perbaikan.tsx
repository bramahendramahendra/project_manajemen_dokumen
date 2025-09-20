"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { HiOutlineExclamationTriangle, HiOutlineArrowLeft } from "react-icons/hi2";
import { apiRequest } from "@/helpers/apiClient";
import { apiRequestUpload } from "@/helpers/uploadClient";
import ElementCombobox from "../elements/ElementCombobox";
import SuccessModal from "../modals/successModal";

// Fungsi untuk generate tahun dinamis (tahun sekarang mundur 16 tahun)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Generate dari tahun sekarang mundur 16 tahun (total 17 tahun termasuk tahun sekarang)
  for (let i = 0; i < 17; i++) {
    years.push({ name: currentYear - i });
  }
  
  return years;
};

const dataTahun = generateYearOptions();

// Interface untuk struktur response API
interface ApiResponse<T> {
  responseCode: number;
  responseDesc: string;
  responseData: T;
}

interface FileData {
  id: number;
  id_document: number;
  file_name: string;
}

interface DocumentData {
  id: number;
  dinas: string;
  nama_dinas: string;
  jenis: string;
  nama_jenis: string;
  subjenis: string;
  nama_subjenis: string;
  tahun: number;
  keterangan: string;
  catatan: string;
  total_files: number;
  files: FileData[];
}

interface PerbaikanDokumenProps {
  documentId: number | null;
}

const PerbaikanDokumen = ({ documentId }: PerbaikanDokumenProps) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [documentData, setDocumentData] = useState<DocumentData | null>(null);

  // Form states - hanya untuk field yang bisa diedit
  const [tahun, setTahun] = useState<string | number>('');
  const [keterangan, setKeterangan] = useState('');
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  
  // State untuk Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
    } else if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
      return '📄';
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
               fileType === 'application/msword' || 
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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

  // Fungsi untuk fetch data dokumen - YANG DIRAPIKAN
  const fetchDocumentData = async () => {
    if (!documentId) {
      setError("ID dokumen tidak valid");
      setLoadingDocument(false);
      return;
    }

    setLoadingDocument(true);
    setError(null);

    try {
      const response = await apiRequest(`/daftar_upload/detail/${documentId}`, "GET");
      
      // Periksa status response
      if (!response.ok) {
        let errorMessage = "Terjadi kesalahan saat mengambil data dokumen";
        
        switch (response.status) {
          case 404:
            errorMessage = "Dokumen tidak ditemukan";
            break;
          case 401:
            errorMessage = "Anda tidak memiliki akses untuk melihat dokumen ini";
            break;
          case 403:
            errorMessage = "Akses ditolak";
            break;
          case 500:
            errorMessage = "Terjadi kesalahan server";
            break;
          default:
            errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Parse response JSON
      const result: ApiResponse<DocumentData> = await response.json();
      
      // Validasi struktur response
      if (!result || typeof result !== 'object') {
        throw new Error("Format response tidak valid");
      }

      if (result.responseCode !== 200) {
        throw new Error(result.responseDesc || "Request tidak berhasil");
      }

      if (!result.responseData) {
        throw new Error("Data dokumen tidak ditemukan dalam response");
      }

      // Validasi data dokumen yang diperlukan
      const docData = result.responseData;
      if (!docData.id || !docData.nama_dinas || !docData.nama_jenis || !docData.nama_subjenis) {
        throw new Error("Data dokumen tidak lengkap");
      }

      // Set data ke state
      setDocumentData(docData);
      
      // Set initial form values dengan fallback ke string kosong
      setTahun(docData.tahun || '');
      setKeterangan(docData.keterangan || '');

    } catch (err: any) {
      console.error("Error fetching document:", err);
      
      // Handle different error types
      let errorMessage = "Terjadi kesalahan tidak terduga";
      
      if (err.message === "Failed to fetch") {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = "Terjadi kesalahan jaringan. Coba lagi dalam beberapa saat.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingDocument(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    } else {
      setError("ID dokumen tidak ditemukan");
      setLoadingDocument(false);
    }
  }, [documentId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      
      // Validasi tipe file
      const invalidFiles = selectedFiles.filter(file => !isValidFileType(file));
      if (invalidFiles.length > 0) {
        setError(`File tidak didukung: ${invalidFiles.map(f => f.name).join(', ')}. Hanya mendukung PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, dan RAR.`);
        return;
      }

      // Validasi ukuran file
      const oversizedFiles = selectedFiles.filter(file => {
        const fileName = file.name.toLowerCase();
        let maxSize = 10 * 1024 * 1024; // Default 10MB untuk image
        
        if (fileName.match(/\.(zip|rar)$/)) {
          maxSize = 100 * 1024 * 1024; // 100MB untuk ZIP/RAR
        } else if (fileName.match(/\.(pdf|doc|docx)$/)) {
          maxSize = 25 * 1024 * 1024; // 25MB untuk PDF/DOC
        } else {
          maxSize = 10 * 1024 * 1024; // 10MB untuk gambar dan file lainnya
        }
        
        return file.size > maxSize;
      });
      
      if (oversizedFiles.length > 0) {
        const oversizedFileInfo = oversizedFiles.map(f => {
          const fileName = f.name.toLowerCase();
          let maxSizeText;
          if (fileName.match(/\.(zip|rar)$/)) {
            maxSizeText = "100MB";
          } else if (fileName.match(/\.(pdf|doc|docx)$/)) {
            maxSizeText = "25MB";
          } else {
            maxSizeText = "10MB";
          }
          return `${f.name} (${formatFileSize(f.size)}, maks: ${maxSizeText})`;
        }).join(', ');
        
        setError(`File terlalu besar: ${oversizedFileInfo}.`);
        return;
      }

      setFiles(selectedFiles);
      setUploadProgress(new Array(selectedFiles.length).fill(0));
      setIsUploading(true);
      setIsUploadComplete(false);
      setError(null);

      const uploadedPaths: string[] = [];
      const progresses: number[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          const { response, status } = await apiRequestUpload(
            "/document_managements/upload-file",
            file,
            (progress) => {
              progresses[i] = progress;
              setUploadProgress([...progresses]);
            }
          );

          if (status === 200 && response.responseData?.temp_file_path) {
            uploadedPaths.push(response.responseData.temp_file_path);
          } else {
            throw new Error(response.responseDesc || "Upload gagal.");
          }
        } catch (error: any) {
          setError(`Gagal upload ${file.name}: ${error.message}`);
          setUploadProgress([]);
          setIsUploading(false);
          return;
        }
      }

      setTempFilePaths(uploadedPaths);
      setIsUploadComplete(true);
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (tempFilePaths.length > 0) {
      for (const path of tempFilePaths) {
        try {
          await apiRequest("/document_managements/delete-file", "POST", { file_path: path });
        } catch (error) {
          console.warn("Gagal hapus file:", error);
        }
      }
    }
    setFiles([]);
    setUploadProgress([]);
    setTempFilePaths([]);
    setIsUploading(false);
    setIsUploadComplete(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validasi form
    if (!tahun || !keterangan) {
      setError("Tahun dan keterangan wajib diisi.");
      setLoading(false);
      return;
    }

    if (!isUploadComplete || tempFilePaths.length === 0) {
      setError("Upload file terlebih dahulu.");
      setLoading(false);
      return;
    }

    let userData;
    try {
      const userCookie = Cookies.get("user");
      userData = userCookie ? JSON.parse(userCookie) : {};
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      userData = {};
    }

    const payload = {
      tahun: typeof tahun === 'string' ? parseInt(tahun, 10) : Number(tahun), // UBAH INI
      keterangan: keterangan,
      file_paths: tempFilePaths,
      maker: userData.userid || "",
      maker_role: userData.level_id || "",
    };

    try {
      const response = await apiRequest(`/document_managements/revision/${documentId}`, "POST", payload);

      if (response.ok) {
        setSuccess(true);
        
        // Tampilkan modal sukses
        setIsSuccessModalOpen(true);
        
        // Reset form file
        setFiles([]);
        setUploadProgress([]);
        setTempFilePaths([]);
        setIsUploadComplete(false);
      } else {
        const result = await response.json();
        setError(result.responseDesc || "Terjadi kesalahan saat memperbaiki dokumen");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menutup modal dan kembali ke daftar
  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    router.push('/daftar_upload');
  };

  // Fungsi untuk kembali ke daftar
  const handleBack = () => {
    router.push('/daftar_upload');
  };

  // Loading state
  if (loadingDocument) {
    return (
      <div className="col-span-12">
        <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-400">Memuat data dokumen...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state ketika tidak ada data
  if (error && !documentData) {
    return (
      <div className="col-span-12">
        <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
              <button 
                onClick={handleBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Data tidak ditemukan state
  if (!documentData) {
    return (
      <div className="col-span-12">
        <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600 dark:text-gray-400">Dokumen tidak ditemukan</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Kembali ke Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back Button */}
      <div className="col-span-12">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <HiOutlineArrowLeft className="h-5 w-5 mr-2" />
          Kembali ke Daftar Upload
        </button>
      </div>

      {/* Document Info Panel */}
      <div className="col-span-12 xl:col-span-6">
        <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-5.5 font-medium text-dark dark:text-white flex items-center">
            <HiOutlineExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
            Informasi Dokumen yang Ditolak
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dinas
                </label>
                <p className="text-gray-900 dark:text-white">{documentData.nama_dinas}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jenis
                </label>
                <p className="text-gray-900 dark:text-white">{documentData.nama_jenis}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub Jenis
                </label>
                <p className="text-gray-900 dark:text-white">{documentData.nama_subjenis}</p>
              </div>

              {/* Display existing files */}
              {documentData.files && documentData.files.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Saat Ini ({documentData.total_files} file)
                  </label>
                  <div className="space-y-2">
                    {documentData.files.map((file) => (
                      <div key={file.id} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-2">📎</span>
                        <span className="truncate">{file.file_name.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Catatan Penolakan */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                Catatan Penolakan:
              </label>
              <div className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                {documentData.catatan || "Tidak ada catatan penolakan."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Perbaikan */}
      <div className="col-span-12 xl:col-span-6">
        <div className="rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-5.5 font-medium text-dark dark:text-white">
            Form Perbaikan Dokumen
          </h4>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                {/* Tahun Combobox */}
                <div className="mb-4.5">
                  <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <ElementCombobox
                    label=""
                    placeholder="Pilih tahun"
                    options={dataTahun}
                    onChange={(value) => setTahun(value)}
                    defaultValue={tahun}
                    disabled={false}
                  />
                </div>
                
                {/* Keterangan Input */}
                <div className="mb-4.5">
                  <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                    Keterangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Masukkan Keterangan..."
                    className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset ring-[#1D92F9] focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>

                {/* Upload File Baru */}
                <div className="mb-4.5">
                  <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                    Upload File Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative block w-full appearance-none rounded-xl border border-dashed px-4 py-4 transition sm:py-7.5 border-gray-4 bg-gray-2 cursor-pointer hover:border-[#1D92F9] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
                    <input
                      type="file"
                      multiple
                      name="profilePhoto"
                      id="profilePhoto"
                      accept="image/png, image/jpg, image/jpeg, image/gif, image/svg+xml, .pdf, .doc, .docx, .zip, .rar, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/zip, application/x-zip-compressed, application/x-rar-compressed, application/vnd.rar"
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border bg-white dark:border-dark-3 dark:bg-gray-dark border-stroke">
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
                        <span className="text-[#1D92F9]">Click to upload</span> atau drag and drop
                      </p>
                      <p className="mt-1 text-body-xs">
                        PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, RAR<br/>
                      </p>
                      <p className="mt-1 text-body-xs text-gray-500">
                        (Maksimal 100MB untuk arsip, 25MB untuk dokumen, 10MB untuk gambar)
                      </p>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-dark dark:text-white font-semibold mb-3">
                      File Terpilih
                    </h5>
                    {files.map((file, index) => {
                      const isImage = file.type.startsWith("image/");
                      const percent = uploadProgress[index];
                      const fileIcon = getFileIcon(file);

                      return (
                        <div key={index} className="relative p-3 border rounded-md bg-white dark:bg-dark-2 shadow-sm flex gap-4 items-center mb-2">
                          {isImage ? (
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              width={48}
                              height={48}
                              className="object-cover rounded-md border"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-gray-50 dark:bg-gray-700 text-2xl">
                              {fileIcon}
                            </div>
                          )}

                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium truncate max-w-[70%]">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">{percent}%</span>
                            </div>
                            <div className="mb-1 text-xs text-gray-400">
                              {formatFileSize(file.size)}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
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
                              className="ml-2 text-red-500 hover:text-red-700 text-sm"
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
                              className="text-red-500 hover:text-red-700 text-sm mt-1 flex-shrink-0"
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

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 justify-center rounded-[7px] p-[13px] font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 justify-center rounded-[7px] p-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      loading || isUploading || !isUploadComplete || !tahun || !keterangan
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#DC2626] to-[#EF4444] hover:bg-opacity-90 hover:from-[#DC2626] hover:to-[#DC2626]"
                    }`}
                    disabled={loading || isUploading || !isUploadComplete || !tahun || !keterangan}
                  >
                    {isUploading
                      ? "Uploading..."
                      : !tahun || !keterangan
                      ? "Lengkapi Semua Field"
                      : !isUploadComplete
                      ? "Upload File Terlebih Dahulu"
                      : loading
                      ? "Memperbaiki..."
                      : "Simpan Perbaikan"}
                  </button>
                </div>

                {/* Success Messages */}
                {success && (<p className="mt-2 text-green-500">Perbaikan dokumen berhasil disimpan!</p>)}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Success Modal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        title="Perbaikan Berhasil!"
        message="Dokumen berhasil diperbaiki dan akan diproses ulang oleh sistem."
        buttonText="Kembali ke Daftar Dokumen"
        onButtonClick={handleSuccessModalClose}
      />
    </>
  );
};

export default PerbaikanDokumen;