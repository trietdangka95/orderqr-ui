import { StoreConfig } from "@/store/cartStore";

/**
 * Formats price cleanly based on the store's configured currency code and user's language.
 * Always respects the currency code from the configuration (VND, USD, etc.)
 */
export const formatPrice = (
  price: number,
  storeConfig: StoreConfig | null,
  language: "vi" | "en"
): string => {
  const currencyCode = storeConfig?.currency || "VND";
  const isVND = currencyCode.toUpperCase() === "VND";
  const locale = language === "vi" ? "vi-VN" : "en-US";

  if (isVND) {
    // For VND, we always use the '₫' symbol and standard digit grouping
    return price.toLocaleString(locale) + "\u00A0₫";
  } else if (currencyCode.toUpperCase() === "USD") {
    // For USD, use '$' symbol as a prefix
    return "$\u00A0" + price.toLocaleString(locale);
  } else {
    // Fallback for other currencies: currency code as prefix
    return currencyCode.toUpperCase() + "\u00A0" + price.toLocaleString(locale);
  }
};
