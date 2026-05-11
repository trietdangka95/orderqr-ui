"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { Search, ClipboardList, Bell, Settings, LayoutDashboard, Soup, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { getTotalItems, toggleCart, toggleOrders, orders, isAdmin, logout } = useCartStore();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setActiveTab(data[0].id);
      });
  }, []);

  // Cuộn đến danh mục
  const scrollToCategory = (categoryId: string) => {
    setActiveTab(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 140; // Chiều cao của header + tabs
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const activeOrdersCount = orders ? orders.filter(o => o.status !== "completed").length : 0;

  return (
    <main className="max-w-7xl mx-auto bg-[#fdfbf7] min-h-screen pb-32 md:pb-12 relative shadow-2xl md:shadow-none md:bg-transparent">
      {/* Header cho Dine-in */}
      <header className="bg-white px-5 md:px-8 py-4 sticky top-0 z-40 shadow-sm flex items-center justify-between rounded-none md:rounded-b-2xl">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
            <span className="text-2xl">H</span>
          </div>
          <div>
            <h1 className="font-black text-gray-900 text-lg md:text-2xl leading-tight tracking-tight">HOMI MEDIA</h1>
            <p className="text-[13px] md:text-[15px] text-gray-500 font-medium">Order tại bàn</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 mr-2 border-r border-gray-100 pr-6">
            <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-semibold">
              <Bell className="w-5 h-5" />
              <span>Gọi phục vụ</span>
            </button>
            <button onClick={toggleOrders} className={`flex items-center gap-2 transition-colors font-semibold relative ${activeOrdersCount > 0 ? "text-primary" : "text-gray-600 hover:text-primary"}`}>
              <div className="relative">
                <ClipboardList className="w-5 h-5" />
                {activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                )}
              </div>
              <span>Đơn đã gọi</span>
            </button>

            {isAdmin && (
              <>
                <Link href="/admin" className="flex items-center gap-2 text-primary hover:text-primary transition-colors font-bold bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 shadow-sm">
                  <Settings className="w-5 h-5" />
                  <span>Quản trị Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-semibold border-l border-gray-100 pl-6"
                >
                  Thoát
                </button>
              </>
            )}
          </div>

          <div className="bg-orange-50 border-2 border-orange-100 px-4 md:px-6 py-2 rounded-xl flex items-center justify-center shadow-sm gap-2">
            <span className="text-[10px] md:text-xs text-orange-600 font-bold uppercase tracking-wider hidden md:inline-block">Bàn số</span>
            <span className="text-[10px] md:text-xs text-orange-600 font-bold uppercase tracking-wider md:hidden mb-0.5">Bàn</span>
            <span className="font-black text-xl md:text-2xl text-primary leading-none">05</span>
          </div>

          {/* Desktop & Mobile Floating Cart Button */}
          <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40">
            <button
              onClick={toggleCart}
              className={`w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-orange-300 flex items-center justify-center relative transition-all duration-300 hover:scale-105 active:scale-95 ${getTotalItems() > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"}`}
            >
              <span className="text-2xl">🛒</span>
              {getTotalItems() > 0 && (
                <motion.span
                  key={getTotalItems()}
                  initial={{ scale: 0.5, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar & View Mode Toggle */}
      <div className="px-5 md:px-8 pt-6 pb-2 max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-4 items-center">
        <div className="relative shadow-sm rounded-2xl overflow-hidden flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Tìm món ăn, đồ uống..."
            className="w-full bg-white border-none py-3.5 pl-12 pr-4 text-[15px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 self-end md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "text-gray-400 hover:text-gray-600"}`}
            title="Xem dạng lưới"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "text-gray-400 hover:text-gray-600"}`}
            title="Xem dạng danh sách"
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* Sticky Category Tabs */}
      <div className="sticky top-[80px] md:top-[88px] z-30 bg-[#fdfbf7]/95 backdrop-blur-md pt-4 pb-2 overflow-x-auto hide-scrollbar">
        <div className="flex px-5 md:px-8 gap-3 md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === cat.id
                  ? "bg-primary text-white shadow-lg shadow-orange-200 scale-105"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="px-5 md:px-8 pt-6 flex flex-col space-y-10 md:space-y-14">
        {categories.map((category) => {
          const catProducts = products.filter(p => p.categoryId === category.id);
          if (catProducts.length === 0) return null;

          return (
            <div key={category.id} id={`category-${category.id}`} className="scroll-mt-[160px]">
              <h3 className="text-xl md:text-2xl font-black mb-5 md:mb-6 text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full"></span>
                {category.name}
              </h3>
              <div className={viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                : "flex flex-col gap-4"
              }>
                {catProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Subtle Admin Link */}
      <footer className="mt-20 pb-10 text-center">
        {!isAdmin && (
          <Link href="/admin/menu" className="text-[10px] text-gray-300 hover:text-gray-400 transition-colors uppercase tracking-widest font-bold">
            Admin Login
          </Link>
        )}
      </footer>
    </main>
  );
}
