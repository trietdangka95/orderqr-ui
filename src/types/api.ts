export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN' | 'PUBLIC' | 'SUPER_ADMIN';
}

export interface AuthResponse {
  token: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN' | 'PUBLIC' | 'SUPER_ADMIN';
  id: string;
  storeId?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: string;
  categoryId: number;
  isAvailable: boolean;
  discountPercent: number;
  bannerUrl?: string;
  promoTitle?: string;
  promoDescription?: string;
}

export type OrderStatus = 'PENDING' | 'COOKING' | 'SERVING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  quantity: number;
  note?: string;
  product?: Product;
}

export interface Order {
  id: string;
  tableNumber: string;
  status: OrderStatus;
  isConfirmed: boolean;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
  invoiceId?: string | null;
}

export interface CreateOrderDto {
  tableNumber: string;
  items: {
    productId: string;
    quantity: number;
    note?: string;
  }[];
}

export interface Invoice {
  id: string;
  tableNumber: string;
  totalAmount: number;
  orders: Order[];
  createdAt: string;
}

export interface ErrorResponse {
  message: string;
}
