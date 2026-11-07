// 接口登记表。新增接口：在本目录加一个文件，然后在下面的 entries 里登记。
// 首页目录、文档侧栏、站点地图和页脚都从这里生成。
import { CATEGORIES, type ApiDoc, type CatalogEntry, type ToolDoc } from './types';
import image from './image';
import ip from './ip';
import hitokoto from './hitokoto';
import douyin from './douyin';

const ipCalc: ToolDoc = {
  kind: 'tool',
  slug: 'ip-calc',
  category: 'tool',
  order: 1,
  name: { zh: 'IP 计算器', en: 'IP calculator' },
  summary: {
    zh: '子网、掩码、地址范围和进制换算，全部在浏览器里计算。',
    en: 'Subnets, masks, address ranges and base conversions, all worked out in your browser.',
  },
};

const entries: CatalogEntry[] = [image, ip, hitokoto, douyin, ipCalc];

export const catalog = [...entries].sort(
  (a, b) => CATEGORIES[a.category].order - CATEGORIES[b.category].order || a.order - b.order,
);

export const apis = catalog.filter((e): e is ApiDoc => e.kind === 'api');

export const docPath = (entry: CatalogEntry) => `/apiIntro/${entry.slug}/`;

/** 目录里显示的短地址，例如 /furry-img/ */
export function shortPath(entry: CatalogEntry) {
  if (entry.kind === 'tool') return null;
  return new URL(entry.base).pathname;
}

/** 按分类分组，保持分类顺序 */
export function groupByCategory(list: CatalogEntry[] = catalog) {
  const groups = new Map<CatalogEntry['category'], CatalogEntry[]>();
  for (const e of list) groups.set(e.category, [...(groups.get(e.category) ?? []), e]);
  return [...groups.entries()].map(([category, items]) => ({ category, name: CATEGORIES[category].name, items }));
}
