import apiClient from './client';
import { Order } from './orders';

export const chefAPI = {
  getChef: async (chefId: string): Promise<any> => {
    const response = await apiClient.get(`/chef/${chefId}`);
    return response.data;
  },

  getAssignedOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/chef/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/chef/orders/${orderId}/status`, { status });
    return response.data;
  },
};