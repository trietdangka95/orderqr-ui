"use client";

import { useState } from "react";
import { useCartStore, MenuItem } from "@/store/cartStore";
import MenuItemCard from "@/components/admin/MenuItemRow";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { Plus, Search, ChevronLeft, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminMenuPage() {
  const { adminMenu } = useCartStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filteredMenu = adminMenu.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 px-4">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-all border border-gray-100"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Thực đơn</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{filteredMenu.length} món ăn</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-orange-500" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-orange-500" : "text-gray-400 hover:text-gray-600"}`}
              >
                <ListIcon size={20} />
              </button>
            </div>

            <button
              onClick={handleAddNew}
              className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black shadow-xl shadow-gray-200 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Thêm món</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] focus:border-orange-500 outline-none transition-all shadow-xl shadow-gray-200/50 text-gray-700 font-medium"
            />
          </div>
        </div>

        {/* Content */}
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
        }>
          <AnimatePresence mode="popLayout">
            {filteredMenu.length > 0 ? (
              filteredMenu.map((item) => (
                <MenuItemCard key={item.id} item={item} onEdit={handleEdit} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="opacity-20" />
                </div>
                <p className="text-lg font-bold italic">Không tìm thấy món ăn nào</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-orange-500 font-bold hover:underline"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <MenuItemForm
            item={editingItem}
            onClose={() => setIsFormOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
