"use client";

import { LayoutGrid, List as ListIcon, Plus } from "lucide-react";

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
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Quản lý Thực đơn</h1>
        <p className="text-gray-500 font-medium italic">Thống kê và cập nhật danh sách {itemCount} món ăn tại quán</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-xl transition-all ${
              viewMode === "grid"
                ? "bg-white shadow-md text-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-xl transition-all ${
              viewMode === "list"
                ? "bg-white shadow-md text-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ListIcon size={20} />
          </button>
        </div>

        <button
          onClick={onAddNew}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-600 shadow-2xl shadow-primary/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
        >
          <Plus size={20} />
          <span>Thêm món mới</span>
        </button>
      </div>
    </header>
  );
}
