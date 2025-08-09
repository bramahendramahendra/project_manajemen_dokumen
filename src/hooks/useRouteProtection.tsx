// src\hooks\useRouteProtection.tsx
"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMenu } from '@/contexts/MenuContext';
import Cookies from 'js-cookie';

interface RouteProtectionResult {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

export const useRouteProtection = (): RouteProtectionResult => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { menuGroups, loading: menuLoading } = useMenu();
  const pathname = usePathname();
  const router = useRouter();

  // Fungsi untuk mengecek apakah user memiliki akses ke route tertentu
  const checkRouteAccess = (currentPath: string, menuData: any[]): boolean => {
    // Jika path adalah dashboard, semua user bisa akses
    if (currentPath === '/dashboard' || currentPath === '/') {
      return true;
    }

    // Flatten semua menu items dari semua groups
    const allMenuItems: any[] = [];
    
    menuData.forEach(group => {
      group.menuItems.forEach((item: any) => {
        allMenuItems.push(item);
        
        // Jika ada children, tambahkan juga
        if (item.children && item.children.length > 0) {
          item.children.forEach((child: any) => {
            allMenuItems.push(child);
          });
        }
      });
    });

    // Cek apakah current path ada di salah satu menu yang user miliki
    const hasAccessToRoute = allMenuItems.some((menuItem: any) => {
      // Exact match untuk route
      if (menuItem.route === currentPath) {
        return true;
      }
      
      // Check untuk sub-routes (dynamic routes)
      // Contoh: jika menu route adalah "/upload_dan_pengelolaan" 
      // maka "/upload_dan_pengelolaan/detail-uraian" juga diizinkan
      if (menuItem.route !== '#' && currentPath.startsWith(menuItem.route + '/')) {
        return true;
      }
      
      return false;
    });

    return hasAccessToRoute;
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cek apakah user sudah login
        const userCookie = Cookies.get('user');
        if (!userCookie) {
          router.push('/login');
          return;
        }

        // Tunggu menu data selesai loading
        if (menuLoading) {
          return;
        }

        // Jika menu groups sudah ada, check access
        if (menuGroups && menuGroups.length > 0) {
          const access = checkRouteAccess(pathname, menuGroups);
          setHasAccess(access);
          
          // Jika tidak punya akses, redirect ke unauthorized page
          if (!access) {
            // console.log('❌ Access denied for path:', pathname);
            // console.log('Available menu routes:', 
            //   menuGroups.flatMap(group => 
            //     group.menuItems.flatMap((item: any) => [
            //       item.route,
            //       ...(item.children?.map((child: any) => child.route) || [])
            //     ])
            //   )
            // );
            router.push('/unauthorized');
          } else {
            // console.log('✅ Access granted for path:', pathname);
          }
        } else {
          // Jika menu groups kosong, mungkin ada error atau user tidak punya akses apapun
          setHasAccess(false);
          // setError('No menu access found');
        }
      } catch (err) {
        console.error('Route protection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [pathname, menuGroups, menuLoading, router]);

  return {
    hasAccess,
    loading: loading || menuLoading,
    error
  };
};

// Hook untuk mengecek akses ke route tertentu (tanpa redirect)
export const useCheckRouteAccess = (targetRoute: string): boolean => {
  const { menuGroups } = useMenu();
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  useEffect(() => {
    if (menuGroups && menuGroups.length > 0) {
      // Flatten semua menu items
      const allMenuItems: any[] = [];
      
      menuGroups.forEach(group => {
        group.menuItems.forEach((item: any) => {
          allMenuItems.push(item);
          
          if (item.children && item.children.length > 0) {
            item.children.forEach((child: any) => {
              allMenuItems.push(child);
            });
          }
        });
      });

      // Cek apakah target route ada di menu user
      const access = allMenuItems.some((menuItem: any) => {
        // Exact match
        if (menuItem.route === targetRoute) {
          return true;
        }
        
        // Sub-route match
        if (menuItem.route !== '#' && targetRoute.startsWith(menuItem.route + '/')) {
          return true;
        }
        
        return false;
      });

      setHasAccess(access);
    }
  }, [targetRoute, menuGroups]);

  return hasAccess;
};