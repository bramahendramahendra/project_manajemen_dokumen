import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/laporan_dokumen/admin";

const LaporanDokumen = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Dokumen Admin"},
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <MainPage />
      </div>
    </>
  );
};

export default LaporanDokumen;