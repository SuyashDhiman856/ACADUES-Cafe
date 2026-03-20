import React from 'react';
import { ShoppingBag, Plus, Minus, Send, Trash2, Clock } from 'lucide-react';
import { ApiCart, ApiCartItem, OrderType } from '../types';

interface CartDetailProps {
  cart: ApiCart | null;
  loading: boolean;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onSendToKitchen: (orderType: OrderType) => void;
  currency: string;
}

const CartDetail: React.FC<CartDetailProps> = ({ 
  cart, 
  loading, 
  onUpdateQuantity, 
  onSendToKitchen,
  currency 
}) => {
  const cartItems = cart?.cartItems || [];
  const total = cartItems.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);

  if (!cart || cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
        <div className="p-6 bg-gray-50 rounded-full">
          <ShoppingBag size={48} strokeWidth={1} />
        </div>
        <p className="text-sm font-black uppercase tracking-widest italic">Cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xl font-black text-[#1C1C1E]">Table Cart</h3>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <Clock size={10} /> Syncing with kitchen
          </p>
        </div>
        <span className="px-4 py-2 bg-orange-50 text-[#D17842] rounded-2xl text-[10px] font-black uppercase tracking-widest">
          {cartItems.length} Items
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-2">
        {cartItems.map((item) => (
          <div key={item.id} className="group p-5 bg-white border-2 border-[#F1E7E1] rounded-[32px] hover:border-[#D17842] transition-all flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#F9F5F2] rounded-2xl overflow-hidden shadow-inner">
                {item.menuItem.imageUrl && (
                  <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h4 className="font-black text-sm text-[#1C1C1E]">{item.menuItem.name}</h4>
                <p className="text-xs font-bold text-[#D17842]">{currency} {item.menuItem.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#F9F5F2] p-2 rounded-2xl">
              <button 
                onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400 hover:text-[#D17842] transition-all"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="w-6 text-center text-sm font-black text-[#1C1C1E]">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400 hover:text-[#D17842] transition-all"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t-2 border-dashed border-[#F1E7E1] space-y-6">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Total</span>
          <span className="text-3xl font-black text-[#1C1C1E]">{currency} {total.toLocaleString()}</span>
        </div>

        <button 
          onClick={() => onSendToKitchen(OrderType.DINE_IN)}
          disabled={loading}
          className="w-full py-6 bg-[#D17842] text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#D17842]/20 active:scale-95 hover:brightness-110 transition-all flex items-center justify-center gap-4"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={20} />
              Send to Kitchen
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartDetail;
