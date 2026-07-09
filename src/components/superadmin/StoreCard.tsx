import { motion } from "framer-motion";
import { Store, Globe, Layout, ToggleLeft, ToggleRight, Edit, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { Store as StoreData } from "@/api/superadmin";
import { showConfirm } from "@/store/dialogStore";
import { getImageUrl } from "@/utils/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/store/cartStore";
 
interface StoreCardProps {
  store: StoreData;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onEdit: (store: StoreData) => void;
  onDelete: (id: string) => void;
}
 
export function StoreCard({
  store,
  onToggleStatus,
  onEdit,
  onDelete,
}: StoreCardProps) {
  const t = useTranslation();
  const { language } = useCartStore();
  const locale = language === "vi" ? "vi-VN" : "en-US";
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn";
  const cleanMainDomain = mainDomain.split(":")[0];
  const port = mainDomain.split(":")[1] ? `:${mainDomain.split(":")[1]}` : "";
  const isLocal = cleanMainDomain.includes("localhost") || cleanMainDomain.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  const storeUrl = `${protocol}://${store.slug}.${cleanMainDomain}${port}`;
 
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6"
    >
      {(() => {
        const isExpired = store.subscriptionEnd && new Date() > new Date(store.subscriptionEnd);
        const daysLeft = store.subscriptionEnd 
          ? Math.ceil((new Date(store.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
          : null;
 
        return (
          <div className="flex items-center gap-6 flex-1 w-full">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 border border-gray-100 overflow-hidden relative shrink-0">
              {store.logo ? (
                <img src={getImageUrl(store.logo)} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store size={32} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-gray-900">{store.name}</h2>
                {store.isActive ? (
                  <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase">{t.common.active}</span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase">{t.common.inactive}</span>
                )}
                {isExpired || store.subscriptionStatus === 'EXPIRED' ? (
                  <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full uppercase animate-pulse">{t.common.expired}</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest items-center">
                <div className="flex items-center gap-1.5">
                  <Globe size={14} className="text-blue-500" />
                  <span>{store.slug}.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layout size={14} className="text-purple-500" />
                  <span className="flex items-center gap-1">
                    {t.superadmin.theme}:
                    <span className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: store.themeColor }}></span>
                  </span>
                </div>
                {store.users && store.users.length > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {t.superadmin.adminLabel}: {store.users[0].username}
                  </div>
                )}
                
                <div className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  store.subscriptionPlan === 'PREMIUM'
                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {t.superadmin.planLabel}: {store.subscriptionPlan || 'FREE'}
                </div>
 
                {store.subscriptionEnd && (
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 border rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    isExpired || store.subscriptionStatus === 'EXPIRED'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : daysLeft !== null && daysLeft <= 7
                      ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      : 'bg-green-50 text-green-600 border-green-100'
                  }`}>
                    {isExpired || store.subscriptionStatus === 'EXPIRED'
                      ? t.superadmin.expiryUseExpired
                      : daysLeft !== null && daysLeft < 0
                      ? t.superadmin.expiryExpired
                      : t.superadmin.expiryDays.replace("{days}", String(daysLeft))}
                  </div>
                )}
 
                {store.subscriptionPrice !== undefined && Number(store.subscriptionPrice) > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {t.superadmin.priceLabel}: {Number(store.subscriptionPrice).toLocaleString(locale)}₫
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
 
      <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0">
        <button
          onClick={() => onToggleStatus(store.id, store.isActive)}
          className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
            store.isActive ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {store.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          <span className="lg:hidden xl:inline">{store.isActive ? t.superadmin.deactivate : t.superadmin.activate}</span>
        </button>
        <button
          onClick={() => onEdit(store)}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
        >
          <Edit size={20} />
          <span className="lg:hidden xl:inline">{t.common.edit}</span>
        </button>
        <Link
          href={storeUrl}
          target="_blank"
          className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          <ExternalLink size={20} />
        </Link>
        <button
          onClick={async () => {
            if (await showConfirm(t.superadmin.deleteStoreConfirm)) {
              onDelete(store.id);
            }
          }}
          className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
}
