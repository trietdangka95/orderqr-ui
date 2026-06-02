"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MenuItem } from "@/store/cartStore";
import Image from "next/image";
import { X, Upload, Save, Loader2 } from "lucide-react";
import { useCreateProduct, useUpdateProduct, useCategories, useUploadImage } from "@/hooks/useProducts";
import { getImageUrl } from "@/utils/image";

interface MenuItemFormProps {
  item?: MenuItem;
  onClose: () => void;
}

export default function MenuItemForm({ item, onClose }: MenuItemFormProps) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadImage();
  const { data: categoriesData = [] } = useCategories();
  const categories = categoriesData.map(c => c.name);

  const [formData, setFormData] = useState({
    name: item?.name || "",
    price: item?.price || 0,
    category: item?.category || (categories[0] || ""),
    image: item?.image || "",
    description: item?.description || "",
    bannerUrl: item?.bannerUrl || "",
    promoTitle: item?.promoTitle || "",
    promoDescription: item?.promoDescription || "",
    discountPercent: item?.discountPercent || 0,
  });

  const [priceInput, setPriceInput] = useState(item?.price?.toString() || "0");
  const [previewError, setPreviewError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage.mutateAsync(file);
      // Backend returns relative path /public/uploads/...
      // We save only the relative path to be environment-independent
      setFormData({ ...formData, image: result.url });
      setPreviewError(false);
    } catch {
      alert("Lỗi khi tải ảnh lên!");
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digits
    const value = e.target.value.replace(/\D/g, "");
    setPriceInput(value);
    setFormData({ ...formData, price: Number(value) });
  };

  const formatPrice = (val: string) => {
    if (!val || val === "0") return "";
    return Number(val).toLocaleString("vi-VN");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find categoryId
    const selectedCategory = categoriesData.find(c => c.name === formData.category);
    const payload = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      image: formData.image,
      categoryId: selectedCategory?.id || 1,
      discountPercent: formData.discountPercent,
      bannerUrl: formData.bannerUrl,
      promoTitle: formData.promoTitle,
      promoDescription: formData.promoDescription,
    };

    if (item?.id) {
      updateProduct.mutate({ id: item.id, data: payload }, {
        onSuccess: () => onClose(),
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {item ? "Sửa món ăn" : "Thêm món mới"}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Thông tin chi tiết món ăn</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Thông tin cơ bản</h3>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Tên món ăn
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-700"
                placeholder="VD: Phở Bò Tái Lăn"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  Giá món ăn (VNĐ)
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formatPrice(priceInput)}
                    onChange={handlePriceChange}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-900"
                    placeholder="Ví dụ: 100.000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  Danh mục
                </label>
                {categories.length === 0 ? (
                  <div className="text-xs font-bold text-red-500 bg-red-50 p-3.5 rounded-2xl border border-red-100 leading-relaxed">
                    ⚠️ Chưa có danh mục nào! Vui lòng đóng hộp thoại này và thêm ít nhất 1 danh mục ở phần "Quản lý Danh mục" phía sau trước khi thêm món ăn.
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-700 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Hình ảnh món ăn
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setPreviewError(false);
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-medium text-gray-600 text-sm"
                    placeholder="Dán link ảnh (URL)..."
                  />
                  <label className="shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadImage.isPending}
                    />
                    {uploadImage.isPending ? (
                      <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-500" />
                    )}
                  </label>
                </div>
                
                {formData.image && (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                    {previewError ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50/60 flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-2xl mb-1">⚠️</span>
                        <p className="text-xs font-black text-red-500 uppercase tracking-wider mb-1">Lỗi hiển thị ảnh</p>
                        <p className="text-[10px] text-gray-400 font-bold leading-normal max-w-[80%]">
                          Không thể hiển thị bản xem trước. Hãy đảm bảo đường dẫn ảnh hoặc kết nối đến máy chủ hoạt động tốt.
                        </p>
                      </div>
                    ) : (
                      <Image 
                        src={getImageUrl(formData.image)} 
                        alt="Preview" 
                        fill
                        unoptimized
                        className="object-cover"
                        onError={() => setPreviewError(true)}
                      />
                    )}
                    <button 
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: "" });
                        setPreviewError(false);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Mô tả ngắn
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all h-24 resize-none font-medium text-gray-600"
                placeholder="Nhập mô tả món ăn..."
              />
            </div>
          </div>

          {/* Promotion & Banner Info */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Khuyến mãi & Banner</h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg uppercase">Tùy chọn</span>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Phần trăm giảm giá (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-bold text-red-600"
                placeholder="VD: 20 (giảm 20%)"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                Banner URL (Dành cho Slide quảng cáo)
              </label>
              <input
                type="text"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium text-gray-600"
                placeholder="https://... (Hình khổ ngang 16:9)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  Tiêu đề Banner
                </label>
                <input
                  type="text"
                  value={formData.promoTitle}
                  onChange={(e) => setFormData({ ...formData, promoTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-bold text-gray-700"
                  placeholder="VD: Giảm giá 20%"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  Mô tả Banner
                </label>
                <input
                  type="text"
                  value={formData.promoDescription}
                  onChange={(e) => setFormData({ ...formData, promoDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium text-gray-600"
                  placeholder="VD: Thứ 2 & Thứ 3"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic font-medium px-2">
              * Banner chỉ hiển thị ngoài trang chủ nếu điền đủ cả 4 thông tin trên.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending || categories.length === 0}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createProduct.isPending || updateProduct.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
