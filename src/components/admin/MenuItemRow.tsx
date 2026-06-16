"use client";

import { MenuItem } from "@/store/cartStore";
import { Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDeleteProduct, useUpdateProduct } from "@/hooks/useProducts";
import Image from "next/image";
import { getImageUrl } from "@/utils/image";

interface MenuItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  viewMode?: "grid" | "list";
}

interface ActionButtonsProps {
  item: MenuItem;
  isGrid?: boolean;
  onEdit: (item: MenuItem) => void;
  onToggleAvailability: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ActionButtons = ({ item, isGrid, onEdit, onToggleAvailability, onDelete }: ActionButtonsProps) => (
  <div className={`flex items-center gap-2 mt-4 flex-wrap ${isGrid ? "justify-start" : "justify-end"}`}>
    <button
      onClick={onToggleAvailability}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${item.isAvailable
        ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
    >
      <span className={`w-2 h-2 rounded-full ${item.isAvailable ? "bg-green-500" : "bg-gray-400"}`}></span>
      {item.isAvailable ? "Còn món" : "Hết món"}
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit(item);
      }}
      className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
    >
      <Edit2 size={14} />
      Sửa
    </button>
    <button
      onClick={onDelete}
      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95"
    >
      <Trash2 size={14} />
      Xóa
    </button>
  </div>
);

export default function MenuItemRow({ item, onEdit, viewMode = "list" }: MenuItemRowProps) {
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleToggleAvailability = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateProduct.mutate({ id: item.id, data: { isAvailable: !item.isAvailable } });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa món "${item.name}"?`)) {
      deleteProduct.mutate(item.id);
    }
  };

  const actionProps = {
    item,
    onEdit,
    onToggleAvailability: handleToggleAvailability,
    onDelete: handleDelete
  };

  if (viewMode === "grid") {
    return (
      <motion.div
        layoutId={`menu-item-${item.id}`}
        className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-50/50 transition-all group relative overflow-hidden flex flex-col h-full"
      >
        <motion.div
          layoutId={`image-${item.id}`}
          className="rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-50 relative w-full aspect-video mb-4"
        >
          <Image
            src={getImageUrl(item.image)}
            alt={item.name}
            fill
            unoptimized
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
          <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
            <span className="text-[10px] font-black text-primary uppercase tracking-wider">{item.category}</span>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <motion.h3 layoutId={`name-${item.id}`} className="font-bold text-gray-900 text-sm sm:text-lg leading-tight group-hover:text-orange-500 transition-colors">
              {item.name}
            </motion.h3>
            <motion.div layoutId={`price-${item.id}`} className="font-black text-primary text-lg sm:text-xl mt-1">
              {formatPrice(item.price)}
            </motion.div>

            {item.description && (
              <p className="text-gray-400 text-[11px] font-medium mt-2 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <ActionButtons {...actionProps} isGrid />
        </div>
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-soft rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10 scale-150"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`menu-item-${item.id}`}
      className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-50/50 transition-all group relative overflow-hidden flex flex-row gap-4"
    >
      <motion.div
        layoutId={`image-${item.id}`}
        className="rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-50 relative w-24 h-24"
      >
        <Image
          src={getImageUrl(item.image)}
          alt={item.name}
          fill
          unoptimized
          className="object-cover transition-transform group-hover:scale-110 duration-500"
        />
        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
          <span className="text-[8px] font-black text-primary uppercase tracking-wider">{item.category}</span>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between">
            <motion.h3 layoutId={`name-${item.id}`} className="font-bold text-gray-900 text-sm sm:text-lg leading-tight group-hover:text-orange-500 transition-colors">
              {item.name}
            </motion.h3>
            <motion.div layoutId={`price-${item.id}`} className="font-black text-primary text-sm sm:text-lg">
              {formatPrice(item.price)}
            </motion.div>
          </div>
          {item.description && (
            <p className="text-gray-400 text-[11px] font-medium mt-1 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>
        <ActionButtons {...actionProps} />
      </div>
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-soft rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10 scale-150"></div>
    </motion.div>
  );
}
