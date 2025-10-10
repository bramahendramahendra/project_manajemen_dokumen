"use client";
import { useState, useEffect } from "react";
import { useSearchParams  } from "next/navigation";
import Cookies from "js-cookie";
import { decryptObject } from "@/utils/crypto";
import Breadcrumb from "@/components/breadcrumbs";
import LaporanPergeseranInstansiIndex from "@/components/dokumen_pergeseran/detail";

const formatTitle = (text: string) => {
  return text
    .replace(/-/g, " ") // Ganti '-' dengan spasi
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Ubah huruf pertama setiap kata menjadi kapital
};


const LaporanPergeseranInstansi = ({ params }: { params: { namaPergeseran: string } }) => {
  const detailUraianString = formatTitle(params.namaPergeseran || "");

  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idDinas, setIDDinas] = useState<number | null>(null);
  const [namaDinas, setNamaDinas] = useState<string | null>(null);

  // Mendapatkan informasi dinas dari URL parameters
  useEffect(() => {
    try {
      const key = process.env.NEXT_PUBLIC_APP_KEY;
      const user = Cookies.get("user");
      
      if (!key) {
        console.error("NEXT_PUBLIC_APP_KEY tidak ditemukan");
        setError("Konfigurasi aplikasi tidak lengkap");
        setLoading(false);
        return;
      }

      if (!user) {
        console.error("Token user tidak ditemukan");
        setError("Token tidak ditemukan, silakan login ulang");
        setLoading(false);
        return;
      }

      // Cari parameter dengan format $key
      const encryptedParam = searchParams.get(`$${key}`);
      
      if (encryptedParam) {
        try {
          // Dekripsi parameter
          const decrypted = decryptObject(encryptedParam, user);
          if (decrypted && decrypted.nama && decrypted.id) {
            setIDDinas(decrypted.id);
            setNamaDinas(decrypted.nama);
            console.log("Decrypted data:", decrypted);
          } else {
            throw new Error("Data dekripsi tidak valid");
          }
        } catch (decryptError) {
          console.error("Error dekripsi:", decryptError);
          setError("Gagal dekripsi data parameter");
          setLoading(false);
        }
      } else {
        setError("Parameter tidak ditemukan");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing dinas data:", error);
      setError("Terjadi kesalahan dalam memproses data");
      setLoading(false);
    }
  }, [searchParams]);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Pergeseran", href: "/laporan_pergeseran" },
    { name: detailUraianString || "Detail Laporan Pergeseran" },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      {error ? (
        <div className="text-left text-red-500">{error}</div>
      ) : (
        <>
          <LaporanPergeseranInstansiIndex idDinas={idDinas} />
        </>
      )}
    </>
  );
};

export default LaporanPergeseranInstansi;