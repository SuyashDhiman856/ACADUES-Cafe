
import React, { useState, useMemo } from 'react';
import { 
  Search, User, Phone, Calendar, ShoppingBag, 
  ArrowUpRight, Award, History, X, MessageSquare, 
  Star, Send, CheckCircle2, RotateCcw, MessageCircle,
  ArrowLeft, Utensils, IndianRupee, TrendingUp, Clock,
  ChevronRight, Receipt
} from 'lucide-react';
import { CustomerRecord } from '../App';
import { Offer, Order, OrderStatus } from '../types';

interface CustomersProps {
  customers: CustomerRecord[];
  orders: Order[];
  offers: Offer[];
  sentStatuses: Record<string, boolean>; // phone -> sent
  onSendOffer: (phone: string, offerId: string) => void;
  onResetStatus: () => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, orders, offers, sentStatuses, onSendOffer, onResetStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfferForSharing, setSelectedOfferForSharing] = useState<Offer | null>(null);
  const [customerToShareWith, setCustomerToShareWith] = useState<CustomerRecord | null>(null);
  const [profileViewCustomerPhone, setProfileViewCustomerPhone] = useState<string | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const activeOffers = useMemo(() => offers.filter(o => o.isActive), [offers]);

  const topCustomers = [...customers].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 3);

  const profileData = useMemo(() => {
    if (!profileViewCustomerPhone) return null;
    
    const customer = customers.find(c => c.phone === profileViewCustomerPhone);
    if (!customer) return null;

    const customerOrders = orders.filter(o => o.customerPhone === profileViewCustomerPhone && !o.isCancelled);
    
    // Most Ordered Items
    const itemCounts: Record<string, { id: string, name: string, count: number }> = {};
    customerOrders.forEach(o => {
      o.items.forEach(i => {
        if (!itemCounts[i.id]) itemCounts[i.id] = { id: i.id, name: i.name, count: 0 };
        itemCounts[i.id].count += i.quantity;
      });
    });

    const mostOrderedItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgOrderValue = customer.orderCount > 0 ? customer.totalSpend / customer.orderCount : 0;

    return {
      customer,
      history: customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      mostOrderedItems,
      avgOrderValue
    };
  }, [profileViewCustomerPhone, customers, orders]);

  const handleShareClick = (e: React.MouseEvent, customer: CustomerRecord) => {
    e.stopPropagation();
    if (activeOffers.length === 0) {
      alert('Please create and enable an offer first in the Offers section.');
      return;
    }
    setCustomerToShareWith(customer);
    setSelectedOfferForSharing(activeOffers[0]); // Default to first active offer
  };

  const confirmSend = () => {
    if (!customerToShareWith || !selectedOfferForSharing) return;
    onSendOffer(customerToShareWith.phone, selectedOfferForSharing.id);
    
    // Simulate WhatsApp sharing
    const message = `*${selectedOfferForSharing.title}*\n\n${selectedOfferForSharing.description}\n\nVisit us today to avail this offer!`;
    const phone = customerToShareWith.phone.startsWith('91') ? customerToShareWith.phone : `91${customerToShareWith.phone}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    
    setCustomerToShareWith(null);
  };

  // Profile Detail View Component
  if (profileData) {
    const { customer, history, mostOrderedItems, avgOrderValue } = profileData;
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-24 lg:pb-0">
        <button 
          onClick={() => setProfileViewCustomerPhone(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#1C1C1E] transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div className="bg-white rounded-[48px] border border-[#F1E7E1] p-8 md:p-12 shadow-sm overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-[#1C1C1E] text-white rounded-[32px] flex items-center justify-center text-4xl font-black shadow-2xl">
                {customer.name[0]}
              </div>
              <div>
                <h2 className="text-4xl font-black text-[#1C1C1E] tracking-tight">{customer.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full"><Phone size={14} /> {customer.phone}</span>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[#D17842] bg-orange-50 px-3 py-1 rounded-full"><Calendar size={14} /> Joined {new Date(history[history.length - 1]?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={`tel:${customer.phone}`}
                className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <Phone size={24} />
              </a>
              <button 
                onClick={(e) => handleShareClick(e, customer)}
                className="px-8 py-4 bg-[#D17842] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <Send size={18} /> Send Deal
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9F5F2] rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl w-fit mb-4"><IndianRupee size={20} /></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lifetime Spend</p>
              <p className="text-2xl font-black text-[#1C1C1E] mt-1">₹{customer.totalSpend.toLocaleString('en-IN')}</p>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl w-fit mb-4"><ShoppingBag size={20} /></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Visit Frequency</p>
              <p className="text-2xl font-black text-[#1C1C1E] mt-1">{customer.orderCount} Times</p>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
              <div className="p-3 bg-green-50 text-green-500 rounded-2xl w-fit mb-4"><TrendingUp size={20} /></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Avg Order Price</p>
              <p className="text-2xl font-black text-[#1C1C1E] mt-1">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</p>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
              <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl w-fit mb-4"><Clock size={20} /></div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Last Visit</p>
              <p className="text-2xl font-black text-[#1C1C1E] mt-1">{new Date(customer.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2"><History size={20} /> Order History</h3>
              <div className="bg-white rounded-[40px] border border-[#F1E7E1] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-[#FDFCFB] border-b border-[#F1E7E1]">
                       <tr>
                          <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Order Ref</th>
                          <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Date</th>
                          <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1E7E1]">
                       {history.map(order => (
                         <tr key={order.id} className="hover:bg-[#F9F5F2]/50 transition-colors">
                            <td className="px-8 py-6 font-black text-xs text-[#D17842] uppercase">{order.id}</td>
                            <td className="px-8 py-6">
                               <p className="text-xs font-bold text-[#1C1C1E]">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                               <p className="text-[9px] text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="px-8 py-6 text-right font-black text-[#1C1C1E]">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2"><Star size={20} /> Most Ordered Items</h3>
              <div className="bg-white rounded-[40px] border border-[#F1E7E1] p-6 space-y-4 shadow-sm">
                 {mostOrderedItems.map((item, i) => (
                   <div key={`${item.id}-${i}`} className="flex items-center justify-between p-4 bg-[#F9F5F2] rounded-[24px] border border-transparent hover:border-[#D17842] transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            #{i + 1}
                         </div>
                         <p className="text-sm font-black text-[#1C1C1E]">{item.name}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-[#1C1C1E]">{item.count}</p>
                         <p className="text-[8px] font-bold text-gray-400 uppercase">Times</p>
                      </div>
                   </div>
                 ))}
                 {mostOrderedItems.length === 0 && <p className="py-12 text-center text-xs font-bold text-gray-400 italic">No consumption data found.</p>}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Standard List View
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#2D2D2D] tracking-tight">Customer Directory</h2>
          <p className="text-[#6B7280]">Build loyalty by understanding your guest behavior.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onResetStatus}
            className="flex items-center gap-2 bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={20} />
            <span>Reset Status</span>
          </button>
          <button className="flex items-center gap-2 bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl font-bold shadow-lg">
            <MessageSquare size={20} />
            <span>Bulk WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Offer Selection Modal */}
      {customerToShareWith && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#1C1C1E]">Send Offer to {customerToShareWith.name}</h3>
                <p className="text-[10px] font-black uppercase text-[#D17842] tracking-widest mt-1">Marketing Campaigns</p>
              </div>
              <button onClick={() => setCustomerToShareWith(null)}><X size={24} className="text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Select Active Campaign</label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {activeOffers.map(offer => (
                  <button 
                    key={offer.id} 
                    onClick={() => setSelectedOfferForSharing(offer)}
                    className={`p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 ${selectedOfferForSharing?.id === offer.id ? 'border-[#D17842] bg-orange-50' : 'border-gray-100'}`}
                  >
                    <div className="p-2 bg-white rounded-xl shadow-sm text-orange-500">
                      <Star size={16} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1C1C1E]">{offer.title}</p>
                      <p className="text-[9px] font-bold text-gray-400 truncate">{offer.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={confirmSend}
              className="w-full py-5 bg-green-500 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <MessageCircle size={20} fill="currentColor" strokeWidth={0} /> Share via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* VIP / Top Customers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topCustomers.map((c, i) => (
          <div key={c.phone} className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm relative overflow-hidden group">
             <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                   <div className={`p-3 rounded-2xl ${i === 0 ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-500'}`}>
                      <Award size={24} strokeWidth={3} />
                   </div>
                   <span className="text-[10px] font-black uppercase text-[#D17842] tracking-widest">#0{i+1} Spender</span>
                </div>
                <div onClick={() => setProfileViewCustomerPhone(c.phone)} className="cursor-pointer group/name">
                   <h4 className="text-xl font-black text-[#1C1C1E] group-hover/name:text-[#D17842] transition-colors">{c.name}</h4>
                   <p className="text-xs font-bold text-gray-400">{c.phone}</p>
                </div>
                <div className="pt-4 border-t border-dashed border-[#F1E7E1] flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-gray-400">Total Orders</span>
                      <span className="text-lg font-black text-[#1C1C1E]">{c.orderCount}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black uppercase text-gray-400">Value</span>
                      <span className="text-lg font-black text-[#D17842]">₹{c.totalSpend.toLocaleString('en-IN')}</span>
                   </div>
                </div>
             </div>
             <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-400/5 rounded-full group-hover:scale-110 transition-transform"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-[#F1E7E1] shadow-sm">
        <div className="p-6 md:p-8 border-b border-[#F1E7E1] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input
              type="text"
              placeholder="Search by name or phone..."
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
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Frequency</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-right">Lifetime Spend</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E1]">
              {filteredCustomers.map((c) => (
                <tr key={c.phone} className="hover:bg-[#F9F5F2]/40 transition-all group">
                  <td className="px-8 py-6">
                    <div 
                      onClick={() => setProfileViewCustomerPhone(c.phone)}
                      className="flex items-center gap-3 cursor-pointer group/item"
                    >
                       <div className="w-10 h-10 bg-[#1C1C1E] text-white rounded-xl flex items-center justify-center font-black transition-transform group-hover/item:scale-110">
                          {c.name[0]}
                       </div>
                       <span className="text-sm font-black text-[#1C1C1E] group-hover/item:text-[#D17842] transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{c.phone}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-orange-50 text-[#D17842] rounded-full text-[10px] font-black uppercase">
                       {c.orderCount} Visits
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-[#1C1C1E]">₹{c.totalSpend.toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6 text-center">
                    {sentStatuses[c.phone] ? (
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 mx-auto w-fit">
                        <CheckCircle2 size={10} /> Sent
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Idle</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <a 
                        href={`tel:${c.phone}`}
                        className="p-2 bg-blue-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center"
                        title="Call Customer"
                      >
                        <Phone size={16} />
                      </a>
                      <button 
                        onClick={(e) => handleShareClick(e, c)}
                        className="p-2 bg-[#1C1C1E] text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md"
                        title="Send Offer"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-black uppercase text-[10px]">No customer records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
