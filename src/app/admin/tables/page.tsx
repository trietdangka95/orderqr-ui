"use client";

import { useState, useEffect } from "react";
import {
  Receipt as ReceiptIcon,
  QrCode as QrCodeIcon,
  Printer as PrinterIcon
} from "lucide-react";
import { useCartStore, Order, OrderStatus } from "@/store/cartStore";
import TableStatusCard from "./components/TableStatusCard";
import QRCodeCard from "./components/QRCodeCard";
import { useOrders, useClearTable, useConfirmOrder } from "@/hooks/useOrders";
import useIsMounted from "@/hooks/useIsMounted";
import { useSocket } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminTablesPage() {
  const { tables, addTable, addMultipleTables, removeTable } = useCartStore();
  const { data: apiOrders = [] } = useOrders();
  const clearTableMutation = useClearTable();
  const confirmOrderMutation = useConfirmOrder();
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
    status: o.status.toLowerCase() as OrderStatus,
    timestamp: new Date(o.createdAt).getTime(),
    isConfirmed: o.isConfirmed,
    items: o.items.map(i => ({
      ...i,
      id: i.productId,
      name: i.product?.name || 'Món ăn',
      image: i.product?.image || '',
      price: i.product?.price || 0,
      description: i.product?.description || '',
      category: i.product?.category || '',
      categoryId: i.product?.categoryId || 0,
      note: i.note || '',
    })),
    totalPrice: o.totalAmount || o.items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0)
  }));
  const [activeTab, setActiveTab] = useState<"status" | "qr">("status");
  const [newTableNum, setNewTableNum] = useState("");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

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
      clearTableMutation.mutate(tableNumber);
    }
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

        <div className="flex bg-gray-100 p-1.5 rounded-2xl border shadow-sm h-fit">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === "status" ? "bg-white shadow-md text-primary" : "text-gray-500"}`}
          >
            Trạng thái
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${activeTab === "qr" ? "bg-white shadow-md text-primary" : "text-gray-500"}`}
          >
            Mã QR
          </button>
        </div>
      </header>

      <main className="py-8">
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

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          header, footer, nav, aside { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .grid { 
            display: grid !important; 
            grid-template-columns: repeat(3, 1fr) !important; 
            gap: 20px !important;
          }
          .break-inside-avoid { break-inside: avoid !important; }
          
          /* Force only QR section to show if activeTab is QR */
          ${activeTab === 'qr' ? `
            section, div:has(> .grid) { display: block !important; }
          ` : ''}
          
          /* Clean up cards for print */
          .bg-white { border: 1px solid #eee !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
