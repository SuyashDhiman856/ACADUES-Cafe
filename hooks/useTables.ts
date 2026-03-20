import { useState, useEffect, useCallback } from "react";
import { Table, tablesAPI } from "../api/tables";

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tablesAPI.getAll();
      setTables(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return { tables, loading, error, fetchTables };
};
