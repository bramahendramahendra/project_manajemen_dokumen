"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import { User } from "@/types/user";
import { apiRequest } from "@/helpers/apiClient";
import FormDetailUser from "@/components/userManagement/formDetailUser";

const DetailUserManagement = () => {
  const { userid } = useParams();
  
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "User Management", href: "/user_management" },
    { name: `Detail User` },
  ];
  
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        // Menggunakan userid dari parameter URL untuk mengambil data user
        const response = await apiRequest(`/users/by-userid/${userid}`, "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setUserData(result.responseData);
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchUserDetail();
    }
  }, [userid]);

  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <div className="py-4 text-center text-red-500">{error}</div>
            ) : userData ? (
              <FormDetailUser user={userData} />
            ) : (
              <div className="py-4 text-center text-red-500">
                Data untuk user dengan ID <strong>{userid}</strong> tidak ada.
              </div>
            )}
        </div>
      </div>
    </>
    // </DefaultLayout>
  );
};

export default DetailUserManagement;