"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LogOut, Soup, Sparkles, Store, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Button from "@/components/ui/Button";

import HomeHeader from "@/components/home/HomeHeader";
import BannerSlider from "@/components/home/BannerSlider";
import CategoryTabs from "@/components/home/CategoryTabs";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useOrders, useTableOrders } from "@/hooks/useOrders";
import { Product } from "@/types/api";
import LandingPage from "@/components/home/LandingPage";
import { getImageUrl } from "@/utils/image";

function HomeContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const router = useRouter();

  const [isLandingPage, setIsLandingPage] = useState(false);

  // Detect if on landing page (main domain or about subdomain, with no store query)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn").toLowerCase();
      const storeQuery = searchParams.get("store");

      // Remove any port suffix from mainDomain just in case (e.g. localhost:3000 -> localhost)
      const cleanMainDomain = mainDomain.split(":")[0];

      const isMainDomain = 
        host === cleanMainDomain || 
        host === `www.${cleanMainDomain}` ||
        host === "localhost" || 
        host === "www.localhost" ||
        host === "127.0.0.1";

      if (isMainDomain && !storeQuery) {
        setIsLandingPage(true);
      } else {
        setIsLandingPage(false);
      }
    }
  }, [searchParams]);

  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);

  const {
    getTotalItems, toggleCart, toggleOrders, logout,
    userRole, selectedTable, setSelectedTable, tables, storeConfig,
    toastMessage, setToastMessage, storeError
  } = useCartStore();

  const isGuest = userRole === "guest";
  const urlTable = searchParams.get("table") || searchParams.get("tables");
  const resolvedTable = isGuest && !urlTable ? "" : selectedTable;

  const isStaff = userRole === "staff" || userRole === "admin" || userRole === "kitchen";
  const { data: allOrders = [] } = useOrders(isStaff);
  const { data: tableOrders = [] } = useTableOrders(resolvedTable);
  const apiOrders = isStaff ? allOrders : tableOrders;
  const activeOrdersCount = apiOrders.filter(o => !o.invoiceId && o.status.toUpperCase() !== "CANCELLED").length;

  const products = useMemo(() => productsData || [], [productsData]);
  const storeCategories = useMemo(() => categoriesData?.map(c => c.name) || [], [categoriesData]);

  // Adjust state during render to avoid cascading renders in useEffect
  if (storeCategories.length > 0 && !activeTab) {
    setActiveTab(storeCategories[0]);
  }

  const banners = useMemo(() => products
    .filter(item => (item.discountPercent || 0) > 0 && !!(item.bannerUrl || item.image))
    .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
    .slice(0, 5), [products]);

  useEffect(() => {
    const t = searchParams.get("table") || searchParams.get("tables");
    if (t) {
      const formattedTable = t.length === 1 ? t.padStart(2, "0") : t;
      if (selectedTable !== formattedTable) {
        setSelectedTable(formattedTable);
      }

      const isStaffOrAdmin = userRole === "admin" || userRole === "staff" || userRole === "kitchen";
      if (!isStaffOrAdmin && userRole !== "guest") {
        logout(); // Reset to guest
      }
    } else {
      if (userRole === "guest" && selectedTable !== "") {
        setSelectedTable("");
      }
    }
  }, [tableParam, setSelectedTable, logout, userRole, selectedTable, searchParams]);

  // Auto-dismiss toast feedback
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToCategory = (categoryName: string) => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    isManualScrollingRef.current = true;
    setActiveTab(categoryName);

    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      const headerOffset = 180; // HomeHeader + CategoryTabs offset on mobile/desktop
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 800);
  };

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }), [products, searchQuery]);

  // Intersection Observer to update active tab on scroll
  useEffect(() => {
    if (storeCategories.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: "-180px 0px -70% 0px", // triggers when section is in top portion of screen
      threshold: 0
    };

    const intersectingMap: { [key: string]: boolean } = {};

    const observer = new IntersectionObserver((entries) => {
      if (isManualScrollingRef.current) return;

      entries.forEach(entry => {
        intersectingMap[entry.target.id] = entry.isIntersecting;
      });

      const intersectingIds = Object.keys(intersectingMap).filter(id => intersectingMap[id]);
      if (intersectingIds.length > 0) {
        intersectingIds.sort((a, b) => {
          const elA = document.getElementById(a);
          const elB = document.getElementById(b);
          if (elA && elB) {
            return elA.getBoundingClientRect().top - elB.getBoundingClientRect().top;
          }
          return 0;
        });

        const targetId = intersectingIds[0];
        const categoryName = targetId.replace("category-", "");
        setActiveTab(categoryName);
      }
    }, observerOptions);

    storeCategories.forEach(cat => {
      const el = document.getElementById(`category-${cat}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [storeCategories, filteredProducts]);

  if (isLandingPage) {
    return <LandingPage />;
  }

  if (storeError) {
    const is403 = storeError.status === 403;
    const errorTitle = is403 ? "Cửa Hàng Tạm Ngưng Hoạt Động" : "Không Tìm Thấy Cửa Hàng";
    const errorDesc = is403 
      ? "Cửa hàng đang tạm thời đóng cửa hoặc ngừng hoạt động. Vui lòng quay lại sau hoặc liên hệ với quản trị viên quán."
      : "Đường dẫn cửa hàng không tồn tại hoặc đã được thay đổi. Vui lòng kiểm tra lại địa chỉ URL.";

    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl filter animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl filter animate-pulse delay-700"></div>

        {/* Header */}
        <header className="flex flex-col items-center text-center mt-12 space-y-4 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`w-16 h-16 md:w-20 md:h-20 ${is403 ? 'bg-amber-500' : 'bg-red-500'} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-red-950/50`}
          >
            {is403 ? <Store className="text-white w-9 h-9 md:w-11 md:h-11" /> : <AlertTriangle className="text-white w-9 h-9 md:w-11 md:h-11" />}
          </motion.div>

          <div>
            <span className="text-xs md:text-sm font-black text-gray-500 tracking-[0.25em] uppercase block">
              Thông Báo Hệ Thống
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-2">
              {errorTitle}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-md mx-auto w-full py-12 relative z-10 flex-grow flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center bg-gray-900/30 border border-white/10 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-red-950/20 space-y-6"
          >
            <div className={`w-16 h-16 ${is403 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'} rounded-2xl flex items-center justify-center mx-auto`}>
              {is403 ? <Store size={28} className="animate-pulse" /> : <AlertTriangle size={28} className="animate-pulse" />}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white">
                {is403 ? "Quán đang tạm đóng" : "Đường dẫn không hợp lệ"}
              </h3>
              <p className="text-xs md:text-sm text-gray-400 font-bold leading-relaxed px-2">
                {errorDesc}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                Quay Lại
              </Link>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest relative z-10">
          © 2026 Order QR
        </footer>
      </div>
    );
  }

  if (!storeConfig && !storeError) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Background Decorative Gradients for Wow Factor */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl filter animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl filter animate-pulse delay-700"></div>

        <div className="text-center space-y-4 relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary animate-spin">
            <Soup size={32} />
          </div>
          <div className="text-gray-400 font-bold text-sm tracking-wide">
            Đang tải cấu hình quán...
          </div>
        </div>
      </div>
    );
  }

  const showTableSelector = isGuest && !resolvedTable;

  if (showTableSelector) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Background Decorative Gradients for Wow Factor */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl filter animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl filter animate-pulse delay-700"></div>

        {/* Header */}
        <header className="flex flex-col items-center text-center mt-12 space-y-4 relative z-10">
          {/* Platform Main Logo: Rotating Big Soup (Pho) Bowl Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-orange-950/50 overflow-hidden relative"
          >
            {storeConfig?.logo ? (
              <img
                src={getImageUrl(storeConfig.logo)}
                alt="Store Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Soup className="text-white w-9 h-9 md:w-11 md:h-11" />
            )}
          </motion.div>

          <div>
            {/* Platform Brand: Order QR */}
            <span className="text-xs md:text-sm font-black text-primary tracking-[0.25em] uppercase block">
              Order QR
            </span>
            {/* Specific Name of Subdomain Store */}
            <h1 className="text-3xl font-black tracking-tight text-white mt-2">{storeConfig?.name || "Menu Việt"}</h1>
            {storeConfig?.description && (
              <p className="text-gray-300 font-bold text-sm mt-2 max-w-md mx-auto leading-relaxed">
                {storeConfig.description}
              </p>
            )}
            <p className="text-gray-400 font-medium text-xs mt-4 max-w-sm mx-auto italic">
              Vui lòng chọn bàn của bạn để xem thực đơn & gọi món
            </p>
          </div>
        </header>

        {/* Main Content: Table Selector Grid */}
        <main className="max-w-2xl mx-auto w-full py-12 relative z-10 flex-grow flex items-center">
          <div className="w-full space-y-8">
            {productsLoading || categoriesLoading ? (
              <div className="text-center font-bold text-gray-400">Đang tải cấu hình quán...</div>
            ) : tables.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-gray-900/30 border border-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] max-w-sm mx-auto shadow-2xl shadow-orange-950/20 space-y-5"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary animate-pulse">
                  <Sparkles size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">Quán Đang Chuẩn Bị...</h3>
                  <p className="text-xs text-gray-400 font-bold leading-relaxed px-2">
                    Cửa hàng đang thiết lập thực đơn và sơ đồ bàn ăn. Vui lòng quay lại sau ít phút để bắt đầu gọi món nhé!
                  </p>
                </div>
                <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-widest font-mono">
                  Coming Soon
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 px-2"
              >
                 {tables.map((t) => (
                  <Button
                    key={t}
                    as={motion.button}
                    unstyled
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTable(t);
                      const newUrl = `${window.location.pathname}?table=${t}`;
                      window.history.pushState(null, "", newUrl);
                    }}
                    className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-gray-800 bg-gray-900/20 backdrop-blur-md hover:border-primary hover:bg-gray-900/60 shadow-lg transition-all duration-300 group"
                  >
                    <span className="text-[11px] font-bold text-gray-500 tracking-wider group-hover:text-primary-soft uppercase">BÀN</span>
                    <span className="text-3xl font-black text-white group-hover:text-primary">{t}</span>
                  </Button>
                ))}
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-gray-500 font-medium relative z-10">
          <p className="opacity-80">Hoặc quét mã QR dán tại bàn của bạn</p>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-4">© 2026 Triet Dang</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <HomeHeader
        userRole={userRole}
        selectedTable={resolvedTable}
        tables={tables}
        isTableSelectorOpen={isTableSelectorOpen}
        setIsTableSelectorOpen={setIsTableSelectorOpen}
        setSelectedTable={setSelectedTable}
        toggleCart={toggleCart}
        toggleOrders={toggleOrders}
        logout={logout}
        getTotalItems={getTotalItems}
        orderCount={activeOrdersCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-12">
        {productsLoading || categoriesLoading ? (
          <div className="py-20 text-center font-bold text-gray-400">Đang tải dữ liệu...</div>
        ) : (
          <>
            {banners.length > 0 && <BannerSlider banners={banners} />}

            <CategoryTabs
              categories={storeCategories}
              activeTab={activeTab}
              onTabChange={scrollToCategory}
            />
          </>
        )}

        {/* Product List grouped by Category */}
        <div className="space-y-16">
          {storeCategories.map((cat) => {
            const catProducts = filteredProducts.filter(p => p.category === cat);
            if (catProducts.length === 0) return null;

            return (
              <div key={cat} id={`category-${cat}`} className="scroll-mt-60">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full"></span>
                  {cat}
                </h3>
                <div className={`grid gap-4 transition-all duration-500 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                  {catProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      key={product.id}
                      onClick={() => product.isAvailable !== false && setSelectedProduct(product)}
                      className={product.isAvailable === false ? "cursor-default" : "cursor-pointer"}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 pb-36 text-center flex flex-col items-center gap-4 relative z-10">
        {(userRole === "admin" || userRole === "staff" || userRole === "kitchen") && (
          <div className="flex flex-col items-center gap-4 mb-4 md:hidden">
            <div className="flex items-center gap-6">
              {userRole === "kitchen" && (
                <Link
                  href="/admin/kitchen"
                  className="text-orange-500 hover:text-primary font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Vào Bếp
                </Link>
              )}
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
        <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase mt-4">© 2026 Triet Dang</p>
      </footer>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Global Glassmorphic Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-8 left-1/2 z-50 bg-black/85 backdrop-blur-xl border border-white/20 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 whitespace-nowrap min-w-[280px]"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
              ✨
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">{toastMessage}</p>
              <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-1">Giỏ hàng đã cập nhật</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Đang tải menu...</div>}>
      <HomeContent />
    </Suspense>
  );
}
