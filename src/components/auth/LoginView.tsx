"use client";

import { useState } from "react";
import { useCartStore, UserRole } from "@/store/cartStore";
import { ChevronLeft, LogIn, UserCheck, ShieldCheck, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function LoginView({ initialRole = "staff" }: { initialRole?: UserRole }) {
  const { login: storeLogin, storeConfig } = useCartStore();
  const [role, setRole] = useState<UserRole>(initialRole);
  const t = useTranslation();

  const getDefaultUsername = (targetRole: UserRole) => {
    if (targetRole === "superadmin") return "superadmin";
    if (!storeConfig?.slug) return targetRole;

    if (targetRole === "staff") return `staff_${storeConfig.slug}`;
    if (targetRole === "kitchen") return `kitchen_${storeConfig.slug}`;

    // targetRole === "admin"
    const adminUser = storeConfig?.users?.[0]?.username || "";
    if (adminUser) return adminUser;
    return `admin_${storeConfig.slug}`;
  };

  const [username, setUsername] = useState(() => getDefaultUsername(initialRole));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const loginMutation = useLogin();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setUsername(getDefaultUsername(newRole));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedUsername = username.trim().toLowerCase();

    const loginData = {
      username: formattedUsername,
      password: password
    };

    try {
      const res = await loginMutation.mutateAsync(loginData);
      const normalizedRole = res.role?.toLowerCase();
      
      // Update global store
      storeLogin(normalizedRole as UserRole, res.id || "", res.storeId);
      
      // Redirect based on role
      if (normalizedRole === "superadmin" || normalizedRole === "super_admin") {
        router.push("/superadmin");
      } else if (normalizedRole === "admin") {
        router.push("/admin");
      } else if (normalizedRole === "kitchen") {
        router.push("/admin/kitchen");
      } else {
        router.push("/");
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const getRoleTheme = () => {
    switch (role) {
      case "superadmin": return { color: "bg-gray-900", text: t.auth.superadminRole, icon: ShieldAlert, accent: "text-gray-900" };
      case "admin": return { color: "bg-purple-600", text: t.auth.adminRole, icon: ShieldCheck, accent: "text-purple-600" };
      case "kitchen": return { color: "bg-primary", text: t.auth.kitchenRole, icon: LogIn, accent: "text-orange-500" };
      default: return { color: "bg-blue-600", text: t.auth.staffRole, icon: UserCheck, accent: "text-blue-600" };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/50 overflow-hidden border border-gray-100">
          {/* Header Area */}
          <div className={`p-8 transition-colors duration-500 flex flex-col items-center justify-center text-white relative ${theme.color}`}>
            <Link
              href="/"
              className="absolute top-6 left-6 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </Link>

            <div className="absolute top-6 right-6">
              <LanguageSelector light={false} />
            </div>

            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur-md">
              <theme.icon size={40} />
            </div>

            <h1 className="text-2xl font-black tracking-tight">{theme.text}</h1>
            <p className="opacity-80 text-sm font-medium mt-1">{t.auth.systemTitle.replace("{name}", storeConfig?.name || "Menu Việt")}</p>
          </div>

          <div className="p-8">
            {/* Role Selector */}
            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 gap-1 overflow-x-auto">
              <button
                onClick={() => handleRoleChange("staff")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${role === "staff" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t.common.staff}
              </button>
              <button
                onClick={() => handleRoleChange("kitchen")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${role === "kitchen" ? "bg-white shadow-sm text-orange-500" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t.common.kitchen}
              </button>
              <button
                onClick={() => handleRoleChange("admin")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${role === "admin" ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                {t.common.admin}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-2 block text-center">
                  {t.auth.usernameLabel}
                </label>
                <input
                  required
                  disabled={role === "staff" || role === "kitchen" || role === "superadmin"}
                  type="text"
                  placeholder={t.auth.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl outline-none transition-all text-center font-bold text-gray-700 mb-4 disabled:opacity-75 disabled:cursor-not-allowed"
                />

                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4 mb-2 block text-center">
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    autoFocus={role === "staff" || role === "kitchen"}
                    type={showPassword ? "text" : "password"}
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-6 pr-12 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all text-center text-xl font-bold tracking-widest ${error ? "border-red-500 animate-shake" : `border-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5`}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-[10px] font-black text-center mt-3 uppercase tracking-wider"
                    >
                      {t.auth.invalidCredentials}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl text-white ${theme.color} hover:brightness-110 disabled:opacity-50`}
              >
                {loginMutation.isPending ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={20} strokeWidth={3} />
                    {t.auth.loginButton}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
