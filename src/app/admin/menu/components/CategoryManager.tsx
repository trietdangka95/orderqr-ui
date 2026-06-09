"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { useCreateCategory, useDeleteCategory } from "@/hooks/useProducts";
import { Category } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryManagerProps {
  categories: Category[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate(newCategoryName.trim(), {
        onSuccess: () => {
          setNewCategoryName("");
        },
        onError: (err: any) => {
          alert("Lỗi khi thêm danh mục: " + (err.message || "Lỗi không xác định"));
        }
      });
    }
  };

  const handleRemove = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.")) {
      deleteCategoryMutation.mutate(id, {
        onError: (err: any) => {
          alert("Lỗi khi xóa danh mục: " + (err.message || "Lỗi không xác định"));
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">
          Quản lý Danh mục
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <AnimatePresence mode="popLayout">
          {categories.map((cat) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={cat.id}
              className="group flex items-center gap-2 bg-gray-50 border border-gray-100 pl-4 pr-2 py-2 rounded-xl hover:bg-white hover:shadow-md transition-all"
            >
              <span className="text-sm font-bold text-gray-700">{cat.name}</span>
              <button
                onClick={() => handleRemove(cat.id)}
                disabled={deleteCategoryMutation.isPending}
                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Nhập tên danh mục mới..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-gray-700"
        />
        <button
          type="submit"
          disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary shadow-lg shadow-primary transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {createCategoryMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          <span>Thêm nhanh</span>
        </button>
      </form>
    </div>
  );
}
