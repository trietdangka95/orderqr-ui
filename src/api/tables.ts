import axiosInstance from './axiosInstance';
import { Invoice } from '@/types/api';

export const tablesApi = {
  clearTable: async (tableNumber: string): Promise<Invoice> => {
    const response = await axiosInstance.post<Invoice>('/orders/checkout', { tableNumber });
    return response.data;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const response = await axiosInstance.get<Invoice[]>('/tables/invoices');
    return response.data;
  },
};
