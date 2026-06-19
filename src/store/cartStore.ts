import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "@/api/axiosInstance";
import { authApi } from "@/api/auth";

export type UserRole = "admin" | "staff" | "kitchen" | "guest" | "superadmin" | "super_admin";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: string;
  categoryId: number;
  discountPercent?: number;
  bannerUrl?: string;
  promoTitle?: string;
  promoDescription?: string;
  isAvailable?: boolean;
}

export interface CartItem extends MenuItem {
  productId: string;
  quantity: number;
  note: string;
}

export type OrderStatus = "pending" | "cooking" | "serving" | "completed" | "cancelled";

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  isConfirmed?: boolean;
  timestamp: string | number;
}

export interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  themeColor: string;
  currency: string;
  isActive: boolean;
  tables: string[];
  users?: { username: string }[];
  subscriptionPlan?: "FREE" | "PREMIUM";
  subscriptionStatus?: string;
  subscriptionEnd?: string | null;
  bankId?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  description?: string | null;
}

interface CartStore {
  storeConfig: StoreConfig | null;
  setStoreConfig: (config: StoreConfig | null) => void;
  storeError: { status: number; message: string } | null;
  setStoreError: (error: { status: number; message: string } | null) => void;
  
  // UI State
  isOpen: boolean;
  toggleCart: () => void;
  isOrdersOpen: boolean;
  toggleOrders: () => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  
  // Auth
  isLoggedIn: boolean;
  userRole: UserRole;
  userId: string | null;
  userStoreId: string | null;
  login: (role: UserRole, id: string, storeId?: string | null) => void;
  logout: () => void;
  activeStaffName: string | null;
  setActiveStaffName: (name: string | null) => void;
  
  // Toast Feedback
  toastMessage: string | null;
  setToastMessage: (message: string | null) => void;
  
  // Cart
  items: CartItem[];
  selectedTable: string;
  isTableSelectorOpen: boolean;
  
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
  setSelectedTable: (table: string) => void;
  setIsTableSelectorOpen: (open: boolean) => void;
  
  // Tables Management
  tables: string[];
  addTable: (table: string) => Promise<void> | void;
  addMultipleTables: (count: number) => Promise<void> | void;
  removeTable: (table: string) => Promise<void> | void;
  
  // Orders & Revenue (Mocked for now, should be API-driven)
  orders: Order[];
  addOrder: (order: Order) => void;
  revenue: { id: string; totalAmount: number; timestamp: string }[];
  addRevenue: (amount: number) => void;
  
  getTotalItems: () => number;
  getTotalPrice: () => number;
  fetchStoreConfig: (slug: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      storeConfig: null,
      setStoreConfig: (config) => set({ storeConfig: config }),
      storeError: null,
      setStoreError: (error) => set({ storeError: error }),

      isOpen: false,
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      isOrdersOpen: false,
      toggleOrders: () => set((state) => ({ isOrdersOpen: !state.isOrdersOpen })),
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),

      isLoggedIn: false,
      userRole: "guest",
      userId: null,
      userStoreId: null,
      activeStaffName: null,
      setActiveStaffName: (name) => set({ activeStaffName: name }),
      login: (role, id, storeId) => set({ 
        isLoggedIn: true, 
        userRole: role, 
        userId: id,
        userStoreId: storeId || null
      }),
      logout: () => {
        authApi.logout();
        set({ 
          isLoggedIn: false, 
          userRole: "guest", 
          userId: null,
          userStoreId: null,
          items: [],
          selectedTable: "",
          activeStaffName: null
        });
      },

      toastMessage: null,
      setToastMessage: (message) => set({ toastMessage: message }),

      items: [],
      selectedTable: "",
      isTableSelectorOpen: false,
      
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.productId === item.productId);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.productId === item.productId
                ? { 
                    ...i, 
                    quantity: i.quantity + item.quantity,
                    note: item.note 
                      ? (i.note ? `${i.note}, ${item.note}` : item.note) 
                      : i.note
                  }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }

        // Set toast message with emoji feedback
        set({ toastMessage: `Đã thêm món ${item.name} vào giỏ!` });
      },
      
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      
      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }),
      
      updateNote: (productId, note) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, note } : i
          ),
        }),
      
      clearCart: () => set({ items: [] }),
      
      setSelectedTable: (table) => set({ selectedTable: table }),
      setIsTableSelectorOpen: (open) => set({ isTableSelectorOpen: open }),
      
      tables: ["01", "02", "03", "04", "05", "Take-Away"], // Mặc định
      addTable: async (table) => {
        const newTables = [...get().tables, table].sort((a, b) => a.localeCompare(b));
        set({ tables: newTables });
        if (get().userRole === "admin") {
          try {
            await axiosInstance.put("/tables", { tables: newTables });
          } catch (e) {
            console.error("Failed to sync tables:", e);
          }
        }
      },
      addMultipleTables: async (count) => {
        const numericTables = get().tables
          .map(t => parseInt(t, 10))
          .filter(n => !isNaN(n));
        const lastNum = numericTables.length > 0 ? Math.max(...numericTables) : 0;
        const newTables = Array.from({ length: count }, (_, i) => 
          (lastNum + i + 1).toString().padStart(2, "0")
        );
        const updatedTables = [...get().tables, ...newTables].sort((a, b) => a.localeCompare(b));
        set({ tables: updatedTables });
        if (get().userRole === "admin") {
          try {
            await axiosInstance.put("/tables", { tables: updatedTables });
          } catch (e) {
            console.error("Failed to sync tables:", e);
          }
        }
      },
      removeTable: async (table) => {
        const newTables = get().tables.filter((t) => t !== table);
        set({ tables: newTables });
        if (get().userRole === "admin") {
          try {
            await axiosInstance.put("/tables", { tables: newTables });
          } catch (e) {
            console.error("Failed to sync tables:", e);
          }
        }
      },
      
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      
      revenue: [],
      addRevenue: (amount) => set({ 
        revenue: [...get().revenue, { id: Math.random().toString(), totalAmount: amount, timestamp: new Date().toISOString() }] 
      }),
      
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      fetchStoreConfig: async (slug) => {
        try {
          set({ storeError: null });
          const currentConfig = get().storeConfig;
          if (currentConfig && currentConfig.slug !== slug) {
            set({ storeConfig: null });
          }

          const response = await axiosInstance.get(`/stores/config?slug=${slug}`);
          const config = response.data;

          if (currentConfig && config && currentConfig.id !== config.id) {
            set({
              selectedTable: "",
              items: [],
              userRole: "guest",
              isLoggedIn: false,
              userId: null,
              userStoreId: null,
            });
          }

          set({ storeConfig: config });
          if (config && config.tables) {
            set({ tables: config.tables });
          }
        } catch (error: any) {
          console.error('Error fetching store config:', error);
          set({
            storeError: {
              status: error.response?.status || 500,
              message: error.response?.data?.message || 'Có lỗi xảy ra khi tải cấu hình',
            },
            storeConfig: null,
          });
        }
      },
    }),
    {
      name: "cart-storage",
      // Important: only persist specific parts to avoid multi-store leakage in shared browsers
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userRole: state.userRole,
        userId: state.userId,
        userStoreId: state.userStoreId,
        selectedTable: state.selectedTable,
        storeConfigId: state.storeConfig?.id,
        activeStaffName: state.activeStaffName,
      }),
    }
  )
);
