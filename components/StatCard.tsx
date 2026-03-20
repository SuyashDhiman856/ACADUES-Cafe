
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  colorVariant?: 'orange' | 'blue' | 'green' | 'purple';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  isPositive,
  colorVariant = 'orange',
  onClick
}) => {
  const variants = {
    orange: { bg: 'bg-orange-50', icon: 'text-[#D17842]' },
    blue: { bg: 'bg-blue-50', icon: 'text-[#4285F4]' },
    green: { bg: 'bg-green-50', icon: 'text-[#34C759]' },
    purple: { bg: 'bg-purple-50', icon: 'text-[#A855F7]' },
  };

  const style = variants[colorVariant];
  
  // Ensure consistency in Rupee symbol spacing if value contains it
  const formattedValue = typeof value === 'string' && value.startsWith('₹') 
    ? value.replace('₹', '₹ ') 
    : value;

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-2 md:p-6 rounded-[16px] md:rounded-[32px] border border-[#F1E7E1]/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-lg transition-all duration-500 group flex flex-col justify-center gap-1 min-h-[75px] md:min-h-[140px] ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
      {/* Top Row: Icon and Label together on the left for mobile */}
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center gap-1.5 md:flex-col md:items-start md:gap-4">
          <div className={`p-1 md:p-4 ${style.bg} rounded-lg md:rounded-2xl transition-transform duration-500 group-hover:scale-110`}>
            <Icon size={14} className={`${style.icon} md:w-6 md:h-6 stroke-[3] md:stroke-[2.5]`} />
          </div>
          <p className="text-[#8E8E93] text-[10px] md:text-[13px] font-bold tracking-tight uppercase">{label}</p>
        </div>
        
        {trend && (
          <div className={`px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-[7px] md:text-[10px] font-black uppercase tracking-wider`}>
            {isPositive ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
      
      <div className="mt-0">
        <h3 className="text-lg md:text-2xl lg:text-3xl font-black text-[#1C1C1E] tracking-tighter leading-none">{formattedValue}</h3>
      </div>
    </div>
  );
};

export default StatCard;
