"use client";

import { useCartStore } from "@/store/cartStore";
import { Utensils, ClipboardList, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useOrders, useTableOrders } from "@/hooks/useOrders";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { 
    getTotalItems, 
    toggleCart, 
    toggleOrders, 
    selectedTable, 
    isOpen, 
    isOrdersOpen,
    userRole
  } = useCartStore();

  const [popOrder, setPopOrder] = useState(false);
  const [popCart, setPopCart] = useState(false);

  const isStaff = userRole === "staff" || userRole === "admin" || userRole === "kitchen";
  const { data: allOrders = [] } = useOrders(isStaff);
  const { data: tableOrders = [] } = useTableOrders(selectedTable);
  const apiOrders = isStaff ? allOrders : tableOrders;
  const activeOrdersCount = apiOrders.filter(o => !o.invoiceId && o.status.toUpperCase() !== "CANCELLED").length;

  const totalItems = getTotalItems();

  // Pop animation for Cart changes
  useEffect(() => {
    if (totalItems > 0) {
      setPopCart(true);
      const timer = setTimeout(() => setPopCart(false), 450);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Pop animation for Orders changes
  useEffect(() => {
    if (activeOrdersCount > 0) {
      const handle = requestAnimationFrame(() => setPopOrder(true));
      const timer = setTimeout(() => setPopOrder(false), 450);
      return () => {
        cancelAnimationFrame(handle);
        clearTimeout(timer);
      };
    }
  }, [activeOrdersCount]);

  if (pathname !== "/" || (!selectedTable && !isStaff)) return null;

  const handleMenuClick = () => {
    if (isOpen) toggleCart();
    if (isOrdersOpen) toggleOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCartClick = () => {
    if (isOrdersOpen) toggleOrders();
    toggleCart();
  };

  const handleOrdersClick = () => {
    if (isOpen) toggleCart();
    toggleOrders();
  };

  const tabs = [
    { id: "menu", label: "Menu", icon: Utensils, active: !isOpen && !isOrdersOpen, onClick: handleMenuClick },
    { id: "cart", label: "Giỏ hàng", icon: ShoppingBag, active: isOpen, onClick: handleCartClick, badge: totalItems },
    { id: "orders", label: "Đơn hàng", icon: ClipboardList, active: isOrdersOpen, onClick: handleOrdersClick, badge: activeOrdersCount },
  ];

  return (
    <motion.div 
      className="md:hidden fixed bottom-6 left-6 right-6 z-50"
      animate={popCart ? { scale: [1, 1.08, 0.96, 1.02, 1] } : {}}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      <div 
        className={`bg-white/85 backdrop-blur-xl border flex justify-between items-center relative gap-1 transition-all duration-500 rounded-[2.2rem] px-3 py-2 ${
          totalItems > 0 
            ? "border-primary/30 shadow-[0_8px_32px_rgba(249,115,22,0.22)] shadow-primary/20" 
            : "border-white/50 shadow-2xl"
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className="flex-1 relative py-2 flex flex-col items-center justify-center transition-all duration-300 rounded-2xl active:scale-95 cursor-pointer"
            >
              {tab.active && (
                <motion.div
                  layoutId="activeTabPill"
                  className={`absolute inset-0 rounded-2xl ${
                    tab.id === "orders" ? "bg-blue-50" : "bg-primary-soft"
                  }`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <div className={`relative z-10 p-1 flex flex-col items-center ${
                tab.active 
                  ? (tab.id === "orders" ? "text-blue-600" : "text-primary") 
                  : "text-gray-400 hover:text-gray-600"
              }`}>
                <motion.div 
                  className="relative"
                  animate={
                    tab.id === "cart"
                      ? (popCart
                          ? { scale: [1, 1.6, 0.9, 1.35], rotate: [0, -10, 8, -4, 0] }
                          : { scale: totalItems > 0 ? 1.35 : 1.0, rotate: 0 })
                      : tab.id === "orders"
                        ? (popOrder
                            ? { scale: [1, 1.6, 0.9, 1.35] }
                            : { scale: activeOrdersCount > 0 ? 1.35 : 1.0 })
                        : {}
                  }
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <Icon size={22} strokeWidth={tab.active ? 2.5 : 2} className="transition-transform duration-300" />
                  
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black border-2 border-white shadow-sm transition-all ${
                      tab.id === "orders" 
                        ? "bg-blue-500 text-white" 
                        : "bg-primary text-white shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse"
                    }`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </motion.div>
                
                <span className="text-[10px] font-black uppercase tracking-wider mt-1 block">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
