import apiClient from "./client";

export interface Settings {
  id: string;
  restaurantName: string;
  contactPhone: string;
  contactEmail?: string;
  physicalAddress: string;
  geoLatitude?: number;
  geoLongitude?: number;
  logoUrl?: string;
  themeColor: string;
  currency: string;
  upiId?: string;
  gstNumber?: string;
  gstPercentage: number;
  totalTables: number;
  
  // Operational features
  enableWhatsappNotifications: boolean;
  enableChefAutoAssign: boolean;
  enableAutoAcceptOrders: boolean;
  maintenanceMode: boolean;
  
  // Messaging templates (Optional)
  whatsappConfirmationTemplate?: string;
  whatsappSettledTemplate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export const settingsAPI = {
  get: async (): Promise<Settings> => {
    const response = await apiClient.get<Settings>("/settings");
    return response.data;
  },

  update: async (data: Partial<Settings>): Promise<Settings> => {
    const response = await apiClient.patch<Settings>("/settings", data);
    return response.data;
  },
};