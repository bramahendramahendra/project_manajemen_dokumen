"use client";
import { useState, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { apiRequest } from "@/helpers/apiClient";
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
  const [selectedDeskripsiDetail, setSelectedDeskripsiDetail] =
    useState<string>("");

  // State untuk dropdown controls
  const [isKategoriOpen, setIsKategoriOpen] = useState<boolean>(false);
  const [isSubKategoriOpen, setIsSubKategoriOpen] = useState<boolean>(false);

  // State untuk data API
  const [kategoriUtamaOptions, setKategoriUtamaOptions] = useState<
    PerihalOption[]
  >([]);
  const [subKategoriOptions, setSubKategoriOptions] = useState<
    SubperihalOption[]
  >([]);

  // State untuk loading dan error
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loadingPerihal, setLoadingPerihal] = useState<boolean>(false);
  const [loadingSubperihal, setLoadingSubperihal] = useState<boolean>(false);
  const [errorPerihal, setErrorPerihal] = useState<string | null>(null);
  const [errorSubperihal, setErrorSubperihal] = useState<string | null>(null);

  // State lainnya tetap sama
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  // State untuk file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch data perihal saat komponen mount
  useEffect(() => {
    fetchPerihalOptions();
  }, []);

  // Fetch data perihal dari API
  const fetchPerihalOptions = async () => {
    setLoadingPerihal(true);
    setErrorPerihal(null);

    try {
      const response = await apiRequest("/master_perihal/opt", "GET");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.responseCode === 200) {
        setKategoriUtamaOptions(result.responseData.items);
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data perihal");
      }
    } catch (err: any) {
      setErrorPerihal(
        err.message === "Failed to fetch"
          ? "Gagal mengambil data perihal"
          : err.message,
      );
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

    try {
      const response = await apiRequest(
        `/master_subperihal/opt/${perihalId}`,
        "GET",
      );

      if (!response.ok) {
        if (response.status === 404) {
          setSubKategoriOptions([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.responseCode === 200) {
        setSubKategoriOptions(result.responseData.items);
      } else {
        throw new Error(
          result.responseDesc || "Gagal mengambil data subperihal",
        );
      }
    } catch (err: any) {
      setErrorSubperihal(
        err.message === "Failed to fetch"
          ? "Gagal mengambil data subperihal"
          : err.message,
      );
      console.error("Error fetching subperihal options:", err);
      setSubKategoriOptions([]);
    } finally {
      setLoadingSubperihal(false);
    }
  };

  // Handler untuk memilih kategori utama
  const handleKategoriSelect = (option: PerihalOption) => {
    setKategoriUtama(option.nama_perihal);
    setKategoriUtamaId(option.perihal);
    setSubKategori(""); // Reset sub kategori
    setSubKategoriId(null);
    setSelectedDeskripsiDetail("");
    setIsKategoriOpen(false);

    // Fetch subperihal options untuk kategori yang dipilih
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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simpan file untuk dikirim ke API
    setSelectedFile(file);

    // Mulai loading
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

        // Simulasi delay untuk efek loading yang lebih terlihat (opsional)
        setTimeout(() => {
          if (data.length > 0) {
            const headers = data[0] as string[];
            setHeaders(headers);
            const rows = data.slice(1);
            setTableData(rows);
          }
          setIsLoadingFile(false);
        }, 800); // Delay 800ms untuk demonstrasi loading
      } catch (error) {
        console.error("Error reading file:", error);
        setIsLoadingFile(false);
        alert(
          "Terjadi kesalahan saat membaca file. Pastikan file adalah format Excel yang valid.",
        );
      }
    };

    reader.onerror = () => {
      setIsLoadingFile(false);
      alert("Terjadi kesalahan saat membaca file.");
    };

    reader.readAsBinaryString(file);
  };

  const handleSimpan = async () => {
    // Validasi form
    if (!kategoriUtamaId || !kategoriUtama.trim()) {
      alert("Perihal harus dipilih");
      return;
    }

    if (!subKategoriId || !subKategori.trim()) {
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

    // Set loading
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const user = JSON.parse(Cookies.get("user") || "{}");

      // Buat FormData untuk upload file
      const formData = new FormData();
      formData.append("perihal", kategoriUtamaId.toString());
      formData.append("subperihal", subKategoriId.toString());
      formData.append("deskripsi", deskripsi);
      formData.append("file", selectedFile);
      formData.append("pembuat_userid", user.userid);
      formData.append("pembuat_nama", user.name);
      formData.append("pembuat_id_dinas", user.dinas);
      formData.append("pembuat_dinas", user.nama_dinas);

      console.log("Sending data:", {
        perihal: kategoriUtamaId,
        subperihal: subKategoriId,
        deskripsi: deskripsi,
        file: selectedFile.name,
        pembuat_userid: user.userid,
        pembuat_nama: user.name,
        pembuat_id_dinas: user.dinas,
        pembuat_dinas: user.nama_dinas,
      });

      // Gunakan apiRequest yang sudah ada (sudah support FormData)
      const response = await apiRequest("/pergeseran/", "POST", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.responseDesc || "Gagal menyimpan data pergeseran",
        );
      }

      const result = await response.json();
      console.log("API response:", result);

      // Jika berhasil
      // alert("Data pergeseran berhasil disimpan!");
      setSuccess(true);

      // Reset form setelah berhasil
      setKategoriUtama("");
      setKategoriUtamaId(null);
      setSubKategori("");
      setSubKategoriId(null);
      setSelectedDeskripsiDetail("");
      setDeskripsi("");
      setTableData([]);
      setHeaders([]);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      // Handle error
      console.error("Error saving data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data";
      alert(`Penyimpanan Gagal: ${errorMessage}`);
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };


  // template downloadnya disini
  const handleDownloadTemplate = () => {

  };

  const handleCetak = () => {
    // Membuat tabel HTML dari data
    let tableHTML = "";
    if (tableData.length > 0) {
      tableHTML =
        '<table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">';

      // Header tabel
      tableHTML += '<thead><tr style="background-color: #f2f2f2;">';
      headers.forEach((header) => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += "</tr></thead>";

      // Body tabel
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

    // Perihal lengkap untuk cetak
    const perihalLengkap = subKategori || "........";

    // Membuat seluruh dokumen HTML
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dokumen Pergeseran</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    margin: 20px;
                }
                .header-box {
                    border: 2px solid black;
                    text-align: center;
                    padding: 10px;
                    margin-bottom: 20px;
                }
                .header-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .content-box {
                    border: 2px solid black;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .letter-header {
                    display: flex;
                    justify-content: space-between;
                }
                .letter-left {
                    width: 50%;
                }
                .letter-right {
                    width: 50%;
                    text-align: right;
                }
                .letter-body {
                    margin-top: 20px;
                    text-align: justify;
                }
                .signature {
                    margin-top: 40px;
                    text-align: right;
                }
                .page-break {
                    page-break-after: always;
                }
                .attachment-page {
                    page-break-before: always;
                }
                .attachment-title {
                    font-weight: bold;
                    margin-bottom: 15px;
                    font-size: 16px;
                    text-decoration: underline;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                @media print {
                    body {
                        margin: 10mm;
                    }
                    .no-print {
                        display: none;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                        color: #ffffff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page landscape {
                        size: A4 landscape;
                        margin: 10mm;
                        color: #ffffff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .attachment-page {
                        page: landscape;
                    }
                    html {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @top-center, @top-right, @top-left,
                    @bottom-center, @bottom-right, @bottom-left {
                        color: #ffffff !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Kop Surat -->
            <div class="header-box">
                <div class="header-title">PEMERINTAH KABUPATEN REMBANG</div>
                <div class="header-title">KOP PERANGKAT DAERAH</div>
            </div>
            
            <!-- Isi Surat -->
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
            
            <!-- Mengakhiri halaman pertama -->
            <div class="page-break"></div>
            
            <!-- Lampiran Tabel pada halaman baru dengan orientasi landscape -->
            <div class="attachment-page">
                <div class="attachment-title">LAMPIRAN</div>
                ${tableHTML}
            </div>
            
            <!-- Tombol Cetak (hanya tampil di browser) -->
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

    // Membuka jendela baru untuk cetak
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = function () {
        // Cetak otomatis (opsional)
        // printWindow.print();
      };
    } else {
      alert("Harap izinkan popup untuk mencetak dokumen.");
    }
  };

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="mb-4 flex items-center justify-between px-7.5 pt-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
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
                Data pergeseran berhasil disimpan!
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            {/* Dropdown Level 1 - Kategori Utama */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Perihal Utama
              </label>
              <div
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm ${loadingPerihal ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() =>
                  !loadingPerihal && setIsKategoriOpen(!isKategoriOpen)
                }
              >
                <span
                  className={`truncate ${kategoriUtama ? "text-gray-900" : "text-gray-400"}`}
                >
                  {loadingPerihal
                    ? "Memuat data perihal..."
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
                    onClick={fetchPerihalOptions}
                    className="ml-2 text-blue-500 underline hover:text-blue-700"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {isKategoriOpen &&
                !loadingPerihal &&
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sub Perihal
                </label>
                <div
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm ${loadingSubperihal ? "cursor-not-allowed opacity-50" : ""}`}
                  onClick={() =>
                    !loadingSubperihal &&
                    subKategoriOptions.length > 0 &&
                    setIsSubKategoriOpen(!isSubKategoriOpen)
                  }
                >
                  <span
                    className={`truncate ${subKategori ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {loadingSubperihal
                      ? "Memuat data subperihal..."
                      : subKategoriOptions.length === 0
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
                      onClick={() =>
                        kategoriUtamaId &&
                        fetchSubperihalOptions(kategoriUtamaId)
                      }
                      className="ml-2 text-blue-500 underline hover:text-blue-700"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}

                {isSubKategoriOpen &&
                  !loadingSubperihal &&
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
              placeholder="Deskripsi alasan pergeseran"
              className="h-28 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Tombol untuk Upload dan Simpan */}
            <div className="flex items-center justify-between">
              {/* Tombol di sisi kiri */}
              <div className="flex space-x-4">
                <label
                  className={`flex cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 ${isLoadingFile ? "cursor-not-allowed opacity-50" : ""}`}
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
                      Upload Excel
                    </>
                  )}
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoadingFile}
                  />
                </label>
                <button
                  onClick={handleSimpan}
                  disabled={loading || isLoadingFile}
                  className={`group relative flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-3.5 py-3 font-medium text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:px-6 ${loading || isLoadingFile ? "cursor-not-allowed opacity-50" : ""}`}
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
                  <span className="ml-0 w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                    {loading ? "Menyimpan..." : "Simpan"}
                  </span>
                </button>
              </div>

              {/* Tombol di sisi kanan dengan efek hover yang sama */}
              <button
                onClick={handleDownloadTemplate}
                className="group relative flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0F6838] to-[#22C55E] px-3.5 py-3 font-medium text-white transition-all duration-300 ease-in-out hover:from-[#0F6838] hover:to-[#0F6838] hover:px-6 dark:bg-white/10 dark:text-white"
              >
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
                <span className="ml-0 w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                  Download Template
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
                      {/* Spinner Loading */}
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
                        Silakan upload file excel/lampiran terlebih dahulu
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tombol Cetak */}
            {tableData.length > 0 && subKategori && !isLoadingFile && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCetak}
                  className="flex items-center rounded-md bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
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
              </div>
            )}
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
