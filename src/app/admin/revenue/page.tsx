"use client";

import { useInvoices } from "@/hooks/useInvoices";
import { TrendingUp, Calendar, CreditCard, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function RevenuePage() {
  const { data: apiInvoices = [] } = useInvoices();
  const [searchTerm, setSearchTerm] = useState("");

  const revenue = apiInvoices.map(inv => ({
    ...inv,
    totalAmount: Number(inv.totalAmount),
    timestamp: new Date(inv.createdAt).getTime(),
  }));

  const filteredRevenue = revenue.filter(record => 
    record.tableNumber.includes(searchTerm) || 
    record.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = revenue.reduce((sum, r) => sum + r.totalAmount, 0);
  const todayRevenue = revenue
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Mã hóa đơn",
      "Thời gian",
      "Bàn ăn",
      "Danh sách chi tiết món ăn",
      "Tổng tiền (VND)",
      "Trạng thái"
    ];

    const rows = filteredRevenue.map(record => {
      const itemsDetail = record.orders
        ?.flatMap((order: any) => order.orderItems || [])
        ?.map((item: any) => `${item.quantity}x ${item.product?.name || 'Món ăn'} (${Number(item.priceAtTime).toLocaleString('vi-VN')}₫)`)
        ?.join("; ") || "";

      return [
        record.id,
        formatDate(record.timestamp),
        `Bàn ${record.tableNumber}`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        record.totalAmount,
        "Đã hoàn tất"
      ];
    });

    const csvContent = 
      "\uFEFF" + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Quản lý Doanh thu</h1>
          <p className="text-gray-500 font-medium italic">Thống kê doanh số và lịch sử đơn hàng đã hoàn tất</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all shadow-md shadow-green-100 hover:scale-[1.02] active:scale-95 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Xuất báo cáo Excel
        </button>
      </header>

      <main className="py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-orange-100/50 border border-orange-50"
          >
            <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
              <TrendingUp size={24} />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Tổng doanh thu</p>
            <h2 className="text-3xl font-black text-gray-900">{formatPrice(totalRevenue)}</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-100/50 border border-blue-50"
          >
            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <Calendar size={24} />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Hôm nay</p>
            <h2 className="text-3xl font-black text-gray-900">{formatPrice(todayRevenue)}</h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100"
          >
            <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-200">
              <CreditCard size={24} />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Tổng số đơn</p>
            <h2 className="text-3xl font-black text-gray-900">{revenue.length}</h2>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Tìm theo số bàn hoặc mã hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] focus:border-orange-500 outline-none transition-all shadow-xl shadow-gray-200/50 text-gray-700 font-medium"
          />
        </div>

        {/* Revenue Table */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Bàn</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Mã hóa đơn</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRevenue.length > 0 ? (
                  filteredRevenue.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 font-medium text-gray-600 text-sm">{formatDate(record.timestamp)}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-black text-xs">
                          Bàn {record.tableNumber}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-gray-400">{record.id}</td>
                      <td className="px-8 py-6 text-right font-black text-gray-900">{formatPrice(record.totalAmount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-300 italic">
                      Chưa có dữ liệu doanh thu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
