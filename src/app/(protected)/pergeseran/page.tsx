import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import MainPage from "@/components/pergeseran";

export const metadata: Metadata = {
    title: "Pergeseran",
    // description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};


const Pergeseran = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Pergeseran"},
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="gap-4 md:gap-6 2xl:gap-7.5">
        <MainPage/>
      </div>
    </DefaultLayout>
  );
};

export default Pergeseran;