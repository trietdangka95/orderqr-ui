"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDialogStore } from "@/store/dialogStore";
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function GlobalDialog() {
  const t = useTranslation();
  const {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    close,
  } = useDialogStore();

  const displayTitle = 
    title === "Xác nhận" 
      ? t.common.confirm 
      : (title === "Thông báo" ? t.common.notice : title);
  
  const displayConfirmText = 
    confirmText === "Xác nhận" 
      ? t.common.confirm 
      : confirmText;
      
  const displayCancelText = 
    cancelText === "Hủy" 
      ? t.common.cancel 
      : cancelText;

  // Listen to Escape & Enter keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        close(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Determine icon, colors and layout based on type & content keywords
  const getIcon = () => {
    const lowerMessage = message.toLowerCase();
    const lowerTitle = title.toLowerCase();
    
    const isError =
      lowerMessage.includes("lỗi") ||
      lowerMessage.includes("thất bại") ||
      lowerMessage.includes("không thể") ||
      lowerMessage.includes("error") ||
      lowerMessage.includes("cảnh báo") ||
      lowerTitle.includes("lỗi") ||
      lowerTitle.includes("cảnh báo");

    const isSuccess =
      lowerMessage.includes("thành công") ||
      lowerMessage.includes("đã sao chép") ||
      lowerMessage.includes("ok") ||
      lowerMessage.includes("xong") ||
      lowerTitle.includes("thành công");

    if (type === "confirm") {
      return (
        <div className={`w-14 h-14 ${isError ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
          {isError ? <AlertTriangle size={28} /> : <HelpCircle size={28} />}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <AlertTriangle size={28} />
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 size={28} />
        </div>
      );
    }

    return (
      <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <Info size={28} />
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(false)}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col items-center text-center border border-gray-100"
          >
            {/* Close Button on Top Right */}
            <button
              onClick={() => close(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            {getIcon()}

            {/* Title */}
            <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">
              {displayTitle}
            </h3>

            {/* Message */}
            <p className="text-gray-500 text-sm font-semibold leading-relaxed mb-6 whitespace-pre-line">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex w-full gap-3">
              {type === "confirm" && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-100 font-bold rounded-xl transition-all active:scale-[0.97] text-sm"
                >
                  {displayCancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => close(true)}
                className={`flex-1 py-3 px-4 ${
                  message.toLowerCase().includes("xóa") || title.toLowerCase().includes("cảnh báo")
                    ? "bg-red-500 hover:bg-red-600 shadow-red-100"
                    : "bg-primary hover:bg-[#E06C00] shadow-orange-100"
                } text-white font-black rounded-xl shadow-md transition-all active:scale-[0.97] text-sm`}
              >
                {displayConfirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
