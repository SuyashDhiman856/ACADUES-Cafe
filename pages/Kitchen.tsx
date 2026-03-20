import React, { useEffect, useState, useMemo } from 'react';
import { ChefHat, Clock, CheckCircle2, Flame, Timer, Coffee, LogOut, ChevronRight, CheckCircle, ListChecks, ChevronDown, Calendar, X } from 'lucide-react';
import { Order, ItemStatus, OrderType } from '../types';
import { useOrders } from '../hooks/useOrders';

interface KitchenProps {
  // No props needed - using hooks instead
}

type TimeFilter = 'Today' | 'This Week' | 'Month' | 'Year' | 'Custom';

const Kitchen: React.FC<KitchenProps> = () => {
  const { orders: ordersData } = useOrders();
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const activeOrders = orders.filter(o => o.status === 'ACTIVE' && !o.isCancelled);
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Update clock every minute for elapsed time calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const filterStartTime = useMemo(() => {
    const d = new Date();
    const startOfToday = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    switch (timeFilter) {
      case 'Today':
        return startOfToday;
      case 'This Week':
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
      case 'Month':
        return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      case 'Year':
        return new Date(d.getFullYear(), 0, 1).getTime();
      case 'Custom':
        return customStartDate ? new Date(customStartDate).getTime() : 0;
      default:
        return startOfToday;
    }
  }, [timeFilter, customStartDate]);

  const filterEndTime = useMemo(() => {
    if (timeFilter === 'Custom' && customEndDate) {
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    return Infinity;
  }, [timeFilter, customEndDate]);

  const filteredOrdersByDate = useMemo(() => {
    return activeOrders.filter(order => {
      const orderTime = new Date(order.createdAt).getTime();
      return orderTime >= filterStartTime && orderTime <= filterEndTime;
    });
  }, [activeOrders, filterStartTime, filterEndTime]);

  const getElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt);
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diff;
  };

  const isOrderFullyReady = (order: Order) => {
    return order.items.every(item => {
       const isAtDestinationState = item.status === ItemStatus.READY || item.status === ItemStatus.DELIVERED;
       const isFullyServed = item.quantity === (item.deliveredQuantity || 0);
       return isAtDestinationState || isFullyServed;
    });
  };

  const pendingOrders = filteredOrdersByDate.filter(order => !isOrderFullyReady(order));
  const completedOrders = filteredOrdersByDate.filter(order => isOrderFullyReady(order));

  const getOrderStats = (order: Order) => {
    const total = order.items.length;
    const readyCount = order.items.filter(i => i.status === ItemStatus.READY || i.status === ItemStatus.DELIVERED).length;
    const preparing = order.items.filter(i => i.status === ItemStatus.PREPARING).length;
    return { total, ready: readyCount, preparing, progress: (readyCount / total) * 100 };
  };

  const renderOrderCard = (order: Order) => {
    const { total, ready, progress } = getOrderStats(order);
    const elapsed = getElapsedTime(order.createdAt);
    const isLate = elapsed > 20 && !isOrderFullyReady(order);

    return (
      <div 
        key={order.id} 
        className={`bg-white rounded-[32px] border-2 transition-all overflow-hidden flex flex-col shadow-sm animate-in zoom-in duration-300 ${isLate ? 'border-red-100 shadow-red-50' : 'border-[#F1E7E1]'}`}
      >
        <div className={`p-5 flex items-start justify-between ${isOrderFullyReady(order) ? 'bg-green-50/50' : isLate ? 'bg-red-50/50' : 'bg-[#F9F5F2]/30'}`}>
           <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase text-[#D17842] tracking-widest">{order.id}</span>
                {order.orderType === OrderType.TAKEAWAY && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded-full uppercase">Takeaway</span>
                )}
                {isOrderFullyReady(order) && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[8px] font-black rounded-full uppercase flex items-center gap-1">
                    <CheckCircle size={8} /> Fully Ready
                  </span>
                )}
              </div>
              <h4 className="text-xl font-black text-[#1C1C1E]">Table {order.tableNumber || 'N/A'}</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{order.customerName || 'Guest'}</p>
           </div>
           <div className="text-right">
              <div className={`flex items-center gap-1 font-black text-sm ${isLate ? 'text-red-500' : 'text-[#8E8E93]'}`}>
                 <Timer size={16} />
                 <span>{elapsed}m</span>
              </div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Total Time</p>
           </div>
        </div>

        <div className="flex-1 p-5 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
           {order.items.map((item, index) => {
              const remainingToPrep = item.quantity - (item.deliveredQuantity || 0);
              const isDone = item.status === ItemStatus.READY || item.status === ItemStatus.DELIVERED || remainingToPrep <= 0;
              
              if (remainingToPrep <= 0 && activeTab === 'pending') return null;

              return (
                <div key={`${item.id}-${index}`} className="flex items-start justify-between group">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F9F5F2] flex items-center justify-center text-[10px] font-black text-[#D17842] shrink-0">
                         {remainingToPrep > 0 ? remainingToPrep : item.quantity}x
                      </div>
                      <div>
                         <p className={`text-sm font-black transition-all ${isDone ? 'text-gray-300 line-through' : 'text-[#1C1C1E]'}`}>
                            {item.name}
                         </p>
                         {remainingToPrep > 0 && (
                           <div className="flex gap-2 mt-1">
                              <button 
                                onClick={() => updateItemStatus(order.id, item.id, ItemStatus.PREPARING)}
                                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${item.status === ItemStatus.PREPARING ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}
                              >
                                Cooking
                              </button>
                              <button 
                                onClick={() => updateItemStatus(order.id, item.id, ItemStatus.READY)}
                                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-all ${item.status === ItemStatus.READY ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}
                              >
                                Ready
                              </button>
                           </div>
                         )}
                         {item.deliveredQuantity && item.deliveredQuantity > 0 && (
                           <span className="text-[7px] font-black uppercase text-gray-400 mt-1 block tracking-tighter">
                             {item.deliveredQuantity} Served Previously
                           </span>
                         )}
                      </div>
                   </div>
                   {isDone && (
                      <CheckCircle2 size={16} className="text-green-500 animate-in zoom-in" />
                   )}
                </div>
              );
           })}
        </div>

        <div className="p-5 bg-white border-t border-[#F1E7E1]/60">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Preparation Progress</span>
              <span className="text-[10px] font-black text-[#1C1C1E]">{ready} / {total} Items</span>
           </div>
           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${isOrderFullyReady(order) ? 'bg-green-500' : 'bg-[#D17842]'}`}
                style={{ width: `${progress}%` }}
              ></div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-4 px-1">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#1C1C1E] text-white rounded-xl shadow-lg shadow-black/5">
                <ChefHat size={24} />
             </div>
             <h2 className="text-2xl md:text-3xl font-black text-[#1C1C1E] tracking-tight">Kitchen Live Board</h2>
          </div>
          <p className="text-[#8E8E93] font-medium text-sm mt-1">Real-time preparation management.</p>
        </div>
        
        {/* Unified Legend & Filter Row */}
        <div className="flex items-center justify-between gap-4 w-full">
           {/* Status Legend (Left Side) */}
           <div className="flex items-center gap-4 bg-white border border-[#F1E7E1] p-2.5 rounded-2xl shadow-sm h-[44px]">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                 <span className="text-[9px] font-black uppercase text-[#8E8E93]">New</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                 <span className="text-[9px] font-black uppercase text-[#8E8E93]">Cooking</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                 <span className="text-[9px] font-black uppercase text-[#8E8E93]">Ready</span>
              </div>
           </div>

           {/* Date Filter (Right Side) */}
           <div className="relative">
             <select
               value={timeFilter}
               onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
               className="appearance-none bg-white border border-[#F1E7E1] text-[10px] font-black uppercase tracking-widest rounded-2xl pl-4 pr-10 py-2.5 h-[44px] outline-none shadow-sm hover:border-[#D17842] transition-all cursor-pointer min-w-[130px] text-center"
             >
               {['Today', 'This Week', 'Month', 'Year', 'Custom'].map((f) => <option key={f} value={f}>{f}</option>)}
             </select>
             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
           </div>
        </div>
      </header>

      {/* Custom Date Range Picker (Conditional) */}
      {timeFilter === 'Custom' && (
        <div className="flex flex-col md:flex-row items-center gap-4 px-1 py-4 bg-orange-50/50 rounded-3xl border border-orange-100 animate-in slide-in-from-top-2 duration-300">
           <div className="flex items-center gap-3 w-full md:w-auto">
             <Calendar size={18} className="text-[#D17842]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[#D17842]">Custom Range:</span>
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
             <input 
               type="date" 
               value={customStartDate} 
               onChange={(e) => setCustomStartDate(e.target.value)} 
               className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white border border-orange-200 text-xs font-bold outline-none focus:ring-2 focus:ring-[#D17842]/20"
             />
             <span className="text-gray-400">to</span>
             <input 
               type="date" 
               value={customEndDate} 
               onChange={(e) => setCustomEndDate(e.target.value)} 
               className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white border border-orange-200 text-xs font-bold outline-none focus:ring-2 focus:ring-[#D17842]/20"
             />
             <button 
              onClick={() => { setCustomStartDate(''); setCustomEndDate(''); setTimeFilter('Today'); }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
             >
               <X size={18} />
             </button>
           </div>
        </div>
      )}

      {/* Segmented Tab Controller */}
      <div className="px-1">
        <div className="inline-flex bg-gray-100/80 p-1.5 rounded-[24px] w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#1C1C1E] text-white shadow-xl' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
          >
            <Flame size={16} className={activeTab === 'pending' ? 'animate-pulse' : ''} />
            Pending Orders
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {pendingOrders.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-green-50 text-white shadow-xl' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
          >
            <ListChecks size={16} />
            Completed
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {completedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        pendingOrders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#F1E7E1] rounded-[40px] p-20 text-center flex flex-col items-center gap-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-[#F9F5F2] rounded-full flex items-center justify-center text-[#D17842]">
                <Flame size={40} className="opacity-20" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1C1C1E]">Kitchen is Quiet</h3>
                <p className="text-gray-400 font-medium">No active tickets needing preparation for {timeFilter === 'Today' ? 'today' : 'this range'}.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map(renderOrderCard)}
          </div>
        )
      ) : (
        completedOrders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#F1E7E1] rounded-[40px] p-20 text-center flex flex-col items-center gap-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 size={40} className="opacity-20" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1C1C1E]">No Orders Ready</h3>
                <p className="text-gray-400 font-medium">Completed orders will appear here for pickup.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedOrders.map(renderOrderCard)}
          </div>
        )
      )}
    </div>
  );
};

export default Kitchen;