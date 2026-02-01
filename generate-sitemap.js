const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://api.furry.ist'; // TODO: 修改为你的实际域名
const ROOT = path.resolve(__dirname);

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith('.html')) {
      filelist.push(path.relative(ROOT, filepath).replace(/\\/g, '/'));
    }
  });
  return filelist;
}

const htmlFiles = walk(ROOT).filter(f => !f.startsWith('node_modules/'));
const urls = htmlFiles.map(f => `  <url>\n    <loc>${BASE_URL}/${f}</loc>\n  </url>`).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('sitemap.xml 已生成');
