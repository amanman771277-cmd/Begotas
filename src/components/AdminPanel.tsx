import React, { useState } from 'react';
import { MenuItem, Category } from '../types';
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminPanelProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  onClose: () => void;
}

export function AdminPanel({ menuItems, setMenuItems, onClose }: AdminPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData(item);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // Optimistic update
      setMenuItems(prev => prev.filter(item => item.id !== id));
      try {
        await deleteDoc(doc(db, 'menuItems', id));
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    }
  };

  const handleToggleStock = async (id: string) => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    // Optimistic update
    setMenuItems(prev => prev.map(i => 
      i.id === id ? { ...i, inStock: !i.inStock } : i
    ));
    try {
      await updateDoc(doc(db, 'menuItems', id), { inStock: !item.inStock });
    } catch (e) {
      console.error("Error updating stock: ", e);
    }
  };

  const handleDailySpecialToggle = (checked: boolean) => {
    if (checked) {
      const currentSpecialsCount = menuItems.filter(item => item.isDailySpecial && item.id !== editingId).length;
      if (currentSpecialsCount >= 3) {
        alert("You can only highlight up to 3 Daily Specials.\nከ3 በላይ የዕለቱ ልዩ ምግቦችን መምረጥ አይችሉም።");
        return;
      }
    }
    setFormData(prev => ({ ...prev, isDailySpecial: checked }));
  };

  const handleSave = async () => {
    if (!formData.titleEn || !formData.price || !formData.category) {
      alert('Please fill in at least English Title, Price, and Category.');
      return;
    }

    try {
      if (isAdding) {
        const id = Date.now().toString();
        const newItem: MenuItem = {
          id: id,
          titleEn: formData.titleEn || '',
          titleAm: formData.titleAm || '',
          descriptionEn: formData.descriptionEn || '',
          descriptionAm: formData.descriptionAm || '',
          price: Number(formData.price) || 0,
          category: formData.category as any || 'Hot Drinks',
          image: formData.image || '',
          inStock: formData.inStock ?? true,
          isDailySpecial: formData.isDailySpecial ?? false,
        };
        // Optimistic update
        setMenuItems(prev => [newItem, ...prev]);
        await setDoc(doc(db, 'menuItems', id), newItem);
      } else {
        const updatedFields = { 
          ...formData, 
          price: Number(formData.price), 
          isDailySpecial: formData.isDailySpecial ?? false 
        };
        // Optimistic update
        setMenuItems(prev => prev.map(item => 
          item.id === editingId ? { ...item, ...updatedFields } as MenuItem : item
        ));
        await updateDoc(doc(db, 'menuItems', editingId!), updatedFields);
      }

      setEditingId(null);
      setIsAdding(false);
      setFormData({});
    } catch (e) {
      console.error("Error saving document: ", e);
      alert("Failed to save. Please check permissions or connection.");
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      inStock: true,
      isDailySpecial: false,
      category: 'Hot Drinks',
      price: 0
    });
  };

  const categories: Omit<Category, 'All'>[] = ['Hot Drinks', 'Cold Drinks', 'Burgers', 'Pastry'];

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Begotas';
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'du5fpqadb';

    formData.append('upload_preset', uploadPreset);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, image: data.secure_url }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      alert('Failed to upload image. Please try again or use direct URL.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2C2A] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#4A2C2A] flex items-center gap-2">
            Admin Dashboard
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-[#FDFBF7] rounded-full transition-colors border border-[#4A2C2A]/10 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[#9D3C3C] hover:bg-[#8A3434] text-white px-4 py-2 rounded-3xl font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add New Item
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="bg-white p-6 rounded-3xl border border-[#4A2C2A]/10 mb-8 shadow-md">
            <h3 className="text-xl font-bold text-[#4A2C2A] mb-4">
              {isAdding ? 'Add New Menu Item' : 'Edit Menu Item'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">English Title *</label>
                <input 
                  type="text" 
                  value={formData.titleEn || ''}
                  onChange={e => setFormData({...formData, titleEn: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">Amharic Title</label>
                <input 
                  type="text" 
                  value={formData.titleAm || ''}
                  onChange={e => setFormData({...formData, titleAm: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">English Description</label>
                <textarea 
                  value={formData.descriptionEn || ''}
                  onChange={e => setFormData({...formData, descriptionEn: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">Amharic Description</label>
                <textarea 
                  value={formData.descriptionAm || ''}
                  onChange={e => setFormData({...formData, descriptionAm: e.target.value})}
                  className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">Price (ETB) *</label>
                <input 
                  type="number" 
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">Category *</label>
                <select 
                  value={formData.category || ''}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-[#4A2C2A]/70 mb-1">Image URL</label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon size={16} className="text-[#4A2C2A]/50" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={formData.image || ''}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-[#FDFBF7] border border-[#4A2C2A]/10 rounded-2xl pl-10 p-3 text-[#4A2C2A] focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] outline-none"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button 
                      type="button" 
                      disabled={isUploading}
                      className="bg-white border border-[#4A2C2A]/10 hover:bg-[#FDFBF7] disabled:opacity-50 text-[#4A2C2A] px-4 py-3 rounded-2xl font-medium transition-colors shadow-sm"
                    >
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#4A2C2A]/50 mt-1">Upload an image or provide a direct image URL</p>
              </div>
              
              <div className="md:col-span-2 flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="inStock"
                    checked={formData.inStock ?? true}
                    onChange={e => setFormData({...formData, inStock: e.target.checked})}
                    className="w-5 h-5 rounded-md bg-white border-[#4A2C2A]/20 text-[#9D3C3C] focus:ring-[#9D3C3C] focus:ring-offset-[#FDFBF7]"
                  />
                  <label htmlFor="inStock" className="text-sm text-[#4A2C2A] cursor-pointer font-medium">
                    Item is currently in stock
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isDailySpecial"
                    checked={formData.isDailySpecial ?? false}
                    onChange={e => handleDailySpecialToggle(e.target.checked)}
                    className="w-5 h-5 rounded-md bg-white border-[#4A2C2A]/20 text-[#9D3C3C] focus:ring-[#9D3C3C] focus:ring-offset-[#FDFBF7]"
                  />
                  <label htmlFor="isDailySpecial" className="text-sm text-[#4A2C2A] cursor-pointer font-medium">
                    Daily Special
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); setFormData({}); }}
                className="px-5 py-2.5 bg-white border border-[#4A2C2A]/10 hover:bg-[#FDFBF7] rounded-3xl text-[#4A2C2A] font-medium transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2.5 bg-[#9D3C3C] hover:bg-[#8A3434] rounded-3xl text-white font-medium transition-colors flex items-center gap-2 shadow-sm shadow-[#9D3C3C]/20"
              >
                <Check size={18} />
                Save Item
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#4A2C2A]/10 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF7] border-b border-[#4A2C2A]/10 text-[#4A2C2A]/70 text-sm">
                  <th className="p-4 font-medium">Item</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item.id} className="border-b border-[#4A2C2A]/5 hover:bg-[#FDFBF7]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#FDFBF7] border border-[#4A2C2A]/5">
                          {item.image ? (
                            <img src={item.image} alt={item.titleEn} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-full h-full p-3 text-[#4A2C2A]/30" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#4A2C2A]">{item.titleEn}</div>
                          <div className="text-xs text-[#4A2C2A]/60">{item.titleAm}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-medium text-[#9D3C3C] bg-[#9D3C3C]/10 px-3 py-1.5 rounded-3xl">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-[#4A2C2A] font-medium">{item.price} ETB</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggleStock(item.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-3xl transition-colors ${
                          item.inStock 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-[#4A2C2A]/60 hover:text-[#9D3C3C] hover:bg-[#FDFBF7] rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[#4A2C2A]/60 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#4A2C2A]/50 font-medium">
                      No menu items found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
