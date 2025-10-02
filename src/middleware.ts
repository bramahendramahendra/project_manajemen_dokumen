// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Base path dari environment variable
const BASE_PATH = process.env.NEXT_PUBLIC_APP_URL?.includes('/testing') ? '/testing' : '';
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

// Helper function untuk normalize path (remove base path jika ada)
const getNormalizedPath = (path: string): string => {
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    return path.substring(BASE_PATH.length) || '/';
  }
  return path;
};

// Helper function untuk create URL dengan base path
const createURL = (path: string, requestUrl: string): URL => {
  const fullPath = BASE_PATH ? `${BASE_PATH}${path}` : path;
  return new URL(fullPath, requestUrl);
};

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  // Normalize pathname untuk pengecekan
  const normalizedPath = getNormalizedPath(pathname);

  // Debug logging
  if (DEBUG_MODE) {
    console.log('[Middleware]', {
      originalPath: pathname,
      normalizedPath,
      basePath: BASE_PATH || '(none)',
      hasUser: !!userCookie,
    });
  }

  // Daftar halaman auth yang tidak perlu login
  const authPages = ["/login", "/lupa-password"];
  
  // Daftar path yang di-skip (public assets, API routes, dll)
  const publicPaths = [
    "/api",
    "/_next",
    "/images",
    "/fonts",
    "/favicon.ico",
  ];

  // Skip middleware untuk public paths
  if (publicPaths.some(path => normalizedPath.startsWith(path))) {
    return NextResponse.next();
  }

  // Jika user sudah login dan mencoba akses halaman login
  if (userCookie && normalizedPath === "/login") {
    if (DEBUG_MODE) {
      console.log('[Middleware] Redirecting authenticated user to dashboard');
    }
    return NextResponse.redirect(createURL("/dashboard", request.url));
  }

  // Jika user belum login
  if (!userCookie) {
    const isAuthPage = authPages.includes(normalizedPath);
    
    // Jika bukan halaman auth, redirect ke login
    if (!isAuthPage) {
      if (DEBUG_MODE) {
        console.log('[Middleware] Redirecting unauthenticated user to login');
      }
      return NextResponse.redirect(createURL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};