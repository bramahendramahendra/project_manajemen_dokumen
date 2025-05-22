"use client";

import Breadcrumb from "@/components/breadcrumbs";
import DokumenMasukDetailDokumen from "@/components/dokumen_masuk/dokumen_masuk_detail";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import { useSearchParams  } from "next/navigation";
import { useState, useEffect } from "react";

const DokumenMasukDetail = () => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dinas, setDinas] = useState<number | null>(null);
  const [namaDinas, setNamaDinas] = useState<string | null>(null);

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

  console.log(namaDinas);
  

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: `Dokumen Masuk dari ${namaDinas}` },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <DokumenMasukDetailDokumen senderNamaDinas={namaDinas}/>
    </DefaultLayout>
  );
};

export default DokumenMasukDetail;
