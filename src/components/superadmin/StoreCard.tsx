import { motion } from "framer-motion";
import { Store, Globe, Layout, ToggleLeft, ToggleRight, Edit, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { Store as StoreData } from "@/api/superadmin";

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
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-6 flex-1 w-full">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 border border-gray-100">
          <Store size={32} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-gray-900">{store.name}</h2>
            {store.isActive ? (
              <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase">Active</span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase">Inactive</span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest items-center">
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-blue-500" />
              <span>{store.slug}.{process.env.NEXT_PUBLIC_MAIN_DOMAIN || "orderqr.id.vn"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layout size={14} className="text-purple-500" />
              <span className="flex items-center gap-1">
                Theme:
                <span className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: store.themeColor }}></span>
              </span>
            </div>
            {store.users && store.users.length > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Admin: {store.users[0].username}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
        <button
          onClick={() => onToggleStatus(store.id, store.isActive)}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
            store.isActive ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {store.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          <span className="md:hidden lg:inline">{store.isActive ? "Deactivate" : "Activate"}</span>
        </button>
        <button
          onClick={() => onEdit(store)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
        >
          <Edit size={20} />
          <span className="md:hidden lg:inline">Edit</span>
        </button>
        <Link
          href={`/?store=${store.slug}`}
          target="_blank"
          className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        >
          <ExternalLink size={20} />
        </Link>
        <button
          onClick={() => {
            if (confirm("Delete this store?")) {
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
