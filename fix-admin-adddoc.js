import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// replace imports to include addDoc and collection
if (!code.includes("addDoc")) {
  code = code.replace(
    "import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';",
    "import { doc, setDoc, deleteDoc, updateDoc, addDoc, collection } from 'firebase/firestore';"
  );
}

const oldHandleSave = `  const handleSave = async () => {
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
          image: ensureHttps(formData.image) || '',
          inStock: formData.inStock ?? true,
          isDailySpecial: formData.isDailySpecial ?? false,
        };
        // Optimistic update
        setMenuItems(prev => [newItem, ...prev]);
        await setDoc(doc(db, 'menuItems', id), newItem);
      } else {`;

const newHandleSave = `  const handleSave = async () => {
    if (!formData.titleEn || !formData.price || !formData.category) {
      alert('Please fill in at least English Title, Price, and Category.');
      return;
    }

    try {
      if (isAdding) {
        const newItem = {
          titleEn: formData.titleEn || '',
          titleAm: formData.titleAm || '',
          descriptionEn: formData.descriptionEn || '',
          descriptionAm: formData.descriptionAm || '',
          price: Number(formData.price) || 0,
          category: formData.category as any || 'Hot Drinks',
          image: ensureHttps(formData.image) || '',
          inStock: formData.inStock ?? true,
          isDailySpecial: formData.isDailySpecial ?? false,
          createdAt: new Date().toISOString(),
        };
        
        await addDoc(collection(db, 'menuItems'), newItem);
      } else {`;

code = code.replace(oldHandleSave, newHandleSave);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
