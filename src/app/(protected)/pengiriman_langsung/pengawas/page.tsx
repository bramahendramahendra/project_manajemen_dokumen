"use client"
import MainPage from "@/components/pengirimanLangsung/FormPengirimanLangsungPengawas";
import Breadcrumb from "@/components/breadcrumbs";
const PengirimanLangsungPengawas = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Pengiriman Langsung Pengawas"},
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

export default PengirimanLangsungPengawas;