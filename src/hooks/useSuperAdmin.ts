import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi, CreateStoreData, Store } from "@/api/superadmin";

export const useStores = () => {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => superAdminApi.getStores(),
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
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
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useSuperAdminInfo = () => {
  return useQuery({
    queryKey: ["superadmin-info"],
    queryFn: () => superAdminApi.getInfo(),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useSetup2FA = () => {
  return useMutation({
    mutationFn: () => superAdminApi.setup2FA(),
  });
};

export const useEnable2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, secret }: { code: string; secret: string }) =>
      superAdminApi.enable2FA(code, secret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-info"] });
    },
  });
};

export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (password: string) => superAdminApi.disable2FA(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-info"] });
    },
  });
};
