import { useEffect, useState } from "react";
import ElemenComboboxDetailUraian from "../elements/ElemenComboboxDetailUraian";
import { DokumenPerTahun, FilterDokumenPerTahun  } from "@/types/detailDokumenTerupload";

interface TableDetailUraianProps {
  dokumenPerTahun: DokumenPerTahun[];
  detailUraian: string;
  filterList: FilterDokumenPerTahun[];
  onSelectUraian: (uraian: string) => void;
}

const TableDetailUraian = ({
  dokumenPerTahun,
  detailUraian,
  filterList,
  onSelectUraian,
}: TableDetailUraianProps) => {

  const [filteredData, setFilteredData] = useState<DokumenPerTahun[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedUraian, setSelectedUraian] = useState(detailUraian);

  const handleSelectUraian = (uraian: string) => {
    setSelectedUraian(uraian);
    onSelectUraian(uraian);
  };

  useEffect(() => {
    const slug = selectedUraian.toLowerCase().replace(/\s+/g, "-");
    const newFilteredData = dokumenPerTahun.filter(
      (dokumen) => dokumen.uraian.toLowerCase().replace(/\s+/g, "-") === slug,
    );

    setFilteredData(newFilteredData);
    const uniqueYears = Array.from(
      new Set(newFilteredData.map((d) => d.tahun)),
    ).sort();
    setYears(uniqueYears);
  }, [selectedUraian, dokumenPerTahun]);

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-md dark:bg-gray-dark dark:shadow-card">
        <ElemenComboboxDetailUraian
          // dokumenPerTahun={dokumenPerTahun}
          dokumenPerTahun={filterList}
          selectedUraian={selectedUraian}
          onSelectUraian={handleSelectUraian}
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
              {filteredData.length > 0 ? (
                <tr>
                  {years.map((year) => {
                    const dokumenByYear = filteredData.filter(
                      (d) => d.tahun === year,
                    );
                    return (
                      <td
                        key={`${year}-${selectedUraian}`}
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
                          <p className="text-gray-600 dark:text-gray-400">
                            No Data
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={years.length}
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

export default TableDetailUraian;
