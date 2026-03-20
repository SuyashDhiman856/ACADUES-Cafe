
export enum OrderStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  IN_PROGRESS = 'In Progress',
  ACTIVE = 'Active' // For open tabs/tables
}

export enum ItemStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  DELIVERED = 'Delivered'
}

export enum PaymentMethod {
  CASH = 'Cash',
  UPI = 'UPI',
  CARD = 'Card',
  BANK_TRANSFER = 'Bank Transfer'
}

export enum OrderType {
  DINE_IN = 'Dine-in',
  TAKEAWAY = 'Takeaway',
  DELIVERY = 'Delivery'
}

export enum UserRole {
  OWNER = 'Owner',
  MANAGER = 'Manager',
  STAFF = 'Staff',
  KITCHEN = 'Kitchen',
  CHEF = "CHEF",
  CUSTOMER = "CUSTOMER"
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string; // For simulation
  role: UserRole;
  permissions: string[]; // List of tab/module IDs they can access
  tenantId: string; // Added to link user to restaurant
  createdAt: string;
}

export interface MenuVariant {
  size: string;
  price: number;
  cost: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  deliveredQuantity?: number;
  price: number;
  status?: ItemStatus;
  variantName?: string; // e.g., "Small", "Large"
}

export interface Order {
  id: string;
  tenantId: string; // Multi-tenant safety
  customerName: string;
  customerPhone?: string;
  tableNumber?: string;
  address?: string; // Added for Delivery
  locationLink?: string; // Added for Delivery
  orderType: OrderType;
  items: OrderItem[];
  totalAmount: number;
  gstAmount: number;
  gstPercentage: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  isCancelled?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  appliedOfferId?: string; // Added to link marketing offers to sales
}

export interface MenuItem {
  id: string;
  tenantId: string; // Multi-tenant safety
  name: string;
  category: string;
  price: number; // Base price or starting price
  cost: number;  // Base cost
  stock: number;
  image: string;
  dietary: 'Veg' | 'Non-Veg' | 'Egg';
  hasVariants: boolean;
  variants?: MenuVariant[];
  isAvailable: boolean; // Added for availability toggle
}

export interface Expense {
  id: string;
  tenantId: string; // Multi-tenant safety
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod; // Added for Finance tracking
  receiptUrl?: string;
  isAdvance?: boolean;
  isUnpaid?: boolean; // Credit
  isCancelled?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  icon: 'megaphone' | 'gift' | 'sparkles';
  variant: 'light' | 'dark';
  createdAt: string;
  isActive: boolean;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minPurchase?: number; // Minimum purchase amount to be eligible
  whatsappMessage?: string; // Customizable WhatsApp message
}

export interface SystemSettings {
  restaurantName: string;
  address: string;
  phone: string;
  gstEnabled: boolean;
  gstPercentage: number;
  gstNumber: string;
  serviceChargeEnabled: boolean;
  serviceChargePercentage: number;
  currency: string;
  orderIdPrefix: string;
  expenseCashSplit: number; // Percentage (0-1) of expenses taken from Cash vs Bank
  tables: string[]; // List of available tables
  primaryColor: string; // Theme color
  logoUrl?: string; // Brand logo
  upiId: string; // Added for UPI payments
  whatsappEnabled: boolean;
  whatsappConfirmationTemplate: string;
  whatsappSettledTemplate: string;
}

export interface BusinessStats {
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  activeTables: number;
}

// API Types
export interface ApiMenuItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  foodType: 'VEG' | 'NON_VEG';
  hasSizes: boolean;
  price: number;
  image?: string;
  sizes?: Array<{
    name: string;
    price: number;
  }>;
  isAvailable?: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiOrder {
  id: string;
  tableId?: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    sizeId?: string;
    price: number;
    name: string;
  }>;
  subtotal: number;
  gstAmount: number;
  total: number;
  status: 'CREATED' | 'SENT_TO_KITCHEN' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
  chefId?: string;
}

export interface ApiSettings {
  id?: string;
  restaurantName: string;
  contactPhone: string;
  physicalAddress: string;
  logoUrl?: string;
  themeColor: string;
  upiId: string;
  currency: string;
  gstNumber: string;
  gstPercentage: number;
  totalTables: number;
  createdAt?: string;
  updatedAt?: string;
}
