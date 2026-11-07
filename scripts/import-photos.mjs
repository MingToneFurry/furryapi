// 把 src/data/photos.json 里选中的照片从本地图库缩小后复制到 src/assets/photos/，构建时再生成各个尺寸。
// 图库不在这个仓库里（线上由 furry-img-pages 项目提供），所以换图后需要手动跑一次，并提交生成的文件。
// 用法：node scripts/import-photos.mjs <图库 public 目录，里面有 large/ 和 box/>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const lib = process.argv[2];
if (!lib || !fs.existsSync(path.join(lib, 'large'))) {
  console.error('用法：node scripts/import-photos.mjs <图库 public 目录>');
  process.exit(2);
}

const list = JSON.parse(fs.readFileSync('src/data/photos.json', 'utf8'));
const out = 'src/assets/photos';
fs.mkdirSync(out, { recursive: true });

// 首屏横版要铺满大屏，留到 2400 宽；首屏竖版给手机用；图片墙按长边 1600
const jobs = [
  ...list.heroLandscape.map((p) => ({ kind: 'large', n: p.n, resize: { width: 2400 } })),
  ...list.heroPortrait.map((p) => ({ kind: 'box', n: p.n, resize: { width: 1280 } })),
  ...list.gallery.map((p) => ({ kind: p.kind, n: p.n, resize: { width: 1600, height: 1600, fit: 'inside' } })),
];

const keep = new Set();
for (const job of jobs) {
  const name = `${job.kind}-${String(job.n).padStart(8, '0')}.webp`;
  keep.add(name);
  const dest = path.join(out, name);
  if (fs.existsSync(dest)) continue;
  await sharp(path.join(lib, job.kind, name.slice(job.kind.length + 1)))
    .resize({ ...job.resize, withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(dest);
  console.log(name, `${Math.round(fs.statSync(dest).size / 1024)} KB`);
}
for (const f of fs.readdirSync(out)) if (!keep.has(f)) fs.rmSync(path.join(out, f));
console.log(`共 ${keep.size} 张`);
