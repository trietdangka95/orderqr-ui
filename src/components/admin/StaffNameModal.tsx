"use client";

import { useState, useEffect } from "react";
import { X, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "@/hooks/useTranslation";

interface StaffNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose?: boolean;
}

export default function StaffNameModal({ isOpen, onClose, canClose = true }: StaffNameModalProps) {
  const t = useTranslation();
  const { activeStaffName, setActiveStaffName } = useCartStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(activeStaffName || "");
      setError("");
    }
  }, [isOpen, activeStaffName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.staffNameModal.staffNameRequired);
      return;
    }
    if (trimmedName.length < 2) {
      setError(t.staffNameModal.staffNameMinLength);
      return;
    }
    setActiveStaffName(trimmedName);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with elegant glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClose ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 sm:p-10"
          >
            {/* Elegant gradient top strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500" />

            {/* Close Button - only show if canClose is true */}
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 w-9 h-9 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            )}

            {/* Content */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 bg-orange-50 text-primary rounded-2xl flex items-center justify-center mb-6 border border-orange-100/50 shadow-inner">
                <User size={32} strokeWidth={2.5} />
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                {activeStaffName ? t.staffNameModal.editStaffName : t.staffNameModal.confirmStaffName}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[280px]">
                {t.staffNameModal.staffNameDesc}
              </p>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={t.staffNameModal.placeholder}
                    autoFocus
                    className={`w-full px-5 py-4 bg-gray-50 border ${
                      error ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/20 focus:border-primary"
                    } rounded-2xl text-gray-800 placeholder-gray-400 text-base font-bold focus:outline-none focus:ring-4 transition-all`}
                  />
                  {error && (
                    <p className="text-red-500 text-xs font-bold text-left mt-2 ml-1">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  {canClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 font-black rounded-2xl transition-all text-sm uppercase tracking-wider cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t.common.confirm}</span>
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
