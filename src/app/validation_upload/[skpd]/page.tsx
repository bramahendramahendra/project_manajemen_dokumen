"use client";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import ValidationUploadTable from "@/components/validationUpload/validationUploadTable";

interface Props {
  params: {
    skpd: string;
  };
}

const validationUpload = [
  { skpd: "Dinas Pendidikan", belumValidasi: 1 },
  { skpd: "Dinas Kesehatan", belumValidasi: 3 },
  { skpd: "Dinas Pertanian", belumValidasi: 5 },
  { skpd: "Dinas Kelautan", belumValidasi: 0 },
  { skpd: "Dinas Kesejahteraan", belumValidasi: 1 },
  { skpd: "Dinas Politik", belumValidasi: 4 },
  { skpd: "Dinas Pertahanan", belumValidasi: 1 },
  { skpd: "Dinas Keuangan", belumValidasi: 5 },
];

const decodeSkpdFromUrl = (skpd: string) => {
  return skpd.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const ValidationUploadDetail = ({ params }: Props) => {
  const skpd = decodeSkpdFromUrl(params.skpd);
  const foundSkpd = validationUpload.find((item) => item.skpd === skpd);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Validation Upload", href: "/validation_upload" },
    { name: skpd },
  ];

  if (!foundSkpd) {
    return (
      <DefaultLayout>
        <h1>Error 404: SKPD &quot;{skpd}&quot; Data tidak ditemukan</h1>
        <p>Data ini tidak ada</p>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <h1>Detail Page for {skpd}</h1>
      <p>Belum di validasi: {foundSkpd.belumValidasi}</p>
      <ValidationUploadTable />
    </DefaultLayout>
  );
};

export default ValidationUploadDetail;
