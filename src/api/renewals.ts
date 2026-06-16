import axiosInstance from './axiosInstance';
 
export interface RenewalRequest {
  id: string;
  storeId: string;
  plan: 'FREE' | 'PREMIUM';
  months: number;
  price: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  store?: {
    name: string;
    slug: string;
  };
}
 
export const renewalsApi = {
  getRequests: async (): Promise<RenewalRequest[]> => {
    const response = await axiosInstance.get<RenewalRequest[]>('/renewals');
    return response.data;
  },
 
  createRequest: async (payload: { months: number; price: number; notes?: string }): Promise<RenewalRequest> => {
    const response = await axiosInstance.post<RenewalRequest>('/renewals', payload);
    return response.data;
  },
 
  approveRequest: async (id: string): Promise<RenewalRequest> => {
    const response = await axiosInstance.patch<RenewalRequest>(`/renewals/${id}/approve`);
    return response.data;
  },
 
  rejectRequest: async (id: string, notes?: string): Promise<RenewalRequest> => {
    const response = await axiosInstance.patch<RenewalRequest>(`/renewals/${id}/reject`, { notes });
    return response.data;
  },
 
  getBankConfig: async (): Promise<{ bankId: string; bankAccountNo: string; bankAccountName: string; premiumPrice?: number }> => {
    const response = await axiosInstance.get<{ bankId: string; bankAccountNo: string; bankAccountName: string; premiumPrice?: number }>('/renewals/bank-config');
    return response.data;
  },
 
  saveBankConfig: async (payload: { bankId: string; bankAccountNo: string; bankAccountName: string; premiumPrice?: number }): Promise<{ bankId: string; bankAccountNo: string; bankAccountName: string; premiumPrice?: number }> => {
    const response = await axiosInstance.post<{ bankId: string; bankAccountNo: string; bankAccountName: string; premiumPrice?: number }>('/renewals/bank-config', payload);
    return response.data;
  },

  updateStoreBankConfig: async (payload: { bankId: string; bankAccountNo: string; bankAccountName: string }): Promise<{ bankId: string; bankAccountNo: string; bankAccountName: string }> => {
    const response = await axiosInstance.put<{ bankId: string; bankAccountNo: string; bankAccountName: string }>('/stores/bank-config', payload);
    return response.data;
  },
};
