import { create } from "zustand";

interface DialogOptions {
  type: "alert" | "confirm";
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface DialogState {
  isOpen: boolean;
  type: "alert" | "confirm";
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: ((value: boolean) => void) | null;
  show: (options: DialogOptions) => Promise<boolean>;
  close: (value: boolean) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  type: "alert",
  title: "",
  message: "",
  confirmText: "",
  cancelText: "",
  resolve: null,
  show: (options) => {
    // If there is an existing dialog open, resolve it first as canceled
    const currentResolve = get().resolve;
    if (currentResolve) {
      currentResolve(false);
    }

    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        type: options.type,
        title: options.title || (options.type === "confirm" ? "Xác nhận" : "Thông báo"),
        message: options.message,
        confirmText: options.confirmText || "Xác nhận",
        cancelText: options.cancelText || "Hủy",
        resolve,
      });
    });
  },
  close: (value) => {
    const { resolve } = get();
    if (resolve) {
      resolve(value);
    }
    set({ isOpen: false, resolve: null });
  },
}));

// Quick helpers for direct, direct-import usage (can be used in pure functions or React handlers)
export const showConfirm = (
  message: string,
  title?: string,
  confirmText?: string,
  cancelText?: string
) =>
  useDialogStore.getState().show({
    type: "confirm",
    message,
    title,
    confirmText,
    cancelText,
  });

export const showAlert = (
  message: string,
  title?: string,
  confirmText?: string
) =>
  useDialogStore.getState().show({
    type: "alert",
    message,
    title,
    confirmText,
  });
