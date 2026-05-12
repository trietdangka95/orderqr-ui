"use client";

import Image from "next/image";
import { X, ShoppingCart, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      note: "",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-90"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col md:flex-row h-full">
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto h-[300px] md:h-auto bg-gray-50">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between relative">
              <div className="pr-10 md:pr-12">
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                  {product.name}
                </h2>
                <div className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-bold mb-6">
                  {product.price.toLocaleString("vi-VN")} ₫
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Mô tả món ăn</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description || "Món ăn này hiện chưa có mô tả chi tiết từ nhà hàng. Tuy nhiên, chúng tôi đảm bảo hương vị sẽ làm bạn hài lòng!"}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
                >
                  <Plus size={20} strokeWidth={3} />
                  Thêm vào giỏ hàng
                </button>
                <p className="text-center text-[11px] text-gray-400 font-medium">
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
