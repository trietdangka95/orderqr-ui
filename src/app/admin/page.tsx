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

import AdminStatCard from "./components/AdminStatCard";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useInvoices } from "@/hooks/useInvoices";

function RevenueLineChart({ invoices }: { invoices: any[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const last7DaysData = useMemo(() => {
    const dataMap: { [key: string]: number } = {};

    // Khởi tạo 7 ngày gần nhất
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      dataMap[dateStr] = 0;
    }

    // Cộng dồn doanh thu
    invoices.forEach((inv) => {
      const dateStr = new Date(inv.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      if (dataMap[dateStr] !== undefined) {
        dataMap[dateStr] += inv.totalAmount;
      }
    });

    return Object.entries(dataMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [invoices]);

  const maxRevenue = useMemo(() => {
    const vals = last7DaysData.map((d) => d.revenue);
    return Math.max(...vals, 100000); // Tối thiểu 100k để tránh chia cho 0
  }, [last7DaysData]);

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
    return last7DaysData.map((d, i) => {
      const x = paddingLeft + (i * (chartWidth / (last7DaysData.length - 1)));
      const y = paddingTop + chartHeight - (d.revenue / maxRevenue * chartHeight);
      return { x, y, date: d.date, revenue: d.revenue };
    });
  }, [last7DaysData, chartWidth, chartHeight, paddingLeft, paddingTop, maxRevenue]);

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

  return (
    <div className="relative w-full bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 hover:border-orange-200 transition-all">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-wider">Doanh thu quán</h3>
            <p className="text-gray-400 text-xs font-medium mt-0.5">Biểu đồ doanh thu 7 ngày gần nhất</p>
          </div>
        </div>
        <Link 
          href="/admin/revenue" 
          className="text-xs font-black text-primary hover:text-orange-600 bg-primary-soft hover:bg-primary/20 px-4 py-2 rounded-xl transition-all select-none uppercase tracking-wider"
        >
          Xem chi tiết &rarr;
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
                Ngày {points[hoveredIdx].date}
              </span>
              <span className="font-black text-orange-400 text-sm mt-1">
                {points[hoveredIdx].revenue.toLocaleString("vi-VN")} ₫
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
            const sliceWidth = chartWidth / (points.length - 1);
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

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Hệ thống Quản trị</h1>
        <p className="text-gray-500 font-medium italic">Monitoring and managing your restaurant operations</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <AdminStatCard
          href="/admin/revenue"
          icon={TrendingUp}
          value={new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevenue)}
          label="Doanh thu tổng"
          colorClass="text-green-500"
          bgClass="bg-green-50"
        />
        <AdminStatCard
          href="/admin/revenue"
          icon={ShoppingBag}
          value={invoices.length}
          label="Hóa đơn đã xuất"
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <AdminStatCard
          href="/admin/tables"
          icon={LayoutDashboard}
          value={new Set(orders.map(o => o.tableNumber)).size}
          label="Bàn đang phục vụ"
          colorClass="text-orange-500"
          bgClass="bg-primary-soft"
        />
        <AdminStatCard
          href="/admin/menu"
          icon={Settings}
          value={products.length}
          label="Món ăn trong Menu"
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
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Trạng thái quán</h2>
            </div>
            <span className="text-xs font-bold text-purple-600 group-hover:underline">Xem tất cả</span>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group-hover:border-purple-300 transition-all">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex justify-between items-center pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 px-4">
                <span className="text-gray-500 font-bold text-sm">Đang chờ xác nhận</span>
                <span className="font-black text-3xl text-orange-500">{orders.filter(o => o.status === "PENDING").length}</span>
              </div>
              <div className="flex justify-between items-center pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 px-4">
                <span className="text-gray-500 font-bold text-sm">Đang chế biến</span>
                <span className="font-black text-3xl text-blue-600">{orders.filter(o => o.status === "COOKING").length}</span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-gray-500 font-bold text-sm">Đang phục vụ</span>
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
        <RevenueLineChart 
          invoices={useMemo(() => invoices.map((inv: any) => ({
            ...inv,
            totalAmount: Number(inv.totalAmount)
          })), [invoices])} 
        />
      </div>

      <div className="mt-12 text-center pb-12">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          Quay lại trang Menu khách hàng
        </Link>
      </div>
    </div>
  );
}
