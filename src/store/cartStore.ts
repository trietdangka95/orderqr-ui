import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  note: string;
};

export type OrderStatus = "pending" | "cooking" | "serving" | "completed";

export type Order = {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  timestamp: number;
  tableNumber: string;
};
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  orders: Order[];
  isOrdersOpen: boolean;
  adminMenu: MenuItem[];
  
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  toggleCart: () => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;

  submitOrder: () => void;
  toggleOrders: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clearTableOrders: (tableNumber: string) => void;
  
  // Admin Menu CRUD
  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, data: Partial<Omit<MenuItem, "id">>) => void;
  removeMenuItem: (id: string) => void;

  // Auth
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      orders: [],
      isOrdersOpen: false,
      isAdmin: false,
      adminMenu: [
        {
          id: "1",
          name: "Phở Bò Tái Lăn",
          price: 65000,
          category: "Món chính",
          image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=400",
          description: "Phở bò truyền thống với thịt bò tái lăn thơm nức mũi."
        },
        {
          id: "2",
          name: "Bún Chả Hà Nội",
          price: 55000,
          category: "Món chính",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400",
          description: "Bún chả đặc sản Hà Nội với thịt nướng than hoa."
        },
        {
          id: "3",
          name: "Cà Phê Sữa Đá",
          price: 29000,
          category: "Đồ uống",
          image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400",
          description: "Cà phê pha phin truyền thống kết hợp sữa đặc."
        }
      ],
  
  addItem: (item) => {
    set((state) => {
      // Tìm xem item (cùng productId và cùng note) đã có chưa
      const existingItemIndex = state.items.findIndex(
        (i) => i.productId === item.productId && i.note === item.note
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += item.quantity;
        return { items: newItems };
      }

      // Tạo id unique cho cart item dựa trên thời gian
      return {
        items: [...state.items, { ...item, id: Date.now().toString() }],
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },

  updateNote: (id, note) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, note } : item
      ),
    }));
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  toggleOrders: () => set((state) => ({ isOrdersOpen: !state.isOrdersOpen })),

  submitOrder: () => {
    const { items, getTotalPrice } = get();
    if (items.length === 0) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...items],
      totalPrice: getTotalPrice(),
      status: "pending",
      timestamp: Date.now(),
      tableNumber: "05", // Mock table number
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
      items: [], // Clear cart
      isOpen: false, // Close cart
    }));
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    }));
  },

  clearTableOrders: (tableNumber) => {
    set((state) => ({
      orders: state.orders.filter(order => order.tableNumber !== tableNumber)
    }));
  },

  addMenuItem: (item) => {
    set((state) => ({
      adminMenu: [...state.adminMenu, { ...item, id: Date.now().toString() }]
    }));
  },

  updateMenuItem: (id, data) => {
    set((state) => ({
      adminMenu: state.adminMenu.map((item) =>
        item.id === id ? { ...item, ...data } : item
      )
    }));
  },

  removeMenuItem: (id) => {
    set((state) => ({
      adminMenu: state.adminMenu.filter((item) => item.id !== id)
    }));
  },

  login: (password) => {
    if (password === "admin123") {
      set({ isAdmin: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAdmin: false });
  }
    }),
    {
      name: "menu-viet-storage",
      partialize: (state) => ({ 
        orders: state.orders,
        adminMenu: state.adminMenu 
      }), // Đồng bộ orders và adminMenu
    }
  )
);
