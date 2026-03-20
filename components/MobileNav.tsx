
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Utensils, 
  IndianRupee, 
  Settings, 
  ChefHat, 
  MoreHorizontal, 
  PieChart, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Users,
  Sparkles,
  X,
  ScrollText,
  Truck,
  LogOut,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
  ];

  const moreItems = [
    { id: 'self-order', label: 'Self Order', icon: ScrollText },
    { id: 'delivery', label: 'Deliver', icon: Truck },
    { id: 'finance', label: 'Finance', icon: ScrollText },
    { id: 'orders', label: 'History', icon: Receipt },
    { id: 'analytics', label: 'Reports', icon: PieChart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Control', icon: Settings },
  ];

  const handleMoreItemClick = (id: string) => {
    setActiveTab(id);
    setIsMoreOpen(false);
  };

  const handleDownloadData = (type: 'excel' | 'pdf') => {
    console.log(`Downloading all data as ${type}...`);
    setIsMoreOpen(false);
    alert(`Generating ${type.toUpperCase()} report of all records...`);
  };

  return (
    <>
      {/* More Menu Backdrop */}
      {isMoreOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] animate-in fade-in duration-300"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Popup */}
      <div className={`
        lg:hidden fixed bottom-[64px] left-0 right-0 z-[60] bg-white rounded-t-[40px] border-t border-[#F1E7E1] shadow-2xl p-8 pb-12 transition-all duration-300 transform
        ${isMoreOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95 pointer-events-none'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E]">Audit & Records</h3>
          <button onClick={() => setIsMoreOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-y-8 gap-x-4 mb-8">
          {moreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMoreItemClick(item.id)}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`
                p-5 rounded-2xl transition-all
                ${activeTab === item.id ? 'bg-[#D17842] text-white shadow-lg shadow-orange-100' : 'bg-[#F9F5F2] text-[#8E8E93] group-active:scale-95'}
              `}>
                <item.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase text-[#1C1C1E] text-center tracking-tighter leading-none h-4">
                {item.label}
              </span>
            </button>
          ))}
          <button
              onClick={() => handleMoreItemClick('offers')}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`
                p-5 rounded-2xl transition-all
                ${activeTab === 'offers' ? 'bg-[#D17842] text-white shadow-lg shadow-orange-100' : 'bg-[#F9F5F2] text-[#8E8E93] group-active:scale-95'}
              `}>
                <Sparkles size={24} />
              </div>
              <span className="text-[10px] font-black uppercase text-[#1C1C1E] text-center tracking-tighter leading-none h-4">
                Offers & Deals
              </span>
            </button>
        </div>

        <div className="pt-8 border-t border-dashed border-[#F1E7E1] space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Account Actions</p>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-600 active:scale-95 transition-all"
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </div>

      {/* Main Bottom Nav Bar - Flush to bottom */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#F1E7E1] px-4 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {primaryItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMoreOpen(false);
                }}
                className="flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 relative group"
              >
                {isActive && (
                  <div className="absolute top-0 w-1.5 h-1.5 bg-[#D17842] rounded-full -translate-y-1" />
                )}
                <div className={`
                  p-1 transition-all duration-300
                  ${isActive ? 'text-[#D17842] scale-110' : 'text-[#9CA3AF]'}
                `}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`
                  text-[10px] font-black tracking-tight transition-colors duration-300 uppercase
                  ${isActive ? 'text-[#D17842]' : 'text-[#9CA3AF]'}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center w-full gap-1 transition-all duration-300 relative group"
          >
            <div className={`
              p-1 transition-all duration-300
              ${isMoreOpen ? 'text-[#D17842] scale-110 rotate-90' : 'text-[#9CA3AF]'}
            `}>
              <MoreHorizontal size={24} strokeWidth={isMoreOpen ? 2.5 : 2} />
            </div>
            <span className={`
              text-[10px] font-black tracking-tight transition-colors duration-300 uppercase
              ${isMoreOpen ? 'text-[#D17842]' : 'text-[#9CA3AF]'}
            `}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
