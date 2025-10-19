// src/components/pergeseran/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";
import { motion, AnimatePresence } from "framer-motion";

import ElementCombobox from "@/components/elements/ElementCombobox";
import { Textarea } from "@/components/elements/ElementInput";
import { Alert, LoadingAlert } from "@/components/alerts/Alert";
import { ExcelTableDisplay } from "@/components/pergeseran/ExcelTableDisplay";
import { PergeseranActionButtons } from "@/components/pergeseran/PergeseranActionButtons";

import { usePerihalData, useSubperihalData } from "@/hooks/useMasterDataPergeseran";
import { useFormValidationPergeseran } from "@/hooks/useFormValidationPergeseran";
import { useExcelUpload } from "@/hooks/useExcelUpload";

import type { PergeseranFormState } from "@/types/formPergeseran";
import type { UserCookie } from "@/types/userCookie";

const PergeseranForm = () => {
  // Form State
  const [formState, setFormState] = useState<PergeseranFormState>({
    kategoriUtamaId: null,
    kategoriUtama: "",
    subKategoriId: null,
    subKategori: "",
    selectedDeskripsiDetail: "",
    deskripsi: "",
  });

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState(0);

  // Custom Hooks for Master Data
  const {
    data: optionPerihal,
    loading: loadingPerihal,
    error: errorPerihal,
    isEmpty: isPerihalEmpty,
    refetch: refetchPerihal,
  } = usePerihalData();

  const {
    data: optionSubperihal,
    loading: loadingSubperihal,
    error: errorSubperihal,
    isEmpty: isSubperihalEmpty,
    refetch: refetchSubperihal,
  } = useSubperihalData(formState.kategoriUtamaId);

  // Form Validation Hook
  const {
    isMasterDataComplete,
    isFormPerihalUsable,
    formStatus,
  } = useFormValidationPergeseran({
    kategoriUtamaId: formState.kategoriUtamaId,
    subKategoriId: formState.subKategoriId,
    loadingPerihal,
    loadingSubperihal,
    isPerihalEmpty,
    isSubperihalEmpty,
    subperihalOptions: optionSubperihal,
  });

  // Excel Upload Hook
  const {
    tableData,
    headers,
    selectedFile,
    isLoadingFile,
    handleFileUpload,
    resetExcelState,
  } = useExcelUpload(isMasterDataComplete);

  // Update form field helper
  const updateFormField = <K extends keyof PergeseranFormState>(
    field: K,
    value: PergeseranFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Reset subkategori when kategori changes
  useEffect(() => {
    updateFormField('subKategoriId', null);
    updateFormField('subKategori', "");
    updateFormField('selectedDeskripsiDetail', "");
  }, [formState.kategoriUtamaId]);

  // Handle Download Template
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const response = await downloadFileRequest("/files/template-pergeseran");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Template pergeseran tidak ditemukan di server');
        }
        throw new Error(`Error ${response.status}: Gagal mengunduh template`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('File template pergeseran kosong');
      }
      
      const blobUrl = window.URL.createObjectURL(blob);
      let downloadFileName = 'Template_Pergeseran';
      
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch) {
          downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      if (!downloadFileName.includes('.')) {
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadFileName = `${downloadFileName}_${timestamp}.zip`;
      }
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Terjadi kesalahan saat mengunduh template';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Handle Cetak
  const handleCetak = () => {
    let tableHTML = "";
    if (tableData.length > 0) {
      tableHTML = '<table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">';
      tableHTML += '<thead><tr style="background-color: #f2f2f2;">';
      headers.forEach((header) => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += "</tr></thead>";
      tableHTML += "<tbody>";
      tableData.forEach((row, rowIndex) => {
        tableHTML += `<tr style="${rowIndex % 2 === 0 ? "" : "background-color: #f9f9f9;"}">`;
        headers.forEach((_, cellIndex) => {
          tableHTML += `<td>${row[cellIndex] || ""}</td>`;
        });
        tableHTML += "</tr>";
      });
      tableHTML += "</tbody></table>";
    }

    const perihalLengkap = formState.subKategori || "........";

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dokumen Pergeseran</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.5; margin: 20px; }
          .header-box { border: 2px solid black; text-align: center; padding: 10px; margin-bottom: 20px; }
          .header-title { font-size: 18px; font-weight: bold; margin: 5px 0; }
          .content-box { border: 2px solid black; padding: 20px; margin-bottom: 20px; }
          .letter-header { display: flex; justify-content: space-between; }
          .letter-left { width: 50%; }
          .letter-right { width: 50%; text-align: right; }
          .letter-body { margin-top: 20px; text-align: justify; }
          .signature { margin-top: 40px; text-align: right; }
          .page-break { page-break-after: always; }
          .attachment-page { page-break-before: always; }
          .attachment-title { font-weight: bold; margin-bottom: 15px; font-size: 16px; text-decoration: underline; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            body { margin: 10mm; }
            .no-print { display: none; }
            @page { size: A4 portrait; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-title">PEMERINTAH KABUPATEN REMBANG</div>
          <div class="header-title">KOP PERANGKAT DAERAH</div>
        </div>
        <div class="content-box">
          <div class="letter-header">
            <div class="letter-left">
              <div>Nomor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ........</div>
              <div>Lampiran : ........</div>
              <div>Perihal&nbsp;&nbsp;&nbsp;&nbsp;: ${perihalLengkap}</div>
            </div>
            <div class="letter-right">
              <div>Rembang,</div>
              <div>Kepada :</div>
              <div>Yth. Sekretaris Daerah selaku</div>
              <div>Ketua TAPD</div>
              <div>di-</div>
              <div>Rembang</div>
            </div>
          </div>
          <div class="letter-body">
            <p>Dengan memperhatikan ketentuan Pergeseran Anggaran sebagaimana tercantum Peraturan Bupati Nomor......Tahun 2022 tentang Pergeseran Anggaran, kami mengajukan pergeseran anggaran antar objek dalam jenis belanja yang sama dengan alasan sebagai berikut :</p>
            <p>${formState.deskripsi || "........"}</p>
            <p>Berkaitan dengan hal tersebut diatas, kami mohon kiranya Bapak Sekretaris Daerah dapat meyetujui usulan pergeseran anggaran yang kami ajukan, agar dapat ditampung dalam Peraturan Bupati tentang Penjabaran Perubahan APBD sebagai dasar penerbitan Dokumen Pelaksanaan Perubahan Anggaran Satuan Kerja Perangkat Derah (DPPA-SKPD), dengan daftar rincian usulan pergeseran anggaran sebagaimana terlampir.</p>
          </div>
          <div class="signature">
            <div>Kepala SKPD,</div>
            <div style="margin-top: 60px;"><u>Nama Lengkap</u></div>
            <div>Pangkat</div>
            <div>NIP</div>
          </div>
        </div>
        <div class="page-break"></div>
        <div class="attachment-page">
          <div class="attachment-title">LAMPIRAN</div>
          ${tableHTML}
        </div>
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print();" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cetak Dokumen
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert("Harap izinkan popup untuk mencetak dokumen.");
    }
  };

  // Handle Simpan
  const handleSimpan = async () => {
    if (!isMasterDataComplete) {
      alert("Data master belum lengkap.");
      return;
    }

    if (!formState.kategoriUtamaId || !formState.kategoriUtama.trim()) {
      alert("Perihal harus dipilih");
      return;
    }

    if (!formState.deskripsi.trim()) {
      alert("Deskripsi alasan pergeseran harus diisi");
      return;
    }

    if (!selectedFile) {
      alert("File Excel harus diupload");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const user: UserCookie = JSON.parse(Cookies.get("user") || "{}");

      const formData = new FormData();
      formData.append("perihal", formState.kategoriUtamaId.toString());
      
      if (formState.subKategoriId !== null) {
        formData.append("subperihal", formState.subKategoriId.toString());
      }
      
      formData.append("deskripsi", formState.deskripsi);
      formData.append("file", selectedFile);
      formData.append("pembuat_userid", user.userid);
      formData.append("pembuat_nama", user.name);
      formData.append("pembuat_id_dinas", user.dinas.toString());
      formData.append("pembuat_dinas", user.nama_dinas);

      const response = await apiRequest("/pergeseran/dokumen", "POST", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseDesc || "Gagal menyimpan data pergeseran");
      }

      setSuccess(true);

      // Reset form
      setFormState({
        kategoriUtamaId: null,
        kategoriUtama: "",
        subKategoriId: null,
        subKategori: "",
        selectedDeskripsiDetail: "",
        deskripsi: "",
      });
      
      resetExcelState();
      setResetKey(prev => prev + 1);

      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Terjadi kesalahan saat menyimpan data";
      alert(`Penyimpanan Gagal: ${errorMessage}`);
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const isCetakDisabled = !isMasterDataComplete || tableData.length === 0 || isLoadingFile;
  const isSimpanDisabled = loading || isLoadingFile || !isMasterDataComplete || !formState.deskripsi.trim() || !selectedFile;

  return (
    <div className="col-span-12 xl:col-span-12">
      <motion.div 
        className="rounded-2xl bg-white px-8 pb-6 pt-8 shadow-lg dark:bg-gray-dark dark:shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header with 3D Effect */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <motion.h4 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Form Pergeseran
          </motion.h4>
          <motion.p 
            className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Lengkapi formulir di bawah ini untuk mengajukan pergeseran anggaran
          </motion.p>
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert type="error" message={error} />
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert 
                type="success" 
                message="Data pergeseran berhasil dikirim!" 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Status */}
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
        {isPerihalEmpty && (
          <Alert
            type="warning"
            title="Data Perihal Belum Tersedia"
            message="Hubungi administrator untuk menambahkan data perihal terlebih dahulu."
            onRetry={refetchPerihal}
          />
        )}

        {formState.kategoriUtamaId !== null && isSubperihalEmpty && (
          <Alert
            type="warning"
            title="Data Sub Perihal Belum Tersedia"
            message="Hubungi administrator untuk menambahkan data sub perihal terlebih dahulu."
            onRetry={refetchSubperihal}
          />
        )}

        {/* Form Content */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white-50 to-white dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 p-6">
          <div className="flex flex-col space-y-5">
            {/* Perihal Utama */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-dark dark:text-white">
                  Perihal Utama <span className="text-red-500">*</span>
                </label>
                {loadingPerihal && (
                  <span className="text-xs text-blue-500 animate-pulse">Memuat data...</span>
                )}
              </div>
              <ElementCombobox
                label=""
                placeholder={
                  loadingPerihal
                    ? "Memuat data perihal..."
                    : isPerihalEmpty
                    ? "Data perihal belum tersedia"
                    : "Pilih Perihal"
                }
                options={optionPerihal.map((t) => ({ name: t.nama_perihal, id: t.perihal }))}
                onChange={(value) => {
                  const selectedId = Number(value);
                  updateFormField('kategoriUtamaId', selectedId);
                  const selectedData = optionPerihal.find(item => item.perihal === selectedId);
                  if (selectedData) {
                    updateFormField('kategoriUtama', selectedData.nama_perihal);
                  }
                }}
                resetKey={resetKey}
                disabled={loadingPerihal || isPerihalEmpty}
              />
            </motion.div>

            {/* Sub Perihal */}
            {formState.kategoriUtamaId !== null && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-dark dark:text-white">
                    Sub Perihal
                    {!loadingSubperihal && !isSubperihalEmpty && optionSubperihal.length > 0 && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {loadingSubperihal && (
                    <span className="text-xs text-blue-500 animate-pulse">Memuat data...</span>
                  )}
                </div>
                <ElementCombobox
                  label=""
                  placeholder={
                    loadingSubperihal
                      ? "Memuat data subperihal..."
                      : isSubperihalEmpty || optionSubperihal.length === 0
                        ? "Tidak ada subperihal tersedia"
                        : "Pilih Sub Perihal"
                  }
                  options={optionSubperihal.map((t) => ({ name: t.nama_subperihal, id: t.subperihal }))}
                  onChange={(value) => {
                    const selectedId = Number(value);
                    updateFormField('subKategoriId', selectedId);
                    const selectedData = optionSubperihal.find(item => item.subperihal === selectedId);
                    if (selectedData) {
                      updateFormField('subKategori', selectedData.nama_subperihal);
                      updateFormField('selectedDeskripsiDetail', selectedData.deskripsi);
                    }
                  }}
                  resetKey={resetKey}
                  disabled={loadingSubperihal || isSubperihalEmpty || optionSubperihal.length === 0}
                />
              </motion.div>
            )}

            {/* Detail Deskripsi */}
            {formState.selectedDeskripsiDetail && (
              <motion.div 
                className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 dark:border-blue-800 p-5 shadow-inner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <label className="mb-3 block text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Detail Spesifik - {formState.subKategori}
                </label>
                <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <div
                    className="formatted-description"
                    dangerouslySetInnerHTML={{
                      __html: formState.selectedDeskripsiDetail,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Deskripsi Textarea */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Textarea
                label="Deskripsi Alasan Pergeseran"
                required
                rows={6}
                value={formState.deskripsi}
                onChange={(e) => updateFormField('deskripsi', e.target.value)}
                placeholder={
                  !isMasterDataComplete 
                    ? "Lengkapi data master terlebih dahulu" 
                    : "Masukkan deskripsi alasan pergeseran anggaran..."
                }
                disabled={!isMasterDataComplete}
                helpText="Jelaskan dengan detail alasan pergeseran anggaran"
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <PergeseranActionButtons
                isDownloadingTemplate={isDownloadingTemplate}
                isLoadingFile={isLoadingFile}
                isMasterDataComplete={isMasterDataComplete}
                isCetakDisabled={isCetakDisabled}
                isSimpanDisabled={isSimpanDisabled}
                loading={loading}
                deskripsi={formState.deskripsi}
                selectedFile={selectedFile}
                onDownloadTemplate={handleDownloadTemplate}
                onFileUpload={handleFileUpload}
                onCetak={handleCetak}
                onSimpan={handleSimpan}
              />
            </motion.div>

            {/* Excel Table Display */}
            <motion.div 
              className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              <ExcelTableDisplay
                isLoadingFile={isLoadingFile}
                tableData={tableData}
                headers={headers}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Custom CSS untuk formatting HTML deskripsi */}
      <style jsx global>{`
        .formatted-description ul {
          list-style-type: disc;
          margin-left: 1.5em;
          margin-bottom: 0.5em;
        }

        .formatted-description li {
          margin-bottom: 0.25em;
          line-height: 1.4;
        }

        .formatted-description ol {
          list-style-type: decimal;
          margin-left: 1.5em;
          margin-bottom: 0.5em;
        }

        .formatted-description p {
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default PergeseranForm;