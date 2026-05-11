// src/components/kitchen/OrderTicket.tsx
"use client";

import { Order } from "@/store/cartStore";
import { X, Check, ArrowRight } from "lucide-react";

interface OrderTicketProps {
  order: Order;
  onAdvance: () => void;
}

export default function OrderTicket({ order, onAdvance }: OrderTicketProps) {
  return (
    <div className="border border-gray-200 rounded-md p-3 shadow-sm bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-sm">Order #{order.id.slice(-4)}</span>
        <span className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <ul className="space-y-1 mb-2">
        {order.items.map((item) => (
          <li key={item.id} className="text-xs flex justify-between">
            <span>{item.name} x{item.quantity}</span>
            <span className="font-medium">{item.price * item.quantity}₫</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center">
        <span className="font-semibold">{order.totalPrice}₫</span>
        {/* Action buttons based on status */}
        {order.status === "pending" && (
          <button
            onClick={onAdvance}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            title="Xác nhận đơn"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">Xác nhận</span>
          </button>
        )}
        {order.status === "cooking" && (
          <button
            onClick={onAdvance}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            title="Bắt đầu phục vụ"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">Bắt đầu phục vụ</span>
          </button>
        )}
        {order.status === "serving" && (
          <button
            onClick={onAdvance}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            title="Hoàn thành"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Hoàn thành</span>
          </button>
        )}
        {order.status === "completed" && (
          <Check className="w-5 h-5 text-green-500" />
        )}
      </div>
    </div>
  );
}
