import apiClient from './client';

export interface Table {
  id: string;
  tableNumber: number;
  isOccupied?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTableRequest {
  tableNumber: number;
}

/**
 * Backend order routes use a real table UUID. Takeaway must not use the literal "TAKEAWAY"
 * (that often yields 404). Prefer VITE_TAKEAWAY_TABLE_ID or a table with number 0.
 */
export function resolveTableIdForOrderPlacement(
  orderType: 'DINE_IN' | 'TAKEAWAY',
  dineInTable: Table | undefined,
  tables: Table[]
): { tableId: string } | { error: string } {
  if (orderType === 'DINE_IN') {
    if (!dineInTable?.id) return { error: 'Select a valid table.' };
    return { tableId: dineInTable.id };
  }
  const fromEnv = (import.meta.env.VITE_TAKEAWAY_TABLE_ID as string | undefined)?.trim();
  if (fromEnv) return { tableId: fromEnv };
  const counter = tables.find((t) => t.tableNumber === 0);
  if (counter) return { tableId: counter.id };
  return {
    error:
      'Takeaway needs a real table id: set VITE_TAKEAWAY_TABLE_ID in .env, or create a table with number 0 in your API.',
  };
}

export const tablesAPI = {
  getAll: async (): Promise<Table[]> => {
    const response = await apiClient.get<Table[]>('/tables');
    return response.data;
  },

  getById: async (id: string): Promise<Table> => {
    const response = await apiClient.get<Table>(`/tables/${id}`);
    return response.data;
  },

  create: async (data: CreateTableRequest): Promise<Table> => {
    const response = await apiClient.post<Table>('/tables', data);
    return response.data;
  },
};