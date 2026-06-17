"use client";

import { useState } from "react";
import { useContactRequests, useUpdateContactStatus, useDeleteContact } from "@/hooks/useContacts";
import {
  User,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle,
  PhoneCall,
  Trash2,
  Search
} from "lucide-react";
import useIsMounted from "@/hooks/useIsMounted";

export default function SuperAdminContactsPage() {
  const isMounted = useIsMounted();
  const { data: contacts = [], isLoading } = useContactRequests();
  const updateStatusMutation = useUpdateContactStatus();
  const deleteMutation = useDeleteContact();

  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "CONTACTED" | "COMPLETED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isMounted) return null;

  const filteredContacts = contacts.filter((contact) => {
    // 1. Filter by tab status
    const matchesTab = activeTab === "ALL" || contact.status === activeTab;

    // 2. Filter by search query (name or phone)
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.note && contact.note.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const handleUpdateStatus = (id: string, name: string, status: "PENDING" | "CONTACTED" | "COMPLETED") => {
    const statusText =
      status === "PENDING"
        ? "Chờ liên hệ"
        : status === "CONTACTED"
        ? "Đã liên hệ"
        : "Hoàn tất";

    if (confirm(`Bạn có chắc muốn đổi trạng thái yêu cầu của "${name}" thành "${statusText}"?`)) {
      updateStatusMutation.mutate(
        { id, status },
        {
          onSuccess: () => {
            alert("Đã cập nhật trạng thái thành công!");
          },
          onError: (err: unknown) => {
            const error = err as { message?: string };
            alert(error.message || "Cập nhật trạng thái thất bại!");
          }
        }
      );
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA yêu cầu đăng ký của "${name}"? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          alert("Đã xóa yêu cầu thành công!");
        },
        onError: (err: unknown) => {
          const error = err as { message?: string };
          alert(error.message || "Xóa yêu cầu thất bại!");
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Yêu cầu đăng ký</h1>
        <p className="text-gray-500 font-medium italic">Quản lý danh sách các quán đăng ký mở dịch vụ từ Landing page</p>
      </div>

      {/* Controls: Tab and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tab Filter */}
        <div className="flex flex-wrap bg-gray-100 p-1.5 rounded-2xl border shadow-sm gap-1 w-fit">
          {(["PENDING", "CONTACTED", "COMPLETED", "ALL"] as const).map((tab) => {
            const count =
              tab === "ALL"
                ? contacts.length
                : contacts.filter((c) => c.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-white shadow-md text-blue-600 font-extrabold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab === "PENDING"
                  ? "Chờ liên hệ"
                  : tab === "CONTACTED"
                  ? "Đã liên hệ"
                  : tab === "COMPLETED"
                  ? "Hoàn tất"
                  : "Tất cả"}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    activeTab === tab ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại, ghi chú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 transition-colors font-medium text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center font-bold text-gray-400 py-20 animate-pulse">
          Đang tải danh sách đăng ký...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center text-gray-400 italic">
          Không tìm thấy yêu cầu đăng ký nào ở mục này.
        </div>
      ) : (
        <>
          {/* Mobile Card List View (below md) */}
          <div className="md:hidden space-y-4">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 leading-tight">
                        {contact.name || "N/A"}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                        <PhoneCall size={10} /> {contact.phone}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      contact.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : contact.status === "CONTACTED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700 animate-pulse"
                    }`}
                  >
                    {contact.status === "COMPLETED"
                      ? "Hoàn tất"
                      : contact.status === "CONTACTED"
                      ? "Đã liên hệ"
                      : "Chờ liên hệ"}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-50 text-left text-xs font-semibold space-y-2">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Thời gian đăng ký</span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      {new Date(contact.createdAt).toLocaleDateString("vi-VN")}{" "}
                      {new Date(contact.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {contact.note && (
                    <div>
                      <span className="text-gray-400 block mb-0.5">Ghi chú bổ sung</span>
                      <span className="text-gray-500 italic block bg-gray-50 p-2.5 rounded-xl border border-gray-100/65 leading-normal">
                        {contact.note}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  {contact.status !== "CONTACTED" && (
                    <button
                      disabled={updateStatusMutation.isPending || deleteMutation.isPending}
                      onClick={() => handleUpdateStatus(contact.id, contact.name, "CONTACTED")}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1 text-[11px] shadow-sm"
                    >
                      <PhoneCall size={14} />
                      Đã liên hệ
                    </button>
                  )}
                  {contact.status !== "COMPLETED" && (
                    <button
                      disabled={updateStatusMutation.isPending || deleteMutation.isPending}
                      onClick={() => handleUpdateStatus(contact.id, contact.name, "COMPLETED")}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1 text-[11px] shadow-sm"
                    >
                      <CheckCircle size={14} />
                      Hoàn tất
                    </button>
                  )}
                  <button
                    disabled={updateStatusMutation.isPending || deleteMutation.isPending}
                    onClick={() => handleDelete(contact.id, contact.name)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center"
                    title="Xóa yêu cầu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-medium">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Khách hàng / Liên hệ</th>
                    <th className="px-6 py-4">Ghi chú bổ sung</th>
                    <th className="px-6 py-4">Thời gian gửi</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">
                              {contact.name || "N/A"}
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono mt-1 flex items-center gap-1">
                              <PhoneCall size={12} className="text-gray-400" />
                              {contact.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5 max-w-sm text-xs italic text-gray-600">
                          <MessageSquare size={13} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-3">{contact.note || "Không có ghi chú"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          <span>{new Date(contact.createdAt).toLocaleDateString("vi-VN")}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <Clock size={12} className="text-gray-400 shrink-0" />
                          <span>
                            {new Date(contact.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            contact.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : contact.status === "CONTACTED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700 animate-pulse"
                          }`}
                        >
                          {contact.status === "COMPLETED"
                            ? "Hoàn tất"
                            : contact.status === "CONTACTED"
                            ? "Đã liên hệ"
                            : "Chờ liên hệ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {contact.status !== "CONTACTED" && (
                            <button
                              disabled={updateStatusMutation.isPending || deleteMutation.isPending}
                              onClick={() => handleUpdateStatus(contact.id, contact.name, "CONTACTED")}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center gap-1 text-xs shadow-md shadow-blue-100"
                              title="Đánh dấu đã liên hệ"
                            >
                              <PhoneCall size={15} />
                              Liên hệ
                            </button>
                          )}
                          {contact.status !== "COMPLETED" && (
                            <button
                              disabled={updateStatusMutation.isPending || deleteMutation.isPending}
                              onClick={() => handleUpdateStatus(contact.id, contact.name, "COMPLETED")}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center gap-1 text-xs shadow-md shadow-green-100"
                              title="Đánh dấu hoàn tất"
                            >
                              <CheckCircle size={15} />
                              Xong
                            </button>
                          )}
                          <button
                            disabled={updateStatusMutation.isPending || deleteMutation.isPending}
                            onClick={() => handleDelete(contact.id, contact.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center"
                            title="Xóa yêu cầu"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
