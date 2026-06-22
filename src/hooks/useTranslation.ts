import { useCartStore } from "@/store/cartStore";
import { vi } from "@/locales/vi";
import { en } from "@/locales/en";

export function useTranslation() {
  const language = useCartStore((state) => state.language) || "vi";
  return language === "vi" ? vi : en;
}
