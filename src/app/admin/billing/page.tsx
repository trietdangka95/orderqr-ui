"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRenewalRequests, useCreateRenewalRequest, useBankConfig } from "@/hooks/useRenewals";
import { 
  CreditCard, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  Copy, 
  History, 
  X,
  Plus
} from "lucide-react";
import useIsMounted from "@/hooks/useIsMounted";

const sanitizeBankId = (bankId: string | undefined | null): string => {
  if (!bankId) return "";
  const cleaned = bankId.trim().replace(/\s+/g, "").toUpperCase();
  const mapping: Record<string, string> = {
    "MBBANK": "MB",
    "VIETCOMBANK": "VCB",
    "VIETINBANK": "CTG",
    "TECHCOMBANK": "TCB",
    "BIDVBANK": "BIDV",
    "ACBBANK": "ACB",
    "VPBANK": "VPB",
    "TPBANK": "TPB",
    "SACOMBANK": "STB",
    "HDBANK": "HDB",
    "AGRIBANK": "VBA",
    "ABBANK": "ABB",
    "MSBBANK": "MSB",
    "VIBBANK": "VIB",
    "SHBANK": "SHB",
    "OCBBANK": "OCB",
    "SCBBANK": "SCB",
    "SEABANK": "SEAB",
  };
  return mapping[cleaned] || cleaned;
};

export default function AdminBillingPage() {
  const { storeConfig } = useCartStore();
  const isMounted = useIsMounted();
  const { data: requests = [], isLoading: requestsLoading } = useRenewalRequests();
  const { data: bankConfig } = useBankConfig();
  const createRequestMutation = useCreateRenewalRequest();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [selectedPkg, setSelectedPkg] = useState<{ months: number; price: number; label: string; originalPrice: number; desc: string; popular: boolean } | null>(null);
  const [notes, setNotes] = useState("");

  const MONTHLY_PRICE = bankConfig?.premiumPrice || 599000;

  // Base packages definitions, switching dynamic labels and prices for testing
  const packages = isTestMode ? [
    { months: 3, price: 3000, label: "3 phút (Test)", originalPrice: 3000, desc: "Gói Phút 1", popular: false },
    { months: 6, price: 6000, label: "6 phút (Test)", originalPrice: 6000, desc: "Gói Phút 2", popular: true },
    { months: 12, price: 12000, label: "12 phút (Test)", originalPrice: 12000, desc: "Gói Phút 3", popular: false },
  ] : [
    { months: 3, price: 3 * MONTHLY_PRICE, label: "3 tháng", originalPrice: 3 * MONTHLY_PRICE, desc: "Gói Cơ Bản", popular: false },
    { months: 6, price: Math.round(6 * MONTHLY_PRICE * 0.9), label: "6 tháng (Giảm 10%)", originalPrice: 6 * MONTHLY_PRICE, desc: "Gói Phổ Biến", popular: true },
    { months: 12, price: Math.round(12 * MONTHLY_PRICE * 0.8), label: "12 tháng (Giảm 20%)", originalPrice: 12 * MONTHLY_PRICE, desc: "Gói Tiết Kiệm", popular: false },
  ];

  const superAdminBankId = bankConfig?.bankId || process.env.NEXT_PUBLIC_SUPERADMIN_BANK_ID || "MB";
  const superAdminBankAcc = bankConfig?.bankAccountNo || process.env.NEXT_PUBLIC_SUPERADMIN_BANK_ACC || "123456789";
  const superAdminBankName = bankConfig?.bankAccountName || process.env.NEXT_PUBLIC_SUPERADMIN_BANK_NAME || "PLATFORM OWNER";

  if (!isMounted) return null;

  // Calculate remaining days
  const getRemainingDays = () => {
    if (!storeConfig?.subscriptionEnd) return Infinity; // null = no expiry set
    const end = new Date(storeConfig.subscriptionEnd).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = getRemainingDays();
  const isExpired = storeConfig?.subscriptionStatus === "EXPIRED" || (storeConfig?.subscriptionEnd != null && daysLeft <= 0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép ${label}!`);
  };

  const handleOpenModal = (pkg: typeof packages[0]) => {
    setSelectedPkg(pkg);
    setNotes("");
    setIsModalOpen(true);
  };

  const handleSubmitRenewal = () => {
    if (!selectedPkg) return;

    createRequestMutation.mutate({
      months: selectedPkg.months,
      price: selectedPkg.price,
      notes: isTestMode ? `[TEST_MINUTES] ${notes.trim()}`.trim() : notes.trim()
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedPkg(null);
        setNotes("");
        alert("Gửi yêu cầu gia hạn thành công! Vui lòng chờ hệ thống đối soát duyệt.");
      },
      onError: (err: any) => {
        alert(err.message || "Gửi yêu cầu gia hạn thất bại. Vui lòng thử lại!");
      }
    });
  };

  const unitLabel = isTestMode ? "phút" : "tháng";

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Gói cước & Thanh toán</h1>
          <p className="text-gray-500 font-medium italic">Quản lý thời hạn gói Premium và gửi yêu cầu gia hạn hệ thống</p>
        </div>
      </header>

      {/* Current Subscription Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-[2rem] border p-8 shadow-sm flex flex-col justify-between transition-all ${
          isExpired 
            ? "bg-red-50/50 border-red-200" 
            : daysLeft <= 7 
            ? "bg-amber-50/50 border-amber-200 shadow-amber-50" 
            : "bg-white border-gray-100"
        }`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  storeConfig?.subscriptionPlan === "PREMIUM" 
                    ? "bg-primary-soft text-primary border border-orange-200" 
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}>
                  Gói {storeConfig?.subscriptionPlan || "FREE"}
                </span>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 mt-3">
                  {storeConfig?.subscriptionPlan === "PREMIUM" ? "Tài khoản Premium" : "Tài khoản Miễn phí (FREE)"}
                </h2>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                  isExpired 
                    ? "bg-red-500 text-white animate-pulse" 
                    : (storeConfig?.subscriptionEnd != null && daysLeft <= 7)
                    ? "bg-amber-500 text-white animate-pulse" 
                    : "bg-green-500 text-white"
                }`}>
                  {isExpired ? "Hết hạn" : (storeConfig?.subscriptionEnd != null && daysLeft <= 7) ? "Sắp hết hạn" : "Hoạt động"}
                </span>
              </div>
            </div>

            {isExpired ? (
              <div className="flex items-center gap-3 bg-red-100/60 text-red-800 p-4 rounded-2xl text-sm font-semibold border border-red-200">
                <AlertTriangle className="shrink-0 text-red-600" />
                <span>Cửa hàng đã hết hạn dịch vụ. Vui lòng thanh toán gia hạn để khách tiếp tục gọi món.</span>
              </div>
            ) : (storeConfig?.subscriptionEnd != null && daysLeft <= 7) ? (
              <div className="flex items-center gap-3 bg-amber-100/60 text-amber-800 p-4 rounded-2xl text-sm font-semibold border border-amber-200">
                <AlertTriangle className="shrink-0 text-amber-600 animate-bounce" />
                <span>Gói dịch vụ sắp hết hạn trong {daysLeft} ngày nữa. Hãy gia hạn ngay hôm nay.</span>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 font-medium">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày hết hạn</p>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {storeConfig?.subscriptionEnd 
                    ? new Date(storeConfig.subscriptionEnd).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "Không có hạn"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Thời gian còn lại</p>
                <p className={`text-lg font-bold mt-1 ${isExpired ? "text-red-500" : (storeConfig?.subscriptionEnd != null && daysLeft <= 7) ? "text-amber-600" : "text-green-600"}`}>
                  {isExpired ? "0 ngày" : storeConfig?.subscriptionEnd == null ? "Không giới hạn" : `${daysLeft} ngày`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-soft">
              <Sparkles size={24} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Quyền lợi Premium</h3>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li className="flex items-center gap-2">✨ Chọn màu sắc ngũ hành</li>
              <li className="flex items-center gap-2">✨ Thay logo quán theo thương hiệu</li>
              <li className="flex items-center gap-2">✨ Gọi món real-time siêu mượt</li>
              <li className="flex items-center gap-2">✨ Quản lý bàn ăn và xuất excel doanh thu</li>
              <li className="flex items-center gap-2">✨ Hỗ trợ kỹ thuật 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Renewal Packages Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Coins className="text-orange-500" /> Chọn gói Gia hạn Premium
          </h3>

          {/* Test Mode Toggle */}
          <div className="flex items-center gap-3 bg-primary-soft border border-primary px-4 py-2 rounded-2xl shrink-0">
            <span className="text-xs font-bold text-orange-700">Chế độ test (phút)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isTestMode} 
                onChange={(e) => {
                  setIsTestMode(e.target.checked);
                  setSelectedPkg(null);
                }}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.months} 
              className={`bg-white rounded-3xl border-2 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all ${
                pkg.popular ? "border-primary shadow-primary/50" : "border-gray-100"
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">
                  Phổ biến nhất
                </div>
              )}
              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{pkg.desc}</span>
                <h4 className="text-2xl font-black text-gray-900">{pkg.label}</h4>
                <div className="pt-2">
                  <span className="text-3xl font-black text-primary">
                    {pkg.price.toLocaleString("vi-VN")} ₫
                  </span>
                  {pkg.price < pkg.originalPrice && (
                    <span className="text-xs text-gray-400 line-through block font-medium mt-1">
                      {pkg.originalPrice.toLocaleString("vi-VN")} ₫
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleOpenModal(pkg)}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                  pkg.popular 
                    ? "bg-primary text-white shadow-lg shadow-primary hover:bg-primary" 
                    : "bg-gray-50 border border-gray-100 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Gia hạn ngay
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Renewal Request History */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <History className="text-blue-500" /> Nhật ký gia hạn
        </h3>

        {requestsLoading ? (
          <div className="text-center font-bold text-gray-400 py-10">Đang tải lịch sử...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-400 italic">
            Chưa có lịch sử gia hạn nào được ghi nhận.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-medium">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Gói cước</th>
                    <th className="px-6 py-4">Số tháng / phút</th>
                    <th className="px-6 py-4">Số tiền</th>
                    <th className="px-6 py-4">Ngày gửi</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ghi chú duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">Premium</span>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {req.months} {req.notes?.includes('[TEST_MINUTES]') ? 'phút (test)' : 'tháng'}
                      </td>
                      <td className="px-6 py-4 font-black text-primary">
                        {Number(req.price).toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <td className="px-6 py-4 text-xs italic text-gray-500">
                        {req.notes || "Không có"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isModalOpen && selectedPkg && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="text-primary" />
                <h3 className="font-bold text-lg text-gray-900">
                  Gia hạn Premium {selectedPkg.months} {unitLabel}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPkg(null);
                }} 
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="bg-primary-soft border border-primary rounded-2xl p-4 flex flex-col items-center gap-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Chuyển khoản VietQR đến hệ thống</p>
                <div className="w-44 h-44 bg-white border border-gray-200/60 rounded-xl flex items-center justify-center p-2 relative shadow-md">
                  <img
                    src={`https://img.vietqr.io/image/${sanitizeBankId(superAdminBankId)}-${superAdminBankAcc}-compact2.png?amount=${selectedPkg.price}&addInfo=GIAHAN%20${storeConfig?.slug}%20${selectedPkg.months}%20${isTestMode ? 'PHUT' : 'THANG'}&accountName=${encodeURIComponent(superAdminBankName)}`}
                    alt="VietQR code"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-xs font-semibold space-y-2 text-gray-700">
                <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                  <span className="text-gray-400 font-bold">Ngân hàng</span>
                  <span className="font-bold text-gray-800">{superAdminBankId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-1.5 items-center">
                  <span className="text-gray-400 font-bold">Số tài khoản</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-800">{superAdminBankAcc}</span>
                    <button 
                      onClick={() => handleCopy(superAdminBankAcc, "Số tài khoản")}
                      className="text-primary hover:text-primary transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-1.5">
                  <span className="text-gray-400 font-bold">Tên thụ hưởng</span>
                  <span className="font-bold text-gray-800">{superAdminBankName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-1.5 items-center">
                  <span className="text-gray-400 font-bold">Nội dung chuyển khoản</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-primary">GIAHAN {storeConfig?.slug} {selectedPkg.months} {isTestMode ? 'PHUT' : 'THANG'}</span>
                    <button 
                      onClick={() => handleCopy(`GIAHAN ${storeConfig?.slug} ${selectedPkg.months} ${isTestMode ? 'PHUT' : 'THANG'}`, "Nội dung chuyển khoản")}
                      className="text-primary hover:text-primary transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Số tiền chuyển</span>
                  <span className="font-black text-primary text-sm">{selectedPkg.price.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase block">Ghi chú bổ sung (nếu có)</label>
                <textarea
                  placeholder="Ví dụ: MB Bank, Tên người chuyển..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPkg(null);
                }}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
              >
                Hủy bỏ
              </button>
              <button
                disabled={createRequestMutation.isPending}
                onClick={handleSubmitRenewal}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary shadow-lg shadow-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {createRequestMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Đã chuyển tiền, Gửi yêu cầu
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
