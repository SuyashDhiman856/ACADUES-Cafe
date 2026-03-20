
export enum OrderStatus {
  CREATED = 'CREATED',
  SENT_TO_KITCHEN = 'SENT_TO_KITCHEN',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
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
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY'
}

export enum UserRole {
  OWNER = 'OWNER',
  CHEF = 'CHEF',
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
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
  id: string;
  name: string;
  price: number;
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
  name: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  dietary: 'VEG' | 'NON_VEG';
  hasSizes: boolean;
  sizes?: MenuVariant[];
  isAvailable: boolean;
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
  id: string;
  restaurantName: string;
  address: string;
  phone: string;
  contactEmail?: string;
  primaryColor: string;
  currency: string;
  currencySymbol: string;
  whatsappEnabled: boolean;
  gstPercentage: number;
  totalTables: number;
  upiId?: string;
  gstNumber?: string;
  whatsappConfirmationTemplate?: string;
  whatsappSettledTemplate?: string;
  tables: string[];
  logoUrl?: string;
  geoLatitude?: number;
  geoLongitude?: number;
  enableChefAutoAssign: boolean;
  enableAutoAcceptOrders: boolean;
  maintenanceMode: boolean;
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

export interface ApiTable {
  id: string;
  name: string;
}

export interface ApiOrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  total: number;
  sizeId?: string;
  menuItem?: MenuItem | { name?: string; id?: string };
}

export interface ApiOrder {
  id: string;
  tableId: string;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  chefId?: string | null;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  gstRate: number;
  totalAmount: number;
  createdAt: string;
  orderItems: ApiOrderItem[];
  table?: ApiTable;
  chef?: User;
}

export interface CreateOrderDto {
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    menuItemId: string;
    sizeId?: string;
    quantity: number;
  }>;
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

export interface ApiCartItem {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  menuItem: MenuItem;
}

export interface ApiCart {
  id: string;
  tableId: string;
  cartItems: ApiCartItem[];
}

export interface AddItemToCartDto {
  tableId: string;
  menuItemId: string;
  quantity: number;
}
