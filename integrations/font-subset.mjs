// 自托管网页字体按需裁剪。
// fonts 里每一项是一份字体：
//   id        文件名前缀，构建后的地址是 /fonts/<id>.<内容哈希>.woff2
//   source    源字体，相对项目根目录
//   selector  从构建出的 HTML 里收集这些元素的文字，只保留出现过的字（中文标题用）
//   text      额外固定保留的字符（脚本动态写入的文字、等宽字体的字符集）
//   cjkOnly   只保留中日韩字符和全角标点，拉丁字母交给别的字体
//   axes      可变字体保留的轴范围
// 构建：生成 dist/fonts/<id>.<哈希>.woff2，再把 HTML 里的 __FONT_URL_<id>__ 换成这个地址（见 src/lib/fonts.ts）。
// 开发：按 src/ 里出现过的全部字符生成一份较大的字体，开发服务器在 /fonts/<id>.dev.woff2 提供。
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import { parse } from 'node-html-parser';

const isCjk = (ch) => {
  const p = ch.codePointAt(0);
  return p >= 0x2e80 || (p >= 0x2018 && p <= 0x201d) || p === 0x2026 || p === 0x2014;
};

async function walk(dir, exts, out = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(p, exts, out);
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

async function subset(root, font, collected) {
  let chars = [...new Set((font.text ?? '') + collected)];
  if (font.cjkOnly) chars = chars.filter(isCjk);
  const buf = await subsetFont(await fs.readFile(path.join(root, font.source)), chars.join('') + ' ', {
    targetFormat: 'woff2',
    ...(font.axes ? { variationAxes: font.axes } : {}),
  });
  return { buf, count: chars.length };
}

export default function fontSubset({ fonts = [] } = {}) {
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
        const built = new Map();
        const ready = (async () => {
          const files = await walk(path.join(root, 'src'), ['.astro', '.ts', '.js', '.mjs', '.json', '.md']);
          let text = '';
          for (const f of files) text += await fs.readFile(f, 'utf8');
          for (const font of fonts) {
            const { buf, count } = await subset(root, font, font.selector ? text : '');
            built.set(font.id, buf);
            logger.info(`开发用字体 ${font.id}：${count} 个字符，${(buf.length / 1024).toFixed(1)} KB`);
          }
        })();
        server.middlewares.use(async (req, res, next) => {
          const m = (req.url || '').split('?')[0].match(/^\/fonts\/([\w-]+)\.dev\.woff2$/);
          if (!m || !fonts.some((f) => f.id === m[1])) return next();
          await ready;
          res.setHeader('Content-Type', 'font/woff2');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(built.get(m[1]));
        });
      },

      'astro:build:done': async ({ dir }) => {
        const out = fileURLToPath(dir);
        const htmlFiles = await walk(out, ['.html']);
        const docs = await Promise.all(htmlFiles.map(async (f) => parse(await fs.readFile(f, 'utf8'))));
        await fs.mkdir(path.join(out, 'fonts'), { recursive: true });

        const urls = {};
        for (const font of fonts) {
          let text = '';
          if (font.selector) for (const doc of docs) for (const el of doc.querySelectorAll(font.selector)) text += el.textContent;
          const { buf, count } = await subset(root, font, text);
          const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
          const file = `${font.id}.${hash}.woff2`;
          await fs.writeFile(path.join(out, 'fonts', file), buf);
          urls[font.id] = `/fonts/${file}`;
          logger.info(`字体 ${file}：${count} 个字符，${(buf.length / 1024).toFixed(1)} KB`);
        }

        let replaced = 0;
        for (const f of htmlFiles) {
          let src = await fs.readFile(f, 'utf8');
          if (!src.includes('__FONT_URL_')) continue;
          for (const [id, url] of Object.entries(urls)) src = src.replaceAll(`__FONT_URL_${id}__`, url);
          await fs.writeFile(f, src);
          replaced++;
        }
        logger.info(`更新了 ${replaced} 个页面里的字体地址`);
      },
    },
  };
}
