"use client";
 
import { useState } from "react";
import { useRenewalRequests, useApproveRenewalRequest, useRejectRenewalRequest } from "@/hooks/useRenewals";
import { 
  Check, 
  X, 
  CreditCard, 
  Store, 
  Clock, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import useIsMounted from "@/hooks/useIsMounted";
 
export default function SuperAdminRenewalsPage() {
  const isMounted = useIsMounted();
  const { data: requests = [], isLoading } = useRenewalRequests();
  const approveMutation = useApproveRenewalRequest();
  const rejectMutation = useRejectRenewalRequest();
 
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
 
  if (!isMounted) return null;
 
  const filteredRequests = requests.filter(req => {
    if (activeTab === "ALL") return true;
    return req.status === activeTab;
  });
 
  const handleApprove = (id: string, storeName: string, months: number) => {
    if (confirm(`Bạn có chắc chắn muốn DUYỆT yêu cầu gia hạn ${months} tháng cho cửa hàng "${storeName}"?`)) {
      approveMutation.mutate(id, {
        onSuccess: () => {
          alert("Đã phê duyệt yêu cầu gia hạn thành công!");
        },
        onError: (err: any) => {
          alert(err.message || "Phê duyệt thất bại!");
        }
      });
    }
  };
 
  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
  };
 
  const submitReject = () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }
 
    rejectMutation.mutate({
      id: rejectingId,
      notes: rejectReason.trim()
    }, {
      onSuccess: () => {
        setRejectingId(null);
        setRejectReason("");
        alert("Đã từ chối yêu cầu gia hạn!");
      },
      onError: (err: any) => {
        alert(err.message || "Từ chối yêu cầu thất bại!");
      }
    });
  };
 
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Yêu cầu gia hạn</h1>
        <p className="text-gray-500 font-medium italic">Đối soát tiền về tài khoản hệ thống và duyệt gói dịch vụ cho các store</p>
      </div>
 
      {/* Tab Filter */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border shadow-sm w-fit gap-1">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((tab) => {
          const count = tab === "ALL" 
            ? requests.length 
            : requests.filter(r => r.status === tab).length;
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
              {tab === "PENDING" ? "Chờ duyệt" : tab === "APPROVED" ? "Đã duyệt" : tab === "REJECTED" ? "Đã từ chối" : "Tất cả"}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === tab 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
 
      {isLoading ? (
        <div className="text-center font-bold text-gray-400 py-20 animate-pulse">
          Đang tải danh sách yêu cầu gia hạn...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center text-gray-400 italic">
          Không tìm thấy yêu cầu gia hạn nào ở mục này.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Cửa hàng</th>
                  <th className="px-6 py-4">Gói & Số tháng</th>
                  <th className="px-6 py-4">Số tiền</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4">Ghi chú yêu cầu</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">
                            {req.store?.name || "Cửa hàng ẩn"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            slug: {req.store?.slug || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-800">Premium</span>
                        <span className="text-xs text-gray-400 block font-bold mt-0.5">+{req.months} tháng sử dụng</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-orange-600">
                        {Number(req.price).toLocaleString("vi-VN")} ₫
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                        <Calendar size={12} className="text-gray-400 shrink-0" />
                        <span>{new Date(req.createdAt).toLocaleDateString("vi-VN")}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <Clock size={12} className="text-gray-400 shrink-0" />
                        <span>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 max-w-xs text-xs italic text-gray-500">
                        <MessageSquare size={13} className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{req.notes || "Không có ghi chú"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        req.status === "APPROVED" 
                          ? "bg-green-100 text-green-700" 
                          : req.status === "REJECTED" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-amber-100 text-amber-700 animate-pulse"
                      }`}>
                        {req.status === "APPROVED" ? "Đã duyệt" : req.status === "REJECTED" ? "Từ chối" : "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            onClick={() => handleApprove(req.id, req.store?.name || "Store", req.months)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center gap-1 text-xs shadow-md shadow-green-100"
                            title="Phê duyệt gia hạn"
                          >
                            <Check size={16} />
                            Duyệt
                          </button>
                          <button
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            onClick={() => handleReject(req.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center gap-1 text-xs shadow-md shadow-red-100"
                            title="Từ chối yêu cầu"
                          >
                            <X size={16} />
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
 
      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" />
                <h3 className="font-bold text-lg text-gray-900">Từ chối yêu cầu gia hạn</h3>
              </div>
              <button 
                onClick={() => setRejectingId(null)} 
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
 
            <div className="p-6 space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase block">Nhập lý do từ chối</label>
              <textarea
                placeholder="Ví dụ: Chưa nhận được tiền, Sai nội dung chuyển khoản..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-red-500 focus:outline-none transition-colors"
                rows={4}
              />
            </div>
 
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
              <button
                disabled={rejectMutation.isPending}
                onClick={submitReject}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {rejectMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <X size={16} />
                    Xác nhận Từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
