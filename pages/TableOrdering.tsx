import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Send, ShoppingBag, Clock, Receipt, User, ArrowLeft, ArrowRight, Table as TableIcon } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { useTables } from '../hooks/useTables';
import { useCart } from '../hooks/useCart';
import { OrderType, MenuItem } from '../types';
import CartDetail from '../components/CartDetail';

const TableOrdering: React.FC = () => {
  const { menuItems, loading: menuLoading } = useMenu();
  const { tables, loading: tablesLoading } = useTables();
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Backend Cart Integration
  const { cart, loading: cartLoading, addToCartBackend, sendToKitchen } = useCart(selectedTableId);

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(i => i.category || 'Other'));
    return ['All', ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory && item.isAvailable;
    });
  }, [menuItems, searchTerm, activeCategory]);

  const handleAddItem = async (item: MenuItem) => {
    if (!selectedTableId) {
      alert("Please select a table first!");
      return;
    }
    try {
      await addToCartBackend(item.id, 1);
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  const handleSendToKitchen = async () => {
    if (!selectedTableId) return;
    try {
      const result = await sendToKitchen(OrderType.DINE_IN);
      alert("Order successfully sent to kitchen!");
    } catch (err) {
      console.error("Order error:", err);
    }
  };

  if (tablesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDFCFB]">
        <div className="w-12 h-12 border-4 border-[#D17842]/20 border-t-[#D17842] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDFCFB]">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col h-full border-r border-[#F1E7E1] overflow-hidden">
        <header className="px-10 py-8 space-y-8 bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Table Ordering</h1>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                <TableIcon size={12} className="text-[#D17842]" /> Persistent Dining Experience
              </p>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group">
                <select 
                  className="px-8 py-5 rounded-[24px] border-2 border-[#F1E7E1] bg-white font-bold text-[#1C1C1E] focus:border-[#D17842] outline-none transition-all appearance-none pr-12"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                >
                  <option value="">Select Table</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>Table {t.tableNumber}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-focus:rotate-180 transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>

               <div className="relative">
                <input 
                  type="text" 
                  placeholder="Seach menu..." 
                  className="w-[320px] px-10 py-5 rounded-[24px] border-2 border-transparent bg-[#F9F5F2] font-bold text-[#1C1C1E] focus:border-[#D17842] focus:bg-white outline-none transition-all placeholder:text-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm active:scale-95 ${activeCategory === cat ? 'bg-[#D17842] text-white shadow-[#D17842]/20' : 'bg-white border-2 border-[#F1E7E1] text-[#D17842] hover:border-[#D17842]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleAddItem(item)}
                className="group p-6 bg-white border-2 border-[#F1E7E1] rounded-[40px] hover:border-[#D17842] hover:shadow-2xl hover:shadow-orange-500/5 transition-all cursor-pointer active:scale-95 duration-300"
              >
                <div className="aspect-square rounded-[32px] overflow-hidden mb-6 bg-[#F9F5F2] shadow-inner relative">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={20} className="text-[#D17842]" />
                  </div>
                </div>
                <div className="space-y-3 px-1 text-center">
                  <h3 className="text-sm font-black text-[#1C1C1E] uppercase tracking-wide truncate">{item.name}</h3>
                  <p className="text-xl font-black text-[#D17842]">₹ {item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Right: Cart Panel */}
      <div className="w-[480px] h-full bg-white flex flex-col shadow-2xl z-30 p-10">
        <CartDetail 
          cart={cart}
          loading={cartLoading}
          onUpdateQuantity={(menuItemId, quantity) => addToCartBackend(menuItemId, quantity)}
          onSendToKitchen={handleSendToKitchen}
          currency="₹"
        />
      </div>
    </div>
  );
};

export default TableOrdering;
