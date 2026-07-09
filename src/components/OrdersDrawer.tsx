"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { showConfirm, showAlert } from "@/store/dialogStore";
import { X, ClipboardList, CheckCircle2, Clock, ChefHat, Copy, Check, CreditCard, Coins, QrCode, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useOrders, useConfirmOrder, useUpdateOrderStatus, useTableOrders, useUpdateOrderItemQuantity, useRequestCheckout, useUpdateOrderItemStatus, useCancelOrder } from "@/hooks/useOrders";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect } from "react";
import { getImageUrl } from "@/utils/image";
import { translateApiError } from "@/utils/apiError";

const sanitizeBankId = (bankId: string | undefined | null): string => {
  if (!bankId) return "";
  const cleaned = bankId.trim().replace(/\s+/g, "").toUpperCase();
  const mapping: Record<string, string> = {
    "MBBANK": "MB",
    "VIETCOMBANK": "VCB",
    "VIETINBANK": "ICB",
    "CTG": "ICB",
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
  orderItemId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  quantity: number;
  note?: string | null;
  isCooked?: boolean;
  isServed?: boolean;
}

export default function OrdersDrawer() {
  const t = useTranslation();
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
  const updateItemStatusMutation = useUpdateOrderItemStatus();
  const cancelOrderMutation = useCancelOrder();

  const [activeTab, setActiveTab] = useState<"current" | "all" | "serving">("current");
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'QR_TRANSFER' | null>(null);

  // Auto-switch default tab for staff when drawer is opened
  useEffect(() => {
    if (!isOrdersOpen || !isStaff) {
      return;
    }

    const nextTab = selectedTable ? "current" : "all";
    const timer = window.setTimeout(() => setActiveTab(nextTab), 0);

    return () => window.clearTimeout(timer);
  }, [isOrdersOpen, isStaff, selectedTable]);

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
  const orders = apiOrders.map(o => {
    const orderStatusLower = o.status.toLowerCase();
    return {
      ...o,
      status: orderStatusLower as "pending" | "cooking" | "serving" | "completed" | "cancelled",
      timestamp: new Date(o.createdAt).getTime(),
      isConfirmed: o.isConfirmed,
      items: o.orderItems.map((i): MappedOrderItem => {
        const isCooked = orderStatusLower === "completed" || orderStatusLower === "serving" ? true : i.isCooked;
        const isServed = orderStatusLower === "completed" ? true : i.isServed;
        
        const price = i.priceAtTime !== undefined ? Number(i.priceAtTime) : (i.product?.price || 0);
        const originalPrice = i.originalPriceAtTime !== null && i.originalPriceAtTime !== undefined
          ? Number(i.originalPriceAtTime)
          : (i.product?.price || 0);
        const discountPercent = i.discountPercentAtTime !== null && i.discountPercentAtTime !== undefined
          ? i.discountPercentAtTime
          : (i.product?.discountPercent || 0);

        return {
          ...i,
          name: i.product?.name || t.revenue.unknownItem,
          image: i.product?.image || '',
          price,
          originalPrice,
          discountPercent,
          id: i.productId,
          orderItemId: i.id,
          isCooked,
          isServed,
        };
      }),
      totalPrice: Number(o.totalPrice || o.orderItems.reduce((sum: number, i) => {
        const itemPrice = i.priceAtTime !== undefined ? Number(i.priceAtTime) : (i.product?.price || 0);
        return sum + itemPrice * i.quantity;
      }, 0))
    };
  });

  // Active orders: either not checked out, or waiting for payment approval
  const activeOrders = orders.filter(o => (!o.invoiceId || o.invoice?.paymentStatus === "PENDING") && o.status !== "cancelled");
  const tableOrders = activeOrders.filter(o => o.tableNumber === selectedTable);
  
  // Check if there are any unserved items on the table
  const hasUnservedItems = tableOrders.some(order => 
    order.items.some(item => !item.isServed)
  );

  // Find if there is an active pending invoice for this table
  const pendingInvoice = orders.find(o => o.invoiceId && o.invoice?.paymentStatus === "PENDING")?.invoice;
  const tableTotal = pendingInvoice 
    ? Number(pendingInvoice.totalAmount) 
    : tableOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  const displayOrders = isStaff
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

  const renderQRTransferDetails = (amount: number, showSubmitPrompt = false) => {
    if (!storeConfig?.bankId || !storeConfig?.bankAccountNo) {
      return (
        <div className="py-6 text-center text-xs text-red-500 font-bold">
          {t.ordersDrawer.bankNotConfigured}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.ordersDrawer.vietQrTransfer}</p>
        
        {/* QR Code Image Container */}
        <div
          className="w-36 h-36 sm:w-48 sm:h-48 bg-white border border-gray-200/60 rounded-[1.5rem] flex items-center justify-center p-3 relative shadow-md"
        >
          <img
            src={`https://img.vietqr.io/image/${sanitizeBankId(storeConfig.bankId)}-${storeConfig.bankAccountNo}-compact2.png?amount=${amount}&addInfo=Ban%20${selectedTable}%20Thanh%20Toan&accountName=${encodeURIComponent(storeConfig.bankAccountName || "")}`}
            alt="VietQR code"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Account Details Table */}
        <div className="w-full text-left bg-white border border-gray-100 rounded-xl p-3 text-xs space-y-2 font-medium shadow-sm mt-1">
          <div className="flex justify-between gap-3 border-b border-gray-50 pb-1.5">
            <span className="text-gray-400 shrink-0">{t.ordersDrawer.bankLabel}</span>
            <span className="font-bold text-gray-800 text-right break-words min-w-0">{storeConfig.bankId}</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-gray-50 pb-1.5 items-center">
            <span className="text-gray-400 shrink-0">{t.ordersDrawer.accountNumberLabel}</span>
            <div className="flex items-center justify-end gap-1.5 min-w-0">
              <span className="font-bold text-gray-800 text-right break-all">{storeConfig.bankAccountNo}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(storeConfig.bankAccountNo || "");
                  showAlert(t.ordersDrawer.copiedAccount);
                }}
                className="p-1 hover:bg-gray-100 rounded text-primary transition-colors"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          <div className="flex justify-between gap-3 border-b border-gray-50 pb-1.5">
            <span className="text-gray-400 shrink-0">{t.ordersDrawer.beneficiaryLabel}</span>
            <span className="font-bold text-gray-800 text-right break-words min-w-0">{storeConfig.bankAccountName || "N/A"}</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-gray-50 pb-1.5 items-center">
            <span className="text-gray-400 shrink-0">{t.ordersDrawer.transferContentLabel}</span>
            <div className="flex items-center justify-end gap-1.5 min-w-0">
              <span className="font-bold text-primary text-right break-words">Ban {selectedTable} Thanh Toan</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(`Ban ${selectedTable} Thanh Toan`);
                  showAlert(t.ordersDrawer.copiedContent);
                }}
                className="p-1 hover:bg-gray-100 rounded text-primary transition-colors"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400 shrink-0">{t.orders.totalAmount}</span>
            <span className="font-black text-primary text-sm">{amount.toLocaleString("vi-VN")} ₫</span>
          </div>
        </div>

        {showSubmitPrompt ? (
          <p className="text-[10px] text-amber-600 font-bold leading-normal px-2 mt-1 flex items-start gap-1">
            <Sparkles size={12} className="shrink-0 mt-0.5 animate-pulse" />
            <span>{t.ordersDrawer.instructionAfterTransfer}</span>
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 font-bold leading-normal px-2 mt-1">
            {t.ordersDrawer.instructionWaitApproval}
          </p>
        )}
      </div>
    );
  };

  if (!isOrdersOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity cursor-pointer"
        onClick={toggleOrders}
      />

      <div className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[500px] bg-gray-50 z-[101] shadow-2xl flex min-h-0 flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-100 bg-white shadow-sm shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              <h2 className="font-bold text-lg text-gray-900">
                {isStaff
                  ? activeTab === "all"
                    ? t.ordersDrawer.allOrdersTitle
                    : activeTab === "serving"
                      ? t.ordersDrawer.waitingServiceTitle
                      : t.ordersDrawer.tableOrdersTitle.replace("{table}", selectedTable)
                  : t.ordersDrawer.guestOrdersTitle.replace("{table}", selectedTable)}
              </h2>
            </div>
            <button onClick={toggleOrders} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector for Staff */}
          {isStaff && (
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("current")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "current" ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
              >
                {t.common.table} {selectedTable}
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "all" ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
              >
                {t.ordersDrawer.tabAll.replace("{count}", String(activeOrders.length))}
              </button>
              <button
                onClick={() => setActiveTab("serving")}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === "serving" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"} relative`}
              >
                {t.ordersDrawer.tabWaiting.replace("{count}", String(activeOrders.filter(o => o.status === "serving").length))}
                {activeOrders.filter(o => o.status === "serving").length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
          {/* Cumulative Subtotal Banner */}
          {activeTab === "current" && selectedTable && tableOrders.length > 0 && (
            <div className="bg-primary-soft border border-primary rounded-2xl p-4 flex justify-between items-center mb-2 shadow-sm">
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.ordersDrawer.subtotalTitle}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">{t.ordersDrawer.orderBatchesCount.replace("{count}", String(tableOrders.length))}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-primary">{tableTotal.toLocaleString("vi-VN")} ₫</p>
              </div>
            </div>
          )}

          {/* Table Summary for Staff */}
          {isStaff && activeTab === "current" && Object.keys(tableSummary).length > 0 && (
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-2">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ChefHat size={14} />
                {t.ordersDrawer.tableSummaryTitle.replace("{table}", selectedTable)}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(tableSummary).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between bg-white/60 p-2 rounded-xl text-sm">
                    <span className="font-bold text-gray-700">{name} <span className="text-blue-500">x{data.quantity}</span></span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${data.status === "pending" ? "bg-red-100 text-red-600" :
                      data.status === "cooking" ? "bg-primary-soft text-primary" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                      {data.status === "pending" ? t.ordersDrawer.waitingCook : data.status === "cooking" ? t.ordersDrawer.cooking : t.ordersDrawer.done}
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
                {activeTab === "serving" ? t.ordersDrawer.noWaitingItems : t.ordersDrawer.noItems}
              </p>
            </div>
          ) : (
            displayOrders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-primary/20 transition-all">
                <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center ${!order.isConfirmed ? "bg-red-50" : order.status === "serving" ? "bg-blue-50" : "bg-primary-soft/50"}`}>
                  <div className="flex items-center gap-2">
                    {(activeTab === "all" || activeTab === "serving") && (
                      <span className="bg-primary text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">{t.common.table} {order.tableNumber}</span>
                    )}
                    <span className="font-bold text-gray-800 text-sm">
                      {activeTab === "current" ? t.ordersDrawer.batchIndex.replace("{index}", String(tableOrders.length - index)) : t.ordersDrawer.orderCode.replace("{code}", order.id.slice(-4))}
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
                      <span className={`text-[10px] font-bold ${!order.isConfirmed ? "text-red-600" : order.status === "pending" ? "text-primary" : "text-gray-400"}`}>
                        {!order.isConfirmed ? t.ordersDrawer.kitchenStatusConfirm : t.ordersDrawer.kitchenStatusReceived}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${order.status === "pending" ? "bg-white border-2 border-gray-200 text-gray-300" :
                        order.status === "cooking" ? "bg-white border-2 border-orange-500 text-orange-500 animate-pulse" :
                          "bg-primary text-white"
                        }`}>
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${order.status === "cooking" ? "text-primary" : "text-gray-400"}`}>{t.ordersDrawer.kitchenStatusCooking}</span>
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
                          ? (isStaff ? t.ordersDrawer.statusServed : t.ordersDrawer.statusServedGuest)
                          : order.status === "serving"
                            ? (isStaff ? t.ordersDrawer.statusWaitingService : t.ordersDrawer.statusWaitingServiceGuest)
                            : t.ordersDrawer.statusWaitingService}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items.map((item: MappedOrderItem) => (
                    <div key={item.orderItemId} className="flex gap-3 items-center">
                      {(userRole === "staff" || userRole === "admin") && order.status !== "completed" && order.status !== "cancelled" && (
                        <button
                          disabled={updateItemStatusMutation.isPending || !item.isCooked}
                          onClick={() => {
                            updateItemStatusMutation.mutate({
                              orderId: order.id,
                              orderItemId: item.orderItemId,
                              isServed: !item.isServed,
                            });
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                            item.isServed
                              ? "bg-green-500 border-green-500 text-white cursor-pointer"
                              : !item.isCooked
                              ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                              : "bg-blue-50 border-2 border-blue-500 text-blue-500 hover:bg-blue-100 hover:border-blue-600 shadow-md cursor-pointer transition-all hover:scale-105"
                          }`}
                          title={!item.isCooked ? t.ordersDrawer.kitchenNotCooked : ""}
                        >
                          {item.isServed ? <Check size={14} strokeWidth={3} /> : null}
                        </button>
                      )}
                      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden relative flex-shrink-0">
                        <Image src={getImageUrl(item.image)} alt={item.name} fill unoptimized className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className={`font-semibold text-sm leading-tight pr-4 transition-colors ${item.isServed ? "text-gray-400 font-medium" : "text-gray-900"}`}>
                              {item.name}
                            </h4>
                            <div className="flex flex-col mt-0.5">
                              <span className="text-xs font-bold text-primary whitespace-nowrap">
                                {item.price.toLocaleString("vi-VN")}&nbsp;₫
                              </span>
                              {item.discountPercent > 0 && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-gray-400 line-through whitespace-nowrap">
                                    {item.originalPrice.toLocaleString("vi-VN")}&nbsp;₫
                                  </span>
                                  <span className="bg-red-50 text-red-500 text-[9px] font-black px-1.5 py-0.2 rounded border border-red-100 scale-90 origin-left shrink-0">
                                    -{item.discountPercent}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {(userRole === "staff" || userRole === "admin") && order.status !== "completed" && order.status !== "cancelled" && !item.isCooked && !item.isServed ? (
                            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-2xl px-2 py-1 shrink-0">
                              <button
                                disabled={updateOrderItemMutation.isPending}
                                onClick={async () => {
                                  if (item.quantity === 1) {
                                    if (await showConfirm(t.ordersDrawer.deleteItemConfirm.replace("{name}", item.name))) {
                                      updateOrderItemMutation.mutate({ orderId: order.id, productId: item.productId, quantity: 0 });
                                    }
                                  } else {
                                    updateOrderItemMutation.mutate({ orderId: order.id, productId: item.productId, quantity: item.quantity - 1 });
                                  }
                                }}
                                className="w-7 h-7 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors text-sm font-black disabled:opacity-50 cursor-pointer"
                              >
                                -
                              </button>
                              
                              {updateOrderItemMutation.isPending && 
                               updateOrderItemMutation.variables?.orderId === order.id && 
                               updateOrderItemMutation.variables?.productId === item.productId ? (
                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <span className="font-black text-sm w-5 text-center text-gray-800">{item.quantity}</span>
                              )}
                              
                              <button
                                disabled={updateOrderItemMutation.isPending}
                                onClick={() => {
                                  updateOrderItemMutation.mutate({ orderId: order.id, productId: item.productId, quantity: item.quantity + 1 });
                                }}
                                className="w-7 h-7 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors text-sm font-black disabled:opacity-50 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="font-black text-sm bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-xl shrink-0">x{item.quantity}</span>
                          )}
                        </div>
                        
                        {/* Chi tiết trạng thái món ăn */}
                        <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                          {item.isServed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black border border-green-100">
                              <Check size={10} strokeWidth={3} /> {t.ordersDrawer.statusServed}
                            </span>
                          ) : item.isCooked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 animate-pulse">
                              <ChefHat size={10} strokeWidth={3} /> {t.ordersDrawer.statusWaitingService}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-bold border border-gray-200">
                              <Clock size={10} strokeWidth={3} /> {t.ordersDrawer.statusPreparing}
                            </span>
                          )}
                        </div>

                        {item.note && (
                          <p className="text-xs text-gray-500 italic mt-1">Note: {item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 bg-gray-50 flex flex-col gap-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">{t.ordersDrawer.batchTotal}</span>
                    <span className="font-bold text-gray-900">{order.totalPrice.toLocaleString("vi-VN")} ₫</span>
                  </div>

                  {/* Staff Confirmation Button */}
                  {(userRole === "staff" || userRole === "admin") && !order.isConfirmed && (
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
                          {t.ordersDrawer.btnConfirmSeated}
                        </>
                      )}
                    </button>
                  )}

                  {/* Staff Serving Button */}
                  {(userRole === "staff" || userRole === "admin") && order.status === "serving" && (
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
                          {t.ordersDrawer.btnServedDone}
                        </>
                      )}
                    </button>
                  )}

                  {/* Guest Cancel Button */}
                  {userRole === "guest" && order.status === "pending" && (
                    <button
                      disabled={cancelOrderMutation.isPending}
                      onClick={async () => {
                        if (await showConfirm(t.ordersDrawer.cancelBatchConfirm)) {
                          cancelOrderMutation.mutate({ id: order.id, tableNumber: selectedTable });
                        }
                      }}
                      className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {cancelOrderMutation.isPending && cancelOrderMutation.variables?.id === order.id ? (
                        <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <>
                          <X size={16} />
                          {t.ordersDrawer.btnCancelBatch}
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
          <div
            className={`bg-white border-t border-gray-100 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe relative z-20 shrink-0 ${
              isCheckoutMode || pendingInvoice ? "max-h-[76dvh] overflow-y-auto overscroll-contain" : ""
            }`}
          >
            {pendingInvoice ? (
              // Status screen for pending payment
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-800">{t.ordersDrawer.pendingPaymentRequest}</h4>
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">{t.ordersDrawer.staffCheckingBill}</p>
                  </div>
                </div>

                {pendingInvoice.paymentMethod === "QR_TRANSFER" ? (
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-4 text-center">
                    {renderQRTransferDetails(tableTotal, false)}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center space-y-3 font-medium text-xs text-gray-600">
                    <Coins size={36} className="mx-auto text-amber-500 animate-bounce" />
                    <p className="font-bold text-gray-800 text-sm">{t.ordersDrawer.cashPaymentTitle}</p>
                    <p className="leading-relaxed text-gray-500">
                      {t.ordersDrawer.cashPaymentDesc.replace("{amount}", tableTotal.toLocaleString("vi-VN") + " ₫")}
                    </p>
                  </div>
                )}
              </div>
            ) : !isCheckoutMode ? (
              // Initial button
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">{t.orders.totalAmount}</span>
                  <span className="text-base font-black text-primary">{tableTotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                {hasUnservedItems ? (
                  <div className="flex-1 text-center bg-gray-100 text-gray-400 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-gray-200">
                    <AlertCircle size={14} className="text-amber-500 animate-pulse" />
                    <span>{t.ordersDrawer.waitUnservedToPay}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCheckoutMode(true)}
                    className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <CreditCard size={18} />
                    {t.ordersDrawer.btnPayBill}
                  </button>
                )}
              </div>
            ) : (
              // Payment choice screen
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-800">{t.ordersDrawer.paymentMethodTitle}</h4>
                  <button
                    onClick={() => {
                      setIsCheckoutMode(false);
                      setSelectedPayment(null);
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {t.common.back}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPayment("CASH")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group ${
                      selectedPayment === "CASH"
                        ? "border-primary bg-primary-soft/20 text-primary"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <Coins size={28} className={selectedPayment === "CASH" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"} />
                    <span className="text-xs font-black uppercase">{t.ordersDrawer.cashLabel}</span>
                  </button>

                  <button
                    disabled={!(storeConfig?.bankId && storeConfig?.bankAccountNo)}
                    onClick={() => setSelectedPayment("QR_TRANSFER")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group disabled:opacity-50 ${
                      selectedPayment === "QR_TRANSFER"
                        ? "border-primary bg-primary-soft/20 text-primary"
                        : "border-gray-100 hover:border-gray-200 text-gray-500"
                    }`}
                  >
                    <QrCode size={28} className={selectedPayment === "QR_TRANSFER" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"} />
                    <span className="text-xs font-black uppercase">{t.ordersDrawer.qrLabel}</span>
                  </button>
                </div>

                {selectedPayment === "QR_TRANSFER" && (
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-4 text-center mt-2">
                    {renderQRTransferDetails(tableTotal, true)}
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
                      onError: (err: unknown) => {
                        showAlert(translateApiError(err, t, t.ordersDrawer.submitPaymentError));
                      }
                    });
                  }}
                  className="sticky bottom-0 w-full bg-primary disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {requestCheckoutMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      {t.ordersDrawer.btnSubmitPaymentRequest}
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
