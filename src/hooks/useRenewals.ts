import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { renewalsApi } from "@/api/renewals";
 
export const useRenewalRequests = () => {
  return useQuery({
    queryKey: ["renewal-requests"],
    queryFn: renewalsApi.getRequests,
  });
};
 
export const useCreateRenewalRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renewalsApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renewal-requests"] });
    },
  });
};
 
export const useApproveRenewalRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renewalsApi.approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renewal-requests"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};
 
export const useRejectRenewalRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => renewalsApi.rejectRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renewal-requests"] });
    },
  });
};
 
export const useBankConfig = () => {
  return useQuery({
    queryKey: ["superadmin-bank-config"],
    queryFn: renewalsApi.getBankConfig,
  });
};
 
export const useSaveBankConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renewalsApi.saveBankConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-bank-config"] });
    },
  });
};

export const useUpdateStoreBankConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renewalsApi.updateStoreBankConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
