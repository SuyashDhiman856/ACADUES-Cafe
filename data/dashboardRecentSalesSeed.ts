import {
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from '../types';

/**
 * Demo rows for Dashboard → Recent Sales. Edit this list to match orders you want shown.
 * Merged with live API orders (deduped by id), newest first.
 */
export const DASHBOARD_RECENT_SALES_SEED: Order[] = [
  {
    id: 'dash-seed-1',
    tenantId: 'local',
    customerName: 'Rahul Verma',
    customerPhone: '+91 98100 11223',
    tableNumber: '2',
    orderType: OrderType.DINE_IN,
    items: [
      { id: 'seed-a', name: 'Paneer tikka', quantity: 1, price: 320 },
      { id: 'seed-b', name: 'Butter naan', quantity: 2, price: 90 },
    ],
    totalAmount: 594,
    gstAmount: 90,
    gstPercentage: 18,
    status: OrderStatus.SERVED,
    paymentMethod: PaymentMethod.UPI,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'dash-seed-2',
    tenantId: 'local',
    customerName: 'Ananya Iyer',
    customerPhone: '+91 99887 76655',
    tableNumber: '5',
    orderType: OrderType.DINE_IN,
    items: [
      { id: 'seed-c', name: 'Masala dosa', quantity: 2, price: 140 },
      { id: 'seed-d', name: 'Filter coffee', quantity: 2, price: 80 },
    ],
    totalAmount: 566,
    gstAmount: 86,
    gstPercentage: 18,
    status: OrderStatus.SERVED,
    paymentMethod: PaymentMethod.CASH,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'dash-seed-3',
    tenantId: 'local',
    customerName: "Chris D'Souza",
    tableNumber: 'Takeaway',
    orderType: OrderType.TAKEAWAY,
    items: [{ id: 'seed-e', name: 'Chicken biryani', quantity: 1, price: 480 }],
    totalAmount: 566,
    gstAmount: 86,
    gstPercentage: 18,
    status: OrderStatus.SERVED,
    paymentMethod: PaymentMethod.CARD,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];
