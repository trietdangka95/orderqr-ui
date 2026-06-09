import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";
import { tablesApi } from "@/api/tables";
import { OrderStatus } from "@/types/api";

export const useOrders = (enabled = true) => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getOrders,
    enabled,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: (createdOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Cập nhật guest view theo bàn ngay lập tức
      if (createdOrder?.tableNumber) {
        queryClient.invalidateQueries({ queryKey: ["orders", "table", createdOrder.tableNumber] });
      }
    },
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.confirmOrder,
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Cập nhật guest view theo bàn
      queryClient.invalidateQueries({ queryKey: ["orders", "table", updatedOrder.tableNumber] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Cập nhật guest view theo bàn
      queryClient.invalidateQueries({ queryKey: ["orders", "table", updatedOrder.tableNumber] });
    },
  });
};

export const useClearTable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tableNumber: string) => tablesApi.clearTable(tableNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useTableOrders = (tableNumber: string) => {
  return useQuery({
    queryKey: ["orders", "table", tableNumber],
    queryFn: () => ordersApi.getOrdersByTable(tableNumber),
    enabled: !!tableNumber,
  });
};

export const useUpdateOrderItemQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, productId, quantity }: { orderId: string; productId: string; quantity: number }) =>
      ordersApi.updateItemQuantity(orderId, productId, quantity),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "table", updatedOrder.tableNumber] });
    },
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: ordersApi.getAuditLogs,
  });
};

export const useRequestCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.requestCheckout,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "table", variables.tableNumber] });
    },
  });
};

export const useConfirmInvoicePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.confirmInvoicePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (data?.tableNumber) {
        queryClient.invalidateQueries({ queryKey: ["orders", "table", data.tableNumber] });
      }
    },
  });
};
