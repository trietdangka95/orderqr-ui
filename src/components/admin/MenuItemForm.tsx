"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MenuItem, useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { X, Upload, Save, Loader2 } from "lucide-react";
import { useCreateProduct, useUpdateProduct, useCategories, useUploadImage } from "@/hooks/useProducts";
import { getImageUrl, compressImage } from "@/utils/image";
import { showAlert } from "@/store/dialogStore";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuItemFormProps {
  item?: MenuItem;
  onClose: () => void;
}

export default function MenuItemForm({ item, onClose }: MenuItemFormProps) {
  const t = useTranslation();
  const { language } = useCartStore();
  
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
    isAvailable: item?.isAvailable ?? true,
  });

  const [priceInput, setPriceInput] = useState(item?.price?.toString() || "0");
  const [discountInput, setDiscountInput] = useState(item?.discountPercent?.toString() || "0");
  const [previewError, setPreviewError] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedFile = await compressImage(file, 1200, 1200, 0.8);
      const result = await uploadImage.mutateAsync(compressedFile);
      setFormData({ ...formData, image: result.url });
      setPreviewError(false);
    } catch {
      showAlert(t.menuAdmin.uploadImageError);
    }
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBannerUploading(true);
    try {
      const compressedFile = await compressImage(file, 1600, 1600, 0.85);
      const result = await uploadImage.mutateAsync(compressedFile);
      setFormData((prev) => ({ ...prev, bannerUrl: result.url }));
    } catch {
      showAlert(t.menuAdmin.uploadBannerError);
    } finally {
      setIsBannerUploading(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPriceInput(value);
    setFormData({ ...formData, price: Number(value) });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "");
    }

    if (value !== "") {
      const num = Number(value);
      if (num > 100) {
        value = "100";
      }
    }

    setDiscountInput(value);
    setFormData({ ...formData, discountPercent: value === "" ? 0 : Number(value) });
  };

  const formatPrice = (val: string) => {
    if (!val || val === "0") return "";
    const locale = language === "vi" ? "vi-VN" : "en-US";
    return Number(val).toLocaleString(locale);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      isAvailable: formData.isAvailable,
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
              {item ? t.menuAdmin.editDish : t.menuAdmin.addDish}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {t.menuAdmin.formSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                {t.menuAdmin.basicInfo}
              </h3>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                {t.menuAdmin.dishName}
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-700"
                placeholder={t.menuAdmin.dishNamePlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  {t.menuAdmin.dishPrice} ({t.menuAdmin.priceCurrency})
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formatPrice(priceInput)}
                    onChange={handlePriceChange}
                    className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-900"
                    placeholder={t.menuAdmin.pricePlaceholder}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  {t.menuAdmin.dishCategory}
                </label>
                {categories.length === 0 ? (
                  <div className="text-xs font-bold text-red-500 bg-red-50 p-3.5 rounded-2xl border border-red-100 leading-relaxed">
                    {t.menuAdmin.noCategoriesWarning}
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-bold text-gray-700 bg-white cursor-pointer"
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
                {t.menuAdmin.dishImage}
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
                    className="flex-1 h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all font-medium text-gray-600 text-sm"
                    placeholder={t.menuAdmin.imageUrlPlaceholder}
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
                        <p className="text-xs font-black text-red-500 uppercase tracking-wider mb-1">
                          {t.menuAdmin.imagePreviewErrorTitle}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold leading-normal max-w-[80%]">
                          {t.menuAdmin.imagePreviewErrorDesc}
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
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                {t.menuAdmin.dishDescription}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all h-24 resize-none font-medium text-gray-600"
                placeholder={t.menuAdmin.descriptionPlaceholder}
              />
            </div>

            {/* Trạng thái kinh doanh */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-700">{t.menuAdmin.dishAvailable}</label>
                <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                  {t.menuAdmin.availableHelp}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formData.isAvailable} 
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-bold text-gray-800 w-16">
                  {formData.isAvailable ? t.menuAdmin.availableStatus : t.common.soldOut}
                </span>
              </label>
            </div>
          </div>

          {/* Promotion & Banner Info */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  {t.menuAdmin.promotionSection}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg uppercase">
                {t.menuAdmin.optionalBadge}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                {t.menuAdmin.dishDiscount}
              </label>
              <input
                type="text"
                value={discountInput}
                onChange={handleDiscountChange}
                className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-bold text-red-600"
                placeholder={t.menuAdmin.discountPlaceholder}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                {t.menuAdmin.promoBannerImage}
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    className="flex-1 h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium text-gray-600 text-sm"
                    placeholder={t.menuAdmin.promoBannerUrlPlaceholder}
                  />
                  <label className="shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleBannerFileChange}
                      disabled={isBannerUploading}
                    />
                    {isBannerUploading ? (
                      <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-500" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  {t.menuAdmin.bannerTitle}
                </label>
                <input
                  type="text"
                  value={formData.promoTitle}
                  onChange={(e) => setFormData({ ...formData, promoTitle: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-bold text-gray-700"
                  placeholder={t.menuAdmin.autoFillPlaceholder}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  {t.menuAdmin.bannerDescription}
                </label>
                <input
                  type="text"
                  value={formData.promoDescription}
                  onChange={(e) => setFormData({ ...formData, promoDescription: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all font-medium text-gray-600"
                  placeholder={t.menuAdmin.autoFillPlaceholder}
                />
              </div>
            </div>

            {/* Live Preview of Banner Card */}
            {formData.discountPercent > 0 && (
              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {t.menuAdmin.bannerPreviewLabel}
                </label>
                <div className="relative h-36 rounded-2xl overflow-hidden shadow-lg bg-gray-950 border border-white/5 flex items-center p-4 select-none">
                  {/* Ambient background blur using active image */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <Image
                      src={getImageUrl(formData.bannerUrl || formData.image || "")}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover blur-2xl opacity-20 scale-125 select-none pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950"></div>
                  </div>

                  <div className="relative z-10 w-full h-full flex items-center justify-between gap-4">
                    {/* Left text */}
                    <div className="flex-1 flex flex-col justify-center text-left space-y-1 pr-2">
                      <div className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full w-fit uppercase tracking-wider">
                        {t.menuAdmin.promoBadge} -{formData.discountPercent}%
                      </div>
                      <h4 className="text-white text-sm font-black line-clamp-1">
                        {formData.promoTitle || t.menuAdmin.promoTitleFallback.replace("{name}", formData.name || t.menuAdmin.dishNameFallback)}
                      </h4>
                      <p className="text-gray-400 text-[10px] font-medium line-clamp-1">
                        {formData.promoDescription || t.menuAdmin.promoDescFallback}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-primary text-xs font-black">
                          {(formData.price * (1 - formData.discountPercent / 100)).toLocaleString(language === "vi" ? "vi-VN" : "en-US")}₫
                        </span>
                        <span className="text-gray-500 text-[9px] line-through font-bold">
                          {formData.price.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}₫
                        </span>
                      </div>
                    </div>

                    {/* Right Image */}
                    <div className="w-16 h-16 relative rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <Image
                        src={getImageUrl(formData.bannerUrl || formData.image || "")}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[10px] text-gray-400 italic font-medium px-2">
              {t.menuAdmin.bannerHelpText}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending || categories.length === 0}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary shadow-lg shadow-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {createProduct.isPending || updateProduct.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  {t.menuAdmin.saveDish}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
