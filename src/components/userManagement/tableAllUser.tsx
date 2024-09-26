import { BRAND } from "@/types//brand";
import Image from "next/image";
import { HiEllipsisVertical } from "react-icons/hi2";


const userData: User[] = [
  {
    userid: "M00001",
    name: "Free package",
    username: "freepackage",
    levelId: 1,
    levelUser: "Admin",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00002",
    name: "Standard Package",
    username: "standardackage",
    levelId: 2,
    levelUser: "Dinas",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00003",
    name: "Business Package",
    username: "usinessackage",
    levelId: 2,
    levelUser: "Dinas",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00004",
    name: "Standard Package",
    username: "tandardackage",
    levelId: 2,
    levelUser: "Dinas",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
];

const TableAllUser = () => {
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Users
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 sm:grid-cols-6">
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Name
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Username
            </h5>
          </div>
          <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Email
            </h5>
          </div>
          {/* <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              responsible person
            </h5>
          </div> */}
          <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              No.Phone
            </h5>
          </div>
          <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Status
            </h5>
          </div>
          <div className="hidden px-2 pb-3.5 text-center justify-self-center sm:block">
            <p className="text-[25px] font-medium uppercase">
              <HiEllipsisVertical />
            </p>
          </div>
          
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-6 ${
              key === brandData.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3.5 px-2 py-4">
              <div className="flex-shrink-0">
                <Image src={brand.logo} alt="Brand" width={48} height={48} />
              </div>
              <p className="hidden font-medium text-dark dark:text-white sm:block">
                {brand.name}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {brand.visitors}K
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-green-light-1">
                ${brand.revenues}
              </p>
            </div>

            <div className="hidden items-center justify-center px-2 py-4 sm:flex">
              <p className="font-medium text-dark dark:text-white">
                {brand.sales}
              </p>
            </div>

            <div className="hidden items-center justify-center px-2 py-4 sm:flex">
              <p className="font-medium text-dark dark:text-white">
                {brand.conversion}%
              </p>
            </div>
            
            {/* <div className="hidden items-center justify-center px-2 py-4 sm:flex">
              <p className="font-medium text-dark dark:text-white">
                {brand.conversion}%
              </p>
            </div> */}

            <div className="hidden items-center justify-center px-2 py-4 sm:flex">
              <p className="font-medium text-dark dark:text-white">
                {brand.conversion}%
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableAllUser;
