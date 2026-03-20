import React, {
  useState,
  useMemo,
} from "react";

import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import ControlCenter from "./pages/ControlCenter";
import Customers from "./pages/Customers";
import Delivery from "./pages/Delivery";
import Expenses from "./pages/Expenses";
import Finance from "./pages/Finance";
import Kitchen from "./pages/Kitchen";
import MenuManager from "./pages/MenuManager";
import NewOrder from "./pages/NewOrder";
import Offers from "./pages/Offers";
import Orders from "./pages/Orders";
import SelfOrder from "./pages/SelfOrder";
import Profile from "./pages/Profile";
import TableOrdering from "./pages/TableOrdering";

import { useSettings } from "./hooks/useSettings";
import { useMenu } from "./hooks/useMenu";
import { useOrders } from "./hooks/useOrders";
import { useTables } from "./hooks/useTables";
import { mapApiOrderToOrder } from "./mappers/order.mapper";
import { StaffMember, Offer, Order, OrderStatus } from "./types";

export interface CustomerRecord {
  name: string;
  phone: string;
  lastVisit: string;
  orderCount: number;
  totalSpend: number;
}

const App: React.FC = () => {

  const { settings } = useSettings();
  const { menuItems, loading: menuLoading } = useMenu();
  const { tables } = useTables();
  const { orders: apiOrders } = useOrders();
  const orders = useMemo(
    () =>
      (Array.isArray(apiOrders) ? apiOrders : []).map((o) =>
        mapApiOrderToOrder(o, menuItems, tables)
      ),
    [apiOrders, menuItems, tables]
  );

  const [currentUser, setCurrentUser] =
    useState<StaffMember | null>(
      null
    );

  const [activeTab, setActiveTab] =
    useState("dashboard");

  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "OFF-2023",
      title: "Weekend Brunch 20%",
      description: "Get 20% OFF on all brunch orders above ₹499",
      icon: "megaphone",
      variant: "dark",
      isActive: true,
      discountType: "percentage",
      discountValue: 20,
      minPurchase: 499,
      createdAt: new Date().toISOString()
    }
  ]);

  const [sentStatuses, setSentStatuses] = useState<Record<string, boolean>>({});

  const customers = useMemo(() => {
    const customerMap: Record<string, CustomerRecord> = {};
    orders.forEach(o => {
      if (!o.customerPhone) return;
      if (!customerMap[o.customerPhone]) {
        customerMap[o.customerPhone] = {
          name: o.customerName || "Guest",
          phone: o.customerPhone,
          lastVisit: o.createdAt,
          orderCount: 0,
          totalSpend: 0
        };
      }
      customerMap[o.customerPhone].orderCount++;
      if (o.status === OrderStatus.SERVED) {
        customerMap[o.customerPhone].totalSpend += o.totalAmount;
      }
      if (new Date(o.createdAt).getTime() > new Date(customerMap[o.customerPhone].lastVisit).getTime()) {
        customerMap[o.customerPhone].lastVisit = o.createdAt;
      }
    });
    return Object.values(customerMap);
  }, [orders]);

  const handleSendOffer = (phone: string, offerId: string) => {
    setSentStatuses((prev) => ({ ...prev, [phone]: true }));
  };

  const handleResetStatus = () => {
    setSentStatuses({});
  };

  const handleResetSentStatus = () => {
    setSentStatuses({});
  };



  const handleLogin =
    (user: StaffMember) => {
      setCurrentUser(user);
    };

  const handleLogout =
    () => {
      localStorage.removeItem(
        "accessToken"
      );
      setCurrentUser(null);
    };

  const renderContent = () => {
    if (!settings) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onNewOrder={() => setActiveTab("new-order")}
            onEditOrder={(order) => {
              setActiveTab("new-order");
            }}
            onUpdateItemStatus={() => {}}
          />
        );
      case "analytics":
        return <Analytics />;
      case "settings":
        return <ControlCenter />;
      case "customers":
        return (
          <Customers
            customers={customers}
            orders={orders}
            offers={offers}
            sentStatuses={sentStatuses}
            onSendOffer={handleSendOffer}
            onResetStatus={handleResetStatus}
          />
        );
      case "delivery":
        return <Delivery />;
      case "expenses":
        return <Expenses />;
      case "finance":
        return <Finance />;
      case "kitchen":
        return <Kitchen />;
      case "menu":
        return <MenuManager />;
      case "new-order":
        return (
          <NewOrder
            tenantId="resto_track_default"
            menuItems={menuItems}
            offers={offers}
            settings={settings}
            onCancel={() => setActiveTab("dashboard")}
            onSave={() => setActiveTab("dashboard")}
          />
        );
      case "offers":
        return (
          <Offers
            offers={offers}
            setOffers={setOffers}
            settings={settings}
            onResetSentStatus={handleResetSentStatus}
          />
        );
      case "orders":
        return <Orders />;
      case "self-order":
        return <SelfOrder />;
      case "profile":
        return <Profile />;
      case "table-ordering":
        return <TableOrdering />;
      default:
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onNewOrder={() => setActiveTab("new-order")}
            onEditOrder={() => setActiveTab("new-order")}
            onUpdateItemStatus={() => {}}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFCFB]">
      {currentUser ? (
        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-auto relative">
            {renderContent()}
          </main>
          <MobileNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
        </>
      ) : (
        <Login
          onLogin={handleLogin}
        />
      )}
    </div>
  );
};

export default App;