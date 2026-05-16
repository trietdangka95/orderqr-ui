"use client";


import {
  LayoutDashboard,
  Settings,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import AdminStatCard from "./components/AdminStatCard";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useInvoices } from "@/hooks/useInvoices";
export default function AdminDashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders();
  const { data: invoices = [] } = useInvoices();

  const totalRevenue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

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
          bgClass="bg-orange-50"
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
              <div className="md:col-span-3">
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-[0.3em] mb-6 text-center md:text-left">Cập nhật thời gian thực</p>
              </div>
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

      {/* Recent Activity - Full Width Row */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Hóa đơn gần đây</h2>
          </div>
          <Link href="/admin/revenue" className="text-sm font-bold text-blue-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {invoices.length > 0 ? (
              invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">Bàn {invoice.tableNumber}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(invoice.createdAt).toLocaleDateString("vi-VN")} • {new Date(invoice.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(invoice.totalAmount)}
                    </p>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Đã thanh toán</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400 italic">
                Chưa có hóa đơn nào được xuất.
              </div>
            )}
          </div>
        </div>
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
