"use client";

import { useState } from "react";
import { showConfirm, showAlert } from "@/store/dialogStore";
import { X, Plus, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useCreateCategory, useDeleteCategory } from "@/hooks/useProducts";
import { Category } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { translateApiError } from "@/utils/apiError";

interface CategoryManagerProps {
  categories: Category[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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
          showAlert(t.menuAdmin.errorAddCategory.replace("{error}", translateApiError(err, t, t.apiErrors.default)));
        }
      });
    }
  };

  const handleRemove = async (id: number) => {
    if (await showConfirm(t.menuAdmin.deleteCategoryConfirm)) {
      deleteCategoryMutation.mutate(id, {
        onError: (err: any) => {
          showAlert(t.menuAdmin.errorDeleteCategory.replace("{error}", translateApiError(err, t, t.apiErrors.default)));
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-xl shadow-gray-200/50 border border-gray-100 mb-4 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between outline-none cursor-pointer gap-2"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-left">
          <div className="w-1.5 h-6 bg-primary rounded-full shrink-0"></div>
          <h2 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wider flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            <span>{t.menuAdmin.manageCategories}</span>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 normal-case bg-gray-50 px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0">
              {t.menuAdmin.categoriesCount.replace("{count}", String(categories.length))}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black text-primary uppercase tracking-wider sm:tracking-widest hover:text-orange-600 transition-colors shrink-0">
          <span>{isOpen ? t.menuAdmin.collapse : t.menuAdmin.edit}</span>
          {isOpen ? <ChevronUp size={14} className="sm:w-4 sm:h-4" /> : <ChevronDown size={14} className="sm:w-4 sm:h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 pb-4 border-t border-gray-50 space-y-6"
          >
            <div className="flex flex-wrap gap-3">
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
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-center">
              <input
                type="text"
                placeholder={t.menuAdmin.newCategoryPlaceholder}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3.5 py-3 sm:px-4 sm:py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-orange-500 outline-none transition-all font-bold text-xs text-gray-700"
              />
              <button
                type="submit"
                disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                className="px-4 py-3 sm:px-5 sm:py-4 bg-primary text-white rounded-xl font-black uppercase tracking-wider sm:tracking-widest text-[10px] hover:bg-primary shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {createCategoryMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Plus size={12} strokeWidth={3} />
                )}
                <span>{t.menuAdmin.quickAdd}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
