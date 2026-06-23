"use client";

import Image from "next/image";
import { Plus, Flame, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import { getImageUrl } from "@/utils/image";
import { showAlert } from "@/store/dialogStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice as utilsFormatPrice } from "@/utils/currency";

type Product = {
  id: string;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isNew?: boolean;
  isHot?: boolean;
  discountPercent?: number;
  isAvailable?: boolean;
};

export default function ProductCard({ product, viewMode = "list" }: { product: Product, viewMode?: "grid" | "list" }) {
  const { addItem, selectedTable, storeConfig, language } = useCartStore();
  const t = useTranslation();

  const discountPercent = product.discountPercent || 0;
  const hasDiscount = discountPercent > 0;
  const finalPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;

  const handleAddToCart = () => {
    if (product.isAvailable === false) return;
    if (!selectedTable) {
      showAlert(t.productDetail.selectTableWarning);
      return;
    }
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      category: product.category,
      categoryId: product.categoryId,
      description: product.description,
      quantity: 1,
      note: "",
    });
  };

  const formatPrice = (price: number) => {
    return utilsFormatPrice(price, storeConfig, language);
  };

  if (viewMode === "grid") {
    return (
      <motion.div
        layoutId={`product-${product.id}`}
        className={`bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col w-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 h-full ${product.isAvailable === false ? 'opacity-60' : 'hover:shadow-primary/50'}`}
      >
        {/* Badge Section */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
              -{discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Star size={10} fill="currentColor" /> {t.common.labelNew}
            </span>
          )}
          {product.isHot && (
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Flame size={10} fill="currentColor" /> {t.common.labelHot}
            </span>
          )}
        </div>

        {/* Image - Vertical */}
        <div className="aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden relative mb-4">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.isAvailable === false && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-20">
              <span className="bg-gray-900/90 text-white font-black px-4 py-2 rounded-xl text-sm tracking-widest shadow-xl rotate-[-10deg] border border-white/20">
                {t.common.soldOut}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          <h4 className="font-bold text-lg text-gray-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2 mt-2 font-medium h-8">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-black text-primary text-lg sm:text-xl truncate whitespace-nowrap">{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-300 line-through mt-0.5 truncate whitespace-nowrap">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={product.isAvailable === false}
              className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-lg active:scale-90 ${product.isAvailable === false ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed' : 'bg-primary text-white hover:bg-primary shadow-primary'}`}
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // List Mode
  return (
    <motion.div
      layoutId={`product-${product.id}`}
      className={`bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex gap-4 w-full relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${product.isAvailable === false ? 'opacity-60' : 'hover:shadow-orange-50/50'}`}
    >
      {/* Badges for List mode */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {hasDiscount && (
          <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md">-{discountPercent}%</span>
        )}
        {product.isNew && (
          <span className="bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md">{t.common.labelNew}</span>
        )}
        {product.isHot && (
          <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md">{t.common.labelHot}</span>
        )}
      </div>

      {/* Image - Horizontal */}
      <div className="w-24 h-24 sm:w-28 sm:h-32 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative">
        <Image
          src={getImageUrl(product.image)}
          alt={product.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.isAvailable === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-20">
            <span className="bg-gray-900/90 text-white font-black px-2 py-1 rounded-lg text-[10px] tracking-widest shadow-xl border border-white/20">
              {t.common.soldOut}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h4 className="font-bold text-lg text-gray-900 line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h4>
          <p className="text-[13px] text-gray-500 line-clamp-2 mt-1.5 leading-snug font-medium">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between mt-3">
          <div className="flex flex-col">
            <span className="font-black text-primary text-xl leading-none whitespace-nowrap">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-300 line-through mt-1.5 whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.isAvailable === false}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${product.isAvailable === false ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed' : 'bg-primary text-white hover:bg-primary shadow-primary'}`}
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
