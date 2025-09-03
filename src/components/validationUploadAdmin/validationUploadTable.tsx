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
  HiOutlineDocumentText
} from "react-icons/hi2";
import { ValidationUploadUraianAdmin, FileItem, ValidationUploadUraianAdminResponse } from "@/types/validationUploadUraian";
import Pagination from "@/components/pagination/Pagination";
import SuccessModalLink from '../modals/successModalLink';

interface Props {
  id: number | null;
}

type BulkAction = 'validate' | 'reject' | 'delete';

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const ValidationUploadTable = ({ id }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<ValidationUploadUraianAdmin[]>([]);

  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const isAnyChecked = checkedItems.some((checked) => checked);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal states untuk individual actions
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [itemToValidate, setItemToValidate] = useState<number | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [itemToReject, setItemToReject] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");

  // Modal states untuk bulk actions
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction>('validate');
  const [bulkNote, setBulkNote] = useState<string>("");

  // State untuk modal review files
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("");
  const [downloadingFile, setDownloadingFile] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    sort_by: 'id',
    sort_dir: 'DESC'
  });

  const fetchData = async (page = 1, perPage = 5, filterParams = {}) => {
    if (!id) {
      setError("ID tidak ditemukan");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      const response = await apiRequest(`/validation/detail/${id}?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Validation Document data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result : ValidationUploadUraianAdminResponse = await response.json();

      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      const res: ValidationUploadUraianAdmin[] = result.responseData.items.map((item: any) => ({
        id: item.id,
        jenis: item.jenis,
        uraian: item.subjenis,
        tanggal: new Date(item.maker_date),
        total_files: item.total_files || 0,
        files: item.files || []
      }));
  
      setDataDetail(res);
      setTotalRecords(res.length);
      setTotalPages(Math.ceil(res.length / perPage));
    } catch (err: any) {
      setError(
        err.message === "Failed to fetch" 
          ? "Tidak dapat terhubung ke server"
          : err.message === "Document data not found"
          ? "Data tidak ditemukan"
          : err.message
      );
      setDataDetail([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(currentPage, itemsPerPage, filters);
    }
  }, [id, currentPage, itemsPerPage, filters]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage, filters);
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dataDetail.slice(startIndex, endIndex);
  };

  const currentItems = getCurrentPageData();

  useEffect(() => {
    setCheckedItems(new Array(dataDetail.length).fill(false));
  }, [dataDetail]);

  useEffect(() => {
    const allCheckedInPage = currentItems.every((_, index) => checkedItems[(currentPage - 1) * itemsPerPage + index]);
    setIsAllChecked(allCheckedInPage);
  }, [currentPage, checkedItems, currentItems, itemsPerPage]);

  const handleSelectAll = () => {
    const newChecked = checkedItems.map((_, idx) =>
      idx >= (currentPage - 1) * itemsPerPage && idx < currentPage * itemsPerPage ? !isAllChecked : checkedItems[idx]
    );

    setCheckedItems(newChecked);
    setIsAllChecked(!isAllChecked);
  };

  const handleItemCheck = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    const newCheckedItems = [...checkedItems];
    newCheckedItems[globalIndex] = !newCheckedItems[globalIndex];
    setCheckedItems(newCheckedItems);
    setIsAllChecked(currentItems.every((_, idx) => newCheckedItems[(currentPage - 1) * itemsPerPage + idx]));
  };

  // Individual modal handlers
  const handleOpenValidateModal = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setItemToValidate(globalIndex);
    setShowValidateModal(true);
  };

  const handleCloseValidateModal = () => {
    setShowValidateModal(false);
    setItemToValidate(null);
  };

  const handleOpenRejectModal = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setItemToReject(globalIndex);
    setRejectNote("");
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setItemToReject(null);
    setRejectNote("");
  };

  const handleDeleteClick = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setItemToDelete(globalIndex);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Bulk action modal handlers
  const handleOpenBulkModal = (action: BulkAction) => {
    setBulkAction(action);
    setBulkNote("");
    setShowBulkModal(true);
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
    setBulkAction('validate');
    setBulkNote("");
  };

  // Review modal handlers
  const handleOpenReviewModal = (files: FileItem[], uraian: string) => {
    setSelectedFiles(files);
    setSelectedUraian(uraian);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedFiles([]);
    setSelectedUraian("");
  };

  // API call functions
  const handleConfirmValidate = async () => {
    if (itemToValidate === null) return;

    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

    const itemId = dataDetail[itemToValidate]?.id;
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
    
    try {
      const response = await apiRequest('/validation/document', 'POST', payload);
      if (response.ok) {
        setSuccess(true);
        
        const updatedData = dataDetail.filter((_, idx) => idx !== itemToValidate);
        setDataDetail(updatedData);
        
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
      handleCloseValidateModal();
    }
  };

  const handleConfirmReject = async () => {
    if (itemToReject === null) return;

    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

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
      catatan: rejectNote || "",
    };

    try {
      const response = await apiRequest('/validation/document/reject', 'POST', payload);
      if (response.ok) {
        setSuccess(true);
        
        const updatedData = dataDetail.filter((_, idx) => idx !== itemToReject);
        setDataDetail(updatedData);
        
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);
        
      } else {
        const result = await response.json();
        setError(result.message || "Terjadi kesalahan saat menolak dokumen");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data penolakan");
    } finally {
      setLoading(false);
      handleCloseRejectModal();
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete === null) return;

    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

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

    try {
      const response = await apiRequest('/validation/document/delete', 'POST', payload);
      if (response.ok) {
        setSuccess(true);
        
        const updatedData = dataDetail.filter((_, idx) => idx !== itemToDelete);
        setDataDetail(updatedData);
        
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);

        // Tampilkan SuccessModalLink untuk validasi single
        setValidationType('single');
        setIsSuccessModalOpen(true);
        
      } else {
        const result = await response.json();
        setError(result.message || "Terjadi kesalahan saat menghapus dokumen");
      }
    } catch (error) {
      setError("Terjadi kesalahan saat mengirim data penghapusan");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleBulkAction = async () => {
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.userid || !user.role) {
      console.error("User tidak ditemukan di cookie.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const selectedItems = dataDetail.filter((_, idx) => checkedItems[idx]);
    
    try {
      let response;
      
      if (bulkAction === 'validate') {
        // Bulk validation endpoint
        const payload = selectedItems.map((item) => ({
          id: item.id,
          checker: user.userid,
          checker_role: user.level_id,
        }));
        response = await apiRequest('/validation/documents', 'POST', { items: payload });
      } else if (bulkAction === 'reject') {
        // Bulk reject endpoint
        const payload = selectedItems.map((item) => ({
          id: item.id,
          checker: user.userid,
          checker_role: user.level_id,
          catatan: bulkNote || "",
        }));
        response = await apiRequest('/validation/documents/reject', 'POST', { items: payload });
      } else if (bulkAction === 'delete') {
        // Bulk delete endpoint
        const payload = selectedItems.map((item) => ({
          id: item.id,
          checker: user.userid,
          checker_role: user.level_id,
        }));
        response = await apiRequest('/validation/documents/delete', 'POST', { items: payload });
      }

      if (response && response.ok) {
        setSuccess(true);
        
        const selectedIds = selectedItems.map(item => item.id);
        const updatedData = dataDetail.filter(item => !selectedIds.includes(item.id));
        setDataDetail(updatedData);
        
        setCheckedItems(new Array(updatedData.length).fill(false));
        setIsAllChecked(false);

        // Tampilkan SuccessModalLink untuk validasi multiple
        setValidationType('multiple');
        setIsSuccessModalOpen(true);
        
      } else {
        const result = response ? await response.json() : {};
        setError(result.message || `Terjadi kesalahan saat ${bulkAction === 'validate' ? 'validasi' : bulkAction === 'reject' ? 'menolak' : 'menghapus'} data`);
      }
    } catch (error) {
      setError(`Terjadi kesalahan saat mengirim data ${bulkAction === 'validate' ? 'validasi' : bulkAction === 'reject' ? 'penolakan' : 'penghapusan'}`);
    } finally {
      setLoading(false);
      handleCloseBulkModal();
    }
  };

  // File download functions
  const handleDownloadFile = async (file: FileItem) => {
    setDownloadingFile(file.id);
    try {
      const response = await downloadFileRequest(`/files/download/${file.file_name}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const fileName = file.file_name.split('/').pop() || `file_${file.id}`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
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

  const handleDownloadAllFiles = async () => {
    if (!selectedFiles || selectedFiles.length <= 1) return;
    
    setDownloadingAll(true);
    try {
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
        
        const fileName = `${selectedUraian.replace(/[^a-zA-Z0-9]/g, '_')}_all_files.zip`;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
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

  // Render functions
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4 xl:pl-7.5">
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex space-x-2">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
      </tr>
    ))
  );

  const renderEmptyState = () => (
    <tr>
      <td colSpan={4} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Data belum tersedia
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Belum ada dokumen yang perlu divalidasi
          </p>
        </div>
      </td>
    </tr>
  );

  const renderErrorState = () => (
    <tr>
      <td colSpan={4} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </td>
    </tr>
  );

  const getBulkActionText = (action: BulkAction) => {
    switch (action) {
      case 'validate': return 'Validasi';
      case 'reject': return 'Tolak';
      case 'delete': return 'Hapus';
      default: return '';
    }
  };

  return (
    <div className="col-span-12 xl:col-span-12">
      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">Operasi berhasil dilakukan</p>
        </div>
      )}

      {/* Bulk Action Buttons */}
      {isAnyChecked && dataDetail.length > 0 && (
        <div className="mt-4 flex justify-end space-x-3">
          <button
            className="rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-2 text-white hover:from-[#0C479F] hover:to-[#0C479F]"
            onClick={() => handleOpenBulkModal('validate')}
            disabled={loading}
          >
            {loading ? "Memvalidasi..." : "Validasi Terpilih"}
          </button>
          <button
            className="rounded-[7px] bg-gradient-to-r from-[#EA580C] to-[#F97316] px-4 py-2 text-white hover:from-[#EA580C] hover:to-[#EA580C]"
            onClick={() => handleOpenBulkModal('reject')}
            disabled={loading}
          >
            {loading ? "Menolak..." : "Tolak Terpilih"}
          </button>
          <button
            className="rounded-[7px] bg-gradient-to-r from-[#DC2626] to-[#EF4444] px-4 py-2 text-white hover:from-[#DC2626] hover:to-[#DC2626]"
            onClick={() => handleOpenBulkModal('delete')}
            disabled={loading}
          >
            {loading ? "Menghapus..." : "Hapus Terpilih"}
          </button>
        </div>
      )}

      <div className="mt-4 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            Validasi Dokumen
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!loading && totalRecords > 0 && (
              <>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data</>
            )}
            {!loading && totalRecords === 0 && "Tidak ada data"}
          </div>
        </div> 
       
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800 ">
                <th className="px-2 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleSelectAll}
                    disabled={loading || dataDetail.length === 0}
                  />
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Uraian
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Tanggal Upload
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && renderLoadingSkeleton()}
              {!loading && error && renderErrorState()}
              {!loading && !error && dataDetail.length === 0 && renderEmptyState()}
              {!loading && !error && dataDetail.length > 0 && currentItems.map((item, index) => (
                <tr key={item.id}
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 xl:pl-7.5">
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
                  <td className="px-4 py-4 xl:pl-7.5">
                     <div className="flex items-center">
                       <div className="mr-3">
                          <HiOutlineDocumentText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-dark dark:text-white">{item.uraian}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Jenis: {item.jenis}</p>
                        </div>
                      </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {formatDate(new Date(item.tanggal))}
                    </p>
                  </td>
                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end">

                      {/* Button Validasi */}
                      <div className="pl-1 capitalize ">
                        <button 
                          onClick={() => handleOpenValidateModal(index)}
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                          title={`Validasi ${item.uraian}`}
                          disabled={loading}
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
                      <div className="pl-4 capitalize ">
                        <button 
                          onClick={() => handleOpenRejectModal(index)}
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#EA580C] to-[#F97316] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#EA580C] hover:to-[#EA580C] hover:pr-6"
                          title={`Tolak ${item.uraian}`}
                          disabled={loading}
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
                      <div className="pl-4 capitalize ">
                        <button 
                          onClick={() => handleDeleteClick(index)}
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#DC2626] to-[#EF4444] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#DC2626] hover:to-[#DC2626] hover:pr-6"
                          title={`Hapus ${item.uraian}`}
                          disabled={loading}
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
                      <div className="pl-4 capitalize ">
                        <button
                          onClick={() => handleOpenReviewModal(item.files, item.uraian)}
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#059669] to-[#10B981] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#059669] hover:to-[#059669] hover:pr-6"
                          title={`Review ${item.uraian}`}
                          disabled={loading}
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
              ))}
            </tbody>
          </table>
          {!loading && !error && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>

      {/* Modal Validasi Individual */}
      {showValidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Validasi
              </h3>
              <button
                onClick={handleCloseValidateModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Apakah Anda yakin ingin memvalidasi dokumen ini?
              </p>
              {itemToValidate !== null && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{dataDetail[itemToValidate]?.uraian}</p>
                  <p className="text-xs text-gray-500">Jenis: {dataDetail[itemToValidate]?.jenis}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseValidateModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmValidate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Memvalidasi..." : "Ya, Validasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak Individual */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4 rounded-lg bg-white p-6 shadow-lg">
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

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Anda akan menolak dokumen ini. Silakan berikan alasan penolakan:
              </p>
              
              {itemToReject !== null && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium text-gray-900">{dataDetail[itemToReject]?.uraian}</p>
                  <p className="text-xs text-gray-500">Jenis: {dataDetail[itemToReject]?.jenis}</p>
                </div>
              )}
              
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

      {/* Modal Hapus Individual */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Konfirmasi Hapus
              </h3>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              {itemToDelete !== null && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="font-medium text-gray-900">{dataDetail[itemToDelete]?.uraian}</p>
                  <p className="text-xs text-gray-500">Jenis: {dataDetail[itemToDelete]?.jenis}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bulk Actions */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-lg mx-4 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {getBulkActionText(bulkAction)} Dokumen Terpilih
              </h3>
              <button
                onClick={handleCloseBulkModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Apakah Anda yakin ingin {getBulkActionText(bulkAction).toLowerCase()} {checkedItems.filter(Boolean).length} dokumen terpilih?
              </p>
              
              {/* Show selected items preview */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4 max-h-32 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">Dokumen yang akan di{getBulkActionText(bulkAction).toLowerCase()}:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {dataDetail.filter((_, idx) => checkedItems[idx]).map((item) => (
                    <li key={item.id} className="truncate">• {item.uraian}</li>
                  ))}
                </ul>
              </div>

              {/* Note field for reject action */}
              {bulkAction === 'reject' && (
                <div>
                  <label htmlFor="bulkNote" className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Penolakan
                  </label>
                  <textarea
                    id="bulkNote"
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="Masukkan alasan penolakan untuk semua dokumen..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseBulkModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleBulkAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  bulkAction === 'validate' 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                    : bulkAction === 'reject'
                    ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
                disabled={loading}
              >
                {loading ? `${getBulkActionText(bulkAction)}...` : `Ya, ${getBulkActionText(bulkAction)}`}
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

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Daftar File ({selectedFiles.length} file)
                      </h4>
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

export default ValidationUploadTable;