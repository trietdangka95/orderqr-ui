"use client";

import { useCartStore } from "@/store/cartStore";
import { Utensils, Bell, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
  const { getTotalItems, toggleCart, toggleOrders, orders } = useCartStore();
  const totalItems = getTotalItems();
  const activeOrdersCount = orders.filter(o => o.status !== "completed").length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 px-6 py-3 flex justify-between items-center pb-safe">
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex flex-col items-center text-primary transition-colors"
      >
        <Utensils className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-bold uppercase">Menu</span>
      </button>

      <button onClick={toggleOrders} className={`flex flex-col items-center transition-colors relative ${activeOrdersCount > 0 ? "text-primary" : "text-gray-400 hover:text-primary"}`}>
        <div className="relative">
          <ClipboardList className="w-6 h-6 mb-1" />
          {activeOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>
        <span className={`text-[10px] uppercase mt-0.5 ${activeOrdersCount > 0 ? "font-bold" : "font-medium"}`}>Đơn đã gọi</span>
      </button>

      <button className="flex flex-col items-center text-gray-400 hover:text-primary transition-colors">
        <Bell className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium uppercase mt-0.5">Gọi Phục Vụ</span>
      </button>

    </div>
  );
}
