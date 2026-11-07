import { defineConfig } from 'astro/config';
import fontSubset from './integrations/font-subset.mjs';

// 等宽字体固定保留的字符：ASCII、常用符号和箭头。接口地址、编号和代码都用它
const MONO_TEXT =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '·×÷–—‘’“”…•°±←↑→↓↗↘✓';

export default defineConfig({
  site: 'https://api.furry.ist',
  compressHTML: true,
  // 输出路径跟源文件一致：xxx/index.astro 生成 xxx/index.html，en/404.astro 生成 en/404.html（Pages 的英文 404）
  build: { format: 'preserve' },
  // 缓存放在项目里：几个工作树共用一份 node_modules，默认缓存目录会互相干扰
  cacheDir: './.astro-cache',
  integrations: [
    fontSubset({
      fonts: [
        {
          id: 'sans-sc',
          source: 'fonts-src/NotoSansSC-GB2312.ttf',
          selector: 'h1, h2, h3, [data-display]',
          cjkOnly: true,
          axes: { wght: { min: 400, max: 700 } },
        },
        { id: 'mono', source: 'fonts-src/JetBrainsMono-VF.ttf', text: MONO_TEXT, axes: { wght: { min: 400, max: 700 } } },
      ],
    }),
  ],
});
