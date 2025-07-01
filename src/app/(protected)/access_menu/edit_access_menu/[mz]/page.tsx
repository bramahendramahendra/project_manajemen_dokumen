"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import { AccessMenu } from "@/types/accessMenu";
import FormEditPage from "@/components/accessMenu/formEditPage";

const EditPage = () => {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);
  const [codeMenu, setCodeMenu] = useState<string | null>(null);
  const [dataEdit, setDataEdit] = useState<AccessMenu | null>(null);

  const key = process.env.NEXT_PUBLIC_APP_KEY;
  const encrypted = searchParams.get(`${key}`);
  const user = Cookies.get("user");

  useEffect(() => {
    if (!encrypted || !user) {
      setError("Token atau data tidak tersedia.");
      return;
    }

    const result = decryptObject(encrypted, user);
    // console.log(result);
    
    if (!result) {
      setError("Gagal dekripsi atau data rusak.");
      return;
    }

    const { levelId: decryptedLevelId, codeMenu: decryptedCodeMenu } = result;

    setLevelId(decryptedLevelId);
    setCodeMenu(decryptedCodeMenu);
  }, [encrypted, user]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest(`/access_menus/${levelId}/${codeMenu}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Menu data not found");
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

    if (levelId && codeMenu) fetchData();
  }, [levelId, codeMenu]);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Access Menu", href: "/access_menu" },
    { name: `Edit Access Menu ${levelId}` },
  ];

  return (
    // <DefaultLayout>
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
              Data untuk menu dengan code <strong>{levelId}</strong> tidak ada.
            </div>
          )}
        </div>
      </div>
    </>
    // </DefaultLayout>
  );
};

export default EditPage;
