"use client";
import { useParams } from "next/navigation";
import TableDetailUraianLaporan from "./tableDetailUraianLaporan";

interface DokumenPerTahun {
  uraian: string;
  tahun: number;
  data: string;
}

const dokumenPerTahun: DokumenPerTahun[] = [
  { uraian: "DPA", tahun: 2023, data: "Data DPA for 2023" },
  { uraian: "RKA", tahun: 2021, data: "Data RKA for 2021" },
  { uraian: "Anggaran Kas", tahun: 2024, data: "Data Anggaran Kas for 2024" },
  {
    uraian: "Laporan Realisasi",
    tahun: 2022,
    data: "Data Laporan Realisasi for 2022",
  },
  { uraian: "Nota Keuangan", tahun: 2023, data: "Data Nota Keuangan for 2023" },
  {
    uraian: "Rencana Anggaran Biaya",
    tahun: 2024,
    data: "Data Rencana Anggaran Biaya for 2024",
  },
  {
    uraian: "Surat Pertanggungjawaban",
    tahun: 2021,
    data: "Data Surat Pertanggungjawaban for 2021",
  },
  {
    uraian: "Dokumen Pendukung",
    tahun: 2022,
    data: "Data Dokumen Pendukung for 2022",
  },
  { uraian: "DPA", tahun: 2024, data: "Data DPA for 2024" },
  { uraian: "RKA", tahun: 2022, data: "Data RKA for 2022" },
  { uraian: "Anggaran Kas", tahun: 2023, data: "Data Anggaran Kas for 2023" },
  {
    uraian: "Laporan Realisasi",
    tahun: 2021,
    data: "Data Laporan Realisasi for 2021",
  },
  { uraian: "Nota Keuangan", tahun: 2024, data: "Data Nota Keuangan for 2024" },
  {
    uraian: "Rencana Anggaran Biaya",
    tahun: 2022,
    data: "Data Rencana Anggaran Biaya for 2022",
  },
  {
    uraian: "Surat Pertanggungjawaban",
    tahun: 2023,
    data: "Data Surat Pertanggungjawaban for 2023",
  },
  {
    uraian: "Dokumen Pendukung",
    tahun: 2021,
    data: "Data Dokumen Pendukung for 2021",
  },
  { uraian: "DPA", tahun: 2021, data: "Data DPA for 2021" },
  { uraian: "RKA", tahun: 2024, data: "Data RKA for 2024" },
  { uraian: "Anggaran Kas", tahun: 2022, data: "Data Anggaran Kas for 2022" },
  {
    uraian: "Laporan Realisasi",
    tahun: 2023,
    data: "Data Laporan Realisasi for 2023",
  },
  { uraian: "Nota Keuangan", tahun: 2021, data: "Data Nota Keuangan for 2021" },
  {
    uraian: "Rencana Anggaran Biaya",
    tahun: 2023,
    data: "Data Rencana Anggaran Biaya for 2023",
  },
  {
    uraian: "Surat Pertanggungjawaban",
    tahun: 2024,
    data: "Data Surat Pertanggungjawaban for 2024",
  },
  {
    uraian: "Dokumen Pendukung",
    tahun: 2023,
    data: "Data Dokumen Pendukung for 2023",
  },
  {
    uraian: "Dokumen Pendukung",
    tahun: 2025,
    data: "Data Dokumen Pendukung for 2025",
  }
];

const index = () => {
  const params = useParams();

  const detailUraian = params?.detailUraian;
  const detailUraianString = Array.isArray(detailUraian)
    ? decodeURIComponent(detailUraian[0])
    : decodeURIComponent(detailUraian || "");

  

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
      <div className="col-span-12 xl:col-span-12">
        <TableDetailUraianLaporan dokumenPerTahun={dokumenPerTahun} />
      </div>
    </div>
  );
};


export default index;
