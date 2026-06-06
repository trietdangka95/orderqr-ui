import axiosInstance from './axiosInstance';
import { Order, CreateOrderDto, OrderStatus, AuditLog } from '@/types/api';

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>('/orders');
    return response.data;
  },

  createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
    const response = await axiosInstance.post<Order>('/orders', orderData);
    return response.data;
  },

  confirmOrder: async (id: string): Promise<Order> => {
    const response = await axiosInstance.patch<Order>(`/orders/${id}/confirm`);
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await axiosInstance.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  getOrdersByTable: async (tableNumber: string): Promise<Order[]> => {
    const response = await axiosInstance.get<Order[]>(`/orders/table/${tableNumber}`);
    return response.data;
  },

  updateItemQuantity: async (orderId: string, productId: string, quantity: number): Promise<Order> => {
    const response = await axiosInstance.patch<Order>(`/orders/${orderId}/items`, { productId, quantity });
    return response.data;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await axiosInstance.get<AuditLog[]>('/orders/logs');
    return response.data;
  },
};
