"use client";
 
import { useCartStore } from "@/store/cartStore";
import { ShieldAlert, LogOut, LayoutDashboard, Store, CreditCard, Menu, X, MessageSquare, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
 
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, logout, isLoggedIn } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);
 
  useEffect(() => {
    if (!mounted) return;
 
    const role = userRole?.toLowerCase();
    if (!isLoggedIn || (role !== "superadmin" && role !== "super_admin")) {
      console.log("Access denied for role:", userRole);
      router.push("/super-login");
    }
  }, [isLoggedIn, userRole, router, mounted]);
 
  // Prevent rendering anything until hydration is complete
  if (!mounted) return null;
 
  const role = userRole?.toLowerCase();
  if (role !== "superadmin" && role !== "super_admin") {
    return null;
  }
 
  const isActive = (path: string) => {
    if (path === "/superadmin") {
      return pathname === "/superadmin";
    }
    return pathname.startsWith(path);
  };
 
  const navItems = [
    { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/superadmin/stores", label: "Manage Stores", icon: Store },
    { href: "/superadmin/renewals", label: "Yêu cầu gia hạn", icon: CreditCard },
    { href: "/superadmin/contacts", label: "Yêu cầu đăng ký", icon: MessageSquare },
    { href: "/superadmin/security", label: "Bảo mật (2FA)", icon: KeyRound },
  ];
 
  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header Topbar */}
      <header className="md:hidden bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-white leading-none">Super Admin</h1>
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Platform</p>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar (Desktop persistent, Mobile sliding/collapsible overlay) */}
      <aside className={`bg-gray-900 text-white p-6 flex flex-col transition-all duration-300 md:w-64 md:h-full md:flex shrink-0 ${
        isMobileMenuOpen 
          ? "block fixed inset-x-0 top-[61px] bottom-0 z-50 overflow-y-auto" 
          : "hidden md:flex"
      }`}>
        {/* Logo (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none text-white">Super Admin</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Platform Manager</p>
          </div>
        </div>
 
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  active 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
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
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-8 md:mt-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
 
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto">
        <div className="p-6 md:p-12 print:p-0">
          {children}
        </div>
      </main>
 
      <style jsx global>{`
        @media print {
          .h-screen { height: auto !important; }
          .overflow-hidden { overflow: visible !important; }
          .flex { display: block !important; }
          aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}
