import React, { useState, useMemo, memo } from "react";
import {
  LayoutDashboard,
  Receipt,
  Utensils,
  IndianRupee,
  PieChart,
  Settings,
  ChefHat,
  Users,
  ScrollText,
  Sparkles,
  Truck,
  LogOut,
} from "lucide-react";

import { SystemSettings } from "../types/systemSettings";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: SystemSettings | null;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
}

const MENU_ITEMS: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "self-order", label: "Self Order", icon: ScrollText },
  { id: "delivery", label: "Deliver", icon: Truck },
  { id: "kitchen", label: "Kitchen View", icon: ChefHat },
  { id: "orders", label: "Order History", icon: Receipt },
  { id: "menu", label: "Menu Manager", icon: Utensils },
  { id: "expenses", label: "Expenses", icon: IndianRupee },
  { id: "finance", label: "Finance Books", icon: ScrollText },
  { id: "customers", label: "Customer CRM", icon: Users },
  { id: "offers", label: "Offers & Deals", icon: Sparkles },
  { id: "analytics", label: "Reports", icon: PieChart },
  { id: "settings", label: "Control Center", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Prevent crash if settings not loaded yet
   */
  const primaryColor =
    settings?.primaryColor || "#D17842";

  const restaurantName =
    settings?.restaurantName || "Restaurant";

  /**
   * Memoized handler
   */
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  /**
   * Memoized menu rendering
   */
  const renderedMenu = useMemo(() => {
    return MENU_ITEMS.map((item) => {
      const isActive =
        activeTab === item.id;

      const Icon = item.icon;

      return (
        <button
          key={item.id}
          onClick={() =>
            handleTabClick(item.id)
          }
          className={`
            flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
            ${
              isActive
                ? "text-white shadow-md"
                : "text-[#6B7280] hover:bg-[#F9F5F2]"
            }
          `}
          style={{
            backgroundColor: isActive
              ? primaryColor
              : "transparent",
            color: isActive
              ? "white"
              : undefined,
          }}
        >
          <Icon
            size={20}
            strokeWidth={
              isActive ? 2.5 : 2
            }
          />

          <span className="font-medium">
            {item.label}
          </span>
        </button>
      );
    });
  }, [activeTab, primaryColor]);

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#F1E7E1]
        transition-transform duration-300 transform
        ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
        lg:relative lg:translate-x-0 hidden lg:block
      `}
    >
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="p-6">

          <div className="flex items-center gap-3">

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{
                backgroundColor:
                  primaryColor,
              }}
            >
              <Utensils size={24} />
            </div>

            <h1 className="text-xl font-bold tracking-tight truncate">
              {restaurantName}

              <span
                style={{
                  color:
                    primaryColor,
                }}
              >
                .
              </span>

            </h1>

          </div>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {renderedMenu}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#F1E7E1] space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9F5F2]">
            <img
              src="https://picsum.photos/seed/restaurant/40/40"
              alt="Admin"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-[#2D2D2D] truncate">
                {restaurantName}
              </p>
              <p className="text-xs text-[#6B7280]">
                Admin Panel
              </p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-medium"
          >
            <LogOut size={20} strokeWidth={2} />
            <span>Log Out</span>
          </button>
        </div>

      </div>

    </aside>
  );
};

export default memo(Sidebar);