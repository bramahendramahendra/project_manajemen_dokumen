import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("user");

  if (userCookie) {
    // Jika sudah login, redirect ke dashboard
    redirect("/dashboard");
  } else {
    // Jika belum login, redirect ke login
    redirect("/login1");
  }
}