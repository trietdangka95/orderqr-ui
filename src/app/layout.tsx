import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Order QR - Đặt Món Online",
  description: "Giải pháp menu điện tử cho nhà hàng",
  icons: {
    icon: "/orderqr-logo.svg",
  }
};

import Providers from "@/components/Providers";
import StoreInitializer from "@/components/layout/StoreInitializer";
import { Suspense } from "react";
import CustomerUI from "@/components/layout/CustomerUI";
import GlobalDialog from "@/components/ui/GlobalDialog";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="bg-[#fdfbf7]">
      <body className={`${inter.className} min-h-screen text-gray-900`} suppressHydrationWarning={true}>
        <Providers>
          <Suspense fallback={null}>
            <StoreInitializer />
          </Suspense>
          {children}
          <CustomerUI />
          <GlobalDialog />
        </Providers>
      </body>
    </html>
  );
}
