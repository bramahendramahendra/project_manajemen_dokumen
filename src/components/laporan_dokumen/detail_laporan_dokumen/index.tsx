"use client";
import { useParams, useSearchParams } from "next/navigation";
import TableDetailUraianLaporan from "./tableDetailUraianLaporan";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
import { decryptObject } from "@/utils/crypto";
import { useState, useEffect } from "react";

interface FilterDokumenPerTahun {
  // dinasID: number;
  typeID: number;
  uraian: string;
}
interface DokumenPerTahun {
  id: number;
  uraian: string;
  tahun: number;
  data: string;
}

const Index = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterList, setFilterList] = useState<FilterDokumenPerTahun[]>([]);
  const [selectedUraian, setSelectedUraian] = useState<string>("");
  const [dataList, setDataList] = useState<DokumenPerTahun[]>([]);

  const key = process.env.NEXT_PUBLIC_APP_KEY;
  const encrypted = searchParams.get(`${key}`);
  const user = Cookies.get("user");

  useEffect(() => {
    const initPage = async () => {
      try {
        if (!encrypted || !user) throw new Error("Token atau data tidak tersedia.");

        const result = decryptObject(encrypted, user);
        if (!result) throw new Error("Gagal dekripsi atau data rusak.");

        const { id: dinasID, nama: namaDinas  } = result;
        // setSelectedUraian(nama);

        // Fetch filter
        const filterResponse = await apiRequest(`/reports/document/filter/${dinasID}`, "GET");
        if (!filterResponse.ok) throw new Error("Gagal fetch filter data");
        const filterResult = await filterResponse.json();

        const filters: FilterDokumenPerTahun[] = filterResult.responseData.items.map((item: any) => ({
          typeID: item.type_id,
          uraian: item.jenis,
        }));
        
        const allFilter = [{ typeID: 0, uraian: "Semua" }, ...filters];
        setFilterList(allFilter);
        setSelectedUraian("Semua"); // <--- tambahkan ini
        await fetchData(dinasID, 0);
        // await fetchAllData(dinasID);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [encrypted, user]);

  const fetchData = async (dinasID: number, typeID: number) => {
    try {
      setLoading(true);

      const query = typeID === 0 
        ? `/reports/document/subtype-by-dinas/${dinasID}` 
        : `/reports/document/subtype-by-jenis/${dinasID}/${typeID}`;


      const dataResponse = await apiRequest(query, "GET");
      if (!dataResponse.ok) throw new Error("Gagal fetch dokumen data");
      const dataResult = await dataResponse.json();

      const datas: DokumenPerTahun[] = dataResult.responseData.items.map((item: any) => ({
        id: item.id,
        // uraian: item.jenis,
        uraian: item.uraian,
        tahun: item.tahun,
        data: item.subjenis,
      }));

      // console.log(datas);
      
      setDataList(datas);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUraian = async (uraian: string) => {
    setSelectedUraian(uraian);

    const selectedFilter = filterList.find((item) => item.uraian === uraian);
    const result = decryptObject(encrypted!, user!);
    if (!result) throw new Error("Gagal dekripsi atau data rusak.");
    const idDinas = result.id;

    if (selectedFilter) {
      await fetchData(idDinas, selectedFilter.typeID);
    }
  };

  const detailUraian = params?.detailUraian;
  const detailUraianString = Array.isArray(detailUraian)
    ? decodeURIComponent(detailUraian[0])
    : decodeURIComponent(detailUraian || "");


  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
      <div className="col-span-12 xl:col-span-12">
        <TableDetailUraianLaporan 
          dokumenPerTahun={dataList} 
          detailUraian={selectedUraian}
          filterList={filterList}
          onSelectUraian={handleSelectUraian}
        />
      </div>
    </div>
  );
};


export default Index;
