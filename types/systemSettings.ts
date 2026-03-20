export interface SystemSettings {
  id: string;
  restaurantName: string;
  address: string;
  phone: string;
  primaryColor: string;
  currency: string;
  currencySymbol: string;
  whatsappEnabled: boolean;
  gstPercentage: number;
  totalTables: number;
  upiId?: string;
  whatsappConfirmationTemplate?: string;
  whatsappSettledTemplate?: string;
  tables: string[];
  logoUrl?: string;
  gstNumber?: string;
  
  // NEW FIELDS
  contactEmail?: string;
  geoLatitude?: number;
  geoLongitude?: number;
  enableChefAutoAssign: boolean;
  enableAutoAcceptOrders: boolean;
  maintenanceMode: boolean;
  /** Optional: cash share of expenses for dashboard liquidity model (0–1). */
  expenseCashSplit?: number;
}