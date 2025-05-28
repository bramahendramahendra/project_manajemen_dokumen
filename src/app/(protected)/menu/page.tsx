import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import HeaderPage from "@/components/menu/headerPage";
import MainPage from "@/components/menu";

const Menu = () => {
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "Menu"},
  ];
  
  return (
    // <DefaultLayout>
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <HeaderPage />
      <div className="grid grid-cols-12 gap-4  md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <MainPage />
        </div>
      </div>
    </>
    // </DefaultLayout>
  );
};

export default Menu;