"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/helpers/apiClient';
import Cookies from 'js-cookie';

interface MenuContextType {
  menuGroups: any[];
  loading: boolean;
  error: string | null;
  fetchMenuData: () => Promise<void>;
  clearMenuData: () => void;
  updateMenuWithNotifications: (notifCounts: Record<string, number>) => void;
  menuNotifMapping: Record<string, number>;
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

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuGroups, setMenuGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [menuNotifMapping, setMenuNotifMapping] = useState<Record<string, number>>({});
  
  // Ref untuk mencegah multiple fetch
  const isFetchingMapping = useRef(false);
  const isFetchingMenu = useRef(false);

  // Fetch mapping dari API
  const fetchNotifMapping = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingMapping.current) {
      console.log('[MenuContext] Already fetching mapping, skipping...');
      return;
    }

    try {
      isFetchingMapping.current = true;
      
      // Cek localStorage untuk mapping
      const cachedMapping = localStorage.getItem('notif_mapping');
      const cacheTimestamp = localStorage.getItem('notif_mapping_timestamp');
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 menit

      // Gunakan cache jika masih valid
      if (cachedMapping && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
        const parsed = JSON.parse(cachedMapping);
        setMenuNotifMapping(parsed);
        console.log('[MenuContext] Using cached mapping:', parsed);
        return;
      }

      console.log('[MenuContext] Fetching mapping from API...');
      
      // Fetch dari API
      const res = await apiRequest('/notifications/mapping', 'GET');
      const json = await res.json();

      if (json.responseCode === 200) {
        const mapping = json.responseData.mapping;
        
        // Convert keys to string if needed (API mengirim "0105" bukan 0105)
        const stringMapping: Record<string, number> = {};
        Object.keys(mapping).forEach(key => {
          stringMapping[key.toString()] = mapping[key];
        });
        
        setMenuNotifMapping(stringMapping);
        
        // Simpan ke localStorage
        localStorage.setItem('notif_mapping', JSON.stringify(stringMapping));
        localStorage.setItem('notif_mapping_timestamp', now.toString());
        
        console.log('[MenuContext] Fetched mapping from API:', stringMapping);
      } else {
        console.error('[MenuContext] Failed to fetch mapping:', json.responseDesc);
        // Fallback ke mapping default jika API gagal
        const fallbackMapping = {
          "0105": 1,
          "0201": 2,
        };
        setMenuNotifMapping(fallbackMapping);
      }
    } catch (error) {
      console.error('[MenuContext] Error fetching mapping:', error);
      // Fallback ke mapping default
      const fallbackMapping = {
        "0105": 1,
        "0201": 2,
      };
      setMenuNotifMapping(fallbackMapping);
    } finally {
      isFetchingMapping.current = false;
    }
  }, []); // EMPTY dependency array - hanya dibuat sekali

  const transformMenuData = useCallback((items: any[], mapping: Record<string, number>) => {
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
              ...(mapping[child.code_menu] ? { 
                notif: mapping[child.code_menu].toString() 
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
            ...(mapping[item.code_menu] ? { 
              notif: mapping[item.code_menu].toString() 
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
  }, []); // EMPTY dependency array

  const fetchMenuData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingMenu.current) {
      console.log('[MenuContext] Already fetching menu, skipping...');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      isFetchingMenu.current = true;
      
      const user = JSON.parse(Cookies.get("user") || "{}");
      
      if (!user.level_id) {
        throw new Error("User level not found");
      }

      // Fetch mapping terlebih dahulu jika belum ada
      if (Object.keys(menuNotifMapping).length === 0) {
        await fetchNotifMapping();
      }

      // Cek apakah data menu sudah ada di localStorage
      const storedMenu = localStorage.getItem(`menu_${user.level_id}`);
      if (storedMenu) {
        const parsedMenu = JSON.parse(storedMenu);
        setMenuGroups(parsedMenu);
        setLoading(false);
        return;
      }

      console.log('[MenuContext] Fetching menu from API...');

      // Jika tidak ada di localStorage, fetch dari API
      const res = await apiRequest(`/access_menus/menu/${user.level_id}`, "GET");
      const json = await res.json();
      
      if (json.responseCode === 200) {
        // Gunakan mapping yang sudah ada atau yang baru di-fetch
        const currentMapping = Object.keys(menuNotifMapping).length > 0 
          ? menuNotifMapping 
          : JSON.parse(localStorage.getItem('notif_mapping') || '{}');
          
        const transformed = transformMenuData(json.responseData.items, currentMapping);
        setMenuGroups(transformed);
        
        // Simpan ke localStorage untuk penggunaan selanjutnya
        localStorage.setItem(`menu_${user.level_id}`, JSON.stringify(transformed));
        
        console.log('[MenuContext] Menu data loaded successfully');
      } else {
        throw new Error(json.responseDesc || "Failed to fetch menu");
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
      isFetchingMenu.current = false;
    }
  }, [fetchNotifMapping, menuNotifMapping, transformMenuData]); // Controlled dependencies

  const updateMenuWithNotifications = useCallback((notifCounts: Record<string, number>) => {
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (!user.level_id) return;

    setMenuGroups(prevMenuGroups => {
      const updatedMenuGroups = prevMenuGroups.map(group => ({
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

      // Update localStorage dengan data terbaru
      localStorage.setItem(`menu_${user.level_id}`, JSON.stringify(updatedMenuGroups));
      
      return updatedMenuGroups;
    });
  }, [menuNotifMapping]);

  const clearMenuData = useCallback(() => {
    setMenuGroups([]);
    setError(null);
    setMenuNotifMapping({});
    
    // Hapus dari localStorage
    const user = JSON.parse(Cookies.get("user") || "{}");
    if (user.level_id) {
      localStorage.removeItem(`menu_${user.level_id}`);
    }
    localStorage.removeItem('notif_mapping');
    localStorage.removeItem('notif_mapping_timestamp');
  }, []);

  // Load menu data saat provider pertama kali dimount - HANYA SEKALI
  useEffect(() => {
    const user = Cookies.get("user");
    if (user) {
      fetchMenuData();
    }
  }, []); // EMPTY array - hanya run sekali saat mount

  // Refresh mapping setiap 5 menit - INDEPENDENT dari state
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[MenuContext] Auto-refreshing mapping...');
      fetchNotifMapping();
    }, 5 * 60 * 1000); // 5 menit

    return () => clearInterval(interval);
  }, [fetchNotifMapping]);

  const value: MenuContextType = {
    menuGroups,
    loading,
    error,
    fetchMenuData,
    clearMenuData,
    updateMenuWithNotifications,
    menuNotifMapping,
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};