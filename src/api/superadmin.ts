import axiosInstance from "./axiosInstance";

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  themeColor: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  users?: { username: string }[];
}

export interface CreateStoreData {
  name: string;
  slug: string;
  adminUsername: string;
  adminPassword: string;
  themeColor?: string;
  currency?: string;
}

export interface PlatformStats {
  totalStores: number;
  activeStores: number;
  totalProducts: number;
  totalRevenue: number;
}

export const superAdminApi = {
  getStores: async (): Promise<Store[]> => {
    const { data } = await axiosInstance.get("/superadmin/stores");
    return data;
  },
  
  createStore: async (storeData: CreateStoreData): Promise<unknown> => {
    const { data } = await axiosInstance.post("/superadmin/stores", storeData);
    return data;
  },
  
  updateStore: async (id: string, storeData: Partial<Store> & { adminUsername?: string; adminPassword?: string }): Promise<Store> => {
    const { data } = await axiosInstance.patch(`/superadmin/stores/${id}`, storeData);
    return data;
  },
  
  deleteStore: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/superadmin/stores/${id}`);
  },

  getStats: async (): Promise<PlatformStats> => {
    const { data } = await axiosInstance.get("/superadmin/stats");
    return data;
  },
};
