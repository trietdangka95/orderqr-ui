"use client";

import AdminGuard from "@/components/admin/AdminGuard";
import { 
  LayoutDashboard, 
  Store, 
  Soup, 
  TrendingUp, 
  Settings, 
  Users, 
  LogOut,
  Menu,
  ClipboardList,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userRole, storeConfig } = useCartStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
  const getRemainingDays = () => {
    if (!storeConfig?.subscriptionEnd) return Infinity; // null = no expiry set
    const end = new Date(storeConfig.subscriptionEnd).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };
 
  const daysLeft = getRemainingDays();
  const isExpired = storeConfig?.subscriptionEnd != null && new Date() > new Date(storeConfig.subscriptionEnd);
  const isSuspended = storeConfig?.subscriptionStatus === 'EXPIRED' || isExpired;
  const showWarning = storeConfig?.subscriptionEnd != null && (daysLeft > 0 && daysLeft <= 3);
  const isBillingPath = pathname === "/admin/billing";
 
  if (userRole === "kitchen") {
    return (
      <AdminGuard>
        <div className="h-screen overflow-hidden bg-gray-50 p-6 md:p-8 flex flex-col">
          {children}
        </div>
      </AdminGuard>
    );
  }

  const navItems = isSuspended
    ? [
        { href: "/admin/billing", label: "Gói cước", icon: CreditCard }
      ]
    : [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/tables", label: "Quản lý Bàn", icon: Store },
        { href: "/admin/kitchen", label: "Quản lý Bếp", icon: Soup },
        { href: "/admin/revenue", label: "Doanh thu", icon: TrendingUp },
        { href: "/admin/menu", label: "Thực đơn", icon: Settings },
        ...(userRole === "admin" ? [
          { href: "/admin/billing", label: "Gói cước", icon: CreditCard },
          { href: "/admin/logs", label: "Nhật ký", icon: ClipboardList }
        ] : []),
        { href: "/admin/credentials", label: "Tài khoản", icon: Users },
      ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AdminGuard>
      <div className="h-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-black tracking-tight">{storeConfig?.name || "Menu Việt"} Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-6 flex flex-col transition-transform duration-300 transform
          md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Store size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-none text-white">{storeConfig?.name || "Menu Việt"}</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Hệ thống quản lý</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const isBillingTab = item.href === "/admin/billing";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                    active 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {isBillingTab && isSuspended && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shrink-0">
                      Hết hạn
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${pathname === "/admin/kitchen" ? "h-full overflow-hidden" : "overflow-y-auto"} print:overflow-visible print:h-auto flex flex-col`}>
          {isSuspended && (
            <div className="bg-red-500 text-white px-6 py-3 text-sm font-bold flex items-center justify-between shadow-md select-none shrink-0">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>Cửa hàng đã hết hạn dịch vụ Premium! Khách hàng không thể đặt món vào thời điểm này.</span>
              </div>
              {pathname !== "/admin/billing" && (
                <Link href="/admin/billing" className="underline hover:text-red-100 shrink-0 font-black uppercase text-xs tracking-wider">
                  Gia hạn ngay &rarr;
                </Link>
              )}
            </div>
          )}
          
          <div className={`print:p-0 ${pathname === "/admin/kitchen" ? "p-6 md:p-8 h-full flex flex-col" : "p-6 md:p-12"} flex-1`}>
            {isSuspended && !isBillingPath ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-[2rem] p-10 shadow-xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h2 className="text-gray-900 text-xl font-black mb-3 uppercase tracking-tight">Gói dịch vụ đã hết hạn</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">
                    Gói Premium của cửa hàng <span className="text-gray-950 font-bold">{storeConfig?.name}</span> đã hết thời hạn sử dụng. Vui lòng gia hạn gói dịch vụ để mở khóa đầy đủ tính năng và tiếp tục nhận đơn gọi món từ khách hàng.
                  </p>
                  <Link href="/admin/billing" className="w-full">
                    <button className="w-full py-3.5 bg-primary hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/10 transition-all text-sm cursor-pointer select-none">
                      Gia hạn dịch vụ ngay
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media print {
          .h-screen { height: auto !important; }
          .overflow-hidden { overflow: visible !important; }
          .flex { display: block !important; }
          aside, .md\:hidden { display: none !important; }
        }
      `}</style>
 
      {/* Expiring Watermark (like Windows not activated) */}
      {showWarning && (
        <div className="fixed bottom-6 right-6 z-[9999] select-none text-right font-sans opacity-45 hover:opacity-100 transition-opacity duration-300 pointer-events-auto bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/20 shadow-sm max-w-[240px]">
          <Link href="/admin/billing" className="block text-right group">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider group-hover:text-primary transition-colors">
              Gói cước sắp hết hạn
            </p>
            <p className="text-[10px] text-gray-500 font-bold mt-1 leading-normal group-hover:text-gray-700 transition-colors">
              Còn lại {daysLeft} ngày sử dụng. Nhập để gia hạn.
            </p>
          </Link>
        </div>
      )}
    </AdminGuard>
  );
}
