import { ValidationUploadUraian } from "@/types/validationUploadUraian";
import { useState } from "react";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import Pagination from "../pagination.tsx/Pagination";

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const validationUploadUraianData: ValidationUploadUraian[] = [
  {
    skpd: "Dinas Sosial",
    uraian: "Bantuan pangan untuk warga terdampak bencana",
    tanggal: new Date("2024-08-21T10:00:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Program pemberdayaan ekonomi warga miskin",
    tanggal: new Date("2024-09-14T11:30:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Penyaluran bantuan subsidi pendidikan",
    tanggal: new Date("2024-07-03T09:45:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Rehabilitasi rumah tidak layak huni",
    tanggal: new Date("2024-06-18T15:00:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Pelatihan keterampilan untuk penyandang disabilitas",
    tanggal: new Date("2024-11-05T14:20:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Program bantuan sosial tunai",
    tanggal: new Date("2024-12-19T16:45:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Pembagian bantuan sembako untuk lansia",
    tanggal: new Date("2024-05-10T13:00:00Z"),
  },
  {
    skpd: "Dinas Sosial",
    uraian: "Kegiatan pemberdayaan komunitas adat terpencil",
    tanggal: new Date("2024-10-28T08:15:00Z"),
  },
];

const ValidationUploadTable = () => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(validationUploadUraianData.length / itemsPerPage);

  // Get current items to display based on pagination
  const currentItems = validationUploadUraianData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    const newCheckedItems = new Array(validationUploadUraianData.length).fill(
      !isAllChecked,
    );
    setCheckedItems(newCheckedItems);
    setIsAllChecked(!isAllChecked);
  };

  const handleItemCheck = (index: number) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
    setIsAllChecked(newCheckedItems.every((item) => item));
  };

  const handleValidateAll = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Tombol Validasi Semua */}
      {isAllChecked && (
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-2 text-white hover:from-[#0C479F] hover:to-[#0C479F]"
            onClick={handleOpenModal}
          >
            {isAllChecked ? "Validasi Semua" : "Batal Validasi Semua"}
          </button>
        </div>
      )}

      <div className="rounded-[10px] mt-4 border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2">
                <th className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white xl:pl-7.5">
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
              {currentItems.map((userItem, index) => (
                <tr key={index}>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems[index] || false}
                      onChange={() => handleItemCheck(index)}
                    />
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                  >
                    <p className="text-dark dark:text-white">{userItem.skpd}</p>
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                  >
                    <p className="text-dark dark:text-white">
                      {formatDate(new Date(userItem.tanggal))}
                    </p>
                  </td>
                  <td className="px-3 py-4 xl:pr-7.5">
  <div className="flex items-center justify-end">
    {/* Tombol Validasi */}
    <div className="pl-1 capitalize text-dark dark:text-white">
      <button className="active:scale-[.97]">
        <div className="flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]">
          <span className="text-[20px]">
            <HiOutlineClipboardDocumentList />
          </span>
          <span>Validasi</span>
        </div>
      </button>
    </div>

    {/* Link Review Document */}
    <div className="pl-4 capitalize text-dark dark:text-white">
      <a
        href={`/review-document/${userItem.skpd}`} // URL berdasarkan data yang dipilih
        className="flex items-center justify-center space-x-2 rounded-[7px]  px-4 py-[10px] text-[16px] text-dark"
      >
        
        <span>Review Document</span>
        <span className="text-[20px]">
          <HiOutlineClipboardDocumentList />
        </span>
      </a>
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

      {/* Modal */}
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
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
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
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={handleCloseModal}
                  >
                    Cancel
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
