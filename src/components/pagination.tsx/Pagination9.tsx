import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  itemsPerPage: number; // Tambahkan props untuk itemsPerPage
  onItemsPerPageChange: (value: number) => void; // Callback untuk mengubah itemsPerPage
}

const Pagination9 = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}: PaginationProps) => {
  return (
    <div className="my-4 flex justify-between items-center xl:pr-7.5">
      {/* Dropdown untuk memilih jumlah item per halaman */}
      <div className="relative inline-block">
  <span className="mr-2">Show per page:</span>
  <select
    value={itemsPerPage}
    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
    className="border rounded px-2 py-1 pr-8 appearance-none"
  >
    <option value={9}>9</option>
    <option value={15}>15</option>
    <option value={30}>30</option>
  </select>
  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.69149 7.09327C3.91613 6.83119 4.31069 6.80084 4.57277 7.02548L9.99936 11.6768L15.4259 7.02548C15.688 6.80084 16.0826 6.83119 16.3072 7.09327C16.5319 7.35535 16.5015 7.74991 16.2394 7.97455L10.4061 12.9745C10.172 13.1752 9.82667 13.1752 9.59261 12.9745L3.75928 7.97455C3.4972 7.74991 3.46685 7.35535 3.69149 7.09327Z"
        fill=""
      />
    </svg>
  </div>
</div>


      {/* Tombol Navigasi Pagination */}
      <nav
        aria-label="Pagination"
        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
            currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Previous</span>
          <HiChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => onPageChange(index + 1)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
              currentPage === index + 1
                ? "bg-[#0C479F] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C479F]"
                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
            currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next</span>
          <HiChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination9;
