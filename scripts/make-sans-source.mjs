// 一次性脚本：从完整的思源黑体可变字体（Noto Sans SC [wght]，约 17 MB）裁出仓库里用的字体源文件。
// 保留 GB2312 全部汉字和符号、ASCII、常用中文标点，字重轴收窄到 400–700。
// 构建时 integrations/font-subset.mjs 再从这份源文件里按页面实际用到的字裁出网页字体。
// 用法：node scripts/make-sans-source.mjs <NotoSansSC[wght].ttf>
// 下载：https://github.com/google/fonts/tree/main/ofl/notosanssc
import fs from 'node:fs';
import subsetFont from 'subset-font';

const src = process.argv[2];
if (!src) {
  console.error('用法：node scripts/make-sans-source.mjs <NotoSansSC[wght].ttf>');
  process.exit(2);
}

const decoder = new TextDecoder('gb2312');
let chars = '';
// GB2312 第 1–9 区是符号，16–87 区是汉字
for (let hi = 0xa1; hi <= 0xf7; hi++) {
  if (hi > 0xa9 && hi < 0xb0) continue;
  for (let lo = 0xa1; lo <= 0xfe; lo++) {
    const ch = decoder.decode(new Uint8Array([hi, lo]));
    if (ch !== '�') chars += ch;
  }
}
for (let c = 0x20; c < 0x7f; c++) chars += String.fromCharCode(c);
chars += ' ·×—‘’“”…　、。《》「」『』【】！（），：；？～';

const out = await subsetFont(fs.readFileSync(src), chars, {
  targetFormat: 'sfnt',
  variationAxes: { wght: { min: 400, max: 700, default: 500 } },
});
const dest = 'fonts-src/NotoSansSC-GB2312.ttf';
fs.writeFileSync(dest, out);
console.log(`${dest}：${[...new Set(chars)].length} 个字符，${(out.length / 1024 / 1024).toFixed(2)} MB`);
