"use client";

import { useState } from "react";
import { useSuperAdminInfo, useSetup2FA, useEnable2FA, useDisable2FA } from "@/hooks/useSuperAdmin";
import { ShieldCheck, ShieldAlert, KeyRound, Copy, Check, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecuritySettingsPage() {
  const { data: info, isLoading: infoLoading, refetch } = useSuperAdminInfo();
  const setupMutation = useSetup2FA();
  const enableMutation = useEnable2FA();
  const disableMutation = useDisable2FA();

  // Local state
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleStartSetup = async () => {
    setError("");
    setSuccess("");
    try {
      const data = await setupMutation.mutateAsync();
      setSetupData(data);
      setIsSettingUp(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Không thể khởi tạo cấu hình 2FA");
    }
  };

  const handleCancelSetup = () => {
    setIsSettingUp(false);
    setSetupData(null);
    setVerificationCode("");
    setError("");
  };

  const handleCopySecret = () => {
    if (!setupData) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!setupData || verificationCode.length !== 6) return;

    try {
      await enableMutation.mutateAsync({
        code: verificationCode,
        secret: setupData.secret
      });
      setSuccess("Kích hoạt bảo mật 2 lớp (2FA) thành công!");
      setIsSettingUp(false);
      setSetupData(null);
      setVerificationCode("");
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Mã xác thực không đúng. Vui lòng thử lại.");
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!confirmPassword) return;

    try {
      await disableMutation.mutateAsync(confirmPassword);
      setSuccess("Hủy bảo mật 2 lớp (2FA) thành công!");
      setIsDisabling(false);
      setConfirmPassword("");
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Mật khẩu xác nhận không chính xác.");
    }
  };

  if (infoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isEnabled = info?.twoFactorEnabled;

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
          <KeyRound className="text-blue-600" size={32} />
          Bảo mật tài khoản
        </h1>
        <p className="text-gray-500 font-medium italic">Quản lý các lớp bảo mật bảo vệ tài khoản Super Admin</p>
      </header>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"
          >
            <ShieldAlert size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-bold flex items-center gap-2"
          >
            <ShieldCheck className="text-green-600" size={20} />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Header banner */}
        <div className={`p-8 flex items-center gap-4 border-b border-gray-100 ${isEnabled ? "bg-green-50/50" : "bg-blue-50/30"}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${isEnabled ? "bg-green-600 text-white shadow-green-500/20" : "bg-blue-600 text-white shadow-blue-500/20"}`}>
            {isEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight">
              Mật khẩu hai lớp (2FA / TOTP)
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Trạng thái:{" "}
              <span className={`font-bold ${isEnabled ? "text-green-600" : "text-amber-500"}`}>
                {isEnabled ? "Đang bật" : "Đang tắt"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Blocks */}
        <div className="p-8">
          {!isSettingUp && !isDisabling && (
            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                Xác thực 2 lớp (2FA) thêm một lớp bảo mật quan trọng cho tài khoản Super Admin bằng cách yêu cầu mã bảo mật 6 số từ ứng dụng Google Authenticator hoặc Authy khi đăng nhập.
              </p>

              {isEnabled ? (
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setIsDisabling(true);
                  }}
                  className="px-6 py-3.5 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all text-xs tracking-wider uppercase border border-red-200/50"
                >
                  Tắt xác thực 2 lớp
                </button>
              ) : (
                <button
                  onClick={handleStartSetup}
                  disabled={setupMutation.isPending}
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-xs tracking-wider uppercase shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {setupMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <QrCode size={16} />
                      <span>Kích hoạt bảo mật 2 lớp</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* SETUP FLOW */}
          {isSettingUp && setupData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <QRCodeSVG
                      value={setupData.otpauthUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Quét mã QR bằng Authenticator</span>
                </div>

                {/* Setup Instructions */}
                <div className="space-y-4 flex flex-col justify-center">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Các bước cài đặt:</h4>
                  <ol className="text-sm text-gray-600 space-y-3 font-medium list-decimal pl-4">
                    <li>Mở ứng dụng Google Authenticator hoặc Authy trên điện thoại của bạn.</li>
                    <li>Chọn quét mã QR và hướng camera vào hình bên cạnh.</li>
                    <li>Nếu không quét được, hãy sao chép mã khóa bí mật ở dưới để cấu hình thủ công.</li>
                  </ol>

                  {/* Secret Copy Key */}
                  <div className="mt-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1.5">Mã khóa bí mật (Secret Key)</span>
                    <div className="flex items-center gap-2 bg-gray-900 text-gray-100 p-3 rounded-xl font-mono text-sm break-all select-all justify-between border border-gray-800">
                      <span className="tracking-wider text-xs">{setupData.secret}</span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Verification Form */}
              <form onSubmit={handleVerifyAndEnable} className="pt-6 border-t border-gray-100 space-y-4">
                <div>
                  <label htmlFor="verify-code" className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Nhập mã xác thực 6 số để kích hoạt
                  </label>
                  <input
                    id="verify-code"
                    autoFocus
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="max-w-[200px] block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-center font-mono text-2xl tracking-[0.2em] placeholder:text-gray-300"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={enableMutation.isPending || verificationCode.length !== 6}
                    className="px-6 py-3.5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-xs tracking-wider uppercase disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/10"
                  >
                    {enableMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Xác nhận kích hoạt"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSetup}
                    className="px-6 py-3.5 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 active:scale-95 transition-all text-xs tracking-wider uppercase"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* DEACTIVATION FLOW */}
          {isDisabling && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold leading-relaxed">
                Cảnh báo: Việc tắt mật khẩu hai lớp sẽ làm giảm độ an toàn của tài khoản Super Admin. Vui lòng xác nhận mật khẩu hiện tại để tiếp tục.
              </div>

              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label htmlFor="confirm-pass" className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Nhập mật khẩu hiện tại
                  </label>
                  <input
                    id="confirm-pass"
                    autoFocus
                    type="password"
                    placeholder="Mật khẩu của bạn..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="max-w-md w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-red-500 focus:bg-white transition-all text-sm font-semibold"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={disableMutation.isPending || !confirmPassword}
                    className="px-6 py-3.5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 active:scale-95 transition-all text-xs tracking-wider uppercase disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/10"
                  >
                    {disableMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Xác nhận hủy 2FA"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDisabling(false);
                      setConfirmPassword("");
                      setError("");
                    }}
                    className="px-6 py-3.5 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 active:scale-95 transition-all text-xs tracking-wider uppercase"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
