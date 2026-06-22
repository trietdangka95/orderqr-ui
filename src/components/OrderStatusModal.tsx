"use client";

import { CheckCircle2, Clock, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "@/hooks/useTranslation";

type OrderStatus = "pending" | "cooking" | "completed";

export default function OrderStatusModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>("pending");
  const t = useTranslation();
  const selectedTable = useCartStore((state) => state.selectedTable);
  const displayTable = selectedTable || "05";

  // Reset status during render phase when opening to avoid cascading renders in useEffect
  const [lastIsOpen, setLastIsOpen] = useState(isOpen);
  if (isOpen && !lastIsOpen) {
    setStatus("pending");
    setLastIsOpen(true);
  } else if (!isOpen && lastIsOpen) {
    setLastIsOpen(false);
  }

  // Giả lập trạng thái đơn hàng thay đổi theo thời gian
  useEffect(() => {
    if (isOpen) {
      const cookingTimer = setTimeout(() => setStatus("cooking"), 5000);
      const completeTimer = setTimeout(() => setStatus("completed"), 12000);

      return () => {
        clearTimeout(cookingTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm" />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-6 text-center relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
              {status === "pending" && <Clock className="w-10 h-10 text-orange-500 animate-pulse" />}
              {status === "cooking" && <MapPin className="w-10 h-10 text-orange-500 animate-bounce" />}
              {status === "completed" && <CheckCircle2 className="w-10 h-10 text-green-500" />}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "pending" && t.orderStatusModal.pendingTitle}
              {status === "cooking" && t.orderStatusModal.cookingTitle}
              {status === "completed" && t.orderStatusModal.completedTitle}
            </h2>
            
            <p className="text-gray-500 text-sm mb-6">
              {status === "pending" && t.orderStatusModal.pendingDesc.replace("{table}", displayTable)}
              {status === "cooking" && t.orderStatusModal.cookingDesc.replace("{table}", displayTable)}
              {status === "completed" && t.orderStatusModal.completedDesc.replace("{table}", displayTable)}
            </p>

            {/* Progress bar */}
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{
                  width: status === "pending" ? "33%" : status === "cooking" ? "66%" : "100%"
                }}
              />
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {status === "completed" ? t.orderStatusModal.close : t.orderStatusModal.hide}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
