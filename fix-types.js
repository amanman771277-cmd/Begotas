import fs from 'fs';
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  "isDailySpecial?: boolean;",
  "isDailySpecial?: boolean;\n  createdAt?: string;"
);
fs.writeFileSync('src/types.ts', code);
