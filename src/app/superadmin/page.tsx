"use client";

import { motion } from "framer-motion";
import { 
  Store, 
  TrendingUp, 
  Activity, 
  PlusCircle,
  Package
} from "lucide-react";
import { useStores, usePlatformStats } from "@/hooks/useSuperAdmin";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = usePlatformStats();
  const { data: stores = [], isLoading: storesLoading } = useStores();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    { 
      label: "Total Stores", 
      value: statsLoading ? "..." : statsData?.totalStores.toString() || "0", 
      icon: Store, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Active Stores", 
      value: statsLoading ? "..." : statsData?.activeStores.toString() || "0", 
      icon: Activity, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Total Products", 
      value: statsLoading ? "..." : statsData?.totalProducts.toLocaleString() || "0", 
      icon: Package, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
    { 
      label: "Total Revenue", 
      value: statsLoading ? "..." : formatCurrency(statsData?.totalRevenue || 0), 
      icon: TrendingUp, 
      color: "text-primary", 
      bg: "bg-primary-soft" 
    },
  ];

  const recentStores = stores.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Platform Overview</h1>
          <p className="text-gray-500 font-medium italic">Monitoring your SaaS restaurant network</p>
        </div>
        <Link 
          href="/superadmin/stores?new=true"
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 text-sm uppercase tracking-widest w-fit self-start md:self-auto"
        >
          <PlusCircle size={20} />
          <span>Create New Store</span>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-start gap-4 min-w-0"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
              <stat.icon size={28} />
            </div>
            <div className="w-full min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-2">{stat.label}</p>
              <p 
                className="text-xl sm:text-2xl lg:text-xl xl:text-3xl font-black text-gray-900 leading-none truncate"
                title={stat.value}
              >
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Recent Activity</h2>
          </div>
          <Link href="/superadmin/stores" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All Stores</Link>
        </div>
        
        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {storesLoading ? (
            <div className="p-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentStores.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-bold">No stores found</div>
          ) : (
            recentStores.map((store) => (
              <div key={store.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{store.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">{store.slug}.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(store.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  {store.isActive ? (
                    <span className="px-4 py-1.5 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>
                  ) : (
                    <span className="px-4 py-1.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase tracking-widest">Inactive</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
