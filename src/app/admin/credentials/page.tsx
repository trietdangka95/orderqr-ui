"use client";

import { useCartStore } from "@/store/cartStore";
import { Lock, ShieldCheck, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChangePassword } from "@/hooks/useAuth";
import UserPasswordManager from "./components/UserPasswordManager";

export default function CredentialsPage() {
  const { userRole } = useCartStore();
  const changePasswordMutation = useChangePassword();
  
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Mật khẩu mới không khớp!");
      return;
    }

    if (passwords.newPassword.length < 4) {
      setError("Mật khẩu mới phải có ít nhất 4 ký tự!");
      return;
    }

    changePasswordMutation.mutate({
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword
    }, {
      onSuccess: () => {
        setShowSuccess(true);
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setShowSuccess(false), 3000);
      },
      onError: (err: Error) => {
        setError(err.message || "Mật khẩu cũ không chính xác hoặc có lỗi xảy ra!");
      }
    });
  };

  const getRoleInfo = () => {
    switch (userRole) {
      case "admin": return { text: "Quản trị viên", color: "bg-gray-900", icon: ShieldCheck };
      case "kitchen": return { text: "Nhà bếp", color: "bg-orange-500", icon: ShieldCheck };
      case "staff": return { text: "Nhân viên", color: "bg-blue-600", icon: ShieldCheck };
      default: return { text: "Người dùng", color: "bg-gray-500", icon: ShieldCheck };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="max-w-7xl mx-auto text-center md:text-left">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Đổi mật khẩu</h1>
        <p className="text-gray-500 font-medium italic">Bảo mật tài khoản {roleInfo.text} của bạn</p>
      </header>

      <main className="max-w-4xl mx-auto py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 max-w-xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 ${roleInfo.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
              <roleInfo.icon size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{roleInfo.text}</h2>
              <p className="text-sm text-gray-400 font-medium">Thay đổi mật khẩu truy cập của bạn</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  required
                  type={showOldPassword ? "text" : "password"}
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  required
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 outline-none transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 mt-4 ${
                showSuccess 
                ? "bg-green-500 text-white" 
                : "bg-gray-900 text-white hover:bg-black shadow-2xl shadow-gray-200 disabled:opacity-50"
              }`}
            >
              {changePasswordMutation.isPending ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : showSuccess ? (
                <>
                  <Check size={24} />
                  <span>Đã cập nhật mật khẩu!</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </form>
        </motion.div>

        {userRole?.toLowerCase() === 'admin' && <UserPasswordManager />}
      </main>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3"
          >
            <Check className="text-green-400" />
            <span className="font-bold">Mật khẩu đã được thay đổi thành công!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
