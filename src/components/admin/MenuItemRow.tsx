"use client";

import { MenuItem, useCartStore } from "@/store/cartStore";
import { Edit2, Trash2, Tag, Info } from "lucide-react";
import { motion } from "framer-motion";

interface MenuItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
}

export default function MenuItemRow({ item, onEdit }: MenuItemRowProps) {
  const { removeMenuItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className="flex gap-4">
        {/* Image Section */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-50">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-orange-500 transition-colors">
                {item.name}
              </h3>
              <div className="text-lg font-black text-orange-600">
                {formatPrice(item.price)}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Tag size={12} />
                {item.category}
              </div>
              {item.description && (
                <div className="flex items-center gap-1 text-gray-400 text-[11px] font-medium">
                  <Info size={12} />
                  <span className="line-clamp-1">{item.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
              <Edit2 size={14} />
              Sửa
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Bạn có chắc chắn muốn xóa món "${item.name}"?`)) {
                  removeMenuItem(item.id);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95"
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10 scale-150"></div>
    </motion.div>
  );
}
