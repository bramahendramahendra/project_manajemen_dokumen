"use client";
import { useState, ChangeEvent } from "react";
import * as XLSX from 'xlsx';

const MainPage = () => {
    const [prihal, setPrihal] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [deskripsi, setDeskripsi] = useState<string>("");
    const [tableData, setTableData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    const prihalOptions = [
        "pergeseran anggaran atas uraian dari sub rincian obyek belanja",
        "pergeseran anggaran antar rincian obyek belanja dalam obyek belanja yang sama dan/atau pergeseran anggaran antar sub rincian obyek belanja dalam obyek belanja yang sama",
        "usulan pergeseran anggaran antar obyek belanja dalam jenis belanja yang sama"
    ];

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

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
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

    const handleSimpan = () => {
        // Implementasi penyimpanan data
        console.log("Data disimpan:", { prihal, deskripsi, tableData });
        alert("Data berhasil disimpan!");
    };

    const handleCetak = () => {
        // Membuat tabel HTML dari data
        let tableHTML = '';
        if (tableData.length > 0) {
            tableHTML = '<table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">';
            
            // Header tabel
            tableHTML += '<thead><tr style="background-color: #f2f2f2;">';
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead>';
            
            // Body tabel
            tableHTML += '<tbody>';
            tableData.forEach((row, rowIndex) => {
                tableHTML += `<tr style="${rowIndex % 2 === 0 ? '' : 'background-color: #f9f9f9;'}">`; 
                headers.forEach((_, cellIndex) => {
                    tableHTML += `<td>${row[cellIndex] || ''}</td>`;
                });
                tableHTML += '</tr>';
            });
            tableHTML += '</tbody></table>';
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
                            size: A4;
                            margin: 10mm;
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
                            <div>Lampiran : </div>
                            <div>Perihal&nbsp;&nbsp;&nbsp;&nbsp;: ${prihal || 'Usulan Pergeseran Antar Objek Dalam Jenis Yang Sama Pada APBD Tahun Anggaran ...'}</div>
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
                        <ol>
                            <li>${deskripsi || '........'}</li>
                            <li>........; dan</li>
                            <li>........</li>
                        </ol>
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
                
                <!-- Lampiran Tabel pada halaman baru -->
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
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Menunggu konten dimuat sebelum menjalankan print
            printWindow.onload = function() {
                // Cetak otomatis (opsional - uncomment jika ingin langsung cetak)
                // printWindow.print();
            };
        } else {
            alert('Harap izinkan popup untuk mencetak dokumen.');
        }
    };

    return (
        <div className="col-span-12 xl:col-span-12">
            <div className="rounded-[10px] bg-white overflow-hidden shadow-1 dark:bg-gray-dark dark:shadow-card">
                <div className="flex justify-between items-center px-7.5 pt-7.5 mb-4">
                    <h4 className="text-xl font-semibold text-black dark:text-white">
                        Form Pergeseran
                    </h4>
                </div>
                
                <div className="px-7.5 pb-7.5">
                    <div className="flex flex-col space-y-4">
                        {/* Dropdown untuk Prihal */}
                        <div className="relative">
                            <div 
                                className="w-full py-3 px-4 border border-gray-200 rounded-lg bg-white shadow-sm flex justify-between items-center cursor-pointer"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className={`truncate ${prihal ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {prihal || "prihal"}
                                </span>
                                <svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>

                            {/* Dropdown Options */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                                    {prihalOptions.map((option, index) => (
                                        <div 
                                            key={index}
                                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                                            onClick={() => handlePrihalSelect(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Textarea untuk Deskripsi */}
                        <textarea
                            value={deskripsi}
                            onChange={handleDeskripsiChange}
                            placeholder="deskripsi alasan pergeseran"
                            className="w-full py-3 px-4 border border-gray-200 rounded-lg h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />

                        {/* Tombol untuk Upload dan Simpan */}
                        <div className="flex space-x-4">
                            <label className="flex items-center justify-center bg-white text-gray-700 py-2 px-6 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                upload excel
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls" 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                />
                            </label>
                            <button 
                                onClick={handleSimpan}
                                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
                            >
                                simpan
                            </button>
                        </div>

                        {/* Tabel Kosong dengan Pesan */}
                        <div className="mt-6 border rounded-lg overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                {tableData.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                        <thead className="bg-blue-600">
                                            <tr>
                                                {headers.map((header, index) => (
                                                    <th 
                                                        key={index} 
                                                        className="px-6 py-3 text-left text-white font-medium"
                                                        style={{ minWidth: index === 0 ? '60px' : index === 1 ? '100px' : '200px' }}
                                                    >
                                                        {header || `Title ${index + 1}`}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tableData.map((row, rowIndex) => (
                                                <tr 
                                                    key={rowIndex} 
                                                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                                                >
                                                    {headers.map((_, cellIndex) => (
                                                        <td 
                                                            key={cellIndex} 
                                                            className="px-6 py-4 text-sm text-gray-900"
                                                        >
                                                            {row[cellIndex] || ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex justify-center items-center py-16 px-6 bg-gray-50">
                                        <div className="text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data</h3>
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
                            <div className="flex justify-end mt-4">
                                <button 
                                    onClick={handleCetak}
                                    className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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