import { useState, useEffect, useCallback } from "react";
import { cartAPI } from "../api/cart";
import { ApiCart, ApiCartItem } from "../types";

export const useCart = (tableId?: string) => {
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!tableId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await cartAPI.getByTable(tableId);
      setCart(data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // No cart exists for this table yet, which is fine
        setCart({ id: '', tableId: tableId, cartItems: [] });
      } else {
        setError(err?.response?.data?.message || "Failed to fetch cart");
      }
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  const addToCartBackend = async (menuItemId: string, quantity: number) => {
    if (!tableId) return;
    try {
      setLoading(true);
      const updatedCart = await cartAPI.addItem({ tableId, menuItemId, quantity });
      setCart(updatedCart);
      return updatedCart;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add item to cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendToKitchen = async (orderType: 'DINE_IN' | 'TAKEAWAY') => {
    if (!tableId) return;
    try {
      setLoading(true);
      const result = await cartAPI.sendToKitchen(tableId, orderType);
      setCart({ ...cart!, cartItems: [] }); // Clear local cart items upon success
      return result;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send order to kitchen");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tableId) fetchCart();
  }, [tableId, fetchCart]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCartBackend,
    sendToKitchen,
  };
};