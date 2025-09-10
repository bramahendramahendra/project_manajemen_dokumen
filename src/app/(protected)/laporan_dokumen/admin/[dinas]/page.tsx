"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import Breadcrumb from "@/components/breadcrumbs";
import LaporanDokumenDetail from "@/components/laporan_dokumen/admin/detail";


const LaporanDokumenInstansi = () => {
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [id, setID] = useState<number | null>(null);
  const [dinas, setDinas] = useState<string | null>(null);


  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_APP_KEY;
    const encrypted = searchParams.get(`${key}`);
    const user = Cookies.get("user");

    if (!encrypted || !user) {
      setError("Token atau data tidak tersedia.");
      return;
    }
    const result = decryptObject(encrypted, user);
    if (!result) {
      setError("Gagal dekripsi atau data rusak.");
      return;
    }
    const { id, dinas } = result;
    setID(id);
    setDinas(dinas);
  }, []);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Dokumen", href: "/laporan_dokumen" },
    { name: `${dinas}` },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      {error ? (
        <div className="text-left text-red-500">{error}</div>
      ) : (
        <>
          <h1>Detail Page for {dinas}</h1>
          <LaporanDokumenDetail id={id}  />
        </>
      )}
    </>
  );
};

export default LaporanDokumenInstansi;
