"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import ValidationUploadTable from "@/components/validationUploadAdmin/validationUploadTable";
import { ValidationUploadUraianAdmin } from "@/types/validationUploadUraian";

const ValidationUploadDetail = () => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [id, setID] = useState<number | null>(null);
  const [skpd, setSkpd] = useState<string | null>(null);
  const [totalPending, setTotalPending] = useState<number | null>(null);
  const [dataDetail, setDataDetail] = useState<ValidationUploadUraianAdmin[]>([]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest(`/document_managements/all-data/verif-pending/subtype/${id}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Jenis data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setDataDetail(result.responseData);
        const formattedData: ValidationUploadUraianAdmin[] = result.responseData.items.map((item: any) => ({
          id: item.id,
          uraian: item.subjenis,
          tanggal: new Date(item.maker_date),
        }));
    
        setDataDetail(formattedData);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Validation Upload", href: "/validation_upload_admin" },
    { name: `${skpd}` },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-left text-red-500">{error}</div>
      ) : dataDetail ? (
        <>
          <h1>Detail Page for {skpd}</h1>
          <p>Belum di validasi: {totalPending}</p>
          <ValidationUploadTable dataDetail={dataDetail} />
        </>
      ) : (
        <div className="text-left text-red-500">
          Data untuk menu dengan skpd <strong>{skpd}</strong> tidak ada.
        </div>
      )}
    </DefaultLayout>
  );
};

export default ValidationUploadDetail;
