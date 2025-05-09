"use client";
import React from "react";
import { useRouter } from "next/navigation";
import SectionLeft from "@/components/Login/SectionLeft";
import SectionRight from "@/components/Login/SectionRight";

export default function Login() {
  const router = useRouter();

  // const handleLoginClick = () => {
  //     router.push('/');
  // };

  return (
    <main className="relative flex h-screen bg-[#ffffff]">
      <section className="relative w-1/2 overflow-hidden bg-gradient-to-b from-[#0C479F] to-[#1D92F9] 2xsm:w-full sm:w-full md:w-1/2">
        <SectionLeft />
      </section>
      <section className="flex w-1/2 bg-white 2xsm:hidden sm:hidden md:block">
        <SectionRight />
      </section>
    </main>
  );
}
