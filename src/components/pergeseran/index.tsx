"use client";
import { useState, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";
import { htmlToPlainText } from "@/utils/htmlTextFormatter";
import Cookies from "js-cookie";

interface PerihalOption {
  perihal: number;
  nama_perihal: string;
}

interface SubperihalOption {
  subperihal: number;
  nama_subperihal: string;
  deskripsi: string;
}

const MainPage = () => {
  // State untuk dropdown bertingkat
  const [kategoriUtama, setKategoriUtama] = useState<string>("");
  const [kategoriUtamaId, setKategoriUtamaId] = useState<number | null>(null);
  const [subKategori, setSubKategori] = useState<string>("");
  const [subKategoriId, setSubKategoriId] = useState<number | null>(null);
  const [selectedDeskripsiDetail, setSelectedDeskripsiDetail] = useState<string>("");

  // State untuk dropdown controls
  const [isKategoriOpen, setIsKategoriOpen] = useState<boolean>(false);
  const [isSubKategoriOpen, setIsSubKategoriOpen] = useState<boolean>(false);

  // State untuk data API
  const [kategoriUtamaOptions, setKategoriUtamaOptions] = useState<PerihalOption[]>([]);
  const [subKategoriOptions, setSubKategoriOptions] = useState<SubperihalOption[]>([]);

  // State untuk loading dan error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loadingPerihal, setLoadingPerihal] = useState<boolean>(false);
  const [loadingSubperihal, setLoadingSubperihal] = useState<boolean>(false);
  const [errorPerihal, setErrorPerihal] = useState<string | null>(null);
  const [errorSubperihal, setErrorSubperihal] = useState<string | null>(null);

  // State untuk tracking apakah data master kosong
  const [isPerihalEmpty, setIsPerihalEmpty] = useState<boolean>(false);
  const [isSubperihalEmpty, setIsSubperihalEmpty] = useState<boolean>(false);

  // State untuk file upload
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State untuk download template
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState<boolean>(false);

  // Helper functions untuk validasi
  const isFormPerihalUsable = () => {
    return !loadingPerihal && !isPerihalEmpty;
  };

  const isFormSubperihalUsable = () => {
    const perihalSelected = kategoriUtamaId !== null;
    const subperihalDataAvailable = !loadingSubperihal && !isSubperihalEmpty;
    return perihalSelected && subperihalDataAvailable;
  };

  const isSubperihalRequiredAndSelected = () => {
    if (kategoriUtamaId !== null && !loadingSubperihal && !isSubperihalEmpty && subKategoriOptions.length > 0) {
      return subKategoriId !== null;
    }
    return true;
  };

  const isMasterDataComplete = () => {
    return isFormPerihalUsable() && kategoriUtamaId !== null && isSubperihalRequiredAndSelected();
  };

  // Fetch data perihal saat komponen mount
  useEffect(() => {
    fetchPerihalOptions();
  }, []);

  // Fetch data perihal dari API
  const fetchPerihalOptions = async () => {
    setLoadingPerihal(true);
    setErrorPerihal(null);
    setIsPerihalEmpty(false);

    try {
      const response = await apiRequest("/master_perihal/opt", "GET");

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Perihal data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.responseCode === 200) {
        if (!result.responseData?.items || result.responseData.items.length === 0) {
          setIsPerihalEmpty(true);
          setKategoriUtamaOptions([]);
        } else {
          setKategoriUtamaOptions(result.responseData.items);
          setIsPerihalEmpty(false);
        }
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data perihal");
      }
    } catch (err: any) {
      setErrorPerihal(
        err.message === "Failed to fetch"
          ? "Gagal mengambil data perihal. Periksa koneksi internet."
          : err.message === "Perihal data not found"
          ? "Data perihal belum tersedia"
          : err.message,
      );
      setIsPerihalEmpty(true);
      console.error("Error fetching perihal options:", err);
    } finally {
      setLoadingPerihal(false);
    }
  };

  // Fetch data subperihal berdasarkan ID perihal
  const fetchSubperihalOptions = async (perihalId: number) => {
    setLoadingSubperihal(true);
    setErrorSubperihal(null);
    setSubKategoriOptions([]);
    setIsSubperihalEmpty(false);

    try {
      const response = await apiRequest(`/master_subperihal/opt/${perihalId}`, "GET");

      if (!response.ok) {
        if (response.status === 404) {
          setIsSubperihalEmpty(true);
          setSubKategoriOptions([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.responseCode === 200) {
        if (!result.responseData?.items || result.responseData.items.length === 0) {
          setIsSubperihalEmpty(true);
          setSubKategoriOptions([]);
        } else {
          setSubKategoriOptions(result.responseData.items);
          setIsSubperihalEmpty(false);
        }
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data subperihal");
      }
    } catch (err: any) {
      setErrorSubperihal(
        err.message === "Failed to fetch"
          ? "Gagal mengambil data subperihal. Periksa koneksi internet."
          : err.message,
      );
      setIsSubperihalEmpty(true);
      console.error("Error fetching subperihal options:", err);
      setSubKategoriOptions([]);
    } finally {
      setLoadingSubperihal(false);
    }
  };

  // Fungsi retry
  const retryFetchPerihal = () => {
    fetchPerihalOptions();
  };

  const retryFetchSubperihal = () => {
    if (kategoriUtamaId) {
      fetchSubperihalOptions(kategoriUtamaId);
    }
  };

  // Handler untuk memilih kategori utama
  const handleKategoriSelect = (option: PerihalOption) => {
    setKategoriUtama(option.nama_perihal);
    setKategoriUtamaId(option.perihal);
    setSubKategori("");
    setSubKategoriId(null);
    setSelectedDeskripsiDetail("");
    setIsKategoriOpen(false);
    fetchSubperihalOptions(option.perihal);
  };

  // Handler untuk memilih sub kategori
  const handleSubKategoriSelect = (option: SubperihalOption) => {
    setSubKategori(option.nama_subperihal);
    setSubKategoriId(option.subperihal);
    setSelectedDeskripsiDetail(option.deskripsi);
    setIsSubKategoriOpen(false);
  };

  const handleDeskripsiChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDeskripsi(e.target.value);
  };

  // Handle download template
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      console.log('Downloading template from API: /files/template-pergeseran');
      
      // Menggunakan downloadFileRequest helper untuk konsistensi
      const response = await downloadFileRequest("/files/template-pergeseran");
      
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Coba ambil detail error dari response
          try {
            const errorData = await response.json();
            console.error('Template not found details:', errorData);
            throw new Error('Template pergeseran tidak ditemukan di server');
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error('Template pergeseran tidak ditemukan di server');
          }
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            console.error('Bad request details:', errorData);
            throw new Error(errorData.ResponseDesc || 'Format permintaan tidak valid');
          } catch (parseError) {
            throw new Error('Format permintaan tidak valid');
          }
        } else {
          throw new Error(`Error ${response.status}: Gagal mengunduh template pergeseran`);
        }
      }

      // Membuat blob dari response
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File template pergeseran kosong atau tidak dapat dibaca');
      }
      
      console.log('Blob size:', blob.size, 'bytes');
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tentukan nama file untuk download
      let downloadFileName = 'Template_Pergeseran';
      let fileExtension = '.zip'; // default extension
      
      // Coba dapatkan nama file dari header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch) {
          const fullFileName = fileNameMatch[1].replace(/['"]/g, '');
          downloadFileName = fullFileName;
          console.log('Filename from header:', fullFileName);
        }
      }
      
      // Jika tidak ada nama file dari header, deteksi dari Content-Type
      if (!downloadFileName.includes('.')) {
        const contentType = response.headers.get('Content-Type');
        console.log('Content-Type:', contentType);
        
        // Deteksi format berdasarkan Content-Type
        if (contentType) {
          if (contentType.includes('application/zip') || contentType.includes('application/x-zip-compressed')) {
            fileExtension = '.zip';
          } else if (contentType.includes('application/x-rar-compressed') || contentType.includes('application/vnd.rar')) {
            fileExtension = '.rar';
          } else if (contentType.includes('application/x-7z-compressed')) {
            fileExtension = '.7z';
          } else if (contentType.includes('application/x-tar')) {
            fileExtension = '.tar';
          } else if (contentType.includes('application/gzip')) {
            fileExtension = '.gz';
          } else if (contentType.includes('application/x-bzip2')) {
            fileExtension = '.bz2';
          } else if (contentType.includes('application/x-xz')) {
            fileExtension = '.xz';
          }
        }
        
        // Tambahkan timestamp jika diperlukan
        const timestamp = new Date().toISOString().slice(0, 10);
        downloadFileName = `${downloadFileName}_${timestamp}${fileExtension}`;
      }
      
      console.log('Final download filename:', downloadFileName);
      
      // Membuat link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      link.style.display = 'none'; // Sembunyikan link
      
      // Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('Template pergeseran download completed successfully');
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error downloading template:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Terjadi kesalahan saat mengunduh template pergeseran';
      setError(errorMessage);
      
      // Auto clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
      
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isMasterDataComplete()) {
      setError("Lengkapi data master terlebih dahulu sebelum upload file.");
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setTableData([]);
    setHeaders([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        setTimeout(() => {
          if (data.length > 0) {
            const headers = data[0] as string[];
            setHeaders(headers);
            const rows = data.slice(1);
            setTableData(rows);
          }
          setIsLoadingFile(false);
        }, 800);
      } catch (error) {
        console.error("Error reading file:", error);
        setIsLoadingFile(false);
        alert("Terjadi kesalahan saat membaca file. Pastikan file adalah format Excel yang valid.");
      }
    };

    reader.onerror = () => {
      setIsLoadingFile(false);
      alert("Terjadi kesalahan saat membaca file.");
    };

    reader.readAsBinaryString(file);
  };

  const handleSimpan = async () => {
    if (!isMasterDataComplete()) {
      alert("Data master belum lengkap. Pastikan semua data yang diperlukan telah dipilih.");
      return;
    }

    if (!kategoriUtamaId || !kategoriUtama.trim()) {
      alert("Perihal harus dipilih");
      return;
    }

    if (!isSubperihalRequiredAndSelected()) {
      alert("Sub Perihal harus dipilih");
      return;
    }

    if (!deskripsi.trim()) {
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
      const user = JSON.parse(Cookies.get("user") || "{}");

      const formData = new FormData();
      formData.append("perihal", kategoriUtamaId.toString());
      
      if (subKategoriId !== null) {
        formData.append("subperihal", subKategoriId.toString());
      }
      
      formData.append("deskripsi", deskripsi);
      formData.append("file", selectedFile);
      formData.append("pembuat_userid", user.userid);
      formData.append("pembuat_nama", user.name);
      formData.append("pembuat_id_dinas", user.dinas);
      formData.append("pembuat_dinas", user.nama_dinas);

      const response = await apiRequest("/pergeseran/", "POST", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseDesc || "Gagal menyimpan data pergeseran");
      }

      const result = await response.json();
      console.log("API response:", result);

      setSuccess(true);

      // Reset form
      setKategoriUtama("");
      setKategoriUtamaId(null);
      setSubKategori("");
      setSubKategoriId(null);
      setSelectedDeskripsiDetail("");
      setDeskripsi("");
      setTableData([]);
      setHeaders([]);
      setSelectedFile(null);

      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error saving data:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data";
      alert(`Penyimpanan Gagal: ${errorMessage}`);
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

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

    const perihalLengkap = subKategori || "........";

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
                    .attachment-page { page: landscape; }
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
                    
                    <p>${deskripsi || "........"}</p>
                    
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

  const isCetakDisabled = () => {
    return !isMasterDataComplete() || tableData.length === 0 || isLoadingFile;
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
    if (loadingPerihal || loadingSubperihal) {
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

    if (isPerihalEmpty) {
      return null;
    }

    if (!isFormPerihalUsable()) {
      return (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[18px] font-medium text-orange-800 dark:text-orange-200">
              Data master sedang dimuat atau belum tersedia.
            </p>
          </div>
        </div>
      );
    }

    if (kategoriUtamaId === null) {
      return (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[18px] font-medium text-orange-800 dark:text-orange-200">
              Pilih Perihal terlebih dahulu untuk melanjutkan.
            </p>
          </div>
        </div>
      );
    }

    if (!isSubperihalRequiredAndSelected()) {
      return (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[18px] font-medium text-orange-800 dark:text-orange-200">
              Pilih Sub Perihal untuk melanjutkan.
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
    <div className="col-span-12 xl:col-span-12">
      <div className="overflow-hidden rounded-[10px] bg-white shadow-md dark:bg-gray-dark dark:shadow-card">
        <div className="mb-4 flex items-center justify-between px-7.5 pt-7.5">
          <h4 className="text-[24px] font-semibold text-black dark:text-white">
            Form Pergeseran
          </h4>
        </div>

        <div className="px-7.5 pb-7.5">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700">
                Data pergeseran berhasil dikirim!
              </p>
            </div>
          )}

          {/* Status pesan form */}
          <FormStatusMessage />
          
          {/* Pesan jika data master kosong */}
          {isPerihalEmpty && (
            <EmptyDataMessage type="Perihal" onRetry={retryFetchPerihal} />
          )}
          
          {kategoriUtamaId !== null && isSubperihalEmpty && (
            <EmptyDataMessage type="Sub Perihal" onRetry={retryFetchSubperihal} />
          )}

          <div className="flex flex-col space-y-4">
            {/* Dropdown Level 1 - Kategori Utama */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[20px] font-medium text-gray-700">
                  Perihal Utama <span className="text-red-500">*</span>
                </label>
                {loadingPerihal && (
                  <span className="text-xs text-blue-500">Memuat data...</span>
                )}
              </div>
              <div
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm ${
                  loadingPerihal || isPerihalEmpty ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() =>
                  !loadingPerihal && !isPerihalEmpty && setIsKategoriOpen(!isKategoriOpen)
                }
              >
                <span
                  className={`truncate text-[18px] ${kategoriUtama ? "text-gray-900" : "text-gray-400"}`}
                >
                  {loadingPerihal
                    ? "Memuat data perihal..."
                    : isPerihalEmpty
                    ? "Data perihal belum tersedia"
                    : kategoriUtama || "Pilih Perihal"}
                </span>
                <svg
                  className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Error message untuk perihal */}
              {errorPerihal && (
                <div className="mt-1 text-sm text-red-500">
                  {errorPerihal}
                  <button
                    onClick={retryFetchPerihal}
                    className="ml-2 text-blue-500 underline hover:text-blue-700"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {isKategoriOpen &&
                !loadingPerihal &&
                !isPerihalEmpty &&
                kategoriUtamaOptions.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {kategoriUtamaOptions.map((option, index) => (
                      <div
                        key={index}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                        onClick={() => handleKategoriSelect(option)}
                      >
                        {option.nama_perihal}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Dropdown Level 2 - Sub Kategori */}
            {kategoriUtamaId && (
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Perihal
                    {!loadingSubperihal && !isSubperihalEmpty && subKategoriOptions.length > 0 && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  {loadingSubperihal && (
                    <span className="text-xs text-blue-500">Memuat data...</span>
                  )}
                </div>
                <div
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm ${
                    loadingSubperihal || (isSubperihalEmpty && subKategoriOptions.length === 0) 
                      ? "cursor-not-allowed opacity-50" 
                      : ""
                  }`}
                  onClick={() =>
                    !loadingSubperihal &&
                    !isSubperihalEmpty &&
                    subKategoriOptions.length > 0 &&
                    setIsSubKategoriOpen(!isSubKategoriOpen)
                  }
                >
                  <span
                    className={`truncate ${subKategori ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {loadingSubperihal
                      ? "Memuat data subperihal..."
                      : isSubperihalEmpty || subKategoriOptions.length === 0
                        ? "Tidak ada subperihal tersedia"
                        : subKategori || "Pilih Sub Perihal"}
                  </span>
                  <svg
                    className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Error message untuk subperihal */}
                {errorSubperihal && (
                  <div className="mt-1 text-sm text-red-500">
                    {errorSubperihal}
                    <button
                      onClick={retryFetchSubperihal}
                      className="ml-2 text-blue-500 underline hover:text-blue-700"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}

                {isSubKategoriOpen &&
                  !loadingSubperihal &&
                  !isSubperihalEmpty &&
                  subKategoriOptions.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {subKategoriOptions.map((option, index) => (
                        <div
                          key={index}
                          className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                          onClick={() => handleSubKategoriSelect(option)}
                        >
                          {option.nama_subperihal}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* Detail Spesifik dengan deskripsi dari API */}
            {selectedDeskripsiDetail && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Detail Spesifik - {subKategori}
                </label>
                <div className="text-sm leading-relaxed text-gray-700">
                  <div
                    className="formatted-description"
                    dangerouslySetInnerHTML={{
                      __html: selectedDeskripsiDetail,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Textarea untuk Deskripsi */}
            <textarea
              value={deskripsi}
              onChange={handleDeskripsiChange}
              placeholder={
                !isMasterDataComplete() 
                  ? "Lengkapi data master terlebih dahulu" 
                  : "Deskripsi alasan pergeseran"
              }
              className={`h-28 text-[18px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isMasterDataComplete()
                  ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
              disabled={!isMasterDataComplete()}
            />

            {/* Tombol untuk Upload, Simpan, Download Template, dan Cetak */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className={`group flex items-center justify-center gap-2 rounded-[7px] bg-gradient-to-r from-[#0F6838] to-[#22C55E] px-3.5 py-3 font-medium text-white hover:from-[#0F6838] hover:to-[#0F6838] dark:bg-white/10 dark:text-white ${
                  isDownloadingTemplate ? "cursor-not-allowed opacity-50" : ""
                }`}
                title={isDownloadingTemplate ? "Sedang mendownload..." : "Download template Excel untuk pergeseran"}
              >
                {isDownloadingTemplate ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="group-hover:opacity-100">
                      Download Template
                    </span>
                  </>
                )}
              </button>
              
              <label
                className={`flex cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white px-3.5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 ${
                  isLoadingFile || !isMasterDataComplete() ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {isLoadingFile ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {!isMasterDataComplete() ? "Lengkapi Master Data" : "Upload Excel"}
                  </>
                )}
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoadingFile || !isMasterDataComplete()}
                />
              </label>

              {/* Tombol Cetak */}
              <button
                onClick={handleCetak}
                disabled={isCetakDisabled()}
                className={`flex items-center rounded-md px-3.5 py-3 font-medium shadow-sm transition-colors ${
                  isCetakDisabled()
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                title={
                  !isMasterDataComplete() 
                    ? "Lengkapi data master terlebih dahulu"
                    : tableData.length === 0
                    ? "Upload file Excel terlebih dahulu"
                    : "Cetak dokumen"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Cetak
              </button>
              
              <button
                onClick={handleSimpan}
                disabled={loading || isLoadingFile || !isMasterDataComplete() || !deskripsi.trim() || !selectedFile}
                className={`group flex items-center justify-center gap-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-3.5 py-3 font-medium text-white hover:from-[#0C479F] hover:to-[#0C479F] ${
                  loading || isLoadingFile || !isMasterDataComplete() || !deskripsi.trim() || !selectedFile 
                    ? "cursor-not-allowed opacity-50" 
                    : ""
                }`}
                title={
                  !isMasterDataComplete()
                    ? "Lengkapi data master terlebih dahulu"
                    : !deskripsi.trim()
                    ? "Isi deskripsi terlebih dahulu"
                    : !selectedFile
                    ? "Upload file terlebih dahulu"
                    : "Kirim data pergeseran"
                }
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  )}
                </div>
                <span className="group-hover:opacity-100">
                  {loading ? "Mengirim..." : "Kirim"}
                </span>
              </button>
            </div>

            {/* Tabel Data */}
            <div className="mt-6 overflow-hidden rounded-lg border shadow-sm">
              <div className="overflow-x-auto">
                {isLoadingFile ? (
                  // Loading State
                  <div className="flex flex-col items-center justify-center bg-white px-6 py-16">
                    <div className="mb-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      Memproses File Excel...
                    </h3>
                    <p className="max-w-sm text-center text-sm text-gray-500">
                      Sedang membaca dan memvalidasi data dari file yang Anda
                      upload. Mohon tunggu sebentar.
                    </p>
                  </div>
                ) : tableData.length > 0 ? (
                  // Data Table
                  <table className="min-w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-blue-600">
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-left font-medium text-white"
                            style={{
                              minWidth:
                                index === 0
                                  ? "60px"
                                  : index === 1
                                    ? "100px"
                                    : "200px",
                            }}
                          >
                            {header || `Title ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {tableData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={
                            rowIndex % 2 === 0 ? "bg-white" : "bg-blue-50"
                          }
                        >
                          {headers.map((_, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 text-sm text-gray-900"
                            >
                              {row[cellIndex] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Empty State
                  <div className="flex items-center justify-center bg-gray-50 px-6 py-16">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Belum ada data
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {!isMasterDataComplete() 
                          ? "Lengkapi data master terlebih dahulu, kemudian upload file Excel"
                          : "Silakan upload file excel/lampiran terlebih dahulu"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default MainPage;