"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { apiRequest } from "@/helpers/apiClient";
import * as XLSX from "xlsx";
import Cookies from "js-cookie";

const MainPage = () => {
  // State untuk loading dan error
  const [loading, setLoading] = useState<boolean>(false); // State loading
  const [error, setError] = useState<string | null>(null); // Error state
  const [success, setSuccess] = useState<boolean>(false);

  // State untuk data
  const [optionPerihal, setOptionPerihal] = useState<any[]>([]);

  const [prihal, setPrihal] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // State untuk file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mengambil data option perihal dari API
  useEffect(() => {
    const fetchOptPerihal = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest("/pergeseran/opt-perihal", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Perihal data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const output = result.responseData.items.map((item: any) => ({
          id: item.perihal,
          perihal: item.nama_perihal,
        }));
        setOptionPerihal(output);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Dinas data not found" : err.message);
      } finally {
        setLoading(false);

      }
    };

    fetchOptPerihal();
  }, []);

  const handlePrihalSelect = (option: string) => {
    setPrihal(option);
    setIsDropdownOpen(false);
  };

  const handleDeskripsiChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDeskripsi(e.target.value);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simpan file untuk dikirim ke API
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length > 0) {
        const headers = data[0] as string[];
        setHeaders(headers);
        const rows = data.slice(1);
        setTableData(rows);
      }
    };
    reader.readAsBinaryString(file);
  };

   const handleSimpan = async () => {
    // console.log("Form submission started");
    // console.log("Prihal:", prihal);
    // console.log("Deskripsi:", deskripsi);
    // console.log("Selected File:", selectedFile);

    // Validasi form
    if (!prihal.trim()) {
      alert("Perihal harus dipilih");
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
    
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");

      // Cari perihal_id berdasarkan perihal yang dipilih
      const selectedPerihal = optionPerihal.find(item => item.perihal === prihal);
      const perihal_id = selectedPerihal ? selectedPerihal.id : null;

      if (!perihal_id) {
        throw new Error("Perihal ID tidak ditemukan");
      }

      // Buat FormData untuk upload file
      const formData = new FormData();
      formData.append('perihal', perihal_id.toString());
      formData.append('deskripsi', deskripsi);
      formData.append('file', selectedFile);
      formData.append('pembuat_userid', user.userid);
      formData.append('pembuat_nama', user.name);
      formData.append('pembuat_id_dinas', user.dinas);
      formData.append('pembuat_dinas', user.nama_dinas);
      
      // console.log("Starting API call with FormData");

      // Gunakan apiRequest yang sudah ada (sudah support FormData)
      const response = await apiRequest("/pergeseran/", "POST", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseDesc || "Gagal menyimpan data pergeseran");
      }

      const result = await response.json();
      // console.log("API response:", result);
      
      // Jika berhasil
      alert("Data pergeseran berhasil disimpan!");
      setSuccess(true);
      
      // Reset form setelah berhasil
      setPrihal("");
      setDeskripsi("");
      setTableData([]);
      setHeaders([]);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      // Handle error
      console.error("Error saving data:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data";
      alert(`Penyimpanan Gagal: ${errorMessage}`);
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Modifikasi pada fungsi handleCetak()
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
                        /* Mengubah warna header dan footer menjadi putih */
                        color: #ffffff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page landscape {
                        size: A4 landscape;
                        margin: 10mm;
                        /* Mengubah warna header dan footer menjadi putih */
                        color: #ffffff;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .attachment-page {
                        page: landscape;
                    }
                    /* Menambahkan script untuk menyembunyikan URL */
                    html {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Membuat semua teks di header dan footer cetak menjadi putih */
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
                        <div>Perihal&nbsp;&nbsp;&nbsp;&nbsp;: ........</div>
                        
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

    // <li>${prihal || '........'}</li>

    // Membuka jendela baru untuk cetak
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Menunggu konten dimuat sebelum menjalankan print
      printWindow.onload = function () {
        // Cetak otomatis (opsional - uncomment jika ingin langsung cetak)
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
          <div className="flex flex-col space-y-4">
            {/* Dropdown untuk Prihal */}
            <div className="relative">
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                // onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
              >
                <span
                  className={`truncate ${prihal ? "text-gray-900" : "text-gray-400"}`}
                >
                  {/* {prihal || "Perihal"} */}
                  {loading ? "Memuat perihal..." : prihal || "Pilih Perihal"}
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

              {/* Dropdown Options */}
              {isDropdownOpen && !loading && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {optionPerihal.length > 0 ? (
                    optionPerihal.map((option) => (
                      <div
                        // key={index}
                         key={option.id}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                        // onClick={() => handlePrihalSelect(option)}
                        onClick={() => handlePrihalSelect(option.perihal)}
                      >
                        {/* {option} */}
                        {option.perihal}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {error ? "Gagal memuat data perihal" : "Tidak ada data perihal"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Textarea untuk Deskripsi */}
            <textarea
              value={deskripsi}
              onChange={handleDeskripsiChange}
              placeholder="deskripsi alasan pergeseran"
              className="h-28 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Tombol untuk Upload dan Simpan */}
            <div className="flex space-x-4">
              <label className="flex cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
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
                upload excel
                <input
                  type="file"
                   id="file-upload"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleSimpan}
                disabled={loading}
                className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>

            {/* Tabel Kosong dengan Pesan */}
            <div className="mt-6 overflow-hidden rounded-lg border shadow-sm">
              <div className="overflow-x-auto">
                {tableData.length > 0 ? (
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
            {tableData.length > 0 && (
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
                  cetak
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
