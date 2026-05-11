"use client";

import { useCartStore, Order } from "@/store/cartStore";
import { ChevronLeft as ChevronLeftIcon, CheckCircle2 as CheckIcon, Receipt as ReceiptIcon, Clock as ClockIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminTablesPage() {
  const { orders, clearTableOrders } = useCartStore();

  const tables = orders.reduce((acc, order) => {
    if (!acc[order.tableNumber]) {
      acc[order.tableNumber] = [];
    }
    acc[order.tableNumber].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCheckout = (tableNumber: string) => {
    if (confirm(`Xác nhận thanh toán và giải phóng Bàn ${tableNumber}?`)) {
      clearTableOrders(tableNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeftIcon size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Quản lý Bàn</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Đang hoạt động: {Object.keys(tables).length} bàn
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {Object.keys(tables).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ReceiptIcon size={64} className="mb-4 opacity-20" />
            <p className="text-lg italic">Hiện không có bàn nào đang sử dụng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(tables).map(([tableNumber, tableOrders]) => {
              const totalAmount = tableOrders.reduce((sum, order) => sum + order.totalPrice, 0);
              const lastOrderTime = new Date(Math.max(...tableOrders.map(o => o.timestamp)));

              return (
                <motion.div
                  key={tableNumber}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="p-6 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-200">
                        {tableNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Bàn {tableNumber}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ClockIcon size={12} />
                          {lastOrderTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tổng cộng</div>
                      <div className="text-lg font-black text-orange-600">{formatPrice(totalAmount)}</div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 space-y-4 max-h-[400px] overflow-y-auto">
                    {tableOrders.map((order) => (
                      <div key={order.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đơn #{order.id.slice(-4)}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.status === "completed" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                          }`}>
                            {order.status === "completed" ? "Đã phục vụ" : "Đang xử lý"}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                <span className="font-bold text-orange-500">{item.quantity}x</span> {item.name}
                              </span>
                              <span className="text-gray-500">{formatPrice(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-gray-50 border-t mt-auto">
                    <button
                      onClick={() => handleCheckout(tableNumber)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                    >
                      <CheckIcon size={20} />
                      Thanh toán & Trả bàn
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
