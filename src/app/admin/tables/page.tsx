"use client";

import { useCartStore, Order } from "@/store/cartStore";
import { ChevronLeft as ChevronLeftIcon, CheckCircle2 as CheckIcon, Receipt as ReceiptIcon, Clock as ClockIcon, QrCode as QrCodeIcon, Printer as PrinterIcon, X as XIcon } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";

export default function AdminTablesPage() {
  const { orders, clearTableOrders, confirmOrder, tables, addTable, addMultipleTables, removeTable } = useCartStore();
  const [activeTab, setActiveTab] = useState<"status" | "qr">("status");
  const [baseUrl, setBaseUrl] = useState("");
  const [newTableNum, setNewTableNum] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const tableStatus = orders.reduce((acc, order) => {
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
    if (confirm(`Xác nhận thanh toán và giải phóng Bàn ${tableNumber}?`)) {
      clearTableOrders(tableNumber);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTableNum) {
      // Chấp nhận cả text hoặc số, tự động format
      const formatted = isNaN(parseInt(newTableNum)) ? newTableNum : newTableNum.padStart(2, "0");
      addTable(formatted);
      setNewTableNum("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 print:bg-white print:pb-0">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 print:hidden">
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

          <div className="flex bg-gray-100 p-1 rounded-xl border">
            <button
              onClick={() => setActiveTab("status")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "status" ? "bg-white shadow-sm text-orange-500" : "text-gray-500"}`}
            >
              Trạng thái
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "qr" ? "bg-white shadow-sm text-orange-500" : "text-gray-500"}`}
            >
              Mã QR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "status" ? (
          /* Table Status View */
          Object.keys(tableStatus).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ReceiptIcon size={64} className="mb-4 opacity-20" />
              <p className="text-lg italic">Hiện không có bàn nào đang sử dụng.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(tableStatus).map(([tableNumber, tableOrders]) => {
                const totalAmount = tableOrders.reduce((sum, order) => sum + order.totalPrice, 0);
                const lastOrderTime = new Date(Math.max(...tableOrders.map(o => o.timestamp)));
                const hasUnconfirmed = tableOrders.some(o => !o.isConfirmed);

                return (
                  <motion.div
                    key={tableNumber}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden flex flex-col transition-colors ${hasUnconfirmed ? "border-red-200" : "border-gray-100"}`}
                  >
                    <div className={`p-6 border-b flex items-center justify-between ${hasUnconfirmed ? "bg-red-50" : "bg-orange-50/50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${hasUnconfirmed ? "bg-red-500 shadow-red-200" : "bg-orange-500 shadow-orange-200"}`}>
                          {tableNumber}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">Bàn {tableNumber}</h3>
                          {hasUnconfirmed && <span className="text-[10px] font-black text-red-600 uppercase animate-pulse">Có đơn mới chờ duyệt!</span>}
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
                            {!order.isConfirmed ? (
                              <button
                                onClick={() => confirmOrder(order.id)}
                                className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase hover:bg-red-600 transition-colors"
                              >
                                Xác nhận ngay
                              </button>
                            ) : (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${order.status === "completed" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                }`}>
                                {order.status === "completed" ? "Đã phục vụ" : "Đang xử lý"}
                              </span>
                            )}
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
                    className="w-32 px-4 outline-none text-sm font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all active:scale-95"
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {tables.map((t) => {
                const qrLink = `${baseUrl}/?table=${t}`;
                return (
                  <div key={t} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:border-orange-200 transition-all duration-500 break-inside-avoid mb-4 relative">
                    {/* Delete button (only visible on hover and not during print) */}
                    <button
                      onClick={() => {
                        if (confirm(`Xóa bàn ${t}?`)) removeTable(t);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all print:hidden"
                    >
                      <XIcon size={16} />
                    </button>

                    <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-black text-xl mb-4 shadow-lg shadow-orange-100">
                      {t}
                    </div>
                    <div className="p-3 bg-white border-4 border-gray-50 rounded-3xl mb-4 group-hover:border-orange-50 transition-colors">
                      <QRCodeSVG
                        value={qrLink}
                        size={120}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "https://placehold.co/100x100/orange/white?text=H",
                          x: undefined,
                          y: undefined,
                          height: 24,
                          width: 24,
                          excavate: true,
                        }}
                      />
                    </div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">BÀN SỐ {t}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate w-full px-2">{qrLink}</p>

                    <div className="hidden print:block mt-4 pt-4 border-t border-dashed border-gray-200 w-full">
                      <p className="text-[10px] font-bold text-gray-800">HOMI MEDIA - MENU QR</p>
                      <p className="text-[8px] text-gray-400 italic">Vui lòng quét mã để gọi món</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          .print\:block { display: block !important; }
          header, footer, nav { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .grid { display: block !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
