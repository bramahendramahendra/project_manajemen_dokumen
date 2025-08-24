import { useEffect, useState } from "react";
import { HiOutlineArrowDownTray } from "react-icons/hi2";
import ElemenComboboxDetailUraianLaporan from "@/components/elements/ElemenComboboxDetailUraianLaporan";
import Pagination from "@/components/pagination/Pagination";


const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface DokumenPerTahun {
  id: number;
  uraian: string;
  tahun: number;
  data: string;
  tanggal?: Date;
  status?: 'Proses' | 'Ditolak' | 'Diterima';
}

interface FilterDokumenPerTahun {
  typeID: number;
  uraian: string;
}

interface TableDetailUraianLaporanProps {
  dokumenPerTahun: DokumenPerTahun[];
  detailUraian: string;
  filterList: FilterDokumenPerTahun[];
  onSelectUraian: (uraian: string) => void;
}

// Mendapatkan warna sesuai status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Proses':
      return 'bg-yellow-100 text-yellow-800';
    case 'Ditolak':
      return 'bg-red-100 text-red-800';
    case 'Diterima':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TableDetailUraianLaporan = ({ 
  dokumenPerTahun,
  detailUraian,
  filterList,
  onSelectUraian,
}: TableDetailUraianLaporanProps) => {
  const activeUraian = detailUraian || "Semua";
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(dokumenPerTahun.length).fill(false),
  );
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter data berdasarkan search term
  const filteredData = dokumenPerTahun.filter((dokumen) =>
    (dokumen.uraian?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (dokumen.data?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    dokumen.tahun?.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Fungsi untuk memilih semua item
  const handleSelectAll = () => {
    const newCheckedItems = [...checkedItems];
    const allChecked = currentItems.every(
      (_, index) => newCheckedItems[(currentPage - 1) * itemsPerPage + index],
    );

    currentItems.forEach((_, index) => {
      const globalIndex = (currentPage - 1) * itemsPerPage + index;
      newCheckedItems[globalIndex] = !allChecked;
    });

    setCheckedItems(newCheckedItems);
    setIsAllChecked(!allChecked);
  };

  // Fungsi untuk memilih item individual
  const handleItemCheck = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    const newCheckedItems = [...checkedItems];
    newCheckedItems[globalIndex] = !newCheckedItems[globalIndex];

    setCheckedItems(newCheckedItems);
    const allCheckedInPage = currentItems.every(
      (_, idx) =>
        newCheckedItems[(currentPage - 1) * itemsPerPage + idx] === true,
    );
    setIsAllChecked(allCheckedInPage);
  };

  // Fungsi untuk download dokumen
  const handleDownload = (dokumen: DokumenPerTahun) => {
    console.log(`Download dokumen: ${dokumen.uraian} - ${dokumen.tahun}`);
    // Implementasi download logic di sini
  };

  useEffect(() => {
    // Reset ke halaman pertama ketika search term berubah
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const allCheckedInPage = currentItems.every(
      (_, index) =>
        checkedItems[(currentPage - 1) * itemsPerPage + index] === true,
    );
    setIsAllChecked(allCheckedInPage);
  }, [currentPage, checkedItems, currentItems, itemsPerPage]);

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex justify-between items-center mb-4.5">
          <input
            type="text"
            placeholder="Cari nama dinas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px] rounded-[7px] bg-transparent px-5 py-2 text-dark ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          />
          
          {/* Tombol Bulk Action jika minimal 2 item terseleksi */}
          {checkedItems.filter(Boolean).length >= 2 && (
            <button
              className="rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-2 text-white hover:from-[#0C479F] hover:to-[#0C479F]"
              onClick={() => console.log("Download semua item yang dicentang")}
            >
              Download Semua ({checkedItems.filter(Boolean).length})
            </button>
          )}
        </div>

        <div className="mt  bg-white  ">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                  <th className="px-4 py-4 xl:pl-7.5">
                    <input
                      type="checkbox"
                      checked={isAllChecked}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white">
                    Uraian
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white">
                    Tahun
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-dark dark:text-white">
                    Tanggal Upload
                  </th>
                  {/* <th className="min-w-[120px] px-4 py-4 font-medium text-dark dark:text-white text-center">
                    Status
                  </th> */}
                  <th className="px-4 py-4 text-right font-medium text-dark dark:text-white xl:pr-7.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((dokumen, index) => (
                    <tr key={index} className="hover:bg-gray-2 dark:hover:bg-gray-800 border-b border-stroke dark:border-dark-3 transition-colors">
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
                        <p className="text-dark dark:text-white">{dokumen.uraian || "dokumen/laporannya muncul disini"}</p>
                      </td>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                      >
                        <p className="text-dark dark:text-white">{dokumen.tahun}</p>
                      </td>
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                      >
                        <p className="text-dark dark:text-white">
                          {dokumen.tanggal ? formatDate(dokumen.tanggal) : '-'}
                        </p>
                      </td>
                      {/* <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"} text-center`}
                      >
                        <div className="flex justify-center">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(dokumen.status || 'Proses')}`}>
                            {dokumen.status || 'Proses'}
                          </span>
                        </div>
                      </td> */}
                      <td
                        className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                      >
                        <div className="flex items-center justify-end">
                          <div className="capitalize text-dark dark:text-white">
                            <button 
                              className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6"
                              onClick={() => handleDownload(dokumen)}
                            >
                              <span className="text-[20px]">
                                <HiOutlineArrowDownTray />
                              </span>
                              {/* Teks Download yang muncul saat hover */}
                              <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                                Download
                              </span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-center text-gray-600 dark:text-gray-400"
                    >
                      Data tidak tersedia / Data tidak ada
                    </td>
                  </tr>
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
      </div>
    </div>
  );
};

export default TableDetailUraianLaporan;