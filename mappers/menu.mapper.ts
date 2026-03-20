import { MenuItem as ApiMenuItem } from "../api/menu";
import { MenuItem } from "../types";

export function mapApiMenuItemToMenuItem(apiItem: ApiMenuItem): MenuItem {
  return {
    id: apiItem.id,
    tenantId: "resto_track_default", // API doesn't provide tenantId
    name: apiItem.name,
    category: apiItem.category?.name || "General",
    price: apiItem.price || 0,
    cost: 0, // API doesn't provide cost
    stock: 99, // API doesn't provide stock, using a default
    image: apiItem.imageUrl || "https://picsum.photos/seed/menu/200/200", // Fallback image
    dietary: apiItem.foodType === "VEG" ? "Veg" : apiItem.foodType === "EGG" ? "Egg" : "Non-Veg",
    hasVariants: apiItem.hasSizes,
    variants: (apiItem.sizes || []).map(s => ({
      size: s.name,
      price: s.price,
      cost: 0
    })),
    isAvailable: apiItem.isAvailable ?? true
  };
}
