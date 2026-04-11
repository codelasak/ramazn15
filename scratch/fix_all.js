const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, '..', 'app'), function(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Fix bg-white / bg-gray-50 / bg-gray-100 / bg-gray-50, etc. classes
  const regex = /className="([^"]+)"/g;
  content = content.replace(regex, (match, classStr) => {
    const hasLightBg = /\b(bg-white|bg-gray-50|bg-gray-100|bg-emerald-50|bg-teal-50|bg-[a-z]+-50)\b/.test(classStr);
    const hasTextColor = /\btext-(gray|black|primary|red|amber|indigo|slate|zinc|neutral|emerald|teal|lime)-([1-9]00|950)\b/.test(classStr);
    const hasTextWhite = /\btext-(white|transparent|current)\b/.test(classStr);
    
    // We only enforce text-gray-800 if it has a light BG and lacks an EXPLICIT dark text color
    if (hasLightBg && !hasTextColor && !hasTextWhite) {
      if (!/\btext-gray-800\b/.test(classStr) && !/\btext-gray-900\b/.test(classStr)) {
        return `className="${classStr} text-gray-800"`;
      }
    }
    
    // 2. Fallback for specific input types that might be transparent but still need text color
    // Inputs/selects usually have focus: borders or borders, meaning they are forms
    if (/\b(border-gray-200|border-gray-300|focus:ring-primary)\b/.test(classStr) && !hasTextColor && !hasTextWhite) {
      if (!/\btext-gray-800\b/.test(classStr) && !/\btext-gray-900\b/.test(classStr)) {
        return `className="${classStr} text-gray-800"`;
      }
    }

    return match;
  });

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
