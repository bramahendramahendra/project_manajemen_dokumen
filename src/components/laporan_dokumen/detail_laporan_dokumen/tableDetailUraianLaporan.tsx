import { useEffect, useState } from "react";
import { DokumenPerTahun } from "@/types/detailDokumenTerupload";
import ElemenComboboxDetailUraianLaporan from "@/components/elements/ElemenComboboxDetailUraianLaporan";

interface TableDetailUraianLaporanProps {
  dokumenPerTahun: DokumenPerTahun[];
}

const TableDetailUraianLaporan = ({ dokumenPerTahun }: TableDetailUraianLaporanProps) => {
  const [sortedData, setSortedData] = useState<DokumenPerTahun[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("Semua"); // Default ke "Semua"

  useEffect(() => {
    console.log("Selected Uraian:", selectedUraian); // Debugging nilai selectedUraian
    // Jika "Semua" dipilih, tampilkan semua data
    const filteredData =
      selectedUraian === "Semua"
        ? dokumenPerTahun
        : dokumenPerTahun.filter((dokumen) => dokumen.uraian === selectedUraian);

    console.log("Filtered Data:", filteredData); // Debugging data setelah filter

    // Urutkan berdasarkan abjad pada kolom "uraian"
    const sorted = [...filteredData].sort((a, b) => a.uraian.localeCompare(b.uraian));
    setSortedData(sorted);

    // Ambil semua tahun unik dan urutkan
    const uniqueYears = Array.from(new Set(sorted.map((d) => d.tahun))).sort();
    setYears(uniqueYears);
  }, [dokumenPerTahun, selectedUraian]);

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <ElemenComboboxDetailUraianLaporan
          dokumenPerTahun={dokumenPerTahun}
          onSelectUraian={(uraian) => setSelectedUraian(uraian)}
        />
        <div className="mt-4 w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                {years.map((year) => (
                  <th
                    key={year}
                    className="px-4 py-4 text-center font-medium text-dark dark:text-white"
                    style={{ width: "150px" }}
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                <tr>
                  {years.map((year) => {
                    const dokumenByYear = sortedData.filter((d) => d.tahun === year);
                    return (
                      <td
                        key={year}
                        className="border-[#eee] px-4 py-4 text-left align-top dark:border-dark-3"
                        style={{ verticalAlign: "top" }}
                      >
                        {dokumenByYear.length > 0 ? (
                          <ul className="list-inside list-none space-y-1 text-center text-gray-600 dark:text-gray-400">
                            {dokumenByYear.map((dokumen, index) => (
                              <li key={index}>{dokumen.data}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400">No Data</p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={years.length || 1}
                    className="px-4 py-4 text-center text-gray-600 dark:text-gray-400"
                  >
                    Data tidak tersedia / Data tidak ada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableDetailUraianLaporan;
