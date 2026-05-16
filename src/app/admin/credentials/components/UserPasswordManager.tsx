"use client";

import { useState } from "react";
import { Lock, Check, Loader2, UserCircle, Key } from "lucide-react";
import { useUsers, useUpdateUserPassword } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function UserPasswordManager() {
  const { data: users = [], isLoading } = useUsers();
  const updatePasswordMutation = useUpdateUserPassword();
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && newPassword.length >= 4) {
      updatePasswordMutation.mutate({ userId: selectedUserId, newPassword }, {
        onSuccess: () => {
          setShowSuccess(true);
          setNewPassword("");
          setSelectedUserId(null);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      });
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-3 mb-6 ml-1">
        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Quản lý mật khẩu các Role khác</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.filter(u => u.role?.toUpperCase() !== 'ADMIN').length > 0 ? (
          users.filter(u => u.role?.toUpperCase() !== 'ADMIN').map((user) => (
            <motion.div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedUserId === user.id 
                ? "border-blue-500 bg-blue-50/50 shadow-lg" 
                : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                  user.role?.toUpperCase() === 'KITCHEN' ? "bg-orange-500" : "bg-blue-600"
                }`}>
                  {user.role?.toUpperCase() === 'KITCHEN' ? <Key size={20} /> : <UserCircle size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{user.username}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
              {selectedUserId === user.id && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-400 italic bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            Không tìm thấy tài khoản nhân viên hoặc bếp nào khác.
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUserId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 overflow-hidden"
          >
            <form onSubmit={handleUpdate} className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Đặt mật khẩu mới cho {users.find(u => u.id === selectedUserId)?.username}
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    required
                    autoFocus
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none transition-all font-mono"
                    placeholder="Nhập mật khẩu mới..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatePasswordMutation.isPending || newPassword.length < 4}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {updatePasswordMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>Cập nhật</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3"
          >
            <Check size={20} />
            <span className="font-bold">Đã cập nhật mật khẩu thành công!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
