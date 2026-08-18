const fs = require('fs');
let content = fs.readFileSync('bun.lock', 'utf8');

// A simple regex to remove trailing commas in JSON
// Finds a comma followed by any amount of whitespace and then a closing bracket or brace.
content = content.replace(/,\s*(?=[\]}])/g, match => match.replace(',', ''));

try {
  JSON.parse(content); // Test if it's valid JSON now
  fs.writeFileSync('bun.lock', content);
  console.log('Fixed bun.lock trailing commas.');
} catch (e) {
  console.error('Still invalid JSON:', e.message);
}
