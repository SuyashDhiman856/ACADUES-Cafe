import apiClient from './client';

export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'CHEF' | 'CUSTOMER';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'CHEF' | 'CUSTOMER';
}

export interface UpdateStaffRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: 'OWNER' | 'CHEF' | 'CUSTOMER';
}

export const staffAPI = {
  getAll: async (): Promise<Staff[]> => {
    const response = await apiClient.get<Staff[]>('/staff');
    return response.data;
  },

  create: async (data: CreateStaffRequest): Promise<Staff> => {
    const response = await apiClient.post<Staff>('/staff', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStaffRequest): Promise<Staff> => {
    const response = await apiClient.put<Staff>(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/staff/${id}`);
  },
};