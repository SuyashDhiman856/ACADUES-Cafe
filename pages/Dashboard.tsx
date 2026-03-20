
import React, { useState, useMemo } from 'react';
// Add Printer to the list of icons imported from lucide-react
import { IndianRupee, ShoppingBag, Plus, ChevronRight, TrendingUp, TrendingDown, ChevronDown, Utensils, CreditCard, ChefHat, CheckCircle2, Clock, Flame, AlertCircle, Calculator, Wallet, Landmark, X, MessageCircle, Phone, Receipt, Printer } from 'lucide-react';
import StatCard from '../components/StatCard';
import KitchenStatusBar from '../components/KitchenStatusBar';
import { OrderStatus, Order, Expense, MenuItem, ItemStatus, PaymentMethod } from '../types';
import { shareOnWhatsApp } from '../lib/communicationUtils';
import { useOrders } from '../hooks/useOrders';
import { useMenu } from '../hooks/useMenu';
import { useSettings } from '../hooks/useSettings';
import { SystemSettings } from '../types/systemSettings';

interface DashboardProps {
  onNewOrder: () => void;
  onEditOrder: (order: Order, step?: 1 | 2) => void;
  onUpdateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onNewOrder,
  onEditOrder,
  onUpdateItemStatus,
  setActiveTab
}) => {
  const { orders: ordersData } = useOrders();
  const orders = Array.isArray(ordersData) ? ordersData : [];
  const { menuItems } = useMenu();
  const { settings, loading: settingsLoading } = useSettings();
  const activeOrders = orders.filter(o => o.status === 'ACTIVE' && !o.isCancelled);
  const expenses: Expense[] = []; // TODO: Integrate with API when available

  const filters = ['Today', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
  const [perfFilter, setPerfFilter] = useState('Today');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  const filterStartTime = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    switch (perfFilter) {
      case 'Today': return startOfToday;
      case 'Weekly': return now.getTime() - (7 * 24 * 60 * 60 * 1000);
      case 'Monthly': return now.getTime() - (30 * 24 * 60 * 60 * 1000);
      case 'Quarterly': return now.getTime() - (90 * 24 * 60 * 60 * 1000);
      case 'Yearly': return now.getTime() - (365 * 24 * 60 * 60 * 1000);
      default: return startOfToday;
    }
  }, [perfFilter]);

  const normalizeOrder = (order: Order): Order => {

    return {

      ...order,

      totalAmount: order.totalAmount ?? 0,

      gstAmount: order.gstAmount ?? 0,

      items: order.items ?? [],

      customerName: order.customerName ?? null,

      createdAt: order.createdAt,

    };

  };

  const kpis = useMemo(() => {
    const normalizedOrders = orders.map(normalizeOrder);

    // Filter orders based on the timeframe
    const filteredOrders = normalizedOrders.filter(o => 
      !o.isCancelled && 
      new Date(o.createdAt).getTime() >= filterStartTime
    );

    const completedOrders = filteredOrders.filter(
      o => o.status === OrderStatus.COMPLETED
    );

    const sales = completedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    const totalExpenses =
      expenses.reduce(
        (sum, e) => sum + (e.amount || 0),
        0
      );

    const orderCount =
      completedOrders.length;

    const avgOrder =
      orderCount > 0
        ? sales / orderCount
        : 0;

    const cashSales =
      completedOrders
        .filter(o => o.paymentMethod === PaymentMethod.CASH)
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const bankSales =
      completedOrders
        .filter(o => o.paymentMethod !== PaymentMethod.CASH)
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const cashSplit =
      settings?.expenseCashSplit ?? 0.3;

    const bankSplit =
      1 - cashSplit;

    const cashBalance =
      cashSales - totalExpenses * cashSplit;

    const bankBalance =
      bankSales - totalExpenses * bankSplit;

    const totalBalance =
      cashBalance + bankBalance;

    const profit =
      sales - totalExpenses;

    return {
      sales,
      expenses: totalExpenses,
      orders: orderCount,
      avgOrder,
      cashBalance,
      bankBalance,
      totalBalance,
      profit,
    };
  }, [orders, expenses, filterStartTime, settings]);

  // Safe currency formatter
  const currency = settings?.currencySymbol || "₹";

  const formatCurrency = (amount?: number | null) =>
    `${currency}${(amount || 0).toLocaleString("en-IN")}`;

  const itemRankings = useMemo(() => {
    const periodOrders = orders.filter(o =>
      !o.isCancelled &&
      new Date(o.createdAt).getTime() >= filterStartTime &&
      o.status === OrderStatus.COMPLETED
    );

    const counts: Record<string, { id: string, name: string, quantity: number, category: string }> = {};

    periodOrders.forEach(order => {
      order.items.forEach(item => {
        if (!counts[item.id]) {
          const menuInfo = menuItems.find(mi => mi.id === item.id);
          counts[item.id] = {
            id: item.id,
            name: item.name,
            quantity: 0,
            category: menuInfo?.category || 'General'
          };
        }
        counts[item.id].quantity += item.quantity;
      });
    });

    const sorted = Object.values(counts).sort((a, b) => b.quantity - a.quantity);

    return {
      top: sorted.slice(0, 3),
      worst: sorted.length > 3 ? sorted.slice(-3).reverse() : []
    };
  }, [orders, menuItems, filterStartTime]);

  const recentSales = useMemo(() => {
    return orders
      .map(normalizeOrder)
      .filter(o => !o.isCancelled)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 8);
  }, [orders]);

  // Show loading state while settings are being fetched
  if (settingsLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D17842] mx-auto mb-4"></div>
          <p className="text-[#8E8E93] font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 max-w-full overflow-x-hidden relative pb-24">

      {/* Balance Breakdown Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs md:max-w-sm rounded-[40px] shadow-2xl overflow-hidden border border-[#F1E7E1] animate-in zoom-in duration-300 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight">Balance Breakdown</h3>
              <button onClick={() => setShowBalanceModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-orange-50 rounded-[24px] flex items-center justify-between border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-[#D17842] shadow-sm">
                    <Wallet size={20} />
                  </div>
                  <span className="text-xs font-black uppercase text-[#D17842] tracking-widest">In Cash</span>
                </div>
                <span className={`text-lg font-black ${kpis.cashBalance < 0 ? 'text-red-500' : 'text-[#1C1C1E]'}`}>
                  {settings.currencySymbol} {kpis.cashBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-5 bg-blue-50 rounded-[24px] flex items-center justify-between border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-[#4285F4] shadow-sm">
                    <Landmark size={20} />
                  </div>
                  <span className="text-xs font-black uppercase text-[#4285F4] tracking-widest">In Bank</span>
                </div>
                <span className={`text-lg font-black ${kpis.bankBalance < 0 ? 'text-red-500' : 'text-[#1C1C1E]'}`}>
                  {settings.currencySymbol} {kpis.bankBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-medium italic">
              Note: Expenses are proportionally distributed ({(settings.expenseCashSplit * 100).toFixed(0)}% Cash, {((1 - settings.expenseCashSplit) * 100).toFixed(0)}% Bank) across accounts for liquidity modeling.
            </p>

            <div className="pt-4 border-t border-dashed border-[#F1E7E1] flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Liquidity</span>
              <span className={`text-2xl font-black ${kpis.totalBalance < 0 ? 'text-red-500' : 'text-[#1C1C1E]'}`}>
                {settings.currencySymbol} {kpis.totalBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-[#F1E7E1] animate-in zoom-in duration-300 relative">
            <button onClick={() => setSelectedReceiptOrder(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors z-20"><X size={20} /></button>
            <div className={`p-8 md:p-12 space-y-8 ${selectedReceiptOrder.isCancelled ? 'opacity-60 grayscale-[0.4]' : ''}`}>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-4 bg-orange-50 text-[#D17842] rounded-3xl mb-2">
                  <Receipt size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">{settings.restaurantName}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{settings.address}</p>
              </div>

              <div className="border-y-2 border-dashed border-[#F1E7E1] py-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Order ID</p>
                    <p className="text-sm font-black text-[#1C1C1E]">{selectedReceiptOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Timestamp</p>
                    <p className="text-sm font-black text-[#1C1C1E]">{new Date(selectedReceiptOrder.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedReceiptOrder.items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1C1C1E]">{item.quantity}x {item.name}</p>
                        {item.variantName && <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-50 px-1.5 rounded">{item.variantName}</span>}
                      </div>
                      <p className="text-sm font-black">₹ {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹ {(selectedReceiptOrder.totalAmount - selectedReceiptOrder.gstAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                  <span>Tax (GST {selectedReceiptOrder.gstPercentage}%)</span>
                  <span>₹ {selectedReceiptOrder.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t-2 border-[#1C1C1E]">
                  <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-[#D17842]">₹ {selectedReceiptOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-4">
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Paid via {selectedReceiptOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => window.print()} className="py-4 bg-[#F9F5F2] text-[#1C1C1E] rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"><Printer size={18} /> Print Bill</button>
                <button onClick={() => shareOnWhatsApp(selectedReceiptOrder, settings, 'SETTLE')} className="py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"><MessageCircle size={18} fill="currentColor" strokeWidth={0} /> WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 px-1">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#1C1C1E] leading-tight tracking-tight">Overview</h2>
          <p className="text-[#8E8E93] text-sm font-medium">Performance summary for {perfFilter}.</p>
        </div>

        <div className="relative mt-1">
          <select
            value={perfFilter}
            onChange={(e) => setPerfFilter(e.target.value)}
            className="appearance-none bg-white border border-[#F1E7E1] text-[10px] font-black uppercase tracking-widest rounded-2xl pl-4 pr-10 py-2.5 outline-none shadow-sm hover:border-[#D17842] transition-all cursor-pointer min-w-[120px] text-center"
          >
            {filters.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 px-1">
        <StatCard label="Revenue" value={formatCurrency(kpis.sales)} icon={IndianRupee} colorVariant="orange" />
        <StatCard label="Expenses" value={formatCurrency(kpis.expenses)} icon={TrendingDown} isPositive={false} colorVariant="purple" />
        <StatCard label="Orders" value={kpis.orders} icon={ShoppingBag} colorVariant="blue" />
        <StatCard label="Avg Order" value={formatCurrency(kpis.avgOrder)} icon={Calculator} colorVariant="green" />
        <StatCard label="Balance" value={formatCurrency(kpis.totalBalance)} icon={Wallet} colorVariant="orange" onClick={() => setShowBalanceModal(true)} />
        <StatCard label="Net Profit" value={formatCurrency(kpis.profit)} icon={TrendingUp} isPositive={kpis.profit >= 0} colorVariant="green" />
      </div>

      <KitchenStatusBar />

      {activeOrders.length > 0 && (
        <div className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2">
              <Clock className="text-[#D17842]" size={20} /> Running Tabs
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {activeOrders.map((order) => (
              <div key={order.id} className="min-w-[280px] bg-white rounded-[32px] border border-[#F1E7E1] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#D17842] transition-all">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase text-[#8E8E93]">Table {order.tableNumber || 'N/A'}</span>
                    <span className="text-[10px] font-black uppercase text-[#D17842]">{order.id.split('-').pop()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-[#1C1C1E]">{order.customerName || 'Guest'}</h4>
                      <p className="text-xs font-bold text-gray-400">{order.items.length} items ordered</p>
                    </div>
                    <div className="flex gap-2">
                      {order.customerPhone && (
                        <>
                          <a href={`tel:${order.customerPhone}`} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:scale-110 active:scale-90 transition-all"><Phone size={18} /></a>
                          {settings.whatsappEnabled && (
                            <button onClick={() => shareOnWhatsApp(order, settings, 'CONFIRM')} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:scale-110 transition-transform active:scale-90">
                              <MessageCircle size={18} fill="currentColor" strokeWidth={0} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#F1E7E1]">
                  <span className="text-xl font-black text-[#1C1C1E]">{formatCurrency(order.totalAmount)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => onEditOrder(order, 1)} className="p-2 bg-orange-50 text-[#D17842] rounded-xl hover:scale-110 active:scale-95 transition-all"><Plus size={18} strokeWidth={3} /></button>
                    <button onClick={() => onEditOrder(order, 2)} className="p-2 bg-[#1C1C1E] text-white rounded-xl hover:scale-110 active:scale-95 transition-all"><CreditCard size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 px-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight">Recent Sales</h3>
          <button onClick={() => setActiveTab('orders')} className="text-[#D17842] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">View History <ChevronRight size={14} /></button>
        </div>

        <div className="bg-white rounded-[32px] border border-[#F1E7E1] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FDFCFB] border-b border-[#F1E7E1]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Order Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8E8E93] uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8E8E93] uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1E7E1]">
                {recentSales.map((order) => (
                  <tr key={order.id} className={`hover:bg-[#F9F5F2]/50 transition-colors group ${order.isCancelled ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black text-[#D17842] uppercase ${order.isCancelled ? 'line-through' : ''}`}>{order.id}</span>
                      <p className="text-[9px] text-[#8E8E93] font-bold mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className={`text-sm font-bold text-[#1C1C1E] ${order.isCancelled ? 'line-through' : ''}`}>{order.customerName
                        ? order.customerName
                        : order.orderType === "DINE_IN"
                          ? `Table ${order.tableNumber || "N/A"}`
                          : order.orderType.replace("_", " ")
                      }</p>
                      <p className="text-[10px] text-[#8E8E93] font-medium uppercase tracking-tighter">{order.orderType}</p>
                    </td>
                    <td className={`px-6 py-5 font-black text-[#1C1C1E] text-sm ${order.isCancelled ? 'line-through opacity-50' : ''}`}>{settings.currencySymbol} {order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${order.isCancelled ? 'bg-red-50 text-red-400' : order.status === OrderStatus.COMPLETED ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {order.isCancelled ? 'Reverted' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {order.customerPhone && !order.isCancelled && (
                          <>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm"
                              title="Call Customer"
                            >
                              <Phone size={16} />
                            </a>
                            <button
                              onClick={() => shareOnWhatsApp(order, settings, order.status === OrderStatus.COMPLETED ? 'SETTLE' : 'CONFIRM')}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm"
                              title="WhatsApp Alert"
                            >
                              <MessageCircle size={16} fill="currentColor" strokeWidth={0} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="p-2 bg-orange-50 text-[#D17842] rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm"
                          title="View Receipt"
                        >
                          <Receipt size={16} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2">
            <Flame className="text-orange-500" size={20} /> Hot Sellers ({perfFilter})
          </h3>
          <div className="bg-white rounded-[32px] border border-[#F1E7E1] p-2 shadow-sm space-y-1">
            {itemRankings.top.length > 0 ? itemRankings.top.map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex items-center justify-between p-4 hover:bg-[#F9F5F2]/50 rounded-[24px] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-orange-100 text-[#D17842]' : 'bg-gray-100 text-gray-500'}`}>
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1C1C1E]">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#1C1C1E]">{item.quantity}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Sold</p>
                </div>
              </div>
            )) : (
              <p className="p-8 text-center text-[10px] font-black uppercase text-gray-400">No data for this period</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} /> Underperformers ({perfFilter})
          </h3>
          <div className="bg-white rounded-[32px] border border-[#F1E7E1] p-2 shadow-sm space-y-1">
            {itemRankings.worst.length > 0 ? itemRankings.worst.map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex items-center justify-between p-4 hover:bg-[#F9F5F2]/50 rounded-[24px] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center font-black text-[10px]`}>
                    <TrendingDown size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1C1C1E]">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-500">{item.quantity}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Sold</p>
                </div>
              </div>
            )) : (
              <p className="p-8 text-center text-[10px] font-black uppercase text-gray-400">No data for this period</p>
            )}
          </div>
        </div>
      </div>

      <button onClick={onNewOrder} className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[60] flex items-center gap-2 bg-[#D17842] text-white px-6 py-4 rounded-full font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-orange-300 hover:scale-110 active:scale-95 group">
        <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
        <span className="hidden sm:inline">New Order</span>
      </button>
    </div>
  );
};

export default Dashboard;
