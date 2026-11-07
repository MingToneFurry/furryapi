// 宋体标题字体按需裁剪。
// 构建：扫描 dist 里所有 HTML 中用宋体显示的元素（h1–h4、.serif、[data-serif]），
//       只把出现过的字打包成 dist/fonts/serif-sc.woff2 和 serif-latin.woff2，
//       再把 CSS / HTML 里的 __FONT_VERSION__ 换成内容哈希，让浏览器缓存随内容更新。
// 开发：启动时按 src/ 里出现过的全部汉字生成一份较大的字体，由开发服务器直接提供。
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';
import { parse } from 'node-html-parser';

const SERIF_SELECTOR = 'h1, h2, h3, h4, .serif, [data-serif]';
const PLACEHOLDER = '__FONT_VERSION__';
const CJK_SOURCE = 'fonts-src/NotoSerifSC-GB2312-400-600.ttf';
const LATIN_SOURCE = '@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2';
// 拉丁字体始终保留完整 ASCII 和常用排版符号，供脚本动态写入的文字使用
const LATIN_BASE = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + ' ·×–—‘’“”…←→−';

const isCjk = (ch) => ch.codePointAt(0) >= 0x2e80;

async function walk(dir, exts, out = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, exts, out);
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

async function buildFonts(root, text) {
  const require = createRequire(path.join(root, 'package.json'));
  const chars = [...new Set(text)];
  const cjk = chars.filter(isCjk).join('');
  const latin = [...new Set(LATIN_BASE + chars.filter((c) => !isCjk(c)).join(''))].join('');
  const [sc, lat] = await Promise.all([
    subsetFont(await fs.readFile(path.join(root, CJK_SOURCE)), cjk + '　', { targetFormat: 'woff2' }),
    subsetFont(await fs.readFile(require.resolve(LATIN_SOURCE)), latin, {
      targetFormat: 'woff2',
      variationAxes: { wght: { min: 400, max: 600 } },
    }),
  ]);
  return { sc, lat, cjkCount: [...cjk].length };
}

export default function fontSubset({ extra = '' } = {}) {
  let root = '';
  let logger;
  return {
    name: 'furryapi:font-subset',
    hooks: {
      'astro:config:setup': ({ config, logger: l }) => {
        root = fileURLToPath(config.root);
        logger = l;
      },

      'astro:server:setup': async ({ server }) => {
        let fonts;
        const ready = (async () => {
          const files = await walk(path.join(root, 'src'), ['.astro', '.ts', '.js', '.mjs', '.json', '.md']);
          let text = extra;
          for (const f of files) text += await fs.readFile(f, 'utf8');
          fonts = await buildFonts(root, text);
          logger.info(`开发用宋体：${fonts.cjkCount} 个汉字和符号`);
        })();
        server.middlewares.use(async (req, res, next) => {
          const url = (req.url || '').split('?')[0];
          if (url !== '/fonts/serif-sc.woff2' && url !== '/fonts/serif-latin.woff2') return next();
          await ready;
          res.setHeader('Content-Type', 'font/woff2');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(url.endsWith('-sc.woff2') ? fonts.sc : fonts.lat);
        });
      },

      'astro:build:done': async ({ dir }) => {
        const out = fileURLToPath(dir);
        const htmlFiles = await walk(out, ['.html']);
        let text = extra;
        for (const f of htmlFiles) {
          const doc = parse(await fs.readFile(f, 'utf8'));
          for (const el of doc.querySelectorAll(SERIF_SELECTOR)) text += el.textContent;
        }
        const { sc, lat, cjkCount } = await buildFonts(root, text);
        await fs.mkdir(path.join(out, 'fonts'), { recursive: true });
        await fs.writeFile(path.join(out, 'fonts/serif-sc.woff2'), sc);
        await fs.writeFile(path.join(out, 'fonts/serif-latin.woff2'), lat);

        const version = crypto.createHash('sha256').update(sc).update(lat).digest('hex').slice(0, 10);
        const targets = await walk(out, ['.html', '.css']);
        let replaced = 0;
        for (const f of targets) {
          const src = await fs.readFile(f, 'utf8');
          if (!src.includes(PLACEHOLDER)) continue;
          await fs.writeFile(f, src.replaceAll(PLACEHOLDER, version));
          replaced++;
        }
        logger.info(
          `宋体子集：${cjkCount} 个汉字和符号，serif-sc ${(sc.length / 1024).toFixed(1)} KB，serif-latin ${(lat.length / 1024).toFixed(1)} KB，更新了 ${replaced} 个文件的版本号`,
        );
      },
    },
  };
}
