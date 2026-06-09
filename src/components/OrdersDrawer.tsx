"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { X, ClipboardList, CheckCircle2, Clock, ChefHat, Copy, Check, CreditCard, Coins, QrCode, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useOrders, useConfirmOrder, useUpdateOrderStatus, useTableOrders, useUpdateOrderItemQuantity, useRequestCheckout } from "@/hooks/useOrders";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getImageUrl } from "@/utils/image";

const sanitizeBankId = (bankId: string | undefined | null): string => {
  if (!bankId) return "";
  const cleaned = bankId.trim().replace(/\s+/g, "").toUpperCase();
  const mapping: Record<string, string> = {
    "MBBANK": "MB",
    "VIETCOMBANK": "VCB",
    "VIETINBANK": "CTG",
    "TECHCOMBANK": "TCB",
    "BIDVBANK": "BIDV",
    "ACBBANK": "ACB",
    "VPBANK": "VPB",
    "TPBANK": "TPB",
    "SACOMBANK": "STB",
    "HDBANK": "HDB",
    "AGRIBANK": "VBA",
    "ABBANK": "ABB",
    "MSBBANK": "MSB",
    "VIBBANK": "VIB",
    "SHBANK": "SHB",
    "OCBBANK": "OCB",
    "SCBBANK": "SCB",
    "SEABANK": "SEAB",
  };
  return mapping[cleaned] || cleaned;
};

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
  const { isOrdersOpen, toggleOrders, selectedTable, userRole, storeConfig } = useCartStore();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Fetch orders based on role
  const isStaff = userRole === "staff" || userRole === "admin" || userRole === "kitchen";
  const allOrdersQuery = useOrders(isStaff);   // chỉ fetch khi là staff/admin/kitchen
  const tableOrdersQuery = useTableOrders(selectedTable);

  const apiOrders = isStaff ? (allOrdersQuery.data || []) : (tableOrdersQuery.data || []);

  const confirmOrderMutation = useConfirmOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const updateOrderItemMutation = useUpdateOrderItemQuantity();
  const requestCheckoutMutation = useRequestCheckout();

  const [activeTab, setActiveTab] = useState<"current" | "all" | "serving">("current");
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'QR_TRANSFER' | null>(null);

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
    socket.on('payment_request', refreshOrders);

    return () => {
      socket.off('newOrder', refreshOrders);
      socket.off('orderUpdate', refreshOrders);
      socket.off('checkout', refreshOrders);
      socket.off('payment_request', refreshOrders);
    };
  }, [socket, queryClient, selectedTable]);

  // Map API data to UI format if necessary (handle casing or field names)
  const orders = apiOrders.map(o => ({
    ...o,
    status: o.status.toLowerCase() as "pending" | "cooking" | "serving" | "completed" | "cancelled",
    timestamp: new Date(o.createdAt).getTime(),
    isConfirmed: o.isConfirmed,
    items: o.orderItems.map((i): MappedOrderItem => ({
      ...i,
      name: i.product?.name || 'Món ăn',
      image: i.product?.image || '',
      price: i.product?.price || 0,
      id: i.productId
    })),
    totalPrice: o.totalAmount || o.orderItems.reduce((sum: number, i) => sum + (i.product?.price || 0) * i.quantity, 0)
  }));

  // Active orders: either not checked out, or waiting for payment approval
  const activeOrders = orders.filter(o => (!o.invoiceId || o.invoice?.paymentStatus === "PENDING") && o.status !== "cancelled");
  const tableOrders = activeOrders.filter(o => o.tableNumber === selectedTable);
  
  // Find if there is an active pending invoice for this table
  const pendingInvoice = orders.find(o => o.invoiceId && o.invoice?.paymentStatus === "PENDING")?.invoice;
  const tableTotal = pendingInvoice 
    ? Number(pendingInvoice.totalAmount) 
    : tableOrders.reduce((sum, order) => sum + order.totalPrice, 0);

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
          {/* Cumulative Subtotal Banner */}
          {selectedTable && tableOrders.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex justify-between items-center mb-2 shadow-sm">
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tổng tạm tính (Chưa thanh toán)</p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Bao gồm {tableOrders.length} đợt gọi món</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-orange-600">{tableTotal.toLocaleString("vi-VN")} ₫</p>
              </div>
            </div>
          )}

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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                        order.status === "completed" ? "bg-green-500 text-white" :
                        order.status === "serving" ? "bg-white border-2 border-green-500 text-green-500 animate-pulse" :
                        "bg-white border-2 border-gray-200 text-gray-300"
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${
                        (order.status === "serving" || order.status === "completed") ? "text-green-600" : "text-gray-400"
                      }`}>
                        {order.status === "completed" 
                          ? (userRole === "staff" ? "Đã phục vụ" : "Đã lên món")
                          : order.status === "serving"
                            ? (userRole === "staff" ? "Chờ phục vụ" : "Đang lên món")
                            : "Lên món"}
                      </span>
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
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-sm text-gray-900 leading-tight pr-4">{item.name}</h4>
                          
                          {(userRole === "staff" || userRole === "admin") && order.status !== "completed" && order.status !== "cancelled" ? (
                            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-1.5 py-0.5">
                              <button
                                disabled={updateOrderItemMutation.isPending}
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    if (confirm(`Bạn có chắc chắn muốn xóa món "${item.name}" khỏi đơn hàng?`)) {
                                      updateOrderItemMutation.mutate({ orderId: order.id, productId: item.productId, quantity: 0 });
                                    }
                                  } else {
                                    updateOrderItemMutation.mutate({ orderId: order.id, productId: item.productId, quantity: item.quantity - 1 });
                                  }
                                }}
                                className="w-5 h-5 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors text-xs font-black disabled:opacity-50"
                              >
                                -
                              </button>
                              
                              {updateOrderItemMutation.isPending && 
                               updateOrderItemMutation.variables?.orderId === order.id && 
                               updateOrderItemMutation.variables?.productId === item.productId ? (
                                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                              )}
                              
                              <button
                                disabled={updateOrderItemMutation.isPending}
                                onClick={() => {
                                  updateOrderItemMutation.mutate({ orderId: order.id, productId: item.productId, quantity: item.quantity + 1 });
                                }}
                                className="w-5 h-5 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors text-xs font-black disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="font-bold text-sm">x{item.quantity}</span>
                          )}
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
                      {confirmOrderMutation.isPending && confirmOrderMutation.variables === order.id ? (
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
                      {updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id ? (
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

        {/* Guest checkout section */}
        {userRole !== "staff" && tableOrders.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe relative z-20">
            {pendingInvoice ? (
              // Status screen for pending payment
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-800">Yêu cầu thanh toán chờ duyệt</h4>
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">Nhân viên đang kiểm tra hóa đơn của bạn</p>
                  </div>
                </div>

                {pendingInvoice.paymentMethod === "QR_TRANSFER" ? (
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-4 text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quét mã QR để chuyển khoản</p>
                    
                    {storeConfig?.bankId && storeConfig?.bankAccountNo ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-48 h-48 bg-white border border-gray-200/60 rounded-2xl flex items-center justify-center p-2 relative shadow-md">
                          <img
                            src={`https://img.vietqr.io/image/${sanitizeBankId(storeConfig.bankId)}-${storeConfig.bankAccountNo}-compact2.png?amount=${tableTotal}&addInfo=Ban%20${selectedTable}%20Thanh%20Toan&accountName=${encodeURIComponent(storeConfig.bankAccountName || "")}`}
                            alt="VietQR code"
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 text-xs space-y-2 font-medium">
                          <div className="flex justify-between border-b border-gray-50 pb-1.5">
                            <span className="text-gray-400">Ngân hàng</span>
                            <span className="font-bold text-gray-800">{storeConfig.bankId}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-50 pb-1.5 items-center">
                            <span className="text-gray-400">Số tài khoản</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-800">{storeConfig.bankAccountNo}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(storeConfig.bankAccountNo || "");
                                  alert("Đã sao chép số tài khoản!");
                                }}
                                className="p-1 hover:bg-gray-100 rounded text-primary transition-colors"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between border-b border-gray-50 pb-1.5">
                            <span className="text-gray-400">Tên thụ hưởng</span>
                            <span className="font-bold text-gray-800">{storeConfig.bankAccountName || "N/A"}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-50 pb-1.5 items-center">
                            <span className="text-gray-400">Nội dung CK</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-orange-600">Ban {selectedTable} Thanh Toan</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`Ban ${selectedTable} Thanh Toan`);
                                  alert("Đã sao chép nội dung chuyển khoản!");
                                }}
                                className="p-1 hover:bg-gray-100 rounded text-primary transition-colors"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tổng tiền</span>
                            <span className="font-black text-orange-600 text-sm">{tableTotal.toLocaleString("vi-VN")} ₫</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold leading-normal px-2 mt-1">
                          Vui lòng giữ nguyên màn hình này cho đến khi nhân viên xác nhận đã nhận được tiền.
                        </p>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-red-500 font-bold">
                        Quán chưa thiết lập tài khoản ngân hàng. Vui lòng báo nhân viên.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center space-y-3 font-medium text-xs text-gray-600">
                    <Coins size={36} className="mx-auto text-amber-500 animate-bounce" />
                    <p className="font-bold text-gray-800 text-sm">Thanh toán Tiền mặt</p>
                    <p className="leading-relaxed text-gray-500">
                      Vui lòng chuẩn bị sẵn số tiền <span className="font-black text-orange-600 text-sm">{tableTotal.toLocaleString("vi-VN")} ₫</span>. 
                      Nhân viên phục vụ đang đến bàn của bạn để thu tiền và hoàn tất thanh toán.
                    </p>
                  </div>
                )}
              </div>
            ) : !isCheckoutMode ? (
              // Initial button
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Tổng tiền</span>
                  <span className="text-base font-black text-orange-600">{tableTotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                <button
                  onClick={() => setIsCheckoutMode(true)}
                  className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <CreditCard size={18} />
                  Thanh toán hóa đơn
                </button>
              </div>
            ) : (
              // Payment choice screen
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-800">Phương thức thanh toán</h4>
                  <button
                    onClick={() => {
                      setIsCheckoutMode(false);
                      setSelectedPayment(null);
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Quay lại
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPayment("CASH")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group ${
                      selectedPayment === "CASH"
                        ? "border-primary bg-orange-50/20 text-primary"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <Coins size={28} className={selectedPayment === "CASH" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"} />
                    <span className="text-xs font-black uppercase">Tiền mặt</span>
                  </button>

                  <button
                    disabled={!(storeConfig?.bankId && storeConfig?.bankAccountNo)}
                    onClick={() => setSelectedPayment("QR_TRANSFER")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group disabled:opacity-50 ${
                      selectedPayment === "QR_TRANSFER"
                        ? "border-primary bg-orange-50/20 text-primary"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <QrCode size={28} className={selectedPayment === "QR_TRANSFER" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"} />
                    <span className="text-xs font-black uppercase">Chuyển khoản QR</span>
                  </button>
                </div>

                {selectedPayment === "QR_TRANSFER" && (
                  <div className="border border-orange-100 rounded-xl p-3 bg-orange-50/30 text-[11px] font-medium text-orange-800 leading-normal flex gap-2">
                    <Sparkles size={16} className="shrink-0 text-orange-500 mt-0.5" />
                    <span>
                      Hệ thống tự động tạo mã QR chuyển tiền đến tài khoản của quán.
                    </span>
                  </div>
                )}

                <button
                  disabled={!selectedPayment || requestCheckoutMutation.isPending}
                  onClick={() => {
                    if (!selectedPayment) return;
                    requestCheckoutMutation.mutate({
                      tableNumber: selectedTable,
                      paymentMethod: selectedPayment,
                      paymentStatus: "PENDING"
                    }, {
                      onSuccess: () => {
                        setIsCheckoutMode(false);
                        setSelectedPayment(null);
                      },
                      onError: (err: any) => {
                        alert(err.message || "Không thể gửi yêu cầu thanh toán");
                      }
                    });
                  }}
                  className="w-full bg-primary disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {requestCheckoutMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      Gửi yêu cầu thanh toán
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
