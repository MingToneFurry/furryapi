// 结构化数据（JSON-LD）：告诉搜索引擎和 AI 这一页是什么（站点、接口、网页工具、面包屑）。
// 只写页面上本来就写着的事实。
import { docPath } from '../apis';
import type { ApiDoc, CatalogEntry } from '../apis/types';
import { href, pick, t, type Lang } from '../i18n';
import { plain } from './format';
import { EMAIL, FAVICON, SITE_ORIGIN } from './site';

type Node = Record<string, unknown>;

const abs = (lang: Lang, path: string) => new URL(href(lang, path), SITE_ORIGIN).href;
const inLanguage = (lang: Lang) => (lang === 'zh' ? 'zh-CN' : 'en');
const graph = (...nodes: Node[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

const ORG: Node = {
  '@type': 'Organization',
  '@id': `${SITE_ORIGIN}/#org`,
  name: 'FurryAPI',
  url: `${SITE_ORIGIN}/`,
  logo: FAVICON(5),
  email: EMAIL,
};

// 面包屑：首页 › 接口文档 › 当前页
function crumbs(lang: Lang, ...items: [string, string][]): Node {
  const all: [string, string][] = [[t(lang, 'crumb.home'), '/'], ...items];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: all.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(lang, path) })),
  };
}
const docsCrumb = (lang: Lang): [string, string] => [t(lang, 'docs.title'), '/apiIntro/'];

/** 首页：站点和发布方 */
export function homeSchema(lang: Lang) {
  return graph(ORG, {
    '@type': 'WebSite',
    '@id': `${abs(lang, '/')}#website`,
    name: 'FurryAPI',
    url: abs(lang, '/'),
    inLanguage: inLanguage(lang),
    description: t(lang, 'site.description'),
    publisher: { '@id': ORG['@id'] },
  });
}

/** 接口目录：列出全部接口和工具 */
export function catalogSchema(lang: Lang, list: CatalogEntry[]) {
  return graph(crumbs(lang, docsCrumb(lang)), {
    '@type': 'CollectionPage',
    name: t(lang, 'docs.title'),
    url: abs(lang, '/apiIntro/'),
    inLanguage: inLanguage(lang),
    description: t(lang, 'docs.lead'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: list.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: pick(e.name, lang), url: abs(lang, docPath(e)) })),
    },
  });
}

/** 接口文档页：免费的 Web API，列出它的请求地址 */
export function apiSchema(lang: Lang, doc: ApiDoc) {
  const url = abs(lang, docPath(doc));
  return graph(crumbs(lang, docsCrumb(lang), [pick(doc.name, lang), docPath(doc)]), {
    '@type': 'WebAPI',
    '@id': `${url}#api`,
    name: pick(doc.name, lang),
    description: plain(pick(doc.intro, lang)),
    url,
    documentation: url,
    inLanguage: inLanguage(lang),
    isAccessibleForFree: true,
    provider: ORG,
    // 带 {ip} 这类占位符的地址不是合法 URL，只列能直接访问的
    availableChannel: doc.endpoints
      .filter((e) => !e.url.includes('{'))
      .map((e) => ({ '@type': 'ServiceChannel', name: pick(e.label, lang), serviceUrl: e.url })),
  });
}

/** 网页工具（IP 计算器）：在浏览器里运行 */
export function toolSchema(lang: Lang, entry: CatalogEntry) {
  const url = abs(lang, docPath(entry));
  return graph(crumbs(lang, docsCrumb(lang), [pick(entry.name, lang), docPath(entry)]), {
    '@type': 'WebApplication',
    name: pick(entry.name, lang),
    description: plain(pick(entry.summary, lang)),
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    inLanguage: inLanguage(lang),
    provider: ORG,
  });
}

/** 图片来源页 */
export function creditsSchema(lang: Lang, name: string, description: string) {
  return graph(crumbs(lang, [name, '/thank/']), {
    '@type': 'CollectionPage',
    name,
    url: abs(lang, '/thank/'),
    inLanguage: inLanguage(lang),
    description,
  });
}
