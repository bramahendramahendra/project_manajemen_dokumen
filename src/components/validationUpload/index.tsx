"use client";
import { useState, useEffect } from "react";
import { ValidationUpload, FileItem } from "@/types/validationUpload";
import Pagination from "../pagination/Pagination";
import { HiOutlineArrowTopRightOnSquare, HiOutlineDocumentMagnifyingGlass, HiOutlineXMark, HiOutlineArrowDownTray } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";

// Tambahkan properti status pada tipe ValidationUpload
// interface EnhancedValidationUpload extends ValidationUpload {
//   status: 'Proses' | 'Tolak' | 'Diterima';
// }

// const validationUpload: EnhancedValidationUpload[] = [
//   { skpd: "Dinas Pendidikan", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 1, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Proses" },
//   { skpd: "Dinas Kesehatan", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 3, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Diterima" },
//   { skpd: "Dinas Pertanian", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 5, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Tolak" },
//   { skpd: "Dinas Kelautan", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 0, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Diterima" },
//   { skpd: "Dinas Kesejahteraan", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 1, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Proses" },
//   { skpd: "Dinas Politik", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 4, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Tolak" },
//   { skpd: "Dinas Pertahanan", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 1, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Proses" },
//   { skpd: "Dinas Keuangan", uraian: "Bantuan pangan untuk warga terdampak bencana", belumValidasi: 5, tanggal: new Date("2024-08-21T10:00:00Z"), status: "Diterima" },
// ];

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case '001':
      return 'bg-yellow-100 text-yellow-800'; // Warna kuning untuk Proses
    case '002':
      return 'bg-red-100 text-red-800'; // Warna merah untuk Tolak
    case '003':
      return 'bg-green-100 text-green-800'; // Warna hijau untuk Diterima
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const MainPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<ValidationUpload[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State untuk modal review files
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const totalPages = Math.ceil(dataList.length / itemsPerPage);
  const currentItems = dataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // const user = Cookies.get("user");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(Cookies.get("user") || "{}");
        
        const response = await apiRequest(`/document_managements/all-data/dinas/${user.department_id}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Document data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // console.log(result);
        
        // setDataDetail(result.responseData);
        const res: ValidationUpload[] = result.responseData.items.map((item: any) => ({
          id: item.id,
          uraian: item.subjenis,
          tanggal: new Date(item.maker_date),
          status_code: item.status_code,
          status_doc: item.status_doc,
          total_files: item.total_files || 0,
          files: item.files || []
        }));
    
        setDataList(res);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  

  const formatSkpdForUrl = (document_name: string) =>
    document_name.toLowerCase().replace(/\s+/g, "-");

  const handleDetailsClick = (document: number, document_name: string) => {
    const formattedUrl = formatSkpdForUrl(document_name);
    router.push(`/validation_upload/${formattedUrl}`);
  };

  // Fungsi untuk membuka modal review
  const handleOpenReviewModal = (files: FileItem[], uraian: string) => {
    setSelectedFiles(files);
    setSelectedUraian(uraian);
    setShowReviewModal(true);
  };

  // Fungsi untuk menutup modal review
    const handleCloseReviewModal = () => {
      setShowReviewModal(false);
      setSelectedFiles([]);
      setSelectedUraian("");
    };
  
    // Fungsi untuk download file
    const handleDownloadFile = async (file: FileItem) => {
      setDownloadingFile(file.id);
      try {
        const response = await downloadFileRequest(`/files/download/${file.file_name}`);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Ekstrak nama file dari path
          const fileName = file.file_name.split('/').pop() || `file_${file.id}`;
          link.download = fileName;
          
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log(`File ${fileName} berhasil didownload`);
        } else {
          console.error('Download gagal:', response.status);
          setError('Gagal mendownload file');
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        setError('Terjadi kesalahan saat mendownload file');
      } finally {
        setDownloadingFile(null);
      }
    };
  
    // Fungsi untuk download semua file sebagai ZIP
    const handleDownloadAllFiles = async () => {
      if (!selectedFiles || selectedFiles.length <= 1) return;
      
      setDownloadingAll(true);
      try {
        // Buat request body dengan list filepath
        const requestBody = {
          files: selectedFiles.map(file => file.file_name),
          zip_name: selectedUraian.replace(/[^a-zA-Z0-9]/g, '_') || 'document_files'
        };
  
        const response = await apiRequest('/files/download/multiple', 'POST', requestBody);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Nama file ZIP berdasarkan uraian
          const fileName = `${selectedUraian.replace(/[^a-zA-Z0-9]/g, '_')}_all_files.zip`;
          link.download = fileName;
          
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          console.log(`Semua file berhasil didownload sebagai ${fileName}`);
        } else {
          console.error('Download semua file gagal:', response.status);
          setError('Gagal mendownload semua file');
        }
      } catch (error) {
        console.error('Error downloading all files:', error);
        setError('Terjadi kesalahan saat mendownload semua file');
      } finally {
        setDownloadingAll(false);
      }
    };
  

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Monitoring validasi dokumen
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="px-2 py-4 text-left font-medium text-dark dark:bg-gray-dark xl:pl-7.5">
                  No
                </th>
                <th className="px-4 py-4 pb-3.5 font-medium text-dark text-center">
                  Uraian
                </th>
                <th className="px-4 py-4 pb-3.5 font-medium text-dark text-center">
                  Tanggal Upload
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-dark dark:text-white">
                  Total Files
                </th>
                <th className="px-4 py-4 pb-3.5 font-medium text-dark text-center">
                  Status
                </th>
                <th className="px-4 py-4 pb-3.5 text-right font-medium text-dark xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {dataList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                    Data belum tersedia
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={index}
                    className={`hover:bg-gray-2 ${
                      index === currentItems.length - 1
                        ? ""
                        : "border-b border-stroke dark:border-dark-3"
                    }`}
                  >
                    <td className="border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5">
                      <div className="flex items-center gap-3.5">
                        <p className="font-medium text-dark dark:text-white">
                          {index+1}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-4 dark:bg-gray-dark 2xsm:w-7 sm:w-60 md:w-90 xl:pl-7.5">
                      <div className="flex items-center gap-3.5">
                        <p className="font-medium text-dark dark:text-white">
                          {item.uraian}
                        </p>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center">
                        <div className="pl-1 capitalize text-dark dark:text-white">
                          {/* {brand.tanggal} */}
                          {formatDate(new Date(item.tanggal))}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                    >
                      <p className="text-dark dark:text-white">
                        {item.total_files} file(s)
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status_code)}`}>
                          {item.status_doc}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-4 xl:pr-7.5">
                      <div className="flex items-center justify-end">
                        {/* <div className="pl-1 capitalize text-dark dark:text-white">
                          <button className="group active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11">
                            <div
                              className="flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                              onClick={() => handleDetailsClick(item.id, item.uraian)}
                            >
                              <span className="text-[20px]">
                                <HiOutlineArrowTopRightOnSquare />
                              </span>
                              <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                                Detail
                              </span>
                            </div>
                          </button>
                        </div> */}

                        <div className="pl-4 capitalize text-dark dark:text-white">
                          <button
                            onClick={() => handleOpenReviewModal(item.files, item.uraian)}
                            className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] border border-black px-4 py-[10px] text-[16px] text-dark transition-all duration-300 ease-in-out hover:pr-6"
                          >
                            <span className="text-[20px]">
                              <HiOutlineDocumentMagnifyingGlass />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Review
                            </span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Modal Review Files */}
      {showReviewModal && (
        <div
          className="fixed inset-0 z-[1000]"
          aria-labelledby="review-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Header Modal */}
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                        <HiOutlineDocumentMagnifyingGlass className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3
                          className="text-lg font-semibold leading-6 text-gray-900"
                          id="review-modal-title"
                        >
                          Review Dokumen
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedUraian}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={handleCloseReviewModal}
                    >
                      <HiOutlineXMark className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Daftar Files */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Daftar File ({selectedFiles.length} file)
                      </h4>
                      {/* Button Download Semua - Tampil jika lebih dari 1 file */}
                      {selectedFiles.length > 1 && (
                        <button
                          onClick={handleDownloadAllFiles}
                          disabled={downloadingAll}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingAll ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Download Semua...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <HiOutlineArrowDownTray className="h-4 w-4 mr-2" />
                              Download Semua ({selectedFiles.length} file)
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {selectedFiles.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Tidak ada file tersedia
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.file_name.split('/').pop() || `File ${idx + 1}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  ID: {file.id} | Document ID: {file.id_document}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                disabled={downloadingFile === file.id}
                                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {downloadingFile === file.id ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Download...
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <HiOutlineArrowDownTray className="h-4 w-4 mr-1" />
                                    Download
                                  </span>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                    onClick={handleCloseReviewModal}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;