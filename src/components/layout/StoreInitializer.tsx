"use client";
 
import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/providers/SocketProvider";
import { KeyRound, Phone, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  const t = useTranslation();
  const { fetchStoreConfig, storeConfig, storeError } = useCartStore();
  const searchParams = useSearchParams();
  const { socket } = useSocket();
 
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
 
  // Listen for real-time store config updates (e.g. renewal approved by superadmin)
  useEffect(() => {
    if (!socket || !isMounted) return;
 
    const slug = getSlug(searchParams);
    if (!slug) return;
 
    const handleConfigUpdate = () => {
      fetchStoreConfig(slug);
    };
 
    socket.on('store_config_update', handleConfigUpdate);
    return () => {
      socket.off('store_config_update', handleConfigUpdate);
    };
  }, [isMounted, socket, fetchStoreConfig, searchParams]);

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
  const isExpired = storeConfig?.subscriptionEnd != null && new Date() > new Date(storeConfig.subscriptionEnd);
  const isSuspended = storeConfig?.subscriptionStatus === 'EXPIRED' || isExpired;
  const isAdminOrSuperAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || pathname.startsWith("/super-login");
  const suspendedStoreName = storeConfig?.name || t.page.subscriptionSuspendedStoreFallback;
  const [suspendedDescPrefix, suspendedDescSuffix = ""] = t.page.subscriptionSuspendedDesc.split("{name}");

  if (isSuspended && !isAdminOrSuperAdminPath) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center p-6 text-center">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
            <AlertTriangle size={36} className="animate-pulse" />
          </div>
          <h2 className="text-white text-2xl font-black mb-3 tracking-tight">{t.page.subscriptionSuspendedTitle}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-semibold">
            {suspendedDescPrefix}
            <span className="text-white font-bold">{suspendedStoreName}</span>
            {suspendedDescSuffix}
          </p>

          <div className="flex flex-col w-full gap-3 mt-4">
            <a
              href="/admin/billing"
              className="w-full py-3.5 px-4 bg-primary hover:bg-[#E06C00] text-white font-black rounded-xl shadow-lg shadow-orange-500/10 transition-all active:scale-[0.98] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound size={15} />
              {t.page.manageRenewal}
            </a>
            
            <a
              href="tel:0707898849"
              className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold rounded-xl transition-all active:scale-[0.98] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone size={15} className="text-orange-500" />
              {t.page.callHotline}
            </a>
          </div>

          <div className="text-[10px] font-bold text-gray-500 mt-6 uppercase tracking-wider">
            {t.page.subscriptionSuspendedHint}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>{storeConfig?.name ? t.page.documentTitle.replace("{name}", storeConfig.name) : t.landing.title}</title>
      <link rel="icon" href="/orderqr-logo.svg" type="image/svg+xml" />
    </>
  );
}
