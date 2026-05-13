"use client";

import { useCartStore } from "@/store/cartStore";
import { Utensils, Bell, ClipboardList, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getTotalItems, toggleCart, toggleOrders, orders, selectedTable } = useCartStore();

  const [popCart, setPopCart] = useState(false);
  const [popOrder, setPopOrder] = useState(false);

  const totalItems = getTotalItems();
  const activeOrdersCount = orders.filter(o => o.tableNumber === selectedTable).length;

  useEffect(() => {
    if (totalItems > 0) {
      setPopCart(true);
      const timer = setTimeout(() => setPopCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    if (activeOrdersCount > 0) {
      setPopOrder(true);
      const timer = setTimeout(() => setPopOrder(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeOrdersCount]);

  if (pathname !== "/") return null;

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-3xl px-6 py-3 flex justify-between items-center relative overflow-visible">

        {/* Menu Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center text-primary transition-all active:scale-90"
        >
          <Utensils size={24} className="mb-0.5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Menu</span>
        </button>

        {/* Cart Button with Highlight */}
        <button
          onClick={toggleCart}
          className="relative flex flex-col items-center group active:scale-90 transition-all"
        >
          <div className={`relative p-2 rounded-2xl transition-all duration-300 ${totalItems > 0 ? "bg-primary text-white shadow-lg shadow-orange-200 -mt-8 scale-125 border-4 border-[#fdfbf7]" : "text-gray-400"}`}>
            <ShoppingBag size={totalItems > 0 ? 24 : 24} />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={`absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full font-black text-[10px] border-2 ${totalItems > 0 ? "bg-white text-primary border-primary" : "bg-primary text-white border-white"}`}
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className={`text-[9px] uppercase tracking-tighter mt-1 font-black ${totalItems > 0 ? "text-primary" : "text-gray-400"}`}>
            Giỏ hàng
          </span>
        </button>

        {/* Orders Button */}
        <button
          onClick={toggleOrders}
          className={`flex flex-col items-center transition-all active:scale-90 relative ${activeOrdersCount > 0 ? "text-blue-600" : "text-gray-400"}`}
        >
          <div className="relative">
            <ClipboardList size={24} />
            {activeOrdersCount > 0 && (
              <motion.div
                animate={popOrder ? { scale: [1, 1.5, 1] } : {}}
                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                {activeOrdersCount}
              </motion.div>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Đơn hàng</span>
        </button>
      </div>
    </div>
  );
}
