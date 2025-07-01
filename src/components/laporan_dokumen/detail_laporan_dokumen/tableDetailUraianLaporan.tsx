import { useEffect, useState } from "react";
import ElemenComboboxDetailUraianLaporan from "@/components/elements/ElemenComboboxDetailUraianLaporan";

interface DokumenPerTahun {
  uraian: string;
  tahun: number;
  data: string;
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

const TableDetailUraianLaporan = ({ 
  dokumenPerTahun,
  detailUraian,
  filterList,
  onSelectUraian,
}: TableDetailUraianLaporanProps) => {
  const activeUraian = detailUraian || "Semua";
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const uniqueYears = Array.from(
      new Set(dokumenPerTahun.map((d) => d.tahun)),
    ).sort();
    setYears(uniqueYears);
  }, [dokumenPerTahun]);

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <ElemenComboboxDetailUraianLaporan
          dokumenPerTahun={filterList}
          selectedUraian={activeUraian}
          onSelectUraian={onSelectUraian}
          
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
              {dokumenPerTahun.length > 0 ? (
                <tr>
                  {years.map((year) => {
                    const dokumenByYear = dokumenPerTahun.filter((d) => d.tahun === year);
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
