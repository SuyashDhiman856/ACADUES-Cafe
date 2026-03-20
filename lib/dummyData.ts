
import { MenuItem, Order, OrderStatus, OrderType, PaymentMethod, Expense, ItemStatus, Offer, SystemSettings, StaffMember, UserRole } from '../types';

// Centralized UI Categories
export const CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Sides'];

const DEFAULT_TID = 'resto_track_default';

// Default Application Settings - Centralized configuration
export const DEFAULT_SETTINGS: SystemSettings = {
  restaurantName: '02 Cafe',
  address: 'Shop 102, Garden Towers, Mumbai',
  phone: '+91 98200 12345',
  gstEnabled: true,
  gstPercentage: 5,
  gstNumber: '27AAAAA0000A1Z5',
  serviceChargeEnabled: false,
  serviceChargePercentage: 5,
  currency: '₹',
  orderIdPrefix: 'RS',
  expenseCashSplit: 0.3, // 30% from Cash, 70% from Bank
  tables: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  primaryColor: '#D17842',
  logoUrl: '',
  upiId: 'tyagiakshit1805-2@okhdfcbank',
  whatsappEnabled: true,
  whatsappConfirmationTemplate: "Hello {{customer}}! 🍽️ Your order #{{orderId}} at {{restaurant}} has been confirmed. Total: {{currency}}{{total}}. Your items: {{items}}. We're preparing it with love! ❤️",
  whatsappSettledTemplate: "Hi {{customer}}! Hope you enjoyed your meal at {{restaurant}}. 🥤 Your order #{{orderId}} for {{currency}}{{total}} has been settled. Visit us again soon! ✨"
};

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STF-001',
    name: 'Admin User',
    phone: '9999999999',
    email: 'admin@cafe.com',
    tenantId: DEFAULT_TID,
    role: UserRole.OWNER,
    permissions: ['dashboard', 'kitchen', 'orders', 'menu', 'expenses', 'customers', 'analytics', 'settings', 'finance'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'STF-002',
    name: 'Chef Vikas',
    phone: '9888888888',
    email: 'vikas@cafe.com',
    tenantId: DEFAULT_TID,
    role: UserRole.KITCHEN,
    permissions: ['kitchen'],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'o1',
    title: 'Happy Hours: 20% OFF',
    description: 'Valid from 4 PM to 7 PM',
    icon: 'megaphone',
    variant: 'light',
    createdAt: new Date().toISOString(),
    isActive: true,
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 0,
    whatsappMessage: "Hey! 🍻 Happy Hours are here! Get 20% OFF on your favorite drinks and snacks at 02 Cafe. Valid from 4 PM to 7 PM. See you soon!"
  },
  {
    id: 'o2',
    title: 'Flat ₹100 OFF on ₹999+',
    description: 'Limited Time Offer',
    icon: 'gift',
    variant: 'dark',
    createdAt: new Date().toISOString(),
    isActive: true,
    discountType: 'flat',
    discountValue: 100,
    minPurchase: 999,
    whatsappMessage: "Hi there! 🎁 Treat yourself today! Get a flat ₹100 OFF on orders above ₹999 at 02 Cafe. Use this special deal before it's gone! ✨"
  }
];

export const INITIAL_MENU: MenuItem[] = [
  { id: 'dish-001', tenantId: DEFAULT_TID, name: 'Paneer Tikka', category: 'Starters', price: 280, cost: 120, stock: 50, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-011', tenantId: DEFAULT_TID, name: 'Chicken Wings', category: 'Starters', price: 320, cost: 140, stock: 40, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop', dietary: 'Non-Veg', hasVariants: false, isAvailable: true },
  { 
    id: 'dish-002', 
    tenantId: DEFAULT_TID,
    name: 'Butter Chicken', 
    category: 'Main Course', 
    price: 320, 
    cost: 180, 
    stock: 30, 
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=400&fit=crop', 
    dietary: 'Non-Veg',
    hasVariants: true,
    variants: [
      { size: 'Half', price: 320, cost: 180 },
      { size: 'Full', price: 550, cost: 300 }
    ],
    isAvailable: true
  },
  { id: 'dish-003', tenantId: DEFAULT_TID, name: 'Dal Makhani', category: 'Main Course', price: 320, cost: 140, stock: 40, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-004', tenantId: DEFAULT_TID, name: 'Gulab Jamun', category: 'Desserts', price: 120, cost: 45, stock: 100, image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
  { 
    id: 'dish-005', 
    tenantId: DEFAULT_TID,
    name: 'Masala Chai', 
    category: 'Beverages', 
    price: 30, 
    cost: 10, 
    stock: 200, 
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4586d56c?w=400&h=400&fit=crop', 
    dietary: 'Veg',
    hasVariants: true,
    variants: [
      { size: 'Cutting', price: 30, cost: 10 },
      { size: 'Full', price: 60, cost: 15 },
      { size: 'Large Pot', price: 180, cost: 45 }
    ],
    isAvailable: true
  },
  { id: 'dish-006', tenantId: DEFAULT_TID, name: 'Crispy Corn', category: 'Starters', price: 220, cost: 90, stock: 60, image: 'https://images.unsplash.com/photo-1514516369464-3268f121b64d?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-007', tenantId: DEFAULT_TID, name: 'Chicken Biryani', category: 'Main Course', price: 380, cost: 180, stock: 25, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=400&h=400&fit=crop', dietary: 'Non-Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-012', tenantId: DEFAULT_TID, name: 'Fish Tikka', category: 'Starters', price: 350, cost: 160, stock: 20, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop', dietary: 'Non-Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-008', tenantId: DEFAULT_TID, name: 'Garlic Naan', category: 'Sides', price: 80, cost: 25, stock: 150, image: 'https://images.unsplash.com/photo-1601050633622-3d5bb00bc877?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-009', tenantId: DEFAULT_TID, name: 'Brownie with Ice Cream', category: 'Desserts', price: 240, cost: 95, stock: 20, image: 'https://images.unsplash.com/photo-1564844536311-de546a28c87d?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
  { id: 'dish-010', tenantId: DEFAULT_TID, name: 'Cold Coffee', category: 'Beverages', price: 180, cost: 60, stock: 40, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop', dietary: 'Veg', hasVariants: false, isAvailable: true },
];

const getPastDate = (daysAgo: number, hoursAgo: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};

// Generate 1500+ Orders
export const INITIAL_ORDERS: Order[] = [];
const customerNames = ['Rahul Sharma', 'Ananya Iyer', 'Vikram Singh', 'Priya Gupta', 'Amit Patel', 'Suresh Kumar', 'Neha Reddy', 'Karan Mehta', 'Simran Kaur', 'Aditya Verma', 'Rohan Das', 'Ishani Roy', 'Zoya Khan', 'Kabir Malhotra'];
const paymentMethods = [PaymentMethod.UPI, PaymentMethod.UPI, PaymentMethod.CASH, PaymentMethod.CARD];

for (let i = 0; i < 1500; i++) {
  const randomFactor = Math.random();
  let daysAgo;
  if (randomFactor > 0.8) {
    daysAgo = Math.floor(Math.random() * 7);
  } else if (randomFactor > 0.5) {
    daysAgo = Math.floor(Math.random() * 30);
  } else {
    daysAgo = Math.floor(Math.random() * 365);
  }

  const hoursAgo = Math.floor(Math.random() * 24);
  const isToday = daysAgo === 0;
  
  const itemCount = 2 + Math.floor(Math.random() * 5);
  const items = [];
  let subtotal = 0;
  
  for (let j = 0; j < itemCount; j++) {
    const menuItem = INITIAL_MENU[Math.floor(Math.random() * INITIAL_MENU.length)];
    const qty = 1 + Math.floor(Math.random() * 3);
    
    const existingItem = items.find(it => it.id === menuItem.id);
    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.deliveredQuantity += qty;
    } else {
      items.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        deliveredQuantity: qty,
        status: ItemStatus.DELIVERED
      });
    }
    subtotal += menuItem.price * qty;
  }

  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  INITIAL_ORDERS.push({
    id: `${DEFAULT_SETTINGS.orderIdPrefix}-${3000 + i}`,
    tenantId: DEFAULT_TID,
    customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
    customerPhone: `9${Math.floor(700000000 + Math.random() * 299999999)}`,
    tableNumber: String(1 + Math.floor(Math.random() * 25)),
    orderType: Math.random() > 0.2 ? OrderType.DINE_IN : OrderType.TAKEAWAY,
    items,
    totalAmount: total,
    gstAmount: gst,
    gstPercentage: 5,
    status: (isToday && i % 10 === 0) ? OrderStatus.ACTIVE : OrderStatus.COMPLETED,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    createdAt: getPastDate(daysAgo, hoursAgo)
  });
}

INITIAL_ORDERS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const INITIAL_EXPENSES: Expense[] = [];
const expenseCategories = ['Raw Materials', 'Utilities', 'Staff', 'Marketing', 'Rent', 'Maintenance'];

for (let m = 0; m < 12; m++) {
  const daysAgo = m * 30 + 5;
  INITIAL_EXPENSES.push({
    id: `EXP-R-${m}`,
    tenantId: DEFAULT_TID,
    title: 'Monthly Venue Rent',
    category: 'Rent',
    amount: 22000,
    date: getPastDate(daysAgo).split('T')[0],
    paymentMethod: PaymentMethod.BANK_TRANSFER
  });
  INITIAL_EXPENSES.push({
    id: `EXP-S-${m}`,
    tenantId: DEFAULT_TID,
    title: 'Payroll Disbursement',
    category: 'Staff',
    amount: 30000,
    date: getPastDate(daysAgo + 2).split('T')[0],
    paymentMethod: PaymentMethod.BANK_TRANSFER
  });
  INITIAL_EXPENSES.push({
    id: `EXP-U-${m}`,
    tenantId: DEFAULT_TID,
    title: 'Electricity & Water',
    category: 'Utilities',
    amount: 8500 + Math.floor(Math.random() * 2000),
    date: getPastDate(daysAgo + 10).split('T')[0],
    paymentMethod: PaymentMethod.UPI
  });
}

for (let i = 0; i < 120; i++) {
  const cat = expenseCategories[Math.floor(Math.random() * 4)];
  const daysAgo = Math.floor(Math.random() * 365);
  const isAdvance = Math.random() > 0.8;
  const isUnpaid = Math.random() > 0.9;
  const methods = [PaymentMethod.CASH, PaymentMethod.UPI, PaymentMethod.UPI];
  
  INITIAL_EXPENSES.push({
    id: `VAR-E-${i}`,
    tenantId: DEFAULT_TID,
    title: `${cat} Procurement / Service`,
    category: cat,
    amount: 800 + Math.floor(Math.random() * 7000),
    date: getPastDate(daysAgo).split('T')[0],
    paymentMethod: methods[Math.floor(Math.random() * methods.length)],
    isAdvance,
    isUnpaid
  });
}

INITIAL_EXPENSES.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
