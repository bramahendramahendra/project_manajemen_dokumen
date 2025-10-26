"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Image from "next/image";

import { motion } from "framer-motion";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";


export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <motion.div
              className="margin absolute right-0 top-20 z-[-1] overflow-hidden"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                className="pointer-events-none relative top-0 max-h-full max-w-full select-none object-cover md:right-[-50px] md:top-[-60px] lg:right-[-10px] lg:top-[-50px]"
                src={Background1}
                alt="Background"
                priority
              />
            </motion.div>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
