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

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isExpired = storeConfig?.subscriptionEnd && new Date() > new Date(storeConfig.subscriptionEnd);
  const isSuspended = storeConfig?.subscriptionStatus === 'EXPIRED' || isExpired;
  const isAdminOrSuperAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || pathname.startsWith("/super-login");

  if (isSuspended && !isAdminOrSuperAdminPath) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center p-6 text-center select-none">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-black mb-3 tracking-tight">Cửa hàng tạm ngưng dịch vụ</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Dịch vụ của cửa hàng <span className="text-white font-bold">{storeConfig?.name || "này"}</span> hiện đang tạm thời bị gián đoạn do hết hạn gói thuê.
          </p>
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Vui lòng liên hệ Quản trị viên để gia hạn
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>{storeConfig?.name ? `${storeConfig.name} - Đặt Món Online` : "Order QR - Đặt Món Online"}</title>
      <link rel="icon" href="/orderqr-logo.svg" type="image/svg+xml" />
    </>
  );
}
