"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";

import ElementComboboxAutocomplete from "@/components/elements/ElementComboboxAutocomplate";
import { Input } from "@/components/elements/ElementInput";
import { Textarea } from "@/components/elements/ElementInput";
import { Button } from "@/components/elements/ElementButton";
import SuccessModal from "@/components/modals/successModal";
import ErrorModal from "@/components/modals/errorModal";
import { Alert, LoadingAlert } from "@/components/alerts/Alert";
import DocumentList from "@/components/pengirimanLangsung/documentList";
import SelectedDocumentsDisplay from "@/components/pengirimanLangsung/selectedDocuments";
import FileUploadSection from "@/components/pengirimanLangsung/fileUploadSection";

import { useDinasAllDataPengirimanLangsung } from "@/hooks/useMasterData";
import { useDocumentSelection } from "@/hooks/useDocumentSelection";
import { usePengirimanLangsungFileUpload } from "@/hooks/useFileUpload";

import type { 
  PengirimanLangsungFormState
} from "@/types/formPengirimanLangsung";
import type { UserCookie } from "@/types/userCookie";

const FormPengirimanLangsung = () => {
  // Form State
  const [formState, setFormState] = useState<PengirimanLangsungFormState>({
    judul: '',
    dinas: 0,
    lampiran: '',
  });

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState(0);
  
  // Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Custom Hooks for Master Data
  const {
    data: optionDinas,
    loading: loadingDinas,
    isEmpty: isDinasEmpty,
    refetch: refetchDinas,
  } = useDinasAllDataPengirimanLangsung();

  // Custom Hooks for Document Selection
  const {
    documents,
    selectedDocuments,
    loading: docsLoading,
    searchTerm,
    showAll,
    setSearchTerm,
    setShowAll,
    handleCheckboxChange,
    handleRemoveDocument,
    resetSelection,
  } = useDocumentSelection("/direct-shipping/");

  // File Upload Hook
  const {
    file,
    uploadProgress,
    tempFilePath,
    isUploading,
    isUploadComplete,
    handleFileChange,
    handleRemoveFile,
    resetFileState,
  } = usePengirimanLangsungFileUpload("/direct-shipping/upload-file");

  // Update form field helper
  const updateFormField = <K extends keyof PengirimanLangsungFormState>(
    field: K,
    value: PengirimanLangsungFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Helper Functions
  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  const getDocumentDisplayName = (doc: any): string => {
    return `${doc.dinas} - ${doc.jenis} - ${doc.subjenis} - ${doc.tahun}`;
  };

  // Computed values for form validation
  const isBasicInfoComplete = formState.dinas !== 0 && formState.judul.trim() !== '';
  const isSubmitDisabled = loading || isUploading || !isBasicInfoComplete;

  // Form Status
  const getFormStatus = (): { type: 'loading' | 'info' | 'success' | 'empty'; message: string } => {
    if (loadingDinas) {
      return { type: 'loading', message: 'Memuat data dinas...' };
    }

    if (isDinasEmpty) {
      return { type: 'empty', message: '' };
    }

    if (!formState.dinas) {
      return { 
        type: 'info', 
        message: 'Pilih Kepada Dinas terlebih dahulu untuk melanjutkan.' 
      };
    }

    if (!formState.judul.trim()) {
      return { 
        type: 'info', 
        message: 'Isi Judul untuk melanjutkan.' 
      };
    }

    return { 
      type: 'success', 
      message: 'Form siap digunakan. Anda dapat memilih dokumen atau langsung mengirim.' 
    };
  };

  const formStatus = getFormStatus();

  // Handle Form Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.dinas) {
      showErrorModal("Validasi Gagal", "Kepada Dinas harus dipilih");
      return;
    }
    
    if (!formState.judul.trim()) {
      showErrorModal("Validasi Gagal", "Judul harus diisi");
      return;
    }
    
    setLoading(true);
    
    try {
      const userCookie = Cookies.get("user");
      const user: UserCookie = userCookie ? JSON.parse(userCookie) : {} as UserCookie;

      if (!user.userid || !user.name || !user.dinas || !user.nama_dinas) {
        showErrorModal("Error Session", "Data pengguna tidak valid. Silakan login ulang.");
        return;
      }

      const foundNamaDinas = optionDinas.find((item) => item.id === formState.dinas);
      
      if (!foundNamaDinas) {
        showErrorModal("Validasi Gagal", "Dinas yang dipilih tidak valid");
        return;
      }

      const documentIds = selectedDocuments.map(doc => doc.id);
      
      const payload = {
        kepada_id: formState.dinas,
        kepada_dinas: foundNamaDinas.dinas,
        judul: formState.judul.trim(),
        dokumen_ids: documentIds,
        lampiran: formState.lampiran.trim() || "",
        file_path: tempFilePath || "",
        file_name: file ? file.name : "",
        pengirim_userid: user.userid,
        pengirim_name: user.name,
        pengirim_department_id: user.dinas,
        pengirim_department_name: user.nama_dinas,
      };

      const response = await apiRequest("/direct-shipping/", "POST", payload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseDesc || "Gagal mengirim dokumen");
      }
      
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      showErrorModal(
        "Pengiriman Gagal", 
        error.message || "Terjadi kesalahan saat mengirim dokumen. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Success Modal Close
  const handleSuccessButtonClick = async () => {
    setIsSuccessModalOpen(false);
    
    // Reset all form fields
    setFormState({
      judul: '',
      dinas: 0,
      lampiran: '',
    });
    
    resetSelection();
    
    if (tempFilePath) {
      await handleRemoveFile();
    } else {
      resetFileState();
    }
    
    setResetKey(prev => prev + 1);
  };

  return (
    <>
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-2xl bg-white px-8 pb-6 pt-8 shadow-lg dark:bg-gray-dark dark:shadow-card">
          {/* Header */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <h4 className="text-2xl font-bold text-dark dark:text-white">
              Pengiriman Dokumen Langsung
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Kirim dokumen secara langsung ke dinas lain
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

          {/* Empty Data Alert */}
          {isDinasEmpty && (
            <Alert
              type="warning"
              title="Data Dinas Belum Tersedia"
              message="Hubungi administrator untuk menambahkan data dinas terlebih dahulu."
              onRetry={refetchDinas}
            />
          )}

          {/* Form */}
          <div className="rounded-xl border border-gray-200 bg-white-50 dark:border-dark-3 dark:bg-dark-2 p-6">
            <form onSubmit={handleSubmitForm}>
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Always col-span-6 on large screens */}
                <div className="col-span-12 lg:col-span-6 space-y-5">
                  {/* Kepada Dinas */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[18px] font-semibold text-dark dark:text-white">
                        Kepada Dinas <span className="text-red-500">*</span>
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
                      onChange={(value) => updateFormField('dinas', Number(value))}
                      resetKey={resetKey}
                      disabled={loadingDinas || isDinasEmpty}
                    />
                  </div>

                  {/* Judul */}
                  <Input
                    label="Judul"
                    required
                    type="text"
                    value={formState.judul}
                    onChange={(e) => updateFormField('judul', e.target.value)}
                    placeholder="Masukkan judul pengiriman..."
                    disabled={!formState.dinas}
                  />

                  {/* Conditional Section - Only show when basic info is complete */}
                  {isBasicInfoComplete && (
                    <>
                      {/* Selected Documents */}
                      <SelectedDocumentsDisplay
                        selectedDocuments={selectedDocuments}
                        onRemove={handleRemoveDocument}
                        getDisplayName={getDocumentDisplayName}
                      />

                      {/* Lampiran */}
                      <Textarea
                        label="Lampiran"
                        rows={6}
                        value={formState.lampiran}
                        onChange={(e) => updateFormField('lampiran', e.target.value)}
                        placeholder="Isi keterangan tambahan jika diperlukan..."
                        helpText="Opsional - Tambahkan keterangan jika diperlukan"
                      />

                      {/* File Upload */}
                      <FileUploadSection
                        file={file}
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                        isUploadComplete={isUploadComplete}
                        onFileChange={handleFileChange}
                        onRemoveFile={handleRemoveFile}
                      />
                    </>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={loading}
                    disabled={isSubmitDisabled}
                  >
                    {loading 
                      ? "Mengirim..." 
                      : !formState.dinas 
                      ? "Pilih Kepada Dinas" 
                      : !formState.judul.trim()
                      ? "Isi Judul"
                      : "Kirim Dokumen"}
                  </Button>
                </div>

                {/* Right Column - Document List - Animated Entry */}
                {isBasicInfoComplete && (
                  <div className="col-span-12 lg:col-span-6 animate-slideInRight">
                    <DocumentList
                      documents={documents}
                      selectedDocuments={selectedDocuments}
                      loading={docsLoading}
                      searchTerm={searchTerm}
                      showAll={showAll}
                      onSearchChange={setSearchTerm}
                      onCheckboxChange={handleCheckboxChange}
                      onShowAllToggle={() => setShowAll(true)}
                      getDisplayName={getDocumentDisplayName}
                    />
                  </div>
                )}

                {/* Right Column - Placeholder when form incomplete */}
                {!isBasicInfoComplete && (
                  <div className="hidden lg:flex col-span-6 items-center justify-center">
                    <div className="text-center p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-3/50">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 mb-4">
                        <svg
                          className="w-8 h-8 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Pilih Dokumen
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                        Lengkapi <span className="font-semibold">Kepada Dinas</span> dan <span className="font-semibold">Judul</span> terlebih dahulu untuk memilih dokumen
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Berhasil!"
        message="Dokumen berhasil dikirim."
        buttonText="Kembali ke Form"
        onButtonClick={handleSuccessButtonClick}
      />
      
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorTitle}
        message={errorMessage}
      />
      
      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
};

export default FormPengirimanLangsung;