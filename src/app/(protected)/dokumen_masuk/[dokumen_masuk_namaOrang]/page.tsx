"use client";

import Breadcrumb from "@/components/breadcrumbs";
import DokumenMasukDetailDokumen from "@/components/dokumen_masuk/dokumen_masuk_detail";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const DokumenMasukDetail = ({
  params,
}: {
  params: { dokumen_masuk_namaOrang: string };
}) => {
  const decodedName = decodeURIComponent(params.dokumen_masuk_namaOrang);

  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: `Dokumen Masuk dari ${decodedName}` },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <DokumenMasukDetailDokumen senderNamaDinas={decodedName}/>
    </DefaultLayout>
  );
};

export default DokumenMasukDetail;
