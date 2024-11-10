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
    name: "Free package",
    username: "freepackage",
    levelId: 1,
    levelUser: "Admin",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00002",
    name: "Standard Package",
    username: "standardackage",
    levelId: 2,
    levelUser: "Dinas",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00003",
    name: "Business Package",
    username: "usinessackage",
    levelId: 2,
    levelUser: "Dinas",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
  },
  {
    userid: "M00004",
    name: "Standard Package",
    username: "tandardackage",
    levelId: 2,
    levelUser: "Dinas",
    email: "atesting@example.com",
    skpd: "Dinas Kabupaten",
    notelp: "082130599678",
    createdDate: `13 Januari 2023`,
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
