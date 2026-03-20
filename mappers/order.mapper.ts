import type { Table } from '../api/tables';
import type { ApiOrder } from '../types';
import {
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from '../types';

const RUNNING_STATUSES: OrderStatus[] = [
  OrderStatus.CREATED,
  OrderStatus.SENT_TO_KITCHEN,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];

/** Orders that count toward revenue / completed KPIs */
export function isRevenueOrderStatus(status: OrderStatus): boolean {
  return status === OrderStatus.SERVED;
}

export function isRunningTabStatus(status: OrderStatus): boolean {
  return RUNNING_STATUSES.includes(status);
}

export function resolveOrderItemUnitPrice(
  oi: { menuItemId: string; sizeId?: string; price?: number },
  menuItems: MenuItem[]
): number {
  const fromApi = oi.price;
  if (fromApi != null && fromApi > 0) return fromApi;

  const menu = menuItems.find((m) => m.id === oi.menuItemId);
  if (!menu) return fromApi ?? 0;

  if (oi.sizeId && menu.sizes?.length) {
    const v = menu.sizes.find((s) => s.id === oi.sizeId);
    if (v) return v.price;
  }

  return menu.price ?? 0;
}

function displayCustomerName(
  api: ApiOrder,
  tableNumber: string | undefined
): string {
  const trimmed = api.customerName?.trim();
  if (trimmed) return trimmed;
  if (tableNumber) return `Table ${tableNumber}`;
  return 'Walk-in';
}

export function mapApiOrderToOrder(
  api: ApiOrder,
  menuItems: MenuItem[],
  tables: Table[]
): Order {
  const tableNum = tables.find((t) => t.id === api.tableId)?.tableNumber;
  const tableNumber =
    tableNum != null
      ? String(tableNum)
      : api.table?.name?.replace(/\D/g, '') || undefined;

  const items: OrderItem[] = (api.orderItems || []).map((oi, idx) => {
    const menu = menuItems.find((m) => m.id === oi.menuItemId);
    const embedded = oi.menuItem;
    const name =
      (embedded && 'name' in embedded && embedded.name) ||
      menu?.name ||
      `Item ${oi.menuItemId.slice(0, 8)}`;
    const lineId = oi.sizeId
      ? `${oi.menuItemId}-${oi.sizeId}`
      : `${oi.menuItemId}-${idx}`;
    const unit = resolveOrderItemUnitPrice(oi, menuItems);
    return {
      id: lineId,
      name,
      quantity: oi.quantity,
      price: unit,
      variantName:
        oi.sizeId && menu?.sizes
          ? menu.sizes.find((s) => s.id === oi.sizeId)?.name
          : undefined,
    };
  });

  const computedSubtotal = items.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0
  );

  const gstRate = api.gstRate ?? 0;
  let subtotal = api.subtotal ?? 0;
  let total = api.totalAmount ?? 0;

  if (total <= 0 && computedSubtotal > 0) {
    subtotal = computedSubtotal;
    total = subtotal + subtotal * (gstRate / 100);
  } else if (subtotal <= 0 && computedSubtotal > 0) {
    subtotal = computedSubtotal;
    if (total <= 0) total = subtotal + subtotal * (gstRate / 100);
  }

  const gstAmount = Math.max(0, total - subtotal);

  return {
    id: api.id,
    tenantId: '',
    customerName: displayCustomerName(api, tableNumber),
    customerPhone: api.customerPhone?.trim() || undefined,
    tableNumber,
    orderType: (api.orderType as OrderType) || OrderType.DINE_IN,
    items,
    totalAmount: total,
    gstAmount,
    gstPercentage: gstRate,
    status: api.status,
    paymentMethod: PaymentMethod.CASH,
    createdAt: api.createdAt,
    isCancelled: api.status === OrderStatus.CANCELLED,
  };
}

export type CheckoutCartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variantName?: string;
};

/** After POST /orders, merge POS-computed totals + guest details when API omits or zeroes them */
export function mergeDisplayedCheckoutOrder(
  mapped: Order,
  local: {
    customerName: string;
    customerPhone?: string;
    subtotal: number;
    gstAmount: number;
    gstPercentage: number;
    total: number;
    cartLines: CheckoutCartLine[];
  }
): Order {
  const name =
    local.customerName.trim() ||
    mapped.customerName ||
    (mapped.tableNumber ? `Table ${mapped.tableNumber}` : 'Walk-in');
  const phone = local.customerPhone?.trim() || mapped.customerPhone;

  const useLocalTotals =
    local.total > 0 &&
    (mapped.totalAmount <= 0 ||
      (mapped.items.length === 0 && local.cartLines.length > 0));

  const items: OrderItem[] = useLocalTotals
    ? local.cartLines.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        variantName: c.variantName,
      }))
    : mapped.items;

  return {
    ...mapped,
    customerName: name,
    customerPhone: phone,
    items,
    totalAmount: useLocalTotals ? local.total : mapped.totalAmount,
    gstAmount: useLocalTotals ? local.gstAmount : mapped.gstAmount,
    gstPercentage: useLocalTotals ? local.gstPercentage : mapped.gstPercentage,
  };
}
