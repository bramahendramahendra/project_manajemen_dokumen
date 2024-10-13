"use client";
import { useState } from "react";
import { ValidationUpload } from "@/types/validationUpload";
import Pagination from "../pagination.tsx/Pagination";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const validationUpload: ValidationUpload[] = [
  { skpd: "Dinas Pendidikan", belumValidasi: 1 },
  { skpd: "Dinas Kesehatan", belumValidasi: 3 },
  { skpd: "Dinas Pertanian", belumValidasi: 5 },
  { skpd: "Dinas Kelautan", belumValidasi: 0 },
  { skpd: "Dinas Kesejahteraan", belumValidasi: 1 },
  { skpd: "Dinas Politik", belumValidasi: 4 },
  { skpd: "Dinas Pertahanan", belumValidasi: 1 },
  { skpd: "Dinas Keuangan", belumValidasi: 5 },
];

const itemsPerPage = 5;

const MainPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(validationUpload.length / itemsPerPage);

  // Get current items to display based on the current page
  const currentItems = validationUpload.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatSkpdForUrl = (skpd: string) => {
    return skpd.toLowerCase().replace(/\s+/g, "-");
  };

  const handleDetailsClick = (skpd: string) => {
    const formattedSkpd = formatSkpdForUrl(skpd);
    router.push(`/validation_upload/${formattedSkpd}`);
  };

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Lakukan validasi dokumen dengan cermat
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-[#F7F9FC]">
                <th className="px-2 py-4 text-left font-medium text-dark dark:bg-gray-dark xl:pl-7.5">
                  SKPD
                </th>
                <th className="px-4 py-4 pb-3.5 font-medium text-dark">
                  Belum di validasi
                </th>
                <th className="px-4 py-4 pb-3.5 text-right font-medium text-dark xl:pr-7.5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((brand, key) => (
                <tr
                  className={`hover:bg-gray-2 ${
                    key === currentItems.length - 1
                      ? ""
                      : "border-b border-stroke dark:border-dark-3"
                  }`}
                  key={key}
                >
                  <td className="px-2 py-4 dark:bg-gray-dark 2xsm:w-7 sm:w-60 md:w-90 xl:pl-7.5">
                    <div className="flex items-center gap-3.5">
                      <p className="font-medium text-dark dark:text-white">
                        {brand.skpd.replace(/_/g, " ")}
                      </p>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center justify-center">
                      <div className="pl-1 capitalize text-dark dark:text-white">
                        {brand.belumValidasi}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4 xl:pr-7.5">
                    <div className="flex items-center justify-end">
                      <div className="pl-1 capitalize text-dark dark:text-white">
                        <button className="active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11">
                          <div
                            className="flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]"
                            onClick={() => handleDetailsClick(brand.skpd)}
                          >
                            <span className="text-[20px]">
                              <HiOutlineClipboardDocumentList />
                            </span>
                            <span>Detail</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
