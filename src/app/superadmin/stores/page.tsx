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
  const { data: stores = [], isLoading } = useStores();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();
  const deleteStoreMutation = useDeleteStore();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(searchParams.get("new") === "true");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    adminUsername: "",
    adminPassword: "",
    themeColor: "#f97316",
    currency: "VND"
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
          ...(modalFormData.adminUsername && { adminUsername: modalFormData.adminUsername.trim() }),
          ...(modalFormData.adminPassword && { adminPassword: modalFormData.adminPassword }),
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
        ...modalFormData,
        adminUsername: modalFormData.adminUsername.trim()
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
  };

  const handleEdit = (store: StoreData) => {
    setEditingStoreId(store.id);
    setFormData({
      name: store.name,
      slug: store.slug,
      adminUsername: store.users?.[0]?.username || "",
      adminPassword: "",
      themeColor: store.themeColor,
      currency: store.currency
    });
    setIsModalOpen(true);
  };

  const toggleStoreStatus = (id: string, currentStatus: boolean) => {
    updateStoreMutation.mutate({ id, data: { isActive: !currentStatus } });
  };

  const handleDelete = (id: string) => {
    deleteStoreMutation.mutate(id);
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
