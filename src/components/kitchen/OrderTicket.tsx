// src/components/kitchen/OrderTicket.tsx
"use client";

import { Order } from "@/store/cartStore";
import { Check, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { useUpdateOrderItemStatus } from "@/hooks/useOrders";

interface OrderTicketProps {
  order: Order;
  onAdvance: () => void;
}

export default function OrderTicket({ order, onAdvance }: OrderTicketProps) {
  const updateItemStatusMutation = useUpdateOrderItemStatus();

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden group hover:border-primary/30 transition-all">
      <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
            {order.tableNumber}
          </div>
          <div>
            <span className="font-black text-xs text-gray-900 uppercase tracking-[0.2em]">Bàn {order.tableNumber}</span>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{order.id.slice(-4)}</div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-white px-2 py-1 rounded-lg border border-gray-100">
            <Clock size={12} />
            {new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="p-5">
        <ul className="space-y-3 mb-6">
          {order.items.map((item: any) => (
            <li key={item.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    disabled={updateItemStatusMutation.isPending}
                    onClick={() => {
                      updateItemStatusMutation.mutate({
                        orderId: order.id,
                        orderItemId: item.orderItemId,
                        isCooked: !item.isCooked,
                      });
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      item.isCooked
                        ? "bg-primary border-primary text-white"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {item.isCooked ? <Check size={14} strokeWidth={3} /> : null}
                  </button>
                  <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-900 shrink-0">
                    {item.quantity}
                  </span>
                  <span className={`font-bold text-sm text-gray-700 leading-tight ${item.isCooked ? "line-through text-gray-400" : ""}`}>
                    {item.name}
                  </span>
                </div>
              </div>
              {item.note && (
                <div className="ml-16 text-[10px] bg-primary-soft/70 border border-primary/60 text-primary px-2.5 py-1.5 rounded-xl font-bold italic self-start leading-relaxed">
                  {item.note}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
          <div className="flex flex-col">
             <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Tổng cộng</span>
             <span className="font-black text-gray-900 text-lg">{Number(order.totalPrice).toLocaleString("vi-VN")}₫</span>
          </div>

          {/* Action buttons */}
          {order.status === "pending" && (
            <button
              onClick={onAdvance}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl hover:bg-primary transition-all active:scale-95 shadow-lg shadow-primary"
            >
              <ArrowRight size={16} strokeWidth={3} />
              <span className="font-black text-[10px] uppercase tracking-widest">Chế biến</span>
            </button>
          )}
          {order.status === "cooking" && (
            <button
              onClick={onAdvance}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              <Check size={16} strokeWidth={3} />
              <span className="font-black text-[10px] uppercase tracking-widest">Xong</span>
            </button>
          )}
          {order.status === "serving" && (
            <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
              <Clock size={14} className="animate-pulse" />
              Giao món
            </div>
          )}
          {order.status === "completed" && (
            <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase bg-green-50 px-4 py-2 rounded-xl border border-green-100">
              <Check size={14} />
              Hoàn tất
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
