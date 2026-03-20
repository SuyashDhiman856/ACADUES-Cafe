import React, { useEffect, useState, useMemo } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, Timer, Coffee, LogOut, ChevronRight, CheckCircle, ListChecks, ChevronDown, Calendar, X, RefreshCw } from 'lucide-react';
import { ApiOrder, OrderStatus, OrderType, UserRole } from '../types';
import { useOrders } from '../hooks/useOrders';

interface KitchenProps { }

type TimeFilter = 'Today' | 'This Week' | 'Month' | 'Year' | 'Custom';

const Kitchen: React.FC<KitchenProps> = () => {
  const { orders: ordersData, loading, updateOrderStatus, fetchOrders } = useOrders(true);
  const orders = Array.isArray(ordersData) ? (ordersData as ApiOrder[]) : [];

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Today');

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt);
    return Math.floor((now.getTime() - start.getTime()) / 60000);
  };

  // Filter orders by status for tabs
  const pendingOrders = orders.filter(o =>
    [OrderStatus.CREATED, OrderStatus.SENT_TO_KITCHEN, OrderStatus.PREPARING].includes(o.status)
  );

  const completedOrders = orders.filter(o =>
    [OrderStatus.READY, OrderStatus.SERVED].includes(o.status)
  );

  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === OrderStatus.CREATED || currentStatus === OrderStatus.SENT_TO_KITCHEN) {
      nextStatus = OrderStatus.PREPARING;
    } else if (currentStatus === OrderStatus.PREPARING) {
      nextStatus = OrderStatus.READY;
    } else if (currentStatus === OrderStatus.READY) {
      nextStatus = OrderStatus.SERVED;
    }

    if (nextStatus !== currentStatus) {
      await updateOrderStatus(orderId, nextStatus);
    }
  };

  const renderOrderCard = (order: ApiOrder) => {
    const elapsed = getElapsedTime(order.createdAt);
    const isLate = elapsed > 15 && order.status !== OrderStatus.READY;

    return (
      <div
        key={order.id}
        className={`bg-white rounded-[32px] border-2 transition-all shadow-sm flex flex-col ${isLate ? 'border-red-100' : 'border-[#F1E7E1]'}`}
      >
        <div className={`p-5 rounded-t-[30px] flex items-start justify-between ${order.status === OrderStatus.READY ? 'bg-green-50' : isLate ? 'bg-red-50' : 'bg-[#F9F5F2]'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-[#D17842]">{order.id.slice(-6)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${order.orderType === OrderType.DINE_IN ? 'bg-orange-100 text-[#D17842]' : 'bg-blue-100 text-blue-600'}`}>
                {order.orderType}
              </span>
            </div>
            <h4 className="text-xl font-black text-[#1C1C1E]">
              {order.table?.name || `Table ${order.tableId}`}
            </h4>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 font-black text-sm ${isLate ? 'text-red-500' : 'text-[#8E8E93]'}`}>
              <Timer size={14} />
              <span>{elapsed}m</span>
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 mt-1 block tracking-widest">{order.status.replace(/_/g, ' ')}</span>
          </div>
        </div>

        <div className="p-5 flex-1 space-y-3">
          {order.orderItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F9F5F2] flex items-center justify-center text-[11px] font-black text-[#D17842]">
                  {item.quantity}x
                </div>
                <div>
                  <p className="text-sm font-black text-[#1C1C1E]">{item.menuItem?.name || 'Loading item...'}</p>
                </div>
              </div>
              {order.status === OrderStatus.READY && <CheckCircle size={16} className="text-green-500" />}
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#F9F5F2]/30 border-t border-[#F1E7E1] rounded-b-[32px]">
          <button
            onClick={() => handleStatusUpdate(order.id, order.status)}
            className={`w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 shadow-lg ${order.status === OrderStatus.READY
                ? 'bg-[#1C1C1E] text-white shadow-black/10'
                : order.status === OrderStatus.PREPARING
                  ? 'bg-green-500 text-white shadow-green-100'
                  : 'bg-[#D17842] text-white shadow-orange-100'
              }`}
          >
            {order.status === OrderStatus.READY ? 'Mark as Served' : order.status === OrderStatus.PREPARING ? 'Mark as Done' : 'Start Cooking'}
          </button>
        </div>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw size={48} className="animate-spin text-[#D17842] mb-4" />
        <p className="font-black text-gray-400 uppercase tracking-widest">Warming Up Kitchen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1C1C1E] text-white rounded-2xl shadow-xl shadow-black/10">
              <ChefHat size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Kitchen Board</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Assigned Culinary Tasks</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => void fetchOrders()} className="p-3 bg-white border border-[#F1E7E1] rounded-2xl text-[#D17842] hover:bg-orange-50 transition-all active:rotate-180">
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="inline-flex bg-[#F9F5F2] p-1.5 rounded-3xl w-full md:w-auto shadow-inner">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 md:flex-none px-10 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'pending' ? 'bg-[#1C1C1E] text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Active ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 md:flex-none px-10 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'completed' ? 'bg-green-500 text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          History ({completedOrders.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(activeTab === 'pending' ? pendingOrders : completedOrders).map(renderOrderCard)}
        {(activeTab === 'pending' ? pendingOrders : completedOrders).length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white border-2 border-dashed border-[#F1E7E1] rounded-[48px] text-center opacity-60">
            <Clock size={64} className="text-gray-200 mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No Tasks Found</h3>
            <p className="text-sm font-bold text-gray-300 mt-2">New assigned orders will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kitchen;