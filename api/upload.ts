import apiClient from './client';

export const uploadAPI = {
  menuImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ imageUrl: string }>('/upload/menu-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};