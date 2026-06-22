"use client";

import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

interface LanguageSelectorProps {
  light?: boolean;
}

export default function LanguageSelector({ light = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useCartStore();

  return (
    <div 
      className={`inline-flex p-1 rounded-full border backdrop-blur-md transition-all shrink-0 ${
        light 
          ? "bg-white/80 border-gray-200/50 shadow-sm" 
          : "bg-gray-900/50 border-white/10 shadow-lg shadow-black/25"
      }`}
    >
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        className="relative px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors select-none cursor-pointer focus:outline-none"
        style={{ 
          color: language === "vi" 
            ? "#ffffff" 
            : (light ? "#4b5563" : "#9ca3af") 
        }}
      >
        {language === "vi" && (
          <motion.div
            layoutId="activeLang"
            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md shadow-orange-500/20"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1">
          <span>🇻🇳</span> VI
        </span>
      </button>
      
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className="relative px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-colors select-none cursor-pointer focus:outline-none"
        style={{ 
          color: language === "en" 
            ? "#ffffff" 
            : (light ? "#4b5563" : "#9ca3af") 
        }}
      >
        {language === "en" && (
          <motion.div
            layoutId="activeLang"
            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-md shadow-orange-500/20"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1">
          <span>🇺🇸</span> EN
        </span>
      </button>
    </div>
  );
}
