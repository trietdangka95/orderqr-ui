"use client";

import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useSearchParams } from "next/navigation";

// Helper function to extract store slug from host or search params
function getSlug(searchParams: URLSearchParams): string | null {
  if (typeof window === "undefined") return "default";

  let host = window.location.hostname.toLowerCase();
  if (host.startsWith("www.")) {
    host = host.substring(4);
  }
  const storeQuery = searchParams.get("store");
  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn").toLowerCase();
  const cleanMainDomain = mainDomain.split(":")[0];

  const isMainDomain = 
    host === cleanMainDomain || 
    host === `www.${cleanMainDomain}` ||
    host === "localhost" || 
    host === "www.localhost" ||
    host === "127.0.0.1";

  if (isMainDomain && !storeQuery) {
    return null;
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
  return slug;
}

export default function StoreInitializer() {
  const { fetchStoreConfig, storeConfig, storeError } = useCartStore();
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const fetchedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const slug = getSlug(searchParams);

    if (slug === null) {
      // Clear store context since we are on the main domain
      const currentConfig = useCartStore.getState().storeConfig;
      const currentError = useCartStore.getState().storeError;
      if (currentConfig !== null || currentError !== null) {
        useCartStore.setState({ storeConfig: null, storeError: null });
      }
      fetchedSlugRef.current = null;

      // Base landing/superadmin domain. Skip fetching.
      // Enforce domain routing: main domain only allows /, /super-login, and /superadmin
      const pathname = window.location.pathname;
      const isAllowedPathOnMainDomain = 
        pathname === "/" || 
        pathname === "/super-login" || 
        pathname.startsWith("/superadmin");

      if (!isAllowedPathOnMainDomain) {
        window.location.href = "/";
      }
      return;
    }

    // Fetch config if not yet fetched for this slug in this component session
    if (fetchedSlugRef.current !== slug) {
      fetchStoreConfig(slug);
      fetchedSlugRef.current = slug;
    }

    // Refetch store configuration when tab becomes visible (handles mobile resumes / screen wakeups)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && slug) {
        fetchStoreConfig(slug);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMounted, fetchStoreConfig, searchParams]);

  useEffect(() => {
    if (!isMounted) return;

    // Apply Theme Color & Page Title dynamically
    if (storeConfig?.themeColor) {
      document.documentElement.style.setProperty("--primary", storeConfig.themeColor);
      document.documentElement.style.setProperty("--primary-soft", `${storeConfig.themeColor}1a`); // 10% opacity
    }
  }, [isMounted, storeConfig]);

  useEffect(() => {
    if (!isMounted) return;

    // Redirect to home if there is an error loading the store on a subpath (e.g. store inactive/not found)
    if (storeError && window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }, [isMounted, storeError]);

  return (
    <>
      <title>{storeConfig?.name ? `${storeConfig.name} - Đặt Món Online` : "Order QR - Đặt Món Online"}</title>
      <link rel="icon" href="/orderqr-logo.svg" type="image/svg+xml" />
    </>
  );
}
