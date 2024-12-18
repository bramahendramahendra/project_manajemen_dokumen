"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TableDetailUraian from "@/components/uploadDanPengelolaan/tableDetailUraian";
import { DokumenPerTahun } from "@/types/detailDokumenTerupload";
import { useParams } from "next/navigation";

// Data dokumen per tahun
const dokumenPerTahun: DokumenPerTahun[] = [
  { uraian: "DPA", tahun: 2021, data: "DPA APBD" },
  { uraian: "DPA", tahun: 2022, data: "DPA Pergeseran 1" },
  { uraian: "DPA", tahun: 2023, data: "Data DPA for 2023" },
  { uraian: "DPA", tahun: 2024, data: "Data DPA for 2024" },
  { uraian: "RKA", tahun: 2021, data: "Data RKA for 2021" },
  { uraian: "RKA", tahun: 2022, data: "Data RKA for 2022" },
  { uraian: "RKA", tahun: 2023, data: "Data RKA for 2023" },
  { uraian: "RKA", tahun: 2024, data: "Data RKA for 2024" },
  { uraian: "Anggaran Kas", tahun: 2021, data: "Data Anggaran Kas for 2021" },
  { uraian: "Anggaran Kas", tahun: 2021, data: "Data Anggaran Kas for 2021" },
  { uraian: "Anggaran Kas", tahun: 2022, data: "Data Anggaran Kas for 2022" },
  { uraian: "Anggaran Kas", tahun: 2023, data: "Data Anggaran Kas for 2023" },
  { uraian: "Anggaran Kas", tahun: 2024, data: "Data Anggaran Kas for 2024" },
  { uraian: "Anggaran Kas", tahun: 2025, data: "Data Anggaran Kas for 2021" },
  { uraian: "Anggaran Kas", tahun: 2026, data: "Data Anggaran Kas for 2021" },
  { uraian: "Anggaran Kas", tahun: 2027, data: "Data Anggaran Kas for 2022" },
  { uraian: "Anggaran Kas", tahun: 2028, data: "Data Anggaran Kas for 2023" },
  { uraian: "Anggaran Kas", tahun: 2028, data: "Data Anggaran Kas for 2024" },
  { uraian: "Anggaran Kas", tahun: 2029, data: "Data Anggaran Kas for 2021" },
  { uraian: "Anggaran Kas", tahun: 2030, data: "Data Anggaran Kas for 2021" },
  { uraian: "Anggaran Kas", tahun: 2031, data: "Data Anggaran Kas for 2022" },
  { uraian: "Anggaran Kas", tahun: 2032, data: "Data Anggaran Kas for 2023" },
  { uraian: "Anggaran Kas", tahun: 2033, data: "Data Anggaran Kas for 2024" },
  
];

const DetailUraian = () => {
  const { detailUraian } = useParams();

  const detailUraianString = Array.isArray(detailUraian)
    ? decodeURIComponent(detailUraian[0])
    : decodeURIComponent(detailUraian || "");

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Upload & Pengelolaan", href: "/upload_dan_pengelolaan" },
    { name: `Dokumen Terupload` },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          {detailUraianString.length > 0 ? (
            <TableDetailUraian
              dokumenPerTahun={dokumenPerTahun}
              detailUraian={detailUraianString}
            />
          ) : (
            <p>Dokumen tidak ditemukan untuk uraian: {detailUraianString}</p>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DetailUraian;
