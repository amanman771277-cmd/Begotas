import React, { useState, useEffect, useMemo } from 'react';
import { initialMenu } from './data';
import { MenuItem, Category, Language } from './types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { MenuCard } from './components/MenuCard';
import { AdminPanel } from './components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Phone, 
  MessageCircle, 
  QrCode, 
  Globe, 
  ChefHat, 
  X,
  MapPin,
  Lock,
  MoreVertical,
  WifiOff,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  // Global State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('cached_menu_items');
    return saved ? JSON.parse(saved) : initialMenu;
  });
  
  const [lang, setLang] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  
  // Filtering & Sorting State
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Add a loading state for the background fetch (optional, for UI if needed)
  const [isSyncing, setIsSyncing] = useState(false);

  // Constants
  const LOGO_URL = "https://res.cloudinary.com/du5fpqadb/image/upload/v1786392602/h43axym5em75wvqa1wtd.jpg";
  const PHONE = "0977127799";
  const ADMIN_PIN = "1234"; // Hardcoded for demo

  const translations = {
    en: {
      restaurantName: "begotas cafe & restaurant",
      tagline: "Best Coffee & Pastry in Town",
      location: "Wolaita Sodo, Main Street",
      searchPlaceholder: "Search menu...",
      sortBy: "Sort by",
      priceLowToHigh: "Price: Low to High",
      priceHighToLow: "Price: High to Low",
      noItemsFound: "No menu items found",
      switchLangText: "ወደ አማርኛ ቀይር",
      viewQr: "View QR Code",
      scanMenu: "Scan Menu",
      scanDesc: "Scan to view our digital menu on your phone",
      allRightsReserved: "All rights reserved.",
      offlineMessage: "You are currently offline. Please check your internet connection.",
      dailySpecials: "✨ የዕለቱ ልዩ / Daily Specials",
      themeToggleLight: "Light Mode",
      themeToggleDark: "Dark Mode",
      categories: {
        'All': 'All',
        'Hot Drinks': 'Hot Drinks',
        'Cold Drinks': 'Cold Drinks',
        'Burgers': 'Burgers',
        'Pastry': 'Pastry',
      }
    },
    am: {
      restaurantName: "ቤጎታስ ካፌ እና ሬስቶራንት",
      tagline: "በከተማችን ምርጥ ቡና እና ፓስትሪ",
      location: "ወላይታ ሶዶ, ዋና መንገድ",
      searchPlaceholder: "በስም ፈልግ...",
      sortBy: "አደራደር",
      priceLowToHigh: "ዋጋ: ዝቅተኛ ወደ ከፍተኛ",
      priceHighToLow: "ዋጋ: ከፍተኛ ወደ ዝቅተኛ",
      noItemsFound: "ምንም አይነት ምግብ አልተገኘም",
      switchLangText: "Switch to English",
      viewQr: "QR ኮድ አሳይ",
      scanMenu: "ምናሌውን ይቃኙ",
      scanDesc: "በስልክዎ ላይ ዲጂታል ምናሌችንን ለማየት ይህን ይቃኙ",
      allRightsReserved: "መብቱ በህግ የተጠበቀ ነው።",
      offlineMessage: "በአሁኑ ሰዓት ኢንተርኔት የለዎትም፤ እባክዎ ግንኙነትዎን ያረጋግጡ።",
      dailySpecials: "✨ የዕለቱ ልዩ / Daily Specials",
      themeToggleLight: "ብርሃን ገጽ / Light Mode",
      themeToggleDark: "ጨለማ ገጽ / Dark Mode",
      categories: {
        'All': 'ሁሉም / All',
        'Hot Drinks': 'ትኩስ መጠጦች / Hot Drinks',
        'Cold Drinks': 'ቀዝቃዛ መጠጦች / Cold Drinks',
        'Burgers': 'በርገር / Burgers',
        'Pastry': 'ፓስትሪ / Pastry',
      }
    }
  };

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('cached_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  // Real-time Firebase fetch
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
      setIsSyncing(false);
    }, (error) => {
      console.error("Failed to fetch menu data", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === ADMIN_PIN) {
      setIsAdminView(true);
      setShowAdminLogin(false);
      setAdminPin('');
    } else {
      alert('Incorrect PIN');
    }
  };

  const filteredAndSortedMenu = useMemo(() => {
    let result = [...menuItems];

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.titleEn.toLowerCase().includes(q) || 
        item.titleAm.includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        item.descriptionAm.includes(q)
      );
    }

    // Sort
    if (sortOrder) {
      result.sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        return b.price - a.price;
      });
    }

    return result;
  }, [menuItems, activeCategory, searchQuery, sortOrder]);

  const dailySpecials = useMemo(() => {
    return menuItems.filter(item => item.isDailySpecial);
  }, [menuItems]);

  const dynamicCategories = useMemo(() => {
    const uniqueCats = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)));
    return ['All', ...uniqueCats];
  }, [menuItems]);

  const isAm = lang === 'am';

  // --- Views ---

  if (isAdminView) {
    return <AdminPanel menuItems={menuItems} setMenuItems={setMenuItems} onClose={() => setIsAdminView(false)} />;
  }

  return (
    <div className={`min-h-screen font-sans pb-24 selection:bg-[#9D3C3C]/20 relative overflow-hidden ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#FDFBF7] text-[#4A2C2A]'}`}>
      {/* Background Watermark */}
      <div 
        className={`fixed inset-0 pointer-events-none opacity-5 ${isDarkMode ? "opacity-10" : ""} flex items-center justify-center -z-10`}
        style={{ backgroundImage: `url(${LOGO_URL})`, backgroundSize: '400px', backgroundPosition: 'center', backgroundRepeat: 'space' }}
      ></div>

      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 ${isDarkMode ? "bg-[#0F172A]/90" : "bg-[#FDFBF7]/90"} backdrop-blur-md border-b ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} px-4 py-3 flex items-center justify-between shadow-sm`}>
        <h2 className={`text-xl font-bold ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} tracking-tight flex items-center gap-3 capitalize`}>
          <img src={LOGO_URL} alt="Logo" className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-[#9D3C3C]/20" />
          <span className="flex items-center gap-2">
            {t.restaurantName}
            {isSyncing && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#9D3C3C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9D3C3C]"></span>
              </span>
            )}
          </span>
        </h2>
        
        <div className="relative">
          <button 
            onClick={() => setShowKebabMenu(!showKebabMenu)}
            className={`p-2 ${isDarkMode ? "text-[#FDFBF7]/70" : "text-[#4A2C2A]/70"} hover:text-[#9D3C3C] ${isDarkMode ? "hover:bg-white/10" : "hover:bg-[#4A2C2A]/5"} rounded-full transition-colors focus:outline-none`}
            aria-label="Menu"
          >
            <MoreVertical size={20} />
          </button>
          
          {showKebabMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowKebabMenu(false)}
              ></div>
              <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? "bg-[#1E293B]" : "bg-white"} rounded-3xl shadow-xl ${isDarkMode ? "shadow-black/50" : "shadow-[#4A2C2A]/10"} border border-[#4A2C2A]/5 py-2 z-50 transform origin-top-right transition-all`}>
                <button
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    setShowKebabMenu(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-sm ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} ${isDarkMode ? "hover:bg-white/5" : "hover:bg-[#FDFBF7]"} hover:text-[#9D3C3C] transition-colors text-left`}
                >
                  {isDarkMode ? <Sun size={18} className="text-[#9D3C3C]" /> : <Moon size={18} className="text-[#9D3C3C]" />}
                  {isDarkMode ? t.themeToggleLight : t.themeToggleDark}
                </button>
                <button
                  onClick={() => {
                    setLang(l => l === 'en' ? 'am' : 'en');
                    setShowKebabMenu(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-sm ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} ${isDarkMode ? "hover:bg-white/5" : "hover:bg-[#FDFBF7]"} hover:text-[#9D3C3C] transition-colors text-left`}
                >
                  <Globe size={18} className="text-[#9D3C3C]" />
                  {t.switchLangText}
                </button>
                <button
                  onClick={() => {
                    setShowQR(true);
                    setShowKebabMenu(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-sm ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} ${isDarkMode ? "hover:bg-white/5" : "hover:bg-[#FDFBF7]"} hover:text-[#9D3C3C] transition-colors text-left`}
                >
                  <QrCode size={18} className="text-[#9D3C3C]" />
                  {t.viewQr}
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <img src={LOGO_URL} alt="Logo" className={`w-24 h-24 mx-auto rounded-full object-cover mb-4 ring-4 ${isDarkMode ? "ring-[#1E293B]" : "ring-white"} shadow-xl ${isDarkMode ? "shadow-black/50" : "shadow-[#4A2C2A]/10"}`} />
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} mb-3 capitalize`}>
            {t.restaurantName}
          </h1>
          <p className="text-[#9D3C3C] font-medium text-lg mb-4">
            {t.tagline}
          </p>
          <div className={`flex items-center justify-center gap-2 ${isDarkMode ? "text-[#FDFBF7]/60" : "text-[#4A2C2A]/60"} text-sm`}>
            <MapPin size={16} />
            <span>{t.location}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Controls: Search, Sort, Categories */}
        <div className="mb-8 space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className={`${isDarkMode ? "text-[#FDFBF7]/50" : "text-[#4A2C2A]/50"}`} />
              </div>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isDarkMode ? "bg-[#1E293B]" : "bg-white"} border ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} rounded-3xl py-3.5 pl-11 pr-4 ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} shadow-sm focus:outline-none focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] transition-all ${isDarkMode ? "placeholder:text-[#FDFBF7]/40" : "placeholder:text-[#4A2C2A]/40"}`}
              />
            </div>
            <select 
              value={sortOrder || ''} 
              onChange={(e) => setSortOrder(e.target.value as any || null)}
              className={`${isDarkMode ? "bg-[#1E293B]" : "bg-white"} border ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} rounded-3xl py-3.5 px-5 ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} shadow-sm focus:outline-none focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] appearance-none min-w-[150px] cursor-pointer`}
            >
              <option value="">{t.sortBy}</option>
              <option value="asc">{t.priceLowToHigh}</option>
              <option value="desc">{t.priceHighToLow}</option>
            </select>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3 scrollbar-hide">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-3xl text-sm font-medium transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#9D3C3C] text-white shadow-md shadow-[#9D3C3C]/20 border border-transparent' 
                    : isDarkMode 
                      ? 'bg-[#1E293B] text-[#FDFBF7]/80 hover:bg-white/5 hover:text-[#FDFBF7] border border-white/10 shadow-sm'
                      : 'bg-white text-[#4A2C2A]/80 hover:bg-[#FDFBF7] hover:text-[#4A2C2A] border border-[#4A2C2A]/10 shadow-sm'
                }`}
              >
                {(t.categories as Record<string, string>)[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Specials Section */}
        {dailySpecials.length > 0 && activeCategory === 'All' && !searchQuery.trim() && (
          <div className="mb-10 relative z-10">
            <h2 className={`text-xl md:text-2xl font-bold ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} mb-6 flex items-center gap-2`}>
              {t.dailySpecials}
            </h2>
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:snap-none">
              {dailySpecials.map(item => (
                <div key={`special-${item.id}`} className="min-w-[280px] sm:min-w-[320px] snap-center w-full max-w-sm md:max-w-none">
                  <MenuCard item={item} lang={lang} isSpecialView isDarkMode={isDarkMode} />
                </div>
              ))}
            </div>
            <div className={`border-b ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} mt-2 mb-6`}></div>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredAndSortedMenu.map(item => (
            <MenuCard key={item.id} item={item} lang={lang} isDarkMode={isDarkMode} />
          ))}
        </div>

        {filteredAndSortedMenu.length === 0 && (
          <div className={`text-center py-20 ${isDarkMode ? "text-[#FDFBF7]/40" : "text-[#4A2C2A]/40"} relative z-10`}>
            <ChefHat size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">{t.noItemsFound}</p>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <a 
          href={`tel:${PHONE}`}
          className={`flex items-center justify-center w-14 h-14 ${isDarkMode ? "bg-[#1E293B]" : "bg-white"} text-[#9D3C3C] rounded-3xl shadow-lg ${isDarkMode ? "shadow-black/50" : "shadow-[#4A2C2A]/10"} border ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#9D3C3C] focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-[#0F172A]" : "focus:ring-offset-[#FDFBF7]"}`}
          aria-label="Call Order"
        >
          <Phone size={24} />
        </a>
        <a 
          href={`https://wa.me/251${PHONE.substring(1)}?text=Hello,%20I%20would%20like%20to%20order%20from%20the%20menu.`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center w-14 h-14 bg-[#9D3C3C] hover:bg-[#8A3434] text-white rounded-3xl shadow-lg shadow-[#9D3C3C]/30 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#9D3C3C] focus:ring-offset-2 ${isDarkMode ? "focus:ring-offset-[#0F172A]" : "focus:ring-offset-[#FDFBF7]"}`}
          aria-label="WhatsApp Order"
        >
          <MessageCircle size={28} />
        </a>
      </div>

      {/* Footer / Admin Access */}
      <footer className={`mt-12 py-8 text-center ${isDarkMode ? "text-[#FDFBF7]/60" : "text-[#4A2C2A]/60"} text-sm border-t ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} relative z-10`}>
        <p>© {new Date().getFullYear()} <span className={`capitalize font-medium ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"}`}>{t.restaurantName}</span>. {t.allRightsReserved}</p>
        <button 
          onClick={() => setShowAdminLogin(true)}
          className={`mt-4 flex items-center gap-1 mx-auto ${isDarkMode ? "text-[#FDFBF7]/40" : "text-[#4A2C2A]/40"} hover:text-[#9D3C3C] transition-colors`}
        >
          <Lock size={12} />
          <span>Admin</span>
        </button>
      </footer>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className={`fixed inset-0 ${isDarkMode ? "bg-black/60" : "bg-[#4A2C2A]/40"} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${isDarkMode ? "bg-[#1E293B]" : "bg-white"} p-8 rounded-3xl w-full max-w-sm border border-[#4A2C2A]/5 shadow-2xl relative`}>
            <button 
              onClick={() => setShowAdminLogin(false)}
              className={`absolute top-5 right-5 ${isDarkMode ? "text-[#FDFBF7]/40" : "text-[#4A2C2A]/40"} ${isDarkMode ? "hover:text-[#FDFBF7]" : "hover:text-[#4A2C2A]"}`}
            >
              <X size={20} />
            </button>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} text-center`}>Admin Access</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="mb-6">
                <input 
                  type="password" 
                  placeholder="Enter PIN (1234)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className={`w-full ${isDarkMode ? "bg-[#0F172A]" : "bg-[#FDFBF7]"} border ${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"} rounded-2xl p-4 text-center text-xl tracking-[0.5em] ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} focus:outline-none focus:border-[#9D3C3C] focus:ring-1 focus:ring-[#9D3C3C] shadow-inner`}
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#9D3C3C] hover:bg-[#8A3434] text-white font-medium py-3.5 rounded-2xl transition-colors shadow-md shadow-[#9D3C3C]/20"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className={`fixed inset-0 ${isDarkMode ? "bg-black/60" : "bg-[#4A2C2A]/40"} backdrop-blur-md z-50 flex items-center justify-center p-4`} onClick={() => setShowQR(false)}>
          <div className={`${isDarkMode ? "bg-[#1E293B]" : "bg-white"} p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl border border-[#4A2C2A]/5`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"}`}>{t.scanMenu}</h2>
              <button 
                onClick={() => setShowQR(false)}
                className={`p-1.5 ${isDarkMode ? "text-[#FDFBF7]/40" : "text-[#4A2C2A]/40"} ${isDarkMode ? "hover:text-[#FDFBF7]" : "hover:text-[#4A2C2A]"} ${isDarkMode ? "hover:bg-white/5" : "hover:bg-[#FDFBF7]"} rounded-full transition-colors`}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className={`${isDarkMode ? "bg-white" : "bg-[#FDFBF7]"} p-5 rounded-3xl mb-6 inline-block border border-[#4A2C2A]/5 shadow-inner`}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=4A2C2A&bgcolor=FDFBF7`} 
                alt="Menu QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            
            <p className={`${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"} font-bold mb-2 capitalize text-lg`}>{t.restaurantName}</p>
            <p className={`text-sm ${isDarkMode ? "text-[#FDFBF7]/70" : "text-[#4A2C2A]/70"}`}>{t.scanDesc}</p>
          </div>
        </div>
      )}
      {/* Offline Notification Toast */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[100] bg-red-600 text-white px-5 py-3.5 rounded-3xl shadow-2xl flex items-center gap-3 text-sm font-medium w-[90%] max-w-md border border-red-500/50"
          >
            <WifiOff size={20} className="shrink-0 text-white" />
            <span className="leading-snug">{t.offlineMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

