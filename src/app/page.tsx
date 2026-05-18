"use client";

import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LogOut, Soup } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import HomeHeader from "@/components/home/HomeHeader";
import BannerSlider from "@/components/home/BannerSlider";
import CategoryTabs from "@/components/home/CategoryTabs";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Product } from "@/types/api";

function HomeContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const [activeTab, setActiveTab] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);

  const {
    getTotalItems, toggleCart, toggleOrders, orders, logout,
    userRole, selectedTable, setSelectedTable, tables, storeConfig,
    toastMessage, setToastMessage
  } = useCartStore();

  const products = useMemo(() => productsData || [], [productsData]);
  const storeCategories = useMemo(() => categoriesData?.map(c => c.name) || [], [categoriesData]);

  // Adjust state during render to avoid cascading renders in useEffect
  if (storeCategories.length > 0 && !activeTab) {
    setActiveTab(storeCategories[0]);
  }

  const banners = useMemo(() => products
    .filter(item => item.bannerUrl && item.promoTitle && item.promoDescription && (item.discountPercent || 0) > 0)
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

  const scrollToCategory = (categoryName: string) => {
    setActiveTab(categoryName);
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab ? product.category === activeTab : true;
    return matchesSearch && matchesCategory;
  }), [products, searchQuery, activeTab]);

  const isGuest = userRole === "guest";
  const showTableSelector = isGuest && !selectedTable && !searchParams.get("table");

  if (showTableSelector) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Background Decorative Gradients for Wow Factor */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl filter animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-500 opacity-10 rounded-full blur-3xl filter animate-pulse delay-700"></div>

        {/* Header */}
        <header className="flex flex-col items-center text-center mt-12 space-y-4 relative z-10">
          {/* Platform Main Logo: Rotating Big Soup (Pho) Bowl Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-orange-950/50"
          >
            <Soup className="text-white w-9 h-9 md:w-11 md:h-11" />
          </motion.div>

          <div>
            {/* Platform Brand: Order QR */}
            <span className="text-xs md:text-sm font-black text-primary tracking-[0.25em] uppercase block">
              Order QR
            </span>
            {/* Specific Name of Subdomain Store */}
            <h1 className="text-3xl font-black tracking-tight text-white mt-2">{storeConfig?.name || "Menu Việt"}</h1>
            <p className="text-gray-400 font-medium text-sm mt-3 max-w-sm italic">
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
              <div className="text-center text-gray-500 py-10">Không tìm thấy bàn nào. Vui lòng liên hệ nhân viên.</div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 px-2"
              >
                {tables.map((t) => (
                  <motion.button
                    key={t}
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
                  </motion.button>
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
        selectedTable={selectedTable}
        tables={tables}
        isTableSelectorOpen={isTableSelectorOpen}
        setIsTableSelectorOpen={setIsTableSelectorOpen}
        setSelectedTable={setSelectedTable}
        toggleCart={toggleCart}
        toggleOrders={toggleOrders}
        logout={logout}
        getTotalItems={getTotalItems}
        orderCount={orders.filter(o => o.tableNumber === selectedTable && o.status.toLowerCase() !== "completed").length}
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
            <BannerSlider banners={banners} />

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
                      onClick={() => setSelectedProduct(product)}
                      className="cursor-pointer"
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
              {userRole === "admin" && (
                <Link
                  href="/admin"
                  className="text-blue-500 hover:text-blue-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  Quản lý
                </Link>
              )}
              {userRole === "kitchen" && (
                <Link
                  href="/admin/kitchen"
                  className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
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
