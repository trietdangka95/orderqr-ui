"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt as ReceiptIcon,
  QrCode as QrCodeIcon,
  Printer as PrinterIcon
} from "lucide-react";
import { useCartStore, Order, OrderStatus } from "@/store/cartStore";
import TableStatusCard from "./components/TableStatusCard";
import QRCodeCard from "./components/QRCodeCard";
import { useOrders, useClearTable, useConfirmOrder, useConfirmInvoicePayment } from "@/hooks/useOrders";
import useIsMounted from "@/hooks/useIsMounted";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminTablesPage() {
  const { tables, addTable, addMultipleTables, removeTable, storeConfig } = useCartStore();
  const { data: apiOrders = [] } = useOrders();
  const clearTableMutation = useClearTable();
  const confirmOrderMutation = useConfirmOrder();
  const confirmInvoicePaymentMutation = useConfirmInvoicePayment();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Custom confirmation modal states
  const [checkoutConfirmTable, setCheckoutConfirmTable] = useState<string | null>(null);
  const [paymentConfirmInvoice, setPaymentConfirmInvoice] = useState<{ invoiceId: string; tableNumber: string; amount: number; paymentMethod: string } | null>(null);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const refreshOrders = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
  }, [socket, queryClient]);

  const orders = apiOrders.map(o => ({
    ...o,
    status: o.status.toLowerCase() as OrderStatus,
    timestamp: new Date(o.createdAt).getTime(),
    isConfirmed: o.isConfirmed,
    items: o.orderItems.map((i) => {
      const price = i.priceAtTime !== undefined ? Number(i.priceAtTime) : (i.product?.price || 0);
      const originalPrice = i.originalPriceAtTime !== null && i.originalPriceAtTime !== undefined
        ? Number(i.originalPriceAtTime)
        : (i.product?.price || 0);
      const discountPercent = i.discountPercentAtTime !== null && i.discountPercentAtTime !== undefined
        ? i.discountPercentAtTime
        : (i.product?.discountPercent || 0);

      return {
        ...i,
        id: i.productId,
        name: i.product?.name || 'Món ăn',
        image: i.product?.image || '',
        price,
        originalPrice,
        discountPercent,
        description: i.product?.description || '',
        category: i.product?.category || '',
        categoryId: i.product?.categoryId || 0,
        note: i.note || '',
      };
    }),
    totalPrice: Number(o.totalPrice || o.orderItems.reduce((sum: number, i) => {
      const itemPrice = i.priceAtTime !== undefined ? Number(i.priceAtTime) : (i.product?.price || 0);
      return sum + itemPrice * i.quantity;
    }, 0))
  }));
  const [activeTab, setActiveTab] = useState<"status" | "qr">("status");
  const [newTableNum, setNewTableNum] = useState("");
  const [printingTable, setPrintingTable] = useState<string | null>(null);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const activeOrders = orders.filter(
    (o) => (!o.invoiceId || o.invoice?.paymentStatus === "PENDING") && o.status !== "cancelled"
  );

  const tableStatus = activeOrders.reduce((acc, order) => {
    const tNum = order.tableNumber || "??";
    if (!acc[tNum]) {
      acc[tNum] = [];
    }
    acc[tNum].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleCheckout = (tableNumber: string) => {
    setCheckoutConfirmTable(tableNumber);
  };

  const receiptOrders = printingTable ? (tableStatus[printingTable] || []) : [];
  const receiptTotal = receiptOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  const receiptOriginalTotal = useMemo(() => {
    return receiptOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum: number, item: any) => {
        const origPrice = Number(item.originalPrice || item.price);
        return itemSum + origPrice * item.quantity;
      }, 0);
    }, 0);
  }, [receiptOrders]);

  const receiptSavedAmount = useMemo(() => {
    return receiptOriginalTotal - receiptTotal;
  }, [receiptOriginalTotal, receiptTotal]);

  const receiptItems = useMemo(() => {
    const itemMap: Record<string, { name: string; quantity: number; price: number; originalPrice: number; discountPercent: number }> = {};
    receiptOrders.forEach((order) => {
      order.items.forEach((item: any) => {
        if (!itemMap[item.productId]) {
          itemMap[item.productId] = {
            name: item.name,
            quantity: 0,
            price: Number(item.price),
            originalPrice: Number(item.originalPrice || item.price),
            discountPercent: Number(item.discountPercent || 0)
          };
        }
        itemMap[item.productId].quantity += item.quantity;
      });
    });
    return Object.values(itemMap);
  }, [receiptOrders]);

  const handlePrintReceipt = () => {
    const printEl = document.querySelector(".thermal-receipt-print-area");
    if (!printEl) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <html>
        <head>
          <title>In hóa đơn Bàn ${printingTable}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 4mm;
              font-family: monospace;
              font-size: 11px;
              line-height: 1.5;
              color: black;
              background: white;
            }
            .text-center { text-align: center; }
            .space-y-1 > * { margin-top: 2px; margin-bottom: 2px; }
            .mb-4 { margin-bottom: 16px; }
            .mt-1 { margin-top: 4px; }
            .mt-4 { margin-top: 16px; }
            .my-2 { margin-top: 8px; margin-bottom: 8px; }
            .my-3 { margin-top: 12px; margin-bottom: 12px; }
            .my-4 { margin-top: 16px; margin-bottom: 16px; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .text-lg { font-size: 16px; }
            .text-sm { font-size: 13px; }
            .text-xs { font-size: 11px; }
            .text-primary { color: #f97316; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-400 { color: #9ca3af; }
            .w-full { width: 100%; }
            .border-collapse { border-collapse: collapse; }
            .border-b { border-bottom: 1px solid black; }
            .border-t { border-top: 1px solid black; }
            .border-dashed { border-style: dashed; }
            .border-dotted { border-style: dotted; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .pt-1 { padding-top: 4px; }
            .pt-1.5 { padding-top: 6px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .truncate {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .max-w-[120px] { max-width: 120px; }
          </style>
        </head>
        <body>
          ${printEl.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.frameElement.remove();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableNum) {
      const formatted = isNaN(parseInt(newTableNum)) ? newTableNum : newTableNum.padStart(2, "0");
      addTable(formatted);
      setNewTableNum("");
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Quản lý Bàn</h1>
          <p className="text-gray-500 font-medium italic">Theo dõi trạng thái và in mã QR cho từng bàn tại quán</p>
        </div>

        <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm h-fit gap-1">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
              activeTab === "status"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/30"
            }`}
          >
            Trạng thái
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
              activeTab === "qr"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/30"
            }`}
          >
            Mã QR
          </button>
        </div>
      </header>

      <main className="py-2">
        {activeTab === "status" ? (
          /* Table Status View */
          Object.keys(tableStatus).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ReceiptIcon size={64} className="mb-4 opacity-20" />
              <p className="text-lg italic">Hiện không có bàn nào đang sử dụng.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(tableStatus).map(([tableNumber, tableOrders]) => (
                <TableStatusCard
                  key={tableNumber}
                  tableNumber={tableNumber}
                  tableOrders={tableOrders}
                  formatPrice={formatPrice}
                  onCheckout={handleCheckout}
                  onConfirmOrder={(id) => confirmOrderMutation.mutate(id)}
                  onConfirmInvoicePayment={(id, tableNum, amount, method) => setPaymentConfirmInvoice({ invoiceId: id, tableNumber: tableNum, amount, paymentMethod: method })}
                  onPrintInvoice={setPrintingTable}
                />
              ))}
            </div>
          )
        ) : (
          /* QR Code Management View */
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Danh sách mã QR Bàn</h2>
                <p className="text-sm text-gray-500 font-medium">In mã này để dán lên từng bàn tại quán.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleAddTable} className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 focus-within:border-orange-500 transition-all shadow-sm">
                  <input
                    type="text"
                    placeholder="Số bàn (vd: 06)"
                    value={newTableNum}
                    onChange={(e) => setNewTableNum(e.target.value)}
                    className="w-40 px-4 outline-none text-sm font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary transition-all active:scale-95"
                  >
                    Thêm bàn
                  </button>
                </form>

                <button
                  onClick={() => addMultipleTables(10)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  <QrCodeIcon size={18} />
                  Thêm nhanh 10 bàn
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  <PrinterIcon size={18} />
                  In tất cả
                </button>
              </div>
            </div>

            <div className="print-qr-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {tables.map((t) => (
                <QRCodeCard
                  key={t}
                  tableNum={t}
                  qrLink={`${baseUrl}/?table=${t}`}
                  onRemove={removeTable}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      {/* Receipt Print Modal */}
      {printingTable && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative">
            <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">Xem trước Hóa đơn</h3>

            {/* Thermal Receipt Box */}
            <div className="border border-gray-200 rounded-2xl p-4 max-h-[60vh] overflow-y-auto bg-gray-50/50 mb-6 no-scrollbar">
              {/* This is the printable area */}
              <div className="thermal-receipt-print-area font-mono text-[11px] leading-relaxed text-black bg-white p-4 shadow-sm w-full max-w-[80mm] mx-auto border">
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-base font-black uppercase tracking-tight">{storeConfig?.name || "MENU VIỆT"}</h2>
                  {storeConfig?.description && (
                    <p className="text-[9px] text-gray-500 font-bold leading-normal">{storeConfig.description}</p>
                  )}
                  <p className="text-[9px] text-gray-400 font-medium">Hệ thống Order QR</p>
                  <div className="border-t border-dashed border-gray-400 my-2"></div>
                  <h3 className="text-xs font-black uppercase tracking-wider">HÓA ĐƠN TẠM TÍNH</h3>
                  <p className="text-sm font-black text-primary">BÀN: {printingTable}</p>
                  <p className="text-[9px] text-gray-500 font-medium mt-1">Giờ vào: {receiptOrders[0] ? new Date(receiptOrders[receiptOrders.length - 1].timestamp).toLocaleTimeString("vi-VN") : ""}</p>
                  <p className="text-[9px] text-gray-500 font-medium">Giờ in: {new Date().toLocaleTimeString("vi-VN")} {new Date().toLocaleDateString("vi-VN")}</p>
                </div>

                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-dashed border-black text-left font-black">
                      <th className="py-1">Món ăn</th>
                      <th className="py-1 text-center">SL</th>
                      <th className="py-1 text-right">T.Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptItems.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-dotted border-gray-200">
                        <td className="py-1 max-w-[120px] truncate font-bold text-gray-800">
                          {item.name}
                          {item.discountPercent > 0 && (
                            <span style={{ fontSize: '8px', color: '#dc2626', display: 'block', fontWeight: 'bold' }}>
                              (KM -{item.discountPercent}%)
                            </span>
                          )}
                        </td>
                        <td className="py-1 text-center font-bold">{item.quantity}</td>
                        <td className="py-1 text-right font-bold">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          {item.discountPercent > 0 && (
                            <span style={{ fontSize: '8px', textDecoration: 'line-through', color: '#9ca3af', display: 'block' }}>
                              {(item.originalPrice * item.quantity).toLocaleString("vi-VN")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-dashed border-gray-400 my-3"></div>

                <div className="space-y-1 text-[11px] font-bold">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{receiptOriginalTotal.toLocaleString("vi-VN")} ₫</span>
                  </div>
                  {receiptSavedAmount > 0 && (
                    <div className="flex justify-between" style={{ color: '#dc2626' }}>
                      <span>Giảm giá:</span>
                      <span>-{receiptSavedAmount.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xs border-t border-black pt-1.5 mt-1">
                    <span>TỔNG CỘNG:</span>
                    <span className="text-primary">{receiptTotal.toLocaleString("vi-VN")} ₫</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-400 my-4"></div>

                <div className="text-center text-[9px] font-bold space-y-1">
                  <p className="text-gray-900 uppercase">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
                  <p className="italic text-gray-400 font-medium">Powered by orderqr.id.vn</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPrintingTable(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl text-sm transition-all"
              >
                Đóng
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-[2] py-3 bg-primary hover:bg-primary/95 text-white font-black rounded-xl text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <PrinterIcon size={16} />
                In Hóa Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Checkout Confirmation Modal */}
      <AnimatePresence>
        {checkoutConfirmTable && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative border border-slate-100"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 text-2xl font-black">
                💳
              </div>
              <h3 className="font-black text-gray-950 text-lg mb-2 text-center">Xác nhận thanh toán</h3>
              <p className="text-gray-500 text-xs text-center font-bold leading-relaxed mb-6 px-4">
                Bạn có chắc chắn muốn thanh toán và giải phóng <span className="text-primary font-black">Bàn {checkoutConfirmTable}</span>? Hành động này sẽ hoàn tất tất cả đơn hàng hiện tại của bàn này.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setCheckoutConfirmTable(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer animate-none"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    setPrintingTable(checkoutConfirmTable);
                  }}
                  className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <PrinterIcon size={12} />
                  In HĐ
                </button>
                <button
                  onClick={() => {
                    clearTableMutation.mutate(checkoutConfirmTable);
                    setCheckoutConfirmTable(null);
                  }}
                  className="flex-1 py-3 bg-primary hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-100 transition-all cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Payment Confirmation Modal */}
      <AnimatePresence>
        {paymentConfirmInvoice && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative border border-slate-100"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 text-2xl font-black">
                💰
              </div>
              <h3 className="font-black text-gray-950 text-lg mb-2 text-center">Đã nhận đủ tiền?</h3>
              <p className="text-gray-500 text-xs text-center font-bold leading-relaxed mb-6 px-4">
                Xác nhận đã nhận số tiền <span className="text-primary font-black">{formatPrice(paymentConfirmInvoice.amount)}</span> ({paymentConfirmInvoice.paymentMethod === "QR_TRANSFER" ? "Chuyển khoản QR" : "Tiền mặt"}) từ <span className="text-amber-500 font-black">Bàn {paymentConfirmInvoice.tableNumber}</span>? Trạng thái bàn sẽ được cập nhật.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentConfirmInvoice(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    setPrintingTable(paymentConfirmInvoice.tableNumber);
                  }}
                  className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <PrinterIcon size={12} />
                  In HĐ
                </button>
                <button
                  onClick={() => {
                    confirmInvoicePaymentMutation.mutate(paymentConfirmInvoice.invoiceId);
                    setPaymentConfirmInvoice(null);
                  }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-100 transition-all cursor-pointer"
                >
                  Đồng ý
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          
          body { 
            background: white !important; 
            color: black !important;
          }
          
          .print\\:hidden { 
            display: none !important; 
          }
          
          header, footer, nav, aside { 
            display: none !important; 
          }
          
          main { 
            padding: 0 !important; 
            margin: 0 !important; 
            max-width: 100% !important; 
          }
          
          .print-qr-grid { 
            display: grid !important; 
            grid-template-columns: repeat(3, 6.0cm) !important; 
            gap: 0.5cm !important;
            justify-content: center !important;
            padding-top: 0.5cm !important;
            background: white !important;
          }
          
          .print-qr-card {
            width: 6.0cm !important;
            height: 9.0cm !important;
            padding: 0.4cm !important;
            border-radius: 0.4cm !important;
            border: 1px dashed #9ca3af !important;
            box-shadow: none !important;
            background: white !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      ` }} />
    </div>
  );
}
