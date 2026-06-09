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

  if (userRole === "kitchen") {
    return (
      <AdminGuard>
        <div className="h-screen overflow-hidden bg-gray-50 p-6 md:p-8 flex flex-col">
          {children}
        </div>
      </AdminGuard>
    );
  }

  const navItems = [
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    active 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
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
        <main className={`flex-1 ${pathname === "/admin/kitchen" ? "h-full overflow-hidden" : "overflow-y-auto"} print:overflow-visible print:h-auto`}>
          <div className={`print:p-0 ${pathname === "/admin/kitchen" ? "p-6 md:p-8 h-full flex flex-col" : "p-6 md:p-12"}`}>
            {children}
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
    </AdminGuard>
  );
}
