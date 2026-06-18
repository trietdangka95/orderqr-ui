"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartDrawer from "@/components/CartDrawer";
import OrdersDrawer from "@/components/OrdersDrawer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useCartStore } from "@/store/cartStore";

export default function CustomerUI() {
  const pathname = usePathname();
  const [isLanding, setIsLanding] = useState(false);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const query = new URLSearchParams(window.location.search);
    const storeQuery = query.get("store");
    const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn").toLowerCase();
    const cleanMainDomain = mainDomain.split(":")[0];
    const isMainDomain = 
      host === cleanMainDomain || 
      host === `www.${cleanMainDomain}` ||
      host === "localhost" || 
      host === "www.localhost" ||
      host === "127.0.0.1";

    if (isMainDomain && !storeQuery && pathname === "/") {
      setIsLanding(true);
    } else {
      setIsLanding(false);
    }
  }, [pathname]);

  // Không hiển thị UI của khách nếu đang ở trang Admin hoặc Super Admin
  const isPlatformAdmin = pathname?.startsWith("/superadmin") || pathname?.startsWith("/super-login");
  const isStoreAdmin = pathname?.startsWith("/admin");
  const isAuth = pathname?.startsWith("/auth");

  const { storeConfig, storeError, selectedTable, userRole } = useCartStore();

  if (isPlatformAdmin || isStoreAdmin || isAuth || isLanding) {
    return null;
  }

  // 1. Hide guest UI if config is loading or has error (e.g. Store Not Found)
  if (!storeConfig || storeError) {
    return null;
  }

  // 2. Hide guest UI if guest has not selected a table yet (on Table Selector page)
  const isGuest = userRole === "guest";
  let hasTableParam = false;
  if (typeof window !== "undefined") {
    const query = new URLSearchParams(window.location.search);
    hasTableParam = !!(query.get("table") || query.get("tables"));
  }
  const resolvedTable = isGuest && !hasTableParam ? "" : selectedTable;

  if (isGuest && !resolvedTable) {
    return null;
  }

  return (
    <>
      <CartDrawer />
      <OrdersDrawer />
      <MobileBottomNav />
    </>
  );
}
