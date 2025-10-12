"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";

import ElementCombobox from "@/components/elements/ElementCombobox";
import ElementComboboxAutocomplete from "@/components/elements/ElementComboboxAutocomplate";

import SuccessModal from "@/components/modals/successModal";
import { Alert, LoadingAlert } from "@/components/alerts/Alert";
import { FileUpload } from "@/components/elements/ElementFileUploadMultiple";
import { Input } from "@/components/elements/ElementInput";
import { Button } from "@/components/elements/ElementButton";

import { useDinasData, useJenisData, useSubjenisData } from "@/hooks/useMasterData";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useUploadPengelolaanFileUpload } from "@/hooks/useFileUpload";

import { generateYearOptions } from "@/utils/enums";
import type { 
  UploadFormState, 
  YearOption 
} from "@/types/formUploadPengelolaan";
import type { UserCookie } from "@/types/userCookie";

const dataTahun: YearOption[] = generateYearOptions();

const UploadDokumen = () => {
  // Form State - Using UploadFormState type
  const [formState, setFormState] = useState<UploadFormState>({
    dinas: 0,
    levelId: '',
    jenis: 0,
    subjenis: 0,
    tahun: '',
    keterangan: '',
  });
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Custom Hooks for Master Data
  const {
    data: optionDinas,
    loading: loadingDinas,
    error: errorDinas,
    isEmpty: isDinasEmpty,
    refetch: refetchDinas,
  } = useDinasData();

  const {
    data: optionJenis,
    loading: loadingJenis,
    error: errorJenis,
    isEmpty: isJenisEmpty,
    refetch: refetchJenis,
  } = useJenisData(formState.levelId);

  const {
    data: optionSubjenis,
    loading: loadingSubjenis,
    error: errorSubjenis,
    isEmpty: isSubjenisEmpty,
    refetch: refetchSubjenis,
  } = useSubjenisData(formState.jenis, formState.levelId);

  // File Upload Hook - removed error prop handling
  const {
    files,
    uploadProgress,
    tempFilePaths,
    isUploading,
    isUploadComplete,
    handleFileChange,
    handleRemoveFile,
    resetFileState,
  } = useUploadPengelolaanFileUpload("/document_managements/upload-file");

  // Form Validation Hook
  const { 
    isMasterDataComplete,
    isFormJenisUsable,
    isFormSubjenisUsable,
    formStatus 
  } = useFormValidation({
    dinas: formState.dinas,
    levelId: formState.levelId,
    jenis: formState.jenis,
    subjenis: formState.subjenis,
    loadingDinas,
    loadingJenis,
    loadingSubjenis,
    isDinasEmpty,
    isJenisEmpty,
    isSubjenisEmpty,
    optionJenis,
    optionSubjenis,
  });

  // Update form field helper
  const updateFormField = <K extends keyof UploadFormState>(
    field: K,
    value: UploadFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Reset jenis when dinas changes
  useEffect(() => {
    updateFormField('jenis', 0);
    updateFormField('subjenis', 0);
  }, [formState.dinas, formState.levelId]);

  // Reset subjenis when jenis changes
  useEffect(() => {
    updateFormField('subjenis', 0);
  }, [formState.jenis]);

  // Handle file change wrapper with master data validation
  const handleFileChangeWithValidation = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMasterDataComplete) {
      setError("Lengkapi data master terlebih dahulu sebelum upload file.");
      return;
    }
    
    setError(null);
    await handleFileChange(event);
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

    let userData: UserCookie;
    try {
      const userCookie = Cookies.get("user");
      userData = userCookie ? JSON.parse(userCookie) : {} as UserCookie;
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      userData = {} as UserCookie;
    }

    const payload = {
      dinas: formState.dinas,
      jenis: formState.jenis,
      subjenis: formState.subjenis,
      tahun: formState.tahun,
      keterangan: formState.keterangan,
      file_paths: tempFilePaths,
      maker: userData.userid || "",
      maker_role: userData.level_id || "",
    };

    try {
      const response = await apiRequest("/document_managements/", "POST", payload);

      if (response.ok) {
        setIsSuccessModalOpen(true);
        
        // Reset form
        setFormState({
          dinas: 0,
          levelId: '',
          jenis: 0,
          subjenis: 0,
          tahun: '',
          keterangan: '',
        });
        
        resetFileState();
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
    !formState.tahun || 
    !formState.keterangan;

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-2xl bg-white px-8 pb-6 pt-8 shadow-lg dark:bg-gray-dark dark:shadow-card">
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h4 className="text-2xl font-bold text-dark dark:text-white">
            Upload Dokumen
          </h4>
          <p className="mt-2 text-[18px] text-gray-600 dark:text-gray-400">
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
        {isDinasEmpty && (
          <Alert
            type="warning"
            title="Data Dinas Belum Tersedia"
            message="Hubungi administrator untuk menambahkan data dinas terlebih dahulu."
            onRetry={refetchDinas}
          />
        )}

        {isJenisEmpty && formState.levelId && (
          <Alert
            type="warning"
            title="Data Jenis Belum Tersedia"
            message="Hubungi administrator untuk menambahkan data jenis terlebih dahulu."
            onRetry={refetchJenis}
          />
        )}

        {isSubjenisEmpty && formState.jenis !== 0 && (
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
        <div className="rounded-xl border border-gray-200 bg-white-50 dark:border-dark-3 dark:bg-dark-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dinas Combobox */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[20px] font-semibold text-dark dark:text-white">
                  Dinas <span className="text-red-500">*</span>
                </label>
                {loadingDinas && (
                  <span className="text-xs text-blue-500 animate-pulse">Memuat data...</span>
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
                  updateFormField('dinas', selectedDinas);
                  
                  const selectedDinasData = optionDinas.find(item => item.id === selectedDinas);
                  if (selectedDinasData) {
                    updateFormField('levelId', selectedDinasData.level_id);
                  }
                }}
                resetKey={resetKey}
                disabled={loadingDinas || isDinasEmpty}
              />
            </div>

            {/* Jenis Combobox */}
            {formState.levelId !== "" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[20px] font-semibold text-dark dark:text-white">
                    Jenis
                    {!loadingJenis && !isJenisEmpty && optionJenis.length > 0 && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
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
                  onChange={(value) => updateFormField('jenis', Number(value))}
                  resetKey={resetKey}
                  disabled={loadingJenis || isJenisEmpty || !isFormJenisUsable}
                />
              </div>
            )}

            {/* Sub Jenis Combobox */}
            {formState.jenis !== 0 && (
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
                  onChange={(value) => updateFormField('subjenis', Number(value))}
                  resetKey={resetKey}
                  disabled={loadingSubjenis || isSubjenisEmpty || !isFormSubjenisUsable}
                />
              </div>
            )}

            {/* Tahun Combobox */}
            <div>
              <label className="mb-2 block text-[20px] font-semibold text-dark dark:text-white">
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
                onChange={(value) => updateFormField('tahun', value)}
                resetKey={resetKey}
                disabled={!isMasterDataComplete}
              />
            </div>
            
            {/* Keterangan Input */}
            <Input
              label="Keterangan"
              required
              type="text"
              value={formState.keterangan}
              onChange={(e) => updateFormField('keterangan', e.target.value)}
              placeholder={
                !isMasterDataComplete 
                  ? "Lengkapi data master terlebih dahulu" 
                  : "Masukkan keterangan dokumen..."
              }
              disabled={!isMasterDataComplete}
            />

            {/* File Upload Component - No error prop */}
            <FileUpload
              files={files}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              isUploadComplete={isUploadComplete}
              disabled={!isMasterDataComplete}
              onFileChange={handleFileChangeWithValidation}
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
                : !formState.tahun || !formState.keterangan
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