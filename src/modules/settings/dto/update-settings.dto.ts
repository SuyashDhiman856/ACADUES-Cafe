export class UpdateSettingsDto {
  restaurantName?: string;
  contactPhone?: string;
  contactEmail?: string;
  physicalAddress?: string;
  geoLatitude?: number;
  geoLongitude?: number;
  logoUrl?: string;
  themeColor?: string;
  currency?: string;
  upiId?: string;
  gstNumber?: string;
  gstPercentage?: number;
  totalTables?: number;
  enableWhatsappNotifications?: boolean;
  enableChefAutoAssign?: boolean;
  enableAutoAcceptOrders?: boolean;
  maintenanceMode?: boolean;
}