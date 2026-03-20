
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Plus, Minus, Hash, Banknote, Smartphone, CheckCircle2, RefreshCw, Phone, LogOut, Coffee, ArrowRight, ArrowLeft, X, Truck, MapPin, Layers, Clock, MessageCircle, Sparkles, Megaphone, Gift, Star } from 'lucide-react';
import { OrderStatus, PaymentMethod, OrderType, Order, ItemStatus, MenuItem, MenuVariant, Offer } from '../types';
import DietaryIndicator from '../components/DietaryIndicator';
import { shareOnWhatsApp, generateUPILink } from '../lib/communicationUtils';
import { useMenu } from '../hooks/useMenu';
import { useSettings } from '../hooks/useSettings';

interface SelfOrderProps {
  tenantId: string;
  initialOrder?: Order | null;
  initialStep?: 1 | 2;
  offers?: Offer[]; // Keep as optional prop for now since no API hook exists
  onCancel: () => void;
  onSave: (order: Order) => void;
}

const SelfOrder: React.FC<SelfOrderProps> = ({ tenantId, initialOrder, initialStep = 1, offers = [], onCancel, onSave }) => {
  const { menuItems } = useMenu();
  const { settings, loading: settingsLoading } = useSettings();

  const [step, setStep] = useState<1 | 2>(initialStep);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState<'Both' | 'Veg' | 'Non-Veg'>('Both');

  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; status?: ItemStatus; variantName?: string; image?: string }[]>(
    initialOrder?.items.map(item => {
      const menuRef = menuItems.find(m => m.id === item.id.split('-')[0]);
      return {
        ...item,
        status: item.status || ItemStatus.PENDING,
        image: menuRef?.image
      };
    }) || []
  );

  const [variantSelectionItem, setVariantSelectionItem] = useState<MenuItem | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const [orderType, setOrderType] = useState<OrderType>(initialOrder?.orderType || OrderType.DINE_IN);
  const [customerName, setCustomerName] = useState(initialOrder?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialOrder?.customerPhone || '');
  const [tableNumber, setTableNumber] = useState(initialOrder?.tableNumber || '');
  const [address, setAddress] = useState(initialOrder?.address || '');
  const [locationLink, setLocationLink] = useState(initialOrder?.locationLink || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialOrder?.paymentMethod || PaymentMethod.UPI);
  const [appliedOfferId, setAppliedOfferId] = useState<string | undefined>(initialOrder?.appliedOfferId);

  const [isGstEnabled, setIsGstEnabled] = useState(initialOrder ? (initialOrder.gstPercentage > 0) : false);
  const [gstPercentage] = useState(initialOrder?.gstPercentage || settings?.gstPercentage || 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submitMode, setSubmitMode] = useState<'KOT' | 'SETTLE'>('KOT');
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);
  const [includePaymentLink, setIncludePaymentLink] = useState(true);
  const [finalProcessedOrder, setFinalProcessedOrder] = useState<Order | null>(null);

  const activeOffers = useMemo(() => offers.filter(o => o.isActive), [offers]);

  // Financial Calculations
  const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const selectedOffer = useMemo(() => {
    const offer = offers.find(o => o.id === appliedOfferId);
    if (offer && offer.minPurchase && subtotalAmount < offer.minPurchase) {
      return null;
    }
    return offer;
  }, [appliedOfferId, offers, subtotalAmount]);

  const discountAmount = useMemo(() => {
    if (!selectedOffer) return 0;
    if (selectedOffer.discountType === 'percentage') {
      return subtotalAmount * (selectedOffer.discountValue / 100);
    } else {
      return selectedOffer.discountValue;
    }
  }, [selectedOffer, subtotalAmount]);

  const [orderId] = useState(() => {
    if (initialOrder?.id) return initialOrder.id;
    const date = new Date();
    const ts = date.getTime().toString().slice(-4);
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${ts}-${rand}`;
  });

  const categories = useMemo(() => ['All', ...Array.from(new Set(menuItems.map(item => item.category)))], [menuItems]);

  // Auto-deselect offer if subtotal drops below minPurchase
  useEffect(() => {
    if (appliedOfferId) {
      const offer = offers.find(o => o.id === appliedOfferId);
      if (offer && offer.minPurchase && subtotalAmount < offer.minPurchase) {
        setAppliedOfferId(undefined);
      }
    }
  }, [subtotalAmount, appliedOfferId, offers]);

  // Show loading state while settings are being fetched
  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D17842] mx-auto mb-4"></div>
          <p className="text-[#8E8E93] font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      const currentIndex = categories.indexOf(activeCategory);
      let nextIndex = currentIndex;
      if (distance > 0) nextIndex = (currentIndex + 1) % categories.length;
      else nextIndex = (currentIndex - 1 + categories.length) % categories.length;
      setActiveCategory(categories[nextIndex]);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesDietary = dietaryFilter === 'Both' || item.dietary === dietaryFilter;
    return matchesSearch && matchesCategory && matchesDietary;
  });

  const addToCart = (item: MenuItem, variant?: MenuVariant) => {
    if (!item.isAvailable) return;
    const finalId = variant ? `${item.id}-${variant.size}` : item.id;
    const finalName = item.name;
    const finalPrice = variant ? variant.price : item.price;
    const variantName = variant ? variant.size : undefined;

    setCart(prev => {
      const existing = prev.find(i => i.id === finalId);
      if (existing) return prev.map(i => i.id === finalId ? { ...i, quantity: i.quantity + 1, status: ItemStatus.PENDING } : i);
      return [...prev, { id: finalId, name: finalName, price: finalPrice, quantity: 1, status: ItemStatus.PENDING, variantName, image: item.image }];
    });
  };

  const removeFromCart = (item: MenuItem, variant?: MenuVariant) => {
    const finalId = variant ? `${item.id}-${variant.size}` : item.id;
    setCart(prev => {
      const existing = prev.find(i => i.id === finalId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === finalId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== finalId);
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity === 1 && delta === -1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => {
        if (i.id === itemId) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty, status: delta > 0 ? ItemStatus.PENDING : i.status };
        }
        return i;
      });
    });
  };

  const taxableAmount = Math.max(0, subtotalAmount - discountAmount);
  const gstAmount = isGstEnabled ? taxableAmount * (gstPercentage / 100) : 0;
  const finalTotal = taxableAmount + gstAmount;

  const handleProcessOrder = (mode: 'KOT' | 'SETTLE') => {
    if (cart.length === 0) return;
    setSubmitMode(mode);
    setIsSubmitting(true);
    const finalOrder: Order = {
      id: orderId,
      tenantId: tenantId,
      customerName,
      customerPhone,
      tableNumber: orderType === OrderType.DINE_IN ? tableNumber : undefined,
      address: orderType === OrderType.DELIVERY ? address : undefined,
      locationLink: orderType === OrderType.DELIVERY ? locationLink : undefined,
      orderType,
      items: cart.map(i => ({ 
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        status: i.status || ItemStatus.PENDING,
        variantName: i.variantName
      })),
      totalAmount: finalTotal,
      gstAmount,
      gstPercentage: isGstEnabled ? gstPercentage : 0,
      status: (mode === 'SETTLE' && paymentMethod !== PaymentMethod.CASH) ? OrderStatus.COMPLETED : OrderStatus.ACTIVE,
      paymentMethod,
      createdAt: initialOrder?.createdAt || new Date().toISOString(),
      appliedOfferId: appliedOfferId
    };
    
    setTimeout(() => {
      setIsSubmitting(false);
      setFinalProcessedOrder(finalOrder);
      onSave(finalOrder);
      
      if (mode === 'SETTLE' && paymentMethod === PaymentMethod.UPI) {
        const upiLink = generateUPILink(finalOrder, settings);
        if (upiLink) {
          window.location.href = upiLink;
        }
      }
      
      setShowOrderSuccessModal(true);
    }, 1200);
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.isAvailable) return;
    if (item.hasVariants && item.variants && item.variants.length > 0) {
      setVariantSelectionItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationLink(link);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          setAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert('Unable to retrieve your location. Please check your permissions.');
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFCFB] animate-in fade-in duration-500">
      {variantSelectionItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-[#1C1C1E]">{variantSelectionItem.name}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Size & Quantity</p>
              </div>
              <button onClick={() => setVariantSelectionItem(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              {variantSelectionItem.variants?.map((v, idx) => {
                const variantId = `${variantSelectionItem.id}-${v.size}`;
                const cartVariant = cart.find(i => i.id === variantId);
                const qty = cartVariant?.quantity || 0;

                return (
                  <div 
                    key={idx} 
                    className={`w-full flex items-center justify-between p-4 rounded-[24px] border-2 transition-all ${qty > 0 ? 'bg-orange-50 border-[#D17842]' : 'bg-[#F9F5F2] border-transparent'}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-sm uppercase tracking-wide">{v.size}</span>
                      <span className="font-bold text-xs text-[#D17842]">{settings.currency} {v.price}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-[#F1E7E1]">
                          <button onClick={() => removeFromCart(variantSelectionItem, v)} className="w-8 h-8 flex items-center justify-center text-[#D17842]"><Minus size={16} strokeWidth={3} /></button>
                          <span className="text-sm font-black w-4 text-center">{qty}</span>
                          <button onClick={() => addToCart(variantSelectionItem, v)} className="w-8 h-8 flex items-center justify-center text-[#D17842]"><Plus size={16} strokeWidth={3} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(variantSelectionItem, v)} className="w-10 h-10 bg-[#D17842] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus size={20} strokeWidth={3} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setVariantSelectionItem(null)} className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mt-4">Done</button>
          </div>
        </div>
      )}

      {showOrderSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
          <div className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-10 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
              {submitMode === 'KOT' ? <Clock size={56} strokeWidth={3} /> : <CheckCircle2 size={56} strokeWidth={3} />}
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-[#1C1C1E] tracking-tight">{submitMode === 'KOT' ? 'KOT Generated!' : 'Order Settled!'}</h3>
              <p className="text-sm font-bold text-[#D17842] uppercase tracking-[0.2em]">Order #{orderId}</p>
            </div>
            <div className="w-full space-y-4">
              {customerPhone && settings.whatsappEnabled && finalProcessedOrder && (
                <div className="space-y-4">
                  {paymentMethod === PaymentMethod.UPI && (
                    <div className="flex items-center justify-between px-6 py-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-[#D17842]" />
                        <span className="text-[10px] font-black uppercase text-[#D17842] tracking-widest">Include Payment Link</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIncludePaymentLink(!includePaymentLink)}
                        className={`w-10 h-5 rounded-full relative transition-all ${includePaymentLink ? 'bg-[#D17842]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includePaymentLink ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => shareOnWhatsApp(finalProcessedOrder, settings, submitMode === 'KOT' ? 'CONFIRM' : 'SETTLE', includePaymentLink)}
                    className="w-full py-4.5 rounded-[24px] bg-green-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <MessageCircle size={18} fill="currentColor" strokeWidth={0} /> Share Order Receipt
                  </button>
                </div>
              )}
              <button onClick={onCancel} className="w-full py-4.5 rounded-[24px] bg-[#F9F5F2] text-[#1C1C1E] font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Back to Home</button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-30 bg-white border-b border-[#F1E7E1] shadow-sm">
        <div className="px-6 py-4 md:px-10 md:py-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full active:scale-90 transition-all"><X size={24} className="text-gray-400" /></button>
            <div className="h-8 w-px bg-gray-200 mx-1"></div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#1C1C1E] tracking-tight">{step === 1 ? 'Select Items' : 'Confirm Order'}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${orderType === OrderType.DINE_IN ? 'bg-orange-50 text-[#D17842]' : 'bg-blue-50 text-blue-600'}`}>
                   {orderType}
                 </div>
                 <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">
                  {orderType === OrderType.DINE_IN ? `Table: ${tableNumber || 'N/A'}` : `Order ID: ${orderId}`}
                 </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-[#8E8E93] uppercase tracking-widest">Billing Total</span>
               <span className="text-xl font-black text-[#D17842]">{settings.currency} {finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-1 bg-gray-100">
           <div 
            className="h-full bg-[#D17842] transition-all duration-700 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
           />
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {step === 1 ? (
          <div className="h-full flex flex-col">
            <div className="p-4 md:p-6 space-y-4 bg-white border-b border-[#F1E7E1]/40">
              <div className="relative group max-w-2xl mx-auto flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search menu..." className="w-full pl-11 pr-5 py-3.5 rounded-[20px] bg-[#F9F5F2] border-none font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                
                <button 
                  onClick={() => {
                    const states: ('Both' | 'Veg' | 'Non-Veg')[] = ['Both', 'Veg', 'Non-Veg'];
                    const next = states[(states.indexOf(dietaryFilter) + 1) % states.length];
                    setDietaryFilter(next);
                  }}
                  className={`flex items-center justify-center w-12 h-12 rounded-[20px] transition-all shadow-sm active:scale-90 border-2 shrink-0 ${
                    dietaryFilter === 'Both' ? 'bg-white border-[#F1E7E1]' :
                    dietaryFilter === 'Veg' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <DietaryIndicator 
                    dietary={dietaryFilter === 'Both' ? 'All' : dietaryFilter} 
                    size="md" 
                    className={dietaryFilter === 'Both' ? '' : 'shadow-sm'} 
                  />
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full md:w-auto">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#D17842] text-white shadow-md shadow-orange-100' : 'bg-[#F9F5F2] text-[#6B7280]'}`}>{cat}</button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 no-scrollbar touch-pan-y" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredItems.map((item, index) => {
                  const itemsInCart = cart.filter(i => i.id === item.id || i.id.startsWith(`${item.id}-`));
                  const totalQty = itemsInCart.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <div 
                      key={`${item.id}-${index}`} 
                      onClick={() => handleItemClick(item)}
                      className={`relative bg-white rounded-[20px] border-2 transition-all overflow-hidden flex flex-col h-full group ${totalQty > 0 ? 'border-[#D17842] shadow-lg scale-[1.02]' : 'border-[#F1E7E1]/60'} ${!item.isAvailable ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.name} />
                        <div className="absolute top-1.5 left-1.5">
                          <DietaryIndicator dietary={item.dietary} size="sm" className="shadow-sm border-white/50 scale-75 origin-top-left" />
                        </div>
                        {totalQty > 0 && item.isAvailable && (
                          <div className="absolute top-1.5 right-1.5 bg-[#D17842] text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shadow-lg animate-in zoom-in">
                            {totalQty}
                          </div>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white/90 text-[#1C1C1E] text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-lg">Not Available</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex flex-col flex-1">
                        <h4 className="text-[12px] font-black text-[#1C1C1E] mb-1 line-clamp-1 leading-tight">{item.name}</h4>
                        <div className="flex items-center justify-between mt-auto">
                           <p className="text-[11px] font-black text-[#D17842]">{settings.currency}{item.price}{item.hasVariants ? '+' : ''}</p>
                           {totalQty > 0 && !item.hasVariants && item.isAvailable ? (
                             <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg p-1" onClick={e => e.stopPropagation()}>
                               <button onClick={() => removeFromCart(item)} className="p-1.5 bg-white rounded-md text-[#D17842] shadow-sm active:scale-90 transition-all"><Minus size={10} strokeWidth={3} /></button>
                               <span className="text-[11px] font-black w-4 text-center text-[#D17842]">{totalQty}</span>
                               <button onClick={() => addToCart(item)} className="p-1.5 bg-[#D17842] text-white rounded-md shadow-sm active:scale-90 transition-all"><Plus size={10} strokeWidth={3} /></button>
                             </div>
                           ) : (
                             <p className="text-[8px] font-black text-green-600">{item.isAvailable ? item.stock : 'Sold Out'}</p>
                           )}
                        </div>
                        <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 flex items-center justify-between">
                          <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter truncate block">{item.category}</span>
                          {item.hasVariants && item.isAvailable && (
                            <div className="bg-orange-50 text-[#D17842] p-0.5 rounded-md">
                              <Layers size={8} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4">
              <div className="bg-[#1C1C1E] text-white rounded-[28px] p-2 flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-md animate-in slide-in-from-bottom-6">
                <div className="pl-6 flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Amount</span>
                  <p className="text-base font-black">{settings.currency}{subtotalAmount.toLocaleString('en-IN')}</p>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setStep(2)}
                  className="bg-[#D17842] text-white px-7 py-3.5 rounded-[22px] font-black uppercase text-[10px] tracking-widest active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                >
                  Review Cart <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white overflow-y-auto no-scrollbar pb-40">
            <div className="max-w-xl mx-auto px-6 py-10 space-y-12 animate-in slide-in-from-bottom-6">
              
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block px-1">Order Type</label>
                <div className="flex justify-between items-center gap-4">
                  <button 
                    onClick={() => setOrderType(OrderType.DINE_IN)} 
                    className={`flex-1 flex flex-col items-center gap-3 py-8 rounded-[40px] border-2 transition-all group ${orderType === OrderType.DINE_IN ? 'bg-white border-[#D17842] text-[#D17842]' : 'bg-white border-[#F1E7E1] text-gray-300 hover:border-gray-200'}`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${orderType === OrderType.DINE_IN ? 'bg-[#D17842]/5 text-[#D17842]' : 'bg-[#F9F5F2] text-gray-300'}`}>
                      <Coffee size={10} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Dine-in</span>
                  </button>
                  <button 
                    onClick={() => setOrderType(OrderType.TAKEAWAY)} 
                    className={`flex-1 flex flex-col items-center gap-3 py-8 rounded-[40px] border-2 transition-all group ${orderType === OrderType.TAKEAWAY ? 'bg-white border-[#D17842] text-[#D17842]' : 'bg-white border-[#F1E7E1] text-gray-300 hover:border-gray-200'}`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${orderType === OrderType.TAKEAWAY ? 'bg-[#D17842]/5 text-[#D17842]' : 'bg-[#F9F5F2] text-gray-300'}`}>
                      <LogOut size={10} className="rotate-180" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Takeaway</span>
                  </button>
                  <button 
                    onClick={() => setOrderType(OrderType.DELIVERY)} 
                    className={`flex-1 flex flex-col items-center gap-3 py-8 rounded-[40px] border-2 transition-all group ${orderType === OrderType.DELIVERY ? 'bg-white border-[#D17842] text-[#D17842]' : 'bg-white border-[#F1E7E1] text-gray-300 hover:border-gray-200'}`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${orderType === OrderType.DELIVERY ? 'bg-[#D17842]/5 text-[#D17842]' : 'bg-[#F9F5F2] text-gray-300'}`}>
                      <Truck size={10} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Delivery</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block px-1">Guest Information</label>
                <div className="space-y-3">
                  {orderType === OrderType.DINE_IN && (
                    <div className="relative group">
                       <input 
                        type="text" 
                        placeholder="Table Number" 
                        className="w-full px-8 py-5 rounded-[24px] border-2 border-[#F1E7E1] bg-white font-bold text-[#1C1C1E] focus:border-[#D17842] outline-none transition-all placeholder:text-gray-300" 
                        value={tableNumber} 
                        onChange={e => setTableNumber(e.target.value)} 
                      />
                    </div>
                  )}
                  {orderType === OrderType.DELIVERY && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                      <div className="relative">
                        <textarea 
                          placeholder="Full Delivery Address" 
                          className="w-full px-8 py-6 rounded-[32px] bg-white border-2 border-[#F1E7E1] font-bold min-h-[120px] focus:border-[#D17842] outline-none transition-all placeholder:text-gray-300" 
                          value={address} 
                          onChange={e => setAddress(e.target.value)} 
                        />
                        <button 
                          type="button"
                          onClick={handleGetCurrentLocation}
                          disabled={isLocating}
                          className="absolute bottom-4 right-4 p-3 bg-orange-50 text-[#D17842] rounded-2xl hover:bg-orange-100 transition-all active:scale-95 flex items-center gap-2 shadow-sm border border-orange-100"
                        >
                          {isLocating ? <RefreshCw size={16} className="animate-spin" /> : <MapPin size={16} />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{isLocating ? 'Locating...' : 'Get Exact Location'}</span>
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Google Location Link (Optional)" 
                        className="w-full px-8 py-5 rounded-[24px] bg-white border-2 border-[#F1E7E1] font-bold focus:border-[#D17842] outline-none transition-all placeholder:text-gray-300" 
                        value={locationLink} 
                        onChange={e => setLocationLink(e.target.value)} 
                      />
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder="Guest Name" 
                    className="w-full px-8 py-5 rounded-[24px] border-2 border-[#F1E7E1] bg-white font-bold text-[#1C1C1E] focus:border-[#D17842] outline-none transition-all placeholder:text-gray-300" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="w-full px-8 py-5 rounded-[24px] border-2 border-[#F1E7E1] bg-white font-bold text-[#1C1C1E] focus:border-[#D17842] outline-none transition-all placeholder:text-gray-300" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                  />
                </div>
              </div>

              {activeOffers.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block">Apply Offer</label>
                    {appliedOfferId && (
                      <button onClick={() => setAppliedOfferId(undefined)} className="text-[9px] font-black uppercase text-red-500">Clear</button>
                    )}
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                    {activeOffers.map(offer => {
                      const isEligible = !offer.minPurchase || subtotalAmount >= offer.minPurchase;
                      
                      return (
                        <button 
                          key={offer.id}
                          disabled={!isEligible}
                          onClick={() => setAppliedOfferId(offer.id)}
                          className={`min-w-[200px] p-5 rounded-[32px] text-left border-2 transition-all flex flex-col gap-3 relative overflow-hidden group ${
                            appliedOfferId === offer.id 
                            ? 'border-[#D17842] bg-orange-50/50 shadow-lg scale-[1.02]' 
                            : isEligible ? 'border-[#F1E7E1] bg-white' : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className={`p-2 rounded-xl w-fit ${appliedOfferId === offer.id ? 'bg-[#D17842] text-white' : 'bg-[#F9F5F2] text-[#D17842]'}`}>
                            {offer.icon === 'megaphone' ? <Megaphone size={14} /> : offer.icon === 'gift' ? <Gift size={14} /> : <Sparkles size={14} />}
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-[#1C1C1E] leading-tight">{offer.title}</p>
                              <span className="text-[8px] font-black text-orange-600 bg-orange-100 px-1 rounded">
                                {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                              </span>
                            </div>
                            <p className="text-[8px] font-bold text-gray-400 mt-0.5 line-clamp-1">{offer.description}</p>
                            {offer.minPurchase && (
                              <p className={`text-[7px] font-black mt-1 uppercase tracking-tighter ${isEligible ? 'text-green-600' : 'text-red-500'}`}>
                                {isEligible ? 'Eligible' : `Min. ₹${offer.minPurchase} required`}
                              </p>
                            )}
                          </div>
                          {appliedOfferId === offer.id && (
                            <div className="absolute -right-2 -bottom-2 p-4 bg-[#D17842] text-white rounded-full animate-in zoom-in">
                              <CheckCircle2 size={16} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block px-1">Cart Items</label>
                <div className="bg-white rounded-[48px] p-10 border-2 border-dashed border-[#F1E7E1] space-y-8">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between gap-6 group">
                      <div className="flex items-center gap-5 flex-1">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100 bg-[#F9F5F2]">
                          <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt={item.name} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-black text-[#1C1C1E] leading-tight">{item.name}</p>
                            {item.variantName && (
                              <span className="text-[7px] font-black uppercase bg-orange-50 text-[#D17842] px-2 py-0.5 rounded-md leading-none border border-orange-100">
                                {item.variantName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-gray-400 mt-1">{settings.currency}{item.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="flex items-center gap-4 bg-[#F1F1F1] px-4 py-2 rounded-full shadow-inner">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-[#D17842] active:scale-75 transition-all"><Minus size={14} strokeWidth={4} /></button>
                          <span className="text-xs font-black w-4 text-center text-[#1C1C1E]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-[#D17842] active:scale-75 transition-all"><Plus size={14} strokeWidth={4} /></button>
                        </div>
                        <p className="text-[13px] font-black text-[#1C1C1E] min-w-[70px] text-right">{settings.currency}{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-4 border-2 border-dashed border-[#F1E7E1] rounded-[24px] text-gray-400 font-black uppercase text-[9px] tracking-widest hover:border-[#D17842] hover:text-[#D17842] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add More Items
                  </button>
                  
                  <div className="pt-10 border-t-2 border-dashed border-[#F1E7E1] space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Enable GST</span>
                        <button 
                          type="button"
                          onClick={() => setIsGstEnabled(!isGstEnabled)}
                          className={`w-10 h-5 rounded-full relative transition-all ${isGstEnabled ? 'bg-[#D17842]' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isGstEnabled ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                      {appliedOfferId && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tight border border-green-100">
                          <Star size={10} fill="currentColor" /> {offers.find(o => o.id === appliedOfferId)?.title} Applied
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                      <span>Subtotal</span>
                      <span className="text-gray-600">{settings.currency}{subtotalAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedOfferId && discountAmount > 0 && (
                      <div className="flex justify-between text-[11px] font-bold text-green-600 uppercase tracking-[0.1em] animate-in slide-in-from-top-2">
                        <span>Discount ({selectedOffer?.title})</span>
                        <span>-{settings.currency}{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {isGstEnabled && (
                      <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] animate-in slide-in-from-top-2">
                        <span>GST ({gstPercentage}%) {discountAmount > 0 ? 'on Net' : ''}</span>
                        <span className="text-gray-600">{settings.currency}{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-[11px] font-black uppercase text-[#1C1C1E] tracking-[0.2em]">Total Billing</span>
                      <span className="text-3xl font-black text-[#D17842] tracking-tighter">{settings.currency}{finalTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 space-y-4">
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod(PaymentMethod.UPI)} 
                      className={`flex items-center justify-center gap-3 py-5 rounded-[24px] border-2 transition-all ${paymentMethod === PaymentMethod.UPI ? 'bg-white border-[#D17842] text-[#D17842]' : 'bg-[#F9F5F2] border-transparent text-gray-400'}`}
                    >
                      <Smartphone size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">UPI</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPaymentMethod(PaymentMethod.CASH)} 
                      className={`flex items-center justify-center gap-3 py-5 rounded-[24px] border-2 transition-all ${paymentMethod === PaymentMethod.CASH ? 'bg-white border-[#D17842] text-[#D17842]' : 'bg-[#F9F5F2] border-transparent text-gray-400'}`}
                    >
                      <Banknote size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
                    </button>
                  </div>

                <button 
                  disabled={isSubmitting || cart.length === 0} 
                  onClick={() => handleProcessOrder('SETTLE')} 
                  className="w-full flex items-center justify-center gap-3 py-7 rounded-[40px] text-white font-black uppercase tracking-[0.2em] transition-all text-xs bg-[#D17842] shadow-2xl shadow-orange-200 active:scale-95 disabled:bg-gray-200"
                >
                  {isSubmitting && submitMode === 'SETTLE' ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle2 size={20} strokeWidth={3} />} 
                  {paymentMethod === PaymentMethod.UPI ? 'Pay Now' : 'Final Settle'}
                </button>
                
                <button 
                  onClick={() => setStep(1)} 
                  className="w-full py-4 text-gray-400 font-black uppercase text-[9px] tracking-[0.2em] hover:text-[#1C1C1E] transition-colors flex items-center justify-center gap-2 mt-4"
                >
                   <ArrowLeft size={14} /> Back to Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfOrder;
