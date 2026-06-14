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
  subscriptionPlan: "FREE" | "PREMIUM";
  subscriptionStatus: string;
  subscriptionStart: string | null;
  subscriptionEnd: string | null;
  subscriptionPrice: number | null;
  subscriptionNotes: string | null;
  description?: string | null;
}

export interface CreateStoreData {
  name: string;
  slug: string;
  adminUsername: string;
  adminPassword: string;
  themeColor?: string;
  currency?: string;
  logo?: string | null;
  subscriptionPlan?: "FREE" | "PREMIUM";
  subscriptionStatus?: string;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
  subscriptionPrice?: number | null;
  subscriptionNotes?: string | null;
  description?: string | null;
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

  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.post<{ url: string }>("/superadmin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
