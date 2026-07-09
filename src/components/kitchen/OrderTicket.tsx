// src/components/kitchen/OrderTicket.tsx
"use client";

import { Clock, ChefHat, Check } from "lucide-react";
import { useUpdateOrderItemStatus } from "@/hooks/useOrders";
import { VirtualTicket, ColumnType } from "@/app/admin/kitchen/page";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";

interface OrderTicketProps {
  ticket: VirtualTicket;
  columnType: ColumnType;
}

export default function OrderTicket({ ticket, columnType }: OrderTicketProps) {
  const t = useTranslation();
  const { language, storeConfig } = useCartStore();
  const updateItemStatusMutation = useUpdateOrderItemStatus();
  const locale = language === "vi" ? "vi-VN" : "en-US";

  const handleItemAction = (orderItemId: string, action: "startCooking" | "doneCooking" | "served") => {
    if (updateItemStatusMutation.isPending) return;

    if (action === "startCooking") {
      updateItemStatusMutation.mutate({ orderId: ticket.orderId, orderItemId, isCooking: true });
    } else if (action === "doneCooking") {
      updateItemStatusMutation.mutate({ orderId: ticket.orderId, orderItemId, isCooked: true });
      // isCooking is auto-cleared by the backend when isCooked=true
    } else if (action === "served") {
      updateItemStatusMutation.mutate({ orderId: ticket.orderId, orderItemId, isServed: true });
    }
  };

  const hoverBorderColors = {
    pending: "hover:border-red-500/30",
    cooking: "hover:border-orange-500/30",
    serving: "hover:border-blue-500/30",
    completed: "hover:border-green-500/30",
  };

  const noteColors = {
    pending: "bg-red-50 border-red-200 text-red-600",
    cooking: "bg-orange-50 border-orange-200 text-orange-600",
    serving: "bg-blue-50 border-blue-200 text-blue-600",
    completed: "bg-green-50 border-green-200 text-green-600",
  };

  return (
    <div className={`bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden ${hoverBorderColors[columnType]} transition-all`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="min-w-[2.75rem] px-2 h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
            {ticket.tableNumber}
          </div>
          <div>
            <span className="font-black text-xs text-gray-900 uppercase tracking-[0.2em]">
              {t.kitchen.summaryTableLabel.replace("{table}", ticket.tableNumber)}
            </span>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{ticket.orderId.slice(-4)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-white px-2 py-1 rounded-lg border border-gray-100">
          <Clock size={12} />
          {new Date(ticket.timestamp).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Items */}
      <div className="p-5">
        <ul className="space-y-2 mb-5">
          {ticket.items.map(item => (
            <li key={item.orderItemId} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-start justify-between gap-2.5">
                {/* Item info */}
                <div className="flex items-start gap-3 flex-1 min-w-[140px]">
                  <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-900 shrink-0 mt-0.5">
                    {item.quantity}
                  </span>
                  <span className="font-bold text-sm text-gray-800 leading-snug break-words" title={item.name}>
                    {item.name}
                  </span>
                </div>

                {/* Action button per item */}
                <div className="shrink-0 ml-10 sm:ml-0">
                  {columnType === "pending" && (
                    <button
                      onClick={() => handleItemAction(item.orderItemId, "startCooking")}
                      disabled={updateItemStatusMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shrink-0 disabled:opacity-50"
                    >
                      <ChefHat size={12} />
                      {t.kitchen.ticketActionCook}
                    </button>
                  )}

                  {columnType === "cooking" && (
                    <button
                      onClick={() => handleItemAction(item.orderItemId, "doneCooking")}
                      disabled={updateItemStatusMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shrink-0 shadow-md shadow-orange-200/50 disabled:opacity-50"
                    >
                      <Check size={12} strokeWidth={3} />
                      {t.kitchen.ticketActionDone}
                    </button>
                  )}

                  {columnType === "serving" && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-black text-[10px] uppercase tracking-wider shrink-0">
                      <Clock size={12} />
                      {t.kitchen.ticketWaitingService}
                    </span>
                  )}

                  {columnType === "completed" && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0">
                      <Check size={10} strokeWidth={3} />
                      {t.kitchen.ticketActionDone}
                    </span>
                  )}
                </div>
              </div>

              {/* Note */}
              {item.note && (
                <div className={`ml-10 text-[10px] border ${noteColors[columnType]} px-2.5 py-1.5 rounded-xl font-bold italic self-start leading-relaxed`}>
                  {item.note}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Footer — total price */}
        <div className="pt-4 border-t border-dashed border-gray-100">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t.kitchen.ticketTotal}</span>
            <span className="font-black text-gray-900 text-lg">
              {formatPrice(Number(ticket.orderTotalPrice), storeConfig, language)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
