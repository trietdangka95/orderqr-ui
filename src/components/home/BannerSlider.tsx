"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@/store/cartStore";
import { getImageUrl } from "@/utils/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface BannerSliderProps {
  banners: MenuItem[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((p) => (p + 1) % banners.length);
      }, 5000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length]);

  if (banners.length === 0) return null;

  const item = banners[current];
  const title = item.promoTitle || item.name;
  const desc = item.promoDescription || null;
  // Only use actual uploaded URL — don't fall back to placeholder
  const rawUrl = (item.bannerUrl && item.bannerUrl.trim()) || (item.image && item.image.trim()) || "";
  const imageUrl = rawUrl ? getImageUrl(rawUrl) : "";
  const hasImg = !!imageUrl && !imgFailed[current];
  const discountedPrice = Math.round(item.price * (1 - (item.discountPercent || 0) / 100));
  const hasDiscount = (item.discountPercent || 0) > 0;

  const go = (dir: 1 | -1) => {
    setCurrent((p) => (p + dir + banners.length) % banners.length);
    resetTimer();
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -50) go(1);
    else if (info.offset.x > 50) go(-1);
  };

  return (
    <div className="space-y-2">
      {/* ── Banner card ── */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gray-100 group select-none"
        style={{ height: "clamp(140px, 36vw, 240px)" }}
      >
        {/* Full-bleed background image */}
        {hasImg && (
          <img
            src={imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed((p) => ({ ...p, [current]: true }))}
          />
        )}

        {/* Overlay: only left half fades to readable — right stays clear */}
        {hasImg && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent pointer-events-none" />
        )}

        {/* Fallback background when no image — warm brand gradient */}
        {!hasImg && (
          <>
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #c2410c 0%, #ea580c 55%, #f59e0b 100%)" }}
            />
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute right-8 bottom-0 w-32 h-32 rounded-full bg-black/10 pointer-events-none" />
          </>
        )}

        {/* ── Slide ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-end pb-5 px-5 sm:px-7 cursor-grab active:cursor-grabbing z-10"
          >
            {/* Content anchored to bottom-left */}
            <div className="flex-1 min-w-0 max-w-[65%] sm:max-w-[55%]">
              {/* Badge */}
              {hasDiscount && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="mb-1.5 inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest"
                >
                  <Sparkles size={8} />
                  -{item.discountPercent}%
                </motion.div>
              )}

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="text-white font-black leading-snug line-clamp-2 mb-1 drop-shadow"
                style={{ fontSize: "clamp(14px, 3.5vw, 22px)" }}
              >
                {title}
              </motion.h2>

              {/* Desc */}
              {desc && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-white/75 text-[11px] sm:text-xs leading-relaxed line-clamp-2 mb-2 font-medium hidden sm:block"
                >
                  {desc}
                </motion.p>
              )}

              {/* Price */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-white font-black drop-shadow" style={{ fontSize: "clamp(15px, 4vw, 24px)" }}>
                  {discountedPrice.toLocaleString("vi-VN")}₫
                </span>
                {hasDiscount && (
                  <span className="text-white/55 line-through font-semibold text-xs">
                    {item.price.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Arrows ── */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 active:scale-90"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 active:scale-90"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* ── Dots ── */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip (only when multiple banners) ── */}
      {banners.length > 1 && (
        <div className="flex gap-2">
          {banners.map((b, i) => {
            const tUrl = getImageUrl(b.bannerUrl || b.image || "");
            const failed = imgFailed[i];
            return (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={`relative flex-shrink-0 w-14 h-10 rounded-xl overflow-hidden transition-all duration-200 ${
                  i === current
                    ? "ring-2 ring-primary ring-offset-1 opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                {tUrl && !failed ? (
                  <img
                    src={tUrl}
                    alt={b.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgFailed((p) => ({ ...p, [i]: true }))}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-[8px] text-gray-500 font-bold text-center px-1 leading-tight">
                      {b.name.slice(0, 8)}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
