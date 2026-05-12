"use client";

import { useCartStore } from "@/store/cartStore";
import {
  Soup,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Users,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { logout, orders, adminMenu } = useCartStore();

  const menuItems = [
    {
      title: "Quản lý Bếp",
      description: "Xem và xử lý các đơn hàng đang chờ chế biến",
      icon: Soup,
      href: "/admin/kitchen",
      color: "bg-orange-500",
      stats: `${orders.filter(o => o.status === "pending" || o.status === "cooking").length} đơn đang chờ`
    },
    {
      title: "Quản lý Bàn",
      description: "Theo dõi trạng thái bàn và thanh toán hóa đơn",
      icon: LayoutDashboard,
      href: "/admin/tables",
      color: "bg-blue-500",
      stats: `${new Set(orders.map(o => o.tableNumber)).size} bàn đang dùng`
    },
    {
      title: "Quản lý Thực đơn",
      description: "Thêm, sửa, xóa các món ăn trong menu",
      icon: Settings,
      href: "/admin/menu",
      color: "bg-purple-500",
      stats: `${adminMenu.length} món ăn`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-gray-500 font-medium">Chào mừng trở lại, Quản trị viên</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-500 font-bold rounded-2xl shadow-sm border border-red-50 hover:bg-red-50 transition-all active:scale-95 w-fit"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <div className="text-2xl font-black text-gray-800">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(orders.reduce((sum, o) => sum + o.totalPrice, 0))}
            </div>
            <div className="text-sm text-gray-500 font-medium">Doanh thu tạm tính</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag size={20} />
            </div>
            <div className="text-2xl font-black text-gray-800">{orders.length}</div>
            <div className="text-sm text-gray-500 font-medium">Tổng số đơn hàng</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Users size={20} />
            </div>
            <div className="text-2xl font-black text-gray-800">{new Set(orders.map(o => o.tableNumber)).size}</div>
            <div className="text-sm text-gray-500 font-medium">Bàn đang phục vụ</div>
          </div>
        </div>

        {/* Main Menu Sections */}
        <div className="grid grid-cols-1 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all flex items-center gap-6"
              >
                <div className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <item.icon size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h2>
                  <p className="text-gray-500 text-sm font-medium">{item.description}</p>
                  <div className="mt-3 inline-block px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {item.stats}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                  <ChevronRight size={24} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Quay lại trang Menu khách hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
