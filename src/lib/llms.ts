// 给 AI 助手和编程代理读的 Markdown：/llms.txt 是站点目录（格式见 https://llmstxt.org），
// /llms-full.txt（中文）和 /en/llms-full.txt（英文）是完整的接口文档。
// 内容都从接口登记表（src/apis）生成，和文档页一致；说明文字里的 `反引号` 本来就是 Markdown 的行内代码，原样输出。
import { apis, catalog, docPath } from '../apis';
import type { ApiDoc, CatalogEntry, Param, ToolDoc } from '../apis/types';
import { href, pick, t, type Lang } from '../i18n';
import { num, prettyResponse } from './format';
import { SITE_ORIGIN, STATUS_URL } from './site';
import { creators } from './sources';

const abs = (lang: Lang, path: string) => new URL(href(lang, path), SITE_ORIGIN).href;

// 只在这几份 Markdown 里用到的句子，不是界面文字
const WORDS = {
  zh: {
    title: 'FurryAPI 接口文档',
    about: '所有接口免费使用，不需要注册和密钥，都支持跨域调用（CORS）。',
    other: '英文版',
    status: '服务状态',
    credits: (n: string) => `图库里的照片来自 ${n} 位 X 创作者公开发布的作品，版权归各自的创作者所有。名单`,
    page: '文档页',
    noParams: '没有参数。',
    tool: '这是网页工具，没有对应的 HTTP 接口。',
  },
  en: {
    title: 'FurryAPI API reference',
    about: 'Every API is free to use, needs no sign-up or API key, and supports cross-origin requests (CORS).',
    other: 'Chinese version',
    status: 'Service status',
    credits: (n: string) => `Photos in the library were published publicly on X by ${n} creators, who keep the copyright. List`,
    page: 'Docs page',
    noParams: 'No parameters.',
    tool: 'This is a web tool; there is no HTTP API for it.',
  },
};

const colon = (lang: Lang) => (lang === 'zh' ? '：' : ': ');
const paren = (lang: Lang, items: string[]) => (lang === 'zh' ? `（${items.join('，')}）` : ` (${items.join(', ')})`);

// 代码块的围栏比内容里最长的一串反引号还长，内容里有 ``` 也不会提前结束
function fence(code: string, language: string) {
  const longest = Math.max(2, ...(code.match(/`+/g) ?? []).map((s) => s.length));
  const bar = '`'.repeat(longest + 1);
  return `${bar}${language}\n${code.replace(/\n+$/, '')}\n${bar}`;
}

const indent = (text: string) => text.replace(/^/gm, '  ');

// 表格单元格里的 | 要转义，换行换成空格
function table(head: string[], rows: string[][]) {
  const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
  const line = (cells: string[]) => `| ${cells.map(cell).join(' | ')} |`;
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}

function response(text: string) {
  const r = prettyResponse(text);
  return fence(r.code, r.language === 'json' ? 'json' : 'text');
}

function param(p: Param, lang: Lang) {
  const tags = [
    p.type,
    p.in === 'path' ? t(lang, 'docs.param.path') : '',
    p.required ? t(lang, 'docs.param.required') : '',
    p.multiple ? t(lang, 'docs.param.multiple') : '',
    p.default ? `${t(lang, 'docs.param.default')} \`${p.default}\`` : '',
  ]
    .filter(Boolean)
    // 界面上的标签首字母大写（Required），放进英文句子里改成小写开头
    .map((s) => (lang === 'en' ? s.charAt(0).toLowerCase() + s.slice(1) : s));
  let line = `- \`${p.name}\`${paren(lang, tags)}${colon(lang)}${pick(p.desc, lang)}`;
  if (p.example) line += `${lang === 'zh' ? '' : ' '}${t(lang, 'docs.param.example')}${colon(lang)}\`${p.example}\``;
  const options = (p.options ?? []).map((o) => `  - \`${o.value}\`${colon(lang)}${pick(o.label, lang)}`);
  return [line, ...options];
}

function apiMarkdown(doc: ApiDoc, lang: Lang) {
  const out = [`## ${pick(doc.name, lang)}`, '', `${WORDS[lang].page}${colon(lang)}${abs(lang, docPath(doc))}`, '', pick(doc.intro, lang), ''];

  out.push(`### ${t(lang, 'docs.endpoint')}`, '');
  for (const e of doc.endpoints) {
    const note = e.note ? `${colon(lang)}${pick(e.note, lang)}` : '';
    out.push(`- \`${e.method} ${e.url}\`${paren(lang, [pick(e.label, lang)])}${note}`);
  }
  if (doc.methods) out.push('', `${t(lang, 'docs.methods')}${colon(lang)}${pick(doc.methods, lang)}`);
  out.push('');

  out.push(`### ${t(lang, 'docs.params')}`, '');
  out.push(...(doc.params.length ? doc.params.flatMap((p) => param(p, lang)) : [WORDS[lang].noParams]), '');

  if (doc.fields) {
    out.push(`### ${t(lang, 'docs.fields')}`, '');
    const head = [t(lang, 'docs.field.name'), t(lang, 'docs.param.type'), t(lang, 'docs.param.desc')];
    for (const g of doc.fields) {
      if (g.title) out.push(`#### ${pick(g.title, lang)}`, '');
      out.push(table(head, g.items.map((f) => [`\`${f.name}\``, `\`${f.type}\``, pick(f.desc, lang)])), '');
    }
  }

  for (const tb of doc.tables ?? []) {
    const rows = tb.rows.map((r) => r.map((c, j) => {
      const s = typeof c === 'string' ? c : pick(c, lang);
      return j === 0 ? `\`${s}\`` : s;
    }));
    out.push(`### ${pick(tb.title, lang)}`, '', table(tb.head.map((h) => pick(h, lang)), rows), '');
  }

  if (doc.errors) {
    out.push(`### ${t(lang, 'docs.errors')}`, '');
    if (doc.errors.note) out.push(pick(doc.errors.note, lang), '');
    for (const e of doc.errors.items) {
      out.push(`- \`${e.code}\`${colon(lang)}${pick(e.when, lang)}`, '', indent(response(e.body)), '');
    }
  }

  if (doc.notes) out.push(`### ${t(lang, 'docs.notes')}`, '', ...doc.notes.map((n) => `- ${pick(n, lang)}`), '');

  out.push(`### ${t(lang, 'docs.examples')}`, '');
  for (const ex of doc.examples) {
    out.push(`#### ${pick(ex.title, lang)}`, '');
    if (ex.desc) out.push(pick(ex.desc, lang), '');
    out.push(fence(ex.code, ex.lang === 'url' ? 'text' : ex.lang), '');
    if (ex.response) out.push(`${t(lang, 'docs.response')}${colon(lang)}`, '', response(ex.response), '');
  }
  return out.join('\n');
}

function toolMarkdown(tool: ToolDoc, lang: Lang) {
  const sep = lang === 'zh' ? '' : ' ';
  return [
    `## ${pick(tool.name, lang)}`,
    '',
    `${WORDS[lang].page}${colon(lang)}${abs(lang, docPath(tool))}`,
    '',
    `${pick(tool.summary, lang)}${sep}${WORDS[lang].tool}`,
    '',
  ].join('\n');
}

/** /llms-full.txt 和 /en/llms-full.txt：完整接口文档 */
export function llmsFull(lang: Lang) {
  const W = WORDS[lang];
  const other: Lang = lang === 'zh' ? 'en' : 'zh';
  return [
    `# ${W.title}`,
    '',
    `> ${t(lang, 'site.description')}`,
    '',
    W.about,
    '',
    `- ${t(lang, 'docs.title')}${colon(lang)}${abs(lang, '/apiIntro/')}`,
    `- ${W.other}${colon(lang)}${abs(other, '/llms-full.txt')}`,
    `- ${W.status}${colon(lang)}${STATUS_URL}`,
    `- ${W.credits(num(creators().length))}${colon(lang)}${abs(lang, '/thank/')}`,
    '',
    ...catalog.map((e) => (e.kind === 'api' ? apiMarkdown(e, lang) : toolMarkdown(e, lang))),
  ].join('\n');
}

/** /llms.txt：中英双语的站点目录，指向完整文档和各个文档页 */
export function llmsIndex() {
  const n = num(creators().length);
  const entry = (e: CatalogEntry) => {
    const endpoint = e.kind === 'api' ? ` \`${e.base}\`` : '';
    return `- [${pick(e.name, 'zh')} / ${pick(e.name, 'en')}](${abs('zh', docPath(e))}):${endpoint} ${pick(e.summary, 'zh')} ${pick(e.summary, 'en')} English: ${abs('en', docPath(e))}`;
  };
  return [
    '# FurryAPI',
    '',
    `> ${t('zh', 'site.description')}`,
    '>',
    `> ${t('en', 'site.description')}`,
    '',
    `${WORDS.zh.about} ${WORDS.en.about}`,
    '',
    '中文页面在根路径，英文页面在 /en/ 下。Chinese pages are at the root; English pages are under /en/.',
    '',
    '## 完整文档 / Full reference',
    '',
    `- [接口文档全文（中文）](${abs('zh', '/llms-full.txt')}): 全部接口的请求地址、参数、返回字段、错误和示例`,
    `- [Full API reference (English)](${abs('en', '/llms-full.txt')}): endpoints, parameters, response fields, errors and examples for every API`,
    '',
    '## 接口 / APIs',
    '',
    ...apis.map(entry),
    '',
    '## 工具 / Tools',
    '',
    ...catalog.filter((e) => e.kind === 'tool').map(entry),
    '',
    '## Optional',
    '',
    `- [图片来源 / Photo credits](${abs('zh', '/thank/')}): 照片来自 ${n} 位 X 创作者，版权归各自的创作者所有。Photos by ${n} creators on X, who keep the copyright.`,
    `- [服务状态 / Service status](${STATUS_URL})`,
    `- [站点地图 / Sitemap](${SITE_ORIGIN}/sitemap.xml)`,
    '',
  ].join('\n');
}
