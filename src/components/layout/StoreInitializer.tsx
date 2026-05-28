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
    const host = window.location.hostname.toLowerCase();
    const storeQuery = searchParams.get("store");
    const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn").toLowerCase();

    // Remove any port suffix from mainDomain just in case (e.g. localhost:3000 -> localhost)
    const cleanMainDomain = mainDomain.split(":")[0];

    const isMainDomain = 
      host === cleanMainDomain || 
      host === `www.${cleanMainDomain}` ||
      host === "localhost" || 
      host === "www.localhost" ||
      host === "127.0.0.1";

    if (isMainDomain && !storeQuery) {
      // Base landing/superadmin domain. Skip fetching.
      return;
    }

    let slug = "default";

    if (storeQuery) {
      slug = storeQuery;
    } else {
      // 1. If it's a subdomain of the main domain (e.g. banh-xeo.orderqr.id.vn)
      if (host.endsWith(`.${cleanMainDomain}`)) {
        const sub = host.substring(0, host.length - cleanMainDomain.length - 1);
        if (sub && sub !== "www" && sub !== "admin" && sub !== "superadmin") {
          slug = sub;
        }
      } 
      // 2. If it's a subdomain of localhost (e.g. banh-xeo.localhost)
      else if (host.endsWith(".localhost")) {
        const sub = host.substring(0, host.length - ".localhost".length);
        if (sub && sub !== "www" && sub !== "admin" && sub !== "superadmin") {
          slug = sub;
        }
      }
      // 3. Fallback for custom domains or other test setups
      else if (!isMainDomain && !host.includes("orderpro")) {
        slug = host.split(".")[0] || "default";
      }
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
