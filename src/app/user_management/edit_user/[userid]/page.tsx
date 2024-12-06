"use client";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/breadcrumbs";
import { useRouter, useParams } from "next/navigation";
import { User } from "@/types/user";
import FormEditUser from "@/components/userManagement/formEditUser";

// Sample user data
const userData: User[] = [
  {
    userid: "M00001",
    username: "freepackage",
    name: "Free package",
    level_id: "1",
    role: "Admin",
  },
  {
    userid: "M00002",
    username: "standardpackage",
    name: "Standard Package",
    level_id: "2",
    role: "Dinas",
  },
  {
    userid: "M00003",
    username: "businesspackage",
    name: "Business Package",
    level_id: "2",
    role: "Dinas",
  },
  {
    userid: "M00004",
    username: "standardpackage",
    name: "Standard Package",
    level_id: "2",
    role: "Dinas",
  },
];

const EditUser = () => {
  const Router = useRouter();
  const { userid } = useParams(); // Get the userid from the URL parameters

  // Find the user to edit based on the userid
  const userToEdit = userData.find((user) => user.userid === userid);

  // Breadcrumbs for navigation
  const breadcrumbs = [
    { name: "Dashboard", href: "/" },
    { name: "User Management", href: "/user_management" },
    { name: `Edit User ${userid}` },
  ];

  return (
    <DefaultLayout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          {userToEdit ? (
            <FormEditUser user={userToEdit} />
          ) : (
            <div className="text-left text-red-500">
              Data untuk user dengan ID <strong>{userid}</strong> tidak ada.
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditUser;
