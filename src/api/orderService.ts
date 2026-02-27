import { apiClient } from './apiClient';
import type {
  Order,
  CreateOrderParams,
  OrderResponse,
  OrdersListResponse,
  MyOrdersRole,
} from '../types/order';

export interface MyOrdersParams {
  role?: MyOrdersRole;
  status?: string;
  page?: number;
  limit?: number;
}

export const orderService = {
  async createOrder(params: CreateOrderParams): Promise<Order> {
    const response = await apiClient.post<OrderResponse>('/orders', params);
    return response.data;
  },

  async payOrder(orderId: string): Promise<Order> {
    const response = await apiClient.post<OrderResponse>(`/orders/${orderId}/pay`);
    return response.data;
  },

  async getMyOrders(params?: MyOrdersParams): Promise<OrdersListResponse> {
    return apiClient.get<OrdersListResponse>('/orders/me', { params });
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: string, reason: string): Promise<Order> {
    const response = await apiClient.put<OrderResponse>(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  async confirmOrder(id: string): Promise<Order> {
    const response = await apiClient.put<OrderResponse>(`/orders/${id}/confirm`);
    return response.data;
  },

  async rejectOrder(id: string, reason: string): Promise<Order> {
    const response = await apiClient.put<OrderResponse>(`/orders/${id}/reject`, { reason });
    return response.data;
  },
};
