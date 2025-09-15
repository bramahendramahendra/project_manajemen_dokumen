import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/dokumen_masuk";

const DokumenMasuk = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Dokumen Masuk"},
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <MainPage/>
    </>
  );
};

export default DokumenMasuk;