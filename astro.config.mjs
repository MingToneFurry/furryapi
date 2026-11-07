// @ts-check
import { defineConfig } from 'astro/config';
import fontSubset from './integrations/font-subset.mjs';

export default defineConfig({
  site: 'https://api.furry.ist',
  // 保持 v6 的空白处理，避免相邻行内元素之间的空格被吞掉
  compressHTML: true,
  build: { format: 'directory' },
  integrations: [
    // 脚本里动态写入、用宋体显示的字
    fontSubset({ extra: '第号张横图竖图加载中失败重试换一' }),
  ],
});
