// 自托管字体的 @font-face。字体文件由 integrations/font-subset.mjs 生成：
// 开发时地址固定为 /fonts/<id>.dev.woff2；构建时先写占位符，构建结束后换成带内容哈希的文件名。
// 西文正文和标题用 Inter（@fontsource-variable/inter，由 global.css 引入，随打包产物一起带哈希）。

export const FONTS = [
  {
    id: 'sans-sc',
    family: 'FA Sans SC',
    weight: '400 700',
    // 只接管中日韩字符、全角标点和中文引号，拉丁字母仍用 Inter
    range: 'U+2014, U+2018-2019, U+201C-201D, U+2026, U+2E80-2FDF, U+3000-303F, U+31C0-31EF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FE30-FE4F, U+FF00-FFEF',
  },
  { id: 'mono', family: 'FA Mono', weight: '400 700', range: '' },
] as const;

export type FontId = (typeof FONTS)[number]['id'];

export const fontUrl = (id: FontId) => (import.meta.env.DEV ? `/fonts/${id}.dev.woff2` : `__FONT_URL_${id}__`);

export const fontFaceCss = () =>
  FONTS.map(
    (f) =>
      `@font-face{font-family:"${f.family}";src:url(${fontUrl(f.id)}) format("woff2");font-weight:${f.weight};font-style:normal;font-display:swap;${f.range ? `unicode-range:${f.range};` : ''}}`,
  ).join('');
