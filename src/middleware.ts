import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Jika user sudah login, redirect ke halaman dashboard
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Jika tidak ada token, redirect ke login kecuali di halaman login atau lupa-password
  if (!token) {
    const isAuthPage = ["/login", "/lupa-password"].includes(request.nextUrl.pathname);
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: "/((?!_next|api|login|lupa-password|favicon.ico).*)",
// };


// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("token")?.value;
//   if (!token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }
export const config = {
  matcher: [
    "/((?!_next|login|lupa-password).*)",
  ],
};