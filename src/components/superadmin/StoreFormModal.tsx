import { useState, useEffect } from "react";
import { Plus, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Store as StoreData } from "@/api/superadmin";

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

  // Sync state with prop updates when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setShowPassword(false);
    }
  }, [isOpen, initialData]);

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

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Store Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    placeholder="e.g. Quán Ăn Việt"
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
                      className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 font-mono text-sm disabled:opacity-50"
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
                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-mono text-sm uppercase text-gray-500 cursor-not-allowed outline-none opacity-75"
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
                          className="w-full px-5 py-3 bg-gray-50 border-2 border-purple-50 focus:border-purple-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
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
                            className="w-full pl-5 pr-11 py-3 bg-gray-50 border-2 border-purple-50 focus:border-purple-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
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
                          className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
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
                            className="w-full pl-5 pr-11 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
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
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Theme Color</label>
                    <div className="relative w-full">
                      <input
                        type="color"
                        value={formData.themeColor}
                        onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                        className="absolute left-3 w-7 h-7 rounded-lg border-0 p-0 overflow-hidden cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-lg"
                        style={{ top: "calc(50% - 14px)" }}
                      />
                      <input
                        type="text"
                        value={formData.themeColor}
                        onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                        className={`h-11 w-full pl-12 pr-4 bg-gray-50 rounded-xl outline-none focus:ring-2 font-mono text-xs uppercase ${
                          editingStoreId
                            ? "border-2 border-purple-50 focus:border-purple-500 focus:ring-purple-500/20"
                            : "border-none focus:ring-blue-500/20"
                        }`}
                        placeholder="#F97316"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className={`h-11 w-full px-5 bg-gray-50 rounded-xl outline-none focus:ring-2 text-sm ${
                        editingStoreId
                          ? "border-2 border-purple-50 focus:border-purple-500 focus:ring-purple-500/20"
                          : "border-none focus:ring-blue-500/20"
                      }`}
                      placeholder="VND"
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
                  disabled={isPending}
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
