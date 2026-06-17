"use client";

import { OrderStatus, useCartStore } from "@/store/cartStore";
import { OrderItem } from "@/types/api";
import { useEffect, useState, useRef } from "react";
import OrderTicket from "@/components/kitchen/OrderTicket";
import { LayoutGrid, List, LogOut } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import useIsMounted from "@/hooks/useIsMounted";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ColumnType = "pending" | "cooking" | "serving" | "completed";

/** Một nhóm items từ cùng 1 order, dùng để render ticket trong 1 cột */
export interface VirtualTicket {
  orderId: string;
  tableNumber: string;
  timestamp: number;
  orderTotalPrice: number;
  items: ItemWithMeta[];
}

export interface ItemWithMeta {
  id: string;
  orderItemId: string;
  name: string;
  quantity: number;
  price: number;
  note: string;
  image: string;
  description: string;
  category: string;
  categoryId: number;
  isCooked: boolean;
  isCooking: boolean;
  isServed: boolean;
}

// ─── Helper: group flat items → VirtualTicket[] ───────────────────────────────

type FlatItem = ItemWithMeta & { orderId: string; tableNumber: string; timestamp: number; orderTotalPrice: number };

function groupByOrder(items: FlatItem[]): VirtualTicket[] {
  const map = new Map<string, VirtualTicket>();
  for (const item of items) {
    if (!map.has(item.orderId)) {
      map.set(item.orderId, {
        orderId: item.orderId,
        tableNumber: item.tableNumber,
        timestamp: item.timestamp,
        orderTotalPrice: item.orderTotalPrice,
        items: [],
      });
    }
    map.get(item.orderId)!.items.push({
      id: item.id,
      orderItemId: item.orderItemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      note: item.note,
      image: item.image,
      description: item.description,
      category: item.category,
      categoryId: item.categoryId,
      isCooked: item.isCooked,
      isCooking: item.isCooking,
      isServed: item.isServed,
    });
  }
  // Sort FIFO: cũ nhất lên đầu
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KitchenPage() {
  const { logout, userRole } = useCartStore();
  const { data: apiOrders = [] } = useOrders();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["orders"] });
    socket.on("newOrder", refresh);
    socket.on("orderUpdate", refresh);
    socket.on("checkout", refresh);
    return () => {
      socket.off("newOrder", refresh);
      socket.off("orderUpdate", refresh);
      socket.off("checkout", refresh);
    };
  }, [socket, queryClient]);

  // Normalize orders from API
  const orders = apiOrders
    .filter(o => !o.invoiceId && o.isConfirmed)
    .map(o => ({
      ...o,
      status: o.status.toLowerCase() as OrderStatus,
      timestamp: new Date(o.createdAt).getTime(),
      totalPrice: Number(o.totalPrice || o.orderItems.reduce((sum: number, i: OrderItem) => sum + (i.product?.price || 0) * i.quantity, 0)),
      items: o.orderItems.map(i => ({
        id: i.productId,
        orderItemId: i.id,
        name: i.product?.name || "Món ăn",
        image: i.product?.image || "",
        price: i.product?.price || 0,
        description: i.product?.description || "",
        category: i.product?.category || "",
        categoryId: i.product?.categoryId || 0,
        note: i.note || "",
        isCooked: i.isCooked ?? false,
        isCooking: i.isCooking ?? false,
        isServed: i.isServed ?? false,
        quantity: i.quantity,
      })),
    }));

  // Audio alert for new pending orders
  const audioRef = useRef<HTMLAudioElement>(null);
  const [view, setView] = useState<"board" | "summary">("board");

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    }
  }, []);

  const [prevPendingCount, setPrevPendingCount] = useState(0);
  const pendingCount = orders.filter(o => o.status === "pending").length;
  if (pendingCount !== prevPendingCount) setPrevPendingCount(pendingCount);

  useEffect(() => {
    if (pendingCount > prevPendingCount && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [pendingCount, prevPendingCount]);

  // ─── Per-item virtual tickets ─────────────────────────────────────────────

  /** Flatten tất cả items từ các orders đã xác nhận */
  const allFlatItems: FlatItem[] = orders.flatMap(o =>
    o.items.map(item => ({
      ...item,
      orderId: o.id,
      tableNumber: o.tableNumber,
      timestamp: o.timestamp,
      orderTotalPrice: o.totalPrice,
    }))
  );

  const pendingTickets   = groupByOrder(allFlatItems.filter(i => !i.isCooking && !i.isCooked && !i.isServed));
  const cookingTickets   = groupByOrder(allFlatItems.filter(i => i.isCooking && !i.isCooked && !i.isServed));
  const servingTickets   = groupByOrder(allFlatItems.filter(i => i.isCooked && !i.isServed));
  const completedTickets = groupByOrder(allFlatItems.filter(i => i.isServed));

  const columns: { key: ColumnType; title: string; color: string; dot: string; tickets: VirtualTicket[] }[] = [
    { key: "pending",   title: "Chờ chế biến", dot: "bg-red-500",   color: "bg-white border-t-red-500 shadow-red-100",     tickets: pendingTickets   },
    { key: "cooking",   title: "Đang chế biến", dot: "bg-primary",   color: "bg-white border-t-orange-500 shadow-orange-100", tickets: cookingTickets   },
    { key: "serving",   title: "Chờ phục vụ",  dot: "bg-blue-500",  color: "bg-white border-t-blue-500 shadow-blue-100",   tickets: servingTickets   },
    { key: "completed", title: "Hoàn thành",   dot: "bg-green-500", color: "bg-white border-t-green-500 shadow-green-100", tickets: completedTickets },
  ];

  // Summary view (unchanged)
  const confirmedOrders = orders.sort((a, b) => a.timestamp - b.timestamp);
  const itemSummary = confirmedOrders
    .filter(o => o.status === "pending" || o.status === "cooking")
    .reduce((acc, order) => {
      order.items.forEach(item => {
        if (!acc[item.name]) acc[item.name] = { count: 0, tables: new Set<string>() };
        acc[item.name].count += item.quantity;
        acc[item.name].tables.add(order.tableNumber);
      });
      return acc;
    }, {} as Record<string, { count: number; tables: Set<string> }>);

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col min-h-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 shrink-0">
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
              onClick={() => { logout(); window.location.href = "/"; }}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-2xl transition-all shadow-md active:scale-95 text-sm"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col min-h-0">

        {view === "board" ? (
          <div className="flex flex-row md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-4 flex-grow min-h-0 snap-x snap-mandatory">
            {columns.map(col => (
              <section key={col.key} className="flex flex-col h-full min-h-0 w-[85vw] sm:w-[350px] md:w-full shrink-0 snap-center">
                <div className={`p-4 rounded-2xl border-t-4 mb-4 flex items-center justify-between shadow-xl shadow-gray-200/20 ${col.color} shrink-0`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot} animate-pulse shadow-sm`}></div>
                    <h2 className="font-black uppercase tracking-widest text-sm text-gray-900">{col.title}</h2>
                  </div>
                  <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-lg text-sm font-black shadow-sm">
                    {col.tickets.reduce((s, t) => s + t.items.length, 0)}
                  </span>
                </div>
                <div className="space-y-4 overflow-y-auto flex-grow min-h-0 no-scrollbar pb-6">
                  {col.tickets.map(ticket => (
                    <OrderTicket
                      key={`${col.key}-${ticket.orderId}`}
                      ticket={ticket}
                      columnType={col.key}
                    />
                  ))}
                  {col.tickets.length === 0 && (
                    <div className="py-20 text-center text-gray-300 italic text-sm">Trống</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 flex-grow min-h-0 w-full flex flex-col">
            <div className="p-8 border-b bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-black text-gray-800">Danh sách món cần chuẩn bị</h2>
              <p className="text-sm text-gray-500">Tổng hợp tất cả món từ các đơn hàng Chờ chế biến &amp; Đang làm</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1 min-h-0">
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
