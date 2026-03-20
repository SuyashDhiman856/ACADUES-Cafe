import apiClient from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'CHEF' | 'CUSTOMER';
  createdAt?: string;
  updatedAt?: string;
}

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  getChefs: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/role/chefs');
    return response.data;
  },

  getOwners: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/role/owners');
    return response.data;
  },

  getCustomers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/role/customers');
    return response.data;
  },
};