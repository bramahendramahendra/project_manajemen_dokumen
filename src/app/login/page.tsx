'use client';
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
      <main 
        className="flex h-screen bg-[#ffffff] relative"
      >
        <section className="w-1/2 md:w-1/2 2xsm:w-full sm:w-full bg-gradient-to-b from-[#0C479F] to-[#1D92F9] relative overflow-hidden">
          <SectionLeft/>
        </section>
        <section className="w-1/2 md:block sm:hidden 2xsm:hidden bg-white flex">
          <SectionRight/>
        </section>
      </main>
  );
}