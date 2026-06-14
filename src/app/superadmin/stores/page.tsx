"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from "@/hooks/useSuperAdmin";
import { Store as StoreData } from "@/api/superadmin";
import { StoreFilters } from "@/components/superadmin/StoreFilters";
import { StoreCard } from "@/components/superadmin/StoreCard";
import { StoreFormModal } from "@/components/superadmin/StoreFormModal";

export default function StoreManagementPage() {
  const { data: stores = [], isLoading, isError, error } = useStores();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("new") === "true");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    adminUsername: "admin",
    adminPassword: "",
    themeColor: "#f97316",
    currency: "VND",
    logo: null as string | null,
    subscriptionPlan: "FREE" as "FREE" | "PREMIUM",
    subscriptionStatus: "ACTIVE",
    subscriptionStart: new Date().toISOString().split("T")[0],
    subscriptionEnd: "",
    subscriptionPrice: 0,
    subscriptionNotes: "",
    description: "Chào mừng quý khách đến với cửa hàng!",
  });

  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const currentEditingStore = editingStoreId ? (stores.find(s => s.id === editingStoreId) || null) : null;

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

  const handleSubmit = (modalFormData: typeof formData) => {
    if (editingStoreId) {
      updateStoreMutation.mutate({
        id: editingStoreId,
        data: {
          name: modalFormData.name,
          themeColor: modalFormData.themeColor,
          currency: modalFormData.currency,
          logo: modalFormData.logo,
          subscriptionPlan: modalFormData.subscriptionPlan,
          subscriptionStatus: modalFormData.subscriptionStatus,
          subscriptionStart: modalFormData.subscriptionStart ? new Date(modalFormData.subscriptionStart).toISOString() : null,
          subscriptionEnd: modalFormData.subscriptionEnd ? new Date(modalFormData.subscriptionEnd).toISOString() : null,
          subscriptionPrice: Number(modalFormData.subscriptionPrice),
          subscriptionNotes: modalFormData.subscriptionNotes,
          description: modalFormData.description,
          ...(modalFormData.adminUsername && { adminUsername: modalFormData.adminUsername.trim() }),
          ...(modalFormData.adminPassword && { adminPassword: modalFormData.adminPassword }),
        }
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingStoreId(null);
          resetForm();
        },
        onError: (err: any) => {
          alert("Gặp lỗi khi cập nhật cửa hàng: " + (err.message || "Lỗi không xác định"));
        }
      });
    } else {
      createStoreMutation.mutate({
        ...modalFormData,
        subscriptionStart: modalFormData.subscriptionStart ? new Date(modalFormData.subscriptionStart).toISOString() : null,
        subscriptionEnd: modalFormData.subscriptionEnd ? new Date(modalFormData.subscriptionEnd).toISOString() : null,
        subscriptionPrice: Number(modalFormData.subscriptionPrice),
        adminUsername: modalFormData.adminUsername.trim()
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
        },
        onError: (err: any) => {
          alert("Gặp lỗi khi tạo cửa hàng: " + (err.message || "Lỗi không xác định"));
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      adminUsername: "admin",
      adminPassword: "",
      themeColor: "#f97316",
      currency: "VND",
      logo: null,
      subscriptionPlan: "FREE",
      subscriptionStatus: "ACTIVE",
      subscriptionStart: new Date().toISOString().split("T")[0],
      subscriptionEnd: "",
      subscriptionPrice: 0,
      subscriptionNotes: "",
      description: "Chào mừng quý khách đến với cửa hàng!",
    });
  };

  const handleEdit = (store: StoreData) => {
    setEditingStoreId(store.id);
    setFormData({
      name: store.name,
      slug: store.slug,
      adminUsername: "",
      adminPassword: "",
      themeColor: store.themeColor,
      currency: store.currency,
      logo: store.logo,
      subscriptionPlan: store.subscriptionPlan || "FREE",
      subscriptionStatus: store.subscriptionStatus || "ACTIVE",
      subscriptionStart: store.subscriptionStart ? new Date(store.subscriptionStart).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      subscriptionEnd: store.subscriptionEnd ? new Date(store.subscriptionEnd).toISOString().split("T")[0] : "",
      subscriptionPrice: store.subscriptionPrice ? Number(store.subscriptionPrice) : 0,
      subscriptionNotes: store.subscriptionNotes || "",
      description: store.description || "Chào mừng quý khách đến với cửa hàng!",
    });
    setIsModalOpen(true);
  };

  const toggleStoreStatus = (id: string, currentStatus: boolean) => {
    updateStoreMutation.mutate({ id, data: { isActive: !currentStatus } }, {
      onError: (err: any) => {
        alert("Gặp lỗi khi thay đổi trạng thái hoạt động: " + (err.message || "Lỗi không xác định"));
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteStoreMutation.mutate(id, {
      onError: (err: any) => {
        alert("Gặp lỗi khi xóa cửa hàng: " + (err.message || "Lỗi không xác định"));
      }
    });
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
      <StoreFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Stores List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 p-12 rounded-[3rem] text-center border-2 border-dashed border-red-200">
            <p className="text-xl font-bold text-red-600 mb-2">Không thể tải danh sách cửa hàng</p>
            <p className="text-sm text-red-500">{(error as any)?.message || "Vui lòng kiểm tra lại chứng chỉ SSL hoặc kết nối với server."}</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
            <Store size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="text-xl font-bold text-gray-400">No stores found matching your criteria.</p>
          </div>
        ) : (
          filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onToggleStatus={toggleStoreStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create / Edit Store Modal */}
      <StoreFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStoreId(null);
          resetForm();
        }}
        onSubmit={handleSubmit}
        editingStoreId={editingStoreId}
        currentEditingStore={currentEditingStore}
        initialData={formData}
        isPending={createStoreMutation.isPending || updateStoreMutation.isPending}
      />
    </div>
  );
}
