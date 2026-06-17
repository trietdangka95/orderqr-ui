import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi } from "@/api/superadmin";

export const useContactRequests = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: () => superAdminApi.getContacts(),
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "CONTACTED" | "COMPLETED" }) =>
      superAdminApi.updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => superAdminApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
