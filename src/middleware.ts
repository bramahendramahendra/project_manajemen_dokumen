// src\middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // if (token && request.nextUrl.pathname === "/login") {
  if (userCookie && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // if (!token) {
  if (!userCookie) {
    const isAuthPage = ["/login", "/lupa-password"].includes(request.nextUrl.pathname);
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|login|lupa-password).*)",
  ],
};