import { TranslationSchema } from "@/locales/types";

type ErrorLike = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

const normalize = (message: string) =>
  message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function translateApiError(
  error: unknown,
  t: TranslationSchema,
  fallback?: string
) {
  const errorLike = error as ErrorLike;
  const rawMessage =
    typeof error === "string"
      ? error
      : errorLike?.response?.data?.message || errorLike?.message || "";

  if (!rawMessage) return fallback || t.apiErrors.default;

  const message = normalize(rawMessage);

  if (message.includes("store context missing")) return t.apiErrors.storeContextMissing;
  if (message.includes("store not found") || message.includes("khong tim thay cua hang")) return t.apiErrors.storeNotFound;
  if (message.includes("store is currently inactive")) return t.apiErrors.storeInactive;
  if (message.includes("subscription has expired") || message.includes("goi dich vu cua cua hang da het han")) return t.apiErrors.storeExpired;
  if (message.includes("product not found in this store")) return t.apiErrors.productNotFound;
  if (message.includes("no file uploaded")) return t.apiErrors.noFileUploaded;
  if (message.includes("invalid file type")) return t.apiErrors.invalidFileType;
  if (message.includes("invalid credentials")) return t.apiErrors.invalidCredentials;
  if (message.includes("token khong hop le")) return t.apiErrors.tokenInvalid;
  if (message.includes("token het han") || message.includes("token expired")) return t.apiErrors.tokenExpired;
  if (message.includes("user not found") || message.includes("khong tim thay nguoi dung")) return t.apiErrors.userNotFound;
  if (message.includes("old password is incorrect") || message.includes("mat khau khong chinh xac")) return t.apiErrors.oldPasswordIncorrect;
  if (message.includes("username") && message.includes("already exists")) return t.apiErrors.usernameExists;
  if (message.includes("renewal request not found")) return t.apiErrors.renewalNotFound;
  if (message.includes("renewal request is already processed")) return t.apiErrors.renewalProcessed;
  if (message.includes("order not found") || message.includes("khong tim thay don hang")) return t.apiErrors.orderNotFound;
  if (message.includes("product not found in this order")) return t.apiErrors.productNotFoundInOrder;
  if (message.includes("khong the chinh sua so luong")) return t.apiErrors.cannotEditCookedItem;
  if (message.includes("no pending orders")) return t.apiErrors.noPendingOrders;
  if (message.includes("invoice not found")) return t.apiErrors.invoiceNotFound;
  if (message.includes("so ban khong khop")) return t.apiErrors.tableMismatch;
  if (message.includes("chi co the huy don hang")) return t.apiErrors.cancelPendingOnly;
  if (message.includes("yeu cau xac thuc 2fa")) return t.apiErrors.twoFactorRequired;
  if (message.includes("ma xac thuc khong chinh xac")) return t.apiErrors.twoFactorInvalid;
  if (message.includes("forbidden")) return t.apiErrors.forbidden;

  return fallback || t.apiErrors.default;
}
