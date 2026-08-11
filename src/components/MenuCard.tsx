import React from 'react';
import { MenuItem, Language } from '../types';
import { motion } from 'motion/react';
import { ensureHttps } from '../utils';

interface MenuCardProps {
  key?: React.Key;
  item: MenuItem;
  lang: Language;
  isSpecialView?: boolean;
  isDarkMode?: boolean;
}

export function MenuCard({ item, lang, isSpecialView, isDarkMode }: MenuCardProps) {
  const isAm = lang === 'am';
  const title = isAm ? item.titleAm : item.titleEn;
  const description = isAm ? item.descriptionAm : item.descriptionEn;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className={`${isDarkMode ? 'bg-[#0F172A] shadow-black/50 border-white/10' : 'bg-white shadow-[#4A2C2A]/5 border-[#4A2C2A]/10'} rounded-3xl overflow-hidden shadow-lg border ${
        isSpecialView ? 'border-[#9D3C3C] ring-1 ring-[#9D3C3C]/50' : ''
      }`}
    >
      <div className="relative h-48 w-full">
        <img 
          src={ensureHttps(item.image) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} 
          alt={title} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
          }}
          className="w-full h-full object-cover rounded-t-3xl"
        />
        {isSpecialView && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#9D3C3C] text-white px-3 py-1.5 rounded-3xl text-xs font-bold shadow-md flex items-center gap-1">
              <span>✨</span> {isAm ? 'የዕለቱ ልዩ' : 'Special'}
            </span>
          </div>
        )}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {isAm ? 'አልቋል' : 'Out of Stock'}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="bg-[#9D3C3C]/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-3xl text-sm font-medium shadow-sm">
            {item.price} ETB
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-[#FDFBF7]' : 'text-[#4A2C2A]'}`}>{title}</h3>
          <span className="text-xs font-medium text-[#9D3C3C] bg-[#9D3C3C]/10 px-3 py-1.5 rounded-3xl ml-2 whitespace-nowrap">
            {item.category}
          </span>
        </div>
        <p className={`${isDarkMode ? 'text-[#FDFBF7]/70' : 'text-[#4A2C2A]/70'} text-sm line-clamp-2 leading-relaxed`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}
