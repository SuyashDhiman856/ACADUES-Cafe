
import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, Plus, X, RefreshCw, FileSpreadsheet,
  CreditCard, Forward, AlertCircle, ChevronDown, Smartphone, 
  Wallet, RotateCcw, AlertTriangle, Settings2, Calendar, 
  Tag, User, ReceiptText, ArrowRight, PlusCircle, CheckCircle2,
  Receipt, Eye, Search, FilterX, Download
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { Expense, PaymentMethod } from '../types';
import { exportToCSV } from '../lib/exportUtils';

interface ExpensesProps {
  tenantId: string;
  expenses: Expense[];
  onCancelExpense: (id: string, reason: string) => void;
  onSettleExpense: (id: string, date: string, method: PaymentMethod) => void;
}

const CANCEL_REASONS = [
  'Wrong Entry / Typo',
  'Duplicate Transaction',
  'Payment Refunded',
  'Transaction Cancelled',
  'Other'
];

const INITIAL_CATEGORIES = ['Raw Materials', 'Utilities', 'Staff', 'Marketing', 'Rent', 'Maintenance'];
const INITIAL_VENDORS = ['Star Kirana', 'Reliance Fresh', 'Dairy Supply', 'Local Hardware'];

type ExpenseQuickFilter = 'All' | 'Paid' | 'Advance' | 'Unpaid';
type SearchCategory = 'all' | 'vendor' | 'category' | 'id' | 'amount' | 'notes';

const Expenses: React.FC<ExpensesProps> = ({ tenantId, expenses, onCancelExpense, onSettleExpense }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [quickFilter, setQuickFilter] = useState<ExpenseQuickFilter>('All');
  const [showSpecialStates, setShowSpecialStates] = useState(false);
  
  // Advanced Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [vendors, setVendors] = useState<string[]>(INITIAL_VENDORS);

  const [cancellingExpense, setCancellingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [settlingExpense, setSettlingExpense] = useState<Expense | null>(null);
  
  const [settleDate, setSettleDate] = useState(new Date().toISOString().split('T')[0]);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>(PaymentMethod.UPI);

  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const [newExpense, setNewExpense] = useState({
    vendor: '',
    newVendor: '',
    category: '',
    newCategory: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    notes: '',
    isAdvance: false,
    isUnpaid: false
  });

  const stats = useMemo(() => {
    const activeExps = expenses.filter(e => !e.isCancelled);
    const total = activeExps.reduce((sum, e) => sum + e.amount, 0);
    const paid = activeExps.filter(e => !e.isUnpaid).reduce((sum, e) => sum + e.amount, 0);
    const advance = activeExps.filter(e => e.isAdvance).reduce((sum, e) => sum + e.amount, 0);
    const unpaid = activeExps.filter(e => e.isUnpaid).reduce((sum, e) => sum + e.amount, 0);
    
    return { total, paid, advance, unpaid };
  }, [expenses]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = newExpense.category === 'OTHER' ? newExpense.newCategory : newExpense.category;
    const finalVendor = newExpense.vendor === 'OTHER' ? newExpense.newVendor : newExpense.vendor;

    if (!finalCategory || !finalVendor || !newExpense.amount) {
      alert('Please fill in all required fields.');
      return;
    }
    
    setIsSaving(true);
    
    setTimeout(() => {
       if (newExpense.category === 'OTHER' && !categories.includes(newExpense.newCategory)) {
         setCategories(prev => [...prev, newExpense.newCategory].sort());
       }
       if (newExpense.vendor === 'OTHER' && !vendors.includes(newExpense.newVendor)) {
         setVendors(prev => [...prev, newExpense.newVendor].sort());
       }

       setIsSaving(false);
       setIsModalOpen(false);
       
       setNewExpense({
         vendor: '', newVendor: '', category: '', newCategory: '', amount: '', 
         date: new Date().toISOString().split('T')[0], 
         paymentMethod: PaymentMethod.CASH, 
         notes: '',
         isAdvance: false, isUnpaid: false
       });
       setShowSpecialStates(false);
    }, 1000);
  };

  const confirmCancel = () => {
    if (!cancellingExpense) return;
    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    onCancelExpense(cancellingExpense.id, finalReason);
    setCancellingExpense(null);
    setCancelReason(CANCEL_REASONS[0]);
    setCustomReason('');
  };

  const confirmSettle = () => {
    if (!settlingExpense) return;
    onSettleExpense(settlingExpense.id, settleDate, settleMethod);
    setSettlingExpense(null);
  };

  const handleExport = () => {
    const data = filteredExpenses.map(e => ({
      ID: e.id,
      Date: e.date,
      Vendor: e.title,
      Category: e.category,
      Amount: e.amount,
      Method: e.isUnpaid ? 'N/A' : e.paymentMethod,
      Status: e.isCancelled ? 'Reverted' : e.isAdvance ? 'Advance' : e.isUnpaid ? 'Unpaid' : 'Standard Paid',
      Reason: e.cancellationReason || ''
    }));
    exportToCSV(data, 'Expense_Report');
  };

  const handleClearFilters = () => {
    setActiveCategoryFilter('All');
    setQuickFilter('All');
    setSearchTerm('');
    setSearchCategory('all');
    setStartDate('');
    setEndDate('');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // 1. Category Filter
      if (activeCategoryFilter !== 'All' && e.category !== activeCategoryFilter) return false;

      // 2. Quick Status Filter
      if (quickFilter === 'Paid' && (e.isUnpaid || e.isCancelled)) return false;
      if (quickFilter === 'Advance' && (!e.isAdvance || e.isCancelled)) return false;
      if (quickFilter === 'Unpaid' && (!e.isUnpaid || e.isCancelled)) return false;

      // 3. Date Range Filter
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;

      // 4. Search Filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const amt = e.amount.toString();
        const vid = e.id.toLowerCase();
        const vendor = e.title.toLowerCase();
        const cat = e.category.toLowerCase();
        const notes = (e.cancellationReason || '').toLowerCase();

        switch (searchCategory) {
          case 'vendor': if (!vendor.includes(q)) return false; break;
          case 'category': if (!cat.includes(q)) return false; break;
          case 'id': if (!vid.includes(q)) return false; break;
          case 'amount': if (!amt.includes(q)) return false; break;
          case 'notes': if (!notes.includes(q)) return false; break;
          default:
            if (!vendor.includes(q) && !cat.includes(q) && !vid.includes(q) && !amt.includes(q) && !notes.includes(q)) return false;
        }
      }

      return true;
    });
  }, [expenses, activeCategoryFilter, quickFilter, searchTerm, searchCategory, startDate, endDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-10">
      
      {/* ⚠️ Revert Entry Modal */}
      {cancellingExpense && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">Revert This Entry?</h3>
                <p className="text-sm font-medium text-gray-400 mt-2 px-4">
                  Amount: <span className="text-red-500 font-bold">₹{cancellingExpense.amount.toLocaleString('en-IN')}</span> will be nullified.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Reason for removal</label>
              <div className="grid grid-cols-1 gap-2">
                {CANCEL_REASONS.map(r => (
                  <button key={r} onClick={() => setCancelReason(r)} className={`px-6 py-4 rounded-2xl text-left text-xs font-bold transition-all border-2 ${cancelReason === r ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCancellingExpense(null)} className="py-4 bg-gray-100 rounded-[24px] font-black uppercase text-[10px] tracking-widest text-gray-400 active:scale-95 transition-all">Dismiss</button>
              <button onClick={confirmCancel} className="py-4 bg-red-500 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* 💰 Settle Payment Modal */}
      {settlingExpense && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">Settle Account</h3>
                <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">Converting to Final Payment</p>
              </div>
              <button onClick={() => setSettlingExpense(null)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
            </div>

            <div className="p-6 bg-green-50 rounded-[32px] border border-green-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Pending Due</p>
                  <p className="text-2xl font-black text-[#1C1C1E]">₹{settlingExpense.amount.toLocaleString('en-IN')}</p>
               </div>
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                  <CheckCircle2 size={24} />
               </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Settlement Date</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-[#F9F5F2] font-bold border-none focus:ring-2 focus:ring-green-400 text-sm shadow-sm" 
                    value={settleDate} 
                    onChange={e => setSettleDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Payment Medium</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    type="button" 
                    onClick={() => setSettleMethod(PaymentMethod.CASH)}
                    className={`flex flex-col items-center gap-2 p-6 rounded-[28px] border-2 transition-all ${settleMethod === PaymentMethod.CASH ? 'bg-white border-green-500 text-green-600 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400'}`}
                   >
                     <Wallet size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
                   </button>
                   <button 
                    type="button" 
                    onClick={() => setSettleMethod(PaymentMethod.UPI)}
                    className={`flex flex-col items-center gap-2 p-6 rounded-[28px] border-2 transition-all ${settleMethod === PaymentMethod.UPI ? 'bg-white border-blue-400 text-blue-600 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400'}`}
                   >
                     <Smartphone size={24} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Bank/UPI</span>
                   </button>
                </div>
              </div>
            </div>

            <button onClick={confirmSettle} className="w-full py-6 bg-[#1C1C1E] text-white rounded-[32px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-4">
              Mark as Paid <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* 🔍 View Details Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-[#1C1C1E]">Expense Receipt</h3>
                <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">#{viewingExpense.id}</p>
              </div>
              <button onClick={() => setViewingExpense(null)} className="p-2 bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Vendor</p><p className="text-sm font-bold">{viewingExpense.title}</p></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Category</p><p className="text-sm font-bold">{viewingExpense.category}</p></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Date</p><p className="text-sm font-bold">{new Date(viewingExpense.date).toLocaleDateString('en-IN')}</p></div>
                <div><p className="text-[9px] font-black text-gray-400 uppercase">Method</p><p className="text-sm font-bold">{viewingExpense.isUnpaid ? 'Unpaid / Credit' : viewingExpense.paymentMethod}</p></div>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">Narration</p>
                <p className="text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-2xl italic">"{viewingExpense.cancellationReason || 'No notes available.'}"</p>
              </div>
              <div className="pt-4 border-t border-dashed flex justify-between items-center">
                <span className="text-xs font-black uppercase text-gray-400">Total Charged</span>
                <span className="text-2xl font-black text-[#1C1C1E]">₹{viewingExpense.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={() => setViewingExpense(null)} className="w-full py-4 bg-[#1C1C1E] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Close Preview</button>
          </div>
        </div>
      )}

      {/* 📝 Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-white md:bg-black/40 md:backdrop-blur-md flex flex-col md:items-center md:justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:h-auto md:max-w-xl md:rounded-[48px] md:shadow-2xl overflow-y-auto no-scrollbar animate-in slide-in-from-bottom md:zoom-in duration-300">
            <div className="sticky top-0 bg-white z-10 p-6 md:p-10 pb-4 flex items-center justify-between border-b border-gray-50">
              <div>
                <h3 className="text-2xl font-black text-[#1C1C1E]">Record New Expense</h3>
                <p className="text-[10px] font-black uppercase text-[#D17842] tracking-widest mt-1">Digital Receipt Log</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleAddExpense} className="p-6 md:p-10 pt-6 space-y-8 pb-24 md:pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D17842] font-black text-xl">₹</span>
                    <input required autoFocus type="number" placeholder="0.00" className="w-full pl-12 pr-6 py-6 rounded-[28px] bg-orange-50/50 font-black text-[#D17842] border-none focus:ring-2 focus:ring-[#D17842] text-2xl shadow-sm placeholder:text-[#D17842]/30" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input required type="date" className="w-full pl-14 pr-6 py-6 rounded-[28px] bg-[#F9F5F2] font-bold border-none focus:ring-2 focus:ring-[#D17842] text-sm shadow-sm" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Vendor</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <select required className="w-full pl-14 pr-10 py-5 rounded-[24px] bg-[#F9F5F2] font-bold border-none focus:ring-2 focus:ring-[#D17842] appearance-none text-sm shadow-sm" value={newExpense.vendor} onChange={e => setNewExpense({...newExpense, vendor: e.target.value})}>
                      <option value="">-- Select Vendor --</option>
                      {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                      <option value="OTHER">+ Add New Vendor</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                  {newExpense.vendor === 'OTHER' && (
                    <input required type="text" placeholder="New Vendor Name" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-orange-50/50 border border-orange-200 font-bold text-sm focus:ring-2 focus:ring-[#D17842] mt-2" value={newExpense.newVendor} onChange={e => setNewExpense({...newExpense, newVendor: e.target.value})} />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <select required className="w-full pl-14 pr-10 py-5 rounded-[24px] bg-[#F9F5F2] font-bold border-none focus:ring-2 focus:ring-[#D17842] appearance-none text-sm shadow-sm" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="OTHER">+ Add New Category</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                  {newExpense.category === 'OTHER' && (
                    <input required type="text" placeholder="New Category Name" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-orange-50/50 border border-orange-200 font-bold text-sm focus:ring-2 focus:ring-[#D17842] mt-2" value={newExpense.newCategory} onChange={e => setNewExpense({...newExpense, newCategory: e.target.value})} />
                  )}
                </div>
              </div>

              {/* Payment Method - Hidden for Unpaid */}
              {!newExpense.isUnpaid && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => setNewExpense({...newExpense, paymentMethod: PaymentMethod.CASH})} className={`flex items-center gap-4 p-6 rounded-[28px] border-2 transition-all ${newExpense.paymentMethod === PaymentMethod.CASH ? 'bg-orange-50 border-[#D17842] text-[#D17842] shadow-lg scale-[1.02]' : 'bg-white border-[#F1E7E1] text-gray-400 hover:border-gray-200'}`}>
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${newExpense.paymentMethod === PaymentMethod.CASH ? 'bg-white shadow-sm' : 'bg-gray-50'}`}><Wallet size={24} /></div>
                       <span className="text-xs font-black uppercase tracking-widest">In Cash</span>
                     </button>
                     <button type="button" onClick={() => setNewExpense({...newExpense, paymentMethod: PaymentMethod.UPI})} className={`flex items-center gap-4 p-6 rounded-[28px] border-2 transition-all ${newExpense.paymentMethod === PaymentMethod.UPI ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-lg scale-[1.02]' : 'bg-white border-[#F1E7E1] text-gray-400 hover:border-gray-200'}`}>
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${newExpense.paymentMethod === PaymentMethod.UPI ? 'bg-white shadow-sm' : 'bg-gray-50'}`}><Smartphone size={24} /></div>
                       <span className="text-xs font-black uppercase tracking-widest">UPI / Bank</span>
                     </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Notes / Narration (Optional)</label>
                <div className="relative">
                  <ReceiptText className="absolute left-5 top-5 text-gray-300" size={18} />
                  <textarea rows={2} placeholder="Add any note about this expense..." className="w-full pl-14 pr-6 py-5 rounded-[28px] bg-[#F9F5F2] font-bold border-none focus:ring-2 focus:ring-[#D17842] text-sm shadow-sm" value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} />
                </div>
              </div>

              <div className="pt-2">
                <button type="button" onClick={() => setShowSpecialStates(!showSpecialStates)} className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-[#8E8E93] hover:text-[#1C1C1E] transition-all">
                  <Settings2 size={16} className={showSpecialStates ? 'text-[#D17842]' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{showSpecialStates ? 'Standard Entry' : 'Record State- Advance or Unpaid?'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showSpecialStates ? 'rotate-180' : ''}`} />
                </button>
                {showSpecialStates && (
                  <div className="mt-4 p-6 bg-orange-50/30 border border-[#F1E7E1] rounded-[32px] animate-in slide-in-from-top-2 duration-500">
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setNewExpense({...newExpense, isAdvance: !newExpense.isAdvance, isUnpaid: false})} className={`py-6 rounded-[24px] text-[9px] font-black uppercase tracking-tighter border-2 transition-all flex flex-col items-center gap-2 ${newExpense.isAdvance ? 'bg-white border-blue-400 text-blue-600 shadow-md scale-[1.05]' : 'bg-transparent border-transparent text-gray-300 opacity-60'}`}><Forward size={20} /> Advance</button>
                      <button type="button" onClick={() => setNewExpense({...newExpense, isUnpaid: !newExpense.isUnpaid, isAdvance: false})} className={`py-6 rounded-[24px] text-[9px] font-black uppercase tracking-tighter border-2 transition-all flex flex-col items-center gap-2 ${newExpense.isUnpaid ? 'bg-white border-red-400 text-red-600 shadow-md scale-[1.05]' : 'bg-transparent border-transparent text-gray-300 opacity-60'}`}><CreditCard size={20} /> Unpaid</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-6 md:py-8 bg-gray-100 text-gray-500 rounded-[32px] font-black uppercase text-sm tracking-widest active:scale-95 transition-all">Cancel</button>
                <button disabled={isSaving} className="w-full py-6 md:py-8 bg-[#1C1C1E] text-white rounded-[32px] font-black uppercase text-sm tracking-widest shadow-2xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-4">
                  {isSaving ? <RefreshCw className="animate-spin" size={24} /> : <>Add Expense. <ArrowRight size={20} strokeWidth={3} /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Financial Records</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#D17842] text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all"><Plus size={20} strokeWidth={3} /> Record Expense</button>
        </div>
        <p className="text-[#8E8E93] font-medium text-sm">Comprehensive tracking of business outflows.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <StatCard label="Total Expenditure" value={`₹${stats.total.toLocaleString('en-IN')}`} icon={TrendingDown} colorVariant="orange" onClick={() => setQuickFilter('All')} />
        <StatCard label="Paid Expenditure" value={`₹${stats.paid.toLocaleString('en-IN')}`} icon={Receipt} colorVariant="green" onClick={() => setQuickFilter('Paid')} />
        <StatCard label="Advance Paid" value={`₹${stats.advance.toLocaleString('en-IN')}`} icon={Forward} colorVariant="blue" onClick={() => setQuickFilter('Advance')} />
        <StatCard label="Unpaid Expenditure" value={`₹${stats.unpaid.toLocaleString('en-IN')}`} icon={AlertCircle} colorVariant="purple" onClick={() => setQuickFilter('Unpaid')} isPositive={stats.unpaid === 0} />
      </div>

      {/* Unified Advanced Filters Section */}
      <div className="bg-white border border-[#E0E0E0] rounded-[24px] p-6 md:p-8 space-y-6 mx-1 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* 1. Search Records */}
          <div className="lg:col-span-3 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">Search Records</label>
            <div className="flex gap-1">
              <div className="relative w-24 shrink-0">
                <select value={searchCategory} onChange={e => setSearchCategory(e.target.value as SearchCategory)} className="w-full pl-2 pr-6 py-3.5 rounded-l-xl bg-gray-50 border border-[#E5E7EB] border-r-0 font-bold text-[9px] uppercase tracking-widest text-[#4B5563] appearance-none outline-none">
                  <option value="all">All</option>
                  <option value="vendor">Vendor</option>
                  <option value="category">Category</option>
                  <option value="id">ID</option>
                  <option value="amount">Amt</option>
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder="..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-3.5 rounded-r-xl bg-white border border-[#E5E7EB] font-bold text-xs text-[#1C1C1E] shadow-sm outline-none focus:ring-2 focus:ring-[#D17842]/20" />
              </div>
            </div>
          </div>

          {/* 2. Status Dropdown */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">Status</label>
            <div className="relative">
              <select value={quickFilter} onChange={e => setQuickFilter(e.target.value as ExpenseQuickFilter)} className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-xs text-[#1C1C1E] appearance-none shadow-sm focus:ring-2 focus:ring-[#D17842] outline-none uppercase tracking-widest">
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Advance">Advance</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 3. From */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-xs text-[#1C1C1E] shadow-sm outline-none" />
          </div>

          {/* 4. To */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-xs text-[#1C1C1E] shadow-sm outline-none" />
          </div>

          {/* 5. Categories */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-[#4B5563] px-1">Categories</label>
            <div className="relative">
              <select 
                value={activeCategoryFilter} 
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white border border-[#E5E7EB] font-bold text-[10px] text-[#1C1C1E] appearance-none shadow-sm focus:ring-2 focus:ring-[#D17842] outline-none uppercase tracking-widest"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 6. Download & Clear Icons */}
          <div className="lg:col-span-1 flex items-center gap-2 pb-1">
            <button onClick={handleExport} className="flex-1 h-11 bg-gray-50 text-gray-500 rounded-xl hover:bg-[#1C1C1E] hover:text-white transition-all flex items-center justify-center border border-[#E5E7EB]" title="Download Records">
              <Download size={18} />
            </button>
            <button onClick={handleClearFilters} className="flex-1 h-11 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100" title="Clear Filters">
              <FilterX size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-[#F1E7E1] overflow-hidden shadow-sm mx-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FDFCFB] border-b border-[#F1E7E1]">
                <th className="px-8 py-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Date / Trans ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Person / Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1E7E1]">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className={`hover:bg-[#F9F5F2]/40 transition-colors group ${exp.isCancelled ? 'opacity-40 grayscale' : ''}`}>
                  <td className="px-8 py-7">
                    <p className={`text-xs font-bold text-[#1C1C1E] ${exp.isCancelled ? 'line-through text-gray-400' : ''}`}>{new Date(exp.date).toLocaleDateString('en-IN')}</p>
                    <p className="text-[9px] font-black text-[#D17842] uppercase mt-0.5 tracking-wider">#{exp.id.split('-').pop()}</p>
                  </td>
                  <td className="px-8 py-7">
                    <p className={`text-sm font-black text-[#1C1C1E] ${exp.isCancelled ? 'line-through text-gray-400' : ''}`}>{exp.title}</p>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded">{exp.category}</span>
                  </td>
                  <td className="px-8 py-7">
                    {!exp.isUnpaid ? (
                      <div className="flex items-center gap-2">
                         {exp.paymentMethod === PaymentMethod.CASH ? <Wallet size={14} className="text-orange-400" /> : <Smartphone size={14} className="text-blue-400" />}
                         <span className="text-[10px] font-black uppercase tracking-tight text-gray-500">{exp.paymentMethod}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Pending</span>
                    )}
                  </td>
                  <td className="px-8 py-7 text-center">
                    {exp.isCancelled ? (
                       <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[8px] font-black border border-red-100">REVERTED</span>
                    ) : (
                      <div className="flex justify-center">
                        {exp.isAdvance && <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black tracking-widest border border-blue-100">ADVANCE</span>}
                        {exp.isUnpaid && <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[8px] font-black tracking-widest border border-red-100">UNPAID</span>}
                        {!exp.isAdvance && !exp.isUnpaid && <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black tracking-widest border border-green-100">PAID</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-7 text-right">
                    <p className={`text-base font-black ${exp.isCancelled ? 'line-through text-gray-300' : exp.isUnpaid ? 'text-red-500' : 'text-[#1C1C1E]'}`}>
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </p>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewingExpense(exp)} className="p-2 text-gray-400 hover:text-[#1C1C1E] transition-all active:scale-90" title="View Details"><Eye size={18} /></button>
                      {!exp.isCancelled && (exp.isUnpaid || exp.isAdvance) && (
                        <button onClick={() => setSettlingExpense(exp)} className="w-9 h-9 flex items-center justify-center text-green-500 bg-green-50/50 hover:bg-green-100 rounded-full transition-all active:scale-90 border border-green-200" title="Settle Payment"><CheckCircle2 size={18} strokeWidth={2.5} /></button>
                      )}
                      {!exp.isCancelled && (
                        <button onClick={() => setCancellingExpense(exp)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90" title="Revert Entry"><RotateCcw size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-32 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-[#FDFCFB] rounded-full flex items-center justify-center text-gray-200"><Search size={40} /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">No matching records</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
