"use client";
import Pagination from "../pagination/Pagination";
import { apiRequest } from "@/helpers/apiClient";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";

// Data Dinas yang berhubungan dengan Data Kiriman
type DataDinas = {
  id: number;
  nama: string;
  namaDinas: string;
  notificationCount: number;
};

const dataDinas: DataDinas[] = [
  { id: 1, nama: "Andi Wijaya", namaDinas: "Dinas Pendidikan Pemuda dan Olahraga", notificationCount: 5 },
  { id: 2, nama: "Rina Suryani", namaDinas: "Dinas Kesehatan", notificationCount: 3 },
  { id: 3, nama: "Dewi Lestari", namaDinas: "Dinas Lingkungan Hidup", notificationCount: 0 },
  { id: 4, nama: "Budi Santoso", namaDinas: "Dinas Perhubungan", notificationCount: 8 },
  { id: 5, nama: "Siti Aminah", namaDinas: "Dinas Sosial", notificationCount: 2 },
  { id: 6, nama: "Eko Prasetyo", namaDinas: "Dinas Pekerjaan Umum", notificationCount: 0 },
  { id: 7, nama: "Yulianto", namaDinas: "Dinas Kebudayaan dan Pariwisata", notificationCount: 1 },
  { id: 8, nama: "Lina Marlina", namaDinas: "Dinas Perindustrian dan Perdagangan", notificationCount: 4 },
  { id: 9, nama: "Agus Saputra", namaDinas: "Dinas Ketahanan Pangan", notificationCount: 7 },
  { id: 10, nama: "Ratna Dewi", namaDinas: "Dinas Kependudukan dan Pencatatan Sipil", notificationCount: 0 },
  { id: 11, nama: "Joko Pranoto", namaDinas: "Dinas Tenaga Kerja", notificationCount: 9 },
  { id: 12, nama: "Maria Lestari", namaDinas: "Dinas Pariwisata dan Ekonomi Kreatif", notificationCount: 2 }
];

// Menambahkan properti messageTitle dan messageContent ke data dummy
const dummyKirimanDokumen = [
  {
    "id": 1,
    "sender": "Andi Wijaya",
    "senderDinas": "Dinas Pendidikan Pemuda dan Olahraga",
    "date": "2024-06-17",
    "lampiran": "DPA",
    "messageTitle": "Pengiriman DPA Terbaru",
    "messageContent": "Dengan hormat, bersama ini saya lampirkan dokumen DPA terbaru yang telah direvisi sesuai dengan permintaan. Mohon ditinjau kembali."
  },
  {
    "id": 2,
    "sender": "Andi Wijaya",
    "senderDinas": "Dinas Pendidikan Pemuda dan Olahraga",
    "date": "2024-06-17",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Dokumen Anggaran Kas",
    "messageContent": "Berikut saya kirimkan dokumen anggaran kas periode Juli-Desember 2024 untuk direview. Mohon masukan dan persetujuannya."
  },
  {
    "id": 3,
    "sender": "Andi Wijaya",
    "senderDinas": "Dinas Pendidikan Pemuda dan Olahraga",
    "date": "2024-06-17",
    "lampiran": "RKA",
    "messageTitle": "RKA Tahun Anggaran 2024",
    "messageContent": "Terlampir RKA tahun anggaran 2024 yang sudah disesuaikan dengan kebijakan terbaru. Mohon ditinjau dan disetujui."
  },
  {
    "id": 4,
    "sender": "Dewi Lestari",
    "senderDinas": "Dinas Lingkungan Hidup",
    "date": "2024-06-18",
    "lampiran": "DPA",
    "messageTitle": "Pengajuan DPA Dinas Lingkungan Hidup",
    "messageContent": "Dengan ini kami sampaikan dokumen DPA Dinas Lingkungan Hidup untuk tahun anggaran 2024 untuk mendapatkan persetujuan."
  },
  {
    "id": 5,
    "sender": "Dewi Lestari",
    "senderDinas": "Dinas Lingkungan Hidup",
    "date": "2024-06-18",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Revisi Anggaran Kas",
    "messageContent": "Berikut revisi anggaran kas sesuai dengan hasil rapat koordinasi tanggal 15 Juni 2024. Mohon untuk ditinjau kembali."
  },
  {
    "id": 6,
    "sender": "Dewi Lestari",
    "senderDinas": "Dinas Lingkungan Hidup",
    "date": "2024-06-18",
    "lampiran": "RKA",
    "messageTitle": "Dokumen RKA Terbaru",
    "messageContent": "Terlampir dokumen RKA terbaru yang telah diperbaharui sesuai masukan dari tim keuangan."
  },
  {
    "id": 7,
    "sender": "Rina Suryani",
    "senderDinas": "Dinas Kesehatan",
    "date": "2024-06-19",
    "lampiran": "DPA",
    "messageTitle": "DPA Dinas Kesehatan",
    "messageContent": "Bersama ini kami kirimkan dokumen DPA Dinas Kesehatan untuk direview dan disetujui."
  },
  {
    "id": 8,
    "sender": "Rina Suryani",
    "senderDinas": "Dinas Kesehatan",
    "date": "2024-06-19",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Penyesuaian Anggaran Kas",
    "messageContent": "Berikut penyesuaian anggaran kas setelah adanya realokasi anggaran. Mohon untuk diperiksa dan disetujui."
  },
  {
    "id": 9,
    "sender": "Rina Suryani",
    "senderDinas": "Dinas Kesehatan",
    "date": "2024-06-19",
    "lampiran": "RKA",
    "messageTitle": "Pengiriman RKA",
    "messageContent": "Terlampir dokumen RKA untuk program pengembangan kurikulum. Mohon untuk direview."
  },
  {
    "id": 10,
    "sender": "Budi Santoso",
    "senderDinas": "Dinas Perhubungan",
    "date": "2024-06-20",
    "lampiran": "DPA",
    "messageTitle": "DPA Dinas Perhubungan",
    "messageContent": "Dengan hormat, bersama ini saya lampirkan DPA Dinas Perhubungan untuk tahun anggaran 2024."
  },
  {
    "id": 11,
    "sender": "Budi Santoso",
    "senderDinas": "Dinas Perhubungan",
    "date": "2024-06-20",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Anggaran Kas Triwulan III",
    "messageContent": "Bersama ini disampaikan dokumen anggaran kas untuk triwulan III tahun 2024."
  },
  {
    "id": 12,
    "sender": "Budi Santoso",
    "senderDinas": "Dinas Perhubungan",
    "date": "2024-06-20",
    "lampiran": "RKA",
    "messageTitle": "Pengiriman RKA Terbaru",
    "messageContent": "Terlampir RKA terbaru yang sudah disesuaikan dengan perubahan APBD."
  },
  {
    "id": 13,
    "sender": "Eko Prasetyo",
    "senderDinas": "Dinas Pekerjaan Umum",
    "date": "2024-06-21",
    "lampiran": "DPA",
    "messageTitle": "DPA Dinas Pekerjaan Umum",
    "messageContent": "Bersama ini kami kirimkan DPA Dinas Pekerjaan Umum tahun anggaran 2024."
  },
  {
    "id": 14,
    "sender": "Eko Prasetyo",
    "senderDinas": "Dinas Pekerjaan Umum",
    "date": "2024-06-21",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Anggaran Kas Semester II",
    "messageContent": "Terlampir dokumen anggaran kas semester II tahun 2024 untuk direview dan disetujui."
  },
  {
    "id": 15,
    "sender": "Eko Prasetyo",
    "senderDinas": "Dinas Pekerjaan Umum",
    "date": "2024-06-21",
    "lampiran": "RKA",
    "messageTitle": "RKA Proyek Infrastruktur",
    "messageContent": "Berikut RKA untuk proyek infrastruktur jalan dan jembatan tahun anggaran 2024."
  },
  {
    "id": 16,
    "sender": "Yulianto",
    "senderDinas": "Dinas Kebudayaan dan Pariwisata",
    "date": "2024-06-22",
    "lampiran": "DPA",
    "messageTitle": "DPA Dinas Kebudayaan",
    "messageContent": "Dengan hormat, terlampir DPA Dinas Kebudayaan untuk tahun anggaran 2024."
  },
  {
    "id": 17,
    "sender": "Yulianto",
    "senderDinas": "Dinas Kebudayaan dan Pariwisata",
    "date": "2024-06-22",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Revisi Anggaran Kas Festival",
    "messageContent": "Berikut revisi anggaran kas untuk kegiatan festival budaya tahunan."
  },
  {
    "id": 18,
    "sender": "Yulianto",
    "senderDinas": "Dinas Kebudayaan dan Pariwisata",
    "date": "2024-06-22",
    "lampiran": "RKA",
    "messageTitle": "RKA Program Pelestarian Budaya",
    "messageContent": "Terlampir RKA untuk program pelestarian budaya tahun 2024."
  },
  {
    "id": 19,
    "sender": "Lina Marlina",
    "senderDinas": "Dinas Perindustrian dan Perdagangan",
    "date": "2024-06-23",
    "lampiran": "DPA",
    "messageTitle": "DPA Dinas Perindustrian",
    "messageContent": "Bersama ini disampaikan DPA Dinas Perindustrian tahun anggaran 2024."
  },
  {
    "id": 20,
    "sender": "Lina Marlina",
    "senderDinas": "Dinas Perindustrian dan Perdagangan",
    "date": "2024-06-23",
    "lampiran": "Anggaran Kas",
    "messageTitle": "Anggaran Kas Program UMKM",
    "messageContent": "Terlampir anggaran kas untuk program pengembangan UMKM tahun 2024."
  },
  {
    "id": 21,
    "sender": "Agus Saputra",
    "senderDinas": "Dinas Ketahanan Pangan",
    "date": "2024-06-24",
    "lampiran": "Proposal Proyek",
    "messageTitle": "Proposal Proyek Pengembangan",
    "messageContent": "Dengan ini saya lampirkan proposal proyek pengembangan infrastruktur untuk tahun 2025."
  },
  {
    "id": 22,
    "sender": "Agus Saputra",
    "senderDinas": "Dinas Ketahanan Pangan",
    "date": "2024-06-25",
    "lampiran": "Laporan Tahunan",
    "messageTitle": "Laporan Tahunan 2023",
    "messageContent": "Bersama ini saya kirimkan laporan tahunan 2023 yang sudah difinalisasi."
  },
  {
    "id": 23,
    "sender": "Ratna Dewi",
    "senderDinas": "Dinas Kependudukan dan Pencatatan Sipil",
    "date": "2024-06-26",
    "lampiran": "Agenda Meeting",
    "messageTitle": "Agenda Rapat Koordinasi",
    "messageContent": "Terlampir agenda rapat koordinasi antar dinas yang akan dilaksanakan pada tanggal 5 Juli 2024."
  },
  {
    "id": 24,
    "sender": "Joko Pranoto",
    "senderDinas": "dinas kesehatan",
    "date": "2024-06-27",
    "lampiran": "Surat Pengajuan",
    "messageTitle": "Surat Pengajuan Dana Tambahan",
    "messageContent": "Dengan hormat, bersama ini saya lampirkan surat pengajuan dana tambahan untuk program prioritas tahun 2024."
  }
  ];
  
  

const DokumenMasukDetailDokumen = ({ senderNamaDinas }: { senderNamaDinas: string | null }) => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  
  
  // Filter berdasarkan nama dinas
    const filteredData = dummyKirimanDokumen.filter(
      (item) => item.senderDinas === senderNamaDinas
    );
  
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
  
    // State untuk modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<{
      title: string;
      content: string;
    } | null>(null);

    const [dinas, setDinas] = useState<number | null>(null);
    const [namaDinas, setNamaDinas] = useState<string | null>(null);
  
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
    // Data yang ditampilkan pada halaman saat ini
    const currentData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const encrypted = searchParams.get(`${key}`);
    const user = Cookies.get("user");

      useEffect(() => {
        if (!encrypted || !user) {
          setError("Token atau data tidak tersedia.");
          return;
        }
        const result = decryptObject(encrypted, user);
        if (!result) {
          setError("Gagal dekripsi atau data rusak.");
          return;
        }
        const { dinas, nama_dinas } = result;
        setDinas(dinas);
        setNamaDinas(nama_dinas);
        // setTotalPending(total);
      }, [encrypted, user]);

      useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await apiRequest(`/kotak_masuk/all-dinas/${dinas}`, "GET");
            if (!response.ok) {
              if (response.status === 404) {
                throw new Error("Jenis data not found");
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            // console.log(result);
            
            // setDataDetail(result.responseData);
            // const formattedData: ValidationUploadUraianAdmin[] = result.responseData.items.map((item: any) => ({
            //   id: item.id,
            //   uraian: item.subjenis,
            //   tanggal: new Date(item.maker_date),
            // }));
        
            // setDataDetail(formattedData);
          } catch (err: any) {
            setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
          } finally {
            setLoading(false);
          }
        };

        if (dinas) fetchData();
      }, [dinas]);
      
      // Fungsi untuk membuka modal pesan
      const openMessageModal = (title: string, content: string) => {
        setSelectedMessage({ title, content });
        setIsModalOpen(true);
      };
      
      // Fungsi untuk menutup modal
      const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMessage(null);
      };

  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-xl bg-white px-8 pt-6 pb-4 shadow-md dark:bg-gray-dark">
        {/* Header dengan nama dinas */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{senderNamaDinas}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Dokumen Masuk: <span className="font-medium text-blue-600">{filteredData.length}</span> item
            </p>
          </div>
          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Dinas
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-5 hover:bg-gray-50 transition rounded-lg px-4"
              >
                {/* Informasi Utama */}
                <div>
                  <p className="text-xl font-medium text-blue-600">{item.lampiran}</p>
                  <div className="flex items-center mt-1">
                    <div className="h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 mr-3">{item.sender}</span>
                    
                    <div className="h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">{item.date}</span>
                  </div>
                </div>
              
                {/* Tombol Aksi */}
                <div className="flex space-x-3">
                  {/* Tombol Isi Pesan */}
                  <button
                    onClick={() => openMessageModal(item.messageTitle, item.messageContent)}
                    className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                      Isi Pesan
                    </div>
                  </button>
                  
                  {/* Tombol Download */}
                  <button
                    onClick={() => console.log(`Melihat dokumen ${item.id}`)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </div>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="h-16 w-16 text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Tidak ada dokumen dari dinas ini</p>
              <p className="text-gray-400 text-sm mt-1">Dokumen akan muncul saat dinas mengirimkan dokumen</p>
            </div>
          )}
        </div>
        
        {/* Pagination - hanya tampil jika ada data */}
        {currentData.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
        
        {/* Modal Isi Pesan */}
        {isModalOpen && selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
              {/* Header Modal */}
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Detail Pesan</h3>
                <button
                  onClick={closeModal}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              
              {/* Konten Modal */}
              <div className="rounded-lg bg-blue-50 p-4 mb-5">
                <h4 className="mb-3 text-lg font-semibold text-blue-700">
                  {selectedMessage.title}
                </h4>
                <p className="text-gray-700 leading-relaxed">{selectedMessage.content}</p>
              </div>
              
              {/* Footer Modal */}
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DokumenMasukDetailDokumen;