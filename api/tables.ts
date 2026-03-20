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