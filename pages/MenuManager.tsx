import React, { useState, useRef } from 'react';
import { Plus, Trash2, X, RefreshCw, Camera, AlertCircle, Layers, IndianRupee, Edit3, Search, Power } from 'lucide-react';
import { MenuItem, MenuVariant } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import DietaryIndicator from '../components/DietaryIndicator';

interface MenuManagerProps {
  tenantId: string;
}

const MenuManager: React.FC<MenuManagerProps> = ({ tenantId }) => {
  const { menuItems: apiMenuItems, loading: menuLoading, error: menuError, createMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { categories: apiCategories, loading: categoriesLoading, createCategory, deleteCategory } = useCategories();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'Both' | 'Veg' | 'Non-Veg' | 'Egg'>('Both');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayCategories, setDisplayCategories] = useState(['All']);
  const formCategories = displayCategories.filter(c => c !== 'All');

  // Update categories when API data loads
  React.useEffect(() => {
    if (apiCategories && apiCategories.length > 0) {
      const categoryNames = apiCategories.map(c => c.name);
      setDisplayCategories(['All', ...categoryNames]);
    }
  }, [apiCategories]);

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<MenuVariant[]>([{ size: 'Regular', price: 0, cost: 0 }]);

  const [newItem, setNewItem] = useState({
    name: '',
    category: apiCategories[0]?.name || '',
    newCategory: '',
    price: '',
    cost: '',
    stock: '',
    dietary: 'Veg' as 'Veg' | 'Non-Veg' | 'Egg',
    imagePreview: '',
    isAvailable: true
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewItem({ ...newItem, imagePreview: dataUrl });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariantRow = () => {
    setVariants([...variants, { size: '', price: 0, cost: 0 }]);
  };

  const removeVariantRow = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof MenuVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const finalCategory = isCreatingNewCategory ? newItem.newCategory : newItem.category;
      
      // If creating new category, add it first
      if (isCreatingNewCategory && !(apiCategories || []).find(c => c.name === finalCategory)) {
        await createCategory({ name: finalCategory });
      }

      // Find category ID
      const category = (apiCategories || []).find(c => c.name === finalCategory);
      if (!category) {
        throw new Error('Category not found');
      }

      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('description', ''); // Add description field if needed
      formData.append('categoryId', category.id);
      formData.append('foodType', newItem.dietary === 'Veg' ? 'VEG' : newItem.dietary === 'Egg' ? 'EGG' : 'NON_VEG');
      formData.append('hasSizes', hasVariants.toString());
      formData.append('price', newItem.price);

      if (hasVariants) {
        formData.append('sizes', JSON.stringify(variants.map(v => ({ name: v.size, price: v.price }))));
      }

      // Add image if exists
      if (newItem.imagePreview && newItem.imagePreview.startsWith('data:image')) {
        // Convert data URL to blob
        const res = await fetch(newItem.imagePreview);
        const blob = await res.blob();
        formData.append('image', blob, 'item.jpg');
      }

      if (editingItem) {
        // Backend doesn't support FormData for update currently based on service code, 
        // but we'll use updateMenuItem partial update
        await updateMenuItem(editingItem.id, {
          name: newItem.name,
          category: category.id as any,
          dietary: newItem.dietary,
          hasVariants: hasVariants,
          price: Number(newItem.price),
          variants: hasVariants ? variants.map(v => ({ size: v.size, price: v.price, cost: v.cost })) : undefined,
          isAvailable: newItem.isAvailable
        });
      } else {
        await createMenuItem(formData);
      }

      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsAddModalOpen(false);
        setEditingItem(null);
        setIsCreatingNewCategory(false);
        setHasVariants(false);
        setVariants([{ size: 'Regular', price: 0, cost: 0 }]);
        setNewItem({ name: '', category: apiCategories[0]?.name || '', newCategory: '', price: '', cost: '', stock: '', dietary: 'Veg', imagePreview: '', isAvailable: true });
      }, 1500);
    } catch (error) {
      console.error('Error saving menu item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    const category = apiCategories.find(c => c.name === item.category || c.id === item.category);
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: category?.name || '',
      newCategory: '',
      price: item.price.toString(),
      cost: '',
      stock: '',
      dietary: item.dietary,
      imagePreview: item.image || '',
      isAvailable: item.isAvailable || true
    });
    setHasVariants(item.hasVariants);
    if (item.hasVariants && item.variants) {
      setVariants(item.variants.map(s => ({ size: s.size, price: s.price, cost: 0 })));
    } else {
      setVariants([{ size: 'Regular', price: item.price, cost: 0 }]);
    }
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this item from menu?')) {
      try {
        await deleteMenuItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const toggleAvailability = async (id: string) => {
    const item = (apiMenuItems || []).find(item => item.id === id);
    if (item) {
      await updateMenuItem(id, { isAvailable: !item.isAvailable });
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    const category = (apiCategories || []).find(c => c.name === cat);
    if (category) {
      try {
        await deleteCategory(category.id);
        if (activeCategory === cat) setActiveCategory('All');
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const filteredItems = (apiMenuItems || []).filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDietary = dietaryFilter === 'Both' || item.dietary === dietaryFilter;
    return matchesCategory && matchesSearch && matchesDietary;
  });

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0 relative">
      {categoryToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-[32px] p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle size={32} className="text-red-500" />
              <h3 className="text-xl font-black">Delete Category?</h3>
              <p className="text-sm text-[#8E8E93]">Removing "{categoryToDelete}" will un-categorize items.</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button onClick={() => setCategoryToDelete(null)} className="py-3 bg-gray-100 rounded-xl font-bold uppercase text-[10px]">Cancel</button>
                <button onClick={() => handleDeleteCategory(categoryToDelete)} className="py-3 bg-red-500 text-white rounded-xl font-bold uppercase text-[10px]">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden my-auto">
            <form onSubmit={handleAddItem} className="p-6 md:p-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">{editingItem ? 'Edit Dish' : 'Add New Dish'}</h3>
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }}><X size={24} className="text-gray-400" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-[#F9F5F2] rounded-[32px] border-2 border-dashed border-[#F1E7E1] flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden relative">
                    {newItem.imagePreview ? <img src={newItem.imagePreview} className="w-full h-full object-cover" /> : <Camera size={32} className="text-[#D17842]" />}
                    <div className="absolute bottom-4 bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm text-[10px] font-black uppercase text-[#D17842]">Upload Image</div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Dish Type</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const states: ('Veg' | 'Non-Veg' | 'Egg')[] = ['Veg', 'Non-Veg', 'Egg'];
                        const next = states[(states.indexOf(newItem.dietary) + 1) % states.length];
                        setNewItem({...newItem, dietary: next});
                      }}
                      className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center border-2 shadow-sm active:scale-90 ${
                        newItem.dietary === 'Veg' ? 'bg-green-50 border-green-200' : newItem.dietary === 'Egg' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <DietaryIndicator dietary={newItem.dietary} size="md" className="shadow-sm" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Basic Info</label>
                    <div className="space-y-2 mt-2">
                      <input required type="text" placeholder="Dish Name" className="w-full px-5 py-3.5 rounded-2xl bg-[#F9F5F2] font-bold" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                      
                      {isCreatingNewCategory ? (
                        <input required type="text" placeholder="New Category" className="w-full px-5 py-3.5 rounded-2xl bg-orange-50 font-bold" value={newItem.newCategory} onChange={e => setNewItem({...newItem, newCategory: e.target.value})} />
                      ) : (
                        <select className="w-full px-5 py-3.5 rounded-2xl bg-[#F9F5F2] font-bold" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                          {formCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                      <button type="button" onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)} className="text-[10px] font-black uppercase text-[#D17842] px-2">{isCreatingNewCategory ? 'Cancel' : '+ New Category'}</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 bg-[#F9F5F2] py-3 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Power size={16} className={newItem.isAvailable ? 'text-green-500' : 'text-gray-400'} />
                      <span className="text-[10px] font-black uppercase text-[#1C1C1E]">Available Now?</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNewItem({...newItem, isAvailable: !newItem.isAvailable})}
                      className={`w-12 h-6 rounded-full transition-all relative ${newItem.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newItem.isAvailable ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-2 bg-orange-50 py-3 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2">
                       <Layers size={16} className="text-[#D17842]" />
                       <span className="text-[10px] font-black uppercase text-[#D17842]">Multiple Sizes?</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setHasVariants(!hasVariants)}
                      className={`w-12 h-6 rounded-full transition-all relative ${hasVariants ? 'bg-[#D17842]' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hasVariants ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {!hasVariants ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Pricing</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input required type="number" placeholder="Price" className="w-full px-5 py-3.5 rounded-2xl bg-[#F9F5F2] font-bold" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                        <input type="number" placeholder="Cost (Optional)" className="w-full px-5 py-3.5 rounded-2xl bg-[#F9F5F2] font-bold" value={newItem.cost} onChange={e => setNewItem({...newItem, cost: e.target.value})} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Variants (Sizes/Prices)</label>
                      <div className="space-y-2">
                        {variants.map((v, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-1 items-center bg-[#F9F5F2] p-2 rounded-2xl">
                            <input required placeholder="Size" className="col-span-4 bg-white px-2 py-2 rounded-xl text-xs font-bold" value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)} />
                            <input required type="number" placeholder="Price" className="col-span-3 bg-white px-2 py-2 rounded-xl text-xs font-bold" value={v.price === 0 ? '' : v.price} onChange={e => updateVariant(idx, 'price', Number(e.target.value))} />
                            <input type="number" placeholder="Cost" className="col-span-3 bg-white px-2 py-2 rounded-xl text-xs font-bold" value={v.cost === 0 ? '' : v.cost} onChange={e => updateVariant(idx, 'cost', Number(e.target.value))} />
                            <button type="button" onClick={() => removeVariantRow(idx)} className="col-span-2 flex justify-center text-red-400"><X size={16} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={addVariantRow} className="w-full py-2 border-2 border-dashed border-[#F1E7E1] rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:text-[#D17842] hover:border-[#D17842] transition-all">+ Add Size</button>
                      </div>
                    </div>
                  )}

                  <input type="number" placeholder="Stock Level (Optional)" className="w-full px-5 py-3.5 rounded-2xl bg-[#F9F5F2] font-bold" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
                </div>
              </div>

              <button disabled={isSaving} className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all ${showSuccess ? 'bg-green-500' : 'bg-[#D17842] shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-95'}`}>
                {showSuccess ? 'Success!' : isSaving ? <RefreshCw className="animate-spin mx-auto" /> : editingItem ? 'Save Changes' : 'Create Dish'}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Menu Manager</h2>
        <button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="bg-[#D17842] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100">
          <Plus size={18} /> Add Dish
        </button>
      </header>

      <div className="space-y-4">
        <div className="relative group flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-white border border-[#F1E7E1] font-bold shadow-sm focus:border-[#D17842] outline-none transition-all" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          <button 
            onClick={() => {
              const states: ('Both' | 'Veg' | 'Non-Veg' | 'Egg')[] = ['Both', 'Veg', 'Non-Veg', 'Egg'];
              const next = states[(states.indexOf(dietaryFilter) + 1) % states.length];
              setDietaryFilter(next);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shadow-sm active:scale-90 border-2 shrink-0 ${
              dietaryFilter === 'Both' ? 'bg-white border-[#F1E7E1]' :
              dietaryFilter === 'Veg' ? 'bg-green-50 border-green-200' :
              dietaryFilter === 'Egg' ? 'bg-orange-50 border-orange-200' :
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
            {displayCategories.map((cat) => (
              <div key={cat} className="relative group shrink-0">
                <button 
                  onClick={() => setActiveCategory(cat)} 
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-[#D17842] text-white shadow-md' : 'bg-white border border-[#F1E7E1] text-[#6B7280]'}`}
                >
                  {cat}
                </button>
                {cat !== 'All' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCategoryToDelete(cat); }} 
                    className="absolute -top-1 -right-1 bg-white border border-red-200 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={8} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {filteredItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className={`bg-white rounded-[20px] border border-[#F1E7E1] overflow-hidden group shadow-sm flex flex-col h-full transition-all hover:shadow-md ${!item.isAvailable ? 'bg-gray-50' : ''}`}>
            <div className="relative aspect-square overflow-hidden">
              <img src={item.image || `https://picsum.photos/seed/${item.name}/200/200`} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!item.isAvailable ? 'grayscale opacity-50' : ''}`} />
              <DietaryIndicator dietary={item.dietary} size="sm" className="shadow-sm border-white/50 scale-75 origin-top-left" />
              
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none z-[5]">
                  <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-xl">Sold Out</span>
                </div>
              )}

              <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleAvailability(item.id); }}
                  title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  className={`p-2 rounded-xl shadow-lg transition-all active:scale-75 ${item.isAvailable ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-[#1C1C1E] text-white ring-4 ring-white animate-pulse scale-110'}`}
                >
                  <Power size={12} strokeWidth={3} />
                </button>
                <button onClick={() => handleEditItem(item)} className="p-1.5 bg-white/95 rounded-lg text-[#D17842] shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90">
                  <Edit3 size={10} />
                </button>
                <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 bg-white/95 rounded-lg text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col">
              <h4 className={`text-[12px] font-black text-[#1C1C1E] mb-1 line-clamp-1 leading-tight ${!item.isAvailable ? 'text-gray-400' : ''}`}>{item.name}</h4>
              <div className="flex items-center justify-between mt-auto">
                <p className="text-[11px] font-black text-[#D17842]">₹{item.price}{item.hasVariants ? '+' : ''}</p>
                <p className={`text-[8px] font-black ${item.isAvailable ? 'text-green-600' : 'text-red-400'}`}>{item.isAvailable ? 'ON' : 'OFF'}</p>
              </div>
              <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100">
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter truncate block">{item.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuManager;