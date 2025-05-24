"use client";
import { useState, useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import { HiOutlineDocumentDownload, HiOutlineSearch } from "react-icons/hi";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import { apiRequest, downloadFileRequest } from "@/helpers/apiClient";

type LaporanPergeseran = {
  // id: number;
  deskripsi: string;
  tanggal: Date;
  file_unduh: string;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const MainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(true);

  const [dataList, setDataList] = useState<LaporanPergeseran[]>([]);
  const [dinas, setDinas] = useState<number | null>(null);
  const [dinasName, setDinasName] = useState<string>("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredDokumen = dataList.filter((item) =>
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDokumen.length / itemsPerPage);
  const currentItems = filteredDokumen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mendapatkan informasi dinas dari URL parameters
  useEffect(() => {
    try {
      const key = process.env.NEXT_PUBLIC_APP_KEY || "defaultKey";
      const user = Cookies.get("user");
      const encryptedParam = searchParams.get(key);
      const idParam = searchParams.get("id");
      const namaParam = searchParams.get("nama");
      
      if (encryptedParam && user) {
        // Mode enkripsi
        const decrypted = decryptObject(encryptedParam, user);
        console.log(decrypted);
        if (!decrypted) {
          setError("Gagal dekripsi atau data rusak.");
          return;
        }
        
        const { id, nama } = decrypted;
        setDinas(id);
        setDinasName(nama);
        // if (decrypted && decrypted.nama) {
        //   setDinasName(decrypted.nama);
        // }
      } else if (idParam && namaParam) {
        // Mode parameter langsung
        setDinasName(decodeURIComponent(namaParam));
      } else {
        // Mencoba mendapatkan dari URL path (jika menggunakan routing dinamis)
        const pathSegments = window.location.pathname.split("/");
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment) {
          const formattedName = lastSegment.split("?")[0].replace(/-/g, " ");
          setDinasName(formattedName
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
          );
        }
      }
    } catch (error) {
      console.error("Error parsing dinas data:", error);
    }
  }, [searchParams]);

    // console.log(dinas);


   useEffect(() => {
    const fetchData = async () => {
      try {
      // console.log(dinas);

        const response = await apiRequest(`/reports/pergeseran-detail/${dinas}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Pergeseran data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // setDataList(result.responseData);
        const formattedData: LaporanPergeseran[] = result.responseData.items.map((item: any) => ({
          deskripsi: item.deskripsi,
          tanggal: new Date(item.tanggal),
          file_unduh: item.file_unduh,
        }));
        console.log(formattedData);
        
        setDataList(formattedData);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (dinas) fetchData();
  }, [dinas]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Function untuk memotong string dan hanya mengambil 5 kata pertama
  const truncateText = (text: string, wordCount: number = 5) => {
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // ketika tombol download ini di tekan harusnya ke download EXCEL yang di simpan oleh usernya dan lampiran pembuatan dianya
  const handleDownloadClick = async (file_unduh: string, documentName: string) => {
    try {
      // console.log('Downloading file from path:', file_unduh);
      
      // Pastikan filePath tidak kosong
      if (!file_unduh || file_unduh.trim() === '') {
        throw new Error('Path file tidak valid');
      }

      // Hapus leading slash jika ada dan encode path
      const cleanFilePath = file_unduh.startsWith('/') ? file_unduh.substring(1) : file_unduh;
      const encodedFilePath = encodeURIComponent(cleanFilePath);
      
      // console.log('Clean file path:', cleanFilePath);
      // console.log('Encoded file path:', encodedFilePath);
      
      // Menggunakan downloadFileRequest helper untuk download dengan path yang sudah di-encode
      const response = await downloadFileRequest(`/kotak_masuk/download/${encodedFilePath}`);
      
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Coba ambil detail error dari response
          try {
            const errorData = await response.json();
            console.error('File not found details:', errorData);
            throw new Error(`File tidak ditemukan: ${cleanFilePath}`);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error(`File tidak ditemukan di server: ${cleanFilePath}`);
          }
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            console.error('Bad request details:', errorData);
            throw new Error(errorData.ResponseDesc || 'Format file tidak valid');
          } catch (parseError) {
            throw new Error('Format file tidak valid');
          }
        } else {
          throw new Error(`Error ${response.status}: Gagal mengunduh file`);
        }
      }

      // Membuat blob dari response
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File kosong atau tidak dapat dibaca');
      }
      
      console.log('Blob size:', blob.size, 'bytes');
      
      // Membuat URL object untuk blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tentukan nama file untuk download
      let downloadFileName = documentName || 'download';
      
      // Jika documentName tidak ada ekstensi, ambil dari filePath
      if (documentName && !documentName.includes('.')) {
        const fileExtension = cleanFilePath.split('.').pop();
        if (fileExtension) {
          downloadFileName = `${documentName}.${fileExtension}`;
        }
      } else if (!documentName) {
        // Jika tidak ada documentName, gunakan nama file dari path
        downloadFileName = cleanFilePath.split('/').pop() || 'download';
      }
      
      console.log('Download filename:', downloadFileName);
      
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
      
      console.log('Download completed successfully');
      
      // Tampilkan notifikasi sukses (opsional)
      // alert(`File "${downloadFileName}" berhasil diunduh!`);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh file';
      alert(`Gagal mengunduh file: ${errorMessage}`);
    }
  };
  
  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-lg bg-white px-6 py-6 shadow-md dark:bg-gray-800 dark:shadow-none transition-all duration-300 hover:shadow-lg">
        <div className="mb-5">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Laporan Pergeseran Anggaran
            </h3>
            {dinasName && (
              // <div className=" bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-[18px] font-medium text-blue-800 dark:text-blue-300">
                  {dinasName}
                </h4>
              // </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {/* Menampilkan data pergeseran anggaran */}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari Deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-gray-700 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300"
                />
                <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <th className="px-5 py-4 text-left font-medium text-dark dark:text-gray-200 w-[45%]">
                  Deskripsi
                </th>
                <th className="px-5 py-4 text-center font-medium text-dark dark:text-gray-200 w-[25%]">
                  Tanggal
                </th>
                <th className="px-5 py-4 text-right font-medium text-dark dark:text-gray-200 w-[30%]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item, index) => (
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150"
                  key={index}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      <p className="font-medium text-dark dark:text-white" title={item.deskripsi}>
                        {truncateText(item.deskripsi, 8)}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-dark dark:text-white">
                      {/* {item.tanggal}/ */}
                      {formatDate(new Date(item.tanggal))}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        id={`download-btn-${index}`}
                        className="group flex items-center gap-2 rounded-lg  px-4 py-2 text-white  focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 active:scale-[.98] transition-all duration-200 dark:bg-blue-700 dark:hover:bg-blue-600"
                        onClick={() => handleDownloadClick(item.file_unduh, item.deskripsi)}
                      >
                        <div className="flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6">
                          <span className="text-[20px]">
                            <HiOutlineDocumentDownload />
                          </span>
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Download
                          </span>
                        </div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-lg font-medium">Tidak ada data yang ditemukan</p>
                      <p className="text-sm text-gray-400 mt-1">Coba ubah kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-gray-50 px-5 py-3 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;