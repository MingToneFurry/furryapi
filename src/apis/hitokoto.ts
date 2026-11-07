import type { ApiDoc } from './types';

const CATS: [string, string, string][] = [
  ['a', '动画', 'Anime'],
  ['b', '漫画', 'Manga'],
  ['c', '游戏', 'Games'],
  ['d', '文学', 'Literature'],
  ['e', '原创', 'Original'],
  ['f', '来自网络', 'From the internet'],
  ['g', '其他', 'Other'],
  ['h', '影视', 'Film and TV'],
  ['i', '诗词', 'Poetry'],
  ['j', '网易云', 'NetEase Cloud Music'],
  ['k', '哲学', 'Philosophy'],
  ['l', '抖机灵', 'Witty'],
];

// TODO(并行任务)：补全返回字段、错误、分类表和示例
const hitokoto: ApiDoc = {
  kind: 'api',
  slug: 'hitokoto',
  category: 'text',
  order: 1,
  name: { zh: '一言', en: 'Hitokoto' },
  summary: {
    zh: '随机返回一句话，可以按分类和字数筛选。',
    en: 'A random quote, filtered by category and length if you like.',
  },
  intro: {
    zh: '随机返回一条句子，来源包括动画、漫画、游戏、文学、诗词等 12 个分类。可以按分类和字数筛选，返回 JSON 或纯文本。',
    en: 'Returns a random sentence from 12 categories, including anime, manga, games, literature and poetry. Filter by category and length, and get JSON or plain text.',
  },
  base: 'https://api.furry.ist/hitokoto',
  endpoints: [{ method: 'GET', url: 'https://api.furry.ist/hitokoto', label: { zh: '主地址', en: 'Primary' } }],
  methods: { zh: '`GET`、`HEAD`、`OPTIONS`', en: '`GET`, `HEAD`, `OPTIONS`' },
  params: [
    {
      name: 'c',
      type: 'enum',
      multiple: true,
      options: CATS.map(([value, zh, en]) => ({ value, label: { zh, en } })),
      desc: {
        zh: '分类，可以传多个，例如 `c=a&c=b`。不传或都无效时从全部分类里随机。',
        en: 'Category. Pass it more than once for several, e.g. `c=a&c=b`. If omitted or all invalid, any category can come up.',
      },
      example: 'c=a&c=b',
    },
    {
      name: 'encode',
      type: 'enum',
      default: 'json',
      options: [
        { value: 'json', label: { zh: 'JSON', en: 'JSON' } },
        { value: 'text', label: { zh: '纯文本', en: 'Plain text' } },
      ],
      desc: {
        zh: '`json` 返回完整信息；`text` 只返回句子本身。',
        en: '`json` returns everything; `text` returns just the sentence.',
      },
      example: 'encode=text',
    },
    {
      name: 'min_length',
      type: 'integer',
      desc: { zh: '句子最少字数（含）。', en: 'Minimum length in characters, inclusive.' },
      example: 'min_length=8',
    },
    {
      name: 'max_length',
      type: 'integer',
      desc: { zh: '句子最多字数（含）。', en: 'Maximum length in characters, inclusive.' },
      example: 'max_length=20',
    },
  ],
  examples: [{ title: { zh: '随机一句', en: 'A random quote' }, lang: 'url', code: 'https://api.furry.ist/hitokoto' }],
  playground: { preview: 'hitokoto' },
};

export default hitokoto;
