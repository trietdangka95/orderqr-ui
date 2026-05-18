"use client";

import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { LayoutDashboard, LogOut } from "lucide-react";
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
    userRole, selectedTable, setSelectedTable, tables
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
