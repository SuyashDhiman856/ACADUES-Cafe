import React, { useMemo } from 'react';
import { CheckCircle2, Utensils } from 'lucide-react';
import { OrderStatus } from '../types';
import { useOrders } from '../hooks/useOrders';
import { useMenu } from '../hooks/useMenu';
import { useTables } from '../hooks/useTables';
import { mapApiOrderToOrder } from '../mappers/order.mapper';

const KitchenStatusBar: React.FC = () => {
  const { orders: apiOrders, updateOrderStatus } = useOrders();
  const { menuItems } = useMenu();
  const { tables } = useTables();

  const orders = useMemo(
    () =>
      (Array.isArray(apiOrders) ? apiOrders : []).map((o) =>
        mapApiOrderToOrder(o, menuItems, tables)
      ),
    [apiOrders, menuItems, tables]
  );

  const readyOrders = orders.filter((o) => o.status === OrderStatus.READY);

  if (readyOrders.length === 0) return null;

  return (
    <div className="space-y-4 px-1 animate-in slide-in-from-top duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2">
          <CheckCircle2 className="text-green-500" size={20} /> Kitchen Status
          <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full ml-1">
            {readyOrders.length} Ready
          </span>
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {readyOrders.map((order) => (
          <div
            key={order.id}
            className="min-w-[260px] bg-white rounded-[32px] border-2 border-green-100 p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-green-500 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 bg-green-50 text-green-600 rounded-bl-[20px] opacity-20 group-hover:opacity-100 transition-opacity">
              <Utensils size={16} />
            </div>

            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Ready to serve
                </span>
                <span className="text-[10px] font-black uppercase text-[#8E8E93]">
                  Table {order.tableNumber || 'N/A'}
                </span>
              </div>
              <h4 className="text-base font-black text-[#1C1C1E] truncate pr-6">
                {order.customerName || 'Guest'}
              </h4>
              <ul className="mt-2 space-y-1">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="text-[10px] font-bold text-gray-500"
                  >
                    {item.quantity}× {item.name}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => void updateOrderStatus(order.id, OrderStatus.SERVED)}
              className="w-full py-3 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-100"
            >
              <CheckCircle2 size={14} strokeWidth={3} /> Mark served
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenStatusBar;
