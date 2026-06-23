"use client";

import { LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuHeaderProps {
  itemCount: number;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onAddNew: () => void;
}

export default function MenuHeader({
  itemCount,
  viewMode,
  setViewMode,
  onAddNew,
}: MenuHeaderProps) {
  const t = useTranslation();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{t.menuAdmin.title}</h1>
        <p className="text-gray-500 font-medium italic">{t.menuAdmin.subtitle.replace("{count}", String(itemCount))}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/30"
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              viewMode === "list"
                ? "bg-white shadow-sm text-primary"
                : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/30"
            }`}
          >
            <ListIcon size={20} />
          </button>
        </div>

        <button
          onClick={onAddNew}
          className="bg-primary text-white p-4 sm:px-8 sm:py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary shadow-2xl shadow-primary/20 transition-all active:scale-95 text-sm uppercase tracking-widest cursor-pointer"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">{t.menuAdmin.addDish}</span>
        </button>
      </div>
    </header>
  );
}
