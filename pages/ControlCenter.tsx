
import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Building2, Palette, Users, ReceiptIndianRupee, 
  MapPin, Phone, Mail, Image as ImageIcon, CheckCircle2, 
  Plus, Trash2, Edit2, ShieldCheck, Save, RefreshCw, Hash,
  Coins, Wallet, Landmark, X, ChevronRight, Globe, Bell, Camera, 
  Percent, CircleDollarSign, UserPlus, Shield, LogOut, MessageCircle, MessageSquareText
} from 'lucide-react';
import { SystemSettings, StaffMember, UserRole } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useStaff } from '../hooks/useStaff';

type ControlTab = 'general' | 'branding' | 'halls' | 'financials' | 'communication' | 'staff';

interface ControlCenterProps {
  tenantId: string;
  onLogout?: () => void;
}

const ControlCenter: React.FC<ControlCenterProps> = ({ tenantId, onLogout }) => {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { staff, createStaff, updateStaff, deleteStaff } = useStaff();

  const [activeTab, setActiveTab] = useState<ControlTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(settings);
  const [newTableName, setNewTableName] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Sync localSettings when settings are loaded from API
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  // Show loading state while settings are being fetched or localSettings not initialized
  if (settingsLoading || !settings || !localSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D17842] mx-auto mb-4"></div>
          <p className="text-[#8E8E93] font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Staff Management State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<Omit<StaffMember, 'id' | 'createdAt' | 'tenantId'>>({
    name: '',
    phone: '',
    email: '',
    role: UserRole.STAFF,
    permissions: ['dashboard', 'orders']
  });

  const availableModules = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'self-order', label: 'Self Order' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'orders', label: 'Order Logs' },
    { id: 'menu', label: 'Menu Mgmt' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'customers', label: 'CRM' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Control Center' },
  ];

  const handleTogglePermission = (moduleId: string) => {
    setStaffForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(moduleId)
        ? prev.permissions.filter(id => id !== moduleId)
        : [...prev.permissions, moduleId]
    }));
  };

  const handleSaveStaff = () => {
    if (!staffForm.name || !staffForm.phone || !staffForm.email) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, staffForm);
    } else {
      createStaff({
        name: staffForm.name,
        phone: staffForm.phone,
        email: staffForm.email,
        role: staffForm.role,
        permissions: staffForm.permissions
      });
    }

    setIsStaffModalOpen(false);
    setEditingStaff(null);
    setStaffForm({ name: '', phone: '', email: '', role: UserRole.STAFF, permissions: ['dashboard', 'orders'] });
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Delete this staff member?')) {
      deleteStaff(id);
    }
  };

  const tabs: { id: ControlTab; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'halls', label: 'Tables / Venues', icon: MapPin },
    { id: 'financials', label: 'Financials', icon: ReceiptIndianRupee },
    { id: 'communication', label: 'Comm.', icon: MessageCircle },
    { id: 'staff', label: 'Team', icon: Users },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(localSettings);
      setIsSaving(false);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 3000);
    }, 1000);
  };

  const updateLocal = (key: keyof SystemSettings, value: any) => {
    setLocalSettings(prev => prev ? ({ ...prev, [key]: value }) : prev);
  };

  const addTable = () => {
    if (localSettings && newTableName.trim() && !localSettings.tables.includes(newTableName.trim())) {
      updateLocal('tables', [...localSettings.tables, newTableName.trim()]);
      setNewTableName('');
    }
  };

  const removeTable = (tableName: string) => {
    if (localSettings) {
      updateLocal('tables', localSettings.tables.filter(t => t !== tableName));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLocal('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
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
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data.display_name) {
            updateLocal('address', data.display_name);
          } else {
            updateLocal('address', `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          updateLocal('address', `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        alert('Unable to retrieve your location. Please check your permissions.');
      }
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Restaurant Name</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={localSettings.restaurantName} onChange={(e) => updateLocal('restaurantName', e.target.value)} className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Contact Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={localSettings.phone} onChange={(e) => updateLocal('phone', e.target.value)} className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Physical Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-5 top-5 text-gray-400" />
                  <textarea rows={2} value={localSettings.address} onChange={(e) => updateLocal('address', e.target.value)} className="w-full pl-14 pr-32 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                  <button 
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white text-[#D17842] rounded-xl hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm border border-[#F1E7E1]"
                  >
                    {isLocating ? <RefreshCw size={14} className="animate-spin" /> : <MapPin size={14} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{isLocating ? 'Locating...' : 'Fetch Location'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E]">Visual Identity</h4>
                  <div onClick={() => logoInputRef.current?.click()} className="p-10 border-4 border-dashed border-[#F1E7E1] rounded-[40px] flex flex-col items-center gap-4 group hover:border-[#D17842] transition-colors cursor-pointer bg-[#FDFCFB] overflow-hidden">
                     {localSettings.logoUrl ? <img src={localSettings.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded-2xl shadow-md" /> : <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-[#D17842] group-hover:scale-110 transition-transform"><ImageIcon size={32} /></div>}
                     <div className="text-center">
                        <p className="text-xs font-black uppercase text-[#1C1C1E]">{localSettings.logoUrl ? 'Change Logo' : 'Upload Logo'}</p>
                     </div>
                  </div>
                  <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
               </div>

               <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E]">Brand Color</h4>
                  <div className="space-y-6">
                    <div className="grid grid-cols-5 gap-3">
                      {['#D17842', '#1C1C1E', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'].map(color => (
                        <button 
                          key={color} 
                          onClick={() => updateLocal('primaryColor', color)}
                          className={`w-full aspect-square rounded-2xl transition-all border-4 ${localSettings.primaryColor === color ? 'border-white ring-2 ring-[#D17842] scale-110 shadow-lg' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Custom Color Picker</label>
                      <div className="relative flex gap-3">
                        <div className="relative flex-1">
                          <Palette size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            value={localSettings.primaryColor} 
                            onChange={(e) => updateLocal('primaryColor', e.target.value)} 
                            className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" 
                            placeholder="#000000"
                          />
                        </div>
                        <div className="relative w-14 h-14 shrink-0">
                          <input 
                            type="color" 
                            value={localSettings.primaryColor.startsWith('#') ? localSettings.primaryColor : '#D17842'} 
                            onChange={(e) => updateLocal('primaryColor', e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div 
                            className="w-full h-full rounded-2xl shadow-md border-4 border-white ring-1 ring-gray-200"
                            style={{ backgroundColor: localSettings.primaryColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'halls':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E]">Managed Tables</h4>
                  <div className="flex gap-2">
                     <input type="text" placeholder="Table No." className="px-4 py-2 bg-[#F9F5F2] border-none rounded-xl text-xs font-bold w-32 text-[#1C1C1E]" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTable()} />
                     <button onClick={addTable} className="bg-[#1C1C1E] text-white p-2 rounded-xl active:scale-90"><Plus size={18} /></button>
                  </div>
               </div>
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {localSettings.tables.map(table => (
                    <div key={table} className="group relative flex items-center justify-center p-6 bg-[#F9F5F2] rounded-3xl border border-[#F1E7E1] hover:border-[#D17842]">
                       <span className="text-lg font-black text-[#1C1C1E]">{table}</span>
                       <button onClick={() => removeTable(table)} className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">UPI ID (for Payments)</label>
                <div className="relative">
                  <Wallet size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={localSettings.upiId} onChange={(e) => updateLocal('upiId', e.target.value)} placeholder="e.g., name@bank" className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">Currency Symbol</label>
                <div className="relative">
                  <Coins size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={localSettings.currency} onChange={(e) => updateLocal('currency', e.target.value)} className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">GST Number</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={localSettings.gstNumber} onChange={(e) => updateLocal('gstNumber', e.target.value)} className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2">GST Percentage (%)</label>
                <div className="relative">
                  <Percent size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" value={localSettings.gstPercentage} onChange={(e) => updateLocal('gstPercentage', Number(e.target.value))} className="w-full pl-14 pr-5 py-4 rounded-2xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-[#D17842] font-bold text-sm text-[#1C1C1E]" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-green-50 rounded-3xl border border-green-100">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-green-600 shadow-sm"><MessageCircle size={24} fill="currentColor" strokeWidth={0} /></div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E]">WhatsApp Integration</h4>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Personalized customer alerts</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => updateLocal('whatsappEnabled', !localSettings.whatsappEnabled)}
                  className={`w-14 h-8 rounded-full relative transition-all ${localSettings.whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                 >
                   <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${localSettings.whatsappEnabled ? 'left-7' : 'left-1'}`} />
                 </button>
               </div>

               <div className={`space-y-8 transition-opacity ${localSettings.whatsappEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2 flex items-center gap-2"><MessageSquareText size={14} /> Order Confirmation Template</label>
                    <textarea 
                      rows={4} 
                      value={localSettings.whatsappConfirmationTemplate} 
                      onChange={(e) => updateLocal('whatsappConfirmationTemplate', e.target.value)} 
                      className="w-full px-6 py-5 rounded-3xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-green-500 font-bold text-sm text-[#1C1C1E] leading-relaxed"
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] px-2 flex items-center gap-2"><CheckCircle2 size={14} /> Payment Settled Template</label>
                    <textarea 
                      rows={4} 
                      value={localSettings.whatsappSettledTemplate} 
                      onChange={(e) => updateLocal('whatsappSettledTemplate', e.target.value)} 
                      className="w-full px-6 py-5 rounded-3xl bg-[#F9F5F2] border-none focus:ring-2 focus:ring-green-500 font-bold text-sm text-[#1C1C1E] leading-relaxed"
                    />
                 </div>

                 <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-3">
                   <p className="text-[10px] font-black uppercase text-[#D17842] tracking-widest flex items-center gap-2"><Globe size={14} /> Dynamic Placeholders</p>
                   <div className="flex flex-wrap gap-2">
                     {['{{customer}}', '{{orderId}}', '{{total}}', '{{currency}}', '{{restaurant}}', '{{items}}'].map(tag => (
                       <span key={tag} className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-[10px] font-black text-orange-600">{tag}</span>
                     ))}
                   </div>
                   <p className="text-[9px] text-[#D17842]/70 font-medium italic">Placeholders will be automatically replaced with actual order data.</p>
                 </div>
               </div>
            </div>
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {isStaffModalOpen && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-10 space-y-6 animate-in zoom-in duration-300">
                   <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-black text-[#1C1C1E]">{editingStaff ? 'Edit Member' : 'New Member'}</h3>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Team account setup</p>
                      </div>
                      <button onClick={() => { setIsStaffModalOpen(false); setEditingStaff(null); }}><X size={24} className="text-gray-400" /></button>
                   </div>
                   <div className="space-y-4">
                      <input type="text" placeholder="Full Name" className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none font-bold text-sm text-[#1C1C1E]" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} />
                      <input type="email" placeholder="Work Email (Login ID)" className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none font-bold text-sm text-[#1C1C1E]" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} />
                      <input type="tel" placeholder="Mobile Number" className="w-full px-6 py-4 rounded-2xl bg-[#F9F5F2] border-none font-bold text-sm text-[#1C1C1E]" value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(UserRole).map(role => (
                          <button key={role} type="button" onClick={() => setStaffForm({ ...staffForm, role })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${staffForm.role === role ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]' : 'bg-white border-[#F1E7E1] text-[#8E8E93]'}`}>{role}</button>
                        ))}
                      </div>
                   </div>
                   <button onClick={handleSaveStaff} className="w-full py-5 bg-[#D17842] text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl">{editingStaff ? 'Update Member' : 'Deploy Member'}</button>
                </div>
              </div>
            )}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#1C1C1E]">Staff Members</h4>
                  <button onClick={() => { setEditingStaff(null); setIsStaffModalOpen(true); }} className="bg-[#1C1C1E] text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] flex items-center gap-2"><UserPlus size={16} /> Add Member</button>
               </div>
               <div className="space-y-3">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-5 bg-white border border-[#F1E7E1] rounded-[28px] hover:border-[#D17842] transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#F9F5F2] rounded-full flex items-center justify-center text-[#D17842] font-black text-lg">{member.name[0]}</div>
                          <div>
                             <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-[#1C1C1E]">{member.name}</p>
                                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-gray-100 text-gray-500">{member.role}</span>
                             </div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase">{member.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingStaff(member); setStaffForm({ ...member }); setIsStaffModalOpen(true); }} className="p-2 text-gray-300 hover:text-[#D17842]"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteStaff(member.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 text-white rounded-xl shadow-lg" style={{ backgroundColor: localSettings.primaryColor }}><Settings size={20} strokeWidth={3} /></div>
             <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight">Control Center</h2>
          </div>
          <p className="text-[#8E8E93] font-medium text-sm">Workspace administration & team access.</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 px-1">
        <div className="w-full lg:w-80 space-y-2">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button key={tab.id} id={`tab-btn-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 px-6 py-5 rounded-[32px] transition-all whitespace-nowrap lg:w-full border-2 ${activeTab === tab.id ? 'bg-white border-[#F1E7E1] shadow-xl' : 'text-[#8E8E93] border-transparent'}`} style={{ color: activeTab === tab.id ? localSettings.primaryColor : undefined }}>
                <div className={`p-2 rounded-xl`} style={{ backgroundColor: activeTab === tab.id ? `${localSettings.primaryColor}15` : 'transparent' }}><tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} /></div>
                <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[56px] border border-[#F1E7E1] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col min-h-[600px] touch-pan-y">
           <div className="flex items-center justify-between mb-12 pb-8 border-b border-[#F1E7E1]/60">
              <h3 className="text-3xl font-black text-[#1C1C1E] tracking-tight">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-[9px] font-black uppercase text-gray-300">RestoTrack Portal V1</p>
           </div>
           <div className="flex-1">{renderTabContent()}</div>
        </div>
      </div>

      <div className="fixed bottom-[64px] left-0 right-0 lg:bottom-10 lg:right-10 lg:left-auto z-[60] px-4 py-3 lg:p-0 flex flex-col items-center pointer-events-none">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto pointer-events-auto max-w-lg mx-auto lg:mx-0">
          {showSavedMsg && <span className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest bg-white border border-green-100 px-6 py-4 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"><CheckCircle2 size={16} /> Configuration Saved</span>}
          <button disabled={isSaving} onClick={handleSave} className={`w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-5 md:px-12 rounded-[32px] text-white font-black uppercase tracking-widest text-[11px] transition-all ${isSaving ? 'bg-gray-400' : 'shadow-2xl'}`} style={{ backgroundColor: isSaving ? undefined : localSettings.primaryColor }}>
            {isSaving ? <RefreshCw className="animate-spin" size={22} /> : <Save size={22} />}
            {isSaving ? 'Saving...' : 'Commit Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlCenter;
