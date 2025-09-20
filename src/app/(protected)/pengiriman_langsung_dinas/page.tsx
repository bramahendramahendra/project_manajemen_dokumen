"use client"
import MainPage from "@/components/pengirimanLangsungDinas";
import Breadcrumb from "@/components/breadcrumbs";

const PengirimanLangsungDinas = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Pengiriman Langsung Dinas"},
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

export default PengirimanLangsungDinas;