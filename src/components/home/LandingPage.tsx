"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cartStore";
import LanguageSelector from "@/components/ui/LanguageSelector";
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
  Plus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/utils/image";
import { useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";

const MOCK_WEEKLY_HEIGHTS = [30, 50, 45, 65, 80, 55, 95] as const;

export default function LandingPage() {
  const t = useTranslation();
  const { language } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState<"menu" | "kitchen" | "admin">(
    "menu",
  );
  const [monthlyPrice, setMonthlyPrice] = useState<number>(599000);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone.trim()) {
      setSubmitError(t.landing.formPhoneRequired);
      return;
    }
    if (!/^(0|\+84)\d{9,10}$/.test(formData.phone)) {
      setSubmitError(t.landing.formPhoneInvalid);
      return;
    }
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      setSubmitError(t.landing.formEmailInvalid);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      await axiosInstance.post("/contacts", formData);
      setSubmitSuccess(true);
      setFormData({ name: "", phone: "", email: "", note: "" });
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(
        error.response?.data?.message ||
        error.message ||
        t.landing.formError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/stores/premium-price")
      .then((res) => {
        if (res.data?.monthlyPrice) {
          setMonthlyPrice(res.data.monthlyPrice);
        }
      })
      .catch((err) => {
        console.error("Failed to load premium price", err);
      });
  }, []);
  const features = [
    {
      icon: <QrCode className="w-6 h-6 text-orange-500" />,
      title: t.landing.featuresList[0].title,
      desc: t.landing.featuresList[0].desc,
    },
    {
      icon: <ChefHat className="w-6 h-6 text-orange-500" />,
      title: t.landing.featuresList[1].title,
      desc: t.landing.featuresList[1].desc,
    },
    {
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      title: t.landing.featuresList[2].title,
      desc: t.landing.featuresList[2].desc,
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      title: t.landing.featuresList[3].title,
      desc: t.landing.featuresList[3].desc,
    },
    {
      icon: <Smartphone className="w-6 h-6 text-orange-500" />,
      title: t.landing.featuresList[4].title,
      desc: t.landing.featuresList[4].desc,
    },
    {
      icon: <Sparkles className="w-6 h-6 text-orange-500" />,
      title: t.landing.featuresList[5].title,
      desc: t.landing.featuresList[5].desc,
    },
  ];

  const steps = [
    {
      title: t.landing.stepsList[0].title,
      desc: t.landing.stepsList[0].desc,
    },
    {
      title: t.landing.stepsList[1].title,
      desc: t.landing.stepsList[1].desc,
    },
    {
      title: t.landing.stepsList[2].title,
      desc: t.landing.stepsList[2].desc,
    },
    {
      title: t.landing.stepsList[3].title,
      desc: t.landing.stepsList[3].desc,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden relative selection:bg-primary selection:text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse"></div>
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
              <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase block leading-none">
                Order QR
              </span>
              <span className="text-lg font-black text-white tracking-tight">
                MENU VIỆT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              {t.landing.features}
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              {t.landing.workflow}
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              {t.landing.pricing}
            </a>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <a
              href="#contact"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-950/30 hover:scale-102 transition-all flex items-center gap-1"
            >
              {t.landing.contactUs}
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
            className="md:hidden fixed top-[73px] left-0 right-0 bg-gray-950 border-b border-white/10 z-40 px-6 py-4 space-y-6 shadow-2xl"
          >
            <div className="flex flex-col gap-4 text-base font-semibold text-gray-400">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-2 border-b border-white/5"
              >
                {t.landing.features}
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-2 border-b border-white/5"
              >
                {t.landing.workflow}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-2 border-b border-white/5"
              >
                {t.landing.pricing}
              </a>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex justify-end py-1">
                <LanguageSelector />
              </div>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-black shadow-lg"
              >
                {t.landing.contactUs}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-20">
        <div className="grid grid-cols-1 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-12 flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-primary/10 text-orange-500 text-xs font-black tracking-widest uppercase mb-6"
            >
              <Sparkles size={14} className="animate-spin-slow" />
              {t.landing.heroBadge}
            </motion.div>

            {/* Headlines */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-orange-500"
            >
              {t.landing.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-base md:text-xl font-medium mt-6 leading-relaxed max-w-2xl"
            >
              {t.landing.heroDesc}
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
                {t.landing.pricingBtn}
                <ArrowRight size={18} />
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 border border-white/10 hover:border-white/20 rounded-2xl text-base font-bold bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                {t.landing.featuresBtn}
                <Play size={14} className="fill-white" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* System Experience Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">
            {t.landing.showcaseTitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            {t.landing.showcaseSubtitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            {t.landing.showcaseDesc}
          </p>
        </div>

        {/* Showcase Switcher Tabs */}
        <div className="flex bg-gray-900/60 border border-white/5 p-1.5 rounded-2xl mb-8 gap-1 w-full max-w-xl mx-auto relative z-10">
          <button
            onClick={() => setShowcaseTab("menu")}
            className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${showcaseTab === "menu" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/20" : "text-gray-400 hover:text-white"}`}
          >
            {t.landing.showcaseTabCustomer}
          </button>
          <button
            onClick={() => setShowcaseTab("kitchen")}
            className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${showcaseTab === "kitchen" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/20" : "text-gray-400 hover:text-white"}`}
          >
            {t.landing.showcaseTabKitchen}
          </button>
          <button
            onClick={() => setShowcaseTab("admin")}
            className={`flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${showcaseTab === "admin" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-950/20" : "text-gray-400 hover:text-white"}`}
          >
            {t.landing.showcaseTabAdmin}
          </button>
        </div>

        {/* Interactive Mockup Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative max-w-5xl w-full border border-white/10 bg-gray-900/40 rounded-[2rem] p-4 md:p-6 backdrop-blur-2xl shadow-3xl shadow-black/80 mx-auto"
        >
          <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-gray-950 border border-white/10 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest z-20">
            {showcaseTab === "menu" && t.landing.showcaseCustomerInterface}
            {showcaseTab === "kitchen" && t.landing.showcaseKitchenScreen}
            {showcaseTab === "admin" && t.landing.showcaseAdminSystem}
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
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white overflow-hidden shrink-0">
                            🥣
                          </div>
                          <div className="text-left">
                            <h5 className="text-[10px] font-black leading-none text-gray-900">
                              Bun Bo 97
                            </h5>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">
                              {t.landing.showcaseTableNo} 01
                            </span>
                          </div>
                        </div>
                        <ShoppingBag size={14} className="text-orange-500" />
                      </div>

                      {/* Category tabs */}
                      <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none text-[8px] font-black uppercase tracking-wider">
                        <span className="px-2 py-1 bg-primary text-white rounded-full">
                          {t.landing.showcaseMainDish}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                          {t.landing.showcaseDrinks}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                          {t.landing.showcaseDesserts}
                        </span>
                      </div>
                    </div>

                    {/* Menu list */}
                    <div className="flex-grow py-3 px-3 space-y-3 overflow-y-auto bg-gray-50">
                      <div className="bg-white rounded-2xl p-2.5 border border-gray-100 flex gap-2.5 shadow-sm relative overflow-hidden">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center relative">
                          <img
                            src={getImageUrl(
                              "/public/uploads/1778770335484-images.jpeg",
                            )}
                            alt={t.landing.showcaseDish1Name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <span className="absolute text-sm">🥣</span>
                        </div>
                        <div className="text-left flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-1">
                              {t.landing.showcaseDish1Name}
                            </p>
                            <p className="text-[8px] text-gray-400 line-clamp-1 mt-0.5">
                              {t.landing.showcaseDish1Desc}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-[10px] font-black text-orange-500">
                              65.000 đ
                            </span>
                            <button className="w-5 h-5 rounded-lg bg-primary text-white flex items-center justify-center active:scale-90">
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
                            <p className="text-[10px] font-bold text-gray-900 leading-tight line-clamp-1">
                              {t.landing.showcaseDish2Name}
                            </p>
                            <p className="text-[8px] text-gray-400 line-clamp-1 mt-0.5">
                              {t.landing.showcaseDish2Desc}
                            </p>
                          </div>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-[10px] font-black text-orange-500">
                              30.000 đ
                            </span>
                            <button className="w-5 h-5 rounded-lg bg-primary text-white flex items-center justify-center active:scale-90">
                              <Plus className="w-3 h-3" strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order button */}
                    <div className="pt-2 border-t border-gray-100 bg-white p-3 shrink-0">
                      <div className="w-full py-2 bg-primary rounded-xl text-[10px] font-black text-white flex items-center justify-center gap-1 shadow-lg shadow-primary active:scale-98">
                        {t.landing.showcaseSendToKitchen}
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
                      <span className="font-black tracking-wider text-orange-500">
                        {t.landing.showcaseKitchenBoard}
                      </span>
                      <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full">
                        Connected ✔
                      </span>
                    </div>
                    <div className="flex-grow p-3 grid grid-cols-2 gap-3 bg-gray-950 overflow-y-auto">
                      <div className="bg-gray-900 rounded-xl p-3 border border-orange-500/30 flex flex-col justify-between h-fit min-h-[140px]">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-black text-xs text-orange-400">
                              {t.landing.showcaseTableNo.toUpperCase()}: 01
                            </span>
                            <span className="text-[8px] text-gray-500">
                              {t.landing.showcaseJustNow}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[10px] text-left">
                            <div className="flex justify-between font-bold text-gray-300">
                              <span>1x {t.landing.showcaseDish1Name}</span>
                              <span className="text-orange-500 font-black animate-pulse">
                                {t.landing.showcaseCooking}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-300">
                              <span>1x {t.landing.showcaseDish2Name}</span>
                              <span className="text-green-500">{t.ordersDrawer.done} ✔</span>
                            </div>
                          </div>
                        </div>
                        <button className="w-full mt-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-primary transition-all">
                          {t.landing.showcaseDoneAll}
                        </button>
                      </div>

                      <div className="bg-gray-900 rounded-xl p-3 border border-white/5 flex flex-col justify-between h-fit min-h-[140px]">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-black text-xs text-gray-400">
                              {t.landing.showcaseTableNo.toUpperCase()}: 03
                            </span>
                            <span className="text-[8px] text-gray-500">
                              5 {t.landing.showcaseMinsAgo}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[10px] text-left">
                            <div className="flex justify-between font-bold text-gray-300">
                              <span>2x {t.landing.showcaseDish3Name}</span>
                              <span className="text-orange-500 font-black animate-pulse">
                                {t.landing.showcaseCooking}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="w-full mt-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-primary transition-all">
                          {t.landing.showcaseDoneAll}
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
                      <span className="text-gray-500 text-[8px]">
                        bun-bo.orderqr.id.vn/admin
                      </span>
                      <div className="w-6"></div>
                    </div>
                    <div className="flex-grow flex bg-gray-950 text-left">
                      <div className="w-24 bg-gray-900/60 border-r border-white/5 p-2 space-y-1 font-bold shrink-0">
                        <div className="px-2 py-1 bg-primary/10 text-orange-500 rounded flex items-center gap-1">
                          📊 {t.landing.showcaseDashboard}
                        </div>
                        <div className="px-2 py-1 text-gray-500 hover:text-gray-300 rounded flex items-center gap-1">
                          🍲 {t.landing.showcaseMenuTitle}
                        </div>
                        <div className="px-2 py-1 text-gray-500 hover:text-gray-300 rounded flex items-center gap-1">
                          🪑 {t.landing.showcaseTableMap}
                        </div>
                        <div className="px-2 py-1 text-gray-500 hover:text-gray-300 rounded flex items-center gap-1">
                          📈 {t.landing.showcaseRevenue}
                        </div>
                      </div>
                      <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-900 p-2 rounded-lg border border-white/5">
                            <span className="text-[7px] text-gray-500 uppercase block font-black">
                              {t.landing.showcaseToday}
                            </span>
                            <span className="text-[10px] font-black text-white mt-0.5 block">
                              2.350.000 đ
                            </span>
                          </div>
                          <div className="bg-gray-900 p-2 rounded-lg border border-white/5">
                            <span className="text-[7px] text-gray-500 uppercase block font-black">
                              {t.landing.showcaseOrdersCount}
                            </span>
                            <span className="text-[10px] font-black text-white mt-0.5 block">
                              36 {t.landing.showcaseOrdersUnit}
                            </span>
                          </div>
                          <div className="bg-gray-900 p-2 rounded-lg border border-white/5">
                            <span className="text-[7px] text-gray-500 uppercase block font-black">
                              {t.landing.showcaseTopSelling}
                            </span>
                            <span className="text-[8px] font-black text-orange-500 mt-0.5 block truncate">
                              {t.landing.showcaseDishShort}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-900/40 border border-white/5 rounded-lg p-2">
                          <p className="text-[7px] text-gray-500 uppercase font-black mb-1.5">
                            {t.landing.showcaseWeeklyRevenue}
                          </p>
                          <div className="h-24 flex items-end justify-between px-1 gap-1 pt-2">
                            {MOCK_WEEKLY_HEIGHTS.map((val, idx) => (
                              <div
                                key={idx}
                                className="flex-grow flex flex-col items-center gap-1"
                              >
                                <div
                                  className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t"
                                  style={{ height: `${val * 0.5}px` }}
                                ></div>
                                <span className="text-[6px] text-gray-600">
                                  {[t.landing.showcaseMon, t.landing.showcaseTue, t.landing.showcaseWed, t.landing.showcaseThu, t.landing.showcaseFri, t.landing.showcaseSat, t.landing.showcaseSun][idx]}
                                </span>
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
                {t.landing.showcaseRightTag}
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
                      {t.landing.showcaseCustomerTitle}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      {t.landing.showcaseCustomerDesc}
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
                      {t.landing.showcaseKitchenTitle}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      {t.landing.showcaseKitchenDesc}
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
                      {t.landing.showcaseAdminTitle}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                      {t.landing.showcaseAdminDesc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 pt-2">
                {showcaseTab === "menu" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkCustomer1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkCustomer2}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkCustomer3}
                      </span>
                    </div>
                  </>
                )}
                {showcaseTab === "kitchen" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkKitchen1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkKitchen2}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkKitchen3}
                      </span>
                    </div>
                  </>
                )}
                {showcaseTab === "admin" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkAdmin1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkAdmin2}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-orange-500">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm font-bold text-gray-300">
                        {t.landing.checkAdmin3}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">
            {t.landing.featuresSectionTag}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            {t.landing.featuresSectionTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            {t.landing.featuresSectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, borderColor: "rgba(249, 115, 22, 0.3)" }}
              className="bg-gray-900/20 border border-white/5 rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
      <section
        id="workflow"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">
            {t.landing.workflowSectionTag}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            {t.landing.workflowSectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex gap-4 ${activeStep === idx ? "bg-primary/10 border-orange-500" : "bg-gray-900/10 border-white/5 hover:border-white/10"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${activeStep === idx ? "bg-primary text-white" : "bg-gray-800 text-gray-400"}`}
                >
                  {idx + 1}
                </div>
                <div className="text-left">
                  <h5
                    className={`font-black text-sm ${activeStep === idx ? "text-orange-500" : "text-white"}`}
                  >
                    {step.title}
                  </h5>
                  <p className="text-gray-400 text-[11px] md:text-xs font-medium mt-1 leading-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 aspect-[16/10] bg-gray-900/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-2xl flex items-center justify-center min-h-[360px]">
            {/* Background glowing sphere inside box */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

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
                      <div className="w-full py-1 bg-primary text-white text-[7px] font-black rounded uppercase mb-2">
                        {t.tables.scanToOrder.toUpperCase()}
                      </div>
                      <div className="p-1.5 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                        <QrCode size={70} className="text-gray-900" />
                      </div>
                      <span className="text-[9px] font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">
                        {t.landing.showcaseTableNo.toUpperCase()} 01
                      </span>
                    </motion.div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">
                        {t.landing.stepsList?.[0]?.title}
                      </h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        {t.landing.stepsList?.[0]?.desc}
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-gray-50 border-4 border-gray-900 rounded-[1.75rem] w-[180px] h-[240px] overflow-hidden text-gray-900 flex flex-col justify-between shadow-2xl shrink-0 text-left">
                      <div className="bg-white p-2 border-b border-gray-100 flex justify-between items-center text-[7px] font-black text-gray-700">
                        <span>{t.landing.showcaseTableNo.toUpperCase()} 01</span>
                        <span className="text-orange-500">🛒 2 {t.landing.showcaseItemsUnit}</span>
                      </div>
                      <div className="p-2 space-y-1.5 flex-grow overflow-y-auto">
                        <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex gap-2 items-center">
                          <span className="text-xs">🥣</span>
                          <div className="text-[7px]">
                            <p className="font-bold text-gray-900">
                              {t.landing.showcaseDish1Name}
                            </p>
                            <p className="font-bold text-orange-500">65.000đ</p>
                          </div>
                        </div>
                        <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex gap-2 items-center">
                          <span className="text-xs">🍹</span>
                          <div className="text-[7px]">
                            <p className="font-bold text-gray-900">
                              {t.landing.showcaseDish2Name}
                            </p>
                            <p className="font-bold text-orange-500">30.000đ</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 bg-white border-t border-gray-100">
                        <div className="w-full py-1.5 bg-primary text-white rounded-lg text-[7px] font-black uppercase tracking-wider text-center animate-pulse">
                          {t.cart.checkoutButton.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">
                        {t.landing.stepsList?.[1]?.title}
                      </h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        {t.landing.stepsList?.[1]?.desc}
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-gray-900 rounded-2xl border border-white/10 w-[240px] p-3 text-left shadow-2xl shrink-0">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-2">
                        <span className="text-[8px] font-black text-orange-500">
                          {t.landing.stepsList?.[2]?.title.toUpperCase()}
                        </span>
                        <span className="text-[7px] text-gray-500">{t.landing.showcaseTableNo} 01</span>
                      </div>
                      <div className="space-y-1 text-[9px] font-bold text-gray-300">
                        <div className="flex justify-between">
                          <span>1x {t.landing.showcaseDish1Name}</span>
                          <span className="text-orange-500 font-black animate-pulse">
                            {t.landing.showcaseCooking}...
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>1x {t.landing.showcaseDish2Name}</span>
                          <span className="text-green-500">{t.ordersDrawer.done} ✔</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5">
                        <div className="w-full py-1 bg-green-600 text-white text-center rounded text-[7px] font-black uppercase tracking-wider">
                          {t.orders.statusCompleted.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">
                        {t.landing.stepsList?.[2]?.title}
                      </h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        {t.landing.stepsList?.[2]?.desc}
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 text-gray-800 w-[180px] text-left relative overflow-hidden shrink-0">
                      <div className="text-center border-b border-dashed border-gray-200 pb-2 mb-2">
                        <h5 className="font-black text-[10px] text-gray-900">
                          {t.revenue.tempReceiptTitle.toUpperCase()}
                        </h5>
                        <span className="text-[7px] text-gray-400">
                          {t.landing.showcaseTableNo} 01 • Order QR
                        </span>
                      </div>
                      <div className="space-y-1 text-[8px] font-bold text-gray-600 border-b border-dashed border-gray-200 pb-2 mb-2">
                        <div className="flex justify-between">
                          <span>1x {t.landing.showcaseDish1Name}</span>
                          <span>65k</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1x {t.landing.showcaseDish2Name}</span>
                          <span>30k</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-gray-900 mb-2">
                        <span>{t.cart.total.toUpperCase()}:</span>
                        <span className="text-orange-500">95.000đ</span>
                      </div>
                      <div className="bg-green-500 text-white text-center py-1 rounded text-[7px] font-black uppercase tracking-wider">
                        {t.revenue.statusPaid.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-black text-white">
                        {t.landing.stepsList?.[3]?.title}
                      </h4>
                      <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-sm">
                        {t.landing.stepsList?.[3]?.desc}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Registration Process Section */}
      <section
        id="registration"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">
            {t.landing.regSectionTag}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            {t.landing.regSectionTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            {t.landing.regSectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-900/10 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 shrink-0 shadow-sm">
              <Store size={24} />
            </div>
            <h4 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors">
              {t.landing.step1Title}
            </h4>
            <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed">
              {t.landing.step1Desc}
            </p>
            <div className="space-y-3 mt-6 text-left">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                  <Store size={16} />
                </div>
                <div>
                  <h6 className="text-[11px] font-black text-white uppercase tracking-wider">{t.landing.step1ContactInfo}</h6>
                  <p className="text-[10px] text-gray-400 font-medium">{t.landing.step1ContactInfoDesc}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                  <Layers size={16} />
                </div>
                <div>
                  <h6 className="text-[11px] font-black text-white uppercase tracking-wider">{t.landing.step1MenuScale}</h6>
                  <p className="text-[10px] text-gray-400 font-medium">{t.landing.step1MenuScaleDesc}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Store size={80} />
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/10 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-all duration-300 lg:col-span-1"
          >
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shrink-0 shadow-sm">
              <Layers size={24} />
            </div>
            <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
              {t.landing.step2Title}
            </h4>
            <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed mb-6">
              {t.landing.step2Desc}
            </p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                  <QrCode size={14} />
                  <span>{t.landing.step2Customer}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{t.landing.step2CustomerDesc}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-1.5 text-green-400 font-bold text-xs">
                  <ChefHat size={14} />
                  <span>{t.landing.step2Kitchen}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{t.landing.step2KitchenDesc}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                  <Smartphone size={14} />
                  <span>{t.landing.step2Staff}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{t.landing.step2StaffDesc}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                  <ShieldCheck size={14} />
                  <span>{t.landing.step2Admin}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{t.landing.step2AdminDesc}</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers size={80} />
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-900/10 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col relative overflow-hidden group hover:border-white/10 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mb-6 shrink-0 shadow-sm">
              <Sparkles size={24} />
            </div>
            <h4 className="text-xl font-black text-white group-hover:text-green-400 transition-colors">
              {t.landing.step3Title}
            </h4>
            <p className="text-gray-400 text-sm font-medium mt-4 leading-relaxed">
              {t.landing.step3Desc}
            </p>
            <div className="space-y-3 mt-6 text-left">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
                  <QrCode size={16} />
                </div>
                <div>
                  <h6 className="text-[11px] font-black text-white uppercase tracking-wider">{t.landing.step3Setup}</h6>
                  <p className="text-[10px] text-gray-400 font-medium">{t.landing.step3SetupDesc}</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h6 className="text-[11px] font-black text-white uppercase tracking-wider">{t.landing.step3Training}</h6>
                  <p className="text-[10px] text-gray-400 font-medium">{t.landing.step3TrainingDesc}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex-grow flex items-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-black uppercase tracking-wider">
                {t.landing.step3Free}
              </span>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={80} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase">
            {t.landing.pricingSectionTag}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3">
            {t.landing.pricingSectionTitle}
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            {t.landing.pricingSectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Package */}
          <div className="bg-gray-900/10 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div>
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                {t.landing.pricingFreePackageName}
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                {t.landing.pricingFreeTrial}
              </h3>
              <p className="text-gray-400 text-xs font-bold mt-2">
                {t.landing.pricingFreeTrialDesc}
              </p>
 
              <div className="flex items-baseline gap-1 mt-6 border-b border-white/5 pb-6">
                <span className="text-4xl font-black text-white">{t.landing.pricingFreePrice}</span>
                <span className="text-gray-500 text-sm font-bold">{t.landing.pricingFreeUnit}</span>
              </div>
 
              <ul className="space-y-4 mt-6 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  {t.landing.pricingFreeFeature1}
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  {t.landing.pricingFreeFeature2}
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  {t.landing.pricingFreeFeature3}
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-bold">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  {t.landing.pricingFreeFeature4}
                </li>
              </ul>
            </div>
 
            <div className="mt-8">
              <a
                href="#contact"
                className="w-full py-3.5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 transition-all block text-center"
              >
                {t.landing.pricingFreeRegister}
              </a>
            </div>
          </div>
 
          {/* Premium Package */}
          <div className="bg-gray-900/20 border-2 border-orange-500 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-orange-950/20 group">
            {/* Pop tag */}
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
              {t.landing.pricingPopular}
            </div>
 
            <div>
              <span className="text-xs font-black text-orange-500 uppercase tracking-widest">
                {t.landing.pricingProPackageName}
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                Premium Partner
              </h3>
              <p className="text-gray-400 text-xs font-bold mt-2">
                {t.landing.pricingProDesc}
              </p>
              <div className="flex items-baseline gap-1 mt-6 border-b border-orange-500/20 pb-6">
                <span className="text-4xl font-black text-white">
                  {monthlyPrice.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}{language === "vi" ? "đ" : " VND"}
                </span>
                <span className="text-gray-500 text-sm font-bold">{t.landing.pricingProUnit}</span>
              </div>

              <ul className="space-y-4 mt-6 text-left">
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2
                    size={16}
                    className="text-orange-500 shrink-0"
                  />
                  {t.landing.pricingProFeature1}
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2
                    size={16}
                    className="text-orange-500 shrink-0"
                  />
                  {t.landing.pricingProFeature2}
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2
                    size={16}
                    className="text-orange-500 shrink-0"
                  />
                  {t.landing.pricingProFeature3}
                </li>
                <li className="flex items-center gap-3 text-xs md:text-sm text-gray-200 font-bold">
                  <CheckCircle2
                    size={16}
                    className="text-orange-500 shrink-0"
                  />
                  {t.landing.pricingProFeature4}
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href="#contact"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-950/30 hover:scale-102 transition-all block text-center"
              >
                {t.landing.pricingProContact}
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

          <span className="text-xs font-black text-white/80 tracking-[0.25em] uppercase relative z-10">
            {t.landing.readyTitle}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3 max-w-2xl relative z-10">
            {t.landing.readySubtitle}
          </h2>
          <p className="text-white/80 text-xs md:text-sm font-bold mt-4 max-w-lg relative z-10">
            {t.landing.readyDesc}
          </p>

          <div className="mt-8 relative z-10 w-full sm:w-auto">
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary hover:bg-gray-100 rounded-2xl text-base font-black shadow-xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              {t.landing.readyRegister}
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="max-w-4xl mx-auto px-4 md:px-8 py-20 border-t border-white/5 relative z-10 scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black text-orange-500 tracking-[0.25em] uppercase animate-pulse">
            {t.landing.regSectionTitleShort}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-3 bg-clip-text bg-gradient-to-r from-white to-orange-500 text-transparent">
            {t.landing.regSectionHeading}
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-medium mt-4">
            {t.landing.regSectionSubtitle}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative border border-white/10 bg-gray-900/40 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-2xl shadow-3xl shadow-black/80 max-w-2xl mx-auto"
        >
          {/* Subtle glowing blob behind card */}
          <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[140%] rounded-full bg-orange-600/5 blur-[80px] pointer-events-none -z-10"></div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label htmlFor="name" className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                {t.landing.formName}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={t.landing.formNamePlaceholder}
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-medium text-sm md:text-base"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                {t.landing.formPhone} <span className="text-orange-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder={t.landing.formPhonePlaceholder}
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-medium text-sm md:text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                {t.landing.formEmail}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t.landing.formEmailPlaceholder}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-medium text-sm md:text-base"
              />
            </div>

            <div>
              <label htmlFor="note" className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">
                {t.landing.formNote}
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                placeholder={t.landing.formNotePlaceholder}
                value={formData.note}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all font-medium text-sm md:text-base resize-none"
              />
            </div>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs md:text-sm font-bold flex items-center gap-2"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{t.landing.formSuccess}</span>
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs md:text-sm font-bold flex items-center gap-2"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{submitError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-base font-black shadow-xl shadow-orange-950/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{t.landing.formSubmit}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950/50 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <ChefHat size={16} />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                MENU VIỆT
              </span>
            </div>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">
              {t.landing.footerDesc}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {t.landing.footerProduct}
            </h5>
            <ul className="space-y-2 text-xs font-bold text-gray-500">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  {t.landing.footerFeatures}
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-white transition-colors"
                >
                  {t.landing.footerWorkflow}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  {t.landing.footerPricing}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {t.landing.footerSupport}
            </h5>
            <ul className="space-y-2 text-xs font-bold text-gray-500">
              <li>Hotline: 0707.898.849</li>
              <li>Email: triet.dang.dev@gmail.com</li>
              <li>
                <a
                  href="https://zalo.me/0707898849"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 mt-2 text-[#0068FF] font-bold"
                >
                  {t.landing.footerZalo}
                </a>
              </li>
            </ul>
          </div>
 
          <div className="space-y-3">
            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {t.landing.footerSecurity}
            </h5>
            <div className="flex items-center gap-2 text-gray-500">
              <ShieldCheck size={18} className="text-orange-500/80" />
              <span className="text-xs font-bold">{t.landing.footerSecurityDesc}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <Zap size={18} className="text-orange-500/80" />
              <span className="text-xs font-bold">{t.landing.footerUptime}</span>
            </div>
          </div>
        </div>
 
        <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-white/5 mt-10 pt-6 text-center text-xs text-gray-600 font-bold uppercase tracking-wider">
          © 2026 Triet Dang. All Rights Reserved.
        </div>
      </footer>
 
      {/* Floating Zalo Button */}
      <a
        href="https://zalo.me/0707898849"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[999] bg-[#0068FF] hover:bg-[#0056d2] w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,104,255,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        title={t.landing.footerZaloTitle}
      >
        {/* Ripple Ping effect */}
        <span className="absolute inset-0 rounded-full bg-[#0068FF] opacity-60 animate-ping group-hover:animate-none"></span>
        
        {/* Zalo Text Icon */}
        <span className="relative text-white font-black text-[15px] select-none tracking-tighter">Zalo</span>
      </a>
    </div>
  );
}
