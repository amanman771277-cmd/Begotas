import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "isDarkMode ? 'dark bg-[#0F172A] text-[#FDFBF7]' : 'bg-[#FDFBF7] text-[#4A2C2A]'",
  "isDarkMode ? 'bg-[#0F172A] text-[#FDFBF7]' : 'bg-[#FDFBF7] text-[#4A2C2A]'"
);

const replacements = [
  ['opacity-5 dark:opacity-10', 'opacity-5 ${isDarkMode ? "opacity-10" : ""}'],
  ['bg-[#FDFBF7]/90 dark:bg-[#0F172A]/90', '${isDarkMode ? "bg-[#0F172A]/90" : "bg-[#FDFBF7]/90"}'],
  ['border-[#4A2C2A]/10 dark:border-white/10', '${isDarkMode ? "border-white/10" : "border-[#4A2C2A]/10"}'],
  ['text-[#4A2C2A] dark:text-[#FDFBF7]', '${isDarkMode ? "text-[#FDFBF7]" : "text-[#4A2C2A]"}'],
  ['text-[#4A2C2A]/70 dark:text-[#FDFBF7]/70', '${isDarkMode ? "text-[#FDFBF7]/70" : "text-[#4A2C2A]/70"}'],
  ['dark:hover:text-[#9D3C3C]', ''], 
  ['hover:bg-[#4A2C2A]/5 dark:hover:bg-white/10', '${isDarkMode ? "hover:bg-white/10" : "hover:bg-[#4A2C2A]/5"}'],
  ['bg-white dark:bg-[#1E293B]', '${isDarkMode ? "bg-[#1E293B]" : "bg-white"}'],
  ['shadow-[#4A2C2A]/10 dark:shadow-black/50', '${isDarkMode ? "shadow-black/50" : "shadow-[#4A2C2A]/10"}'],
  ['hover:bg-[#FDFBF7] dark:hover:bg-white/5', '${isDarkMode ? "hover:bg-white/5" : "hover:bg-[#FDFBF7]"}'],
  ['ring-white dark:ring-[#1E293B]', '${isDarkMode ? "ring-[#1E293B]" : "ring-white"}'],
  ['text-[#4A2C2A]/60 dark:text-[#FDFBF7]/60', '${isDarkMode ? "text-[#FDFBF7]/60" : "text-[#4A2C2A]/60"}'],
  ['text-[#4A2C2A]/50 dark:text-[#FDFBF7]/50', '${isDarkMode ? "text-[#FDFBF7]/50" : "text-[#4A2C2A]/50"}'],
  ['dark:placeholder:text-[#FDFBF7]/40', ''], 
  ['placeholder:text-[#4A2C2A]/40', '${isDarkMode ? "placeholder:text-[#FDFBF7]/40" : "placeholder:text-[#4A2C2A]/40"}'],
  ['focus:border-[#9D3C3C] dark:focus:border-[#9D3C3C]', 'focus:border-[#9D3C3C]'],
  ['text-[#4A2C2A]/80 dark:text-[#FDFBF7]/80', '${isDarkMode ? "text-[#FDFBF7]/80" : "text-[#4A2C2A]/80"}'],
  ['dark:hover:text-[#FDFBF7]', ''], 
  ['hover:text-[#4A2C2A]', '${isDarkMode ? "hover:text-[#FDFBF7]" : "hover:text-[#4A2C2A]"}'],
  ['text-[#4A2C2A]/40 dark:text-[#FDFBF7]/40', '${isDarkMode ? "text-[#FDFBF7]/40" : "text-[#4A2C2A]/40"}'],
  ['dark:focus:ring-offset-[#0F172A]', ''],
  ['focus:ring-offset-[#FDFBF7]', '${isDarkMode ? "focus:ring-offset-[#0F172A]" : "focus:ring-offset-[#FDFBF7]"}'],
  ['bg-[#4A2C2A]/40 dark:bg-black/60', '${isDarkMode ? "bg-black/60" : "bg-[#4A2C2A]/40"}'],
  ['bg-[#FDFBF7] dark:bg-[#0F172A]', '${isDarkMode ? "bg-[#0F172A]" : "bg-[#FDFBF7]"}'],
  ['bg-[#FDFBF7] dark:bg-white', '${isDarkMode ? "bg-white" : "bg-[#FDFBF7]"}']
];

code = code.replace(/className="([^"]+)"/g, (match, p1) => {
  if (p1.includes('dark:')) {
    let newClass = p1;
    replacements.forEach(([from, to]) => {
      newClass = newClass.replace(from, to);
    });
    newClass = newClass.replace(/dark:\S+/g, '');
    return 'className={`' + newClass.trim().replace(/\s+/g, ' ') + '`}';
  }
  return match;
});

code = code.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
  if (p1.includes('dark:')) {
    let newClass = p1;
    replacements.forEach(([from, to]) => {
      newClass = newClass.replace(from, to);
    });
    newClass = newClass.replace(/dark:\S+/g, '');
    return 'className={`' + newClass.trim().replace(/\s+/g, ' ') + '`}';
  }
  return match;
});

fs.writeFileSync('src/App.tsx', code);
