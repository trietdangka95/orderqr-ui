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
      setError(error?.response?.data?.message || "Failed to initialize 2FA configuration");
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
      setSuccess("Two-factor authentication (2FA) enabled successfully!");
      setIsSettingUp(false);
      setSetupData(null);
      setVerificationCode("");
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Verification code is incorrect. Please try again.");
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!confirmPassword) return;

    try {
      await disableMutation.mutateAsync(confirmPassword);
      setSuccess("Two-factor authentication (2FA) disabled successfully!");
      setIsDisabling(false);
      setConfirmPassword("");
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Confirmation password is incorrect.");
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
          Account Security
        </h1>
        <p className="text-gray-500 font-medium italic">Manage security layers protecting your Super Admin account</p>
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
              Two-Factor Authentication (2FA / TOTP)
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Status:{" "}
              <span className={`font-bold ${isEnabled ? "text-green-600" : "text-amber-500"}`}>
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Blocks */}
        <div className="p-8">
          {!isSettingUp && !isDisabling && (
            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                Two-factor authentication (2FA) adds an important security layer to your Super Admin account by requiring a 6-digit security code from Google Authenticator or Authy when logging in.
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
                  Disable Two-Factor Auth
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
                      <span>Enable Two-Factor Auth</span>
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
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Scan QR code with Authenticator app</span>
                </div>

                {/* Setup Instructions */}
                <div className="space-y-4 flex flex-col justify-center">
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Setup Steps:</h4>
                  <ol className="text-sm text-gray-600 space-y-3 font-medium list-decimal pl-4">
                    <li>Open Google Authenticator or Authy on your phone.</li>
                    <li>Choose to scan QR code and point the camera at the image on the left.</li>
                    <li>If you cannot scan, copy the secret key below to configure manually.</li>
                  </ol>

                  {/* Secret Copy Key */}
                  <div className="mt-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-1.5">Secret Key</span>
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
                    Enter 6-digit verification code to activate
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
                      "Confirm Activation"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSetup}
                    className="px-6 py-3.5 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 active:scale-95 transition-all text-xs tracking-wider uppercase"
                  >
                    Cancel
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
                Warning: Disabling two-factor authentication will reduce the security of your Super Admin account. Please confirm your current password to continue.
              </div>

              <form onSubmit={handleDisable2FA} className="space-y-4">
                <div>
                  <label htmlFor="confirm-pass" className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Enter current password
                  </label>
                  <input
                    id="confirm-pass"
                    autoFocus
                    type="password"
                    placeholder="Your password..."
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
                      "Confirm Disable 2FA"
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
                    Cancel
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
