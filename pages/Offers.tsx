
import React, { useState } from 'react';
import { Gift, Megaphone, Plus, Trash2, X, RefreshCw, CheckCircle2, Sparkles, MessageSquare, Power, Percent, IndianRupee, Send } from 'lucide-react';
import { Offer, SystemSettings } from '../types';
import { shareOfferOnWhatsApp } from '../lib/communicationUtils';

interface OffersProps {
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  settings: SystemSettings;
  onResetSentStatus: () => void;
}

const Offers: React.FC<OffersProps> = ({ offers, setOffers, settings, onResetSentStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Omit<Offer, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    icon: 'megaphone',
    variant: 'light',
    isActive: true,
    discountType: 'percentage',
    discountValue: 0,
    minPurchase: 0,
    whatsappMessage: ''
  });

  const templates = [
    {
      name: 'Percentage OFF',
      data: { title: 'Flash Sale: 20% OFF', description: 'Limited time discount on all items', discountType: 'percentage', discountValue: 20, minPurchase: 0, icon: 'megaphone', whatsappMessage: 'Flash Sale! ⚡ Get 20% OFF on your next order at {{restaurant}}! Don\'t miss out!' }
    },
    {
      name: 'Flat Discount',
      data: { title: '₹100 OFF', description: 'Flat discount on your bill', discountType: 'flat', discountValue: 100, minPurchase: 500, icon: 'gift', whatsappMessage: 'Special Gift! 🎁 Get flat ₹100 OFF on orders above ₹500 at {{restaurant}}!' }
    },
    {
      name: 'High Value Deal',
      data: { title: '₹250 OFF on ₹999+', description: 'Big savings for big orders', discountType: 'flat', discountValue: 250, minPurchase: 999, icon: 'sparkles', whatsappMessage: 'Big Savings! ✨ Get ₹250 OFF on orders above ₹999 at {{restaurant}}! Feast like a king!' }
    }
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    setNewOffer(prev => ({ ...prev, ...template.data }));
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (editingOfferId) {
        setOffers(prev => prev.map(o => o.id === editingOfferId ? { ...o, ...newOffer } : o));
      } else {
        const offer: Offer = {
          id: `OFFER-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          ...newOffer,
          createdAt: new Date().toISOString()
        };
        setOffers(prev => [offer, ...prev]);
        onResetSentStatus();
      }
      
      setIsSaving(false);
      setIsModalOpen(false);
      setEditingOfferId(null);
      setNewOffer({ 
        title: '', 
        description: '', 
        icon: 'megaphone', 
        variant: 'light', 
        isActive: true, 
        discountType: 'percentage', 
        discountValue: 0,
        minPurchase: 0,
        whatsappMessage: ''
      });
    }, 800);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOfferId(offer.id);
    setNewOffer({
      title: offer.title,
      description: offer.description,
      icon: offer.icon,
      variant: offer.variant,
      isActive: offer.isActive,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minPurchase: offer.minPurchase || 0,
      whatsappMessage: offer.whatsappMessage || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      setOffers(prev => prev.filter(o => o.id !== id));
    }
  };

  const toggleOfferStatus = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Campaign Manager</h2>
          <p className="text-[#8E8E93] text-sm font-medium">Create and manage marketing offers for your customers.</p>
        </div>
        <button 
          onClick={() => {
            setEditingOfferId(null);
            setNewOffer({ 
              title: '', description: '', icon: 'megaphone', variant: 'light', isActive: true, 
              discountType: 'percentage', discountValue: 0, minPurchase: 0, whatsappMessage: '' 
            });
            setIsModalOpen(true);
          }}
          className="bg-[#D17842] text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> Create New Offer
        </button>
      </header>

      {/* Modal for Creating/Editing Offers */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-6 md:p-10 space-y-6 md:space-y-8 animate-in zoom-in duration-300 my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">{editingOfferId ? 'Edit Campaign' : 'New Campaign'}</h3>
                <p className="text-[10px] font-black uppercase text-[#D17842] tracking-widest mt-1">Design Your Deal</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {!editingOfferId && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Quick Templates</label>
                <div className="flex flex-wrap gap-2">
                  {templates.map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="px-4 py-2 bg-[#F9F5F2] hover:bg-orange-50 text-[#D17842] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddOffer} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Campaign Title</label>
                <input 
                  required
                  type="text" 
                  value={newOffer.title}
                  onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                  placeholder="e.g., Happy Hours: 20% OFF"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Discount Type</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewOffer({...newOffer, discountType: 'percentage'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${newOffer.discountType === 'percentage' ? 'border-[#D17842] bg-orange-50 text-[#D17842]' : 'border-gray-100 text-gray-400'}`}
                    >
                      %
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewOffer({...newOffer, discountType: 'flat'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${newOffer.discountType === 'flat' ? 'border-[#D17842] bg-orange-50 text-[#D17842]' : 'border-gray-100 text-gray-400'}`}
                    >
                      ₹
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Discount Value</label>
                  <input 
                    required
                    type="number"
                    value={newOffer.discountValue === 0 ? '' : newOffer.discountValue}
                    onChange={e => setNewOffer({...newOffer, discountValue: Number(e.target.value)})}
                    placeholder="Value"
                    className="w-full px-6 py-3 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Minimum Purchase Eligibility (₹)</label>
                <input 
                  type="number"
                  value={newOffer.minPurchase === 0 ? '' : newOffer.minPurchase}
                  onChange={e => setNewOffer({...newOffer, minPurchase: Number(e.target.value)})}
                  placeholder="e.g., 999 (Leave 0 for no limit)"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">WhatsApp Message</label>
                <textarea 
                  rows={3}
                  value={newOffer.whatsappMessage}
                  onChange={e => setNewOffer({...newOffer, whatsappMessage: e.target.value})}
                  placeholder="Custom message for WhatsApp sharing..."
                  className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Short Description</label>
                <textarea 
                  required
                  rows={2}
                  value={newOffer.description}
                  onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                  placeholder="e.g., Valid from 4 PM to 7 PM on weekdays"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Icon</label>
                  <div className="flex gap-2">
                    {(['megaphone', 'gift', 'sparkles'] as const).map(icon => (
                      <button 
                        key={icon}
                        type="button"
                        onClick={() => setNewOffer({...newOffer, icon})}
                        className={`p-3 rounded-xl border-2 transition-all ${newOffer.icon === icon ? 'bg-orange-50 border-[#D17842] text-[#D17842]' : 'bg-gray-50 border-transparent text-gray-400'}`}
                      >
                        {icon === 'megaphone' ? <Megaphone size={18} /> : icon === 'gift' ? <Gift size={18} /> : <Sparkles size={18} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Card Style</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setNewOffer({...newOffer, variant: 'light'})}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newOffer.variant === 'light' ? 'bg-white border-[#1C1C1E] text-[#1C1C1E]' : 'bg-gray-100 border-transparent text-gray-400'}`}
                    >
                      Light
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNewOffer({...newOffer, variant: 'dark'})}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${newOffer.variant === 'dark' ? 'bg-[#1C1C1E] border-[#1C1C1E] text-white' : 'bg-gray-100 border-transparent text-gray-400'}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>

              <button 
                disabled={isSaving}
                className="w-full py-5 bg-[#1C1C1E] text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> {editingOfferId ? 'Update Campaign' : 'Launch Campaign'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="p-8 bg-orange-50 rounded-full text-[#D17842]/20">
            <Sparkles size={80} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#1C1C1E]">No Active Campaigns</h3>
            <p className="text-[#8E8E93] font-medium max-w-xs mt-2">Start creating special deals to attract more customers to your cafe.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map(offer => (
            <div 
              key={offer.id} 
              className={`p-8 rounded-[40px] flex flex-col items-center text-center gap-4 transition-all relative group shadow-sm hover:shadow-xl ${
                !offer.isActive ? 'opacity-50 grayscale scale-[0.98]' : ''
              } ${
                offer.variant === 'light' 
                ? 'bg-white border-2 border-dashed border-orange-200' 
                : 'bg-[#1C1C1E] text-white'
              }`}
            >
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleEditOffer(offer)}
                  className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${offer.variant === 'light' ? 'bg-orange-50 text-[#D17842]' : 'bg-white/10 text-white'}`}
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  onClick={() => toggleOfferStatus(offer.id)}
                  title={offer.isActive ? "Disable Offer" : "Enable Offer"}
                  className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${offer.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  <Power size={16} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => shareOfferOnWhatsApp(offer, settings)}
                  title="Share on WhatsApp"
                  className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${offer.variant === 'light' ? 'bg-green-50 text-green-600' : 'bg-green-500 text-white'}`}
                >
                  <Send size={16} />
                </button>
              </div>

              <div className={`p-4 rounded-3xl ${offer.variant === 'light' ? 'bg-orange-50 text-[#D17842]' : 'bg-white/10 text-orange-400'}`}>
                {offer.icon === 'megaphone' ? <Megaphone size={32} strokeWidth={2.5} /> : offer.icon === 'gift' ? <Gift size={32} strokeWidth={2.5} /> : <Sparkles size={32} strokeWidth={2.5} />}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-xl font-black tracking-tight">{offer.title}</h4>
                  {!offer.isActive && <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded text-[8px] font-black uppercase">Inactive</span>}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${offer.variant === 'light' ? 'text-orange-500' : 'text-orange-400'}`}>
                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                </p>
                {offer.minPurchase && offer.minPurchase > 0 && (
                  <p className="text-[8px] font-black uppercase text-red-500 tracking-widest mb-2">Min. Purchase: ₹{offer.minPurchase}</p>
                )}
                <p className={`text-xs font-medium ${offer.variant === 'light' ? 'text-[#8E8E93]' : 'text-white/50'}`}>{offer.description}</p>
              </div>

              <div className={`mt-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${offer.variant === 'light' ? 'bg-[#F9F5F2] text-gray-400' : 'bg-white/5 text-white/30'}`}>
                Created: {new Date(offer.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {offers.some(o => o.isActive) && (
        <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-orange-600 shadow-sm"><MessageSquare size={24} /></div>
              <div>
                <p className="text-sm font-black text-[#1C1C1E]">Ready for Distribution?</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Go to CRM to share these with your customers.</p>
              </div>
           </div>
           <button 
            onClick={() => window.location.hash = 'customers'}
            className="px-6 py-3 bg-[#1C1C1E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
           >
             Go to CRM
           </button>
        </div>
      )}
    </div>
  );
};

export default Offers;
