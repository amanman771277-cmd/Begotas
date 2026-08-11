import fs from 'fs';

let code = fs.readFileSync('src/components/MenuCard.tsx', 'utf8');

if (!code.includes("ensureHttps")) {
  code = code.replace(
    "import { motion } from 'motion/react';",
    "import { motion } from 'motion/react';\nimport { ensureHttps } from '../utils';"
  );
}

// Add onError handler to img
const oldImg = `<img 
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
          alt={title} 
          className="w-full h-full object-cover rounded-t-3xl"
        />`;

const newImg = `<img 
          src={ensureHttps(item.image) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} 
          alt={title} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
          }}
          className="w-full h-full object-cover rounded-t-3xl"
        />`;

code = code.replace(oldImg, newImg);
fs.writeFileSync('src/components/MenuCard.tsx', code);
