"use client";
import { useState, useEffect  } from "react";
import { apiRequest } from "@/helpers/apiClient";
import { LaporanUserManagement } from "@/types/laporanUserManagement";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TablePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [dataList, setDataList] = useState<LaporanUserManagement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/reports/user-management", "GET");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User data not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        const users: LaporanUserManagement[] = result.responseData.items.map((item: any) => ({
          userid: item.userid,
          name: item.name,
          skpd: item.skpd,
          notelp: item.phone_number,
          email: item.email,
          createdDate: item.tanggal,
          keterangan: item.role,
        }));

        setDataList(users);
      } catch (err: any) {
        setError(
          err.message === "Failed to fetch"
            ? "Data tidak ditemukan"
            : err.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk format nomor telepon ke format WhatsApp
  const formatPhoneForWhatsApp = (phoneNumber: string): string => {
    if (!phoneNumber) return "";
    
    // Hilangkan karakter non-digit
    let cleanNumber = phoneNumber.replace(/\D/g, "");
    
    // Jika dimulai dengan 0, ganti dengan 62
    if (cleanNumber.startsWith("0")) {
      cleanNumber = "62" + cleanNumber.substring(1);
    }
    // Jika tidak dimulai dengan 62, tambahkan 62
    else if (!cleanNumber.startsWith("62")) {
      cleanNumber = "62" + cleanNumber;
    }
    
    return cleanNumber;
  };

  // Fungsi untuk membuat link WhatsApp
  const createWhatsAppLink = (phoneNumber: string): string => {
    const formattedNumber = formatPhoneForWhatsApp(phoneNumber);
    return `https://api.whatsapp.com/send?phone=${formattedNumber}`;
  };

  const handlePrint = () => {
    const doc = new jsPDF("p", "pt");
    const headers = [["User", "SKPD", "Tanggal", "No HP", "Email", "Keterangan"]];
  
    const data = dataList.map(item => [
      item.name ?? "-",
      item.skpd ?? "-",
      item.createdDate ?? "-",
      item.notelp ?? "-",
      item.email ?? "-",
      item.keterangan ?? "-",
    ]);
  
    autoTable(doc, {
      head: headers,
      body: data,
      margin: { top: 50 },
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [12, 71, 159] },
    });
  
    doc.save("laporan-user-management.pdf");
  };

  return (
    <>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">Data berhasil dihapus!</p>}  
        
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="space-y-4">
            {/* Header Section */}

            {/* Table Rows Styled as Cards */}
            {dataList.map((userItem, index) => (
              <div key={index} className="rounded-lg border border-gray-300 p-4">
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-1">
                    <strong>User</strong>
                    <p>{userItem.name ?? "-"}</p>
                  </div>
                  <div className="col-span-1">
                    <strong>SKPD</strong>
                    <p>{userItem.skpd ?? "-"}</p>
                  </div>
                  <div className="col-span-1">
                    <strong>Tanggal</strong>
                    <p>{userItem.createdDate ?? "-"}</p>
                  </div>
                  <div className="col-span-1">
                    <strong>No HP</strong>
                    {userItem.notelp && userItem.notelp !== "-" ? (
                      <a
                        href={createWhatsAppLink(userItem.notelp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-[#0C479F] hover:underline transition-colors duration-200"
                      >
                        <span>{userItem.notelp}</span>
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                  <div className="col-span-1">
                    <strong>Email</strong>
                    <p>{userItem.email ?? "-"}</p>
                  </div>
                  <div className="col-span-1">
                    <strong>Keterangan</strong>
                    <p>{userItem.keterangan ?? "-"}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Print Button */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cetak
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TablePage;