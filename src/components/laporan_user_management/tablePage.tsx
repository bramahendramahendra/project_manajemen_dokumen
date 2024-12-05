import { LaporanUserManagement } from "@/types/laporanUserManagement";

const userData: LaporanUserManagement[] = [
  {
    userid: "M00001",
    name: "Agus Santoso",
    skpd: "Dinas Kesehatan",
    notelp: "0812345678",
    email: "agus.santoso@gmail.com",
    createdDate: "25/09/2024",
    keterangan: "Dinas",
  },
  {
    userid: "M00002",
    name: "Budi Raharjo",
    skpd: "Dinas Perhubungan",
    notelp: "0856781234",
    email: "budi.raharjo@gmail.com",
    createdDate: "26/09/2024",
    keterangan: "Operator",
  },
  {
    userid: "M00003",
    name: "Citra Maharani",
    skpd: "Dinas Pendidikan",
    notelp: "0891234567",
    email: "citra.maharani@gmail.com",
    createdDate: "27/09/2024",
    keterangan: "Admin",
  },
  {
    userid: "M00004",
    name: "Dewi Kusuma",
    skpd: "Dinas Sosial",
    notelp: "0823456789",
    email: "dewi.kusuma@gmail.com",
    createdDate: "28/09/2024",
    keterangan: "Dinas",
  },
  {
    userid: "M00005",
    name: "Eko Supriyanto",
    skpd: "Dinas Pertanian",
    notelp: "0876543210",
    email: "eko.supriyanto@gmail.com",
    createdDate: "29/09/2024",
    keterangan: "Operator",
  },
];

const TablePage = () => {
  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="space-y-4">
          {/* Header Section */}

          {/* Table Rows Styled as Cards */}
          {userData.map((userItem, index) => (
            <div key={index} className="rounded-lg border border-gray-300 p-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                  <strong>User</strong>
                  <p>{userItem.name}</p>
                </div>
                <div className="col-span-1">
                  <strong>SKPD</strong>
                  <p>{userItem.skpd}</p>
                </div>
                <div className="col-span-1">
                  <strong>Tanggal</strong>
                  <p>{userItem.createdDate}</p>
                </div>
                <div className="col-span-1">
                  <strong>No HP</strong>
                  <p>{userItem.notelp}</p>
                </div>
                <div className="col-span-1">
                  <strong>Email</strong>
                  <p>{userItem.email}</p>
                </div>
                <div className="col-span-1">
                  <strong>Keterangan</strong>
                  <p>{userItem.keterangan}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Print Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Cetak
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;
