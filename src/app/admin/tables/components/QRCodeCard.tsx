"use client";
 
import { QRCodeSVG } from "qrcode.react";
import { X as XIcon } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/utils/image";
 
interface QRCodeCardProps {
  tableNum: string;
  qrLink: string;
  onRemove: (tableNum: string) => void;
}
 
export default function QRCodeCard({ tableNum, qrLink, onRemove }: QRCodeCardProps) {
  const { storeConfig } = useCartStore();
  const themeColor = storeConfig?.themeColor || "#f97316";
  const storeName = storeConfig?.name || "Menu Việt";
  const logoUrl = storeConfig?.logo ? getImageUrl(storeConfig.logo) : undefined;
 
  return (
    <div className="print-qr-card bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between items-center text-center group hover:shadow-xl hover:border-orange-200 transition-all duration-500 break-inside-avoid relative overflow-hidden aspect-[2/3] w-full">
      {/* Delete button (only visible on hover and not during print) */}
      <button
        onClick={() => {
          if (confirm(`Xóa bàn ${tableNum}?`)) onRemove(tableNum);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all print:hidden z-20 shadow-sm"
      >
        <XIcon size={16} />
      </button>
 
      {/* Scissor icon for print cutting line guide */}
      <span className="hidden print:block absolute top-2 right-2 text-gray-300 text-[10px]">✂️</span>
 
      {/* Premium Header Banner */}
      <div 
        className="w-full py-2.5 rounded-2xl text-white flex flex-col items-center justify-center shadow-md shadow-black/5 shrink-0"
        style={{ backgroundColor: themeColor }}
      >
        <span className="text-[8px] font-black tracking-[0.2em] uppercase opacity-90 mb-0.5">QUÉT MÃ GỌI MÓN</span>
        <span className="text-xs font-black tracking-tight truncate w-full px-3">{storeName}</span>
      </div>
 
      {/* QR Code Container */}
      <div className="p-2.5 bg-white border-4 border-gray-50 rounded-2xl group-hover:border-orange-50 transition-colors flex items-center justify-center my-2 shrink-0">
        <QRCodeSVG
          value={qrLink}
          size={110}
          level="H"
          includeMargin={false}
          imageSettings={logoUrl ? {
            src: logoUrl,
            x: undefined,
            y: undefined,
            height: 22,
            width: 22,
            excavate: true,
          } : undefined}
        />
      </div>
 
      {/* Table Number Badge */}
      <div 
        className="px-4 py-1.5 rounded-full text-white font-black text-[11px] uppercase tracking-wider shadow-sm mb-2 shrink-0 animate-pulse"
        style={{ backgroundColor: themeColor }}
      >
        BÀN SỐ: {tableNum}
      </div>
 
      {/* Compact Instructions */}
      <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider space-y-1 my-1 shrink-0">
        <div className="flex items-center justify-center gap-1">
          <span>📱</span>
          <span>1. Mở camera quét mã QR</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span>🍲</span>
          <span>2. Xem menu & Chọn món</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span>🚀</span>
          <span>3. Đặt món ngay tại bàn</span>
        </div>
      </div>
 
      {/* Clean elegant footer */}
      <div className="text-[7px] text-gray-400 font-bold tracking-[0.15em] uppercase border-t border-gray-100 pt-2 w-full shrink-0">
        Chúc quý khách ngon miệng!
      </div>
    </div>
  );
}
