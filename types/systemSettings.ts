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
  expenseCashSplit: number;
  upiId?: string;
  whatsappConfirmationTemplate?: string;
  whatsappSettledTemplate?: string;
  tables: string[];
  logoUrl?: string;
  gstNumber?: string;
}