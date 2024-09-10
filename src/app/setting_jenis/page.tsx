import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const Dashboard = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        Setting Jenis
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;