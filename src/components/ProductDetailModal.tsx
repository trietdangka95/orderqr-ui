"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/utils/image";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  categoryId: number;
  isAvailable?: boolean;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addItem, selectedTable } = useCartStore();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNote("");
    }
  }, [isOpen]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.isAvailable === false) return;
    if (!selectedTable) {
      alert("Vui lòng chọn bàn/nhập mã bàn trước khi chọn món!");
      return;
    }
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      categoryId: product.categoryId,
      description: product.description,
      quantity: 1,
      note,
    });
    onClose();
  };

  const presets = ["Không hành", "Ít cay", "Cay nhiều", "Nhiều đá", "Ít ngọt"];

  const togglePreset = (preset: string) => {
    setNote(prev => {
      const tags = prev.split(",").map(t => t.trim()).filter(t => t);
      if (tags.includes(preset)) {
        return tags.filter(t => t !== preset).join(", ");
      } else {
        return [...tags, preset].join(", ");
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-md hover:bg-white transition-all active:scale-90"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col md:flex-row min-h-0">
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto h-[220px] md:h-auto bg-gray-50">
              <Image
                src={getImageUrl(product.image)}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between relative">
              <div className="pr-6 md:pr-8">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <div className="inline-block px-3 py-1 bg-primary-soft text-primary rounded-full text-xs md:text-sm font-bold">
                    {product.price.toLocaleString("vi-VN")} ₫
                  </div>
                  {product.isAvailable === false && (
                    <div className="inline-block px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-full text-xs font-black uppercase tracking-wider">
                      Hết món
                    </div>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mô tả món ăn</h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {product.description || "Món ăn này hiện chưa có mô tả chi tiết từ nhà hàng. Tuy nhiên, chúng tôi đảm bảo hương vị sẽ làm bạn hài lòng!"}
                  </p>
                </div>
                
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ghi chú nhanh</h4>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {presets.map((preset) => {
                      const tags = note.split(",").map(t => t.trim());
                      const isSelected = tags.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => togglePreset(preset)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] md:text-xs font-black transition-all border ${
                            isSelected
                              ? "bg-primary border-primary text-white shadow-sm"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                  
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ghi chú tự nhập</h4>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ít cay, không hành, nhiều đá..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
                {product.isAvailable === false ? (
                  <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-black flex items-center justify-center gap-2 text-xs md:text-sm border border-gray-200">
                    <span className="text-lg">😔</span>
                    Tạm thời hết món — Vui lòng chọn món khác
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary hover:bg-primary transition-all active:scale-95 text-xs md:text-sm"
                  >
                    <Plus size={16} strokeWidth={3} />
                    Thêm vào giỏ hàng
                  </button>
                )}
                <p className="text-center text-[10px] text-gray-400 font-medium">
                  Click ra ngoài để quay lại Menu
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
