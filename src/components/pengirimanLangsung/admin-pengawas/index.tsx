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
import DocumentList from "@/components/pengirimanLangsung/documentList";
import SelectedDocumentsDisplay from "../selectedDocuments";
import FileUploadSection from "@/components/pengirimanLangsung/fileUploadSection";

import { useDinasAllDataPengirimanLangsung } from "@/hooks/useMasterData";
import { useDocumentSelection } from "@/hooks/useDocumentSelection";
import { usePengirimanLangsungFileUpload } from "@/hooks/useFileUpload";

import type { 
  PengirimanLangsungFormState
} from "@/types/formPengirimanLangsung";

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

  // Custom Hooks
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

  const {
    data: optionDinas,
    loading: loadingDinas,
    error: errorDinas,
    isEmpty: isDinasEmpty,
    refetch: refetchDinas,
  } = useDinasAllDataPengirimanLangsung();

  
  // Update form field helper
  const pengirimanLangsungFormField = <K extends keyof PengirimanLangsungFormState>(
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
      const user = JSON.parse(Cookies.get("user") || "{}");

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
              Kirim dokumen secara langsung
            </p>
          </div>

          {/* Form */}
          <div className="rounded-xl border border-gray-200 bg-white-50 dark:border-dark-3 dark:bg-dark-2 p-6">
            <form onSubmit={handleSubmitForm}>
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-6 space-y-5">
                  {/* Kepada Dinas */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
                      Kepada Dinas <span className="text-red-500">*</span>
                    </label>
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
                      onChange={(value) => pengirimanLangsungFormField('dinas', Number(value))}
                      resetKey={resetKey}
                    />
                  </div>

                  {/* Judul */}
                  <Input
                    label="Judul"
                    required
                    type="text"
                    value={formState.judul}
                    onChange={(e) => pengirimanLangsungFormField('judul', e.target.value)}
                    placeholder="Masukkan judul pengiriman..."
                  />

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
                    onChange={(e) => pengirimanLangsungFormField('lampiran', e.target.value)}
                    placeholder="Isi keterangan tambahan jika diperlukan..."
                    helpText="Opsional - Tambahkan keterangan jika diperlukan"
                  />

                  {/* File Upload - Props error dan success dihapus */}
                  <FileUploadSection
                    file={file}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                    isUploadComplete={isUploadComplete}
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
                    disabled={loading || isUploading}
                  >
                    {loading ? "Mengirim..." : "Kirim Dokumen"}
                  </Button>
                </div>

                {/* Right Column - Document List */}
                <div className="col-span-12 lg:col-span-6">
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
        message="Dokumen berhasil dikirim ke Admin."
        buttonText="Kembali ke Form"
        onButtonClick={handleSuccessButtonClick}
      />
      
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorTitle}
        message={errorMessage}
      />
    </>
  );
};

export default FormPengirimanLangsung;