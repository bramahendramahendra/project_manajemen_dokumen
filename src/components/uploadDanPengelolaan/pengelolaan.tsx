"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { DokumenTerupload, DokumenTeruploadResponse } from "@/types/dokumenTerupload";
import Pagination from "@/components/pagination/Pagination";

const PengelolaanDokumen = () => {
  const router = useRouter();
  
  // State management PERSIS seperti master dinas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataList, setDataList] = useState<DokumenTerupload[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    sort_by: '',
    sort_dir: 'DESC'
  });

  // Get user data - PERSIS seperti master dinas
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user") || "{}") : {};
  const dinas = user.dinas;

  // Function untuk fetch data dengan parameter - PERSIS seperti master dinas
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
    if (!dinas) {
      setError("ID Dinas tidak ditemukan");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buat query parameters - PERSIS seperti master dinas
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong - PERSIS seperti master dinas
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      // const response = await apiRequest(`/document_managements/all-data/verif-done/type/${dinas}?${queryParams.toString()}`, "GET");
      const response = await apiRequest(`/document_managements/pengelolaan-dinas/${dinas}?${queryParams.toString()}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Data dokumen tidak ditemukan");
        }
        throw new Error(`Terjadi kesalahan: ${response.status}`);
      }

      const result: DokumenTeruploadResponse = await response.json();
      
      // Validasi struktur response - PERSIS seperti master dinas
      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      // Transform data sesuai interface
      const resDocuments: DokumenTerupload[] = result.responseData.items.map((item: any) => ({
        typeID: item.jenis_id,
        uraian: item.jenis,
        jumlahDocument: item.total_validasi_done,
      }));

      // Set data dari response - PERSIS seperti master dinas
      setDataList(resDocuments);
      setTotalPages(result.responseMeta.total_pages);
      setTotalRecords(result.responseMeta.total_records);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server"
          : err.message,
      );
      setDataList([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect PERSIS seperti master dinas
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [currentPage, itemsPerPage, filters]);

  // Auto hide success message after 5 seconds - PERSIS seperti master dinas
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handler untuk perubahan halaman - PERSIS seperti master dinas
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handler untuk perubahan items per page - PERSIS seperti master dinas
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk detail - disesuaikan dengan kebutuhan existing
  const handleDetailsClick = (typeID: number, uraian: string) => {
    // console.log(typeID);
    
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const user = Cookies.get("user");
    
    if (!user) {
      alert("Sesi Anda telah berakhir, silakan login kembali!");
      return;
    }

    if (!key) {
      alert("Konfigurasi aplikasi tidak valid!");
      return;
    }

    try {
      const encrypted = encryptObject({ typeID, uraian }, user);
      const formattedUraian = uraian.replace(/\s+/g, "-").toLowerCase();
      router.push(`/upload_dan_pengelolaan/${formattedUraian}?${key}=${encrypted}`);
    } catch (error) {
      console.error("Error encrypting data:", error);
      alert("Terjadi kesalahan saat memproses data!");
    }
  };

  // Handler untuk retry ketika error - PERSIS seperti master dinas
  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage, filters);
  };

  // Render loading skeleton - PERSIS seperti master dinas
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-600 mx-auto"></div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </td>
      </tr>
    ))
  );

  // Render empty state - PERSIS seperti master dinas
  const renderEmptyState = () => (
    <tr>
      <td colSpan={3} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Data dokumen belum tersedia
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Belum ada dokumen yang terupload
          </p>
        </div>
      </td>
    </tr>
  );

  // Render error state - PERSIS seperti master dinas
  const renderErrorState = () => (
    <tr>
      <td colSpan={3} className="px-4 py-20 text-center">
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

  return (
    <div className="col-span-12 xl:col-span-6">
      {/* Alert Messages - PERSIS seperti master dinas */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 font-medium">{success}</p>
        </div>
      )}

      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        {/* Header - PERSIS seperti master dinas */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">Dokumen yang sudah terupload</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!loading && totalRecords > 0 && (
              <>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} dari {totalRecords} data</>
            )}
            {!loading && totalRecords === 0 && "Tidak ada data"}
          </div>
        </div>
        
        {/* Table - PERSIS seperti master dinas */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  Uraian
                </th>
                <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white text-center">
                  Jumlah
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && renderLoadingSkeleton()}
              {!loading && error && renderErrorState()}
              {!loading && !error && dataList.length === 0 && renderEmptyState()}
              {!loading && !error && dataList.length > 0 && dataList.map((item, index) => (
                <tr key={item.typeID} className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-4 xl:pl-7.5">
                    <p className="font-medium text-dark dark:text-white">
                      {item.uraian}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="text-dark dark:text-white">
                      {item.jumlahDocument}
                    </p>
                  </td>
                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleDetailsClick(item.typeID, item.uraian)}
                        className="group flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                        title={`Lihat detail ${item.uraian}`}
                      >
                        <span className="text-[20px]">
                          <HiOutlineArrowTopRightOnSquare />
                        </span>
                        <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                          Detail
                        </span>
                      </button>
                    </div>
                  </td> 
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination - PERSIS seperti master dinas */}
          {!loading && !error && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PengelolaanDokumen;