import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
if (!code.includes("import { collection, onSnapshot, getDocs } from 'firebase/firestore';")) {
  code = code.replace(
    "import { MenuItem, Language } from './types';",
    "import { MenuItem, Language } from './types';\nimport { collection, onSnapshot, getDocs } from 'firebase/firestore';\nimport { db } from './firebase';"
  );
}

// Replace simulated fetch with real onSnapshot
const fetchLogic = `  // Simulated background fetch (e.g., from Firebase Firestore)
  useEffect(() => {
    const fetchFreshData = async () => {
      if (!isOnline) return;
      setIsSyncing(true);
      try {
        // Simulate network delay for Firebase fetch
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation:
        // const snapshot = await getDocs(collection(db, 'menuItems'));
        // const freshData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // We'll just simulate that the current menuItems are the "fresh" ones for demo purposes
        // or you could pull from the initialMenu if the cache is empty
        const freshData = menuItems.length > 0 ? menuItems : initialMenu;
        
        // Update state and cache seamlessly
        setMenuItems([...freshData]);
        localStorage.setItem('cached_menu_items', JSON.stringify(freshData));
      } catch (error) {
        console.error("Failed to fetch fresh menu data", error);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchFreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]); // Re-fetch when coming back online`;

const newFetchLogic = `  // Real-time Firebase fetch
  useEffect(() => {
    if (!isOnline) return;
    setIsSyncing(true);
    
    const unsubscribe = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
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
      setIsSyncing(false);
    }, (error) => {
      console.error("Failed to fetch menu data", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [isOnline]);`;

code = code.replace(fetchLogic, newFetchLogic);

fs.writeFileSync('src/App.tsx', code);
