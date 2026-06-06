"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  QrCode,
  ShoppingBag,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Play,
  Clock,
  Coins,
  Menu,
  X,
  Store,
  ChevronRight,
  ShieldCheck,
  Zap,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/utils/image";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState<"menu" | "kitchen" | "admin">("menu");

  const features = [
    {
      icon: <QrCode className="w-6 h-6 text-orange-500" />,
      title: "Menu QR Linh Hoạt",
      desc: "Tạo menu số chỉ trong vài phút. Khách hàng quét mã tại bàn, xem thực đơn sinh động, sắc nét và gọi món ngay lập tức."
    },
    {
      icon: <ChefHat className="w-6 h-6 text-orange-500" />,
      title: "Đơn Bếp Tức Thời (Real-time)",
      desc: "Đơn hàng tự động gửi trực tiếp đến màn hình bếp của nhân viên qua kết nối thời gian thực. Giảm thiểu sai sót tối đa."
    },
    {
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      title: "Quản Lý Đa Cửa Hàng",
      desc: "Hệ thống hỗ trợ phân quyền multi-tenancy. Mỗi cửa hàng hoạt động riêng biệt trên subdomain riêng cực kỳ chuyên nghiệp."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      title: "Thống Kê Doanh Thu trực quan",
      desc: "Theo dõi doanh số bán hàng, số lượng đơn hàng, món ăn bán chạy nhất theo ngày, tuần, tháng với giao diện dashboard chi tiết."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-orange-500" />,
      title: "Tương Thích Mọi Thiết Bị",
      desc: "Giao diện được thiết kế tối ưu hóa cho di động (Mobile First), mang lại trải nghiệm mượt mà, trực quan như ứng dụng gốc."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-orange-500" />,
      title: "Tùy Biến Giao Diện Độc Bản",
      desc: "Thay đổi màu sắc chủ đạo (Theme), Logo, và cấu hình danh sách bàn ăn tương thích chính xác với sơ đồ quán thực tế."
    }
  ];

  const steps = [
    {
      title: "Quét Mã QR",
      desc: "Khách hàng quét mã QR độc bản được dán tại bàn ăn bằng điện thoại để truy cập thực đơn trực tuyến tức thì."
    },
    {
      title: "Chọn Món & Đặt Hàng",
      desc: "Xem món ăn kèm hình ảnh sống động, lọc theo danh mục, thêm ghi chú và bấm đặt món không cần đợi nhân viên."
    },
    {
      title: "Bếp Chế Biến",
      desc: "Bếp nhận thông tin đặt món theo thời gian thực và tiến hành chuẩn bị món ăn nhanh chóng, chính xác."
    },
    {
      title: "Phục Vụ & Thanh Toán",
      desc: "Nhân viên phục vụ món ăn đúng số bàn đã đặt. Sau khi dùng bữa xong, khách yêu cầu thanh toán nhanh chóng."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden relative selection:bg-orange-500 selection:text-white">
      {/* Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-600/5 blur-[150px] pointer-events-none animate-pulse delay-1000"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/50 group-hover:rotate-6 transition-transform">
              <ChefHat className="text-white w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase block leading-none">Order QR</span>
              <span className="text-lg font-black text-white tracking-tight">MENU VIỆT</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
            <a href="#workflow" className="hover:text-white transition-colors">Quy trình</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#pricing"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-950/30 hover:scale-102 transition-all flex items-center gap-1"
            >
              Liên Hệ Ngay
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[73px] left-0 right-0 bg-gray-950 border-b border-white/10 z-40 px-6 py-8 space-y-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4 text-base font-semibold text-gray-400">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-2 border-b border-white/5"
              >
                Tính năng
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-2 border-b border-white/5"
              >
                Quy trình
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-2 border-b border-white/5"
              >
                Bảng giá
              </a>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-black shadow-lg"
              >
                Liên Hệ Ngay
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-xs font-black tracking-widest uppercase mb-8"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          Giải Pháp Số Hóa Nhà Hàng 2026
        </motion.div>

        {/* Headlines */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-500"
        >
          Menu QR Điện Tử & Gọi Món Tại Bàn
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-base md:text-xl font-medium max-w-2xl mt-6 leading-relaxed"
        >
          Cách mạng hóa trải nghiệm ăn uống tại nhà hàng của bạn. Khách hàng quét mã gọi món trực tiếp, đơn chuyển tức thì đến Bếp. Tiết kiệm nhân lực, tăng tốc phục vụ.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
        >
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-base font-black shadow-xl shadow-orange-950/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Xem Bảng Giá Dịch Vụ
            <ArrowRight size={18} />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-white/20 rounded-2xl text-base font-bold bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            Tìm Hiểu Tính Năng
            <Play size={14} className="fill-white" />
          </a>
        </motion.div>

        {/* Showcase Switcher Tabs */}
        <div className="flex bg-gray-900/60 border border-white/5 p-1.5 rounded-2xl mb-8 gap-1 w-full max-w-xl mx-auto relative z-10">
          <button
            onClick={() => setShowcaseTab("menu")}
            className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${showcaseTab === "menu" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/20" : "text-gray-400 hover:text-white"}`}
          >
            Khách Gọi Món
          </button>
          <button
            onClick={() => setShowcaseTab("kitchen")}
            className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${showcaseTab === "kitchen" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/20" : "text-gray-400 hover:text-white"}`}
          >
            Nhà Bếp
          </button>
          <button
            onClick={() => setShowcaseTab("admin")}
            className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${showcaseTab === "admin" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/20" : "text-gray-400 hover:text-white"}`}
          >
            Quản Lý Admin
          </button>
        </div>

        {/* Interactive Mockup Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="relative max-w-5xl w-full border border-white/10 bg-gray-900/40 rounded-[2rem] p-4 md:p-6 backdrop-blur-2xl shadow-3xl shadow-black/80"
        >
          <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-gray-950 border border-white/10 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest z-20">
            {showcaseTab === "menu" && "Giao Diện Khách Gọi Món"}
            {showcaseTab === "kitchen" && "Màn Hình Phân Đơn Nhà Bếp"}
            {showcaseTab === "admin" && "Hệ Thống Admin & Doanh Thu"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            {/* Left Column: Device Mockup */}
            <div className="md:col-span-5 flex items-center justify-center min-h-[420px] md:min-h-[520px]">
              <AnimatePresence mode="wait">
                {showcaseTab === "menu" && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gray-50 border-[8px] border-gray-900 rounded-[2.75rem] shadow-2xl relative flex flex-col justify-between overflow-hidden text-gray-900 h-[500px] max-w-[270px] w-full shrink-0"
                  >
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-30"></div>

                    {/* Shop App Header */}
                    <div className="bg-white pt-6 pb-3 px-3 border-b border-gray-100 flex flex-col gap-2 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black text-white overflow-hidden shrink-0">
                            🥣
                          </div>
                          <div className="text-left">
                            <h5 className="text-[10px] font-black leading-none text-gray-900">Bun Bo 97</h5>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Bàn 01</span>
                          </div>
                        </div>
                        <ShoppingBag size={14} className="text-orange-500" />
                      </div>

                      {/* Category tabs */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[8px] font-black uppercase tracking-wider">
                        <span className="px-2 py-1 bg-orange-500 text-white rounded-full">Món chính</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full">Nước uống</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full">Tráng miệng</span>
                      </div>
                    </div>

                    {/* Menu list */}
                    <div className="flex-grow py-3 px-3 space-y-3 overflow-y-auto bg-gray-50">
                      <div className="bg-white rounded-2xl p-2.5 border border-gray-100 flex gap-2.5 shadow-sm relative overflow-hidden">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center relative">
                          <img
                            src={getImageUrl("/public/uploads/1778770335484-images.jpeg")}
                            alt="Bún Bò"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <span className="absolute text-sm">🥣</span>
                        </div>
                        <div className="text-left flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-1">Bún Bò Đặc Biệt</p>
                            <p className="text-[8px] text-gray-400 line-clamp-1 mt-0.5">Bún bò nạm, chả bò, nước dùng ngọt đậm đà</p>
                          </div>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-[10px] font-black text-orange-500">65.000 đ</span>
                            <button className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center active:scale-90">
                              <Plus className="w-3 h-3" strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-2.5 border border-gray-100 flex gap-2.5 shadow-sm relative overflow-hidden">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center relative">
                          <span className="absolute text-sm">🍹</span>
                        </div>
                        <div className="text-left flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-1">Trà Đào Cam Sả</p>
                            <p className="text-[8px] text-gray-400 line-clamp-1 mt-0.5">Hương vị sả thơm mát hòa quyện cùng đào miếng giòn ngọt</p>
                          </div>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-[10px] font-black text-orange-500">30.000 đ</span>
                            <button className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center active:scale-90">
                              <Plus className="w-3 h-3" strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order button */}
                    <div className="pt-2 border-t border-gray-100 bg-white p-3 shrink-0">
                      <div className="w-full py-2 bg-orange-500 rounded-xl text-[10px] font-black text-white flex items-center justify-center gap-1 shadow-lg shadow-orange-100 active:scale-98">
                        Gửi Đơn Vào Bếp (2 Món)
                      </div>
                    </div>
                  </motion.div>
                )}

                {showcaseTab === "kitchen" && (
                  <motion.div
                    key="kitchen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full bg-gray-900 border-[8px] border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden text-gray-100 h-[380px] max-w-[450px] flex flex-col text-xs"
                  >
                    <div className="bg-gray-800 px-4 py-2.5 border-b border-gray-700 flex justify-between items-center text-[10px] shrink-0">
                      <span className="font-black tracking-wider text-orange-500">KITCHEN BOARD • MÀN BẾP</span>
                      <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">Connected ✔</span>
                    </div>
                    <div className="flex-grow p-3 grid grid-cols-2 gap-3 bg-gray-950 overflow-y-auto">
                      <div className="bg-gray-900 rounded-xl p-3 border border-orange-500/30 flex flex-col justify-between h-fit min-h-[140px]">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-black text-xs text-orange-400">BÀN SỐ: 01</span>
                            <span className="text-[8px] text-gray-500">Vừa xong</span>
                          </div>
                          <div className="space-y-1.5 text-[10px] text-left">
                            <div className="flex justify-between font-bold text-gray-300">
                              <span>1x Bún Bò Đặc Biệt</span>
                              <span className="text-orange-500 font-black animate-pulse">Chờ nấu</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-300">
                              <span>1x Trà Đào Cam Sả</span>
                              <span className="text-green-500">Xong ✔</span>
                            </div>
                          </div>
                        </div>
                        <button className="w-full mt-3 py-1.5 bg-orange-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-orange-600 transition-all">
                          Xong Hết Món
                        </button>
                      </div>

                      <div className="bg-gray-900 rounded-xl p-3 border border-white/5 flex flex-col justify-between h-fit min-h-[140px]">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-black text-xs text-gray-400">BÀN SỐ: 03</span>
                            <span className="text-[8px] text-gray-500">5 phút trước</span>
                          </div>
                          <div className="space-y-1.5 text-[10px] text-left">
                            <div className="flex justify-between font-bold text-gray-300">
                              <span>2x Phở Bò Tái</span>
                              <span className="text-orange-500 font-black animate-pulse">Chờ nấu</span>
                            </div>
                          </div>
                        </div>
                        <button className="w-full mt-3 py-1.5 bg-orange-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-orange-600 transition-all">
                          Xong Hết Món
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showcaseTab === "admin" && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full bg-gray-950 border-[10px] border-gray-800 rounded-[1.5rem] shadow-2xl overflow-hidden text-gray-300 h-[380px] max-w-[480px] flex flex-col text-[10px]"
                  >
                    <div className="bg-gray-900 px-3 py-1.5 border-b border-gray-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      </div>
                      <span className="text-gray-500 text-[8px]">bun-bo.orderqr.id.vn/admin</span>
                      <div className="w-6"></div>
                    </div>
                    <div className="flex-grow flex bg-gray-950 text-left">
                      <div className="w-24 bg-gray-900/60 border-r border-white/5 p-2 space-y-1 font-bold shrink-0">
                        <div className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded flex items-center gap-1">
                          📊 Dashboard
                        </div>
                        <div className="px-2 py-1 text-gray-500 hover:text-gray-300 rounded flex items-center gap-1">
                          🍲 Thực đơn
                        </div>
                        <div className="px-2 py-1 text-gray-500 hover:text-gray-300 rounded flex items-center gap-1">
                          🪑 Bản đồ bàn
                        </div>
                        <div className="px-2 py-1 text-gray-500 hover:text-gray-300 rounded flex items-center gap-1">
                          📈 Doanh thu
                        </div>
                      </div>
                      <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-900 p-2 rounded-lg border border-white/5">
                            <span className="text-[7px] text-gray-500 uppercase block font-black">Hôm nay</span>
                            <span className="text-[10px] font-black text-white mt-0.5 block">2.350.000 đ</span>
                          </div>
                          <div className="bg-gray-900 p-2 rounded-lg border border-white/5">
                            <span className="text-[7px] text-gray-500 uppercase block font-black">Số đơn</span>
                            <span className="text-[10px] font-black text-white mt-0.5 block">36 đơn</span>
                          </div>
                          <div className="bg-gray-900 p-2 rounded-lg border border-white/5">
                            <span className="text-[7px] text-gray-500 uppercase block font-black">Chạy nhất</span>
                            <span className="text-[8px] font-black text-orange-500 mt-0.5 block truncate">Bún Bò ĐB</span>
                          </div>
                        </div>
                        <div className="bg-gray-900/40 border border-white/5 rounded-lg p-2">
                          <p className="text-[7px] text-gray-500 uppercase font-black mb-1.5">Doanh số tuần này</p>
                          <div className="h-24 flex items-end justify-between px-1 gap-1 pt-2">
                            {[30, 50, 45, 65, 80, 55, 95].map((val, idx) => (
                              <div key={idx} className="flex-grow flex flex-col items-center gap-1">
                                <div
                                  className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t"
                                  style={{ height: `${val * 0.5}px` }}
                                ></div>
                                <span className="text-[6px] text-gray-600">Th {idx + 2}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: High-Impact Texts */}
            <div className="md:col-span-7 space-y-6 text-left p-2 md:p-6">
              <div className="inline-flex items-center gap-2 text-xs font-black text-orange-500 uppercase tracking-widest">
                <Zap size={14} className="fill-orange-500/20" />
                Vận Hành Tiện Lợi
              </div>

              <AnimatePresence mode="wait">
                {showcaseTab === "menu" && (
                  <motion.div
                    key="menu-text"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                      Khách hàng chủ động chọn món và gửi bếp tức thì
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      Thực khách chỉ cần quét mã QR đặt tại bàn bằng camera điện thoại để truy cập ngay menu điện tử sinh động, chi tiết mà không cần tải ứng dụng. Việc đặt món trở nên dễ dàng, tự động điền số bàn và chuyển đơn thẳng vào bếp chỉ với vài cú chạm.
                    </p>
                  </motion.div>
                )}

                {showcaseTab === "kitchen" && (
                  <motion.div
                    key="kitchen-text"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                      Nhà bếp xử lý đơn chuyên nghiệp, không sợ nhầm món
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      Khi khách đặt món, màn hình bếp sẽ lập tức phát cảnh báo và hiển thị đầy đủ thông tin: số lượng món, số bàn và các ghi chú đặc biệt (ví dụ: ít cay, nhiều rau). Trạng thái nấu được đồng bộ hóa tức thì giúp tối ưu hóa tiến độ chuẩn bị món ăn.
                    </p>
                  </motion.div>
                )}

                {showcaseTab === "admin" && (
                  <motion.div
                    key="admin-text"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                      Kiểm soát doanh thu chặt chẽ, thay đổi thực đơn linh hoạt
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      Trang quản lý admin cung cấp hệ thống báo cáo doanh thu trực quan theo ngày/tuần/tháng, số lượng hóa đơn phát sinh. Đồng thời, chủ quán dễ dàng thêm bớt món ăn, thay đổi giá, tạo bàn ăn mới hay cấu hình logo và màu sắc quán chỉ trong tích tắc.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Không lo trễ đơn, nhầm bàn ăn trong giờ cao điểm</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Tiết kiệm chi phí in ấn thiết kế thực đơn giấy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Quản lý hiệu quả, tối ưu hóa năng suất nhân sự phục vụ</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">Đầy Đủ Công Cụ</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            Tính Năng Vượt Trội Nhất
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            Được thiết kế chuyên biệt dựa trên các nghiên cứu vận hành của hàng ngàn quán ăn, nhà hàng, tiệm cà phê tại Việt Nam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, borderColor: "rgba(249, 115, 22, 0.3)" }}
              className="bg-gray-900/20 border border-white/5 rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-lg font-black text-white group-hover:text-orange-500 transition-colors">
                {feature.title}
              </h4>
              <p className="text-gray-400 text-xs md:text-sm font-medium mt-3 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">Vận Hành Đơn Giản</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            Hoạt Động Như Thế Nào?
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex gap-4 ${activeStep === idx ? 'bg-orange-500/10 border-orange-500' : 'bg-gray-900/10 border-white/5 hover:border-white/10'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${activeStep === idx ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {idx + 1}
                </div>
                <div className="text-left">
                  <h5 className={`font-black text-sm ${activeStep === idx ? 'text-orange-500' : 'text-white'}`}>{step.title}</h5>
                  <p className="text-gray-400 text-[11px] md:text-xs font-medium mt-1 leading-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 aspect-[16/10] bg-gray-900/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-2xl flex items-center justify-center min-h-[360px]">
            {/* Background glowing sphere inside box */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center text-center max-w-lg w-full space-y-6 z-10"
              >
                {activeStep === 0 && (
                  <div className="flex flex-col items-center gap-6">
                    <motion.div
                      initial={{ rotate: -5 }}
                      animate={{ rotate: 0 }}
                      className="bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center justify-center w-[160px] h-[220px] text-gray-900 relative shrink-0"
                    >
                      <div className="w-full py-1 bg-orange-500 text-white text-[7px] font-black rounded uppercase mb-2">QUÉT MÃ GỌI MÓN</div>
                      <div className="p-1.5 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                        <QrCode size={70} className="text-gray-900" />
                      </div>
                      <span className="text-[9px] font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">BÀN SỐ 01</span>
                      <span className="absolute -bottom-3 -right-3 text-2xl animate-bounce">📱</span>
                    </motion.div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">Bước 1: Thực Khách Quét Mã QR</h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        Khi ngồi vào bàn, khách dùng camera điện thoại quét mã QR. Mỗi bàn sẽ tương ứng một mã duy nhất để tự động ghi nhận số bàn chính xác.
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-gray-50 border-4 border-gray-900 rounded-[1.75rem] w-[180px] h-[240px] overflow-hidden text-gray-900 flex flex-col justify-between shadow-2xl shrink-0 text-left">
                      <div className="bg-white p-2 border-b border-gray-100 flex justify-between items-center text-[7px] font-black text-gray-700">
                        <span>BÀN 01</span>
                        <span className="text-orange-500">🛒 2 món</span>
                      </div>
                      <div className="p-2 space-y-1.5 flex-grow overflow-y-auto">
                        <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex gap-2 items-center">
                          <span className="text-xs">🥣</span>
                          <div className="text-[7px]">
                            <p className="font-bold text-gray-900">Bún Bò Đặc Biệt</p>
                            <p className="font-bold text-orange-500">65.000đ</p>
                          </div>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex gap-2 items-center">
                          <span className="text-xs">🍹</span>
                          <div className="text-[7px]">
                            <p className="font-bold text-gray-900">Trà Đào Cam Sả</p>
                            <p className="font-bold text-orange-500">30.000đ</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 bg-white border-t border-gray-100">
                        <div className="w-full py-1.5 bg-orange-500 text-white rounded-lg text-[7px] font-black uppercase tracking-wider text-center animate-pulse">
                          Xác Nhận Đặt Món
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">Bước 2: Xem Thực Đơn & Đặt Món</h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        Thực khách duyệt danh mục, thêm ghi chú và tự xác nhận gửi đơn. Trải nghiệm gọi món mượt mà, trực quan mà không cần gọi phục vụ.
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-gray-900 rounded-2xl border border-white/10 w-[240px] p-3 text-left shadow-2xl shrink-0">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-2">
                        <span className="text-[8px] font-black text-orange-500">BẾP CHẾ BIẾN</span>
                        <span className="text-[7px] text-gray-500">Bàn 01</span>
                      </div>
                      <div className="space-y-1 text-[9px] font-bold text-gray-300">
                        <div className="flex justify-between">
                          <span>1x Bún Bò Đặc Biệt</span>
                          <span className="text-orange-500 font-black animate-pulse">Chờ nấu...</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1x Trà Đào Cam Sả</span>
                          <span className="text-green-500">Xong ✔</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5">
                        <div className="w-full py-1 bg-green-600 text-white text-center rounded text-[7px] font-black uppercase tracking-wider">
                          Hoàn Tất
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">Bước 3: Nhà Bếp Tự Động Nhận Đơn</h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        Đầu bếp lập tức nhìn thấy danh sách gọi món trên màn hình bếp. Phân chia chuẩn xác, chế biến nhanh và không lo thất lạc thông tin.
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 text-gray-800 w-[180px] text-left relative overflow-hidden shrink-0">
                      <div className="text-center border-b border-dashed border-gray-200 pb-2 mb-2">
                        <h5 className="font-black text-[10px] text-gray-900">HÓA ĐƠN TẠM TÍNH</h5>
                        <span className="text-[7px] text-gray-400">Bàn 01 • Order QR</span>
                      </div>
                      <div className="space-y-1 text-[8px] font-bold text-gray-600 border-b border-dashed border-gray-200 pb-2 mb-2">
                        <div className="flex justify-between">
                          <span>1x Bún Bò Đặc Biệt</span>
                          <span>65k</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1x Trà Đào Cam Sả</span>
                          <span>30k</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-gray-900 mb-2">
                        <span>TỔNG CỘNG:</span>
                        <span className="text-orange-500">95.000đ</span>
                      </div>
                      <div className="bg-green-500 text-white text-center py-1 rounded text-[7px] font-black uppercase tracking-wider">
                        ĐÃ THANH TOÁN
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">Bước 4: Phục Vụ & Thu Ngân</h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        Nhân viên bưng bê món ăn đến bàn tương ứng. Thu ngân in hóa đơn và hoàn tất giao dịch tự động nhanh chóng và chính xác.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">Chi Phí Tối Ưu</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            Bảng Giá Dịch Vụ
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            Lựa chọn gói dịch vụ phù hợp để khởi động hành trình chuyển đổi số của nhà hàng bạn ngay hôm nay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Package */}
          <div className="bg-gray-900/10 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">GÓI TRẢI NGHIỆM</span>
              <h3 className="text-2xl font-black text-white mt-2">Dùng Thử Miễn Phí</h3>
              <p className="text-gray-400 text-xs font-bold mt-2">Không giới hạn thời gian chạy thử</p>

              <div className="flex items-baseline gap-1 mt-6 border-b border-white/5 pb-6">
                <span className="text-4xl font-black text-white">0đ</span>
                <span className="text-gray-500 text-sm font-bold">/ tháng</span>
              </div>

              <ul className="space-y-4 mt-6 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-gray-500 shrink-0" />
                  Hỗ trợ tối đa 5 bàn ăn
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-gray-500 shrink-0" />
                  Đầy đủ menu số & hình ảnh
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-gray-500 shrink-0" />
                  Quản lý đơn hàng real-time cơ bản
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href="#pricing"
                className="w-full py-3.5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-all block text-center"
              >
                Liên Hệ Đăng Ký
              </a>
            </div>
          </div>

          {/* Premium Package */}
          <div className="bg-gray-900/20 border-2 border-orange-500 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-orange-950/20 group">
            {/* Pop tag */}
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
              Phổ Biến Nhất
            </div>

            <div>
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">GÓI CHUYÊN NGHIỆP</span>
              <h3 className="text-2xl font-black text-white mt-2">Premium Partner</h3>
              <p className="text-gray-400 text-xs font-bold mt-2">Dành cho nhà hàng lớn, hoạt động tần suất cao</p>

              <div className="flex items-baseline gap-1 mt-6 border-b border-orange-500/20 pb-6">
                <span className="text-4xl font-black text-white">199.000đ</span>
                <span className="text-gray-500 text-sm font-bold">/ tháng</span>
              </div>

              <ul className="space-y-4 mt-6 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  Không giới hạn số bàn ăn
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  Băng thông truyền tin ưu tiên (Siêu tốc)
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  Tùy chỉnh subdomain theo ý muốn
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  Báo cáo doanh số & phân tích nâng cao
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href="#pricing"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-950/30 hover:scale-102 transition-all block text-center"
              >
                Liên Hệ Tư Vấn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16 relative z-10">
        <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-orange-600 to-amber-500 p-8 md:p-12 overflow-hidden shadow-2xl shadow-orange-950/40 text-center flex flex-col items-center">
          {/* Glowing element */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          <span className="text-xs font-black text-white/80 tracking-[0.25em] uppercase relative z-10">Sẵn Sàng Số Hóa?</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3 max-w-2xl relative z-10">
            Bắt đầu trải nghiệm menu điện tử ngay hôm nay!
          </h2>
          <p className="text-white/80 text-xs md:text-sm font-bold mt-4 max-w-lg relative z-10">
            Chỉ mất chưa đầy 5 phút để tạo thực đơn và in mã QR cho quán ăn của bạn. Hãy thử nghiệm miễn phí hoàn toàn.
          </p>

          <div className="mt-8 relative z-10 w-full sm:w-auto">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white text-orange-600 hover:bg-gray-100 rounded-2xl text-base font-black shadow-xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Xem Bảng Giá & Đăng Ký
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950/50 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <ChefHat size={16} />
              </div>
              <span className="text-base font-black text-white tracking-tight">MENU VIỆT</span>
            </div>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">
              Giải pháp menu QR điện tử toàn diện cho các đơn vị kinh doanh F&B tại Việt Nam. Vận hành tinh gọn, phục vụ nhanh chóng.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Sản Phẩm</h5>
            <ul className="space-y-2 text-xs font-bold text-gray-500">
              <li><a href="#features" className="hover:text-white transition-colors">Tính năng</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">Quy trình</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Liên Hệ Hỗ Trợ</h5>
            <ul className="space-y-2 text-xs font-bold text-gray-500">
              <li>Hotline: 090 123 4567</li>
              <li>Email: support@orderqr.id.vn</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Bảo Mật & Tin Cậy</h5>
            <div className="flex items-center gap-2 text-gray-500">
              <ShieldCheck size={18} className="text-orange-500/80" />
              <span className="text-xs font-bold">Bảo mật dữ liệu 100%</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <Zap size={18} className="text-orange-500/80" />
              <span className="text-xs font-bold">Thời gian uptime 99.9%</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-white/5 mt-10 pt-6 text-center text-xs text-gray-600 font-bold uppercase tracking-wider">
          © 2026 Triet Dang. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
