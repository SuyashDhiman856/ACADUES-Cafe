import { Settings } from "../api/settings";
import { SystemSettings } from "../types/systemSettings";

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function resolveCurrencySymbol(
  currencyCode?: string
): string {
  if (!currencyCode) return "₹";
  return (
    CURRENCY_SYMBOL_MAP[currencyCode] ||
    currencyCode
  );
}

export function mapSettingsToSystemSettings(
  apiSettings: Settings
): SystemSettings {

  return {
    id: apiSettings.id,
    restaurantName:
      apiSettings.restaurantName || "Restaurant",
    address:
      apiSettings.physicalAddress || "",
    phone:
      apiSettings.contactPhone || "",
    primaryColor:
      apiSettings.themeColor || "#D17842",
    currency:
      apiSettings.currency || "INR",
    currencySymbol:
      resolveCurrencySymbol(
        apiSettings.currency
      ),
    whatsappEnabled:
      apiSettings.enableWhatsappNotifications ?? false,
    gstPercentage:
      apiSettings.gstPercentage ?? 0,
    totalTables:
      apiSettings.totalTables ?? 0,
    tables:
      (apiSettings as any).tables || [],
    logoUrl:
      apiSettings.logoUrl,
    upiId:
      apiSettings.upiId,
    gstNumber:
      apiSettings.gstNumber,
    whatsappConfirmationTemplate:
      apiSettings.whatsappConfirmationTemplate,
    whatsappSettledTemplate:
      apiSettings.whatsappSettledTemplate,
    contactEmail:
      apiSettings.contactEmail || "",
    geoLatitude:
      apiSettings.geoLatitude || 0,
    geoLongitude:
      apiSettings.geoLongitude || 0,
    enableChefAutoAssign:
      apiSettings.enableChefAutoAssign ?? false,
    enableAutoAcceptOrders:
      apiSettings.enableAutoAcceptOrders ?? false,
    maintenanceMode:
      apiSettings.maintenanceMode ?? false,
  };

}

export function reverseMapSystemSettingsToSettings(
  systemSettings: SystemSettings
): Partial<Settings> {
  return {
    restaurantName: systemSettings.restaurantName,
    physicalAddress: systemSettings.address,
    contactPhone: systemSettings.phone,
    contactEmail: systemSettings.contactEmail,
    themeColor: systemSettings.primaryColor,
    currency: systemSettings.currency,
    enableWhatsappNotifications: systemSettings.whatsappEnabled,
    gstPercentage: systemSettings.gstPercentage,
    totalTables: systemSettings.totalTables,
    logoUrl: systemSettings.logoUrl,
    upiId: systemSettings.upiId,
    gstNumber: systemSettings.gstNumber,
    whatsappConfirmationTemplate: systemSettings.whatsappConfirmationTemplate,
    whatsappSettledTemplate: systemSettings.whatsappSettledTemplate,
    geoLatitude: systemSettings.geoLatitude,
    geoLongitude: systemSettings.geoLongitude,
    enableChefAutoAssign: systemSettings.enableChefAutoAssign,
    enableAutoAcceptOrders: systemSettings.enableAutoAcceptOrders,
    maintenanceMode: systemSettings.maintenanceMode,
  };
}