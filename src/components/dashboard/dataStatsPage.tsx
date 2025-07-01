// DataStatsOne.tsx
"use client";

import React, { useState } from "react";
import DocumentModal from "../modals/documentModal";
import { dataStats } from "@/types/dataStats";
import { 
  HiDocument, 
  HiClock, 
  HiCheck, 
  HiXMark 
} from "react-icons/hi2";

// Definisikan tipe dokumen
interface DocumentItem {
  nameDocument: string;
  status: "Proses" | "Diterima" | "Tolak";
  dateTime: Date;
  link: string;
}

// Sample document data
const documentData: DocumentItem[] = [
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
    nameDocument: "Sales_Report_Q2_2024",
    status: "Proses",
    dateTime: new Date("2024-07-15T10:30:00Z"),
    link: "#",
  },
  {
    nameDocument: "Executive_Summary_2023",
    status: "Diterima",
    dateTime: new Date("2023-12-20T14:45:00Z"),
    link: "#",
  },
  {
    nameDocument: "Tax_Filing_2023",
    status: "Tolak",
    dateTime: new Date("2023-04-12T09:15:00Z"),
    link: "#",
  },
  {
    nameDocument: "Tax_Filing_2023",
    status: "Tolak",
    dateTime: new Date("2023-04-12T09:15:00Z"),
    link: "#",
  },
];

const dataStatsList = [
  {
    icon: (
      <div className="flex items-center justify-center relative">
        <HiDocument className="w-8 h-8 text-white" />
        <HiClock className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
      </div>
    ),
    color: "#3FD97F",
    title: "Dokumen Diproses",
    value: "3",
    status: "Proses",
  },
  {
    icon: (
      <div className="flex items-center justify-center relative">
        <HiDocument className="w-8 h-8 text-white" />
        <HiCheck className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
      </div>
    ),
    color: "#FF9C55",
    title: "Dokumen Diterima",
    value: "3",
    status: "Diterima",
  },
  {
    icon: (
      <div className="flex items-center justify-center relative">
        <HiDocument className="w-8 h-8 text-white" />
        <HiXMark className="w-4 h-4 text-white absolute -bottom-1 -right-1" />
      </div>
    ),
    color: "#8155FF",
    title: "Dokumen Ditolak",
    value: "3",
    status: "Tolak",
  },
];

const DataStatsOne: React.FC<dataStats> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentItem[]>([]);
  const [modalTitle, setModalTitle] = useState("");

  // Fungsi untuk menampilkan modal dan filter dokumen berdasarkan status
  const handleCardClick = (status: "Proses" | "Diterima" | "Tolak", title: string) => {
    // Filter dokumen berdasarkan status
    const filtered = documentData.filter(doc => doc.status === status);
    setFilteredDocuments(filtered);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  // Update counts
  const prosesCount = documentData.filter(doc => doc.status === "Proses").length;
  const diterimaCount = documentData.filter(doc => doc.status === "Diterima").length;
  const tolakCount = documentData.filter(doc => doc.status === "Tolak").length;

  return (
    <>
      <div 
        className="flex grid-cols-1 gap-4 overflow-x-auto 
          lg:grid lg:grid-cols-3 lg:gap-3
          md:grid md:grid-cols-3 md:gap-6 
          2xl:gap-7.5
        "
      >
        {dataStatsList.map((item, index) => {
          // Update value dinamis
          let count = "0";
          if (item.status === "Proses") count = prosesCount.toString();
          else if (item.status === "Diterima") count = diterimaCount.toString();
          else if (item.status === "Tolak") count = tolakCount.toString();

          return (
            <div
              key={index}
              className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark cursor-pointer transition-all hover:shadow-xl"
              onClick={() => handleCardClick(item.status as "Proses" | "Diterima" | "Tolak", item.title)}
            >
              <div
                className="flex h-14.5 w-14.5 items-center justify-center rounded-full relative"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>

              <div className="mt-6 flex items-end justify-between">
                <div>
                  <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                    {count}
                  </h4>
                  <span className="text-body-sm font-medium">{item.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal untuk menampilkan daftar dokumen */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documents={filteredDocuments}
        title={modalTitle}
      />
    </>
  );
};

export default DataStatsOne;