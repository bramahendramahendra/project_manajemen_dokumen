import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "This is Next.js Home page for NextAdmin Dashboard Kit",
};

export default function Dashboard() {
  return (
    <>
      <DefaultLayout>
        Login
      </DefaultLayout>
    </>
  );
}
