// import { BRAND, Status } from "@/types//brand";
import { DASHBOARD, Status } from "@/types/dashboard";
import Image from "next/image";
import Link from "next/link";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

const statuses: Record<Status, string> = {
  success: "text-green-400 bg-green-400/10",
  error: "text-rose-400 bg-rose-400/10",
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    // 'id-ID' untuk format Indonesia
    day: "numeric",
    month: "long", // Nama bulan penuh (e.g., "Maret", "April")
    year: "numeric",
  });
};

const dashboardData: DASHBOARD[] = [
  {
    logo: "/images/brand/brand-01.svg",
    name: "Google",
    nameDocument: "Anual_Report_2023",
    status: "success",
    dateTime: new Date("2024-09-01T10:00:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-02.svg",
    name: "X.com",
    nameDocument: "Product_Catalogue_Q1",
    status: "success",
    dateTime: new Date("2024-09-02T11:30:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-03.svg",
    name: "Github",
    nameDocument: "Employee_Handbook_v2",
    status: "success",
    dateTime: new Date("2024-07-21T11:30:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-04.svg",
    name: "Vimeo",
    nameDocument: "Financial_Statement_August_2022",
    status: "error",
    dateTime: new Date("2023-07-01T11:30:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-05.svg",
    name: "Facebook",
    nameDocument: "Marketing_Strategy_Plan_2024",
    status: "error",
    dateTime: new Date("2022-01-01T11:30:00Z"),
    link: "#",
  },
];

const TableOne = () => {
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Document Information{" "}
      </h4>

      <div className="flex flex-col overflow-x-auto">
        <div className="grid grid-cols-3 2xsm:min-w-[600px] sm:grid-cols-5">
          <div className="px-2 pb-3.5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              User
            </h5>
          </div>
          <div className="px-2 pb-3.5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Document Name
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Status
            </h5>
          </div>
          <div className="hidden px-2 pb-3.5 sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Publish
            </h5>
          </div>
          <div className="hidden px-2 pb-3.5 text-center sm:block">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              View document
            </h5>
          </div>
        </div>

        {dashboardData.map((brand, key) => (
          <div
            className={`hover:bg-gray-2 rounded-[7px] grid grid-cols-3 2xsm:min-w-[600px] sm:grid-cols-5 group ${
              key === dashboardData.length - 1
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

            <div className="flex items-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {brand.nameDocument.replace(/_/g, " ")}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <div
                className={`${statuses[brand.status]} flex-none rounded-full p-1`}
              >
                <div className="h-2 w-2 rounded-full bg-current" />
              </div>
              <div className="hidden pl-1 capitalize font-medium text-dark sm:block">
                {brand.status}
              </div>
            </div>

            <div className="hidden items-center px-2 py-4 sm:flex">
              <div className="hidden font-medium text-dark sm:block">
                {formatDate(brand.dateTime)}
              </div>
            </div>

            <div className="hidden items-center justify-center px-2 py-4 sm:flex">
              <Link href="#" className="text-2xl text-dark dark:text-white group-hover:text-[#FFFFFF] group-hover:p-2 group-hover:bg-[#1D92F9] group-hover:rounded-[5px] transform transition duration-150 active:scale-90 ">
                <HiArrowTopRightOnSquare />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
