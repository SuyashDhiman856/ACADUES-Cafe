
import React from 'react';
import { CheckCircle2, Utensils, Clock } from 'lucide-react';
import { Order, ItemStatus } from '../types';
import { useOrders } from '../hooks/useOrders';

interface KitchenStatusBarProps {
  // No props needed - using hooks instead
}

const KitchenStatusBar: React.FC<KitchenStatusBarProps> = () => {
  const { orders: ordersData, updateItemStatus } = useOrders();
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const activeOrders = orders.filter(o => o.status === 'ACTIVE' && !o.isCancelled);
  // Extract all ready items from active orders
  const readyItems = activeOrders.flatMap(order => 
    order.items
      .filter(item => item.status === ItemStatus.READY)
      .map(item => ({
        orderId: order.id,
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        ...item
      }))
  );

  if (readyItems.length === 0) return null;

  return (
    <div className="space-y-4 px-1 animate-in slide-in-from-top duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2">
          <CheckCircle2 className="text-green-500" size={20} /> Kitchen Status
          <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full ml-1">
            {readyItems.length} Ready
          </span>
        </h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {readyItems.map((item, index) => (
          <div 
            key={`${item.orderId}-${item.id}-${index}`} 
            className="min-w-[240px] bg-white rounded-[32px] border-2 border-green-100 p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-green-500 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 bg-green-50 text-green-600 rounded-bl-[20px] opacity-20 group-hover:opacity-100 transition-opacity">
              <Utensils size={16} />
            </div>

            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Ready to Serve</span>
                <span className="text-[10px] font-black uppercase text-[#8E8E93]">Table {item.tableNumber || 'N/A'}</span>
              </div>
              <h4 className="text-base font-black text-[#1C1C1E] truncate pr-6">{item.name}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                For {item.customerName || 'Guest'} • Qty: {item.quantity}
              </p>
            </div>

            <button 
              onClick={() => updateItemStatus(item.orderId, item.id, ItemStatus.DELIVERED)}
              className="w-full py-3 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-100"
            >
              <CheckCircle2 size={14} strokeWidth={3} /> Mark Delivered
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenStatusBar;
