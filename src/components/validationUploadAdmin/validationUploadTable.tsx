import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineXMark,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { ValidationUploadUraianAdmin, FileItem } from "@/types/validationUploadUraian";
import Pagination from "@/components/pagination/Pagination";

interface Props {
  dataDetail: ValidationUploadUraianAdmin[];
  onDataUpdate: (updatedData: ValidationUploadUraianAdmin[]) => void;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const ValidationUploadTable = ({ dataDetail, onDataUpdate }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const isAnyChecked = checkedItems.some((checked) => checked);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // State untuk modal review files
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // State untuk modal tolak
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [itemToReject, setItemToReject] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");

  const totalPages = Math.ceil(dataDetail.length / itemsPerPage);
  const currentItems = dataDetail.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCheckedItems(new Array(dataDetail.length).fill(false));
  }, [dataDetail]);
  

  useEffect(() => {
    const allCheckedInPage = currentItems.every((_, index) => checkedItems[(currentPage - 1) * itemsPerPage + index]);
    setIsAllChecked(allCheckedInPage);
  }, [currentPage, checkedItems, currentItems, itemsPerPage]);

  // Fungsi untuk memilih semua item
  const handleSelectAll = () => {
    const newChecked = checkedItems.map((_, idx) =>
      idx >= (currentPage - 1) * itemsPerPage && idx < currentPage * itemsPerPage ? !isAllChecked : checkedItems[idx]
    );

    setCheckedItems(newChecked);
    setIsAllChecked(!isAllChecked);
  };

  // Fungsi untuk memilih item individual
  const handleItemCheck = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    const newCheckedItems = [...checkedItems];
    newCheckedItems[globalIndex] = !newCheckedItems[globalIndex];
    setCheckedItems(newCheckedItems);
    setIsAllChecked(currentItems.every((_, idx) => newCheckedItems[(currentPage - 1) * itemsPerPage + idx]));
  };

  // Fungsi untuk membuka dan menutup modal validasi
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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

  // Fungsi untuk membuka modal tolak
  const handleOpenRejectModal = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setItemToReject(globalIndex);
    setRejectNote("");
    setShowRejectModal(true);
  };

  // Fungsi untuk menutup modal tolak
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setItemToReject(null);
    setRejectNote("");
  };

  // Fungsi untuk konfirmasi tolak dengan catatan
  const handleConfirmReject = async () => {
    if (itemToReject === null) return;

    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

    // Dapatkan ID item yang akan di-reject
    const itemId = dataDetail[itemToReject]?.id;
    if (!itemId) {
      console.error("ID item tidak ditemukan.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      id: itemId,
      checker: user.userid,
      checker_role: user.level_id,
      catatan: rejectNote || "", // Menambahkan catatan ke payload
    };

    console.log("Reject payload:", payload);

    try {
      const response = await apiRequest('/validation/document/reject', 'POST', payload);
      if (response.ok) {
        setSuccess(true);
        
        // Update data dengan menghapus item yang di-reject
        const updatedData = dataDetail.filter((_, idx) => idx !== itemToReject);
        onDataUpdate(updatedData);
        
        // Reset checkbox states setelah update data
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);
        
        console.log(`Item dengan index ${itemToReject} telah di-reject dengan catatan: ${rejectNote}`);
      } else {
        const result = await response.json();
        setError(result.message || "Terjadi kesalahan saat menolak dokumen");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data penolakan");
    } finally {
      setLoading(false);
      // Reset modal state
      handleCloseRejectModal();
    }
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
        
        // console.log(`File ${fileName} berhasil didownload`);
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
        
        // console.log(`Semua file berhasil didownload sebagai ${fileName}`);
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

  const handleValidateItem = async (id: number) => {
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

    // console.log(user);

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      id,
      checker: user.userid,
      checker_role: user.level_id,
    };

    // console.log(payload);
    
    try {
      const response = await apiRequest('/validation/document', 'POST', payload);
      if (response.ok) {
        setSuccess(true);
        
        // Update data dengan menghapus item yang sudah divalidasi
        const updatedData = dataDetail.filter(item => item.id !== id);
        onDataUpdate(updatedData);
        
        // Reset checkbox states setelah update data
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);
        
      } else {
        const result = await response.json();
        setError(result.message || "Terjadi kesalahan saat validasi data");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data validasi");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAll = async () => {
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const selectedItems = dataDetail.filter((_, idx) => checkedItems[idx]);
    const payload = selectedItems.map((item) => ({
      id: item.id,
      checker: user.userid,
      checker_role: user.level_id,
    }));

    // console.log(payload);

    try {
      const response = await apiRequest('/validation/documents', 'POST', { items: payload });
      if (response.ok) {
        setSuccess(true);
        
        // Update data dengan menghapus semua item yang sudah divalidasi
        const selectedIds = selectedItems.map(item => item.id);
        const updatedData = dataDetail.filter(item => !selectedIds.includes(item.id));
        onDataUpdate(updatedData);
        
        // Reset checkbox states setelah update data
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);
        
      } else {
        const result = await response.json();
        setError(result.message || "Terjadi kesalahan saat validasi semua data");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data validasi semua");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // Fungsi untuk membuka modal hapus
  const handleDeleteClick = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setItemToDelete(globalIndex);
    setShowDeleteModal(true);
  };

  // Fungsi untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;

    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

    // Dapatkan ID item yang akan di-reject
    const itemId = dataDetail[itemToDelete]?.id;
    if (!itemId) {
      console.error("ID item tidak ditemukan.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      id: itemId,
      checker: user.userid,
      checker_role: user.level_id,
    };

    // console.log("Reject payload:", payload);

    try {
      const response = await apiRequest('/validation/document/reject', 'POST', payload);
      if (response.ok) {
        setSuccess(true);
        
        // Update data dengan menghapus item yang di-reject
        const updatedData = dataDetail.filter((_, idx) => idx !== itemToDelete);
        onDataUpdate(updatedData);
        
        // Reset checkbox states setelah update data
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);
        
        // console.log(`Item dengan index ${itemToDelete} telah di-reject`);
      } else {
        const result = await response.json();
        setError(result.message || "Terjadi kesalahan saat menolak dokumen");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data penolakan");
    } finally {
      setLoading(false);
      // Reset modal state
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // Fungsi untuk membatalkan hapus
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  return (
    <div>
      {/* Tombol Validasi Semua */}
      {isAnyChecked && dataDetail.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-2 text-white hover:from-[#0C479F] hover:to-[#0C479F]"
            onClick={handleOpenModal}
            disabled={loading}
          >
            {loading ? "Memvalidasi..." : "Validasi Semua"}
          </button>
        </div>
      )}

      {/* Error and Success Message */}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Validasi berhasil!</p>}

      <div className="mt-4 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2 ">
                <th className="px-4 py-4 xl:pl-7.5">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white ">
                  Uraian
                </th>
                <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal Upload
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {dataDetail.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 font-medium py-6 dark:text-gray-400">
                    Data belum tersedia
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={index}>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pl-7.5 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          checkedItems[
                            (currentPage - 1) * itemsPerPage + index
                          ] || false
                        }
                        onChange={() => handleItemCheck(index)}
                      />
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                    >
                      {/* {item.id} */}
                      <p className="text-dark dark:text-white">{item.uraian}</p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                    >
                      <p className="text-dark dark:text-white">
                        {formatDate(new Date(item.tanggal))}
                      </p>
                    </td>
                    <td
                      className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                    >
                      <div className="flex items-center justify-end">
                        {/* Button Validasi */}
                        <div className="pl-1 capitalize text-dark dark:text-white">
                          <button 
                            onClick={() => handleValidateItem(item.id)}
                            className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                          >
                            <span className="text-[20px]">
                              <HiOutlineClipboardDocumentCheck />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Validasi
                            </span>
                          </button>
                        </div>

                        {/* Button Tolak */}
                        <div className="pl-4 capitalize text-dark dark:text-white">
                          <button 
                            className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-orange-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-orange-600 hover:pr-6"
                            onClick={() => handleOpenRejectModal(index)}
                          >
                            <span className="text-[20px]">
                              <HiOutlineXCircle />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Tolak
                            </span>
                          </button>
                        </div>

                        {/* Button Hapus */}
                        <div className="pl-4 capitalize text-dark dark:text-white">
                          <button 
                            className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-red-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:pr-6"
                            onClick={() => handleDeleteClick(index)}
                          >
                            <span className="text-[20px]">
                              <HiOutlineTrash />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Hapus
                            </span>
                          </button>
                        </div>

                        {/* Button Review Document */}
                        <div className="pl-4 capitalize text-dark dark:text-white">
                          <button
                            onClick={() => handleOpenReviewModal(item.files, item.uraian)}
                            className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] border border-black px-4 py-[10px] text-[16px] text-dark transition-all duration-300 ease-in-out hover:pr-6"
                          >
                            <span className="text-[20px]">
                              <HiOutlineDocumentMagnifyingGlass />
                            </span>
                            <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                              Reviews
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
          {dataDetail.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      </div>

      {/* Modal Tolak dengan Form Catatan */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4 rounded-lg bg-white p-6 shadow-lg">
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tolak Dokumen
              </h3>
              <button
                onClick={handleCloseRejectModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Anda akan menolak dokumen ini. Silakan berikan alasan penolakan:
              </p>
              
              <label htmlFor="rejectNote" className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Penolakan
              </label>
              <textarea
                id="rejectNote"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                placeholder="Masukkan alasan penolakan dokumen..."
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseRejectModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Menolak..." : "Kirim Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal Validasi */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[1000]"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {/* Tombol X untuk Close */}
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={handleCloseModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3
                        className="text-base font-semibold leading-6 text-gray-900"
                        id="modal-title"
                      >
                        {isAllChecked
                          ? "Validasi Semua"
                          : "Batal Validasi Semua"}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {isAllChecked
                            ? "Apakah Anda yakin ingin memvalidasi semua item yang dicentang?"
                            : "Apakah Anda yakin ingin membatalkan validasi semua item yang dicentang?"}
                        </p>
                      </div>

                      {/* Form untuk Catatan / Keterangan */}
                      <form className="mt-4">
                        <label
                          htmlFor="catatan"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Catatan / Keterangan (Opsional)
                        </label>
                        <textarea
                          id="catatan"
                          name="catatan"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Tambahkan catatan atau keterangan..."
                        ></textarea>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={handleValidateAll}
                  >
                    {isAllChecked ? "Validasi Semua" : "Batal Validasi Semua"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Konfirmasi Tolak Dokumen
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Apakah anda yakin ingin menolak dokumen ini?
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Menolak..." : "Ya, Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationUploadTable;