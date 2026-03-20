import apiClient from './client';

export const qrAPI = {
  getTableUrl: async (tableId: string): Promise<{ qrUrl: string }> => {
    const response = await apiClient.get<{ qrUrl: string }>(`/qr/${tableId}`);
    return response.data;
  },
};