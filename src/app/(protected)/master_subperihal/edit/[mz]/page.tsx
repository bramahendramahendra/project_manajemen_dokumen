"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";
import Breadcrumb from "@/components/breadcrumbs";
import { Subjenis } from "@/types/subjenis";
import FormEditPage from "@/components/masterSubperihal/formEditPage";

const EditPage = () => {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [id, setID] = useState<number | null>(null);
  const [subperihal, setSubperihal] = useState<string | null>(null);
  const [dataEdit, setDataEdit] = useState<Subjenis | null>(null);

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

    const { id: decryptedID, subperihal: decryptedSubperihal } = result;
   
    setID(decryptedID);
    setSubperihal(decryptedSubperihal);
  }, [encrypted, user]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest(`/master_subperihal/${id}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Subperihal data not found");
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
    { name: "Setting Subperihal", href: "/master_subperihal" },
    { name: `Edit Subperihal ${subperihal}` },
  ];

  return (
    <>
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
              Data untuk menu dengan subperihal <strong>{subperihal}</strong> tidak ada.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditPage;
