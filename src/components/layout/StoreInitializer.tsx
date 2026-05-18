"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useSearchParams } from "next/navigation";

export default function StoreInitializer() {
  const { fetchStoreConfig, storeConfig } = useCartStore();
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // 1. Detect Slug from Subdomain or Query Param
    const host = window.location.hostname;
    const storeQuery = searchParams.get("store");
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn";

    let slug = "default";

    if (storeQuery) {
      slug = storeQuery;
    } else if (host.endsWith(`.${mainDomain}`)) {
      // Extract the subdomain prefix before the main domain (e.g. banh-xeo from banh-xeo.orderqr.id.vn)
      const sub = host.substring(0, host.length - mainDomain.length - 1);
      if (sub && sub !== "www" && sub !== "admin" && sub !== "superadmin") {
        slug = sub;
      }
    } else if (
      host !== "localhost" && 
      host !== "127.0.0.1" && 
      host !== mainDomain &&
      !host.includes("orderpro")
    ) {
      // Fallback for custom domains or localhost/test setups
      slug = host.split(".")[0] || "default";
    }

    // 2. Only Fetch if slug has changed or config is missing
    if (!storeConfig || storeConfig.slug !== slug) {
      fetchStoreConfig(slug);
    }
  }, [isMounted, fetchStoreConfig, searchParams, storeConfig]);

  useEffect(() => {
    if (!isMounted) return;

    // 3. Apply Theme Color to CSS Variables
    if (storeConfig?.themeColor) {
      document.documentElement.style.setProperty("--primary", storeConfig.themeColor);
      document.documentElement.style.setProperty("--primary-soft", `${storeConfig.themeColor}1a`); // 10% opacity
    }
  }, [isMounted, storeConfig]);

  return null;
}
