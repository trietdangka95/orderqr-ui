export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN' | 'PUBLIC' | 'SUPER_ADMIN';
}

export interface AuthResponse {
  token?: string;
  role?: 'ADMIN' | 'STAFF' | 'KITCHEN' | 'PUBLIC' | 'SUPER_ADMIN';
  id?: string;
  storeId?: string;
  require2FA?: boolean;
  tempToken?: string;
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
  id: string;
  productId: string;
  quantity: number;
  note?: string;
  product?: Product;
  isCooked?: boolean;
  isCooking?: boolean;
  isServed?: boolean;
  priceAtTime?: string | number;
  originalPriceAtTime?: string | number | null;
  discountPercentAtTime?: number | null;
}

export interface Order {
  id: string;
  tableNumber: string;
  status: OrderStatus;
  isConfirmed: boolean;
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
  totalPrice?: number | string;
  invoiceId?: string | null;
  invoice?: {
    id: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
  } | null;
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

export interface AuditLog {
  id: string;
  storeId: string;
  userId?: string | null;
  user?: {
    username: string;
    role: string;
  } | null;
  action: string;
  details: string;
  createdAt: string;
}
