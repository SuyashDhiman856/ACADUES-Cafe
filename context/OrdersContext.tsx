import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ordersAPI } from '../api/orders';
import { ApiOrder, CreateOrderDto, OrderStatus } from '../types';

type OrdersContextValue = {
  allOrders: ApiOrder[];
  chefOrders: ApiOrder[];
  loadingAll: boolean;
  loadingChef: boolean;
  error: string | null;
  fetchAllOrders: (silentRefresh?: unknown) => Promise<void>;
  fetchChefOrders: (silentRefresh?: unknown) => Promise<void>;
  createOrder: (tableId: string, dto: CreateOrderDto) => Promise<ApiOrder>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<ApiOrder>;
  assignChef: (orderId: string, chefId: string) => Promise<ApiOrder>;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [chefOrders, setChefOrders] = useState<ApiOrder[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingChef, setLoadingChef] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllOrders = useCallback(async (silentRefresh?: unknown) => {
    const silent = silentRefresh === true;
    try {
      if (!silent) setLoadingAll(true);
      setError(null);
      const data = await ordersAPI.getAllOrders();
      setAllOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(msg || 'Failed to fetch orders');
    } finally {
      if (!silent) setLoadingAll(false);
    }
  }, []);

  const fetchChefOrders = useCallback(async (silentRefresh?: unknown) => {
    const silent = silentRefresh === true;
    try {
      if (!silent) setLoadingChef(true);
      setError(null);
      const data = await ordersAPI.getMyOrders();
      setChefOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(msg || 'Failed to fetch chef orders');
    } finally {
      if (!silent) setLoadingChef(false);
    }
  }, []);

  const createOrder = useCallback(
    async (tableId: string, dto: CreateOrderDto) => {
      const order = await ordersAPI.createOrderForTable(tableId, dto);
      await fetchAllOrders(true);
      return order;
    },
    [fetchAllOrders]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const updated = await ordersAPI.updateOrderStatus(orderId, status);
      setAllOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setChefOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      return updated;
    },
    []
  );

  const assignChef = useCallback(async (orderId: string, chefId: string) => {
    const updated = await ordersAPI.assignChefToOrder(orderId, chefId);
    setAllOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    setChefOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    return updated;
  }, []);

  // Single initial load for the whole app — avoids N parallel fetches and effect
  // re-runs from every useOrders() subscriber (App, Dashboard, KitchenStatusBar, …).
  useEffect(() => {
    void fetchAllOrders();
  }, [fetchAllOrders]);

  const value = useMemo(
    () => ({
      allOrders,
      chefOrders,
      loadingAll,
      loadingChef,
      error,
      fetchAllOrders,
      fetchChefOrders,
      createOrder,
      updateOrderStatus,
      assignChef,
    }),
    [
      allOrders,
      chefOrders,
      loadingAll,
      loadingChef,
      error,
      fetchAllOrders,
      fetchChefOrders,
      createOrder,
      updateOrderStatus,
      assignChef,
    ]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders(chefOnly = false) {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error('useOrders must be used within OrdersProvider');
  }

  const {
    allOrders,
    chefOrders,
    loadingAll,
    loadingChef,
    error,
    fetchAllOrders,
    fetchChefOrders,
    createOrder,
    updateOrderStatus,
    assignChef,
  } = ctx;

  return {
    orders: chefOnly ? chefOrders : allOrders,
    loading: chefOnly ? loadingChef : loadingAll,
    error,
    fetchOrders: chefOnly ? fetchChefOrders : fetchAllOrders,
    createOrder,
    updateOrderStatus,
    assignChef,
  };
}
