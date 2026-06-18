"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Soup, ChevronDown, ShoppingBag, ClipboardList, LayoutDashboard, LogOut, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";
import { UserRole, useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getImageUrl } from "@/utils/image";

interface HomeHeaderProps {
  userRole: UserRole;
  selectedTable: string;
  tables: string[];
  isTableSelectorOpen: boolean;
  setIsTableSelectorOpen: (open: boolean) => void;
  setSelectedTable: (table: string) => void;
  toggleCart: () => void;
  toggleOrders: () => void;
  logout: () => void;
  getTotalItems: () => number;
  orderCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export default function HomeHeader({
  userRole,
  selectedTable,
  tables,
  isTableSelectorOpen,
  setIsTableSelectorOpen,
  setSelectedTable,
  toggleCart,
  toggleOrders,
  logout,
  getTotalItems,
  orderCount,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: HomeHeaderProps) {
  const { storeConfig } = useCartStore();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {storeConfig?.logo ? (
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden relative shrink-0 border border-gray-100 shadow-md">
              <img
                src={getImageUrl(storeConfig.logo)}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 md:w-12 md:h-12 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary rotate-3 shrink-0">
              <Soup className="text-white w-5 h-5 md:w-7 md:h-7" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-none">
              {storeConfig?.name || "Menu Việt"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] md:text-xs font-bold text-primary tracking-[0.2em] uppercase shrink-0">
                Order QR
              </span>
              {storeConfig?.description && (
                <>
                  <span className="text-gray-300 text-xs">|</span>
                  <span className="text-[10px] md:text-xs text-gray-500 font-bold truncate max-w-[150px] sm:max-w-[300px]">
                    {storeConfig.description}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table Badge / Selector */}
        <div className="relative flex flex-col items-end">
          {userRole === "staff" ? (
            <Button
              onClick={() => setIsTableSelectorOpen(!isTableSelectorOpen)}
              unstyled
              className="bg-blue-50 border-2 border-blue-100 px-4 py-2 rounded-xl flex items-center justify-center shadow-sm gap-2 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-none">
                  Phục vụ bàn
                </span>
                <span className="font-black text-xl text-blue-700 leading-none">
                  {selectedTable || "??"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-blue-600 transition-transform ${
                  isTableSelectorOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          ) : (
            <div className="bg-primary-soft border-2 border-primary px-4 md:px-6 py-2 rounded-xl flex items-center justify-center shadow-sm gap-2">
              <span className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-wider hidden md:inline-block">
                Bàn số
              </span>
              <span className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-wider md:hidden mb-0.5">
                Bàn
              </span>
              <span className="font-black text-xl md:text-2xl text-primary leading-none">
                {selectedTable || "??"}
              </span>
            </div>
          )}

          <AnimatePresence>
            {isTableSelectorOpen && userRole === "staff" && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-2 right-0 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-50 overflow-hidden"
              >
                <p className="text-[10px] font-bold text-gray-400 uppercase p-2 border-b border-gray-50 mb-1">
                  Chọn bàn phục vụ
                </p>
                <div className="grid grid-cols-3 gap-1 max-h-[300px] overflow-y-auto p-1">
                  {tables.map((t) => (
                    <Button
                      key={t}
                      onClick={() => {
                        setSelectedTable(t);
                        setIsTableSelectorOpen(false);
                      }}
                      unstyled
                      className={`py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                        selectedTable === t ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Navigation Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={toggleOrders}
            unstyled
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary transition-all font-bold text-sm border border-transparent hover:border-primary/20 cursor-pointer"
          >
            <ClipboardList size={18} />
            <span>Đơn đã gọi</span>
            {orderCount > 0 && (
              <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                {orderCount}
              </span>
            )}
          </Button>

          <Button
            onClick={toggleCart}
            unstyled
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary transition-all font-bold text-sm shadow-lg shadow-primary cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span>Giỏ hàng</span>
            {getTotalItems() > 0 && (
              <span className="bg-white text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                {getTotalItems()}
              </span>
            )}
          </Button>

          {userRole === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-bold text-sm border border-blue-100 cursor-pointer"
            >
              <LayoutDashboard size={18} />
              <span>Quản lý</span>
            </Link>
          )}

          {(userRole === "admin" || userRole === "staff" || userRole === "kitchen") && (
            <Button
              onClick={logout}
              unstyled
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all font-bold text-sm border border-red-100 cursor-pointer"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar & Mode Switcher */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4 flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Tìm món ngon..."
            unstyled
            className="w-full bg-gray-50 border-none rounded-2xl py-3 md:py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-gray-50 p-1.5 rounded-2xl flex items-center gap-1">
          <Button
            onClick={() => setViewMode("grid")}
            unstyled
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-gray-400"
            }`}
          >
            <LayoutGrid size={20} strokeWidth={2.5} />
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            unstyled
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-gray-400"
            }`}
          >
            <ListIcon size={20} strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </header>
  );
}
