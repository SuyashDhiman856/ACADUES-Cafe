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
      apiSettings.tables || [],
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
    expenseCashSplit:
      apiSettings.expenseCashSplit ?? 0.3,
  };

}