import apiClient from './client';
import { ApiCart, ApiCartItem, AddItemToCartDto } from '../types';

export const cartAPI = {
  addItem: async (data: AddItemToCartDto): Promise<ApiCart> => {
    const response = await apiClient.post<ApiCart>('/cart', data);
    return response.data;
  },

  getByTable: async (tableId: string): Promise<ApiCart> => {
    const response = await apiClient.get<ApiCart>(`/cart/${tableId}`);
    return response.data;
  },

  sendToKitchen: async (tableId: string, orderType: 'DINE_IN' | 'TAKEAWAY'): Promise<{ message: string; order: any }> => {
    const response = await apiClient.post<{ message: string; order: any }>(`/cart/${tableId}/send-to-kitchen`, { orderType });
    return response.data;
  },
};