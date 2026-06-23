"use client";

import { OrderStatus, useCartStore } from "@/store/cartStore";
import { OrderItem } from "@/types/api";
import { useEffect, useState, useRef } from "react";
import OrderTicket from "@/components/kitchen/OrderTicket";
import { LayoutGrid, List, LogOut, ChefHat, Check, Clock, Pencil } from "lucide-react";
import { useOrders, useUpdateOrderItemStatus } from "@/hooks/useOrders";
import useIsMounted from "@/hooks/useIsMounted";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import StaffNameModal from "@/components/admin/StaffNameModal";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "@/components/ui/LanguageSelector";

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
  const t = useTranslation();
  const { logout, userRole, activeStaffName } = useCartStore();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const { data: apiOrders = [] } = useOrders();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const updateItemStatusMutation = useUpdateOrderItemStatus();
  const [updatingBatches, setUpdatingBatches] = useState<string[]>([]);

  const handleBatchAction = async (
    batchKey: string,
    items: { orderId: string; orderItemId: string }[],
    action: "startCooking" | "doneCooking"
  ) => {
    if (updatingBatches.includes(batchKey) || items.length === 0) return;
    setUpdatingBatches(prev => [...prev, batchKey]);
    try {
      await Promise.all(
        items.map(item =>
          updateItemStatusMutation.mutateAsync({
            orderId: item.orderId,
            orderItemId: item.orderItemId,
            ...(action === "startCooking" ? { isCooking: true } : { isCooked: true }),
          })
        )
      );
    } catch (error) {
      console.error("Batch update error:", error);
    } finally {
      setUpdatingBatches(prev => prev.filter(k => k !== batchKey));
    }
  };

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
        name: i.product?.name || "",
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
    { key: "pending",   title: t.kitchen.columnPending, dot: "bg-red-500",   color: "bg-white border-t-red-500   shadow-xl shadow-red-100",    tickets: pendingTickets   },
    { key: "cooking",   title: t.kitchen.columnCooking, dot: "bg-orange-500",   color: "bg-white border-t-orange-500 shadow-xl shadow-orange-100", tickets: cookingTickets   },
    { key: "serving",   title: t.kitchen.columnServing,  dot: "bg-blue-500",  color: "bg-white border-t-blue-500   shadow-xl shadow-blue-100",   tickets: servingTickets   },
    { key: "completed", title: t.kitchen.columnCompleted,   dot: "bg-green-500", color: "bg-white border-t-green-500  shadow-xl shadow-green-100",  tickets: completedTickets },
  ];

  // Summary view (grouped for batch action)
  interface SummaryDetail {
    name: string;
    pendingItems: { orderId: string; orderItemId: string; tableNumber: string; quantity: number }[];
    cookingItems: { orderId: string; orderItemId: string; tableNumber: string; quantity: number }[];
    tables: Set<string>;
  }

  const confirmedOrders = orders.sort((a, b) => a.timestamp - b.timestamp);
  const itemSummary = confirmedOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (item.isServed || item.isCooked) return;

      if (!acc[item.name]) {
        acc[item.name] = {
          name: item.name,
          pendingItems: [],
          cookingItems: [],
          tables: new Set<string>(),
        };
      }

      const itemInfo = {
        orderId: order.id,
        orderItemId: item.orderItemId,
        tableNumber: order.tableNumber,
        quantity: item.quantity,
      };

      if (item.isCooking) {
        acc[item.name].cookingItems.push(itemInfo);
      } else {
        acc[item.name].pendingItems.push(itemInfo);
      }
      acc[item.name].tables.add(order.tableNumber);
    });
    return acc;
  }, {} as Record<string, SummaryDetail>);

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col min-h-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{t.kitchen.title}</h1>
          <p className="text-gray-500 font-medium italic">{t.kitchen.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {userRole === "kitchen" && <LanguageSelector light={true} />}
          
          <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm h-fit gap-1">
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black transition-all duration-200 cursor-pointer ${
                view === "board"
                  ? "bg-white shadow-sm text-orange-600"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/30"
              }`}
            >
              <LayoutGrid size={18} />
              <span className="hidden sm:inline">{t.kitchen.viewKanban}</span>
            </button>
            <button
              onClick={() => setView("summary")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black transition-all duration-200 cursor-pointer ${
                view === "summary"
                  ? "bg-white shadow-sm text-orange-600"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/30"
              }`}
            >
              <List size={18} />
              <span className="hidden sm:inline">{t.kitchen.viewSummary}</span>
            </button>
          </div>

          {userRole === "kitchen" && (
            <div className="flex items-center gap-3">
              {activeStaffName && (
                <div className="flex items-center gap-3 bg-white shadow-sm border border-gray-150 px-4 py-2.5 rounded-2xl">
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.kitchen.dutyTitle}</p>
                    <p className="text-sm font-black text-gray-900 leading-none mt-0.5">{activeStaffName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNameModalOpen(true)}
                    title={t.kitchen.dutyEdit}
                    className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-orange-500 text-gray-400 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}

              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-2xl transition-all shadow-md active:scale-95 text-sm cursor-pointer"
              >
                <LogOut size={18} />
                <span>{t.kitchen.logout}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col min-h-0">

        {view === "board" ? (
          <div className="flex flex-row gap-6 overflow-x-auto pb-4 flex-grow min-h-0 snap-x snap-mandatory scrollbar-thin">
            {columns.map(col => (
              <section key={col.key} className="flex flex-col h-full min-h-0 w-[85vw] sm:w-[350px] shrink-0 snap-center">
                <div className={`p-4 rounded-2xl border-t-4 mb-4 flex items-center justify-between ${col.color} shrink-0`}>
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
                    <div className="py-20 text-center text-gray-300 italic text-sm">{t.kitchen.emptyColumn}</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 flex-grow min-h-0 w-full flex flex-col">
            <div className="p-8 border-b bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-black text-gray-800">{t.kitchen.summaryTitle}</h2>
              <p className="text-sm text-gray-500">{t.kitchen.summarySubtitle}</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(itemSummary).length > 0 ? (
                  Object.entries(itemSummary).map(([name, data]) => {
                    const totalPending = data.pendingItems.reduce((s, i) => s + i.quantity, 0);
                    const totalCooking = data.cookingItems.reduce((s, i) => s + i.quantity, 0);
                    const totalCount = totalPending + totalCooking;

                    return (
                      <div key={name} className="flex flex-col p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 hover:border-orange-500/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                              {totalCount}
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-900 leading-tight">{name}</h3>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {t.kitchen.summaryTablesCount.replace("{count}", String(data.tables.size))}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Details / Sub-quantities */}
                        <div className="flex gap-4 text-xs font-bold mb-5">
                          {totalPending > 0 && (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-xl">
                              <Clock size={12} />
                              {t.kitchen.summaryPending.replace("{count}", String(totalPending))}
                            </span>
                          )}
                          {totalCooking > 0 && (
                            <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-xl">
                              <ChefHat size={12} />
                              {t.kitchen.summaryCooking.replace("{count}", String(totalCooking))}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons for Batch Cooking */}
                        <div className="flex gap-2.5 mb-5">
                          {totalPending > 0 && (
                            <button
                              onClick={() => handleBatchAction(`${name}-startCooking`, data.pendingItems, "startCooking")}
                              disabled={updatingBatches.length > 0}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              <ChefHat size={12} />
                              {updatingBatches.includes(`${name}-startCooking`) ? "..." : t.kitchen.summaryActionCook.replace("{count}", String(totalPending))}
                            </button>
                          )}
                          {totalCooking > 0 && (
                            <button
                              onClick={() => handleBatchAction(`${name}-doneCooking`, data.cookingItems, "doneCooking")}
                              disabled={updatingBatches.length > 0}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-orange-200/50"
                            >
                              <Check size={12} strokeWidth={3} />
                              {updatingBatches.includes(`${name}-doneCooking`) ? "..." : t.kitchen.summaryActionDone.replace("{count}", String(totalCooking))}
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-dashed border-gray-100">
                          {Array.from(data.tables).sort().map(table => (
                            <span key={table} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black border border-gray-100 group-hover:border-gray-200 transition-colors">
                              {t.kitchen.summaryTableLabel.replace("{table}", table)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center text-gray-400 italic">
                    {t.kitchen.summaryEmpty}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <StaffNameModal 
        isOpen={isNameModalOpen} 
        onClose={() => setIsNameModalOpen(false)} 
        canClose={true} 
      />
    </div>
  );
}
