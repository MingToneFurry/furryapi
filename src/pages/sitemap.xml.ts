// 站点地图 /sitemap.xml：每个页面的中英文地址各一条，并用 xhtml:link 标出语言对应关系。
// 接口列表来自接口登记表（src/apis），新增接口后会自动出现在这里。
import type { APIRoute } from 'astro';
import { catalog, docPath } from '../apis';
import { href, type Lang } from '../i18n';
import { escapeHtml } from '../lib/format';

export const prerender = true;

// 与语言无关的站内路径；中文在根路径，英文在 /en/ 下
const paths = [...new Set(['/', '/apiIntro/', ...catalog.map((e) => docPath(e)), '/thank/'])];

const abs = (lang: Lang, path: string) => new URL(href(lang, path), import.meta.env.SITE).href;

export const GET: APIRoute = () => {
  const urls = paths.flatMap((path) =>
    (['zh', 'en'] as const).map((lang) => {
      // 每条地址都列出全部语言版本，x-default 指向中文
      const alternates = [
        `<xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeHtml(abs('zh', path))}"/>`,
        `<xhtml:link rel="alternate" hreflang="en" href="${escapeHtml(abs('en', path))}"/>`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(abs('zh', path))}"/>`,
      ];
      return [
        '  <url>',
        `    <loc>${escapeHtml(abs(lang, path))}</loc>`,
        ...alternates.map((a) => `    ${a}`),
        '  </url>',
      ].join('\n');
    }),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
