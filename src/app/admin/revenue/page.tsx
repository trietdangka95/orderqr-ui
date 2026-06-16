"use client";

import { useInvoices } from "@/hooks/useInvoices";
import {
  TrendingUp,
  Calendar,
  CreditCard,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  ShoppingBag,
  Filter,
  Trophy,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItemDetail {
  id: string;
  quantity: number;
  priceAtTime: number | string;
  note?: string;
  product?: { name: string; category?: { name: string } };
}

interface OrderDetail {
  id: string;
  createdAt: string;
  status: string;
  orderItems: OrderItemDetail[];
}

interface InvoiceRecord {
  id: string;
  tableNumber: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  timestamp: number;
  orders: OrderDetail[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const toYMD = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const payLabel = (m?: string) => (m === "QR_TRANSFER" ? "QR / CK" : "Tiền mặt");

// ─── Build top-selling items ───────────────────────────────────────────────────
function buildTop(invoices: InvoiceRecord[]) {
  const map: Record<string, { name: string; cat: string; qty: number; rev: number }> = {};
  invoices.forEach((inv) =>
    inv.orders.forEach((ord) =>
      ord.orderItems.forEach((it) => {
        const name = it.product?.name || "Không rõ";
        const cat = (it.product as any)?.category?.name || "—";
        if (!map[name]) map[name] = { name, cat, qty: 0, rev: 0 };
        map[name].qty += it.quantity;
        map[name].rev += it.quantity * Number(it.priceAtTime);
      })
    )
  );
  return Object.values(map).sort((a, b) => b.qty - a.qty);
}

// ─── CSV Export ────────────────────────────────────────────────────────────────
function exportCSV(records: InvoiceRecord[], from: string, to: string) {
  const sep = ",";
  const bom = "\uFEFF";

  const invoiceRows = records.map((inv) => {
    const items = inv.orders
      .flatMap((o) => o.orderItems)
      .map(
        (it) =>
          `${it.quantity}x ${it.product?.name || "Món"} @${Number(it.priceAtTime).toLocaleString("vi-VN")}đ${it.note ? ` (${it.note})` : ""}`
      )
      .join(" | ");
    return [
      `"${inv.id}"`,
      `"${fmtDate(inv.timestamp)}"`,
      `"Bàn ${inv.tableNumber}"`,
      `"${payLabel(inv.paymentMethod)}"`,
      inv.totalAmount,
      `"${items.replace(/"/g, '""')}"`,
    ].join(sep);
  });

  const top = buildTop(records);
  const topRows = top.map((it) =>
    [`"${it.name}"`, `"${it.cat}"`, it.qty, it.rev].join(sep)
  );

  const period =
    from && to ? `Từ ${from} đến ${to}` : from ? `Từ ${from}` : to ? `Đến ${to}` : "Toàn bộ";

  const content = [
    `"BÁO CÁO DOANH THU - ${period}"`,
    "",
    "=== DANH SÁCH HÓA ĐƠN ===",
    `"Mã HĐ","Thời gian","Bàn","Thanh toán","Tổng tiền (VND)","Danh sách món"`,
    ...invoiceRows,
    "",
    "=== TOP MÓN BÁN CHẠY ===",
    `"Tên món","Danh mục","Số lượng","Doanh thu (VND)"`,
    ...topRows,
  ].join("\n");

  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const suffix = from || to ? `_${from || "start"}_${to || "end"}` : "_tatca";
  a.download = `doanh_thu${suffix}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────
function InvoiceModal({ inv, onClose }: { inv: InvoiceRecord; onClose: () => void }) {
  const allItems = inv.orders.flatMap((o) => o.orderItems);
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="bg-gray-900 text-white p-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
              Chi tiết hóa đơn
            </p>
            <h3 className="text-xl font-black">Bàn {inv.tableNumber}</h3>
            <p className="text-gray-400 text-xs mt-1">{fmtDate(inv.timestamp)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                inv.paymentMethod === "QR_TRANSFER"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-green-500/20 text-green-300"
              }`}
            >
              {payLabel(inv.paymentMethod)}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* items */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-1">
          {inv.orders.map((ord, oi) => (
            <div key={ord.id}>
              {inv.orders.length > 1 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 mb-2">
                  Đợt gọi #{oi + 1}
                </p>
              )}
              {ord.orderItems.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {it.product?.name || "Món ăn"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {(it.product as any)?.category?.name && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {(it.product as any).category.name}
                        </span>
                      )}
                      {it.note && (
                        <span className="text-[10px] text-amber-600 italic">
                          📝 {it.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-black text-gray-900 text-sm">
                      {fmt(it.quantity * Number(it.priceAtTime))}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {it.quantity} × {fmt(Number(it.priceAtTime))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* total */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="font-black text-gray-400 text-xs uppercase tracking-widest">
            Tổng cộng ({allItems.reduce((s, i) => s + i.quantity, 0)} món)
          </span>
          <span className="font-black text-2xl text-gray-900">{fmt(inv.totalAmount)}</span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Top Items Sidebar ────────────────────────────────────────────────────────
function TopItems({ invoices }: { invoices: InvoiceRecord[] }) {
  const items = useMemo(() => buildTop(invoices).slice(0, 10), [invoices]);
  const maxQty = items[0]?.qty || 1;

  if (!items.length)
    return (
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[200px]">
        <Trophy size={32} className="text-gray-200" />
        <p className="text-gray-300 text-sm font-medium">Chưa có dữ liệu phân tích</p>
      </div>
    );

  const medals = ["bg-amber-100 text-amber-600", "bg-gray-100 text-gray-500", "bg-orange-50 text-orange-500"];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-400 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
          <Trophy size={18} />
        </div>
        <div>
          <h3 className="font-black text-gray-900">Top món bán chạy</h3>
          <p className="text-gray-400 text-xs font-medium mt-0.5">Theo khoảng thời gian lọc</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.name} className="flex items-start gap-3">
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${
                medals[i] || "bg-gray-50 text-gray-400"
              }`}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-gray-900 text-sm truncate pr-2">{item.name}</span>
                <span className="text-xs font-black text-gray-600 shrink-0 bg-gray-100 px-2 py-0.5 rounded-lg">
                  {item.qty} phần
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.qty / maxQty) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.55, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-primary/50"
                  }`}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">
                {item.cat} · {fmt(item.rev)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RevenuePage() {
  const { data: apiInvoices = [], isLoading } = useInvoices();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedInv, setSelectedInv] = useState<InvoiceRecord | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // normalise API data
  const revenue: InvoiceRecord[] = useMemo(
    () =>
      (apiInvoices as any[]).map((inv) => ({
        ...inv,
        totalAmount: Number(inv.totalAmount),
        timestamp: new Date(inv.createdAt).getTime(),
      })),
    [apiInvoices]
  );

  const filtered = useMemo(() => {
    return revenue.filter((r) => {
      const d = toYMD(r.timestamp);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      if (
        search &&
        !r.tableNumber.includes(search) &&
        !r.id.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [revenue, dateFrom, dateTo, search]);

  const totalRev = useMemo(() => filtered.reduce((s, r) => s + r.totalAmount, 0), [filtered]);
  const todayRev = useMemo(
    () =>
      revenue
        .filter((r) => toYMD(r.timestamp) === toYMD(Date.now()))
        .reduce((s, r) => s + r.totalAmount, 0),
    [revenue]
  );
  const avgOrder = filtered.length ? Math.round(totalRev / filtered.length) : 0;

  const hasFilter = !!(dateFrom || dateTo || search);

  const clearFilters = () => { setDateFrom(""); setDateTo(""); setSearch(""); };

  const toggleRow = (id: string) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const quickDate = (from: string, to: string) => { setDateFrom(from); setDateTo(to); };
  const todayStr = toYMD(Date.now());

  const thisWeekStart = () => {
    const n = new Date();
    const day = n.getDay();
    const mon = new Date(n);
    mon.setDate(n.getDate() - (day === 0 ? 6 : day - 1));
    return toYMD(mon.getTime());
  };

  const thisMonthStart = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
  };

  return (
    <>
      <AnimatePresence>
        {selectedInv && <InvoiceModal inv={selectedInv} onClose={() => setSelectedInv(null)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
              Quản lý Doanh thu
            </h1>
            <p className="text-gray-500 font-medium italic">
              Thống kê, chi tiết đơn hàng và phân tích món bán chạy
            </p>
          </div>
          <button
            onClick={() => exportCSV(filtered, dateFrom, dateTo)}
            className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all shadow-md shadow-green-100 hover:scale-[1.02] active:scale-95 text-sm shrink-0"
          >
            <Download size={18} />
            Xuất báo cáo{hasFilter ? " (đang lọc)" : " (tất cả)"}
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            {
              icon: <TrendingUp size={18} />,
              color: "bg-primary shadow-primary/30",
              label: hasFilter ? "Doanh thu (lọc)" : "Tổng doanh thu",
              value: fmt(totalRev),
              border: "border-orange-50",
              shadow: "shadow-primary/10",
            },
            {
              icon: <Calendar size={18} />,
              color: "bg-blue-500 shadow-blue-200",
              label: "Hôm nay",
              value: fmt(todayRev),
              border: "border-blue-50",
              shadow: "shadow-blue-100/50",
            },
            {
              icon: <CreditCard size={18} />,
              color: "bg-gray-800 shadow-gray-200",
              label: hasFilter ? "Số đơn (lọc)" : "Tổng số đơn",
              value: String(filtered.length),
              border: "border-gray-100",
              shadow: "shadow-gray-100/50",
            },
            {
              icon: <BarChart3 size={18} />,
              color: "bg-purple-500 shadow-purple-200",
              label: "TB / đơn",
              value: fmt(avgOrder),
              border: "border-purple-50",
              shadow: "shadow-purple-100/50",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-white p-6 rounded-[2rem] shadow-xl ${c.shadow} border ${c.border}`}
            >
              <div className={`w-10 h-10 ${c.color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                {c.icon}
              </div>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-1">{c.label}</p>
              <h2 className="text-xl font-black text-gray-900 truncate">{c.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 p-5 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-gray-400 shrink-0">
              <Filter size={15} />
              <span className="text-[10px] font-black uppercase tracking-widest">Lọc</span>
            </div>

            {/* Search */}
            <div className="relative min-w-[160px] flex-1 max-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Bàn / mã HĐ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none text-sm font-medium transition-all"
              />
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">Từ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none text-sm font-medium transition-all"
              />
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">Đến</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none text-sm font-medium transition-all"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Hôm nay", action: () => quickDate(todayStr, todayStr) },
                { label: "Tuần này", action: () => quickDate(thisWeekStart(), todayStr) },
                { label: "Tháng này", action: () => quickDate(thisMonthStart(), todayStr) },
                { label: "Tất cả", action: clearFilters },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={b.action}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-black rounded-xl hover:bg-primary hover:border-primary hover:text-white transition-all"
                >
                  {b.label}
                </button>
              ))}
            </div>

            {hasFilter && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-500 text-[11px] font-black rounded-xl hover:bg-red-100 transition-all"
              >
                <X size={12} />
                Xóa lọc
              </button>
            )}
          </div>

          {hasFilter && (
            <p className="text-xs text-gray-400 font-medium mt-3 pl-1">
              Đang hiển thị{" "}
              <span className="font-black text-gray-700">{filtered.length}</span>
              {" "}/ {revenue.length} đơn ·{" "}
              <span className="font-black text-gray-700">{fmt(totalRev)}</span>
            </p>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Invoice table */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
              <ShoppingBag size={18} className="text-primary" />
              <h3 className="font-black text-gray-900">Danh sách hóa đơn</h3>
              <span className="ml-auto text-xs font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                {filtered.length} đơn
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-gray-300 font-medium">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Thời gian", "Bàn", "Thanh toán", "Tổng tiền", ""].map((h) => (
                        <th
                          key={h}
                          className={`px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${
                            h === "Tổng tiền" ? "text-right" : h === "" ? "text-center" : ""
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length > 0 ? (
                      filtered.map((rec) => {
                        const expanded = expandedRows.has(rec.id);
                        const allItems = rec.orders.flatMap((o) => o.orderItems);
                        return (
                          <React.Fragment key={rec.id}>
                            <tr
                              className={`transition-colors cursor-pointer ${
                                expanded ? "bg-orange-50/40" : "hover:bg-gray-50/60"
                              }`}
                              onClick={() => toggleRow(rec.id)}
                            >
                              <td className="px-5 py-4 font-medium text-gray-600 text-sm whitespace-nowrap">
                                {fmtDate(rec.timestamp)}
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                                  Bàn {rec.tableNumber}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider whitespace-nowrap ${
                                    rec.paymentMethod === "QR_TRANSFER"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-green-50 text-green-600"
                                  }`}
                                >
                                  {payLabel(rec.paymentMethod)}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right font-black text-gray-900 whitespace-nowrap">
                                {fmt(rec.totalAmount)}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedInv(rec); }}
                                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                                  >
                                    Xem
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleRow(rec.id); }}
                                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"
                                  >
                                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {expanded && (
                              <tr className="bg-orange-50/20">
                                <td colSpan={5} className="px-5 pb-4 pt-1">
                                  <div className="bg-white border border-orange-100 rounded-2xl p-4 ml-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                                      {allItems.length} món trong đơn
                                    </p>
                                    <div className="space-y-2">
                                      {allItems.map((it) => (
                                        <div key={it.id} className="flex items-start justify-between gap-3 text-sm">
                                          <div className="min-w-0">
                                            <span className="font-bold text-gray-900">
                                              {it.quantity}× {it.product?.name || "Món ăn"}
                                            </span>
                                            {(it.product as any)?.category?.name && (
                                              <span className="text-[10px] text-gray-400 ml-2">
                                                {(it.product as any).category.name}
                                              </span>
                                            )}
                                            {it.note && (
                                              <span className="text-[10px] text-amber-500 ml-2 italic">
                                                📝 {it.note}
                                              </span>
                                            )}
                                          </div>
                                          <span className="font-black text-gray-700 shrink-0">
                                            {fmt(it.quantity * Number(it.priceAtTime))}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Tổng
                                      </span>
                                      <span className="font-black text-primary">
                                        {fmt(rec.totalAmount)}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <ShoppingBag size={40} className="mx-auto mb-3 text-gray-200" />
                          <p className="text-gray-300 italic text-sm">
                            {hasFilter ? "Không có đơn nào trong khoảng lọc" : "Chưa có dữ liệu doanh thu"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top items sidebar */}
          <div className="xl:col-span-1">
            <TopItems invoices={filtered} />
          </div>
        </div>
      </div>
    </>
  );
}
