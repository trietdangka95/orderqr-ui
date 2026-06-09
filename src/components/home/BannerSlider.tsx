"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@/store/cartStore";
import { getImageUrl } from "@/utils/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface BannerSliderProps {
  banners: MenuItem[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (banners.length === 0) return null;

  const activeItem = banners[currentBanner];

  // Auto fallback for promo Title and Description if not specified
  const displayTitle = activeItem.promoTitle || `Thực đơn Ưu đãi: ${activeItem.name}`;
  const displayDesc = activeItem.promoDescription || `Thưởng thức hương vị tuyệt vời với giá ưu đãi đặc biệt hôm nay!`;
  const imageUrl = getImageUrl(activeItem.bannerUrl || activeItem.image || "");

  const handleNext = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Swipe gesture handler using framer-motion drag offset
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <div className="relative h-60 md:h-72 rounded-[2.5rem] overflow-hidden shadow-xl shadow-orange-950/5 bg-gray-950 border border-white/5 group flex items-center select-none">
      {/* Ambient background blur using active banner image */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src={imageUrl}
          alt=""
          fill
          unoptimized
          className="object-cover blur-3xl opacity-20 scale-125 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950 pointer-events-none select-none"></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10 flex items-center p-6 md:p-10 select-none"
        >
          <div className="relative w-full h-full flex items-center justify-between gap-6 select-none">
            {/* Left Content (Text and price/discount details) */}
            <div className="flex-1 flex flex-col justify-center text-left space-y-2 md:space-y-4 pr-4 pointer-events-none select-none">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] md:text-xs font-black px-3.5 py-1.5 rounded-full w-fit uppercase tracking-widest"
              >
                <Sparkles size={12} className="animate-pulse" />
                Khuyến mãi -{activeItem.discountPercent || 0}%
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white text-xl md:text-3.5xl font-black leading-tight tracking-tight line-clamp-2 drop-shadow-md"
              >
                {displayTitle}
              </motion.h2>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-xs md:text-sm font-medium line-clamp-2 leading-relaxed"
              >
                {displayDesc}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 pt-1 select-none"
              >
                <span className="text-primary text-xl md:text-2xl font-black">
                  {(activeItem.price * (1 - (activeItem.discountPercent || 0) / 100)).toLocaleString("vi-VN")}₫
                </span>
                <span className="text-gray-500 text-xs md:text-sm line-through font-bold">
                  {activeItem.price.toLocaleString("vi-VN")}₫
                </span>
              </motion.div>
            </div>

            {/* Right Content (Bo-góc product food image card) */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 relative rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shrink-0 group-hover:scale-[1.03] transition-transform duration-500 z-10 pointer-events-none select-none">
              <Image
                src={imageUrl}
                alt={activeItem.name}
                fill
                unoptimized
                className="object-cover select-none pointer-events-none"
                sizes="(max-width: 768px) 120px, 200px"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons (Desktop arrows) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 border border-white/10 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md z-20 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 border border-white/10 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md z-20 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicators Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1 transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentBanner ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
