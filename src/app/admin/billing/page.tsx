"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRenewalRequests, useCreateRenewalRequest, useBankConfig, useUpdateStoreBankConfig } from "@/hooks/useRenewals";
import {
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Coins,
  Copy,
  History,
  X,
  QrCode,
  Crown,
  Calendar,
  Info,
  ShieldCheck,
  Zap
} from "lucide-react";
import useIsMounted from "@/hooks/useIsMounted";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { motion, AnimatePresence } from "framer-motion";


const sanitizeBankId = (bankId: string | undefined | null): string => {
  if (!bankId) return "";
  const cleaned = bankId.trim().replace(/\s+/g, "").toUpperCase();
  const mapping: Record<string, string> = {
    "MBBANK": "MB",
    "VIETCOMBANK": "VCB",
    "VIETINBANK": "ICB",
    "CTG": "ICB",
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
  const { storeConfig, setStoreConfig } = useCartStore();
  const isMounted = useIsMounted();
  const { data: requests = [], isLoading: requestsLoading } = useRenewalRequests();
  const { data: bankConfig } = useBankConfig();
  const createRequestMutation = useCreateRenewalRequest();
  const updateStoreBankMutation = useUpdateStoreBankConfig();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [bankId, setBankId] = useState(storeConfig?.bankId || "");
  const [bankAccountNo, setBankAccountNo] = useState(storeConfig?.bankAccountNo || "");
  const [bankAccountName, setBankAccountName] = useState(storeConfig?.bankAccountName || "");

  // Sync state with storeConfig when it loads
  useEffect(() => {
    if (storeConfig) {
      const bId = storeConfig.bankId || "";
      const bAccNo = storeConfig.bankAccountNo || "";
      const bAccName = storeConfig.bankAccountName || "";
      const timer = setTimeout(() => {
        setBankId((prev) => prev || bId);
        setBankAccountNo((prev) => prev || bAccNo);
        setBankAccountName((prev) => prev || bAccName);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [storeConfig]);

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
    showToast(`Đã sao chép ${label}!`, "success");
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
        showToast("Gửi yêu cầu gia hạn thành công! Vui lòng chờ hệ thống đối soát duyệt.", "success");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        showToast(err.message || "Gửi yêu cầu gia hạn thất bại. Vui lòng thử lại!", "error");
      }
    });
  };

  const handleUpdateBank = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bankId || !bankAccountNo || !bankAccountName) {
      showToast("Vui lòng điền đầy đủ thông tin ngân hàng!", "error");
      return;
    }
    updateStoreBankMutation.mutate({
      bankId: bankId.trim(),
      bankAccountNo: bankAccountNo.trim(),
      bankAccountName: bankAccountName.trim()
    }, {
      onSuccess: (data) => {
        setStoreConfig({
          ...storeConfig!,
          bankId: data.bankId,
          bankAccountNo: data.bankAccountNo,
          bankAccountName: data.bankAccountName
        });
        showToast("Lưu thông tin ngân hàng thành công!", "success");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        showToast(err.message || "Không thể cập nhật cấu hình ngân hàng", "error");
      }
    });
  };

  const handleToggleTestMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTestMode(e.target.checked);
    setSelectedPkg(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPkg(null);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          {storeConfig?.subscriptionPlan === "PREMIUM" ? (
            /* Premium Plan Card Design */
            <div className={`relative overflow-hidden rounded-[2rem] border p-8 shadow-md transition-all h-full ${isExpired
              ? "bg-gradient-to-br from-red-50 to-orange-50/30 border-red-200"
              : daysLeft <= 7
                ? "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200 shadow-amber-100"
                : "bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 border-amber-200/80 shadow-md"
              }`}>
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-200/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-full">
                {/* Left Column: Plan Details */}
                <div className="flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl text-white shadow-sm shadow-orange-500/20">
                        <Crown size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                          PREMIUM PLAN
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 mt-1">
                          Tài khoản Premium
                        </h2>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isExpired
                        ? "bg-red-500 text-white animate-pulse"
                        : (storeConfig?.subscriptionEnd != null && daysLeft <= 7)
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-emerald-500 text-white"
                        }`}>
                        {!isExpired && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                        {isExpired ? "Hết hạn" : (storeConfig?.subscriptionEnd != null && daysLeft <= 7) ? "Sắp hết hạn" : "Hoạt động"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl">
                      <Calendar className="text-gray-400 shrink-0" size={18} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày hết hạn</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                          {storeConfig?.subscriptionEnd
                            ? new Date(storeConfig.subscriptionEnd).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })
                            : "Không có hạn"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl">
                      <Clock className="text-gray-400 shrink-0" size={18} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Thời gian còn lại</p>
                        <p className={`text-sm font-extrabold mt-0.5 ${isExpired ? "text-red-500" : (storeConfig?.subscriptionEnd != null && daysLeft <= 7) ? "text-amber-600" : "text-emerald-600"}`}>
                          {isExpired ? "0 ngày (Vui lòng gia hạn)" : storeConfig?.subscriptionEnd == null ? "Không giới hạn" : `${daysLeft} day`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Status Banner / Premium Info */}
                <div className="flex flex-col justify-center">
                  {isExpired ? (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200/60 text-red-800 p-4 rounded-2xl text-sm font-medium h-full justify-center flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="text-red-500" size={20} />
                        <p className="font-bold text-red-950">Dịch vụ đã tạm dừng</p>
                      </div>
                      <p className="text-xs text-red-700/90 leading-relaxed">Cửa hàng đã hết hạn dịch vụ. Vui lòng thanh toán gia hạn bên dưới để khách hàng của bạn có thể tiếp tục gọi món trực tuyến.</p>
                    </div>
                  ) : (storeConfig?.subscriptionEnd != null && daysLeft <= 7) ? (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/60 text-amber-800 p-4 rounded-2xl text-sm font-medium h-full justify-center flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="text-amber-600 animate-bounce" size={20} />
                        <p className="font-bold text-amber-950">Yêu cầu gia hạn sớm</p>
                      </div>
                      <p className="text-xs text-amber-700/90 leading-relaxed">Gói dịch vụ sẽ hết hạn trong {daysLeft} ngày nữa. Hãy gia hạn ngay hôm nay để tránh gián đoạn dịch vụ của bạn.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between h-full bg-amber-50/40 border border-amber-100 p-5 rounded-2xl">
                      <div>
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-2">Tính năng đang kích hoạt</h4>
                        <ul className="space-y-2 text-xs font-semibold text-gray-700">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Tự động tạo mã QR theo bàn
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Đồng bộ đặt món thời gian thực
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Báo cáo doanh thu & Quản lý nâng cao
                          </li>
                        </ul>
                      </div>
                      <p className="text-[11px] font-bold text-amber-700/85 italic mt-4">
                        Cảm ơn bạn đã đồng hành cùng Menu Việt!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Free Plan Card Design */
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-8 shadow-md hover:shadow-lg transition-all duration-300 h-full">
              {/* Background decorative elements */}

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-full">
                {/* Left Column: Plan Details */}
                <div className="flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gradient-to-tr from-slate-500 to-indigo-600 rounded-xl text-white shadow-sm shadow-indigo-500/20">
                        <Zap size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          FREE PLAN
                        </span>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 mt-1">
                          Tài khoản Miễn phí
                        </h2>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${storeConfig?.subscriptionStatus === "EXPIRED"
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-emerald-500 text-white"
                        }`}>
                        {storeConfig?.subscriptionStatus !== "EXPIRED" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                        {storeConfig?.subscriptionStatus === "EXPIRED"
                          ? "Hết hạn"
                          : storeConfig?.subscriptionStatus === "ACTIVE"
                            ? "Hoạt động"
                            : storeConfig?.subscriptionStatus || "Hoạt động"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl">
                      <Calendar className="text-gray-400 shrink-0" size={18} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày hết hạn</p>
                        <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                          {storeConfig?.subscriptionEnd
                            ? new Date(storeConfig.subscriptionEnd).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })
                            : "Không giới hạn"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-2xl">
                      <ShieldCheck className={`shrink-0 ${storeConfig?.subscriptionStatus === "EXPIRED" ? "text-red-500" : "text-emerald-500"}`} size={18} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trạng thái gói</p>
                        <p className={`text-sm font-extrabold mt-0.5 ${storeConfig?.subscriptionStatus === "EXPIRED" ? "text-red-500" : "text-emerald-600"
                          }`}>
                          {storeConfig?.subscriptionStatus === "ACTIVE"
                            ? "Hoạt động"
                            : storeConfig?.subscriptionStatus === "EXPIRED"
                              ? "Hết hạn"
                              : storeConfig?.subscriptionStatus || "Hoạt động"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>



      {/* Renewal Packages Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Coins className="text-orange-500" /> Chọn gói Gia hạn Premium
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.months}
              className={`bg-white rounded-3xl border-2 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all ${pkg.popular ? "border-primary shadow-primary/50" : "border-gray-100"
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
              <Button
                onClick={() => handleOpenModal(pkg)}
                variant={pkg.popular ? "primary" : "secondary"}
                className={`w-full mt-6 py-3 h-auto ${pkg.popular ? "shadow-lg shadow-primary/20" : ""}`}
              >
                Gia hạn ngay
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Store Bank Configuration Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-6 gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Tài khoản Ngân hàng nhận QR</h3>
              <p className="text-sm text-gray-500 font-medium">Cấu hình thông tin tài khoản ngân hàng của quán để tự động tạo mã QR VietQR nhận tiền khi khách thanh toán chuyển khoản.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateBank} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Ngân hàng</label>
            <Select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              required
            >
              <option value="" disabled>Chọn ngân hàng...</option>
              {[
                { id: "MB", name: "MB Bank (Ngân hàng Quân đội)" },
                { id: "VCB", name: "Vietcombank (Ngoại thương)" },
                { id: "CTG", name: "VietinBank (Công thương)" },
                { id: "TCB", name: "Techcombank (Kỹ thương)" },
                { id: "BIDV", name: "BIDV (Đầu tư & Phát triển)" },
                { id: "ACB", name: "ACB (Á Châu)" },
                { id: "VPB", name: "VPBank (Việt Nam Thịnh Vượng)" },
                { id: "TPB", name: "TPBank (Tiên Phong)" },
                { id: "STB", name: "Sacombank (Sài Gòn Thương Tín)" },
                { id: "HDB", name: "HDBank (Phát triển TP.HCM)" },
                { id: "VBA", name: "Agribank (Nông nghiệp)" },
                { id: "VIB", name: "VIB (Quốc tế)" },
                { id: "SHB", name: "SHB (Sài Gòn - Hà Nội)" },
                { id: "OCB", name: "OCB (Phương Đông)" },
              ].map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Số tài khoản</label>
            <Input
              type="text"
              value={bankAccountNo}
              onChange={(e) => setBankAccountNo(e.target.value)}
              placeholder="Nhập số tài khoản"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tên chủ tài khoản (Viết liền không dấu)</label>
            <Input
              type="text"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
              placeholder="Ví dụ: NGUYEN VAN A"
              required
            />
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={updateStoreBankMutation.isPending}
              leftIcon={<CheckCircle2 size={16} />}
              className="px-8 shadow-lg shadow-primary/20"
            >
              Lưu cấu hình
            </Button>
          </div>
        </form>
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
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${req.status === "APPROVED"
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
                onClick={handleCloseModal}
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
                <Textarea
                  placeholder="Ví dụ: MB Bank, Tên người chuyển..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <Button
                onClick={handleCloseModal}
                variant="secondary"
                className="flex-1 py-3 h-auto"
              >
                Hủy bỏ
              </Button>
              <Button
                isLoading={createRequestMutation.isPending}
                onClick={handleSubmitRenewal}
                className="flex-1 py-3 h-auto shadow-lg shadow-primary/20"
                leftIcon={<CheckCircle2 size={16} />}
              >
                Đã chuyển tiền, Gửi yêu cầu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none select-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border font-bold text-sm text-white pointer-events-auto ${toast.type === "success"
                ? "bg-emerald-600/90 border-emerald-500/30 shadow-emerald-900/15"
                : "bg-red-600/90 border-red-500/30 shadow-red-900/15"
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${toast.type === "success" ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"
                }`}>
                {toast.type === "success" ? "✨" : "⚠️"}
              </div>
              <div className="flex-1 pr-2">
                <p className="leading-tight">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
