"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TableDetailUraian from "@/components/uploadDanPengelolaanAdmin/tableDetailUraian";
import { FilterDokumenPerTahun, DokumenPerTahun } from "@/types/detailDokumenTerupload";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";

// Data dokumen per tahun
// const dokumenPerTahun: DokumenPerTahun[] = [
//   { uraian: "DPA", tahun: 2021, data: "DPA APBD" },
//   { uraian: "DPA", tahun: 2022, data: "DPA Pergeseran 1" },
//   { uraian: "DPA", tahun: 2023, data: "Data DPA for 2023" },
//   { uraian: "DPA", tahun: 2024, data: "Data DPA for 2024" },
//   { uraian: "RKA", tahun: 2021, data: "Data RKA for 2021" },
//   { uraian: "RKA", tahun: 2022, data: "Data RKA for 2022" },
//   { uraian: "RKA", tahun: 2023, data: "Data RKA for 2023" },
//   { uraian: "RKA", tahun: 2024, data: "Data RKA for 2024" },
//   { uraian: "Anggaran Kas", tahun: 2021, data: "Data Anggaran Kas for 2021" },
//   { uraian: "Anggaran Kas", tahun: 2021, data: "Data Anggaran Kas for 2021" },
//   { uraian: "Anggaran Kas", tahun: 2022, data: "Data Anggaran Kas for 2022" },
//   { uraian: "Anggaran Kas", tahun: 2023, data: "Data Anggaran Kas for 2023" },
//   { uraian: "Anggaran Kas", tahun: 2024, data: "Data Anggaran Kas for 2024" },
//   { uraian: "Anggaran Kas", tahun: 2025, data: "Data Anggaran Kas for 2021" },
//   { uraian: "Anggaran Kas", tahun: 2026, data: "Data Anggaran Kas for 2021" },
//   { uraian: "Anggaran Kas", tahun: 2027, data: "Data Anggaran Kas for 2022" },
//   { uraian: "Anggaran Kas", tahun: 2028, data: "Data Anggaran Kas for 2023" },
//   { uraian: "Anggaran Kas", tahun: 2028, data: "Data Anggaran Kas for 2024" },
//   { uraian: "Anggaran Kas", tahun: 2029, data: "Data Anggaran Kas for 2021" },
//   { uraian: "Anggaran Kas", tahun: 2030, data: "Data Anggaran Kas for 2021" },
//   { uraian: "Anggaran Kas", tahun: 2031, data: "Data Anggaran Kas for 2022" },
//   { uraian: "Anggaran Kas", tahun: 2032, data: "Data Anggaran Kas for 2023" },
//   { uraian: "Anggaran Kas", tahun: 2033, data: "Data Anggaran Kas for 2024" },
  
// ];

const DetailUraian = () => {
  const searchParams = useSearchParams();

  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeID, setTypeID] = useState<number | null>(null);
  // const [uraian, setUraian] = useState<string | null>(null);

  const [filterList, setFilterList] = useState<FilterDokumenPerTahun[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("");
  const [dataList, setDataList] = useState<DokumenPerTahun[]>([]);

  const key = process.env.NEXT_PUBLIC_APP_KEY;
  const encrypted = searchParams.get(`${key}`);
  const token = Cookies.get("token");


  useEffect(() => {
    const initPage = async () => {
      try {
        if (!encrypted || !token) throw new Error("Token atau data tidak tersedia.");

        const result = decryptObject(encrypted, token);
        if (!result) throw new Error("Gagal dekripsi atau data rusak.");

        const { typeID, uraian } = result;
        setSelectedUraian(uraian);

        // Fetch filter
        const filterResponse = await apiRequest(`/document_managements/filter-data/verif-done/type`, "GET");
        if (!filterResponse.ok) throw new Error("Gagal fetch filter data");
        const filterResult = await filterResponse.json();

        const filters: FilterDokumenPerTahun[] = filterResult.responseData.items.map((item: any) => ({
          typeID: item.type_id,
          uraian: item.jenis,
        }));
        setFilterList(filters);

        // Fetch initial data
        await fetchData(typeID, uraian);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [encrypted, token]);

  // useEffect(() => {
  //   if (!encrypted || !token) {
  //     setError("Token atau data tidak tersedia.");
  //     return;
  //   }
  //   const result = decryptObject(encrypted, token);
  //   if (!result) {
  //     setError("Gagal dekripsi atau data rusak.");
  //     return;
  //   }
  //   const { typeID, uraian} = result;
  //   setTypeID(typeID);
  //   setUraian(uraian);
  // }, [encrypted, token]);

  // useEffect(() => {
  //   const fetchFilter = async () => {
  //     try {
  //       const response = await apiRequest(`/document_managements/filter-data/verif-done/type`, "GET");
  //       if (!response.ok) {
  //         if (response.status === 404) {
  //           throw new Error("Jenis dokumen managemnt data not found");
  //         }
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const result = await response.json();
  //       // setDataDetail(result.responseData);
  //       const datas: FilterDokumenPerTahun[] = result.responseData.items.map((item: any) => ({
  //         typeID: item.type_id,
  //         uraian: item.jenis,  
  //       }));
    
  //       setFilterList(datas);
  //     } catch (err: any) {
  //       setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFilter();
  // }, []);
  // console.log(filterList);
  
  const fetchData = async (typeID: number, uraian: string) => {
    try {
      setLoading(true);
      const dataResponse = await apiRequest(`/document_managements/all-data/verif-done/subtype/${typeID}`, "GET");
      if (!dataResponse.ok) throw new Error("Gagal fetch dokumen data");
      const dataResult = await dataResponse.json();

      const dataList: DokumenPerTahun[] = dataResult.responseData.items.map((item: any) => ({
        id: item.id,
        uraian: uraian,
        tahun: item.tahun,
        data: item.subjenis,
      }));
      setDataList(dataList);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await apiRequest(`/document_managements/all-data/verif-done/subtype/${typeID}`, "GET");
  //       if (!response.ok) {
  //         if (response.status === 404) {
  //           throw new Error("Subjenis dokumen managemnt data not found");
  //         }
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const result = await response.json();
  //       // setDataDetail(result.responseData);
  //       const datas: DokumenPerTahun[] = result.responseData.items.map((item: any) => ({
  //         id: item.id,
  //         data: item.subjenis,
  //         tahun: item.tahun,
  //       }));
    
  //       setDataList(datas);
  //     } catch (err: any) {
  //       setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (typeID) fetchData();
    
  // }, [typeID]);
  // console.log(dataList);

  const handleSelectUraian = (uraian: string) => {
    setSelectedUraian(uraian);

    const selectedFilter = filterList.find((item) => item.uraian === uraian);
    if (selectedFilter) {
      fetchData(selectedFilter.typeID, selectedFilter.uraian);
    }
  };

  
  const { detailUraian } = useParams();

  const detailUraianString = Array.isArray(detailUraian)
    ? decodeURIComponent(detailUraian[0])
    : decodeURIComponent(detailUraian || "");

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Upload & Pengelolaan", href: "/upload_dan_pengelolaan" },
    { name: `Dokumen Terupload` },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          {/* {detailUraianString.length > 0 ? (
            <TableDetailUraian
              dokumenPerTahun={dokumenPerTahun}
              detailUraian={detailUraianString}
            />
          ) : (
            <p>Dokumen tidak ditemukan untuk uraian: {detailUraianString}</p>
          )} */}


          {selectedUraian.length > 0 ? (
            <TableDetailUraian
              dokumenPerTahun={dataList}
              detailUraian={selectedUraian}
              filterList={filterList}
              onSelectUraian={handleSelectUraian}
            />
          ) : (
            <p>Dokumen tidak ditemukan untuk uraian: {selectedUraian}</p>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DetailUraian;
