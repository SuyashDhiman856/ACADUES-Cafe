import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Receipt, Printer, Share2, FileSpreadsheet, AlertTriangle, UserPlus, CheckCircle2, Clock, Trash2, RefreshCw } from 'lucide-react';
import { ApiOrder, OrderStatus, OrderType, User, UserRole } from '../types';
import { useOrders } from '../hooks/useOrders';
import { exportToCSV } from '../lib/exportUtils';

interface OrdersProps {
  onNewOrder: () => void;
}

const Orders: React.FC<OrdersProps> = ({ onNewOrder }) => {
  const { orders: ordersData, loading, updateOrderStatus, assignChef, fetchOrders } = useOrders();
  const orders = Array.isArray(ordersData) ? (ordersData as ApiOrder[]) : [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<ApiOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const handleExport = () => {
    const data = orders.map(o => ({
      ID: o.id,
      Type: o.orderType,
      Status: o.status,
      Amount: o.totalAmount,
      Date: new Date(o.createdAt).toLocaleString()
    }));
    exportToCSV(data, 'Cafe_Orders_Report');
  };

  const renderStatusBadge = (status: OrderStatus) => {
    const formulas: Record<OrderStatus, string> = {
      [OrderStatus.CREATED]: 'bg-orange-50 text-orange-600',
      [OrderStatus.SENT_TO_KITCHEN]: 'bg-blue-50 text-blue-600',
      [OrderStatus.PREPARING]: 'bg-blue-100 text-blue-800',
      [OrderStatus.READY]: 'bg-green-50 text-green-600',
      [OrderStatus.SERVED]: 'bg-[#1C1C1E] text-white',
      [OrderStatus.CANCELLED]: 'bg-red-50 text-red-600'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${formulas[status]}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Assign Chef Modal Placeholder */}
      {assigningOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
             <div className="text-center space-y-2">
               <div className="p-4 bg-orange-50 text-[#D17842] rounded-full w-fit mx-auto">
                 <UserPlus size={48} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-[#1C1C1E]">Assign Chef</h3>
               <p className="text-sm font-medium text-gray-400 font-mono">Order #{assigningOrder.id.slice(-6)}</p>
             </div>
             
             <div className="space-y-3">
               <button 
                onClick={async () => {
                  // MOCK ASSIGNMENT (Wait for chef list API)
                  alert("Assigning to Chef..."); 
                  setAssigningOrder(null);
                }}
                className="w-full py-4 bg-[#F9F5F2] hover:bg-orange-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1C1C1E] border border-transparent hover:border-[#D17842] transition-all"
               >
                 Auto-Assign (Least Busy)
               </button>
             </div>
             
             <button onClick={() => setAssigningOrder(null)} className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start">
               <Receipt size={40} className="text-[#D17842]" strokeWidth={2.5} />
               <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="border-y border-dashed border-[#F1E7E1] py-8 space-y-4 font-mono">
               {selectedOrder.orderItems.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-sm">
                   <span className="font-bold">{item.quantity}x {item.menuItem?.name}</span>
                   <span className="font-black text-[#8E8E93]">₹{item.total.toLocaleString()}</span>
                 </div>
               ))}
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-black text-[#1C1C1E] uppercase tracking-widest">Total</span>
                  <span className="text-4xl font-black text-[#D17842]">₹{selectedOrder.totalAmount.toLocaleString()}</span>
               </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} className="w-full py-5 bg-[#1C1C1E] text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all">Dismiss</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-[#1C1C1E] tracking-tight">Order Management</h2>
           <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Full System Activity Logs</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-3 bg-[#1C1C1E] text-white px-8 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
            <FileSpreadsheet size={18} /> Export CSV
          </button>
          <button onClick={onNewOrder} className="flex items-center gap-3 bg-[#D17842] text-white px-8 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-[#B66030] transition-all shadow-xl shadow-orange-100">
            <Plus size={18} /> New Live Order
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-[#F1E7E1] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#F1E7E1] flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by ID or Customer Name..." 
              className="w-full pl-16 pr-6 py-5 bg-[#F9F5F2] border-none rounded-[24px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#D17842]/20 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" onClick={() => void fetchOrders()} className="p-5 bg-[#F9F5F2] rounded-[24px] text-gray-400 hover:text-[#D17842] transition-all active:scale-95">
             <RefreshCw size={24} />
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFCFB]/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Order & ID</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Revenue</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Lifecycle</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E1]">
              {loading && orders.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing orders...</td>
                </tr>
              ) : filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F9F5F2]/40 transition-all group">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-[#1C1C1E]">{o.table?.name || `Table ${o.tableId}`}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter font-mono">{o.id.slice(-8)}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${o.orderType === OrderType.DINE_IN ? 'bg-orange-50 text-[#D17842]' : 'bg-blue-50 text-blue-600'}`}>
                      {o.orderType}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-[#1C1C1E] text-base">₹{o.totalAmount.toLocaleString()}</td>
                  <td className="px-10 py-8 text-center">{renderStatusBadge(o.status)}</td>
                  <td className="px-10 py-8 text-center">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => setSelectedOrder(o)} className="p-3 bg-white border border-[#F1E7E1] rounded-2xl text-gray-400 hover:text-[#D17842] hover:border-[#D17842] transition-all">
                        <Receipt size={18} />
                      </button>
                      <button onClick={() => setAssigningOrder(o)} className="p-3 bg-white border border-[#F1E7E1] rounded-2xl text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all">
                        <UserPlus size={18} />
                      </button>
                      <button onClick={() => updateOrderStatus(o.id, OrderStatus.CANCELLED)} className="p-3 bg-white border border-[#F1E7E1] rounded-2xl text-gray-400 hover:text-red-500 hover:border-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;

