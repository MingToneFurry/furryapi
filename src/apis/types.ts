// 接口登记表的类型。每个接口一个文件，放在 src/apis/ 下，再在 index.ts 里登记。
// 文字一律中英双语；说明文字里可以用 `反引号` 标出代码。
import type { Text } from '../i18n';

export type Category = 'image' | 'network' | 'text' | 'media' | 'tool';

export const CATEGORIES: Record<Category, { order: number; name: Text }> = {
  image: { order: 1, name: { zh: '图像', en: 'Images' } },
  network: { order: 2, name: { zh: '网络', en: 'Network' } },
  text: { order: 3, name: { zh: '文本', en: 'Text' } },
  media: { order: 4, name: { zh: '媒体', en: 'Media' } },
  tool: { order: 5, name: { zh: '工具', en: 'Tools' } },
};

export interface Param {
  name: string;
  /** 默认是查询参数；路径参数会拼在地址末尾 */
  in?: 'query' | 'path';
  type: 'string' | 'integer' | 'enum';
  /** 可以重复传多次，如 c=a&c=b */
  multiple?: boolean;
  required?: boolean;
  default?: string;
  options?: { value: string; label: Text }[];
  placeholder?: string;
  desc: Text;
  example?: string;
}

export interface Field {
  name: string;
  type: string;
  desc: Text;
}

export interface ErrorCase {
  code: string;
  when: Text;
  body: string;
}

export interface Example {
  title: Text;
  desc?: Text;
  lang: 'url' | 'html' | 'markdown' | 'js' | 'bash' | 'css' | 'json';
  code: string;
  /** 示例返回，原样显示为 JSON 或纯文本 */
  response?: string;
}

export interface Endpoint {
  method: 'GET';
  url: string;
  label: Text;
  note?: Text;
}

export interface ApiDoc {
  kind: 'api';
  /** 文档地址 /apiIntro/<slug>/，沿用旧站路径，发布后不要改 */
  slug: string;
  category: Category;
  order: number;
  name: Text;
  /** 目录里的一句话 */
  summary: Text;
  /** 文档页开头的导语 */
  intro: Text;
  endpoints: Endpoint[];
  /** 在线试用和示例都基于这个地址 */
  base: string;
  methods?: Text;
  params: Param[];
  fields?: { title?: Text; items: Field[] }[];
  tables?: { title: Text; head: Text[]; rows: (string | Text)[][] }[];
  errors?: { note?: Text; items: ErrorCase[] };
  notes?: Text[];
  examples: Example[];
  playground: {
    /** 结果预览的样式，不填则只显示原始响应 */
    preview?: 'image' | 'hitokoto' | 'ip' | 'douyin';
    presets?: { label: Text; values: Record<string, string> }[];
  };
}

export interface ToolDoc {
  kind: 'tool';
  slug: string;
  category: Category;
  order: number;
  name: Text;
  summary: Text;
}

export type CatalogEntry = ApiDoc | ToolDoc;
