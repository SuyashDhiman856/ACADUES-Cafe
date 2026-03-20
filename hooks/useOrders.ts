import { useState, useEffect, useCallback } from "react";
import { ordersAPI, Order, CreateOrderRequest } from "../api/orders";

export const useOrders = () => {

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {

    try {

      setLoading(true);

      const data = await ordersAPI.getAll();

      setOrders(data);

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to fetch orders");

    } finally {

      setLoading(false);

    }

  }, []);

  const createOrder = async (tableId: string, dto: CreateOrderRequest) => {

    const order = await ordersAPI.create(tableId, dto);

    setOrders(prev => [order, ...prev]);

    return order;

  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {

    const updated = await ordersAPI.updateStatus(orderId, status);

    setOrders(prev =>
      prev.map(o => o.id === orderId ? updated : o)
    );

    return updated;

  };

  const assignChef = async (orderId: string, chefId: string) => {

    const updated = await ordersAPI.assignChef(orderId, chefId);

    setOrders(prev =>
      prev.map(o => o.id === orderId ? updated : o)
    );

    return updated;

  };

  useEffect(() => {

    fetchOrders();

  }, [fetchOrders]);

  return {

    orders,

    loading,

    error,

    fetchOrders,

    createOrder,

    updateOrderStatus,

    assignChef,

  };

};