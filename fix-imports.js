import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("firebase/firestore")) {
  code = code.replace(
    "import { MenuItem, Category, Language } from './types';",
    "import { MenuItem, Category, Language } from './types';\nimport { collection, onSnapshot } from 'firebase/firestore';\nimport { db } from './firebase';"
  );
  fs.writeFileSync('src/App.tsx', code);
}
