"use client";
 
import { motion } from "framer-motion";
import { CheckCircle2 as CheckIcon, X as XIcon, AlertCircle, Banknote, QrCode, Printer } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { showConfirm } from "@/store/dialogStore";
import { useTranslation } from "@/hooks/useTranslation";

interface TableOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PendingInvoice {
  id: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface TableOrder {
  id: string;
  totalPrice: number;
  status: string;
  isConfirmed?: boolean;
  invoiceId?: string | null;
  invoice?: PendingInvoice | null;
  items: TableOrderItem[];
}

interface TableStatusCardProps {
  tableNumber: string;
  tableOrders: TableOrder[];
  formatPrice: (price: number) => string;
  onCheckout: (tableNumber: string) => void;
  onConfirmOrder: (orderId: string) => void;
  onConfirmInvoicePayment: (invoiceId: string, tableNumber: string, amount: number, paymentMethod: string) => void;
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
  const t = useTranslation();
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
      className={`bg-white rounded-[2rem] shadow-xl shadow-slate-100/30 border-2 overflow-hidden flex h-fit flex-col transition-all duration-300 ${
        pendingInvoice
          ? "border-amber-400 bg-amber-50/5"
          : hasUnconfirmed
          ? "border-red-300 bg-red-50/5"
          : "border-slate-100"
      }`}
    >
      <div
        className={`p-4 border-b flex items-center justify-between gap-2 transition-colors ${
          pendingInvoice
            ? "bg-amber-50/30 border-amber-100"
            : hasUnconfirmed
            ? "bg-red-50/30 border-red-100"
            : "bg-slate-50/50 border-slate-100"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-10 h-10 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shrink-0 transition-all duration-300 ${
              pendingInvoice
                ? "bg-amber-500 shadow-amber-200/50"
                : hasUnconfirmed
                ? "bg-red-500 shadow-red-200/50"
                : "bg-slate-900 shadow-slate-200"
            }`}
          >
            {tableNumber}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-800 text-sm truncate">{t.tables.labelTable.replace("{table}", tableNumber)}</h3>
              <button
                onClick={() => onPrintInvoice(tableNumber)}
                className="p-1 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-center"
                title={t.tables.printTempBill}
              >
                <Printer size={14} />
              </button>
            </div>
            {pendingInvoice ? (
              <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1 animate-pulse">
                {isQrPayment ? (
                  <>
                    <QrCode size={9} /> {t.tables.qrTransfer}
                  </>
                ) : (
                  <>
                    <Banknote size={9} /> {t.tables.cashPayment}
                  </>
                )}
              </span>
            ) : hasUnconfirmed ? (
              <span className="text-[9px] font-black text-red-600 uppercase animate-pulse">
                {t.tables.newOrderPending}
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider leading-none mb-1">{t.cart.total}</div>
          <div className="text-base font-black text-primary leading-none">{formatPrice(totalAmount)}</div>
        </div>
      </div>
 
      {/* Pending Alert banner inside card */}
      {pendingInvoice && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center gap-1.5 text-[10px] text-amber-800 font-bold">
          <AlertCircle size={12} className="shrink-0 text-amber-600" />
          <span className="leading-normal">
            {t.tables.guestRequestPayment.replace("{method}", isQrPayment ? t.tables.qrTransfer : t.tables.cashPayment)}
          </span>
        </div>
      )}
 
      <div className="p-4 space-y-3 sm:space-y-4 max-h-[320px] sm:max-h-[400px] overflow-y-auto">
        {tableOrders.map((order) => (
          <div key={order.id} className="pb-3 sm:pb-4 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2 gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider truncate">
                  Order #{order.id.slice(-4)}
                </span>
                {!pendingInvoice && (
                  <button
                    onClick={async () => {
                      if (await showConfirm(t.tables.confirmDeleteOrder)) {
                        useCartStore.getState().orders = useCartStore.getState().orders.filter(
                          (o) => o.id !== order.id
                        );
                        useCartStore.setState({ orders: useCartStore.getState().orders });
                      }
                    }}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <XIcon size={12} />
                  </button>
                )}
              </div>
              {!order.isConfirmed ? (
                <button
                  onClick={() => onConfirmOrder(order.id)}
                  className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black uppercase hover:bg-red-600 transition-colors shrink-0"
                >
                  {t.tables.confirmNow}
                </button>
              ) : (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase shrink-0 ${
                    pendingInvoice
                      ? "bg-amber-100 text-amber-700"
                      : order.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {pendingInvoice ? t.tables.pendingPayment : order.status === "completed" ? t.tables.served : t.tables.processing}
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-700 min-w-0 break-words">
                    <span className="font-bold text-orange-500">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="text-gray-500 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
 
      <div className="p-3.5 sm:p-4 bg-gray-50 border-t">
        {pendingInvoice ? (
          <button
            onClick={() => onConfirmInvoicePayment(pendingInvoice.id, tableNumber, totalAmount, pendingInvoice.paymentMethod || "CASH")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-200 transition-all active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
          >
            <CheckIcon size={16} />
            {t.tables.confirmPaymentReceived}
          </button>
        ) : hasUnconfirmed ? (
          <button
            onClick={() => {
              const unconfirmed = tableOrders.filter((o) => !o.isConfirmed);
              unconfirmed.forEach((o) => onConfirmOrder(o.id));
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-200 transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <CheckIcon size={16} />
            {t.tables.confirmNewOrders}
          </button>
        ) : (
          <button
            onClick={() => onCheckout(tableNumber)}
            className="w-full bg-primary hover:opacity-90 text-white py-3 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-orange-100 transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <CheckIcon size={16} />
            {t.tables.checkoutReleaseTable}
          </button>
        )}
      </div>
    </motion.div>
  );
}
