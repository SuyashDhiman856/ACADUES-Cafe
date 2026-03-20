import apiClient from './client';
import { ApiOrder, CreateOrderDto, OrderStatus, User } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Nest may return a raw array or { data: T[] } */
function parseOrderList(payload: unknown): ApiOrder[] {
  if (Array.isArray(payload)) return payload as ApiOrder[];
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: ApiOrder[] }).data;
  }
  return [];
}

/** Nest may return the entity or { data: entity } */
function parseOrderEntity(payload: unknown): ApiOrder {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data: unknown }).data !== undefined &&
    typeof (payload as { data: unknown }).data === 'object' &&
    !Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: ApiOrder }).data;
  }
  return payload as ApiOrder;
}

function parseUserEntity(payload: unknown): User {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as { data: unknown }).data !== undefined
  ) {
    return (payload as { data: User }).data;
  }
  return payload as User;
}

export const ordersAPI = {
  createOrderForTable: async (
    tableId: string,
    orderData: CreateOrderDto
  ): Promise<ApiOrder> => {
    const response = await apiClient.post<unknown>(
      `/orders/table/${tableId}`,
      orderData
    );
    return parseOrderEntity(response.data);
  },

  getOrdersByTable: async (tableId: string): Promise<ApiOrder[]> => {
    const response = await apiClient.get<unknown>(`/orders/table/${tableId}`);
    return parseOrderList(response.data);
  },

  getMyOrders: async (): Promise<ApiOrder[]> => {
    const response = await apiClient.get<unknown>('/orders/my-orders');
    return parseOrderList(response.data);
  },

  getAllOrders: async (): Promise<ApiOrder[]> => {
    const response = await apiClient.get<unknown>('/orders');
    return parseOrderList(response.data);
  },

  getChefForOrder: async (orderId: string): Promise<User> => {
    const response = await apiClient.get<unknown>(`/orders/${orderId}/chef`);
    return parseUserEntity(response.data);
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<ApiOrder> => {
    const response = await apiClient.patch<unknown>(
      `/orders/${orderId}/status`,
      { status }
    );
    return parseOrderEntity(response.data);
  },

  assignChefToOrder: async (
    orderId: string,
    chefId: string
  ): Promise<ApiOrder> => {
    const response = await apiClient.patch<unknown>(
      `/orders/${orderId}/assign-chef/${chefId}`
    );
    return parseOrderEntity(response.data);
  },
};
