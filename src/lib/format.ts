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
