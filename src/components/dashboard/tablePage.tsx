// import { BRAND, Status } from "@/types//brand";
import { DASHBOARD, Status } from "@/types/dashboard";
import Image from "next/image";
import Link from "next/link";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

const statuses: Record<Status, string> = {
  complete: "text-green-400 bg-green-400/10",
  uncomplete: "text-rose-400 bg-rose-400/10",
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
    logo: "/images/profile.png",
    name: "Google",
    nameDocument: "Anual_Report_2023",
    status: "complete",
    dateTime: new Date("2024-09-01T10:00:00Z"),
    link: "#",
  },
  {
    logo: "/images/profile.png",
    name: "X.com",
    nameDocument: "Product_Catalogue_Q1",
    status: "complete",
    dateTime: new Date("2024-09-02T11:30:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-03.svg",
    name: "Github",
    nameDocument: "Employee_Handbook_v2",
    status: "uncomplete",
    dateTime: new Date("2024-07-21T11:30:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-04.svg",
    name: "Vimeo",
    nameDocument: "Financial_Statement_August_2022_1221_23232-23232",
    status: "complete",
    dateTime: new Date("2023-07-01T11:30:00Z"),
    link: "#",
  },
  {
    logo: "/images/brand/brand-05.svg",
    name: "Facebook",
    nameDocument: "Marketing_Strategy_Plan_2024",
    status: "uncomplete",
    dateTime: new Date("2022-01-01T11:30:00Z"),
    link: "#",
  },
];

const TableOne = () => {
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h4 className="mb-5.5 text-body-2xlg font-bold text-dark dark:text-white">
        Document Information
      </h4>

      {/* Wrapping the table with overflow-x-auto for horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto">
          <thead>
            <tr className="">
              {/* Uraian Column (sticky) */}
              <th className="bg-custom-gradient-right sticky left-0 z-10  px-2 pb-3.5 text-left dark:bg-gray-dark ">
                Uraian
              </th>
              {/* Other Year Columns */}
              <th className="px-2 pb-3.5">2018</th>
              <th className="px-2 pb-3.5">2019</th>
              <th className="px-2 pb-3.5">2020</th>
              <th className="px-2 pb-3.5">2021</th>
              <th className="px-2 pb-3.5">2022</th>
              <th className="px-2 pb-3.5">2023</th>
              <th className="px-2 pb-3.5">2024</th>
              <th className="px-2 pb-3.5">2025</th>
            </tr>
          </thead>

          <tbody>
            {dashboardData.map((brand, key) => (
              <tr
                className={`hover:bg-gray-2 ${
                  key === dashboardData.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-dark-3"
                }`}
                key={key}
              >
                {/* Uraian column data (fixed) */}
                <td className="bg-custom-gradient-right sticky left-0 z-10 bg-white px-2 py-4 dark:bg-gray-dark w-full 2xsm:w-7 shadow-right sm:w-60 md:w-auto">
                  <div className="flex items-center gap-3.5">
                    <p className="font-medium text-dark dark:text-white">
                      {brand.nameDocument.replace(/_/g, " ")}
                    </p>
                  </div>
                </td>

                {/* Year columns */}
                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4">
                  <div className="flex items-center">
                    <div
                      className={`${statuses[brand.status]} flex-none rounded-full p-1`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div className="pl-1 font-medium capitalize text-dark dark:text-white">
                      {brand.status}
                    </div>
                  </div>
                </td>

                {/* <td className="px-2 py-4 text-center">
                  <Link href="#" className="text-2xl text-dark dark:text-white">
                    <HiArrowTopRightOnSquare />
                  </Link>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOne;
