"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { apiRequest } from "@/helpers/apiClient";
import { useMenu } from "@/contexts/MenuContext";
import notificationClient from "@/helpers/notificationClient";
import DashboardIcon from "@/components/Icons/DashboardIcon";
import UploadIcon from "@/components/Icons/UploadIcon";
import ValidationIcon from "@/components/Icons/ValidationIcon";
import PengirimanIcon from "@/components/Icons/PengirimanIcon";
import LaporanIcon from "@/components/Icons/LaporanIcon";
import PergeseranIcon from "@/components/Icons/PergeseranIcon";
import PesanMasukIcon from "@/components/Icons/PesanMasukIcon";
import DokumenMasukIcon from "@/components/Icons/DokumenMasukIcon";
import UserIcon from "@/components/Icons/UserIcon";
import MenuIcon from "@/components/Icons/MenuIcon";
import SettingIcon from "@/components/Icons/SettingIcon";
import { DEBUG_MODE } from "@/utils/config";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const iconMap: Record<string, JSX.Element> = {
  DashboardIcon: <DashboardIcon />,
  UploadIcon: <UploadIcon />,
  ValidationIcon: <ValidationIcon />,
  PengirimanIcon: <PengirimanIcon />,
  LaporanIcon: <LaporanIcon />,
  PergeseranIcon: <PergeseranIcon />,
  PesanMasukIcon: <PesanMasukIcon />,
  DokumenMasukIcon: <DokumenMasukIcon />,
  UserIcon: <UserIcon />,
  MenuIcon: <MenuIcon />,
  SettingIcon: <SettingIcon />,
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const [notifCount, setNotifCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gunakan menu context
  const { menuGroups, loading: menuLoading, error: menuError } = useMenu();

  // Initial fetch untuk notification count
  useEffect(() => {
    const fetchInitialNotifCount = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/notifications/sidebar/1`, "GET");
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Notification data not found");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        if (json.responseCode === 200) {
          setNotifCount(json.responseData.unread_count || 0);
        }
      } catch (err: any) {
        setError(err.message === "Failed to fetch" ? "Data tidak ditemukan" : err.message);
        console.error("Failed to fetch initial notif count:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNotifCount();
  }, []);

  // Efek untuk mengelola koneksi SSE
  useEffect(() => {
    // Subscribe ke event sidebar untuk mendapatkan notification count secara real-time
    const unsubscribe = notificationClient.subscribe('sidebar', (data: any) => {
      if (data && typeof data.unread_count === 'number') {
        setNotifCount(data.unread_count);
        setError(null); // Clear error ketika berhasil menerima data
      }
    });

    // Subscribe ke event error untuk handling error
    const unsubscribeError = notificationClient.subscribe('error', (error: any) => {
      console.error('SSE Error in sidebar:', error);
      setError('Koneksi notifikasi bermasalah');
    });

    // Subscribe ke event connection untuk status koneksi
    const unsubscribeConnection = notificationClient.subscribe('connection', (data: any) => {
      if (data.status === 'connected') {
        setError(null);
      } else if (data.status === 'disconnected') {
        if (DEBUG_MODE) setError('Koneksi notifikasi terputus');
      }
    });

    // Mulai koneksi SSE jika belum terhubung
    notificationClient.connect();

    // Cleanup: unsubscribe ketika komponen unmount
    return () => {
      unsubscribe();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, []);

  // Update menu groups dengan notification count
  const updateMenuWithNotifications = (groups: any[]) => {
    return groups.map(group => ({
      ...group,
      menuItems: group.menuItems.map((item: any) => ({
        ...item,
        message: item.code_menu === "0105" ? notifCount : "",
        icon: iconMap[item.icon] || null,
        children: item.children ? item.children.map((child: any) => ({
          ...child,
          message: child.code_menu === "0105" ? notifCount : "",
          icon: iconMap[child.icon] || null,
        })) : undefined,
      }))
    }));
  };

  // Update menu groups dengan notification count
  const displayMenuGroups = updateMenuWithNotifications(menuGroups);

  if (menuLoading || loading) {
    return (
      <aside className="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </aside>
    );
  }

  if (menuError) {
    return (
      <aside className="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500 text-sm text-center px-4">
            Error loading menu: {menuError}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0 duration-300 ease-linear"
            : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <Link href="/">
            <Image
              width={176}
              height={32}
              src={"/images/logo/logo-dark.png"}
              alt="Logo"
              priority
              className="dark:hidden"
              style={{ width: "auto", height: "auto" }}
            />
            <Image
              width={176}
              height={32}
              src={"/images/logo/logo.png"}
              alt="Logo"
              priority
              className="hidden dark:block"
              style={{ width: "auto", height: "auto" }}
            />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-1 px-4 lg:px-6">
            {displayMenuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {group.name}
                </h3>
                <ul className="mb-6 flex flex-col gap-2">
                  {group.menuItems.map((menuItem: any, menuIndex: number) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {/* Tampilkan error notification jika ada */}
            {error && (
              <div className="mb-4 px-4">
                <div className="rounded-md bg-red-50 border border-red-200 p-2">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-6 px-4">
              <Link href="/guide_book">
                <Image
                  src="https://storage.googleapis.com/fastwork-static/d4d162c2-2ab3-4414-9827-4663627c807e.jpg"
                  alt="Guide Book"
                  width={100}
                  height={100}
                  className="mx-auto rounded-lg h-auto w-full cursor-pointer transition-opacity duration-200 hover:opacity-80"
                />
              </Link>
              <p className="mb-4 mt-2 text-center text-sm font-medium text-dark-4 dark:text-dark-6">
                Panduan Lengkap Penggunaan
              </p>
            </div>
          </nav>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;