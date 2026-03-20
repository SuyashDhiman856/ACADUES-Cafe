import apiClient from "./client";

export interface Settings {
  id: string;
  restaurantName: string;
  contactPhone: string;
  contactEmail?: string;
  physicalAddress: string;
  logoUrl?: string;
  themeColor: string;
  currency: string;
  upiId?: string;
  gstNumber?: string;
  gstPercentage: number;
  totalTables: number;
  tables?: string[];
  enableWhatsappNotifications: boolean;
  whatsappConfirmationTemplate?: string;
  whatsappSettledTemplate?: string;
  expenseCashSplit?: number;
  createdAt: string;
  updatedAt: string;
}

export const settingsAPI = {
  get: async (): Promise<Settings> => {
    const response =
      await apiClient.get<Settings>("/settings");
    return response.data;
  },

  update: async (
    data: Partial<Settings>
  ): Promise<Settings> => {
    const response =
      await apiClient.patch<Settings>(
        "/settings",
        data
      );
    return response.data;
  },
};