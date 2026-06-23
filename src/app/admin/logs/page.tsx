"use client";

import { useAuditLogs } from "@/hooks/useOrders";
import { ClipboardList, Search, User, Clock, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cartStore";

export default function LogsPage() {
  const t = useTranslation();
  const { language } = useCartStore();
  const { data: logs = [], isLoading } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(log => 
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const locale = language === "vi" ? "vi-VN" : "en-US";
    return new Date(dateStr).toLocaleString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "CANCEL_ORDER":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full font-black text-[10px] uppercase tracking-wider">
            {t.logs.actionCancelOrder}
          </span>
        );
      case "DELETE_ITEM":
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full font-black text-[10px] uppercase tracking-wider">
            {t.logs.actionDeleteItem}
          </span>
        );
      case "UPDATE_ITEM_QUANTITY":
        return (
          <span className="px-3 py-1 bg-primary-soft text-orange-700 border border-orange-200 rounded-full font-black text-[10px] uppercase tracking-wider">
            {t.logs.actionUpdateQty}
          </span>
        );
      case "CHECKOUT":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full font-black text-[10px] uppercase tracking-wider">
            {t.logs.actionCheckout}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full font-black text-[10px] uppercase tracking-wider">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{t.logs.title}</h1>
        <p className="text-gray-500 font-medium italic">{t.logs.subtitle}</p>
      </header>

      <main className="py-2">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100"
          >
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-200">
              <ClipboardList size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{t.logs.totalActivities}</p>
            <h2 className="text-3xl font-black text-gray-900">{logs.length}</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-red-50/50 border border-red-50"
          >
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-200">
              <AlertCircle size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{t.logs.deleteOrCancel}</p>
            <h2 className="text-3xl font-black text-gray-900">
              {logs.filter(l => l.action === "DELETE_ITEM" || l.action === "CANCEL_ORDER").length}
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-orange-50/50 border border-orange-50"
          >
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary">
              <Clock size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{t.logs.quantityEdits}</p>
            <h2 className="text-3xl font-black text-gray-900">
              {logs.filter(l => l.action === "UPDATE_ITEM_QUANTITY").length}
            </h2>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder={t.logs.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] focus:border-orange-500 outline-none transition-all shadow-xl shadow-gray-200/50 text-gray-700 font-medium"
          />
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium italic">{t.logs.loadingLogs}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t.logs.headerTime}</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t.common.staff}</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t.logs.headerAction}</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">{t.logs.headerDetails}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-medium text-gray-600 text-sm whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shadow-inner">
                              <User size={14} />
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{log.user?.username || "Hệ thống"}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-400 flex-shrink-0" />
                            <span>{log.details}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-300 italic">
                        {t.logs.noMatchingLogs}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
