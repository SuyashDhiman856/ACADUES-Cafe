import { useState, useEffect, useCallback } from "react";
import { categoriesAPI, Category, CreateCategoryRequest } from "../api/categories";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (dto: CreateCategoryRequest) => {
    try {
      setLoading(true);
      const category = await categoriesAPI.create(dto);
      setCategories(prev => [...prev, category]);
      return category;
    } catch (err: any) {
      setError(err?.message || "Failed to create category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, dto: Partial<CreateCategoryRequest>) => {
    try {
      setLoading(true);
      const updated = await categoriesAPI.update(id, dto);
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err: any) {
      setError(err?.message || "Failed to update category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await categoriesAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete category");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};