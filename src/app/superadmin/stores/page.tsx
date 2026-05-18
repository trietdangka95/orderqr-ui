"use client";

import { useState } from "react";
import { 
  Store, 
  Plus, 
  Search, 
  ExternalLink, 
  ToggleLeft, 
  ToggleRight,
  Trash2,
  Edit,
  Layout,
  Globe,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from "@/hooks/useSuperAdmin";
import { Store as StoreData } from "@/api/superadmin";

export default function StoreManagementPage() {
  const { data: stores = [], isLoading } = useStores();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("new") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    adminUsername: "",
    adminPassword: "",
    themeColor: "#f97316",
    currency: "VND"
  });

  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const currentEditingStore = editingStoreId ? stores.find(s => s.id === editingStoreId) : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      store.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && store.isActive) || 
      (statusFilter === "inactive" && !store.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStoreId) {
      updateStoreMutation.mutate({ 
        id: editingStoreId, 
        data: {
          name: formData.name,
          themeColor: formData.themeColor,
          currency: formData.currency,
          // Gửi adminUsername và adminPassword nếu người dùng nhập thay đổi (đã trim)
          ...(formData.adminUsername && { adminUsername: formData.adminUsername.trim() }),
          ...(formData.adminPassword && { adminPassword: formData.adminPassword }),
        }
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingStoreId(null);
          resetForm();
        }
      });
    } else {
      createStoreMutation.mutate({
        ...formData,
        adminUsername: formData.adminUsername.trim()
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      adminUsername: "",
      adminPassword: "",
      themeColor: "#f97316",
      currency: "VND"
    });
    setShowPassword(false);
  };

  const handleEdit = (store: StoreData) => {
    setEditingStoreId(store.id);
    setFormData({
      name: store.name,
      slug: store.slug,
      adminUsername: store.users?.[0]?.username || "", // Tự động điền username hiện tại
      adminPassword: "", // Để trống khi edit, chỉ điền nếu muốn đổi mật khẩu
      themeColor: store.themeColor,
      currency: store.currency
    });
    setIsModalOpen(true);
  };

  const toggleStoreStatus = (id: string, currentStatus: boolean) => {
    updateStoreMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Store Management</h1>
          <p className="text-gray-500 font-medium italic">Create and manage independent restaurant stores</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Add New Store</span>
        </button>
      </header>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search stores by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-gray-50 border-none rounded-2xl font-bold text-gray-600 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Stores List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
            <Store size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="text-xl font-bold text-gray-400">No stores found matching your criteria.</p>
          </div>
        ) : (
          filteredStores.map((store) => (
            <motion.div
              key={store.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 flex-1 w-full">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 border border-gray-100">
                  <Store size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-gray-900">{store.name}</h2>
                    {store.isActive ? (
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase">Active</span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase">Inactive</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest items-center">
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-500" />
                      <span>{store.slug}.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layout size={14} className="text-purple-500" />
                      <span className="flex items-center gap-1">
                        Theme: 
                        <span className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: store.themeColor }}></span>
                      </span>
                    </div>
                    {store.users && store.users.length > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        Admin: {store.users[0].username}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <button 
                  onClick={() => toggleStoreStatus(store.id, store.isActive)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                    store.isActive ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {store.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span className="md:hidden lg:inline">{store.isActive ? "Deactivate" : "Activate"}</span>
                </button>
                <button 
                  onClick={() => handleEdit(store)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
                >
                  <Edit size={20} />
                  <span className="md:hidden lg:inline">Edit</span>
                </button>
                <Link 
                  href={`/?store=${store.slug}`}
                  target="_blank"
                  className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <ExternalLink size={20} />
                </Link>
                <button 
                  onClick={() => { if(confirm('Delete this store?')) deleteStoreMutation.mutate(store.id) }}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Store Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setEditingStoreId(null);
                resetForm();
              }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{editingStoreId ? "Cập Nhật Cửa Hàng" : "Thêm Cửa Hàng Mới"}</h2>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider mt-0.5">
                    {editingStoreId ? "Chỉnh sửa thông tin & tài khoản admin" : "Khởi tạo thông tin cửa hàng & tài khoản"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Store Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. Quán Ăn Việt"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subdomain Slug</label>
                    <div className="flex items-center gap-2">
                      <input 
                        required
                        disabled={!!editingStoreId}
                        type="text" 
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                        className="flex-1 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-mono text-sm disabled:opacity-50"
                        placeholder="e.g. quan-an-viet"
                      />
                      <span className="text-gray-400 font-bold text-xs">.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn"}</span>
                    </div>
                  </div>

                  {editingStoreId ? (
                    <>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-purple-600">Đổi tài khoản Admin (Không bắt buộc)</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên đăng nhập Admin mới</label>
                          <input 
                            type="text" 
                            value={formData.adminUsername}
                            onChange={(e) => setFormData({...formData, adminUsername: e.target.value})}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-purple-50 focus:border-purple-500 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20"
                            placeholder="Để trống nếu không đổi"
                          />
                          {currentEditingStore?.users?.[0]?.username && (
                            <p className="text-[10px] text-purple-600 font-bold mt-2 ml-1">
                              Tài khoản hiện tại: <span className="underline decoration-wavy decoration-purple-300 bg-purple-50 px-2 py-0.5 rounded-md">{currentEditingStore.users[0].username}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu Admin mới</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              value={formData.adminPassword}
                              onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                              className="w-full pl-6 pr-12 py-4 bg-gray-50 border-2 border-purple-50 focus:border-purple-500 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20"
                              placeholder="Để trống nếu không đổi"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tài khoản quản trị cửa hàng</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên đăng nhập Admin</label>
                          <input 
                            required
                            type="text" 
                            value={formData.adminUsername}
                            onChange={(e) => setFormData({...formData, adminUsername: e.target.value})}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                            placeholder="admin-username"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu Admin</label>
                          <div className="relative">
                            <input 
                              required
                              type={showPassword ? "text" : "password"} 
                              value={formData.adminPassword}
                              onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                              className="w-full pl-6 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="h-px bg-gray-100 my-2"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Theme Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={formData.themeColor}
                          onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                          className="w-12 h-12 rounded-xl border-none p-0 overflow-hidden cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={formData.themeColor}
                          readOnly
                          className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl font-mono text-sm uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Currency</label>
                      <input 
                        type="text" 
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20"
                        placeholder="VND"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingStoreId(null);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
                    className="flex-[2] px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {createStoreMutation.isPending || updateStoreMutation.isPending ? "Processing..." : (editingStoreId ? "Save Changes" : "Confirm & Create Store")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
