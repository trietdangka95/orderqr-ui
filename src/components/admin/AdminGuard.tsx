"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Lock, ChevronLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, login } = useCartStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200 overflow-hidden border border-gray-100">
            <div className="p-8 bg-orange-500 flex flex-col items-center justify-center text-white relative">
              <Link 
                href="/"
                className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </Link>
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                <Lock size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-black">Admin Access</h1>
              <p className="text-orange-100 text-sm font-medium">Vui lòng nhập mật khẩu quản trị</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <input
                  autoFocus
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all text-center text-xl font-bold tracking-widest ${
                    error ? "border-red-500 animate-shake" : "border-gray-100 focus:border-orange-500 focus:bg-white"
                  }`}
                />
                {error && (
                  <p className="text-red-500 text-xs font-bold text-center mt-2 uppercase tracking-wider">
                    Mật khẩu không chính xác!
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
              >
                <LogIn size={20} />
                Đăng nhập
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-400 font-medium">
                  Hint: admin123
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
