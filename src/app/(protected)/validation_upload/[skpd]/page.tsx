"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import Breadcrumb from "@/components/breadcrumbs";
import ValidationUploadTable from "@/components/validationUpload/validationUploadTable";

const ValidationUploadDetail = () => {
  const searchParams = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [id, setID] = useState<number | null>(null);
  const [skpd, setSkpd] = useState<string | null>(null);
  const [totalPending, setTotalPending] = useState<number | null>(null);

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
    const { id, skpd, total } = result;
    setID(id);
    setSkpd(skpd);
    setTotalPending(total);
  }, [encrypted, user]);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Validation Upload", href: "/validation_upload" },
    { name: `${skpd}` },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />

      {error ? (
        <div className="text-left text-red-500">{error}</div>
      ) : (
        <>
          <h1>Detail Page for {skpd}</h1>
          <p>Belum di validasi: {totalPending}</p>
          <ValidationUploadTable id={id} />
        </>
      )}
    </>
  );
};

export default ValidationUploadDetail;