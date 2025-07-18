"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";
// import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import { Jenis } from "@/types/jenis";
import FormEditPage from "@/components/masterDinas/formEditPage";

const EditPage = () => {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [id, setID] = useState<number | null>(null);
  const [dinas, setDinas] = useState<string | null>(null);
  const [dataEdit, setDataEdit] = useState<Jenis | null>(null);

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

    const { id: decryptedID, dinas: decryptedDinas } = result;
   
    setID(decryptedID);
    setDinas(decryptedDinas);
  }, [encrypted, user]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest(`/master_dinas/${id}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Dinas data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setDataEdit(result.responseData);
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
    { name: "Master Dinas", href: "/master_dinas" },
    { name: `Edit Dinas ${dinas}` },
  ];

  return (
    <>
    {/* // <DefaultLayout> */}
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="text-left text-red-500">{error}</div>
          ) : dataEdit ? (
            <FormEditPage dataEdit={dataEdit} />
          ) : (
            <div className="text-left text-red-500">
              Data untuk menu dengan dinas <strong>{dinas}</strong> tidak ada.
            </div>
          )}
        </div>
      </div>
      {/* </DefaultLayout> */}
    </>
  );
};

export default EditPage;
