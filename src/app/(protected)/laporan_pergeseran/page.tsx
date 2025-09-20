import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/laporan_pergeseran/";

const LaporanPergeseran = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Laporan Pergeseran"},
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

export default LaporanPergeseran;