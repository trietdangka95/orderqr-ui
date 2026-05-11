"use client";

import { useCartStore, OrderStatus } from "@/store/cartStore";
import { useEffect, useState, useRef } from "react";
import OrderTicket from "@/components/kitchen/OrderTicket";
import { ChevronLeft, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useCartStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [view, setView] = useState<"board" | "summary">("board");

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    }
  }, []);

  const [prevPendingCount, setPrevPendingCount] = useState(0);
  useEffect(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    if (pendingCount > prevPendingCount && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setPrevPendingCount(pendingCount);
  }, [orders, prevPendingCount]);

  const advanceStatus = (orderId: string, current: OrderStatus) => {
    let next: OrderStatus | null = null;
    if (current === "pending") next = "cooking";
    else if (current === "cooking") next = "serving";
    else if (current === "serving") next = "completed";
    if (next) updateOrderStatus(orderId, next);
  };

  const itemSummary = orders
    .filter(o => o.status === "pending" || o.status === "cooking")
    .reduce((acc, order) => {
      order.items.forEach(item => {
        if (!acc[item.name]) {
          acc[item.name] = { count: 0, status: order.status };
        }
        acc[item.name].count += item.quantity;
      });
      return acc;
    }, {} as Record<string, { count: number; status: string }>);

  const columns: { status: OrderStatus; title: string; color: string }[] = [
    { status: "pending", title: "🔴 Đợi xác nhận", color: "bg-red-50 text-red-700 border-red-100" },
    { status: "cooking", title: "🍳 Đang làm", color: "bg-orange-50 text-orange-700 border-orange-100" },
    { status: "serving", title: "🛎️ Đang lên", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { status: "completed", title: "✅ Hoàn thành", color: "bg-green-50 text-green-700 border-green-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/50">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Hệ thống KDS</h1>
            <p className="text-sm text-gray-500 font-medium">Kitchen Display System</p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border">
          <button 
            onClick={() => setView("board")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${view === "board" ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "text-gray-400 hover:text-gray-600"}`}
          >
            <LayoutGrid size={18} />
            Kanban
          </button>
          <button 
            onClick={() => setView("summary")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${view === "summary" ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "text-gray-400 hover:text-gray-600"}`}
          >
            <List size={18} />
            Tổng hợp món
          </button>
        </div>
      </header>

      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <section key={col.status} className="flex flex-col h-full min-h-[500px]">
                <div className={`p-4 rounded-2xl border-b-4 mb-4 flex items-center justify-between ${col.color}`}>
                  <h2 className="font-black uppercase tracking-wider text-sm">{col.title}</h2>
                  <span className="bg-white/50 px-2 py-0.5 rounded-lg text-xs font-black">{colOrders.length}</span>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] hide-scrollbar">
                  {colOrders.map((order) => (
                    <OrderTicket
                      key={order.id}
                      order={order}
                      onAdvance={() => advanceStatus(order.id, order.status)}
                    />
                  ))}
                  {colOrders.length === 0 && (
                    <div className="py-20 text-center text-gray-300 italic text-sm">
                      Trống
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 border-b bg-gray-50/50">
            <h2 className="text-xl font-black text-gray-800">Danh sách món cần chuẩn bị</h2>
            <p className="text-sm text-gray-500">Tổng hợp tất cả món từ các đơn hàng Đợi xác nhận & Đang làm</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(itemSummary).length > 0 ? (
                Object.entries(itemSummary).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
                    <span className="text-lg font-bold text-gray-700">{name}</span>
                    <span className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-orange-100">
                      {data.count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-gray-400 italic">
                  Hiện không có món nào đang được yêu cầu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
