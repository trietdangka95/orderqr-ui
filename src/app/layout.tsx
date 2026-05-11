import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import OrdersDrawer from "@/components/OrdersDrawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Menu Việt - Đặt Món Online",
  description: "Giải pháp menu điện tử cho nhà hàng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="bg-[#fdfbf7]">
      <body className={`${inter.className} min-h-screen text-gray-900`}>
        {children}
        <CartDrawer />
        <OrdersDrawer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
