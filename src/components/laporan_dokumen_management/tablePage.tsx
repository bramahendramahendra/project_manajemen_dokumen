const userData = [
  {
    user: "Erik Tohir",
    tanggal: "25/09/2024",
    jenis: "Anggaran",
    subJenis: "RKA",
    tahun: "2019",
    keterangan: "Unvalidasi",
  },
  {
    user: "Erik Tohir",
    tanggal: "25/09/2024",
    jenis: "Anggaran",
    subJenis: "RKA",
    tahun: "2019",
    keterangan: "Unvalidasi",
  },
  {
    user: "Erik Tohir",
    tanggal: "25/09/2024",
    jenis: "Anggaran",
    subJenis: "RKA",
    tahun: "2019",
    keterangan: "Unvalidasi",
  },
  {
    user: "Erik Tohir",
    tanggal: "25/09/2024",
    jenis: "Anggaran",
    subJenis: "RKA",
    tahun: "2019",
    keterangan: "Unvalidasi",
  },
];

const TablePage = () => {
  return (
    <div className="col-span-12 xl:col-span-12">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="space-y-4">
          {/* Table Rows Styled as Cards */}
          {userData.map((data, index) => (
            <div key={index} className="rounded-lg border border-gray-300 p-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                  <strong>User</strong>
                  <p>{data.user}</p>
                </div>
                <div className="col-span-1">
                  <strong>Tanggal</strong>
                  <p>{data.tanggal}</p>
                </div>
                <div className="col-span-1">
                  <strong>Jenis</strong>
                  <p>{data.jenis}</p>
                </div>
                <div className="col-span-1">
                  <strong>Sub Jenis</strong>
                  <p>{data.subJenis}</p>
                </div>
                <div className="col-span-1">
                  <strong>Tahun</strong>
                  <p>{data.tahun}</p>
                </div>
                <div className="col-span-1">
                  <strong>Keterangan</strong>
                  <p>{data.keterangan}</p>
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
