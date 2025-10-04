"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { Dinas } from "@/types/formPengirimanLangsung";
import ElementComboboxAutocomplete from "@/components/elements/ElementComboboxAutocomplate";
import { Input } from "@/components/elements/ElementInput";
import { Textarea } from "@/components/elements/ElementInput";
import { Button } from "@/components/elements/ElementButton";
import SuccessModal from "@/components/modals/successModal";
import ErrorModal from "@/components/modals/errorModal";
import DocumentList from "@/components/pengirimanLangsung/documentList";
import SelectedDocumentsDisplay from "@/components/pengirimanLangsung/selectedDocuments";
import FileUploadSection from "@/components/pengirimanLangsung/fileUploadSection";
import { useDocumentSelection } from "@/hooks/useDocumentSelection";
import { useFileUpload } from "@/hooks/useFileUpload";

const FormPengirimanLangsung = () => {
  // Form State
  const [judul, setJudul] = useState<string>("");
  const [dinas, setDinas] = useState<number>(0);
  const [lampiran, setLampiran] = useState<string>("");
  const [optionDinas, setOptionDinas] = useState<Dinas[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState(0);
  const [userDinas, setUserDinas] = useState<number>(0);

  // Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Get user dinas from cookie
  useEffect(() => {
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      if (user.dinas) {
        setUserDinas(user.dinas);
      }
    } catch (error) {
      console.error("Error parsing user cookie:", error);
    }
  }, []);

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
  } = useDocumentSelection(userDinas ? `/direct-shipping/${userDinas}` : "/direct-shipping/");

  const {
    file,
    uploadProgress,
    tempFilePath,
    isUploading,
    isUploadComplete,
    error: uploadError,
    success: uploadSuccess,
    handleFileChange,
    handleRemoveFile,
    resetFileState,
  } = useFileUpload("/direct-shipping/upload-file");

  // Fetch Dinas Options
  useEffect(() => {
    const fetchOptionDinas = async () => {
      try {
        const response = await apiRequest("/master_dinas/opt-dinas?level_id=DNS,ADM,PGW", "GET");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.responseData?.items) {
          const fetchDinas = result.responseData.items.map((item: any) => ({
            id: item.dinas,
            dinas: item.nama_dinas,
          }));
          setOptionDinas(fetchDinas);
        }
      } catch (err: any) {
        console.error("Gagal memuat data dinas:", err.message);
        showErrorModal("Kesalahan", "Gagal memuat daftar dinas. Silakan refresh halaman.");
      }
    };

    fetchOptionDinas();
  }, []);

  // Helper Functions
  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  const getDocumentDisplayName = (doc: any): string => {
    return `${doc.jenis} - ${doc.subjenis} - ${doc.tahun}`;
  };

  // Handle Form Submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dinas) {
      showErrorModal("Validasi Gagal", "Kepada Dinas harus dipilih");
      return;
    }
    
    if (!judul.trim()) {
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

      const foundNamaDinas = optionDinas.find((item) => item.id === dinas);
      
      if (!foundNamaDinas) {
        showErrorModal("Validasi Gagal", "Dinas yang dipilih tidak valid");
        return;
      }

      const documentIds = selectedDocuments.map(doc => doc.id);
      
      const payload = {
        kepada_id: dinas,
        kepada_dinas: foundNamaDinas.dinas,
        judul: judul.trim(),
        dokumen_ids: documentIds,
        lampiran: lampiran.trim() || "",
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
    setDinas(0);
    setJudul("");
    setLampiran("");
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
                      placeholder="Ketik minimal 3 huruf untuk mencari dinas..."
                      options={optionDinas.map((t) => ({ name: t.dinas, id: t.id }))}
                      onChange={(value) => setDinas(Number(value))}
                      resetKey={resetKey}
                    />
                  </div>

                  {/* Judul */}
                  <Input
                    label="Judul"
                    required
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
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
                    value={lampiran}
                    onChange={(e) => setLampiran(e.target.value)}
                    placeholder="Isi keterangan tambahan jika diperlukan..."
                    helpText="Opsional - Tambahkan keterangan jika diperlukan"
                  />

                  {/* File Upload */}
                  <FileUploadSection
                    file={file}
                    uploadProgress={uploadProgress}
                    isUploading={isUploading}
                    isUploadComplete={isUploadComplete}
                    error={uploadError}
                    success={uploadSuccess}
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
        message="Dokumen berhasil dikirim ke Dinas."
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