import { MenuItem as ApiMenuItem } from "../api/menu";
import { MenuItem } from "../types";

export function mapApiMenuItemToMenuItem(apiItem: ApiMenuItem): MenuItem {
  return {
    id: apiItem.id,
    name: apiItem.name,
    description: apiItem.description,
    category: apiItem.category?.name || "General",
    price: apiItem.price || 0,
    image: apiItem.imageUrl || "https://picsum.photos/seed/menu/400/400", // Fallback image
    dietary: apiItem.foodType as 'VEG' | 'NON_VEG',
    hasVariants: apiItem.hasSizes,
    variants: (apiItem.sizes || []).map(s => ({
      name: s.name,
      price: s.price
    })),
    isAvailable: apiItem.isAvailable ?? true
  };
}

