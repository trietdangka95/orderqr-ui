import { useState, useEffect } from "react";
import { Plus, Eye, EyeOff, Upload, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Store as StoreData, superAdminApi } from "@/api/superadmin";
import { showAlert } from "@/store/dialogStore";
import { getImageUrl, compressImage } from "@/utils/image";

export const THEME_PALETTES = [
  { name: "Hỏa - Cam Tiêu Chuẩn", color: "#f97316", bgClass: "bg-primary", element: "Hỏa" },
  { name: "Hỏa - Đỏ Nồng Nhiệt", color: "#dc2626", bgClass: "bg-red-600", element: "Hỏa" },
  { name: "Kim - Vàng Hoàng Kim", color: "#d4af37", bgClass: "bg-[#d4af37]", element: "Kim" },
  { name: "Mộc - Xanh Lá Mạ", color: "#22c55e", bgClass: "bg-green-500", element: "Mộc" },
  { name: "Mộc - Xanh Đại Ngàn", color: "#0f766e", bgClass: "bg-teal-700", element: "Mộc" },
  { name: "Thủy - Xanh Đại Dương", color: "#1d4ed8", bgClass: "bg-blue-700", element: "Thủy" },
  { name: "Thủy - Xanh Lam Ngọc", color: "#06b6d4", bgClass: "bg-cyan-500", element: "Thủy" },
  { name: "Thổ - Nâu Đất", color: "#78350f", bgClass: "bg-amber-900", element: "Thổ" },
  { name: "Thổ - Vàng Đất", color: "#ca8a04", bgClass: "bg-yellow-600", element: "Thổ" },
  { name: "Kim - Xám Bạc", color: "#94a3b8", bgClass: "bg-slate-400", element: "Kim" },
];

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingStoreId: string | null;
  currentEditingStore: StoreData | null;
  initialData: {
    name: string;
    slug: string;
    adminUsername: string;
    adminPassword: string;
    themeColor: string;
    currency: string;
    logo: string | null;
    subscriptionPlan: "FREE" | "PREMIUM";
    subscriptionStatus: string;
    subscriptionStart: string;
    subscriptionEnd: string;
    subscriptionPrice: number;
    subscriptionNotes: string;
    description?: string;
  };
  isPending: boolean;
}

export function StoreFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingStoreId,
  currentEditingStore,
  initialData,
  isPending,
}: StoreFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [isUploading, setIsUploading] = useState(false);

  // Sync state with prop updates when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setShowPassword(false);
    }
  }, [isOpen, initialData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedFile = await compressImage(file, 800, 800, 0.8);
      const res = await superAdminApi.uploadLogo(compressedFile);
      setFormData((prev) => ({ ...prev, logo: res.url }));
    } catch (err: any) {
      showAlert("Lỗi khi tải lên logo: " + (err.message || "Không xác định"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-7 md:p-8 max-h-[95vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{editingStoreId ? "Cập Nhật Cửa Hàng" : "Thêm Cửa Hàng Mới"}</h2>
                <p className="text-gray-400 text-[9px] font-black uppercase tracking-wider mt-0.5">
                  {editingStoreId ? "Chỉnh sửa thông tin & tài khoản admin" : "Khởi tạo thông tin cửa hàng & tài khoản"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5">
                {/* Logo Upload Section */}
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative shrink-0">
                    {formData.logo ? (
                      <img src={getImageUrl(formData.logo)} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="text-gray-400" size={24} />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Logo cửa hàng</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Store Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                    placeholder="e.g. Quán Ăn Việt"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Mô tả quán</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none h-20 resize-none"
                    placeholder="e.g. Chào mừng quý khách đến với cửa hàng!"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Subdomain Slug</label>
                  <div className="flex items-center gap-2">
                    <input
                      required
                      disabled={!!editingStoreId}
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                      className="flex-1 h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 font-mono text-sm disabled:opacity-50 outline-none"
                      placeholder="e.g. quan-an-viet"
                    />
                    <span className="text-gray-400 font-bold text-xs">.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn"}</span>
                  </div>
                  {editingStoreId && (
                    <div className="mt-2.5">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Tên đăng nhập Admin</label>
                      <input
                        type="text"
                        readOnly
                        value={currentEditingStore?.users?.[0]?.username || "admin"}
                        className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl font-mono text-sm uppercase text-gray-500 cursor-not-allowed outline-none opacity-75"
                        title="Tên đăng nhập quản trị của cửa hàng"
                      />
                    </div>
                  )}
                </div>

                {editingStoreId ? (
                  <>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-purple-600">Đổi tài khoản Admin (Không bắt buộc)</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Tên đăng nhập Admin mới</label>
                        <input
                          type="text"
                          value={formData.adminUsername}
                          onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                          className="w-full h-12 px-5 bg-gray-50 border-2 border-purple-50 focus:border-purple-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                          placeholder="Để trống nếu không đổi"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Mật khẩu Admin mới</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.adminPassword}
                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                            className="w-full h-12 pl-5 pr-11 bg-gray-50 border-2 border-purple-50 focus:border-purple-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
                            placeholder="Để trống nếu không đổi"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tài khoản quản trị cửa hàng</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Tên đăng nhập Admin</label>
                        <input
                          required
                          type="text"
                          value={formData.adminUsername}
                          onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                          className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                          placeholder="admin-username"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Mật khẩu Admin</label>
                        <div className="relative">
                          <input
                            required
                            type={showPassword ? "text" : "password"}
                            value={formData.adminPassword}
                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                            className="w-full h-12 pl-5 pr-11 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-gray-100 my-1"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Màu chủ đạo (Phong thủy)</label>
                    <div className="grid grid-cols-5 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      {THEME_PALETTES.map((palette) => (
                        <button
                          key={palette.color}
                          type="button"
                          onClick={() => setFormData({ ...formData, themeColor: palette.color })}
                          className={`w-7 h-7 rounded-full ${palette.bgClass} relative flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm`}
                          title={`${palette.name} (${palette.element})`}
                        >
                          {formData.themeColor.toLowerCase() === palette.color.toLowerCase() && (
                            <Check size={14} className="text-white drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                      placeholder="VND"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-1"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-blue-600">Quản lý Gói dịch vụ & Hạn dùng</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Gói cước</label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as "FREE" | "PREMIUM" })}
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none cursor-pointer"
                    >
                      <option value="FREE">Gói FREE (Hạn dùng ngắn)</option>
                      <option value="PREMIUM">Gói PREMIUM (Vô thời hạn)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Trạng thái thuê</label>
                    <select
                      value={formData.subscriptionStatus}
                      onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none cursor-pointer"
                    >
                      <option value="ACTIVE">Hoạt động (Active)</option>
                      <option value="EXPIRED">Đã hết hạn (Expired)</option>
                      <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={formData.subscriptionStart}
                      onChange={(e) => setFormData({ ...formData, subscriptionStart: e.target.value })}
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Ngày hết hạn</label>
                    <input
                      type="date"
                      value={formData.subscriptionEnd}
                      onChange={(e) => setFormData({ ...formData, subscriptionEnd: e.target.value })}
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none"
                      placeholder="Không giới hạn"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Số tiền thanh toán (VND)</label>
                    <input
                      type="number"
                      value={formData.subscriptionPrice}
                      onChange={(e) => setFormData({ ...formData, subscriptionPrice: Number(e.target.value) })}
                      className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none font-mono"
                      placeholder="Ví dụ: 199000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Ghi chú gói dịch vụ</label>
                    <textarea
                      value={formData.subscriptionNotes}
                      onChange={(e) => setFormData({ ...formData, subscriptionNotes: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm outline-none h-20 resize-none"
                      placeholder="Ghi chú thêm về thông tin thanh toán, gia hạn..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="flex-[2] px-5 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 text-sm"
                >
                  {isPending ? "Processing..." : editingStoreId ? "Save Changes" : "Confirm & Create Store"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
