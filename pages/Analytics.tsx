
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Cell, PieChart, 
  Pie, AreaChart, Area, ComposedChart, Legend 
} from 'recharts';
import { 
  ArrowUpRight, TrendingUp, Calendar, Download, 
  IndianRupee, ChevronDown, Clock, Search, X, 
  Activity, ShoppingBag, CreditCard 
} from 'lucide-react';
import { Order, Expense, MenuItem, OrderStatus } from '../types';

interface AnalyticsProps {
  orders: Order[];
  expenses: Expense[];
  menuItems: MenuItem[];
}

type TimeRange = 'Today' | 'Week' | 'Month' | 'Quarterly' | 'Yearly' | 'Custom';

const Analytics: React.FC<AnalyticsProps> = ({ orders, expenses, menuItems }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('Week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Unified Range Configuration
  const rangeConfig = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let labelFormat = 'date'; // 'hour', 'date', 'month'

    switch (timeRange) {
      case 'Today':
        start.setHours(0, 0, 0, 0);
        labelFormat = 'hour';
        break;
      case 'Week':
        start.setDate(now.getDate() - 7);
        labelFormat = 'date';
        break;
      case 'Month':
        start.setDate(now.getDate() - 30);
        labelFormat = 'date';
        break;
      case 'Quarterly':
        start.setDate(now.getDate() - 90);
        labelFormat = 'date';
        break;
      case 'Yearly':
        start.setDate(now.getDate() - 365);
        labelFormat = 'month';
        break;
      case 'Custom':
        start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
        labelFormat = 'date';
        break;
    }
    return { start, end: customEnd ? new Date(customEnd) : now, labelFormat };
  }, [timeRange, customStart, customEnd]);

  // Aggregated Intelligence Data
  const trendData = useMemo(() => {
    const { start, end, labelFormat } = rangeConfig;
    const dataMap: Record<string, any> = {};

    const getPointKey = (d: Date) => {
      if (labelFormat === 'hour') return d.getHours() + ':00';
      if (labelFormat === 'month') return d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    // Pre-seed the data map to ensure continuity in the line chart
    const current = new Date(start);
    while (current <= end) {
      const key = getPointKey(current);
      dataMap[key] = { name: key, revenue: 0, expenditure: 0, orders: 0, avgValue: 0 };
      if (labelFormat === 'hour') current.setHours(current.getHours() + 1);
      else if (labelFormat === 'month') current.setMonth(current.getMonth() + 1);
      else current.setDate(current.getDate() + 1);
    }

    orders.forEach(o => {
      if (o.isCancelled || o.status !== OrderStatus.COMPLETED) return;
      const oDate = new Date(o.createdAt);
      if (oDate >= start && oDate <= end) {
        const key = getPointKey(oDate);
        if (dataMap[key]) {
          dataMap[key].revenue += o.totalAmount;
          dataMap[key].orders += 1;
        }
      }
    });

    expenses.forEach(e => {
      if (e.isCancelled) return;
      const eDate = new Date(e.date);
      if (eDate >= start && eDate <= end) {
        const key = getPointKey(eDate);
        if (dataMap[key]) {
          dataMap[key].expenditure += e.amount;
        }
      }
    });

    return Object.values(dataMap).map(point => ({
      ...point,
      avgValue: point.orders > 0 ? Math.round(point.revenue / point.orders) : 0
    }));
  }, [orders, expenses, rangeConfig]);

  // KPIs
  const financials = useMemo(() => {
    const { start, end } = rangeConfig;
    const filteredOrders = orders.filter(o => !o.isCancelled && o.status === OrderStatus.COMPLETED && new Date(o.createdAt) >= start && new Date(o.createdAt) <= end);
    const filteredExpenses = expenses.filter(e => !e.isCancelled && new Date(e.date) >= start && new Date(e.date) <= end);
    
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const orderCount = filteredOrders.length;
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, netProfit, margin, orderCount };
  }, [orders, expenses, rangeConfig]);

  // Category Breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const { start, end } = rangeConfig;
    const breakdown: Record<string, number> = {};
    orders.forEach(order => {
      if (order.isCancelled || order.status !== OrderStatus.COMPLETED) return;
      const d = new Date(order.createdAt);
      if (d >= start && d <= end) {
        order.items.forEach(item => {
          const menuInfo = menuItems.find(mi => mi.id === item.id);
          const cat = menuInfo?.category || 'Uncategorized';
          breakdown[cat] = (breakdown[cat] || 0) + (item.price * item.quantity);
        });
      }
    });

    const colors = ['#D17842', '#1C1C1E', '#34C759', '#4285F4', '#A855F7', '#FFD700'];
    return Object.entries(breakdown).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [orders, menuItems, rangeConfig]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Analytics Hub</h2>
          <p className="text-[#8E8E93] font-medium text-sm">Historical business performance and trend tracking.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="appearance-none bg-white border border-[#F1E7E1] text-[10px] font-black uppercase tracking-widest rounded-2xl pl-4 pr-10 py-3 shadow-sm hover:border-[#D17842] transition-all cursor-pointer outline-none min-w-[140px]"
            >
              {['Today', 'Week', 'Month', 'Quarterly', 'Yearly', 'Custom'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {timeRange === 'Custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
               <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="px-4 py-2.5 bg-white border border-[#F1E7E1] rounded-xl text-[10px] font-black uppercase" />
               <span className="text-gray-400 text-xs font-black">TO</span>
               <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="px-4 py-2.5 bg-white border border-[#F1E7E1] rounded-xl text-[10px] font-black uppercase" />
            </div>
          )}

          <button className="flex items-center gap-2 bg-[#1C1C1E] text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all">
            <Download size={16} /> Export Reports
          </button>
        </div>
      </header>

      {/* KPI Cards (Old Reports) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
         <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
            <div className="p-3 bg-orange-50 text-[#D17842] rounded-2xl w-fit mb-4"><IndianRupee size={20} strokeWidth={3} /></div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Net Revenue</p>
            <p className="text-2xl font-black text-[#1C1C1E] mt-1">₹{financials.totalRevenue.toLocaleString('en-IN')}</p>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit mb-4"><CreditCard size={20} strokeWidth={3} /></div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Outflow</p>
            <p className="text-2xl font-black text-[#1C1C1E] mt-1">₹{financials.totalExpenses.toLocaleString('en-IN')}</p>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4"><ShoppingBag size={20} strokeWidth={3} /></div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order Volume</p>
            <p className="text-2xl font-black text-[#1C1C1E] mt-1">{financials.orderCount}</p>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-[#F1E7E1] shadow-sm">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit mb-4"><TrendingUp size={20} strokeWidth={3} /></div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Net Margin</p>
            <p className={`text-2xl font-black mt-1 ${financials.margin >= 0 ? 'text-green-600' : 'text-red-500'}`}>{financials.margin.toFixed(1)}%</p>
         </div>
      </div>

      <div className="space-y-8">
        {/* 📉 Combined Business Intelligence Chart */}
        <div className="bg-white p-8 md:p-12 rounded-[48px] border border-[#F1E7E1] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h3 className="text-2xl font-black text-[#1C1C1E] tracking-tight">Business Intelligence Trend</h3>
              <p className="text-sm text-[#8E8E93] font-medium">Correlation between Revenue, Expenditure, Volume & Avg Ticket.</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#D17842]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#1C1C1E]">Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#1C1C1E]">Expenses</span>
               </div>
            </div>
          </div>
          
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1E7E1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#F9F5F2'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px'}}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '20px'}} />
                <Bar yAxisId="right" dataKey="orders" name="Order Volume" fill="#F1E7E1" radius={[12, 12, 0, 0]} barSize={40} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#D17842" strokeWidth={5} fill="url(#colorRev)" />
                <Line yAxisId="left" type="monotone" dataKey="expenditure" name="Expenditure" stroke="#A855F7" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="avgValue" name="Avg Ticket Size" stroke="#34C759" strokeWidth={3} dot={{r: 4, fill: '#34C759', strokeWidth: 2, stroke: '#fff'}} />
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D17842" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#D17842" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
           {/* 💸 Separate Expense Trend */}
           <div className="bg-white p-8 md:p-10 rounded-[48px] border border-[#F1E7E1] shadow-sm">
             <div className="mb-8">
               <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight">Expenditure Trend</h3>
               <p className="text-sm text-[#8E8E93] font-medium">Tracking operational cash out-flow dynamics.</p>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1E7E1" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', fontWeight: 'bold'}} labelStyle={{display: 'none'}} />
                    <Area type="stepAfter" dataKey="expenditure" stroke="#A855F7" fill="#A855F7" fillOpacity={0.1} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>

           {/* 🍕 Mix Analysis */}
           <div className="bg-white p-8 md:p-10 rounded-[48px] border border-[#F1E7E1] shadow-sm flex flex-col md:flex-row items-center gap-10">
             <div className="flex-1 space-y-6">
                <div>
                   <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight">Category Velocity</h3>
                   <p className="text-xs text-[#8E8E93] font-black uppercase tracking-widest mt-1">Revenue Mix</p>
                </div>
                <div className="space-y-3">
                  {categoryData.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: cat.color}} />
                          <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-[#1C1C1E] transition-colors">{cat.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-[#1C1C1E]">₹{cat.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {categoryData.length === 0 && <p className="text-[10px] font-black uppercase text-gray-300 italic py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl">No item sales data</p>}
                </div>
             </div>
             <div className="h-48 w-48 shrink-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                     {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Share</span>
                  <span className="text-sm font-black text-[#1C1C1E]">100%</span>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Profitability View */}
      <div className="bg-[#1C1C1E] p-12 md:p-16 rounded-[64px] text-white shadow-2xl relative overflow-hidden mx-1">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="p-4 bg-white/10 w-fit rounded-3xl text-orange-400 shadow-xl">
                <Activity size={32} strokeWidth={3} />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black tracking-tighter leading-[0.9]">Profitability Dashboard.</h3>
                <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md">
                  A high-level view of your current liquid profitability excluding tax liabilities and non-operating income.
                </p>
              </div>
           </div>
           
           <div className="bg-white/5 backdrop-blur-xl rounded-[48px] p-10 border border-white/10 shadow-2xl">
              <div className="grid grid-cols-2 gap-y-12 gap-x-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Gross Revenue</p>
                  <p className="text-3xl font-black tracking-tight">₹{financials.totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Operating Cost</p>
                  <p className="text-3xl font-black text-red-400 tracking-tight">₹{financials.totalExpenses.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Net Surplus</p>
                  <p className={`text-3xl font-black tracking-tight ${financials.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{financials.netProfit.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Margin (%)</p>
                  <p className="text-3xl font-black text-orange-400 tracking-tight">{financials.margin.toFixed(1)}%</p>
                </div>
              </div>
           </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-1/4 translate-y-1/4">
           <TrendingUp size={500} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
