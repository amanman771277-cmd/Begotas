import fs from 'fs';

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  "const updatedFields = { \n          ...formData,",
  "const updatedFields = { \n          ...formData, \n          image: ensureHttps(formData.image) || '',"
);

// We should also make sure it works if formData is on the same line
code = code.replace(
  "const updatedFields = { \n          ...formData, \n          price:",
  "const updatedFields = { \n          ...formData, \n          image: ensureHttps(formData.image) || '',\n          price:"
);

// Wait, let's just do a generic replace
code = code.replace(
  "...formData,",
  "...formData,\n          image: ensureHttps(formData.image) || '',"
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
