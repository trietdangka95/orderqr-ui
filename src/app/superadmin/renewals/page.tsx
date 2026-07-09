"use client";
 
import { useState } from "react";
import { showConfirm, showAlert } from "@/store/dialogStore";
import { useRenewalRequests, useApproveRenewalRequest, useRejectRenewalRequest, useBankConfig, useSaveBankConfig } from "@/hooks/useRenewals";
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
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cartStore";
import { translateApiError } from "@/utils/apiError";
 
const RENEWAL_STATUS_TABS = [
  { id: "PENDING" },
  { id: "APPROVED" },
  { id: "REJECTED" },
  { id: "ALL" },
] as const;

export default function SuperAdminRenewalsPage() {
  const t = useTranslation();
  const { language } = useCartStore();
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const isMounted = useIsMounted();
  const { data: requests = [], isLoading } = useRenewalRequests();
  const approveMutation = useApproveRenewalRequest();
  const rejectMutation = useRejectRenewalRequest();
  const { data: bankConfig } = useBankConfig();
  const saveBankConfigMutation = useSaveBankConfig();
 
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankId, setBankId] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [premiumPrice, setPremiumPrice] = useState<number>(599000);
 
  if (!isMounted) return null;

  const getStatusLabel = (status: "ALL" | "PENDING" | "APPROVED" | "REJECTED") => {
    if (status === "ALL") return t.logs.actionAll;
    if (status === "APPROVED") return t.billing.historyStatusApproved;
    if (status === "REJECTED") return t.billing.historyStatusRejected;
    return t.superadmin.statusPending;
  };
 
  const filteredRequests = requests.filter(req => {
    if (activeTab === "ALL") return true;
    return req.status === activeTab;
  });
 
  const handleApprove = async (id: string, storeName: string, months: number) => {
    if (await showConfirm(t.superadmin.approveRenewalConfirm.replace("{months}", String(months)).replace("{store}", storeName))) {
      approveMutation.mutate(id, {
        onSuccess: () => {
          showAlert(t.superadmin.renewalApproved);
        },
        onError: (err: any) => {
          showAlert(translateApiError(err, t, t.superadmin.approvalFailed));
        }
      });
    }
  };
 
  const handleReject = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
  };
 
  const submitReject = async () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      showAlert(t.superadmin.rejectReasonRequired);
      return;
    }
 
    rejectMutation.mutate({
      id: rejectingId,
      notes: rejectReason.trim()
    }, {
      onSuccess: () => {
        setRejectingId(null);
        setRejectReason("");
        showAlert(t.superadmin.renewalRejected);
      },
      onError: (err: any) => {
        showAlert(translateApiError(err, t, t.superadmin.rejectionFailed));
      }
    });
  };
 
  const handleOpenBankModal = () => {
    setBankId(bankConfig?.bankId || "MB");
    setBankAccountNo(bankConfig?.bankAccountNo || "123456789");
    setBankAccountName(bankConfig?.bankAccountName || "PLATFORM OWNER");
    setPremiumPrice(bankConfig?.premiumPrice || 599000);
    setIsBankModalOpen(true);
  };
 
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{t.superadmin.renewalsTitle}</h1>
          <p className="text-gray-500 font-medium italic">{t.superadmin.renewalsSubtitle}</p>
        </div>
        <button
          onClick={handleOpenBankModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <CreditCard size={18} />
          {t.superadmin.configureReceivingAccount}
        </button>
      </div>
 
      {/* Tab Filter */}
      <div className="flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl border border-gray-200/50 shadow-sm w-fit gap-1">
        {RENEWAL_STATUS_TABS.map((tab) => {
          const count = tab.id === "ALL" 
            ? requests.length 
            : requests.filter(r => r.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-white shadow-sm text-blue-600 font-black" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/40"
              }`}
            >
              {getStatusLabel(tab.id)}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black transition-colors ${
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-600" 
                  : "bg-gray-200 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
 
      {isLoading ? (
        <div className="text-center font-bold text-gray-400 py-20 animate-pulse">
          {t.superadmin.loadingRenewals}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center text-gray-400 italic">
          {t.superadmin.renewalsEmpty}
        </div>
      ) : (
        <>
          {/* Mobile Card List View (below md) */}
          <div className="md:hidden space-y-4">
            {filteredRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Store size={18} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 leading-tight">
                        {req.store?.name || t.superadmin.hiddenStore}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {t.superadmin.slugLabel}: {req.store?.slug || t.common.notAvailable}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    req.status === "APPROVED" 
                      ? "bg-green-100 text-green-700" 
                      : req.status === "REJECTED" 
                      ? "bg-red-100 text-red-700" 
                      : "bg-amber-100 text-amber-700 animate-pulse"
                  }`}>
                    {getStatusLabel(req.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50 text-left text-xs font-semibold">
                  <div>
                    <span className="text-gray-400 block mb-0.5">{t.superadmin.plan}</span>
                    <span className="text-gray-800 font-bold">
                      {t.superadmin.premiumPlanName} (+{req.months} {req.notes?.includes('[TEST_MINUTES]') ? t.superadmin.minsUnit : t.superadmin.monthsUnit})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">{t.superadmin.amountTransferred}</span>
                    <span className="text-primary font-black">{Number(req.price).toLocaleString(locale)} ₫</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5">{t.billing.historyHeaderDate}</span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      {new Date(req.createdAt).toLocaleDateString(locale)} {new Date(req.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {req.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-400 block mb-0.5">{t.superadmin.requestNotes}</span>
                      <span className="text-gray-500 italic block bg-gray-50 p-2.5 rounded-xl border border-gray-100/60 leading-normal">{req.notes}</span>
                    </div>
                  )}
                </div>

                {req.status === "PENDING" ? (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => handleApprove(req.id, req.store?.name || t.superadmin.storeName, req.months)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 text-xs shadow-md shadow-green-100"
                    >
                      <Check size={16} />
                      {t.billing.historyStatusApproved}
                    </button>
                    <button
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => handleReject(req.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 text-xs shadow-md shadow-red-100"
                    >
                      <X size={16} />
                      {t.billing.historyStatusRejected}
                    </button>
                  </div>
                ) : (
                  <div className="text-center pt-2 border-t border-gray-50 text-xs text-gray-400 italic">
                    {t.superadmin.processed}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-medium">
                <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">{t.superadmin.storeName}</th>
                    <th className="px-6 py-4">{t.superadmin.plan}</th>
                    <th className="px-6 py-4">{t.billing.historyHeaderAmount}</th>
                    <th className="px-6 py-4">{t.billing.historyHeaderDate}</th>
                    <th className="px-6 py-4">{t.superadmin.requestNotes}</th>
                    <th className="px-6 py-4">{t.superadmin.statusLabel}</th>
                    <th className="px-6 py-4 text-right">{t.common.actions}</th>
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
                              {req.store?.name || t.superadmin.hiddenStore}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                              {t.superadmin.slugLabel}: {req.store?.slug || t.common.notAvailable}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-gray-800">{t.superadmin.premiumPlanName}</span>
                          <span className="text-xs text-gray-400 block font-bold mt-0.5">
                            +{req.months} {req.notes?.includes('[TEST_MINUTES]') ? t.superadmin.minsUnit : t.superadmin.monthsUnit} {t.superadmin.usageSuffix}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-primary">
                          {Number(req.price).toLocaleString(locale)} ₫
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                          <Calendar size={12} className="text-gray-400 shrink-0" />
                          <span>{new Date(req.createdAt).toLocaleDateString(locale)}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <Clock size={12} className="text-gray-400 shrink-0" />
                          <span>{new Date(req.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5 max-w-xs text-xs italic text-gray-500">
                          <MessageSquare size={13} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{req.notes || t.common.noNotes}</span>
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
                          {getStatusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => handleApprove(req.id, req.store?.name || t.superadmin.storeName, req.months)}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center gap-1 text-xs shadow-md shadow-green-100"
                              title={t.superadmin.approveRenewal}
                            >
                              <Check size={16} />
                              {t.billing.historyStatusApproved}
                            </button>
                            <button
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              onClick={() => handleReject(req.id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded-xl transition-all active:scale-[0.9] flex items-center justify-center gap-1 text-xs shadow-md shadow-red-100"
                              title={t.superadmin.rejectRequest}
                            >
                              <X size={16} />
                              {t.billing.historyStatusRejected}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">{t.superadmin.processed}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
 
      {/* Reject Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" />
                <h3 className="font-bold text-lg text-gray-900">{t.superadmin.rejectModalTitle}</h3>
              </div>
              <button 
                onClick={() => setRejectingId(null)} 
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
 
            <div className="p-6 space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase block">{t.superadmin.rejectReasonLabel}</label>
              <textarea
                placeholder={t.superadmin.rejectReasonPlaceholder}
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
                {t.common.cancel}
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
                    {t.superadmin.confirmRejection}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Bank Settings Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="text-blue-500" />
                <h3 className="font-bold text-lg text-gray-900">{t.superadmin.bankConfigTitle}</h3>
              </div>
              <button 
                onClick={() => setIsBankModalOpen(false)} 
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
 
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase block">{t.superadmin.bankIdLabel}</label>
                <input
                  type="text"
                  placeholder={t.superadmin.bankIdPlaceholder}
                  value={bankId}
                  onChange={(e) => setBankId(e.target.value.toUpperCase())}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
 
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase block">{t.superadmin.accountNumberLabel}</label>
                <input
                  type="text"
                  placeholder={t.superadmin.bankAccountNumberPlaceholder}
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
 
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase block">{t.superadmin.accountHolderLabel}</label>
                <input
                  type="text"
                  placeholder={t.superadmin.accountHolderPlaceholder}
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase block">{t.superadmin.premiumPriceLabel}</label>
                <input
                  type="number"
                  placeholder={t.superadmin.premiumPricePlaceholder}
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
 
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
              >
                {t.common.cancel}
              </button>
              <button
                disabled={saveBankConfigMutation.isPending}
                onClick={async () => {
                  if (!bankId.trim() || !bankAccountNo.trim() || !bankAccountName.trim()) {
                    showAlert(t.superadmin.accountDetailsRequired);
                    return;
                  }
                  saveBankConfigMutation.mutate({
                    bankId: bankId.trim(),
                    bankAccountNo: bankAccountNo.trim(),
                    bankAccountName: bankAccountName.trim(),
                    premiumPrice: premiumPrice,
                  }, {
                    onSuccess: () => {
                      setIsBankModalOpen(false);
                      showAlert(t.superadmin.configUpdated);
                    },
                    onError: (err: any) => {
                      showAlert(translateApiError(err, t, t.superadmin.updateFailed));
                    }
                  });
                }}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {saveBankConfigMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    {t.billing.saveBankConfig}
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
