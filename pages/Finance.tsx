
import React, { useState, useMemo } from 'react';
import { 
  Wallet, ScrollText, IndianRupee, Search, FileSpreadsheet, 
  ChevronDown, ArrowRightLeft, Landmark as BankIcon, Download, 
  Tag, X, FilterX, Briefcase, BookOpen, Printer, FileType, 
  ArrowUpRight, ArrowDownRight, SearchCode, Calendar
} from 'lucide-react';
import { Order, Expense, PaymentMethod, OrderStatus, SystemSettings } from '../types';
import { exportToCSV } from '../lib/exportUtils';
import StatCard from '../components/StatCard';

interface FinanceProps {
  orders: Order[];
  expenses: Expense[];
  settings: SystemSettings;
}

type BookType = 'day' | 'cash' | 'bank' | 'vendors';
type SeasonFilter = 'all' | '2021-22' | '2022-23' | '2023-24' | '2024-25' | '2025-26';
type LedgerType = 'category' | 'vendor';
type SearchCategory = 'all' | 'name' | 'description' | 'id' | 'amount' | 'category';

interface FinanceFilters {
  season: SeasonFilter;
  startDate: string;
  endDate: string;
  searchTerm: string;
  searchCategory: SearchCategory;
  ledgerType: LedgerType;
  ledgerValue: string;
}

const Finance: React.FC<FinanceProps> = ({ orders, expenses, settings }) => {
  const [activeBook, setActiveBook] = useState<BookType>('day');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  
  const [filters, setFilters] = useState<FinanceFilters>({
    season: 'all',
    startDate: '',
    endDate: '',
    searchTerm: '',
    searchCategory: 'all',
    ledgerType: 'category',
    ledgerValue: 'all'
  });

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) newExpanded.delete(date);
    else newExpanded.add(date);
    setExpandedDates(newExpanded);
  };

  const allTransactions = useMemo(() => {
    const txs = [
      ...orders.map(o => {
        const d = new Date(o.createdAt);
        return {
          id: o.id,
          timestamp: o.createdAt,
          date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          title: o.customerName || 'Walk-in Sale',
          contact: o.customerPhone || '',
          description: o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
          category: 'Food Sales',
          vendor: 'Walk-in',
          income: (o.status === OrderStatus.COMPLETED && !o.isCancelled) ? o.totalAmount : 0,
          expense: 0,
          method: o.paymentMethod,
          ref: o.id,
          type: 'Order',
          orderType: o.orderType,
          table: o.tableNumber || 'N/A',
          subtotal: o.totalAmount - o.gstAmount,
          tax: o.gstAmount,
          isAdvance: 'No',
          isUnpaid: 'No',
          isCancelled: o.isCancelled,
          cancellationReason: o.cancellationReason
        };
      }),
      ...expenses.map(e => {
        return {
          id: e.id,
          timestamp: `${e.date}T12:00:00Z`,
          date: e.date,
          title: e.title,
          contact: '',
          description: e.title,
          category: e.category,
          vendor: e.title.split(' ')[0],
          income: 0,
          expense: !e.isCancelled ? e.amount : 0,
          method: e.paymentMethod,
          ref: e.id,
          type: 'Expense',
          orderType: 'N/A',
          table: 'N/A',
          subtotal: e.amount,
          tax: 0,
          isAdvance: e.isAdvance ? 'Yes' : 'No',
          isUnpaid: e.isUnpaid ? 'Yes' : 'No',
          isCancelled: e.isCancelled,
          cancellationReason: e.cancellationReason
        };
      })
    ];
    return txs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [orders, expenses]);

  const uniqueCategories = useMemo(() => Array.from(new Set(allTransactions.map(t => t.category))).sort(), [allTransactions]);
  const uniqueVendors = useMemo(() => Array.from(new Set(allTransactions.filter(t => t.vendor !== 'Walk-in').map(t => t.vendor))).sort(), [allTransactions]);

  const dailyBooks = useMemo(() => {
    if (activeBook === 'vendors') return [];
    
    const groupedAll: Record<string, { date: string; income: number; expense: number; txs: any[] }> = {};
    
    allTransactions.forEach(t => {
      if (activeBook === 'cash' && t.method !== PaymentMethod.CASH) return;
      if (activeBook === 'bank' && t.method === PaymentMethod.CASH) return;

      if (!groupedAll[t.date]) {
        groupedAll[t.date] = { date: t.date, income: 0, expense: 0, txs: [] };
      }
      groupedAll[t.date].income += t.income;
      groupedAll[t.date].expense += t.expense;
      groupedAll[t.date].txs.push(t);
    });

    const sortedDates = Object.keys(groupedAll).sort((a, b) => a.localeCompare(b));
    
    let currentBalance = 0;
    const computedDays = sortedDates.map(date => {
      const day = groupedAll[date];
      const opening = currentBalance;
      const closing = opening + day.income - day.expense;
      currentBalance = closing;
      return { ...day, opening, closing };
    });

    let result = computedDays;

    if (filters.season !== 'all') {
      const [startYearStr] = filters.season.split('-');
      const startYear = parseInt(startYearStr);
      const start = `${startYear}-04-01`;
      const end = `${startYear + 1}-03-31`;
      result = result.filter(d => d.date >= start && d.date <= end);
    }

    if (filters.startDate) result = result.filter(d => d.date >= filters.startDate);
    if (filters.endDate) result = result.filter(d => d.date <= filters.endDate);

    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      result = result.filter(day => 
        day.txs.some(t => {
          const totalAmount = (t.income + t.expense).toString();
          switch (filters.searchCategory) {
            case 'name': return t.title.toLowerCase().includes(q) || t.contact.includes(q);
            case 'description': return t.description.toLowerCase().includes(q);
            case 'id': return t.ref.toLowerCase().includes(q);
            case 'amount': return totalAmount.includes(q);
            case 'category': return t.category.toLowerCase().includes(q);
            default:
              return t.title.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || totalAmount.includes(q) || t.contact.includes(q);
          }
        })
      );
    }

    return result.reverse(); 
  }, [allTransactions, activeBook, filters]);

  const filteredTxsForVendor = useMemo(() => {
    if (activeBook !== 'vendors' || filters.ledgerValue === 'all') return [];
    
    return allTransactions.filter(t => {
      const matchesLedger = filters.ledgerType === 'category' 
        ? t.category === filters.ledgerValue 
        : t.vendor === filters.ledgerValue;

      if (!matchesLedger) return false;

      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;

      if (filters.searchTerm) {
        const q = filters.searchTerm.toLowerCase();
        const totalAmount = (t.income + t.expense).toString();
        const matchesSearch = t.title.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || totalAmount.includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allTransactions, activeBook, filters]);

  const totals = useMemo(() => {
    const txsToSum = activeBook === 'vendors' ? filteredTxsForVendor : allTransactions.filter(t => {
      if (activeBook === 'cash' && t.method !== PaymentMethod.CASH) return false;
      if (activeBook === 'bank' && t.method === PaymentMethod.CASH) return false;
      
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      
      return true;
    });

    const inc = txsToSum.reduce((s, t) => s + t.income, 0);
    const exp = txsToSum.reduce((s, t) => s + t.expense, 0);
    return { income: inc, expense: exp, balance: inc - exp, count: txsToSum.length };
  }, [allTransactions, activeBook, filters, filteredTxsForVendor]);

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const dataToExport = activeBook === 'vendors' 
      ? filteredTxsForVendor 
      : dailyBooks.flatMap(day => day.txs);

    const flatData = dataToExport.map(t => ({
      Date: t.date,
      Time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      'Transaction ID': t.ref,
      'Name / Entity': t.title,
      Contact: t.contact,
      Narration: t.description,
      Category: t.category,
      'Payment Mode': t.method,
      Subtotal: t.subtotal,
      'GST Amount': t.tax,
      Income: t.income,
      Expense: t.expense,
      'Final Amount': t.income + t.expense,
      'Record Type': t.type,
      'Order Type': t.orderType,
      'Table No': t.table,
      'Advance Flag': t.isAdvance,
      'Unpaid Flag': t.isUnpaid,
      Status: t.isCancelled ? 'Reverted' : 'Active',
      'Revert Reason': t.cancellationReason || ''
    }));
    
    exportToCSV(flatData, `${activeBook}_Financial_Ledger`);
    setShowDownloadPopup(false);
  };

  const handleClearFilters = () => {
    setFilters({
      season: 'all',
      startDate: '',
      endDate: '',
      searchTerm: '',
      searchCategory: 'all',
      ledgerType: 'category',
      ledgerValue: 'all'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 relative max-w-7xl mx-auto px-4 md:px-0">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h2 className="text-2xl md:text-3xl font-black text-[#5C3D2E] tracking-tight">Accounts & Ledgers</h2>
        <div className="flex overflow-x-auto no-scrollbar bg-gray-100/80 p-1 rounded-2xl border border-gray-200 shadow-inner w-full lg:w-auto">
          {['day', 'cash', 'bank', 'vendors'].map((id) => (
            <button key={id} onClick={() => setActiveBook(id as BookType)} className={`flex-1 lg:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeBook === id ? 'bg-white text-[#1C1C1E] shadow-md' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}>
              {id === 'vendors' ? 'Cat & Vendors' : id.charAt(0).toUpperCase() + id.slice(1) + ' Book'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Income" value={`${settings.currency}${totals.income.toLocaleString('en-IN')}`} icon={ArrowUpRight} colorVariant="green" />
        <StatCard label="Expense" value={`${settings.currency}${totals.expense.toLocaleString('en-IN')}`} icon={ArrowDownRight} colorVariant="purple" />
        <StatCard label="Net" value={`${settings.currency}${totals.balance.toLocaleString('en-IN')}`} icon={ArrowRightLeft} colorVariant="orange" isPositive={totals.balance >= 0} />
        <StatCard label="Entries" value={totals.count} icon={Tag} colorVariant="blue" />
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-[24px] md:rounded-[32px] p-5 md:p-8 space-y-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 items-end">
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">Search Records</label>
            <div className="flex gap-1">
              <div className="relative w-24 md:w-32 shrink-0">
                <select value={filters.searchCategory} onChange={e => setFilters({...filters, searchCategory: e.target.value as SearchCategory})} className="w-full pl-2 md:pl-3 pr-6 md:pr-8 py-3.5 rounded-l-xl bg-gray-50 border border-[#E5E7EB] border-r-0 font-bold text-[9px] md:text-[10px] uppercase tracking-widest text-[#4B5563] appearance-none outline-none">
                  <option value="all">All</option>
                  <option value="name">Name</option>
                  <option value="description">Desc</option>
                  <option value="id">ID</option>
                  <option value="amount">Amt</option>
                  <option value="category">Cat</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder={filters.searchCategory === 'all' ? "Search..." : `${filters.searchCategory}...`} value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} className="w-full pl-9 md:pl-11 pr-5 py-3.5 rounded-r-xl bg-white border border-[#E5E7EB] font-bold text-xs md:text-sm text-[#1C1C1E] shadow-sm outline-none focus:ring-2 focus:ring-[#D17842]/20" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">Season</label>
            <div className="relative">
              <select value={filters.season} onChange={e => setFilters({...filters, season: e.target.value as SeasonFilter})} className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-xs md:text-sm text-[#1C1C1E] appearance-none shadow-sm focus:ring-2 focus:ring-[#D17842] outline-none">
                <option value="all">All Seasons</option>
                {['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">From</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full px-3 md:px-4 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-[10px] md:text-xs text-[#1C1C1E] shadow-sm outline-none" />
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">To</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full px-3 md:px-4 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-[10px] md:text-xs text-[#1C1C1E] shadow-sm outline-none" />
          </div>

          <div className="lg:col-span-2 flex items-center gap-2 pb-1">
            <button onClick={handleClearFilters} className="flex-1 p-3.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center" title="Clear Filters">
              <FilterX size={20} />
            </button>
            <div className="relative flex-1">
              <button onClick={() => setShowDownloadPopup(!showDownloadPopup)} className="w-full p-3.5 bg-[#1C1C1E] text-white rounded-xl shadow-lg active:scale-95 transition-all hover:bg-black flex items-center justify-center">
                <Download size={20} />
              </button>
              {showDownloadPopup && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowDownloadPopup(false)} />
                  <div className="absolute right-0 bottom-full mb-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-[70] animate-in slide-in-from-bottom-2 duration-300">
                    <p className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 mb-2">Formats</p>
                    <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl text-xs font-bold text-[#1C1C1E]"><div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><FileSpreadsheet size={16} /></div> CSV</button>
                    <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl text-xs font-bold text-[#1C1C1E]"><div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><FileType size={16} /></div> Excel</button>
                    <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl text-xs font-bold text-[#1C1C1E]"><div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><Printer size={16} /></div> PDF</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        {activeBook === 'vendors' ? (
          <div className="space-y-6">
            <div className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-[24px] p-6 md:p-8 space-y-4">
              <h3 className="text-base md:text-lg font-black text-[#1E40AF]">Generate Ledger</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="lt" checked={filters.ledgerType === 'category'} onChange={() => setFilters({...filters, ledgerType: 'category', ledgerValue: 'all'})} className="w-4 h-4 accent-[#1E40AF]" />
                    <span className="text-sm font-bold text-[#4B5563]">Category</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="lt" checked={filters.ledgerType === 'vendor'} onChange={() => setFilters({...filters, ledgerType: 'vendor', ledgerValue: 'all'})} className="w-4 h-4 accent-[#1E40AF]" />
                    <span className="text-sm font-bold text-[#4B5563]">Vendor</span>
                  </label>
                </div>
                <div className="relative flex-1 w-full md:max-w-sm">
                  <select value={filters.ledgerValue} onChange={e => setFilters({...filters, ledgerValue: e.target.value})} className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-[#BBDEFB] font-bold text-sm text-[#1C1C1E] appearance-none shadow-sm focus:border-[#1E40AF] outline-none">
                    <option value="all">-- Choose an option --</option>
                    {(filters.ledgerType === 'category' ? uniqueCategories : uniqueVendors).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {filters.ledgerValue !== 'all' ? (
              <div className="bg-white rounded-[24px] md:rounded-[40px] border border-[#F1E7E1] shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#F1E7E1]">
                      <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black text-[#4B5563] uppercase tracking-widest">Date</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black text-[#4B5563] uppercase tracking-widest">Description</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black text-[#4B5563] uppercase tracking-widest text-right">Amount (₹)</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] md:text-[11px] font-black text-[#4B5563] uppercase tracking-widest">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {filteredTxsForVendor.map(tx => (
                      <tr key={tx.id} className={`hover:bg-gray-50/50 ${tx.isCancelled ? 'opacity-40 grayscale' : ''}`}>
                        <td className="px-6 md:px-8 py-6 text-xs md:text-sm font-medium">{new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 md:px-8 py-6">
                          <p className={`text-xs md:text-sm font-bold text-[#111827] ${tx.isCancelled ? 'line-through' : ''}`}>{tx.title}</p>
                          <p className="text-[10px] md:text-[11px] font-medium text-[#4285F4]">(Ref: {tx.ref})</p>
                          {tx.isCancelled && <p className="text-[8px] text-red-500 font-black uppercase mt-1">Reverted</p>}
                        </td>
                        <td className={`px-6 md:px-8 py-6 text-right font-black text-xs md:text-sm ${tx.isCancelled ? 'line-through opacity-40' : ''}`}>{(tx.income + tx.expense).toLocaleString('en-IN')}</td>
                        <td className="px-6 md:px-8 py-6 text-xs md:text-sm font-bold text-[#4B5563]">{tx.method}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F9FAFB] font-black border-t-2 border-[#F1E7E1]">
                      <td colSpan={2} className="px-6 md:px-8 py-6 text-right uppercase text-[9px] md:text-[11px] tracking-widest">Total:</td>
                      <td className="px-6 md:px-8 py-6 text-right text-base md:text-lg text-[#111827]">{(totals.income + totals.expense).toLocaleString('en-IN')}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="py-24 md:py-32 text-center bg-white rounded-[32px] border-2 border-dashed border-[#E5E7EB]">
                <BookOpen size={40} className="mx-auto text-blue-200 mb-6" />
                <h3 className="text-lg md:text-xl font-black text-[#1F2937]">Ledger Registry</h3>
                <p className="text-xs md:text-sm text-gray-400 mt-2 px-6">Choose a Category or Vendor above to generate a statement.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] md:rounded-[40px] border border-[#F1E7E1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-[#FDFCFB] border-b border-[#F1E7E1]">
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Date / Ledger Event</th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-center">Opening</th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-right">Income (+)</th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-right">Expense (-)</th>
                    <th className="px-6 md:px-8 py-5 text-[9px] md:text-[10px] font-black text-[#6B7280] uppercase tracking-widest text-right">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E7E1]">
                  {dailyBooks.map((day) => {
                    const isExpanded = expandedDates.has(day.date);
                    return (
                      <React.Fragment key={day.date}>
                        <tr onClick={() => toggleDate(day.date)} className={`cursor-pointer hover:bg-gray-50/80 transition-all ${isExpanded ? 'bg-orange-50/30' : ''}`}>
                          <td className="px-6 md:px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl transition-transform ${isExpanded ? 'rotate-180 bg-[#1C1C1E] text-white' : 'bg-[#F9F5F2] text-gray-400'}`}><ChevronDown size={18} /></div>
                              <div>
                                <p className="text-xs md:text-sm font-black text-[#1C1C1E]">{new Date(day.date.replace(/-/g, '/')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">{day.txs.length} Transactions</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-center">
                            <span className="text-[10px] md:text-xs font-bold text-[#4285F4]">₹{day.opening.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-right">
                            <span className="text-xs md:text-sm font-black text-green-600">+{settings.currency}{day.income.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-right">
                            <span className="text-xs md:text-sm font-black text-red-500">-{settings.currency}{day.expense.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="px-6 md:px-8 py-6 text-right">
                            <span className="text-xs md:text-sm font-black text-[#1C1C1E]">{settings.currency}{day.closing.toLocaleString('en-IN')}</span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="bg-[#F9F5F2]/40 px-4 md:px-8 py-6 space-y-4 border-t border-gray-100">
                              <div className="hidden lg:block overflow-x-auto no-scrollbar">
                                <div className="min-w-[1000px]">
                                  <div className="grid grid-cols-7 gap-4 text-[9px] font-black uppercase text-gray-400 px-4 pb-2 border-b mb-4">
                                    <div className="text-left">Date</div>
                                    <div className="text-left">Transaction ID</div>
                                    <div className="text-left">Name</div>
                                    <div className="text-left">Narration</div>
                                    <div className="text-left">Category</div>
                                    <div className="text-center">Payment Method</div>
                                    <div className="text-right">Amount</div>
                                  </div>
                                  <div className="space-y-3">
                                    {day.txs.map(tx => (
                                      <div key={tx.id} className={`grid grid-cols-7 gap-4 px-6 py-4 bg-white rounded-[20px] shadow-sm border border-gray-100 items-center animate-in slide-in-from-top-2 duration-300 hover:shadow-md transition-shadow ${tx.isCancelled ? 'opacity-40 grayscale' : ''}`}>
                                        <div className="text-[11px] font-black text-[#1C1C1E]">
                                          {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} <br/>
                                          <span className="text-[10px] text-[#D17842] uppercase font-black tracking-tight">
                                            {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                          </span>
                                        </div>
                                        <div className="text-[10px] font-black text-[#1C1C1E] uppercase">
                                          <span className="text-[8px] text-gray-400 font-bold">TX ID</span> <br/>
                                          <span className={tx.isCancelled ? 'line-through' : ''}>{tx.ref}</span>
                                        </div>
                                        <div className="text-[11px] font-black text-[#1C1C1E]">
                                          <span className={tx.isCancelled ? 'line-through' : ''}>{tx.title}</span> <br/>
                                          <span className="text-[9px] text-gray-400 font-bold tracking-tight">{tx.contact}</span>
                                        </div>
                                        <div className={`text-[10px] ${tx.isCancelled ? 'text-red-400 font-black italic' : 'text-[#8E8E93] font-medium'} leading-relaxed line-clamp-2 pr-4`}>
                                          {tx.isCancelled ? `[REVERTED] ${tx.cancellationReason}` : tx.description}
                                        </div>
                                        <div className="text-left">
                                          <span className="text-[8px] font-black uppercase px-2.5 py-1 bg-[#F9F5F2] text-[#6B7280] rounded-md whitespace-nowrap tracking-widest">{tx.category}</span>
                                        </div>
                                        <div className="text-center">
                                          <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-md whitespace-nowrap tracking-widest ${tx.method === PaymentMethod.CASH ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {tx.method}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          {tx.income > 0 ? (
                                            <span className={`text-[13px] font-black text-green-600 ${tx.isCancelled ? 'line-through opacity-40' : ''}`}>+₹{tx.income.toLocaleString('en-IN')}</span>
                                          ) : (
                                            <span className={`text-[13px] font-black text-red-500 ${tx.isCancelled ? 'line-through opacity-40' : ''}`}>-₹{tx.expense.toLocaleString('en-IN')}</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Mobile View for Expanded Daily Book */}
                              <div className="lg:hidden space-y-4">
                                {day.txs.map(tx => (
                                  <div key={tx.id} className={`bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 space-y-3 animate-in fade-in duration-300 ${tx.isCancelled ? 'opacity-40' : ''}`}>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-[9px] font-black text-[#D17842] uppercase tracking-widest">#{tx.ref}</p>
                                        <p className={`text-sm font-black text-[#1C1C1E] ${tx.isCancelled ? 'line-through' : ''}`}>{tx.title}</p>
                                      </div>
                                      <div className="text-right">
                                        {tx.income > 0 ? (
                                          <span className="text-sm font-black text-green-600">+₹{tx.income.toLocaleString('en-IN')}</span>
                                        ) : (
                                          <span className="text-sm font-black text-red-500">-₹{tx.expense.toLocaleString('en-IN')}</span>
                                        )}
                                        <p className="text-[8px] font-bold text-gray-400 mt-0.5">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-gray-100 text-[#6B7280] text-[8px] font-black rounded-md uppercase tracking-tighter">{tx.category}</span>
                                      <span className={`px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-tighter ${tx.method === PaymentMethod.CASH ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{tx.method}</span>
                                    </div>
                                    {tx.isCancelled && (
                                      <p className="text-[9px] font-bold text-red-500 bg-red-50 p-2 rounded-xl border border-red-100 italic">"Reverted: {tx.cancellationReason}"</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              {dailyBooks.length === 0 && (
                <div className="py-24 md:py-32 flex flex-col items-center gap-4 text-center">
                  <div className="p-6 bg-[#FDFCFB] rounded-full text-gray-200"><Search size={64} /></div>
                  <h3 className="text-lg md:text-xl font-black text-[#1C1C1E]">No Book Entries Found</h3>
                  <p className="text-xs text-gray-400">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
