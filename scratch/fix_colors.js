const fs = require('fs');
const path = require('path');
const dPath = path.join(__dirname, '..', 'app', 'screens');

fs.readdirSync(dPath).forEach(f => {
  if (!f.endsWith('.tsx')) return;
  const filePath = path.join(dPath, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find all classNames
  const regex = /className="([^"]+)"/g;
  content = content.replace(regex, (match, classStr) => {
    // If it has bg-white, bg-gray-50, bg-emerald-50, etc. but NO text color
    const hasLightBg = /\b(bg-white|bg-gray-50|bg-emerald-50|bg-teal-50|bg-indigo-50|bg-lime-50|bg-red-50)\b/.test(classStr);
    const hasTextColor = /\btext-(gray|black|primary|red|amber|indigo|slate|zinc|neutral|emerald|teal|lime)-([1-9]00|950)\b/.test(classStr);
    const hasTextWhite = /\btext-white\b/.test(classStr);
    
    // We only enforce text-gray-800 if it has a light BG and lacks an EXPLICIT dark text color (or if it currently has text-white which is wrong for a light bg card unless it has an overlay)
    // Wait, earlier the user explicitly said "white cards on dark backgrounds must have dark text".
    // If it has light bg, and does NOT have explicit dark/red text color:
    if (hasLightBg && !hasTextColor && !hasTextWhite) {
      if (!/\btext-gray-800\b/.test(classStr)) {
        return `className="${classStr} text-gray-800"`;
      }
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${f}`);
});
