// 从一段分享文字里找出抖音链接，在线试用会先用它处理输入。
// 只用标准 JavaScript，不引入 node:* 模块，浏览器里也能直接运行。

// 切分出的词：连续的可见 ASCII 字符（0x21 到 0x7e）。空白、中文和全角标点都不在其中，会把词分开。
// 因此词里不会出现中文标点，首尾只需要处理 ASCII 字符。
// 不能改用 new URL() 来切分：它遇到中文不会报错，而是把中文转义后拼进地址，错误会悄悄发生。
const WORD = /[\x21-\x7e]+/g;
// 词里再次出现协议时从那里断开，如 `https://a/,https://b/` 分成两段，各自判断
const SCHEME_START = /(?=https?:\/\/)/i;

const ALNUM = /[a-z0-9]/i;
// 词尾要去掉的标点
const CLOSE = `.,;:!?)]}>'"\``;

/**
 * 去掉词首的非字母数字字符（如开括号、引号、冒号）和词尾的标点。
 * 逐个字符去掉，长串标点时不会因为正则回溯而变慢。
 */
function trimPunctuation(word: string): string {
  let start = 0;
  let end = word.length;
  while (start < end && !ALNUM.test(word[start])) start += 1;
  while (end > start && CLOSE.includes(word[end - 1])) end -= 1;
  return word.slice(start, end);
}

const SCHEME = /^https?:\/\//i;
// 没有协议时，词要以抖音域名开头，之后补上 https://
const BARE_HOST = /^(?:[a-z0-9-]+\.)*(?:iesdouyin|douyin)\.com(?=[/?#:]|$)/i;
// 主机名要等于 douyin.com、iesdouyin.com，或以 .douyin.com、.iesdouyin.com 结尾，按整段匹配，不做子串匹配。
const DOUYIN_HOST = /(?:^|\.)(?:iesdouyin|douyin)\.com$/;

/** 词是抖音链接时返回标准写法和主机名，否则返回 null */
function douyinLink(word: string): { link: string; host: string } | null {
  let input: string;
  if (SCHEME.test(word)) input = word;
  else if (BARE_HOST.test(word)) input = `https://${word}`;
  else return null;

  try {
    // 返回 URL 解析后的标准写法，与校验时用的是同一份解析结果
    const url = new URL(input);
    return DOUYIN_HOST.test(url.hostname) ? { link: url.href, host: url.hostname } : null;
  } catch {
    // 例如 https:// 后面没有地址
    return null;
  }
}

/**
 * 从文字里找出抖音链接。
 * 优先返回 v.douyin.com 短链，其次是其他抖音链接；都没有时返回去掉首尾空白后的原文，
 * 非抖音链接因此仍会交给接口，由接口返回 UNSUPPORTED_HOST。
 */
export function extractDouyinUrl(input: string): string {
  const text = input.trim();
  let other: string | null = null;
  for (const [word] of text.matchAll(WORD)) {
    for (const part of word.split(SCHEME_START)) {
      const found = douyinLink(trimPunctuation(part));
      if (!found) continue;
      if (found.host === 'v.douyin.com') return found.link;
      other ??= found.link;
    }
  }
  return other ?? text;
}
