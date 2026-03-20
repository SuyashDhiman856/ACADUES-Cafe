import apiClient from './client';

export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  sizeId?: string;
  price: number;
  name: string;
}

export interface Cart {
  id: string;
  tableId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}

export interface AddToCartRequest {
  tableId: string;
  menuItemId: string;
  quantity: number;
  sizeId?: string;
}

export const cartAPI = {
  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post<Cart>('/cart/add', data);
    return response.data;
  },

  getByTable: async (tableId: string): Promise<Cart> => {
    const response = await apiClient.get<Cart>(`/cart/${tableId}`);
    return response.data;
  },

  removeItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/item/${itemId}`);
  },

  sendToKitchen: async (tableId: string, orderType: 'DINE_IN' | 'TAKEAWAY'): Promise<{ orderId: string }> => {
    const response = await apiClient.post<{ orderId: string }>(`/cart/${tableId}/send-to-kitchen`, { orderType });
    return response.data;
  },
};