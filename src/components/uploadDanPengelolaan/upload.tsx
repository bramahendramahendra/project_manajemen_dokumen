"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { apiRequestUpload } from "@/helpers/uploadClient";
import ElementCombobox from "@/components/elements/ElementCombobox";
import SuccessModal from "@/components/modals/successModal";
import { Alert, LoadingAlert } from "@/components/alerts/Alert";
import { FileUpload } from "@/components/elements/ElementFileUploadMultiple";
import { Input } from "@/components/elements/ElementInput";
import { Button } from "@/components/elements/ElementButton";
import { DinasCard } from "@/components/uploadDanPengelolaan/DinasCard";
import { useJenisData, useSubjenisData } from "@/hooks/useMasterData";
import { useFormValidation } from "@/hooks/useFormValidation";
import { 
  isValidFileType, 
  validateFileSize,
  formatFileSize 
} from "@/utils/uploadUtils";
import { generateYearOptions } from "@/utils/enums";

const dataTahun = generateYearOptions();

const UploadDokumen = () => {
  // Form State
  const [dinas, setDinas] = useState<number>(0);
  const [levelId, setLevelId] = useState<string>('');
  const [jenis, setJenis] = useState<number>(0);
  const [subjenis, setSubjenis] = useState<number>(0);
  const [tahun, setTahun] = useState<string | number>('');
  const [keterangan, setKeterangan] = useState('');
  const [namaDinas, setNamaDinas] = useState<string>('');
  
  // File Upload State
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Load user data from cookie
  useEffect(() => {
    try {
      const userCookie = Cookies.get("user");
      if (userCookie) {
        const userData = JSON.parse(userCookie);
        if (userData.userid) {
          setDinas(userData.userid);
        }
        if (userData.level_id) {
          setLevelId(userData.level_id);
        }
        if (userData.nama_dinas) {
          setNamaDinas(userData.nama_dinas);
        }
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }, []);

  // Custom Hooks for Master Data
  const {
    data: optionJenis,
    loading: loadingJenis,
    error: errorJenis,
    isEmpty: isJenisEmpty,
    refetch: refetchJenis,
  } = useJenisData(levelId);

  const {
    data: optionSubjenis,
    loading: loadingSubjenis,
    error: errorSubjenis,
    isEmpty: isSubjenisEmpty,
    refetch: refetchSubjenis,
  } = useSubjenisData(jenis, levelId);

  // Form Validation Hook
  const { 
    isMasterDataComplete,
    isFormJenisUsable,
    isFormSubjenisUsable,
    formStatus 
  } = useFormValidation({
    dinas,
    levelId,
    jenis,
    subjenis,
    loadingDinas: false,
    loadingJenis,
    loadingSubjenis,
    isDinasEmpty: false,
    isJenisEmpty,
    isSubjenisEmpty,
    optionJenis,
    optionSubjenis,
  });

  // Reset subjenis when jenis changes
  useEffect(() => {
    setSubjenis(0);
  }, [jenis]);

  // Handle file change with validation
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMasterDataComplete) {
      setError("Lengkapi data master terlebih dahulu sebelum upload file.");
      return;
    }

    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      
      // Validate file types
      const invalidFiles = selectedFiles.filter(file => !isValidFileType(file));
      if (invalidFiles.length > 0) {
        setError(`File tidak didukung: ${invalidFiles.map(f => f.name).join(', ')}. Hanya mendukung PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, dan RAR.`);
        return;
      }

      // Validate file sizes
      const oversizedFiles = selectedFiles.filter(file => !validateFileSize(file).isValid);
      if (oversizedFiles.length > 0) {
        const oversizedFileInfo = oversizedFiles.map(f => {
          const { maxSize } = validateFileSize(f);
          return `${f.name} (${formatFileSize(f.size)}, maks: ${maxSize})`;
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

  // Handle remove file
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
    
    // Reset file input
    const fileInput = document.getElementById('documentFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isMasterDataComplete) {
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
      dinas: userData.dinas || dinas,
      jenis: jenis,
      subjenis: subjenis,
      tahun: tahun,
      keterangan: keterangan,
      file_paths: tempFilePaths,
      maker: userData.userid || "",
      maker_role: userData.level_id || "",
    };

    try {
      const response = await apiRequest("/document_managements/", "POST", payload);

      if (response.ok) {
        setIsSuccessModalOpen(true);
        
        // Reset form
        setJenis(0);
        setSubjenis(0);
        setTahun('');
        setKeterangan('');
        setFiles([]);
        setUploadProgress([]);
        setTempFilePaths([]);
        setIsUploadComplete(false);
        setIsUploading(false);
        setResetKey((prev) => prev + 1);

        const fileInput = document.getElementById('documentFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
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

  // Determine if submit button should be disabled
  const isSubmitDisabled = 
    loading || 
    isUploading || 
    !isUploadComplete || 
    !isMasterDataComplete || 
    !tahun || 
    !keterangan;

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-2xl bg-white px-8 pb-6 pt-8 shadow-lg dark:bg-gray-dark dark:shadow-card">
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h4 className="text-2xl font-bold text-dark dark:text-white">
            Upload Dokumen
          </h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Lengkapi formulir di bawah ini untuk mengupload dokumen Anda
          </p>
        </div>

        {/* Form Status Messages */}
        {formStatus.type === 'loading' && (
          <LoadingAlert message={formStatus.message} />
        )}
        
        {formStatus.type === 'info' && (
          <Alert type="info" message={formStatus.message} />
        )}
        
        {formStatus.type === 'success' && (
          <Alert type="success" message={formStatus.message} />
        )}

        {/* Empty Data Alerts */}
        {isJenisEmpty && levelId && (
          <Alert
            type="warning"
            title="Data Jenis Belum Tersedia"
            message="Hubungi administrator untuk menambahkan data jenis terlebih dahulu."
            onRetry={refetchJenis}
          />
        )}

        {isSubjenisEmpty && jenis !== 0 && (
          <Alert
            type="warning"
            title="Data Sub Jenis Belum Tersedia"
            message="Hubungi administrator untuk menambahkan data sub jenis terlebih dahulu."
            onRetry={refetchSubjenis}
          />
        )}

        {/* Error Alert */}
        {error && (
          <Alert type="error" message={error} />
        )}

        {/* Form */}
        <div className="rounded-xl border border-white-200 bg-white-50 dark:border-dark-3 dark:bg-dark-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dinas Card */}
            <DinasCard namaDinas={namaDinas} />

            {/* Jenis Combobox */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-dark dark:text-white">
                  Jenis <span className="text-red-500">*</span>
                </label>
                {loadingJenis && (
                  <span className="text-xs text-blue-500 animate-pulse">Memuat data...</span>
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
                disabled={loadingJenis || isJenisEmpty}
              />
            </div>

            {/* Sub Jenis Combobox */}
            {jenis !== 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-dark dark:text-white">
                    Sub Jenis
                    {!loadingSubjenis && !isSubjenisEmpty && optionSubjenis.length > 0 && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {loadingSubjenis && (
                    <span className="text-xs text-blue-500 animate-pulse">Memuat data...</span>
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
                  disabled={loadingSubjenis || isSubjenisEmpty || !isFormSubjenisUsable}
                />
              </div>
            )}

            {/* Tahun Combobox */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
                Tahun <span className="text-red-500">*</span>
              </label>
              <ElementCombobox
                label=""
                placeholder={
                  !isMasterDataComplete 
                    ? "Lengkapi data master terlebih dahulu" 
                    : "Pilih tahun"
                }
                options={dataTahun}
                onChange={(value) => setTahun(value)}
                resetKey={resetKey}
                disabled={!isMasterDataComplete}
              />
            </div>
            
            {/* Keterangan Input */}
            <Input
              label="Keterangan"
              required
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder={
                !isMasterDataComplete 
                  ? "Lengkapi data master terlebih dahulu" 
                  : "Masukkan keterangan dokumen..."
              }
              disabled={!isMasterDataComplete}
            />

            {/* File Upload Component */}
            <FileUpload
              files={files}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              isUploadComplete={isUploadComplete}
              disabled={!isMasterDataComplete}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={isSubmitDisabled}
            >
              {isUploading
                ? "Mengupload File..."
                : !isMasterDataComplete
                ? "Lengkapi Data Master"
                : !tahun || !keterangan
                ? "Lengkapi Semua Field"
                : !isUploadComplete
                ? "Upload File Terlebih Dahulu"
                : loading
                ? "Menyimpan..."
                : "Simpan Dokumen"}
            </Button>
          </form>
        </div>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Berhasil!"
        message="Dokumen berhasil diupload ke dalam sistem."
        buttonText="Kembali"
        onButtonClick={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};

export default UploadDokumen;