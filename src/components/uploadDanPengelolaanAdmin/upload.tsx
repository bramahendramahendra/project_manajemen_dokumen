"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { apiRequestUpload } from "@/helpers/uploadClient";
import ElementCombobox from "../elements/ElementCombobox";
import ElementComboboxAutocomplete from "../elements/ElementComboboxAutocomplate";
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

const UploadDokumen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [dinas, setDinas] = useState<number>(0);
  const [levelId, setLevelId] = useState<string>('');
  const [jenis, setJenis] = useState<number>(0);
  const [subjenis, setSubjenis] = useState<number>(0);
  const [tahun, setTahun] = useState<string | number>('');
  const [keterangan, setKeterangan] = useState('');
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const [optionDinas, setOptionDinas] = useState<any[]>([]);
  const [optionJenis, setOptionJenis] = useState<any[]>([]);
  const [optionSubjenis, setOptionSubjenis] = useState<any[]>([]);
  const [resetKey, setResetKey] = useState(0);
  
  // State untuk Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // State untuk tracking loading data master
  const [loadingDinas, setLoadingDinas] = useState(false);
  const [loadingJenis, setLoadingJenis] = useState(false);
  const [loadingSubjenis, setLoadingSubjenis] = useState(false);

  // State untuk tracking apakah data master kosong
  const [isDinasEmpty, setIsDinasEmpty] = useState(false);
  const [isJenisEmpty, setIsJenisEmpty] = useState(false);
  const [isSubjenisEmpty, setIsSubjenisEmpty] = useState(false);

  // Fungsi untuk mengecek apakah form jenis bisa digunakan
  const isFormJenisUsable = () => {
    const basicDataAvailable = !loadingDinas && !isDinasEmpty;
    const basicSelectionMade = dinas !== 0 && levelId !== "";
    
    return basicDataAvailable && basicSelectionMade;
  };

  // Fungsi untuk mengecek apakah form subjenis bisa digunakan
  const isFormSubjenisUsable = () => {
    // const basicDataAvailable = !loadingDinas && !loadingJenis && !isDinasEmpty && !isJenisEmpty;
    const basicDataAvailable = !loadingJenis && !isJenisEmpty;
    // const basicSelectionMade = dinas !== 0 && levelId !== "" && jenis !== 0;
    const basicSelectionMade = jenis !== 0;
    
    return basicDataAvailable && basicSelectionMade;
  };

  // Fungsi untuk mengecek apakah form bisa digunakan
  const isFormUsable = () => {
    const basicDataAvailable = !loadingSubjenis && !isSubjenisEmpty;
    const basicSelectionMade = subjenis !== 0;
    
    return basicDataAvailable && basicSelectionMade;
  };

  // Fungsi untuk mengecek apakah subjenis wajib dan sudah dipilih
  const isJenisRequiredAndSelected = () => {
    // Jika ada data subjenis tersedia, maka subjenis wajib dipilih
    if (dinas !== 0 && levelId !== "" && !loadingJenis && !isJenisEmpty && optionJenis.length > 0) {
      return jenis !== 0;
    }
    // Jika tidak ada data subjenis atau sedang loading, tidak perlu dipilih
    return true;
  };

  // Fungsi untuk mengecek apakah subjenis wajib dan sudah dipilih
  const isSubjenisRequiredAndSelected = () => {
    // Jika ada data subjenis tersedia, maka subjenis wajib dipilih
    if (jenis !== 0 && !loadingSubjenis && !isSubjenisEmpty && optionSubjenis.length > 0) {
      return subjenis !== 0;
    }
    // Jika tidak ada data subjenis atau sedang loading, tidak perlu dipilih
    return true;
  };

  // Fungsi untuk mengecek apakah semua data master sudah lengkap
  const isMasterDataComplete = () => {
    return isFormJenisUsable() && isFormSubjenisUsable() && isFormUsable() && isJenisRequiredAndSelected() && isSubjenisRequiredAndSelected();
  };

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

  // Fungsi untuk retry fetch data
  const retryFetchDinas = () => {
    fetchDinas();
  };

  const retryFetchJenis = () => {
    if (dinas && levelId) {
      fetchOptionJenis();
    }
  };

  const retryFetchSubjenis = () => {
    if (jenis) {
      fetchOptionSubjenis();
    }
  };

  // Fungsi untuk fetch officials dengan handling yang lebih baik
  const fetchDinas = async () => {
    setLoadingDinas(true);
    setError(null);
    setIsDinasEmpty(false);
    
    try {
      const response = await apiRequest("/master_dinas/opt-dinas?level_id=DNS,ADM", "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Dinas data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Check jika items null atau array kosong
      if (!result.responseData?.items || result.responseData.items.length === 0) {
        setIsDinasEmpty(true);
        setOptionDinas([]);
      } else {
        const resDinas = result.responseData.items.map((item: any) => ({
          id: item.dinas,
          dinas: item.nama_dinas,
          level_id: item.level_id,
        }));
        setOptionDinas(resDinas);
        setIsDinasEmpty(false);
      }
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Gagal mengambil data dinas. Periksa koneksi internet." : err.message);
      setIsDinasEmpty(true);
    } finally {
      setLoadingDinas(false);
    }
  };

  // Fungsi untuk fetch jenis dengan handling yang lebih baik
  const fetchOptionJenis = async () => {
    setLoadingJenis(true);
    setError(null);
    setIsJenisEmpty(false);
    
    try {
      const response = await apiRequest(`/master_jenis/all-data/by-role/${levelId}`,"GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Jenis data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Check jika items null atau array kosong
      if (!result.responseData?.items || result.responseData.items.length === 0) {
        setIsJenisEmpty(true);
        setOptionJenis([]);
      } else {
        const resJenis = result.responseData.items.map((item: any) => ({
          id: item.jenis,
          jenis: item.nama_jenis,
        }));
        setOptionJenis(resJenis);
        setIsJenisEmpty(false);
      }
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Gagal mengambil data jenis. Periksa koneksi internet." : err.message);
      setIsJenisEmpty(true);
    } finally {
      setLoadingJenis(false);
    }
  };

  // Fungsi untuk fetch subjenis dengan handling yang lebih baik
  const fetchOptionSubjenis = async () => {
    setLoadingSubjenis(true);
    setError(null);
    setIsSubjenisEmpty(false);
    
    try {
      const response = await apiRequest(`/master_subjenis/all-data/by-role/${jenis}/${levelId}`,"GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Subjenis data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Check jika items null atau array kosong
      if (!result.responseData?.items || result.responseData.items.length === 0) {
        setIsSubjenisEmpty(true);
        setOptionSubjenis([]);
      } else {
        const resSubjenis = result.responseData.items.map((item: any) => ({
          id: item.subjenis,
          subjenis: item.nama_subjenis,
        }));
        setOptionSubjenis(resSubjenis);
        setIsSubjenisEmpty(false);
      }
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Gagal mengambil data subjenis. Periksa koneksi internet." : err.message);
      setIsSubjenisEmpty(true);
    } finally {
      setLoadingSubjenis(false);
    }
  };

  useEffect(() => {
    fetchDinas();
  }, []);

  useEffect(() => {
    if (!dinas && !levelId) {
      setOptionJenis([]);
      setIsJenisEmpty(false);
      setJenis(0); // Reset subjenis ketika jenis berubah
      return;
    }
    
    fetchOptionJenis();
  }, [dinas, levelId]);

  useEffect(() => {
    if (!jenis) {
      setOptionSubjenis([]);
      setIsSubjenisEmpty(false);
      setSubjenis(0); // Reset subjenis ketika jenis berubah
      return;
    }

    fetchOptionSubjenis();
  }, [jenis]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Cek apakah form bisa digunakan
    if (!isMasterDataComplete()) {
      setError("Lengkapi data master terlebih dahulu sebelum upload file.");
      return;
    }

    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      
      // Validasi tipe file
      const invalidFiles = selectedFiles.filter(file => !isValidFileType(file));
      if (invalidFiles.length > 0) {
        setError(`File tidak didukung: ${invalidFiles.map(f => f.name).join(', ')}. Hanya mendukung PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, dan RAR.`);
        return;
      }

      // Validasi ukuran file (maksimal 100MB per file untuk ZIP/RAR, 25MB untuk PDF/DOC, 10MB untuk image)
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

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  // Fungsi untuk aksi tombol pada modal
  const handleSuccessButtonClick = () => {
    setIsSuccessModalOpen(false);
    // Optional: Navigasi ke halaman lain jika diperlukan
    // router.push('/documents');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validasi data master kosong
    if (!isMasterDataComplete()) {
      setError("Data master belum lengkap. Pastikan semua data yang diperlukan telah dipilih.");
      setLoading(false);
      return;
    }

    if (!isUploadComplete || tempFilePaths.length === 0) {
      setError("Belum ada file yang berhasil diupload.");
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
      dinas: dinas,
      jenis: jenis,
      subjenis: subjenis,
      tahun: tahun,
      keterangan: keterangan,
      file_paths: tempFilePaths,
      maker: userData.userid || "",
      maker_role: userData.level_id || "",
    };

    try {
      const response = await apiRequest("/document_managements/","POST", payload);

      if (response.ok) {
        setSuccess(true);
        
        // Tampilkan modal sukses
        setIsSuccessModalOpen(true);
        
        // Reset form
        setDinas(0);
        setJenis(0);
        setSubjenis(0);
        setTahun('');
        setKeterangan('');
        setFiles([]);
        setUploadProgress([]);
        setTempFilePaths([]);
        setIsUploadComplete(false);
        setResetKey((prev) => prev + 1);
      } else {
        const result = await response.json();
        setError(result.responseDesc || "Terjadi kesalahan saat menyimpan dokumen");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data");
    } finally {
      setLoading(false);
    }
  };

  // Komponen untuk menampilkan pesan data kosong
  const EmptyDataMessage = ({ type, onRetry }: { type: string, onRetry: () => void }) => (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Data {type} belum tersedia
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Hubungi administrator untuk menambahkan data {type} terlebih dahulu.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="ml-3 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );

  // Komponen untuk menampilkan status form
  const FormStatusMessage = () => {
    if (loadingDinas || loadingJenis) {
      return (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Memuat data master...
            </p>
          </div>
        </div>
      );
    }

    if (isDinasEmpty || isJenisEmpty) {
      return null; // EmptyDataMessage akan ditampilkan
    }

    if (!isFormJenisUsable()) {
      return (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Pilih Dinas terlebih dahulu untuk melanjutkan.
            </p>
          </div>
        </div>
      );
    } else if(!isFormSubjenisUsable()) {
      return (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Pilih Jenis terlebih dahulu untuk melanjutkan.
            </p>
          </div>
        </div>
      );
    } else if(!isFormUsable()) {

    // if (jenis !== 0 && !loadingSubjenis && !isSubjenisEmpty && optionSubjenis.length > 0 && subjenis === 0) {
      return (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Pilih Sub Jenis untuk melanjutkan.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Form siap digunakan. Silakan lengkapi data dan upload dokumen.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Upload dokumenmu sekarang juga
        </h4>
        
        {/* Status pesan form */}
        <FormStatusMessage />
        
        {/* Pesan jika data master kosong */}
        {isDinasEmpty && (
          <EmptyDataMessage type="Dinas" onRetry={retryFetchDinas} />
        )}
        
        {isJenisEmpty && (
          <EmptyDataMessage type="Jenis" onRetry={retryFetchJenis} />
        )}
        
        {jenis !== 0 && isSubjenisEmpty && (
          <EmptyDataMessage type="Sub Jenis" onRetry={retryFetchSubjenis} />
        )}

        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              {/* Dinas Combobox */}
              <div className="mb-4.5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-body-sm font-medium text-dark dark:text-white">
                    Dinas <span className="text-red-500">*</span>
                  </label>
                  {loadingDinas && (
                    <span className="text-xs text-blue-500">Memuat data...</span>
                  )}
                </div>
                <ElementComboboxAutocomplete
                  label=""
                  placeholder={
                    loadingDinas 
                      ? "Memuat data dinas..." 
                      : isDinasEmpty 
                      ? "Data dinas belum tersedia" 
                      : "Ketik minimal 3 huruf untuk mencari dinas..."
                  }
                  options={optionDinas.map((t) => ({ name: t.dinas, id: t.id }))}
                  onChange={(value) => {
                    const selectedDinas = Number(value);
                    setDinas(selectedDinas);
                    
                    // Cari data dinas yang dipilih untuk mendapatkan level_id
                    const selectedDinasData = optionDinas.find(item => item.id === selectedDinas);
                    if (selectedDinasData) {
                      setLevelId(selectedDinasData.level_id);
                    }
                    
                    // Reset jenis dan subjenis ketika dinas berubah
                    setJenis(0);
                    setSubjenis(0);
                  }}
                  resetKey={resetKey}
                  disabled={loadingDinas || isDinasEmpty}
                />
              </div>

              {/* Jenis Combobox */}
              {levelId != "" && (
                <div className="mb-4.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-body-sm font-medium text-dark dark:text-white">
                      Jenis 
                      {!loadingJenis && !isJenisEmpty && optionJenis.length > 0 && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {loadingJenis && (
                      <span className="text-xs text-blue-500">Memuat data...</span>
                    )}
                  </div>
                  <ElementCombobox
                    label=""
                    placeholder={
                      loadingJenis 
                        ? "Memuat data jenis..." 
                        : isJenisEmpty 
                        ? "Data jenis belum tersedia" 
                        : "Pilih jenis"
                    }
                    options={optionJenis.map((t) => ({ name: t.jenis, id: t.id }))}
                    onChange={(value) => setJenis(Number(value))}
                    resetKey={resetKey}
                    disabled={loadingJenis || isJenisEmpty || !isFormJenisUsable()}
                  />
                </div>
              )}

              {/* Sub Jenis Combobox - hanya muncul jika jenis dipilih */}
              {jenis != 0 && (
                <div className="mb-4.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-body-sm font-medium text-dark dark:text-white">
                      Sub Jenis
                      {!loadingSubjenis && !isSubjenisEmpty && optionSubjenis.length > 0 && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {loadingSubjenis && (
                      <span className="text-xs text-blue-500">Memuat data...</span>
                    )}
                  </div>
                  <ElementCombobox
                    label=""
                    placeholder={
                      loadingSubjenis 
                        ? "Memuat data sub jenis..." 
                        : isSubjenisEmpty 
                        ? "Data sub jenis belum tersedia" 
                        : "Pilih sub jenis"
                    }
                    options={optionSubjenis.map((t) => ({ name: t.subjenis, id: t.id }))}
                    onChange={(value) => setSubjenis(Number(value))}
                    resetKey={resetKey}
                    disabled={loadingSubjenis || isSubjenisEmpty || !isFormSubjenisUsable()}
                  />
                </div>
              )}

              {/* Tahun Combobox */}
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <ElementCombobox
                  label=""
                  placeholder={!isMasterDataComplete() ? "Lengkapi data master terlebih dahulu" : "Pilih tahun"}
                  options={dataTahun}
                  onChange={(value) => setTahun(value)}
                  resetKey={resetKey}
                  disabled={!isMasterDataComplete()}
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
                  placeholder={!isMasterDataComplete() ? "Lengkapi data master terlebih dahulu" : "Masukkan Keterangan..."}
                  className={`w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset dark:border-dark-3 dark:bg-dark-2 dark:text-white ${
                    !isMasterDataComplete()
                      ? "ring-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:ring-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      : "ring-[#1D92F9] focus:ring-indigo-600 dark:focus:border-primary"
                  }`}
                  required
                  disabled={!isMasterDataComplete()}
                />
              </div>

              {/* Upload File */}
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative block w-full appearance-none rounded-xl border border-dashed px-4 py-4 transition sm:py-7.5 ${
                    !isMasterDataComplete()
                      ? "border-gray-300 bg-gray-50 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800"
                      : "border-gray-4 bg-gray-2 cursor-pointer hover:border-[#1D92F9] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    name="profilePhoto"
                    id="profilePhoto"
                    accept="image/png, image/jpg, image/jpeg, image/gif, image/svg+xml, .pdf, .doc, .docx, .zip, .rar, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/zip, application/x-zip-compressed, application/x-rar-compressed, application/vnd.rar"
                    className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    onChange={handleFileChange}
                    disabled={!isMasterDataComplete()}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <span className={`flex h-13.5 w-13.5 items-center justify-center rounded-full border bg-white dark:border-dark-3 dark:bg-gray-dark ${
                      !isMasterDataComplete() ? "border-gray-300" : "border-stroke"
                    }`}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.4613 2.07827C10.3429 1.94876 10.1755 1.875 10 1.875C9.82453 1.875 9.65714 1.94876 9.53873 2.07827L6.2054 5.7241C5.97248 5.97885 5.99019 6.37419 6.24494 6.6071C6.49969 6.84002 6.89502 6.82232 7.12794 6.56756L9.375 4.10984V13.3333C9.375 13.6785 9.65482 13.9583 10 13.9583C10.3452 13.9583 10.625 13.6785 10.625 13.3333V4.10984L12.8721 6.56756C13.105 6.82232 13.5003 6.84002 13.7551 6.6071C14.0098 6.37419 14.0275 5.97885 13.7946 5.7241L10.4613 2.07827Z"
                          fill={!isMasterDataComplete() ? "#9CA3AF" : "#1D92F9"}
                        />
                        <path
                          d="M3.125 12.5C3.125 12.1548 2.84518 11.875 2.5 11.875C2.15482 11.875 1.875 12.1548 1.875 12.5V12.5457C1.87498 13.6854 1.87497 14.604 1.9721 15.3265C2.07295 16.0765 2.2887 16.7081 2.79029 17.2097C3.29189 17.7113 3.92345 17.9271 4.67354 18.0279C5.39602 18.125 6.31462 18.125 7.45428 18.125H12.5457C13.6854 18.125 14.604 18.125 15.3265 18.0279C16.0766 17.9271 16.7081 17.7113 17.2097 17.2097C17.7113 16.7081 17.9271 16.0765 18.0279 15.3265C18.125 14.604 18.125 13.6854 18.125 12.5457V12.5C18.125 12.1548 17.8452 11.875 17.5 11.875C17.1548 11.875 16.875 12.1548 16.875 12.5C16.875 13.6962 16.8737 14.5304 16.789 15.1599C16.7068 15.7714 16.5565 16.0952 16.3258 16.3258C16.0952 16.5565 15.7714 16.7068 15.1599 16.789C14.5304 16.8737 13.6962 16.875 12.5 16.875H7.5C6.30382 16.875 5.46956 16.8737 4.8401 16.789C4.22862 16.7068 3.90481 16.5565 3.67418 16.3258C3.44354 16.0952 3.29317 15.7714 3.21096 15.1599C3.12633 14.5304 3.125 13.6962 3.125 12.5Z"
                          fill={!isMasterDataComplete() ? "#9CA3AF" : "#1D92F9"}
                        />
                      </svg>
                    </span>
                    <p className={`mt-2.5 text-body-sm font-medium ${
                      !isMasterDataComplete() ? "text-gray-500" : ""
                    }`}>
                      {!isMasterDataComplete() ? (
                        "Lengkapi data master terlebih dahulu"
                      ) : (
                        <>
                          <span className="text-[#1D92F9]">Click to upload</span> atau drag and drop
                        </>
                      )}
                    </p>
                    {isMasterDataComplete() && (
                      <>
                        <p className="mt-1 text-body-xs">
                          PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, RAR<br/>
                        </p>
                        <p className="mt-1 text-body-xs text-gray-500">
                          (Maksimal 100MB untuk arsip, 25MB untuk dokumen, 10MB untuk gambar)
                        </p>
                      </>
                    )}
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

              <button
                type="submit"
                className={`flex w-full justify-center rounded-[7px] p-[13px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  loading || isUploading || !isUploadComplete || !isMasterDataComplete() || !tahun || !keterangan
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0C479F] to-[#1D92F9] hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F]"
                }`}
                disabled={loading || isUploading || !isUploadComplete || !isMasterDataComplete() || !tahun || !keterangan}
              >
                {isUploading
                  ? "Uploading..."
                  : !isMasterDataComplete()
                    ? "Lengkapi Data Master"
                    : !tahun || !keterangan
                    ? "Lengkapi Semua Field"
                    : !isUploadComplete
                    ? "Upload File Terlebih Dahulu"
                    : loading
                    ? "Menambahkan..."
                    : "Simpan Document"}
              </button>

              {/* Error and Success Messages */}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && (<p className="mt-2 text-green-500">Upload Dokumen berhasil ditambahkan!</p>)}
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Modal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Berhasil!"
        message="Dokumen berhasil diupload ke dalam sistem."
        // buttonText="Kembali ke Upload & Pengelolaan Dokumen"
        buttonText="Kembali"
        onButtonClick={handleSuccessButtonClick}
      />
    </div>
  );
};

export default UploadDokumen;