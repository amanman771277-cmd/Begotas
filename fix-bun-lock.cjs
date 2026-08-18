const fs = require('fs');
let content = fs.readFileSync('bun.lock', 'utf8');

content = content.replace(/,\s*(?=[\]}])/g, match => match.substring(1));

try {
  JSON.parse(content);
  fs.writeFileSync('bun.lock', content);
  console.log('Fixed bun.lock trailing commas successfully.');
} catch (e) {
  console.error('Still invalid JSON:', e.message);
}
