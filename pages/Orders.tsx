
import React, { useState } from 'react';
import { Search, Filter, Download, ExternalLink, Calendar as CalendarIcon, Plus, X, Receipt, Printer, Share2, FileSpreadsheet, RotateCcw, MessageSquare, AlertTriangle, MessageCircle } from 'lucide-react';
import { Order, OrderStatus, PaymentMethod, SystemSettings } from '../types';
import { exportToCSV } from '../lib/exportUtils';
import { shareOnWhatsApp } from '../lib/communicationUtils';
import { useOrders } from '../hooks/useOrders';
import { useSettings } from '../hooks/useSettings';

interface OrdersProps {
  onNewOrder: () => void;
}

const CANCEL_REASONS = [
  'Wrong Entry / Clerical Error',
  'Duplicate Order',
  'Customer Refused Payment',
  'Order Preparation Cancelled',
  'Payment Failed',
  'Other'
];

const Orders: React.FC<OrdersProps> = ({ onNewOrder }) => {
  const { orders: ordersData, loading, error, updateOrderStatus } = useOrders();
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const { settings, loading: settingsLoading } = useSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  // Show loading state while settings are being fetched
  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D17842] mx-auto mb-4"></div>
          <p className="text-[#8E8E93] font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExport = () => {
    const exportData = orders.map(o => ({
      ID: o.id,
      Date: new Date(o.createdAt).toLocaleDateString(),
      Time: new Date(o.createdAt).toLocaleTimeString(),
      Customer: o.customerName || 'Guest',
      Type: o.orderType,
      Status: o.isCancelled ? 'Reverted' : o.status,
      Reason: o.cancellationReason || '',
      Method: o.paymentMethod,
      Amount: o.totalAmount,
      Tax: o.gstAmount
    }));
    exportToCSV(exportData, 'Orders_Report');
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      await updateOrderStatus(orderId, 'CANCELLED');
      // Note: The API might need to be updated to handle cancellation reasons
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const confirmCancel = () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    handleCancelOrder(cancellingOrder.id, finalReason);
    setCancellingOrder(null);
    setCancelReason(CANCEL_REASONS[0]);
    setCustomReason('');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Cancellation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-red-50 text-red-500 rounded-full animate-pulse">
                <AlertTriangle size={48} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">Revert Order?</h3>
                <p className="text-sm font-medium text-gray-400">Entry for #{cancellingOrder.id} will be greyed out and removed from all totals.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Select Reason</label>
              <div className="grid grid-cols-1 gap-2">
                {CANCEL_REASONS.map(r => (
                  <button 
                    key={r} 
                    onClick={() => setCancelReason(r)}
                    className={`px-6 py-4 rounded-2xl text-left text-xs font-bold transition-all border-2 ${cancelReason === r ? 'border-[#D17842] bg-orange-50 text-[#D17842]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {cancelReason === 'Other' && (
                <textarea 
                  placeholder="Enter specific reason..." 
                  className="w-full p-6 rounded-[24px] bg-[#F9F5F2] border-none font-bold text-sm focus:ring-2 focus:ring-[#D17842] mt-2"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCancellingOrder(null)} className="py-4 bg-gray-100 rounded-[24px] font-black uppercase text-[10px] tracking-widest text-gray-400 active:scale-95 transition-all">Dismiss</button>
              <button onClick={confirmCancel} className="py-4 bg-red-500 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-100 active:scale-95 transition-all">Confirm Revert</button>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-[#F1E7E1] animate-in zoom-in duration-300">
            <div className={`p-10 space-y-8 ${selectedOrder.isCancelled ? 'opacity-60 grayscale-[0.4]' : ''}`}>
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-orange-50 text-[#D17842] rounded-2xl">
                    <Receipt size={32} strokeWidth={2.5} />
                  </div>
                  <div className="flex gap-2">
                    {selectedOrder.customerPhone && settings.whatsappEnabled && !selectedOrder.isCancelled && (
                      <button 
                        onClick={() => shareOnWhatsApp(selectedOrder, settings, selectedOrder.status === OrderStatus.COMPLETED ? 'SETTLE' : 'CONFIRM')}
                        className="p-3 bg-green-50 text-green-600 rounded-2xl hover:scale-110 active:scale-90 transition-all"
                      >
                        <MessageCircle size={24} fill="currentColor" strokeWidth={0} />
                      </button>
                    )}
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X size={24} className="text-gray-400" />
                    </button>
                  </div>
               </div>

               <div className="flex flex-col items-center text-center space-y-1">
                  {selectedOrder.isCancelled && <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase mb-2 tracking-[0.2em] shadow-lg">REVERTED ENTRY</span>}
                  <h3 className={`text-2xl font-black text-[#1C1C1E] ${selectedOrder.isCancelled ? 'line-through' : ''}`}>{settings.restaurantName}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{settings.address}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PH: {settings.phone}</p>
               </div>

               {selectedOrder.isCancelled && (
                 <div className="bg-red-50 p-5 rounded-3xl border border-red-100 text-center">
                    <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1">Cancellation Reason</p>
                    <p className="text-sm font-bold text-red-600 italic">"{selectedOrder.cancellationReason}"</p>
                 </div>
               )}

               <div className="border-y border-dashed border-[#F1E7E1] py-6 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Order: {selectedOrder.id}</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between items-center">
                        <span className={`text-sm font-bold text-[#1C1C1E] ${selectedOrder.isCancelled ? 'line-through opacity-40' : ''}`}>{item.quantity}x {item.name}</span>
                        <span className={`text-sm font-black ${selectedOrder.isCancelled ? 'line-through opacity-40' : ''}`}>₹ {(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Subtotal</span>
                    <span className={selectedOrder.isCancelled ? 'line-through opacity-40' : ''}>₹ {(selectedOrder.totalAmount - selectedOrder.gstAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>GST ({selectedOrder.gstPercentage}%)</span>
                    <span className={selectedOrder.isCancelled ? 'line-through opacity-40' : ''}>₹ {selectedOrder.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-[#1C1C1E] items-center">
                    <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                    <span className={`text-3xl font-black text-[#D17842] ${selectedOrder.isCancelled ? 'line-through opacity-40' : ''}`}>₹ {selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => window.print()} className="flex items-center justify-center gap-3 py-4 bg-[#F9F5F2] text-[#1C1C1E] rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                    <Printer size={18} /> Print Bill
                  </button>
                  <button className="flex items-center justify-center gap-3 py-4 bg-[#1C1C1E] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                    <Share2 size={18} /> Share Digital
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#2D2D2D] tracking-tight">Order Logs</h2>
          <p className="text-[#6B7280]">Digital repository of all your business receipts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
          >
            <FileSpreadsheet size={18} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={onNewOrder}
            className="flex items-center gap-2 bg-[#D17842] text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100"
          >
            <Plus size={18} />
            <span>New Order</span>
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-[#F1E7E1] shadow-sm">
        <div className="p-4 md:p-8 border-b border-[#F1E7E1] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input
              type="text"
              placeholder="Search ID or Customer..."
              className="w-full pl-12 pr-4 py-4 bg-[#F9F5F2] border-none rounded-2xl text-sm font-bold shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFCFB]">
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Order Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Payment</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-right">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E1]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={`hover:bg-[#F9F5F2]/40 transition-all group ${order.isCancelled ? 'opacity-40 grayscale' : ''}`}>
                  <td className="px-8 py-6">
                    <p className={`text-xs font-black text-[#D17842] uppercase ${order.isCancelled ? 'line-through' : ''}`}>{order.id}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')} • {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className={`px-8 py-6 text-sm font-bold text-[#1C1C1E] ${order.isCancelled ? 'line-through' : ''}`}>{order.customerName || 'Walk-in'}</td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-tight">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className={`px-8 py-6 text-right font-black text-[#1C1C1E] ${order.isCancelled ? 'line-through text-gray-400' : ''}`}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.isCancelled ? 'bg-red-50 text-red-400' : order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {order.isCancelled ? 'Reverted' : order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button onClick={() => setSelectedOrder(order)} className="p-2 bg-orange-50 text-[#D17842] rounded-xl hover:scale-110 transition-transform">
                        <Receipt size={18} />
                      </button>
                      {order.customerPhone && settings.whatsappEnabled && !order.isCancelled && (
                        <button 
                          onClick={() => shareOnWhatsApp(order, settings, order.status === OrderStatus.COMPLETED ? 'SETTLE' : 'CONFIRM')}
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:scale-110 active:scale-90 transition-all"
                          title="WhatsApp Share"
                        >
                          <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
                        </button>
                      )}
                      {!order.isCancelled && (
                        <button onClick={() => setCancellingOrder(order)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:scale-110 transition-transform active:scale-90" title="Revert Entry">
                          <RotateCcw size={18} />
                        </button>
                      )}
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
