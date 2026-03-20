import apiClient from './client';

export interface MenuSize {
  id?: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  foodType: 'VEG' | 'NON_VEG' | 'EGG';
  hasSizes: boolean;
  price: number;
  imageUrl?: string;
  sizes?: MenuSize[];
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const menuAPI = {
  getAll: async (): Promise<MenuItem[]> => {
    const response =
      await apiClient.get<ApiResponse<MenuItem[]>>(
        '/menu'
      );
    return response.data.data;
  },

  getById: async (
    id: string
  ): Promise<MenuItem> => {
    const response =
      await apiClient.get<ApiResponse<MenuItem>>(
        `/menu/${id}`
      );
    return response.data.data;
  },

  create: async (
    formData: FormData
  ): Promise<MenuItem> => {
    const response =
      await apiClient.post<ApiResponse<MenuItem>>(
        '/menu/create',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<MenuItem>
  ): Promise<MenuItem> => {
    const response =
      await apiClient.patch<ApiResponse<MenuItem>>(
        `/menu/update/${id}`,
        data
      );
    return response.data.data;
  },

  delete: async (
    id: string
  ): Promise<void> => {
    await apiClient.delete(
      `/menu/delete/${id}`
    );
  },
};