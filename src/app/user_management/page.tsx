import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import Breadcrumb from "@/components/breadcrumbs";
import TablePage from "@/components/userManagement/tablePage";

export const metadata: Metadata = {
    title: "Titel Tab",
    description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

const UserManagement = () => {
  return (
    <DefaultLayout>
        <Breadcrumb pageName="User Management" />
        <div className="mx-auto max-w-7xl">
          <TablePage />
        </div>
    </DefaultLayout>
  );
};

export default UserManagement;