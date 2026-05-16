"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface AdminStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colorClass: string;
  bgClass: string;
  href?: string;
}

export default function AdminStatCard({
  icon: Icon,
  value,
  label,
  colorClass,
  bgClass,
  href,
}: AdminStatCardProps) {
  const content = (
    <div className={`bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group h-full ${href ? "cursor-pointer hover:border-primary/30 transition-all hover:-translate-y-1" : ""}`}>
      <div className={`w-12 h-12 ${bgClass} ${colorClass} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon size={24} />
      </div>
      <div className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{label}</div>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
