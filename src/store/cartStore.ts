import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "staff" | "kitchen" | "guest" | "superadmin";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  categoryId: number;
  discountPercent?: number;
  bannerUrl?: string;
  promoTitle?: string;
  promoDescription?: string;
}

export interface CartItem extends MenuItem {
  productId: string;
  quantity: number;
  note: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  totalPrice: number;
  status: "pending" | "cooking" | "serving" | "completed" | "cancelled";
  timestamp: string;
}

export interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  themeColor: string;
  currency: string;
  isActive: boolean;
}

interface CartStore {
  storeConfig: StoreConfig | null;
  setStoreConfig: (config: StoreConfig | null) => void;
  
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
  
  // Cart
  items: CartItem[];
  selectedTable: string;
  isTableSelectorOpen: boolean;
  
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedTable: (table: string) => void;
  setIsTableSelectorOpen: (open: boolean) => void;
  
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
      login: (role, id, storeId) => set({ 
        isLoggedIn: true, 
        userRole: role, 
        userId: id,
        userStoreId: storeId || null
      }),
      logout: () => set({ 
        isLoggedIn: false, 
        userRole: "guest", 
        userId: null,
        userStoreId: null,
        items: [],
        selectedTable: ""
      }),

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
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      
      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }),
      
      clearCart: () => set({ items: [] }),
      
      setSelectedTable: (table) => set({ selectedTable: table }),
      setIsTableSelectorOpen: (open) => set({ isTableSelectorOpen: open }),
      
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'}/stores/config?slug=${slug}`);
          if (response.ok) {
            const config = await response.json();
            set({ storeConfig: config });
          } else {
            console.error('Failed to fetch store config');
          }
        } catch (error) {
          console.error('Error fetching store config:', error);
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
        storeConfig: state.storeConfig,
      }),
    }
  )
);
