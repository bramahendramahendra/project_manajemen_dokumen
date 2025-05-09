"use client";
import { useState } from "react";
import Pagination from "../pagination/Pagination";

const dummyKirimanDokumen = [
    {
      "id": 1,
      "sender": "Budi Santoso",
      "date": "2024-06-17",
      "lampiran": "DPA"
    },
    {
      "id": 2,
      "sender": "Budi Santoso",
      "date": "2024-06-17",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 3,
      "sender": "Budi Santoso",
      "date": "2024-06-17",
      "lampiran": "RKA"
    },
    {
      "id": 4,
      "sender": "Dewi Lestari",
      "date": "2024-06-18",
      "lampiran": "DPA"
    },
    {
      "id": 5,
      "sender": "Dewi Lestari",
      "date": "2024-06-18",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 6,
      "sender": "Dewi Lestari",
      "date": "2024-06-18",
      "lampiran": "RKA"
    },
    {
      "id": 7,
      "sender": "Andi Wijaya",
      "date": "2024-06-19",
      "lampiran": "DPA"
    },
    {
      "id": 8,
      "sender": "Andi Wijaya",
      "date": "2024-06-19",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 9,
      "sender": "Andi Wijaya",
      "date": "2024-06-19",
      "lampiran": "RKA"
    },
    {
      "id": 10,
      "sender": "Rina Suryani",
      "date": "2024-06-20",
      "lampiran": "DPA"
    },
    {
      "id": 11,
      "sender": "Rina Suryani",
      "date": "2024-06-20",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 12,
      "sender": "Rina Suryani",
      "date": "2024-06-20",
      "lampiran": "RKA"
    },
    {
      "id": 13,
      "sender": "Eko Prasetyo",
      "date": "2024-06-21",
      "lampiran": "DPA"
    },
    {
      "id": 14,
      "sender": "Eko Prasetyo",
      "date": "2024-06-21",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 15,
      "sender": "Eko Prasetyo",
      "date": "2024-06-21",
      "lampiran": "RKA"
    },
    {
      "id": 16,
      "sender": "Yulianto",
      "date": "2024-06-22",
      "lampiran": "DPA"
    },
    {
      "id": 17,
      "sender": "Yulianto",
      "date": "2024-06-22",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 18,
      "sender": "Yulianto",
      "date": "2024-06-22",
      "lampiran": "RKA"
    },
    {
      "id": 19,
      "sender": "Lina Marlina",
      "date": "2024-06-23",
      "lampiran": "DPA"
    },
    {
      "id": 20,
      "sender": "Lina Marlina",
      "date": "2024-06-23",
      "lampiran": "Anggaran Kas"
    },
    {
      "id": 21,
      "sender": "Budi Santoso",
      "date": "2024-06-24",
      "lampiran": "Proposal Proyek"
    },
    {
      "id": 22,
      "sender": "Budi Santoso",
      "date": "2024-06-25",
      "lampiran": "Laporan Tahunan"
    },
    {
      "id": 23,
      "sender": "Budi Santoso",
      "date": "2024-06-26",
      "lampiran": "Agenda Meeting"
    },
    {
      "id": 24,
      "sender": "Budi Santoso",
      "date": "2024-06-27",
      "lampiran": "Surat Pengajuan"
    }
  ];
  
  

const DokumenMasukDetailDokumen = ({ senderName }: { senderName: string }) => {
    const filteredData = dummyKirimanDokumen.filter(
        (item) => item.sender === senderName
      );
    
      const [currentPage, setCurrentPage] = useState(1);
      const [itemsPerPage, setItemsPerPage] = useState(5);
    
      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
      // Data yang ditampilkan pada halaman saat ini
      const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pt-4 shadow-1 dark:bg-gray-dark dark:shadow-card">

        <div className="py-4">
          {currentData.map((item) => (
            <div
            key={item.id}
            className="flex items-center justify-between border-b py-4 px-4 hover:bg-gray-50 transition"
          >
            {/* Informasi Utama */}
            <div>
              <p className="text-xl text-indigo-600">{item.lampiran}</p>
              <p className="text-sm text-gray-500">{item.date}</p>
            </div>
          
            {/* Lampiran */}
            {/* <div className="text-sm text-indigo-600">{item.lampiran}</div> */}
          
            {/* Tombol Lihat */}
            <div>
              <button
                onClick={() => console.log(`Melihat dokumen ${item.id}`)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Download
              </button>
            </div>
          </div>
          
          ))}
        </div>
        
        {/* Pagination */}
        <div className="my-4 pb-4">
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
  );
};
export default DokumenMasukDetailDokumen;
