import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/api/menu";
import { MenuItem, useCartStore } from "@/store/cartStore";

export const useProducts = () => {
  const storeConfig = useCartStore((state) => state.storeConfig);
  return useQuery({
    queryKey: ["products", storeConfig?.id],
    queryFn: menuApi.getProducts,
    enabled: !!storeConfig?.id,
  });
};

export const useCategories = () => {
  const storeConfig = useCartStore((state) => state.storeConfig);
  return useQuery({
    queryKey: ["categories", storeConfig?.id],
    queryFn: menuApi.getCategories,
    enabled: !!storeConfig?.id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItem> }) => menuApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: menuApi.uploadImage,
  });
};
