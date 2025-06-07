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
  const [type, setType] = useState<number>(0);
  const [subtype, setSubtype] = useState<number>(0);
  const [tahun, setTahun] = useState<string | number>('');
  const [keterangan, setKeterangan] = useState('');
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const [optionOfficials, setOptionOfficials] = useState<any[]>([]);
  const [optionTypes, setOptionTypes] = useState<any[]>([]);
  const [optionSubtypes, setOptionSubtypes] = useState<any[]>([]);
  const [resetKey, setResetKey] = useState(0);
  
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

  useEffect(() => {
    const fetchOfficials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/master_dinas/opt-dinas", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Officials data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const fetchedOfficials = result.responseData.items.map((item: any) => ({
          id: item.dinas,
          dinas: item.nama_dinas,
        }));

        setOptionOfficials(fetchedOfficials);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Dinas data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficials();
  }, []);

  useEffect(() => {
    const fetchOptionTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(Cookies.get("user") || "{}");
        const response = await apiRequest(`/master_jenis/all-data/by-role/${user.level_id}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Jenis data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const fetchOptionSettingTypes = result.responseData.items.map((item: any) => ({
          id: item.jenis,
          jenis: item.nama_jenis,
        }));

        setOptionTypes(fetchOptionSettingTypes);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Jenis data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionTypes();
  }, []);

  
  useEffect(() => {
    if (!type) return;

    const fetchOptionSubtypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(Cookies.get("user") || "{}");
        const response = await apiRequest(`/master_subjenis/all-data/by-role/${type}/${user.level_id}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Subjenis data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        const fetchOptionSettingSubtypes = result.responseData.items.map((item: any) => ({
          id: item.subjenis,
          subjenis: item.nama_subjenis,
        }));

        setOptionSubtypes(fetchOptionSettingSubtypes);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Subjenis data not found" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionSubtypes();
  }, [type]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        }
        
        return file.size > maxSize;
      });
      
      if (oversizedFiles.length > 0) {
        const oversizedFileInfo = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
        setError(`File terlalu besar: ${oversizedFileInfo}. Maksimal 100MB untuk ZIP/RAR, 25MB untuk PDF/DOC, dan 10MB untuk gambar.`);
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

    if (!isUploadComplete || tempFilePaths.length === 0) {
      setError("Belum ada file yang berhasil diupload.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(Cookies.get("user") || "{}");
   
    const payload = {
      dinas_id: dinas,
      type_id: type,
      subtype_id: subtype,
      tahun: tahun,
      keterangan: keterangan,
      file_paths: tempFilePaths,
      maker: user.userid || "",
      maker_role: user.level_id || "",
    };

    try {
      const response = await apiRequest("/document_managements/", "POST", payload);
  
      if (response.ok) {
        setSuccess(true);
        // Tampilkan modal sukses
        setIsSuccessModalOpen(true);
        
        // Reset semua field form
        setDinas(0);
        setType(0);
        setSubtype(0);
        setTahun('');
        setKeterangan('');
        setFiles([]);
        setUploadProgress([]);
        setTempFilePaths([]);
        setIsUploadComplete(false);
        setResetKey(prev => prev + 1);
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

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Upload dokumenmu sekarang juga
        </h4>
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              {/* Diganti dengan ElementComboboxAutocomplete */}
              <ElementComboboxAutocomplete
                label="Dinas"
                placeholder="Ketik minimal 3 huruf untuk mencari dinas..."
                options={optionOfficials.map((t) => ({ name: t.dinas, id: t.id }))}
                onChange={(value) => setDinas(Number(value))}
                resetKey={resetKey}
              />

              <ElementCombobox
                label="Jenis"
                placeholder="Pilih jenis"
                options={optionTypes.map((t) => ({ name: t.jenis, id: t.id }))}
                onChange={(value) => setType(Number(value))}
                resetKey={resetKey}
              />
              {type != 0 && (
                <ElementCombobox
                  label="Sub Jenis"
                  placeholder="Pilih sub jenis"
                  options={optionSubtypes.map((t) => ({ name: t.subjenis, id: t.id }))}
                  onChange={(value) => setSubtype(Number(value))}
                  resetKey={resetKey}
                />
              )}
              <ElementCombobox
                label="Tahun"
                placeholder="Pilih tahun"
                options={dataTahun}
                onChange={(value) => setTahun(value)}
                resetKey={resetKey}
              />
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Masukkan Keterangan..."
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              {/* Upload File */}
              <div
                id="FileUpload"
                className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-[#1D92F9] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:py-7.5"
              >
                <input
                  type="file"
                  multiple
                  name="profilePhoto"
                  id="profilePhoto"
                  accept="image/png, image/jpg, image/jpeg, image/gif, image/svg+xml, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .zip, .rar, application/zip, application/x-zip-compressed, application/x-rar-compressed, application/vnd.rar"
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
                    PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, RAR
                  </p>
                  <p className="mt-1 text-body-xs text-gray-500">
                    (Maksimal 100MB untuk arsip, 25MB untuk dokumen, 10MB untuk gambar)
                  </p>
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
                className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                disabled={loading || isUploading || !isUploadComplete}
              >
                {isUploading
                  ? "Uploading..."
                  : isUploadComplete
                    ? loading 
                      ? 'Menambahkan...'
                      : "Simpan Document"
                    : "Menunggu Upload"}
              </button>

              {/* Error and Success Messages */}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && <p className="text-green-500 mt-2">Upload Dokumen berhasil ditambahkan!</p>}  
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
        buttonText="Kembali ke Daftar Dokumen"
        onButtonClick={handleSuccessButtonClick}
      />
    </div>
  );
};

export default UploadDokumen;