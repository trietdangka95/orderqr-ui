"use client";
 
import { motion } from "framer-motion";
import { CheckCircle2 as CheckIcon, X as XIcon, AlertCircle, Banknote, QrCode, Printer } from "lucide-react";
import { Order, useCartStore } from "@/store/cartStore";
import { showConfirm } from "@/store/dialogStore";

interface TableStatusCardProps {
  tableNumber: string;
  tableOrders: any[];
  formatPrice: (price: number) => string;
  onCheckout: (tableNumber: string) => void;
  onConfirmOrder: (orderId: string) => void;
  onConfirmInvoicePayment: (invoiceId: string, tableNumber: string, amount: number) => void;
  onPrintInvoice: (tableNumber: string) => void;
}

export default function TableStatusCard({
  tableNumber,
  tableOrders,
  formatPrice,
  onCheckout,
  onConfirmOrder,
  onConfirmInvoicePayment,
  onPrintInvoice,
}: TableStatusCardProps) {
  const totalAmount = tableOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const hasUnconfirmed = tableOrders.some((o) => !o.isConfirmed);

  // Find if there is an active invoice waiting for approval
  const pendingInvoice = tableOrders.find((o) => o.invoiceId && o.invoice?.paymentStatus === "PENDING")?.invoice;
  const isQrPayment = pendingInvoice?.paymentMethod === "QR_TRANSFER";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-[2rem] shadow-xl shadow-slate-100/30 border-2 overflow-hidden flex flex-col transition-all duration-300 ${
        pendingInvoice
          ? "border-amber-400 bg-amber-50/5"
          : hasUnconfirmed
          ? "border-red-300 bg-red-50/5"
          : "border-slate-100"
      }`}
    >
      <div
        className={`p-6 border-b flex items-center justify-between transition-colors ${
          pendingInvoice
            ? "bg-amber-50/30 border-amber-100"
            : hasUnconfirmed
            ? "bg-red-50/30 border-red-100"
            : "bg-slate-50/50 border-slate-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 ${
              pendingInvoice
                ? "bg-amber-500 shadow-amber-200/50"
                : hasUnconfirmed
                ? "bg-red-500 shadow-red-200/50"
                : "bg-slate-900 shadow-slate-200"
            }`}
          >
            {tableNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800">Bàn {tableNumber}</h3>
              <button
                onClick={() => onPrintInvoice(tableNumber)}
                className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-center"
                title="In hóa đơn tạm tính"
              >
                <Printer size={15} />
              </button>
            </div>
            {pendingInvoice ? (
              <span className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 animate-pulse">
                {isQrPayment ? (
                  <>
                    <QrCode size={10} /> Chuyển khoản QR
                  </>
                ) : (
                  <>
                    <Banknote size={10} /> Thu Tiền mặt
                  </>
                )}
              </span>
            ) : hasUnconfirmed ? (
              <span className="text-[10px] font-black text-red-600 uppercase animate-pulse">
                Có đơn mới chờ duyệt!
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tổng cộng</div>
          <div className="text-lg font-black text-primary">{formatPrice(totalAmount)}</div>
        </div>
      </div>
 
      {/* Pending Alert banner inside card */}
      {pendingInvoice && (
        <div className="bg-amber-50 px-6 py-2 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-800 font-bold">
          <AlertCircle size={14} className="shrink-0 text-amber-600" />
          <span>
            Khách đã yêu cầu thanh toán bằng{" "}
            {isQrPayment ? "Chuyển khoản VietQR" : "Tiền mặt"}. Vui lòng đối soát.
          </span>
        </div>
      )}
 
      <div className="flex-1 p-6 space-y-4 max-h-[400px] overflow-y-auto">
        {tableOrders.map((order) => (
          <div key={order.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Đơn #{order.id.slice(-4)}
                </span>
                {!pendingInvoice && (
                  <button
                    onClick={async () => {
                      if (await showConfirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
                        useCartStore.getState().orders = useCartStore.getState().orders.filter(
                          (o) => o.id !== order.id
                        );
                        useCartStore.setState({ orders: useCartStore.getState().orders });
                      }
                    }}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
              {!order.isConfirmed ? (
                <button
                  onClick={() => onConfirmOrder(order.id)}
                  className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase hover:bg-red-600 transition-colors"
                >
                  Xác nhận ngay
                </button>
              ) : (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    pendingInvoice
                      ? "bg-amber-100 text-amber-700"
                      : order.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {pendingInvoice ? "Chờ duyệt chi" : order.status === "completed" ? "Đã phục vụ" : "Đang xử lý"}
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {order.items.map((item: any) => (
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
        {pendingInvoice ? (
          <button
            onClick={() => onConfirmInvoicePayment(pendingInvoice.id, tableNumber, totalAmount)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            <CheckIcon size={20} />
            Xác nhận Đã nhận tiền
          </button>
        ) : hasUnconfirmed ? (
          <button
            onClick={() => {
              const unconfirmed = tableOrders.filter((o) => !o.isConfirmed);
              unconfirmed.forEach((o) => onConfirmOrder(o.id));
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all active:scale-95 cursor-pointer"
          >
            <CheckIcon size={20} />
            Xác nhận đơn mới
          </button>
        ) : (
          <button
            onClick={() => onCheckout(tableNumber)}
            className="w-full bg-primary hover:opacity-90 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95 cursor-pointer"
          >
            <CheckIcon size={20} />
            Thanh toán & Trả bàn
          </button>
        )}
      </div>
    </motion.div>
  );
}
