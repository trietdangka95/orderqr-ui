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
    <div className={`bg-white p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group h-full min-w-0 ${href ? "cursor-pointer hover:border-primary/30 transition-all hover:-translate-y-1" : ""}`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgClass} ${colorClass} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 shrink-0 shadow-sm`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="w-full min-w-0">
        <div 
          className="text-base sm:text-xl lg:text-base xl:text-2xl font-black text-gray-900 mb-0.5 sm:mb-1 truncate w-full"
          title={value.toString()}
        >
          {value}
        </div>
        <div 
          className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-wider truncate w-full"
          title={label}
        >
          {label}
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-16 h-16 sm:w-20 sm:h-20" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
