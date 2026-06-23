"use client";

import { useState } from "react";
import { MenuItem } from "@/store/cartStore";
import MenuItemCard from "@/components/admin/MenuItemRow";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

import MenuHeader from "./components/MenuHeader";
import CategoryManager from "./components/CategoryManager";

export default function AdminMenuPage() {
  const t = useTranslation();
  const { data: products = [] } = useProducts();
  const { data: categoriesData = [] } = useCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const menuItems: MenuItem[] = products.map(p => ({
    ...p,
    image: p.image || '',
    description: p.description || '',
  }));

  const filteredMenu = menuItems.filter((item) =>
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
    <div className="max-w-7xl mx-auto">
      <MenuHeader
        itemCount={filteredMenu.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddNew={handleAddNew}
      />

      <main className="pt-0 pb-6">
        <CategoryManager
          categories={categoriesData}
        />

        {/* Search & Filters */}
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={t.menuAdmin.searchPlaceholder}
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
                <MenuItemCard key={item.id} item={item} onEdit={handleEdit} viewMode={viewMode} />
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
                <p className="text-lg font-bold italic">{t.menuAdmin.emptyTitle}</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-orange-500 font-bold hover:underline cursor-pointer"
                >
                  {t.menuAdmin.emptyClearFilter}
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
