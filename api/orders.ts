import apiClient from "./client";

export interface OrderItemRequest {

  menuItemId: string;

  quantity: number;

  sizeId?: string;

}

export interface CreateOrderRequest {

  orderType: "DINE_IN" | "TAKEAWAY";

  items: OrderItemRequest[];

}

export interface OrderItem {

  id: string;

  menuItemId: string;

  quantity: number;

  price: number;

  total: number;

}

export interface Order {

  id: string;

  tableId?: string;

  chefId?: string;

  orderType: "DINE_IN" | "TAKEAWAY";

  status:
    | "CREATED"
    | "SENT_TO_KITCHEN"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  subtotal: number;

  gstRate: number;

  totalAmount: number;

  createdAt: string;

  updatedAt: string;

  orderItems: OrderItem[];

}


export const ordersAPI = {
  create: async (
    tableId: string,
    data: CreateOrderRequest
  ): Promise<Order> => {

    const res =
      await apiClient.post<Order>(
        `/orders/table/${tableId}`,
        data
      );

    return res.data;

  },

  getAll: async (): Promise<Order[]> => {

    const res =
      await apiClient.get<Order[]>("/orders");

    return res.data;

  },

  getById: async (
    orderId: string
  ): Promise<Order> => {

    const res =
      await apiClient.get<Order>(
        `/orders/${orderId}`
      );

    return res.data;

  },

  getByTable: async (
    tableId: string
  ): Promise<Order[]> => {

    const res =
      await apiClient.get<Order[]>(
        `/orders/table/${tableId}`
      );

    return res.data;

  },

  updateStatus: async (
    orderId: string,
    status: Order["status"]
  ): Promise<Order> => {

    const res =
      await apiClient.patch<Order>(
        `/orders/${orderId}/status`,
        { status }
      );

    return res.data;

  },

  assignChef: async (
    orderId: string,
    chefId: string
  ): Promise<Order> => {

    const res =
      await apiClient.patch<Order>(
        `/orders/${orderId}/assign-chef/${chefId}`
      );

    return res.data;

  },

};