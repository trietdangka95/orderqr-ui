import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.token) {
        authApi.setToken(data.token);
      }
    }
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });
};

export const useUpdateUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string, newPassword: string }) => 
      authApi.updateOtherUserPassword(userId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useVerify2FA = () => {
  return useMutation({
    mutationFn: ({ tempToken, code }: { tempToken: string; code: string }) =>
      authApi.verify2FA(tempToken, code),
    onSuccess: (data) => {
      if (data.token) {
        authApi.setToken(data.token);
      }
    },
  });
};
