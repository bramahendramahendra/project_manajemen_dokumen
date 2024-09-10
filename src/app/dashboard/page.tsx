import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import DataStatsPage from "@/components/dashboard/dataStatsPage";
import TablePage from "@/components/dashboard/tablePage";
import ChatCardPage from "@/components/dashboard/chatCard";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const Dashboard = () => {
  return (
    <DefaultLayout>
      <DataStatsPage />
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <TablePage />
        </div>
        <ChatCardPage />
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;