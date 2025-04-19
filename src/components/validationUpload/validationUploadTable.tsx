import { ValidationUploadUraian } from "@/types/validationUploadUraian";
import { useEffect, useState } from "react";
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineTrash,
} from "react-icons/hi2";
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
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(validationUploadUraianData.length).fill(false),
  );
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const totalPages = Math.ceil(
    validationUploadUraianData.length / itemsPerPage,
  );

  const currentItems = validationUploadUraianData.slice(
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

  // Fungsi untuk membuka dan menutup modal validasi
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Fungsi untuk validasi semua
  const handleValidateAll = () => {
    console.log("Validasi semua item berhasil!");
    setIsModalOpen(false);
  };

  // Fungsi untuk membuka modal hapus
  const handleDeleteClick = (index: number) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setItemToDelete(globalIndex);
    setShowDeleteModal(true);
  };

  // Fungsi untuk konfirmasi hapus
  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      console.log(`Item dengan index ${itemToDelete} telah dihapus`);
      // Di sini bisa tambahkan logika untuk menghapus item dari array data
      // contoh: const newData = [...validationUploadUraianData];
      // newData.splice(itemToDelete, 1);
      
      // Reset state
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // Fungsi untuk membatalkan hapus
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  useEffect(() => {
    const allCheckedInPage = currentItems.every(
      (_, index) =>
        checkedItems[(currentPage - 1) * itemsPerPage + index] === true,
    );
    setIsAllChecked(allCheckedInPage);
  }, [currentPage, checkedItems, currentItems, itemsPerPage]);

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

      <div className="mt-4 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#F7F9FC] text-left dark:bg-dark-2 ">
                <th className="px-4 py-4 xl:pl-7.5">
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="min-w-[220px] px-4 py-4 font-medium text-dark dark:text-white ">
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
                    <p className="text-dark dark:text-white">{userItem.skpd}</p>
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                  >
                    <p className="text-dark dark:text-white">
                      {formatDate(new Date(userItem.tanggal))}
                    </p>
                  </td>
                  <td
                    className={`border-[#eee] px-4 py-4 dark:border-dark-3 xl:pr-7.5 ${index === currentItems.length - 1 ? "border-b-0" : "border-b"}`}
                  >
                    <div className="flex items-center justify-end">
                      <div className="pl-1 capitalize text-dark dark:text-white">
                        <button className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:from-[#0C479F] hover:to-[#0C479F] hover:pr-6">
                          <span className="text-[20px]">
                            <HiOutlineClipboardDocumentCheck />
                          </span>
                          {/* Teks Validasi yang muncul saat hover */}
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Validasi
                          </span>
                        </button>
                      </div>

                      <div className="pl-4 capitalize text-dark dark:text-white">
                        <button 
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] bg-red-500 px-4 py-[10px] text-[16px] text-white transition-all duration-300 ease-in-out hover:bg-red-600 hover:pr-6"
                          onClick={() => handleDeleteClick(index)}
                        >
                          <span className="text-[20px]">
                            <HiOutlineTrash />
                          </span>
                          {/* Teks Hapus yang muncul saat hover */}
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Hapus
                          </span>
                        </button>
                      </div>

                      {/* Link Review Document */}
                      <div className="pl-4 capitalize text-dark dark:text-white">
                        <a
                          href={`/review-document/${userItem.skpd}`} // URL berdasarkan data yang dipilih
                          className="group active:scale-[.97] flex items-center justify-center overflow-hidden rounded-[7px] border border-black px-4 py-[10px] text-[16px] text-dark transition-all duration-300 ease-in-out hover:pr-6"
                        >
                          <span className="text-[20px]">
                            <HiOutlineDocumentMagnifyingGlass />
                          </span>
                          {/* Teks Review yang muncul saat hover */}
                          <span className="w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:w-auto group-hover:opacity-100">
                            Review
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
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* Modal Validasi */}
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
                {/* Tombol X untuk Close */}
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={handleCloseModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
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

                      {/* Form untuk Catatan / Keterangan */}
                      <form className="mt-4">
                        <label
                          htmlFor="catatan"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Catatan / Keterangan (Opsional)
                        </label>
                        <textarea
                          id="catatan"
                          name="catatan"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Tambahkan catatan atau keterangan..."
                        ></textarea>
                      </form>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Konfirmasi Hapus
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Apakah anda yakin ingin menghapus?
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleCancelDelete}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationUploadTable;