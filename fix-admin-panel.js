import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add imports
if (!code.includes("import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';")) {
  code = code.replace(
    "import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';",
    "import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';\nimport { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';\nimport { db } from '../firebase';"
  );
}

// Replace handleDelete
const handleDeleteOld = `  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };`;

const handleDeleteNew = `  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      // Optimistic update
      setMenuItems(prev => prev.filter(item => item.id !== id));
      try {
        await deleteDoc(doc(db, 'menuItems', id));
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    }
  };`;

// Replace handleToggleStock
const handleToggleStockOld = `  const handleToggleStock = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, inStock: !item.inStock } : item
    ));
  };`;

const handleToggleStockNew = `  const handleToggleStock = async (id: string) => {
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
  };`;

// Replace handleSave
const handleSaveOld = `  const handleSave = () => {
    if (!formData.titleEn || !formData.price || !formData.category) {
      alert('Please fill in at least English Title, Price, and Category.');
      return;
    }

    if (isAdding) {
      const newItem: MenuItem = {
        id: Date.now().toString(),
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
      setMenuItems(prev => [newItem, ...prev]);
    } else {
      setMenuItems(prev => prev.map(item => 
        item.id === editingId ? { ...item, ...formData, price: Number(formData.price), isDailySpecial: formData.isDailySpecial ?? false } as MenuItem : item
      ));
    }

    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };`;

const handleSaveNew = `  const handleSave = async () => {
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
  };`;

code = code.replace(handleDeleteOld, handleDeleteNew);
code = code.replace(handleToggleStockOld, handleToggleStockNew);
code = code.replace(handleSaveOld, handleSaveNew);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
