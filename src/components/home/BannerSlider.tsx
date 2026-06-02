"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@/store/cartStore";
import { getImageUrl } from "@/utils/image";

interface BannerSliderProps {
  banners: MenuItem[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-100">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200"
          alt="Default Banner"
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
          <h2 className="text-white text-3xl md:text-4xl font-black mb-2 tracking-tight">
            Chào mừng đến với HOMI 🍜
          </h2>
          <p className="text-orange-200 font-medium">Hương vị truyền thống, trải nghiệm hiện đại</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-56 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-100 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          <Image
            src={getImageUrl(banners[currentBanner].bannerUrl)}
            alt={banners[currentBanner].promoTitle || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block bg-red-600 text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full mb-4 shadow-xl uppercase tracking-widest">
                Khuyến mãi đặc biệt
              </span>
              <h2 className="text-white text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-lg">
                {banners[currentBanner].promoTitle}
              </h2>
              <p className="text-orange-200 text-sm md:text-xl font-medium drop-shadow">
                {banners[currentBanner].promoDescription}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Banner Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentBanner ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
