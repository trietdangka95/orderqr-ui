"use client";

import { OrderStatus, useCartStore } from "@/store/cartStore";
import { OrderStatus as ApiOrderStatus } from "@/types/api";
import { useEffect, useState, useRef } from "react";
import OrderTicket from "@/components/kitchen/OrderTicket";
import { LayoutGrid, List, LogOut } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import useIsMounted from "@/hooks/useIsMounted";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";

export default function KitchenPage() {
  const { logout, userRole } = useCartStore();
  const { data: apiOrders = [] } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const refreshOrders = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on('newOrder', refreshOrders);
    socket.on('orderUpdate', refreshOrders);
    socket.on('checkout', refreshOrders);

    return () => {
      socket.off('newOrder', refreshOrders);
      socket.off('orderUpdate', refreshOrders);
      socket.off('checkout', refreshOrders);
    };
  }, [socket, queryClient]);

  const orders = apiOrders.map(o => ({
    ...o,
    status: o.status.toLowerCase() as OrderStatus, // UI expects lowercase
    timestamp: new Date(o.createdAt).getTime(),
    isConfirmed: o.isConfirmed,
    totalPrice: o.totalAmount || 0,
    items: o.orderItems.map((i) => ({
      ...i,
      id: i.productId, // Use productId as id for CartItem compatibility
      name: i.product?.name || 'Món ăn',
      image: i.product?.image || '',
      price: i.product?.price || 0,
      description: i.product?.description || '',
      category: i.product?.category || '',
      categoryId: i.product?.categoryId || 0,
      note: i.note || '',
    }))
  }));
  const audioRef = useRef<HTMLAudioElement>(null);
  const [view, setView] = useState<"board" | "summary">("board");

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    }
  }, []);

  const [prevPendingCount, setPrevPendingCount] = useState(0);
  const pendingCount = orders.filter((o) => o.isConfirmed && o.status === "pending").length;

  // Adjust state during render to avoid cascading renders in useEffect
  if (pendingCount !== prevPendingCount) {
    setPrevPendingCount(pendingCount);
  }

  useEffect(() => {
    if (pendingCount > prevPendingCount && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  }, [pendingCount, prevPendingCount]);

  const advanceStatus = (orderId: string, current: OrderStatus) => {
    let next: ApiOrderStatus | null = null;
    if (current === "pending") next = "COOKING";
    else if (current === "cooking") next = "SERVING";
    else if (current === "serving") next = "COMPLETED";

    if (next) {
      updateStatusMutation.mutate({ id: orderId, status: next });
    }
  };

  const confirmedOrders = orders
    .filter(o => o.isConfirmed)
    .sort((a, b) => a.timestamp - b.timestamp); // FIFO: Cũ nhất làm trước

  const itemSummary = confirmedOrders
    .filter(o => o.status === "pending" || o.status === "cooking")
    .reduce((acc, order) => {
      order.items.forEach((item: any) => {
        if (!acc[item.name]) {
          acc[item.name] = { count: 0, tables: new Set<string>() };
        }
        acc[item.name].count += item.quantity;
        acc[item.name].tables.add(order.tableNumber);
      });
      return acc;
    }, {} as Record<string, { count: number; tables: Set<string> }>);

  const columns: { status: OrderStatus; title: string; color: string; dot: string }[] = [
    { status: "pending", title: "Đợi xác nhận", dot: "bg-red-500", color: "bg-white border-t-red-500 shadow-red-100" },
    { status: "cooking", title: "Đang chế biến", dot: "bg-orange-500", color: "bg-white border-t-orange-500 shadow-orange-100" },
    { status: "serving", title: "Chờ phục vụ", dot: "bg-blue-500", color: "bg-white border-t-blue-500 shadow-blue-100" },
    { status: "completed", title: "Hoàn thành", dot: "bg-green-500", color: "bg-white border-t-green-500 shadow-green-100" },
  ];

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Hệ thống KDS</h1>
          <p className="text-gray-500 font-medium italic">Kitchen Display System - Quản lý chế biến món ăn</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border shadow-sm h-fit">
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black transition-all ${view === "board" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setView("summary")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black transition-all ${view === "summary" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List size={18} />
              <span className="hidden sm:inline">Tổng hợp</span>
            </button>
          </div>

          {userRole === "kitchen" && (
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-2xl transition-all shadow-md active:scale-95 text-sm"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </header>

      <main>

        {view === "board" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((col) => {
              const colOrders = orders.filter((o) => o.status === col.status);
              return (
                <section key={col.status} className="flex flex-col h-full min-h-[500px]">
                  <div className={`p-4 rounded-2xl border-t-4 mb-6 flex items-center justify-between shadow-xl shadow-gray-200/20 ${col.color}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dot} animate-pulse shadow-sm`}></div>
                      <h2 className="font-black uppercase tracking-widest text-sm text-gray-900">{col.title}</h2>
                    </div>
                    <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-lg text-sm font-black shadow-sm">{colOrders.length}</span>
                  </div>
                  <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] hide-scrollbar">
                    {confirmedOrders.filter(o => o.status === col.status).map((order) => (
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
                    <div key={name} className="flex flex-col p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 hover:border-primary/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                            {data.count}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">{name}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Yêu cầu từ {data.tables.size} bàn</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed border-gray-100">
                        {Array.from(data.tables).sort().map(table => (
                          <span key={table} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black border border-gray-100 group-hover:border-gray-200 transition-colors">
                            Bàn {table}
                          </span>
                        ))}
                      </div>
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
      </main>
    </div>
  );
}
