import { useState, useEffect, useCallback } from "react";
import { cartAPI, Cart, AddToCartRequest } from "../api/cart";

export const useCart = (tableId?: string) => {

  const [cart, setCart] = useState<Cart | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  //////////////////////////////////////////////////////
  // FETCH CART
  //////////////////////////////////////////////////////

  const fetchCart = useCallback(async (id: string) => {

    try {

      setLoading(true);

      const data = await cartAPI.getByTable(id);

      setCart(data);

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to fetch cart");

    } finally {

      setLoading(false);

    }

  }, []);

  //////////////////////////////////////////////////////
  // ADD ITEM
  //////////////////////////////////////////////////////

  const addToCart = async (data: AddToCartRequest) => {

    const updated = await cartAPI.addItem(data);

    setCart(updated);

    return updated;

  };

  //////////////////////////////////////////////////////
  // REMOVE ITEM
  //////////////////////////////////////////////////////

  const removeFromCart = async (itemId: string) => {

    await cartAPI.removeItem(itemId);

    setCart(prev =>
      prev
        ? { ...prev, items: prev.items.filter(i => i.id !== itemId) }
        : prev
    );

  };

  //////////////////////////////////////////////////////
  // SEND TO KITCHEN
  //////////////////////////////////////////////////////

  const sendToKitchen = async (orderType: "DINE_IN" | "TAKEAWAY") => {

    if (!tableId) throw new Error("Table ID required");

    await cartAPI.sendToKitchen(tableId, orderType);

    setCart(null);

  };

  //////////////////////////////////////////////////////
  // INIT
  //////////////////////////////////////////////////////

  useEffect(() => {

    if (tableId)
      fetchCart(tableId);

  }, [tableId, fetchCart]);

  return {

    cart,

    loading,

    error,

    addToCart,

    removeFromCart,

    sendToKitchen,

    refetch: tableId ? () => fetchCart(tableId) : undefined,

  };

};