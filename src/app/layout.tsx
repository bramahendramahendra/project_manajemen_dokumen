import "@/css/satoshi.css";
import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import { MenuProvider } from "@/contexts/MenuContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}
