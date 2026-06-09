"use client";

import { useCartStore } from "@/store/cartStore";
import { ShieldAlert, LogOut, LayoutDashboard, Store, CreditCard } from "lucide-react";
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
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 text-white p-6 flex flex-col h-auto md:h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
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
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all"
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
