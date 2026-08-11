import fs from 'fs';
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace(
  "image: ensureHttps(formData.image) || ',",
  "image: ensureHttps(formData.image) || '',"
);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
