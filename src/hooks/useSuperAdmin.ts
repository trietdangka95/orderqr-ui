import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi, CreateStoreData, Store } from "@/api/superadmin";

export const useStores = () => {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => superAdminApi.getStores(),
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoreData) => superAdminApi.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Store> & { adminUsername?: string; adminPassword?: string } }) => 
      superAdminApi.updateStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superAdminApi.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => superAdminApi.getStats(),
  });
};
