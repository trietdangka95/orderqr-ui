"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { ShieldAlert, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";

export default function SuperAdminLogin() {
  const { login: storeLogin } = useCartStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await loginMutation.mutateAsync({
        username: "superadmin",
        password: password
      });
      
      console.log("Login API Response:", res);

      if (res.role?.toLowerCase() === "superadmin" || res.role === "SUPER_ADMIN") {
        storeLogin("superadmin", res.id, res.storeId);
        router.push("/superadmin");
      } else {
        console.error("Role mismatch. Expected SUPER_ADMIN, got:", res.role);
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err: any) {
      console.error("Login failed with error:", err);
      const message = err?.message || (err instanceof Error ? err.message : String(err));
      alert("Đăng nhập thất bại: " + message);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Platform Access</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input
              autoFocus
              type={showPassword ? "text" : "password"}
              placeholder="Enter master password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-6 pr-14 py-4 bg-gray-900 border border-gray-800 rounded-2xl outline-none transition-all text-center text-white font-mono tracking-widest placeholder:text-gray-700 ${error ? "border-red-500/50 focus:border-red-500 animate-shake" : "focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-8 left-0 right-0 text-center"
                >
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-wider">Access Denied</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || password.length === 0}
            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none mt-6"
          >
            {loginMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>AUTHENTICATE</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
