"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCreateOrder } from "@/hooks/useOrders";
import { getImageUrl } from "@/utils/image";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart, toggleOrders, selectedTable } = useCartStore();
  const createOrder = useCreateOrder();

  const handleCheckout = () => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn trước khi gọi món!");
      return;
    }

    const orderData = {
      tableNumber: selectedTable,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        note: item.note
      }))
    };

    createOrder.mutate(orderData, {
      onSuccess: () => {
        clearCart();
        toggleCart();
        toggleOrders();
      },
      onError: (error: Error) => {
        alert(error.message || "Không thể gửi đơn hàng. Vui lòng thử lại!");
      }
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity cursor-pointer"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-gray-900">Món đã chọn ({getTotalItems()})</h2>
          </div>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>Chưa có món nào được chọn</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden relative flex-shrink-0">
                  <Image src={getImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 pr-2">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {item.note && (
                    <p className="text-xs text-gray-500 italic mt-0.5 border-l-2 border-gray-200 pl-2">Ghi chú: {item.note}</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary text-sm">{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] pb-safe">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Tổng cộng</span>
              <span className="text-xl font-bold text-primary">{getTotalPrice().toLocaleString("vi-VN")} ₫</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={createOrder.isPending}
              className="w-full bg-primary text-white font-bold text-lg py-3.5 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {createOrder.isPending ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Xác nhận gọi món"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
