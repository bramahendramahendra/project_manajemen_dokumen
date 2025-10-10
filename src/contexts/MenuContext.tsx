"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/helpers/apiClient';
import Cookies from 'js-cookie';

interface MenuContextType {
  menuGroups: any[];
  loading: boolean;
  error: string | null;
  fetchMenuData: () => Promise<void>;
  clearMenuData: () => void;
  updateMenuWithNotifications: (notifCounts: Record<string, number>) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const iconMap: Record<string, string> = {
  DashboardIcon: "DashboardIcon",
  UploadIcon: "UploadIcon", 
  DaftarIcon: "DaftarIcon",
  ValidationIcon: "ValidationIcon",
  PengirimanIcon: "PengirimanIcon",
  LaporanIcon: "LaporanIcon",
  PergeseranIcon: "PergeseranIcon",
  PesanMasukIcon: "PesanMasukIcon",
  DokumenMasukIcon: "DokumenMasukIcon",
  DokumenPergeseranIcon: "DokumenPergeseranIcon",
  UserIcon: "UserIcon",
  MenuIcon: "MenuIcon",
  SettingIcon: "SettingIcon",
};

// Mapping code_menu ke code_notif
const menuNotifMapping: Record<string, number> = {
  "0105": 1, // Validation Upload -> code_notif 1
  "0110": 2, // Dokumen Masuk -> code_notif 2
  // Tambahkan mapping lain sesuai kebutuhan
};

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuGroups, setMenuGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const transformMenuData = useCallback((items: any[]) => {
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
              message: "",
              route: child.url || "#",
              icon: iconMap[child.icon] || null,
              code_menu: child.code_menu,
              // Tambahkan notif field jika ada mapping
              ...(menuNotifMapping[child.code_menu] ? { 
                notif: menuNotifMapping[child.code_menu].toString() 
              } : {}),
            }));

          return {
            label: item.menu,
            pro: item.pro,
            message: "",
            route: item.url || "#",
            icon: iconMap[item.icon] || null,
            code_menu: item.code_menu,
            // Tambahkan notif field jika ada mapping
            ...(menuNotifMapping[item.code_menu] ? { 
              notif: menuNotifMapping[item.code_menu].toString() 
            } : {}),
            ...(children.length > 0 ? { children } : {}),
          };
        });

      return {
        name: group.menu,
        menuItems,
      };
    });

    return menuGroups;
  }, []);

  const fetchMenuData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const user = JSON.parse(Cookies.get("user") || "{}");
      
      if (!user.level_id) {
        throw new Error("User level not found");
      }

      // Cek apakah data menu sudah ada di localStorage
      const storedMenu = localStorage.getItem(`menu_${user.level_id}`);
      if (storedMenu) {
        const parsedMenu = JSON.parse(storedMenu);
        setMenuGroups(parsedMenu);
        setLoading(false);
        return;
      }

      // Jika tidak ada di localStorage, fetch dari API
      const res = await apiRequest(`/access_menus/menu/${user.level_id}`, "GET");
      const json = await res.json();
      
      if (json.responseCode === 200) {
        const transformed = transformMenuData(json.responseData.items);
        setMenuGroups(transformed);
        
        // Simpan ke localStorage untuk penggunaan selanjutnya
        localStorage.setItem(`menu_${user.level_id}`, JSON.stringify(transformed));
      } else {
        throw new Error(json.responseDesc || "Failed to fetch menu");
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [transformMenuData]);

  const updateMenuWithNotifications = useCallback((notifCounts: Record<string, number>) => {
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.level_id) return;

    const updatedMenuGroups = menuGroups.map(group => ({
      ...group,
      menuItems: group.menuItems.map((item: any) => ({
        ...item,
        // Update notif field jika ada di mapping
        ...(menuNotifMapping[item.code_menu] ? { 
          notif: menuNotifMapping[item.code_menu].toString() 
        } : {}),
        children: item.children ? item.children.map((child: any) => ({
          ...child,
          // Update notif field jika ada di mapping  
          ...(menuNotifMapping[child.code_menu] ? { 
            notif: menuNotifMapping[child.code_menu].toString() 
          } : {}),
        })) : undefined,
      }))
    }));

    setMenuGroups(updatedMenuGroups);
    
    // Update localStorage dengan data terbaru
    localStorage.setItem(`menu_${user.level_id}`, JSON.stringify(updatedMenuGroups));
  }, [menuGroups]);

  const clearMenuData = useCallback(() => {
    setMenuGroups([]);
    setError(null);
    
    // Hapus dari localStorage
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (user.level_id) {
      localStorage.removeItem(`menu_${user.level_id}`);
    }
  }, []);

  // Load menu data saat provider pertama kali dimount
  useEffect(() => {
    const user = Cookies.get("user");
    if (user) {
      fetchMenuData();
    }
  }, [fetchMenuData]);

  const value: MenuContextType = {
    menuGroups,
    loading,
    error,
    fetchMenuData,
    clearMenuData,
    updateMenuWithNotifications,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};