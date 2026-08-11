import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!code.includes("ensureHttps")) {
  code = code.replace(
    "import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';",
    "import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';\nimport { ensureHttps } from '../utils';"
  );
}

// In handleSave, ensure we save HTTPS url:
// image: formData.image || '', -> image: ensureHttps(formData.image) || '',

code = code.replace(
  "image: formData.image || '',",
  "image: ensureHttps(formData.image) || '',"
);

// We need to also fix the <img /> in AdminPanel.tsx table
const oldImg = `<img src={item.image} alt={item.titleEn} className="w-full h-full object-cover" />`;
const newImg = `<img 
                              src={ensureHttps(item.image)} 
                              alt={item.titleEn} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
                              }}
                              className="w-full h-full object-cover" 
                            />`;

code = code.replace(oldImg, newImg);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
