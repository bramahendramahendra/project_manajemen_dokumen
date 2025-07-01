// TablePage.tsx
"use client";

import { useState } from "react";
import Pagination from "@/components/pagination/Pagination"; // Sesuaikan path import sesuai struktur proyek Anda
import { HiOutlineDocumentText } from "react-icons/hi";
import Image from "next/image";

// Definisikan tipe status dokumen
type DocumentStatus = "Proses" | "Diterima" | "Tolak";

// Definisikan tipe untuk data dokumen
interface DocumentItem {
  nameDocument: string;
  status: DocumentStatus;
  dateTime: Date;
  link: string;
}

// Fungsi untuk mendapatkan warna status
const getStatusColor = (status: DocumentStatus) => {
  switch (status) {
    case 'Proses':
      return 'bg-yellow-100 text-yellow-800'; // Warna kuning untuk Proses
    case 'Tolak':
      return 'bg-red-100 text-red-800'; // Warna merah untuk Tolak
    case 'Diterima':
      return 'bg-green-100 text-green-800'; // Warna hijau untuk Diterima
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format tanggal dalam bahasa Indonesia
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const TablePage = () => {
  // Data dokumen contoh dengan 3 status (Proses, Diterima, Tolak)
  const [documentData, setDocumentData] = useState<DocumentItem[]>([
    {
      nameDocument: "Anual_Report_2023",
      status: "Diterima",
      dateTime: new Date("2024-09-01T10:00:00Z"),
      link: "#",
    },
    {
      nameDocument: "Product_Catalogue_Q1",
      status: "Proses",
      dateTime: new Date("2024-09-02T11:30:00Z"),
      link: "#",
    },
    {
      nameDocument: "Employee_Handbook_v2",
      status: "Tolak",
      dateTime: new Date("2024-07-21T11:30:00Z"),
      link: "#",
    },
    {
      nameDocument: "Financial_Statement_August_2022",
      status: "Diterima",
      dateTime: new Date("2023-07-01T11:30:00Z"),
      link: "#",
    },
    {
      nameDocument: "Marketing_Strategy_Plan_2024",
      status: "Proses",
      dateTime: new Date("2022-01-01T11:30:00Z"),
      link: "#",
    },
    {
      nameDocument: "Budget_Proposal_2025",
      status: "Tolak",
      dateTime: new Date("2022-01-01T11:30:00Z"),
      link: "#",
    },
    {
      nameDocument: "Budget_Proposal_2025",
      status: "Tolak",
      dateTime: new Date("2022-01-01T11:30:00Z"),
      link: "#",
    },
  ]);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Logic pagination
  const totalPages = Math.ceil(documentData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = documentData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Handler untuk perubahan items per page
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset ke halaman pertama saat mengubah items per page
  };

  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark">
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Document Information
      </h4>

      <div className="overflow-x-auto">
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] dark:bg-gray-dark">
              <th className="px-4 py-4 pb-3.5 text-left font-medium text-dark dark:text-gray-300">
                Uraian
              </th>
              <th className="px-4 py-4 pb-3.5 text-center font-medium text-dark dark:text-gray-300">
                Tanggal
              </th>
              <th className="px-4 py-4 pb-3.5 text-center font-medium text-dark dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-2 ${
                  index === currentItems.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-dark-3"
                }`}
              >
                <td className="px-4 py-5 text-sm font-medium text-dark dark:text-white">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <HiOutlineDocumentText className="h-5 w-5 text-gray-400" />
                    </div>
                    <span>{item.nameDocument.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-center text-sm text-dark dark:text-white">
                  {formatDate(item.dateTime)}
                </td>
                <td className="px-4 py-5 text-center">
                  <div className="flex items-center justify-center">
                    <div className={`${getStatusColor(item.status)} flex items-center px-3 py-1 rounded-full text-xs`}>
                      {/* <div className="mr-1.5 h-2 w-2 rounded-full bg-current" /> */}
                      <span>{item.status}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Tampilkan pesan jika tidak ada data */}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <HiOutlineDocumentText className="h-10 w-10 text-gray-400" />
                    <p className="mt-2">Tidak ada dokumen</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gunakan komponen Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default TablePage;