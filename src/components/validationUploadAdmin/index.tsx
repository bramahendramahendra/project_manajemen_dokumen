"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { encryptObject } from "@/utils/crypto";
import { HiOutlineArrowTopRightOnSquare} from "react-icons/hi2";
import { ValidationUploadAdmin, ValidationUploadAdminResponse } from "@/types/validationUpload";
import Pagination from "@/components/pagination/Pagination";

const MainPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataList, setDataList] = useState<ValidationUploadAdmin[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    sort_by: 'id',
    sort_dir: 'DESC'
  });

  // Function untuk fetch data dengan parameter
  const fetchData = async (page = 1, perPage = 10, filterParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filterParams
      });

      // Hapus parameter kosong
      Array.from(queryParams.entries()).forEach(([key, value]) => {
        if (!value) queryParams.delete(key);
      });

      const response = await apiRequest(`/validation/?${queryParams.toString()}`, "GET");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Validation document data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result : ValidationUploadAdminResponse = await response.json();

      if (!result.responseData || !result.responseData.items) {
        throw new Error("Format data tidak valid");
      }

      if (!result.responseMeta) {
        throw new Error("Format meta tidak valid");
      }
      
      const res: ValidationUploadAdmin[] = result.responseData.items.map((item: any) => ({
        id: item.dinas,
        skpd: item.nama_dinas,
        validasiPending: item.total_pending,
      }));

      setDataList(res);
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
      setDataList([]);
      setTotalPages(0);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect untuk fetch data
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, filters);
  }, [currentPage, itemsPerPage, filters]);

  // Auto hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handler untuk perubahan items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Handler untuk retry ketika error
  const handleRetry = () => {
    fetchData(currentPage, itemsPerPage, filters);
  };

  // Client-side pagination - menghitung data untuk halaman saat ini
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dataList.slice(startIndex, endIndex);
  };

  const currentItems = getCurrentPageData();

  const formatSkpdForUrl = (skpd: string) =>
    skpd.toLowerCase().replace(/\s+/g, "-");

  const handleDetailClick = (id: number, skpd: string, total: number) => {
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

    const encrypted = encryptObject({ id, skpd, total }, user);

    const formattedSkpd = formatSkpdForUrl(skpd);
    router.push(`/validation_upload_admin/${formattedSkpd}?${key}=${encrypted}`);
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: itemsPerPage }).map((_, index) => (
      <tr key={index} className="border-b border-stroke dark:border-dark-3">
        <td className="px-4 py-4">
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        </td>
      </tr>
    ))
  );

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td colSpan={6} className="px-4 py-20 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Data belum tersedia
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Belum ada dokumen validasi
          </p>
        </div>
      </td>
    </tr>
  );

  // Render error state
  const renderErrorState = () => (
    <tr>
      <td colSpan={6} className="px-4 py-20 text-center">
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
    <div className="col-span-12 xl:col-span-12">
      {/* Alert Messages - sinkron dengan master_dinas */}
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            Lakukan validasi dokumen dengan cermat
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
              <tr className="bg-[#F7F9FC] text-left dark:bg-gray-800">
                 <th className="px-2 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
                  No
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  SKPD
                </th>
                <th className="min-w-[200px] px-4 py-4 font-medium text-dark dark:text-white">
                  Belum di validasi
                </th>
                <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && renderLoadingSkeleton()}
              {!loading && error && renderErrorState()}
              {!loading && !error && dataList.length === 0 && renderEmptyState()}
              {!loading && !error && dataList.length > 0 && currentItems.map((item, index) => (
                <tr key={item.id}
                  className="border-b border-stroke dark:border-dark-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-4 xl:pl-7.5">
                    <p className="font-medium text-dark dark:text-white">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {item.skpd.replace(/_/g, " ")}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-dark dark:text-white">
                      {item.validasiPending}
                    </p>
                  </td>
                  <td className="px-4 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={() => handleDetailClick(item.id, item.skpd, item.validasiPending)}
                        className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                        title={`Detail ${item.skpd}`}
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

export default MainPage;
