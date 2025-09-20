"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/breadcrumbs";
import PerbaikanDokumen from "@/components/daftarUpload/perbaikan";
import { decryptObject } from "@/utils/crypto";
import Cookies from "js-cookie";
import { useSearchParams  } from "next/navigation";

const PerbaikiDokumenPage = () => {
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  
  const [id, setID] = useState<number | null>(null);


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
  
      const { id: decryptedID } = result;
     
      setID(decryptedID);
    }, [encrypted, user]);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Daftar Upload", href: "/daftar_upload" },
    { name: "Perbaiki Dokumen" },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {error ? (
          <div className="text-left text-red-500">{error}</div>
        ) : id ? (
          <PerbaikanDokumen documentId={id} />
        ) : (
          <div className="text-left text-red-500">
            Data untuk form perbaikan <strong>{id}</strong> tidak ada.
          </div>
        )}
      </div>
    </>
  );
};

export default PerbaikiDokumenPage;