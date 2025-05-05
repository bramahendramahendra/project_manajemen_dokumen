"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import Cookies from "js-cookie";
import { apiRequest } from "@/helpers/apiClient";
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
  const [menuGroups, setMenuGroups] = useState<any[]>([]);

  const transformMenuData = (items: any[]) => {
    const lookup: Record<string, any> = {};
    items.forEach((item) => {
      lookup[item.code_menu] = {
        ...item,
        children: [],
      };
    });

    const roots: any[] = [];
    items.forEach((item) => {
      const parentCode = item.code_parent;
      if (parentCode === "00") {
        roots.push(lookup[item.code_menu]);
      } else if (lookup[parentCode]) {
        lookup[parentCode].children.push(lookup[item.code_menu]);
      }
    });

    const menuGroups = roots.map((group) => {
      const menuItems = group.children
        .sort((a: any, b: any) => parseInt(a.urutan) - parseInt(b.urutan))
        .map((item: any) => {
          const children = item.children
            .sort((a: any, b: any) => parseInt(a.urutan) - parseInt(b.urutan))
            .map((child: any) => ({
              label: child.menu,
              pro: child.pro,
              // message: 1,
              route: child.url || "#",
              icon: iconMap[child.icon] || null,
            }));

          return {
            label: item.menu,
            pro: item.pro,
            // message: 1,
            route: item.url || "#",
            icon: iconMap[item.icon] || null,
            ...(children.length > 0 ? { children } : {}),
          };
        });

      return {
        name: group.menu,
        menuItems,
      };
    });

    return menuGroups;
  };

  useEffect(() => {
    const fetchMenu = async () => {
      const user = JSON.parse(Cookies.get("user") || "{}");
      const res = await apiRequest(`/access_menus/menu/${user.level_id}`, "GET");
      const json = await res.json();
      const transformed = transformMenuData(json.responseData.items);
      setMenuGroups(transformed);
    };
    fetchMenu();
  }, []);

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
              style={{ width: "174px", height: "30px" }}
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
            {menuGroups.map((group, groupIndex) => (
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

            <div className="mt-6 px-4">
              <Link href="/guide_book">
                <Image
                  src="https://storage.googleapis.com/fastwork-static/d4d162c2-2ab3-4414-9827-4663627c807e.jpg"
                  alt="Guide Book"
                  width={100}
                  height={100}
                  className="mx-auto h-auto w-full cursor-pointer transition-opacity duration-200 hover:opacity-80"
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
