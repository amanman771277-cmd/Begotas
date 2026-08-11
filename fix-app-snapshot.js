import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldSnapshot = `    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const freshData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titleEn: data.titleEn,
          titleAm: data.titleAm,
          descriptionEn: data.descriptionEn,
          descriptionAm: data.descriptionAm,
          price: data.price,
          category: data.category,
          image: data.image,
          inStock: data.inStock,
          isDailySpecial: data.isDailySpecial,
        } as MenuItem;
      });
      
      if (freshData.length > 0) {
        setMenuItems(freshData);
        localStorage.setItem('cached_menu_items', JSON.stringify(freshData));
      }
      setIsSyncing(false);`;

const newSnapshot = `    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const freshData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titleEn: data.titleEn,
          titleAm: data.titleAm,
          descriptionEn: data.descriptionEn,
          descriptionAm: data.descriptionAm,
          price: data.price,
          category: data.category,
          image: data.image,
          inStock: data.inStock,
          isDailySpecial: data.isDailySpecial,
          createdAt: data.createdAt,
        } as MenuItem;
      });
      
      // Sort by createdAt descending if available, otherwise by title
      freshData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.titleEn.localeCompare(b.titleEn);
      });
      
      setMenuItems(freshData);
      localStorage.setItem('cached_menu_items', JSON.stringify(freshData));
      setIsSyncing(false);`;

code = code.replace(oldSnapshot, newSnapshot);
fs.writeFileSync('src/App.tsx', code);
