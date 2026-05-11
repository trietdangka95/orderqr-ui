"use client";

import { useCartStore } from "@/store/cartStore";
import { X, ClipboardList, CheckCircle2, Clock, ChefHat } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function OrdersDrawer() {
  const { orders, isOrdersOpen, toggleOrders, updateOrderStatus } = useCartStore();



  if (!isOrdersOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={toggleOrders}
      />
      
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-gray-50 z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            <h2 className="font-bold text-lg text-gray-900">Đơn đã gọi</h2>
          </div>
          <button onClick={toggleOrders} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ClipboardList className="w-16 h-16 opacity-20" />
              <p>Bàn chưa gọi món nào</p>
            </div>
          ) : (
            orders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-orange-50/50 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-sm">Đợt {orders.length - index}</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Status Timeline */}
                <div className="px-6 py-5 border-b border-gray-50">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
                    
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full -z-10 transition-all duration-1000 ${
                      order.status === "pending" ? "w-[10%] bg-orange-200" :
                      order.status === "cooking" ? "w-[50%] bg-orange-400" :
                      "w-full bg-green-500"
                    }`}></div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        order.status === "pending" ? "bg-white border-2 border-orange-400 text-orange-500 animate-pulse" : "bg-orange-400 text-white"
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${order.status === "pending" ? "text-orange-600" : "text-gray-400"}`}>Xác nhận</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                        order.status === "pending" ? "bg-white border-2 border-gray-200 text-gray-300" : 
                        order.status === "cooking" ? "bg-white border-2 border-orange-500 text-orange-500 animate-pulse" : 
                        "bg-orange-500 text-white"
                      }`}>
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${order.status === "cooking" ? "text-orange-600" : "text-gray-400"}`}>Đang làm</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                        order.status === "serving" ? "bg-green-500 text-white animate-bounce" : "bg-white border-2 border-gray-200 text-gray-300"
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold ${order.status === "serving" ? "text-green-600" : "text-gray-400"}`}>Đang lên</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden relative flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-sm text-gray-900 leading-tight pr-4">{item.name}</h4>
                          <span className="font-bold text-sm">x{item.quantity}</span>
                        </div>
                        {item.note && (
                          <p className="text-xs text-gray-500 italic mt-0.5">Note: {item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">Tổng cộng đợt này</span>
                  <span className="font-bold text-gray-900">{order.totalPrice.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
