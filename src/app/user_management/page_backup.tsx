"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import TableAllUser from "@/components/userManagement/tableAllUser";
import UserStats from "@/components/userManagement/userStats";
import TopUser from "@/components/userManagement/topUser";
import { HiPlus } from "react-icons/hi2";
import { useRouter } from "next/navigation";

const UserManagement = () => {
  const Router = useRouter();
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "User Management"},
  ];

  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // const toggleModal = (): void => {
  //   setIsModalOpen(!isModalOpen);
  // };
  

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12">
        <button
          onClick={() => Router.push('/add-user')}
          className="active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11"
        >
          <div className="flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]">
            <span>
              <HiPlus />
            </span>
            <span>Tambah User</span>
          </div>
        </button>
        {/* <button
          onClick={toggleModal}
          className="active:scale-[.97] 2xsm:col-span-12 md:col-span-3 md:col-start-10 lg:col-span-3 lg:col-start-10 xl:col-span-2 xl:col-start-11"
        >
          <div className="flex items-center justify-center space-x-2 rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] py-[10px] text-[16px] text-white hover:from-[#0C479F] hover:to-[#0C479F]">
            <span>
              <HiPlus />
            </span>
            <span>Tambah User</span>
          </div>
        </button> */}
      </div>

      {/* <AddUser isOpen={isModalOpen} onClose={toggleModal} /> */}

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <UserStats />
          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
            <div className="col-span-12 xl:col-span-12">
              <TopUser />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <TableAllUser />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UserManagement;
