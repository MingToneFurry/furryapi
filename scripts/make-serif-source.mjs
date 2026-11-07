// 一次性脚本：从完整的思源宋体可变字体（Noto Serif SC [wght]，约 25 MB）裁出仓库里用的字体源文件。
// 保留 GB2312 全部汉字和符号、ASCII、常用中文标点，字重轴收窄到 400–600。
// 用法：node scripts/make-serif-source.mjs <NotoSerifSC[wght].ttf>
// 下载：https://github.com/google/fonts/tree/main/ofl/notoserifsc
import fs from 'node:fs';
import subsetFont from 'subset-font';

const src = process.argv[2];
if (!src) {
  console.error('用法：node scripts/make-serif-source.mjs <NotoSerifSC[wght].ttf>');
  process.exit(2);
}

const decoder = new TextDecoder('gb2312');
let chars = '';
// GB2312 第 1–9 区是符号，16–87 区是汉字
for (let hi = 0xa1; hi <= 0xf7; hi++) {
  if (hi > 0xa9 && hi < 0xb0) continue;
  for (let lo = 0xa1; lo <= 0xfe; lo++) {
    const ch = decoder.decode(new Uint8Array([hi, lo]));
    if (ch !== '\ufffd') chars += ch;
  }
}
for (let c = 0x20; c < 0x7f; c++) chars += String.fromCharCode(c);
chars += '\u00a0\u00b7\u00d7\u2014\u2018\u2019\u201c\u201d\u2026\u3000\u3001\u3002\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff5e';

const out = await subsetFont(fs.readFileSync(src), chars, {
  targetFormat: 'sfnt',
  variationAxes: { wght: { min: 400, max: 600, default: 400 } },
});
const dest = 'fonts-src/NotoSerifSC-GB2312-400-600.ttf';
fs.writeFileSync(dest, out);
console.log(`${dest}：${[...new Set(chars)].length} 个字符，${(out.length / 1024 / 1024).toFixed(2)} MB`);
