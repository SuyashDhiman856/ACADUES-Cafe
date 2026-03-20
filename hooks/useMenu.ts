import { useState, useEffect, useCallback } from "react";
import { menuAPI } from "../api/menu";
import { MenuItem } from "../types";
import { mapApiMenuItemToMenuItem } from "../mappers/menu.mapper";

interface UseMenuReturn {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
  createMenuItem: (formData: FormData) => Promise<MenuItem>;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => Promise<MenuItem>;
  deleteMenuItem: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMenu = (): UseMenuReturn => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await menuAPI.getAll();
      setMenuItems(items.map(mapApiMenuItemToMenuItem));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  }, []);

  const createMenuItem = useCallback(async (formData: FormData): Promise<MenuItem> => {
    try {
      setLoading(true);
      setError(null);
      const newItem = await menuAPI.create(formData);
      const mapped = mapApiMenuItemToMenuItem(newItem);
      setMenuItems(prev => [...prev, mapped]);
      return mapped;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create menu item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMenuItem = useCallback(async (id: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await menuAPI.update(id, data as any);
      const mapped = mapApiMenuItemToMenuItem(updated);
      setMenuItems(prev => prev.map(item => item.id === id ? mapped : item));
      return mapped;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update menu item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMenuItem = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await menuAPI.delete(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete menu item");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menuItems,
    loading,
    error,
    fetchMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refresh,
  };
};