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
  if (!filePath.endsWith('.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Revert and apply dark variations for the texts
  content = content.replace(/\btext-gray-800\b(?! dark:text-gray-900)/g, 'text-gray-800 dark:text-gray-900');
  content = content.replace(/\btext-gray-600\b(?! dark:text-gray-700)/g, 'text-gray-500 dark:text-gray-700');
  content = content.replace(/\btext-gray-500\b(?! dark:text-gray-600)(?! dark:text-gray-700)/g, 'text-gray-400 dark:text-gray-600');

  // Fix backgrounds
  if (filePath.includes('WorshipScreen.tsx')) {
    content = content.replace(
      'bg-gradient-to-b from-emerald-50 to-teal-50/50',
      'bg-gradient-to-b from-emerald-50 to-teal-50/50 dark:from-transparent dark:to-transparent'
    );
  }

  if (filePath.includes('takip\\page.tsx') || filePath.includes('takip/page.tsx')) {
    content = content.replace(
      'bg-slate-50',
      'bg-slate-50 dark:bg-transparent'
    );
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
});
