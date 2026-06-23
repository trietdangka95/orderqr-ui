"use client";

// Refined Admin Dashboard - Latest version


import {
  LayoutDashboard,
  Settings,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FILTER_PRESETS, FilterType } from "@/constants/filters";

import AdminStatCard from "./components/AdminStatCard";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useInvoices } from "@/hooks/useInvoices";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils/currency";

function RevenueLineChart({ invoices }: { invoices: any[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const t = useTranslation();
  const { storeConfig, language } = useCartStore();

  const chartData = useMemo(() => {
    if (invoices.length === 0) {
      // Mặc định: 7 ngày gần nhất với doanh thu = 0
      const dataMap: { [key: string]: number } = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        dataMap[dateStr] = 0;
      }
      return Object.entries(dataMap).map(([date, revenue]) => ({ date, revenue }));
    }

    const timestamps = invoices.map(inv => new Date(inv.createdAt).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps, Date.now());
    const diffDays = Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24));

    if (diffDays <= 31) {
      // Gom nhóm theo Ngày
      const dataMap: { [key: string]: number } = {};
      const start = new Date(minTime);
      const end = new Date(maxTime);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const current = new Date(start);
      let safetyCount = 0;
      while (current <= end && safetyCount < 50) {
        const dateStr = current.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        dataMap[dateStr] = 0;
        current.setDate(current.getDate() + 1);
        safetyCount++;
      }

      invoices.forEach((inv) => {
        const dateStr = new Date(inv.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        if (dataMap[dateStr] !== undefined) {
          dataMap[dateStr] += inv.totalAmount;
        }
      });

      return Object.entries(dataMap).map(([date, revenue]) => ({ date, revenue }));
    } else if (diffDays <= 366) {
      // Gom nhóm theo Tháng
      const dataMap: { [key: string]: number } = {};
      const start = new Date(minTime);
      const end = new Date(maxTime);
      
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      const final = new Date(end.getFullYear(), end.getMonth(), 1);
      
      let safetyCount = 0;
      while (current <= final && safetyCount < 24) {
        const dateStr = `T${current.getMonth() + 1}/${String(current.getFullYear()).slice(-2)}`;
        dataMap[dateStr] = 0;
        current.setMonth(current.getMonth() + 1);
        safetyCount++;
      }

      invoices.forEach((inv) => {
        const d = new Date(inv.createdAt);
        const dateStr = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
        if (dataMap[dateStr] !== undefined) {
          dataMap[dateStr] += inv.totalAmount;
        }
      });

      return Object.entries(dataMap).map(([date, revenue]) => ({ date, revenue }));
    } else {
      // Gom nhóm theo Năm
      const dataMap: { [key: string]: number } = {};
      const startYear = new Date(minTime).getFullYear();
      const endYear = new Date(maxTime).getFullYear();
      
      let safetyCount = 0;
      for (let yr = startYear; yr <= endYear && safetyCount < 20; yr++) {
        dataMap[yr.toString()] = 0;
        safetyCount++;
      }

      invoices.forEach((inv) => {
        const yrStr = new Date(inv.createdAt).getFullYear().toString();
        if (dataMap[yrStr] !== undefined) {
          dataMap[yrStr] += inv.totalAmount;
        }
      });

      return Object.entries(dataMap).map(([date, revenue]) => ({ date, revenue }));
    }
  }, [invoices]);

  const maxRevenue = useMemo(() => {
    const vals = chartData.map((d) => d.revenue);
    return Math.max(...vals, 100000); // Tối thiểu 100k để tránh chia cho 0
  }, [chartData]);

  // Kích thước SVG
  const width = 800;
  const height = 300;
  const paddingLeft = 80;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = useMemo(() => {
    return chartData.map((d, i) => {
      const divisor = chartData.length > 1 ? chartData.length - 1 : 1;
      const x = chartData.length > 1
        ? paddingLeft + (i * (chartWidth / divisor))
        : paddingLeft + chartWidth / 2;
      const y = paddingTop + chartHeight - (d.revenue / maxRevenue * chartHeight);
      return { x, y, date: d.date, revenue: d.revenue };
    });
  }, [chartData, chartWidth, chartHeight, paddingLeft, paddingTop, maxRevenue]);

  // Hàm sinh đường cong Bezier mượt
  const getBezierCurve = (pts: typeof points) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curveD = useMemo(() => getBezierCurve(points), [points]);
  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    return `${curveD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }, [points, curveD, paddingTop, chartHeight]);

  const gridRatios = [0, 0.25, 0.5, 0.75, 1];

  const fmtShort = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "k";
    return n.toString();
  };

  const getSubtitle = () => {
    const timestamps = invoices.map(inv => new Date(inv.createdAt).getTime());
    if (timestamps.length === 0) return t.admin.revenueSubtitleDefault;
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps, Date.now());
    const diffDays = Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24));
    if (diffDays <= 31) return t.admin.revenueSubtitleDay;
    if (diffDays <= 366) return t.admin.revenueSubtitleMonth;
    return t.admin.revenueSubtitleYear;
  };

  return (
    <div className="relative w-full bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 hover:border-orange-200 transition-all">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-wider">{t.admin.revenueTitle}</h3>
            <p className="text-gray-400 text-xs font-medium mt-0.5">{getSubtitle()}</p>
          </div>
        </div>
        <Link 
          href="/admin/revenue" 
          className="text-xs font-black text-primary hover:text-orange-600 bg-primary-soft hover:bg-primary/20 px-4 py-2 rounded-xl transition-all select-none uppercase tracking-wider"
        >
          {t.admin.viewDetails} &rarr;
        </Link>
      </div>

      <div className="relative w-full h-[320px]">
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredIdx !== null && points[hoveredIdx] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bg-gray-900/95 backdrop-blur-md text-white border border-gray-800 px-4 py-3 rounded-2xl shadow-xl flex flex-col pointer-events-none transition-all duration-200 z-10 text-xs text-center"
              style={{
                left: `${(points[hoveredIdx].x / width) * 100}%`,
                top: `${(points[hoveredIdx].y / height) * 100 - 10}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t.admin.chartPoint.replace("{date}", points[hoveredIdx].date)}
              </span>
              <span className="font-black text-orange-400 text-sm mt-1">
                {formatPrice(points[hoveredIdx].revenue, storeConfig, language)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridRatios.map((ratio, idx) => {
            const val = maxRevenue * ratio;
            const y = paddingTop + chartHeight - (ratio * chartHeight);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray={idx === 0 ? "0" : "6 6"}
                />
                <text
                  x={paddingLeft - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-black fill-gray-400"
                >
                  {fmtShort(val)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 15}
              textAnchor="middle"
              className="text-[10px] font-black fill-gray-400"
            >
              {p.date}
            </text>
          ))}

          {/* Area fill */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#chartGradient)"
            />
          )}

          {/* Curved Line */}
          {curveD && (
            <path
              d={curveD}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical Guide line */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <line
              x1={points[hoveredIdx].x}
              y1={paddingTop}
              x2={points[hoveredIdx].x}
              y2={paddingTop + chartHeight}
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-40"
            />
          )}

          {/* Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 7 : 4}
              fill={hoveredIdx === idx ? "#f97316" : "#ffffff"}
              stroke="#f97316"
              strokeWidth={hoveredIdx === idx ? 4 : 2.5}
              className="transition-all duration-200"
            />
          ))}

          {/* Hover bars */}
          {points.map((p, idx) => {
            const sliceWidth = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;
            const startX = p.x - sliceWidth / 2;
            return (
              <rect
                key={idx}
                x={idx === 0 ? p.x : startX}
                y={paddingTop}
                width={idx === 0 || idx === points.length - 1 ? sliceWidth / 2 : sliceWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: invoices = [] } = useInvoices();
  const t = useTranslation();
  const { storeConfig, language } = useCartStore();

  const [filterType, setFilterType] = useState<FilterType>("ALL_TIME");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const filteredInvoices = useMemo(() => {
    const getStartOfWeek = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday.getTime();
    };

    const getStartOfToday = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const getStartOfMonth = () => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    };

    const getStartOfYear = () => {
      const d = new Date();
      return new Date(d.getFullYear(), 0, 1).getTime();
    };

    const startOfToday = getStartOfToday();
    const startOfWeek = getStartOfWeek();
    const startOfMonth = getStartOfMonth();
    const startOfYear = getStartOfYear();

    return invoices.map((inv: any) => ({
      ...inv,
      totalAmount: Number(inv.totalAmount),
      timestamp: new Date(inv.createdAt).getTime(),
    })).filter((inv: any) => {
      if (filterType === "ALL_TIME") return true;
      if (filterType === "TODAY") return inv.timestamp >= startOfToday;
      if (filterType === "THIS_WEEK") return inv.timestamp >= startOfWeek;
      if (filterType === "THIS_MONTH") return inv.timestamp >= startOfMonth;
      if (filterType === "THIS_YEAR") return inv.timestamp >= startOfYear;
      if (filterType === "CUSTOM") {
        const tYMD = (ts: number) => {
          const d = new Date(ts);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        };
        const dStr = tYMD(inv.timestamp);
        if (customFrom && dStr < customFrom) return false;
        if (customTo && dStr > customTo) return false;
        return true;
      }
      return true;
    });
  }, [invoices, filterType, customFrom, customTo]);

  const totalRevenue = useMemo(() => {
    return filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  }, [filteredInvoices]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{t.admin.systemTitle}</h1>
          <p className="text-gray-500 font-medium italic">{t.admin.systemSubtitle}</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200 w-fit self-start">
          {FILTER_PRESETS.map((btn) => {
            const getFilterLabel = (id: typeof btn.id) => {
              if (id === "ALL_TIME") return t.admin.filterAllTime;
              if (id === "TODAY") return t.admin.filterToday;
              if (id === "THIS_WEEK") return t.admin.filterThisWeek;
              if (id === "THIS_MONTH") return t.admin.filterThisMonth;
              if (id === "THIS_YEAR") return t.admin.filterThisYear;
              if (id === "CUSTOM") return t.admin.filterCustom;
              return btn.label;
            };
            return (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === btn.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {getFilterLabel(btn.id)}
              </button>
            );
          })}
        </div>
      </header>

      {/* Custom Date Inputs if CUSTOM filter type is active */}
      {filterType === "CUSTOM" && (
        <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm mb-12 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.admin.fromDate}</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:outline-none text-xs font-bold text-gray-700 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.admin.toDate}</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:outline-none text-xs font-bold text-gray-700 transition-all"
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 md:mb-12">
        <AdminStatCard
          href="/admin/revenue"
          icon={TrendingUp}
          value={formatPrice(totalRevenue, storeConfig, language)}
          label={t.admin.totalRevenue}
          colorClass="text-green-500"
          bgClass="bg-green-50"
        />
        <AdminStatCard
          href="/admin/revenue"
          icon={ShoppingBag}
          value={filteredInvoices.length}
          label={t.admin.issuedInvoices}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <AdminStatCard
          href="/admin/tables"
          icon={LayoutDashboard}
          value={new Set(orders.map(o => o.tableNumber)).size}
          label={t.admin.activeTables}
          colorClass="text-orange-500"
          bgClass="bg-primary-soft"
        />
        <AdminStatCard
          href="/admin/menu"
          icon={Settings}
          value={products.length}
          label={t.admin.menuItemsCount}
          colorClass="text-purple-500"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Quick Info / Store Status - Full Width Row */}
      <div className="mb-12">
        <Link href="/admin/kitchen" className="block group">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">{t.admin.storeStatusTitle}</h2>
            </div>
            <span className="text-xs font-bold text-purple-600 group-hover:underline">{t.admin.viewAll}</span>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group-hover:border-purple-300 transition-all">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex justify-between items-center pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 px-4">
                <span className="text-gray-500 font-bold text-sm">{t.admin.pendingConfirm}</span>
                <span className="font-black text-3xl text-orange-500">{orders.filter(o => o.status === "PENDING").length}</span>
              </div>
              <div className="flex justify-between items-center pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 px-4">
                <span className="text-gray-500 font-bold text-sm">{t.admin.cooking}</span>
                <span className="font-black text-3xl text-blue-600">{orders.filter(o => o.status === "COOKING").length}</span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold text-sm">{t.admin.serving}</span>
                <span className="font-black text-3xl text-green-600">{orders.filter(o => o.status === "SERVING").length}</span>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] group-hover:scale-110 transition-all text-gray-900">
              <LayoutDashboard size={160} />
            </div>
          </div>
        </Link>
      </div>

      {/* Revenue Chart - Full Width Row */}
      <div className="mb-12">
        <RevenueLineChart invoices={filteredInvoices} />
      </div>

      <div className="mt-12 text-center pb-12">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {t.admin.backToMenu}
        </Link>
      </div>
    </div>
  );
}
