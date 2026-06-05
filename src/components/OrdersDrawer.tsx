"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { X, ClipboardList, CheckCircle2, Clock, ChefHat } from "lucide-react";
import Image from "next/image";
import { useOrders, useConfirmOrder, useUpdateOrderStatus, useTableOrders } from "@/hooks/useOrders";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getImageUrl } from "@/utils/image";

interface MappedOrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  note?: string | null;
}

export default function OrdersDrawer() {
  const { isOrdersOpen, toggleOrders, selectedTable, userRole } = useCartStore();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Fetch orders based on role
  const isStaff = userRole === "staff" || userRole === "admin" || userRole === "kitchen";
  const allOrdersQuery = useOrders(isStaff);   // chỉ fetch khi là staff/admin/kitchen
  const tableOrdersQuery = useTableOrders(selectedTable);

  const apiOrders = isStaff ? (allOrdersQuery.data || []) : (tableOrdersQuery.data || []);

  const confirmOrderMutation = useConfirmOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const [activeTab, setActiveTab] = useState<"current" | "all" | "serving">("current");

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const refreshOrders = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Cập nhật guest view theo bàn (public route)
      if (selectedTable) {
        queryClient.invalidateQueries({ queryKey: ["orders", "table", selectedTable] });
      }
    };

    socket.on('newOrder', refreshOrders);
    socket.on('orderUpdate', refreshOrders);
    socket.on('checkout', refreshOrders);

    return () => {
      socket.off('newOrder', refreshOrders);
      socket.off('orderUpdate', refreshOrders);
      socket.off('checkout', refreshOrders);
    };
  }, [socket, queryClient, selectedTable]);

  // Map API data to UI format if necessary (handle casing or field names)
  const orders = apiOrders.map(o => ({
    ...o,
    status: o.status.toLowerCase() as "pending" | "cooking" | "serving" | "completed",
    timestamp: new Date(o.createdAt).getTime(),
    isConfirmed: o.isConfirmed,
    // Backend (Prisma) trả về 'orderItems', frontend type gọi là 'items' → hỗ trợ cả hai
    items: ((o as any).orderItems || (o as any).items || []).map((i: any): MappedOrderItem => ({
      ...i,
      name: i.product?.name || 'Món ăn',
      image: i.product?.image || '',
      price: i.product?.price || 0,
      id: i.productId
    })),
    totalPrice: o.totalAmount || ((o as any).orderItems || (o as any).items || []).reduce((sum: number, i: any) => sum + (i.product?.price || 0) * i.quantity, 0)
  }));

  // Only consider non-completed orders as "active"
  const activeOrders = orders.filter(o => o.status !== "completed");
  const tableOrders = activeOrders.filter(o => o.tableNumber === selectedTable);

  const displayOrders = userRole === "staff"
    ? activeTab === "all"
      ? activeOrders
      : activeTab === "serving"
        ? activeOrders.filter(o => o.status === "serving")
        : tableOrders
    : tableOrders;

  // Summary for current table
  const tableSummary = tableOrders.reduce((acc, order) => {
    if (order.status !== "completed") {
      order.items.forEach((item: { name: string; quantity: number }) => {
        if (!acc[item.name]) acc[item.name] = { quantity: 0, status: order.status };
        acc[item.name].quantity += item.quantity;
      });
    }
    return acc;
  }, {} as Record<string, { quantity: number; status: string }>);

  if (!isOrdersOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity cursor-pointer"
        onClick={toggleOrders}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-gray-50 z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h2 className="font-bold text-lg text-gray-900">
                {userRole === "staff"
                  ? activeTab === "all"
                    ? "Tất cả đơn hàng"
                    : activeTab === "serving"
                      ? "Món chờ phục vụ"
                      : `Đơn bàn ${selectedTable}`
                  : `Đơn đã gọi - Bàn ${selectedTable}`}
              </h2>
            </div>
            <button onClick={toggleOrders} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector for Staff */}
          {userRole === "staff" && (
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "current" ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
              >
                Bàn {selectedTable}
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "all" ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
              >
                Tất cả ({activeOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("serving")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "serving" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"} relative`}
              >
                Chờ phục vụ ({activeOrders.filter(o => o.status === "serving").length})
                {activeOrders.filter(o => o.status === "serving").length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Table Summary for Staff */}
          {userRole === "staff" && activeTab === "current" && Object.keys(tableSummary).length > 0 && (
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-2">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ChefHat size={14} />
                Tổng hợp trạng thái bàn {selectedTable}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(tableSummary).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between bg-white/60 p-2 rounded-xl text-sm">
                    <span className="font-bold text-gray-700">{name} <span className="text-blue-500">x{data.quantity}</span></span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${data.status === "pending" ? "bg-red-100 text-red-600" :
                      data.status === "cooking" ? "bg-orange-100 text-orange-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                      {data.status === "pending" ? "Chờ làm" : data.status === "cooking" ? "Đang nấu" : "Xong"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-20">
              <ClipboardList className="w-16 h-16 opacity-20" />
              <p className="text-sm font-medium">
                {activeTab === "serving" ? "Không có món nào chờ phục vụ" : "Chưa có món nào"}
              </p>
            </div>
          ) : (
            displayOrders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-primary/20 transition-all">
                <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center ${!order.isConfirmed ? "bg-red-50" : order.status === "serving" ? "bg-blue-50" : "bg-orange-50/50"}`}>
                  <div className="flex items-center gap-2">
                    {(activeTab === "all" || activeTab === "serving") && (
                      <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">Bàn {order.tableNumber}</span>
                    )}
                    <span className="font-bold text-gray-800 text-sm">
                      {activeTab === "current" ? `Đợt ${tableOrders.length - index}` : `Mã đơn #${order.id.slice(-4)}`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Status Timeline */}
                <div className="px-6 py-5 border-b border-gray-50">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>

                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full -z-10 transition-all duration-1000 ${!order.isConfirmed ? "w-[5%] bg-red-200" :
                      order.status === "pending" ? "w-[10%] bg-orange-200" :
                        order.status === "cooking" ? "w-[50%] bg-orange-400" :
                          "w-full bg-green-500"
                      }`}></div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${!order.isConfirmed ? "bg-red-500 text-white animate-pulse" :
                        order.status === "pending" ? "bg-white border-2 border-orange-400 text-orange-500 animate-pulse" : "bg-orange-400 text-white"
                        }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${!order.isConfirmed ? "text-red-600" : order.status === "pending" ? "text-orange-600" : "text-gray-400"}`}>
                        {!order.isConfirmed ? "Xác nhận" : "Bếp nhận"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${order.status === "pending" ? "bg-white border-2 border-gray-200 text-gray-300" :
                        order.status === "cooking" ? "bg-white border-2 border-orange-500 text-orange-500 animate-pulse" :
                          "bg-orange-500 text-white"
                        }`}>
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${order.status === "cooking" ? "text-orange-600" : "text-gray-400"}`}>Đang nấu</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${order.status === "serving" ? "bg-green-500 text-white animate-bounce" : "bg-white border-2 border-gray-200 text-gray-300"
                        }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${order.status === "serving" ? "text-green-600" : "text-gray-400"}`}>Lên món</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items.map((item: MappedOrderItem) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden relative flex-shrink-0">
                        <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-sm text-gray-900 leading-tight pr-4">{item.name}</h4>
                          <span className="font-bold text-sm">x{item.quantity}</span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-gray-500 italic mt-0.5">Note: {item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 bg-gray-50 flex flex-col gap-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">Tổng cộng đợt này</span>
                    <span className="font-bold text-gray-900">{order.totalPrice.toLocaleString("vi-VN")} ₫</span>
                  </div>

                  {/* Staff Confirmation Button */}
                  {userRole === "staff" && !order.isConfirmed && (
                    <button
                      disabled={confirmOrderMutation.isPending}
                      onClick={() => confirmOrderMutation.mutate(order.id)}
                      className="w-full bg-green-500 text-white font-bold py-2 rounded-xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {confirmOrderMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Xác nhận khách đang ngồi bàn
                        </>
                      )}
                    </button>
                  )}

                  {/* Staff Serving Button */}
                  {userRole === "staff" && order.status === "serving" && (
                    <button
                      disabled={updateStatusMutation.isPending}
                      onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'COMPLETED' })}
                      className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {updateStatusMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Đã phục vụ xong
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
