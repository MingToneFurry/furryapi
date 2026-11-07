// 文档里的说明文字：先转义 HTML，再把 `反引号` 包起来的部分变成 <code>。
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

export function inline(text: string) {
  return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** 去掉反引号，用于 meta 描述等纯文本场合 */
export const plain = (text: string) => text.replace(/`/g, '');

/** 千位分隔，中英文都用逗号 */
export const num = (n: number) => n.toLocaleString('en-US');

/** 示例返回：单行的 JSON 排版成多行，其他内容原样当纯文本 */
export function prettyResponse(text: string) {
  if (!/^\s*[[{]/.test(text)) return { code: text, language: 'plaintext' };
  try {
    return { code: JSON.stringify(JSON.parse(text), null, 2), language: 'json' };
  } catch {
    return { code: text, language: 'plaintext' };
  }
}
