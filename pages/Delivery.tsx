
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, MapPin, Phone, CheckCircle2, Navigation, 
  Clock, Package, ChevronRight, Search, X, 
  ExternalLink, MessageCircle, AlertCircle, ChevronDown, Calendar, ListChecks, Flame, Timer
} from 'lucide-react';
import { Order, OrderStatus, OrderType, ItemStatus, SystemSettings } from '../types';

interface DeliveryProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  settings: SystemSettings;
}

type TimeFilter = 'Today' | 'This Week' | 'Month' | 'Year' | 'Custom';

const Delivery: React.FC<DeliveryProps> = ({ orders, onUpdateOrderStatus, onUpdateItemStatus, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const filterStartTime = useMemo(() => {
    const d = new Date();
    const startOfToday = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    switch (timeFilter) {
      case 'Today': return startOfToday;
      case 'This Week':
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
      case 'Month': return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      case 'Year': return new Date(d.getFullYear(), 0, 1).getTime();
      case 'Custom': return customStartDate ? new Date(customStartDate).getTime() : 0;
      default: return startOfToday;
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

  const deliveryOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderType === OrderType.DELIVERY && 
      !o.isCancelled
    ).filter(order => {
      const orderTime = new Date(order.createdAt).getTime();
      return orderTime >= filterStartTime && orderTime <= filterEndTime;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filterStartTime, filterEndTime]);

  const filteredOrders = deliveryOrders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.address && o.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingOrders = filteredOrders.filter(o => o.status !== OrderStatus.COMPLETED);
  const completedOrders = filteredOrders.filter(o => o.status === OrderStatus.COMPLETED);

  const handleMarkDelivered = (order: Order) => {
    order.items.forEach(item => {
      onUpdateItemStatus(order.id, item.id, ItemStatus.DELIVERED);
    });
    onUpdateOrderStatus(order.id, OrderStatus.COMPLETED);
    setSelectedOrder(null);
  };

  const getDirections = (order: Order) => {
    if (order.locationLink) {
      window.open(order.locationLink, '_blank');
    } else if (order.address) {
      const encodedAddress = encodeURIComponent(order.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const getOrderProgress = (order: Order) => {
    const totalItems = order.items.length;
    const readyItems = order.items.filter(i => i.status === ItemStatus.READY || i.status === ItemStatus.DELIVERED).length;
    return (readyItems / totalItems) * 100;
  };

  const getElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt);
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diff;
  };

  const renderOrderCard = (order: Order) => {
    const progress = getOrderProgress(order);
    const isReady = progress === 100;
    const elapsed = getElapsedTime(order.createdAt);

    return (
      <div 
        key={order.id} 
        className={`bg-white rounded-[40px] border-2 p-8 space-y-6 transition-all hover:shadow-xl relative overflow-hidden group animate-in zoom-in duration-300 ${isReady ? 'border-green-100 shadow-green-50/50' : 'border-[#F1E7E1]'}`}
      >
        {isReady && order.status !== OrderStatus.COMPLETED && (
          <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-1.5 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest animate-pulse">
            Ready for Pickup
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#D17842] uppercase tracking-widest">{order.id}</p>
            <h4 className="text-xl font-black text-[#1C1C1E]">{order.customerName}</h4>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 font-black text-sm text-[#8E8E93]">
              <Timer size={16} />
              <span>{elapsed}m</span>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Total Time</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-gray-400 shrink-0 mt-1" size={18} />
            <p className="text-sm font-bold text-gray-600 line-clamp-2 leading-relaxed">{order.address || 'No address provided'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-gray-400 shrink-0" size={18} />
            <p className="text-sm font-bold text-gray-600">{order.customerPhone || 'No phone provided'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Preparation Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isReady ? 'bg-green-500' : 'bg-[#D17842]'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => getDirections(order)}
            className="flex items-center justify-center gap-2 py-4 bg-[#F9F5F2] text-[#1C1C1E] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all active:scale-95"
          >
            <Navigation size={16} /> Directions
          </button>
          <button 
            onClick={() => setSelectedOrder(order)}
            className="flex items-center justify-center gap-2 py-4 bg-[#1C1C1E] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all active:scale-95"
          >
            Details <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col gap-6 px-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-3">
              <Truck className="text-[#D17842]" size={32} /> Deliver Fleet
            </h2>
            <p className="text-[#8E8E93] text-sm font-medium">Manage and track outgoing delivery orders.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search deliveries..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#F1E7E1] font-bold text-sm focus:ring-2 focus:ring-[#D17842] outline-none shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4 bg-white border border-[#F1E7E1] p-2.5 rounded-2xl shadow-sm h-[44px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
              <span className="text-[9px] font-black uppercase text-[#8E8E93]">Preparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-[9px] font-black uppercase text-[#8E8E93]">Ready</span>
            </div>
          </div>

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

      <div className="px-1">
        <div className="inline-flex bg-gray-100/80 p-1.5 rounded-[24px] w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#1C1C1E] text-white shadow-xl' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
          >
            <Flame size={16} className={activeTab === 'pending' ? 'animate-pulse' : ''} />
            Pending
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {pendingOrders.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-green-50 text-white shadow-xl' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
          >
            <ListChecks size={16} />
            Delivered
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {completedOrders.length}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'pending' ? (
          pendingOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 bg-orange-50 rounded-full text-[#D17842]/20">
                <Package size={80} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">No Pending Deliveries</h3>
                <p className="text-[#8E8E93] font-medium max-w-xs mt-2">All delivery orders have been fulfilled or there are no new requests.</p>
              </div>
            </div>
          ) : (
            pendingOrders.map(renderOrderCard)
          )
        ) : (
          completedOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="p-8 bg-green-50 rounded-full text-green-500/20">
                <CheckCircle2 size={80} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">No Completed Deliveries</h3>
                <p className="text-[#8E8E93] font-medium max-w-xs mt-2">Delivered orders for this period will appear here.</p>
              </div>
            </div>
          ) : (
            completedOrders.map(renderOrderCard)
          )
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-orange-50 text-[#D17842] rounded-3xl">
                  <Truck size={32} strokeWidth={2.5} />
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-[#1C1C1E] tracking-tight">{selectedOrder.customerName}</h3>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-50 text-[#D17842] rounded-full text-[10px] font-black uppercase tracking-widest">{selectedOrder.id}</span>
                  <span className="text-xs font-bold text-gray-400">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="space-y-6 bg-[#F9F5F2] p-8 rounded-[32px]">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#D17842] shadow-sm shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                      <p className="text-sm font-bold text-[#1C1C1E] leading-relaxed">{selectedOrder.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                      <p className="text-sm font-bold text-[#1C1C1E]">{selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-[#D17842] shadow-sm">{item.quantity}</span>
                          <span className="text-sm font-bold text-[#1C1C1E]">{item.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.status === ItemStatus.READY ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="flex items-center justify-center gap-3 py-5 bg-green-50 text-green-600 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-green-100 transition-all active:scale-95"
                  >
                    <Phone size={18} /> Call Guest
                  </a>
                  <button 
                    onClick={() => getDirections(selectedOrder)}
                    className="flex items-center justify-center gap-3 py-5 bg-blue-50 text-blue-600 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-blue-100 transition-all active:scale-95"
                  >
                    <Navigation size={18} /> Navigate
                  </button>
                </div>
                {selectedOrder.status !== OrderStatus.COMPLETED && (
                  <button 
                    onClick={() => handleMarkDelivered(selectedOrder)}
                    className="w-full flex items-center justify-center gap-3 py-6 bg-[#1C1C1E] text-white rounded-[28px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={22} strokeWidth={3} /> Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
