import type { ApiDoc } from './types';

// 分类：key、中文名（与接口返回的 type 一致）、英文名（对应 type_desc 里的英文标签）
const CATS: [string, string, string][] = [
  ['a', '动画', 'Anime'],
  ['b', '漫画', 'Comic'],
  ['c', '游戏', 'Game'],
  ['d', '文学', 'Literature'],
  ['e', '原创', 'Original'],
  ['f', '网络', 'Internet'],
  ['g', '其他', 'Other'],
  ['h', '影视', 'Video'],
  ['i', '诗词', 'Poem'],
  ['j', '网易云', 'NCM (NetEase Cloud Music)'],
  ['k', '哲学', 'Philosophy'],
  ['l', '抖机灵', 'Funny'],
];

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
        en: 'Repeat `c` to pick several, e.g. `c=a&c=b`. If omitted or every value is invalid, a random category is used.',
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
      desc: {
        zh: '句子最少字数（含），按字符计算，标点也算在内。',
        en: 'Minimum length in characters, inclusive. Punctuation counts toward the length.',
      },
      example: 'min_length=8',
    },
    {
      name: 'max_length',
      type: 'integer',
      desc: {
        zh: '句子最多字数（含），按字符计算，标点也算在内。',
        en: 'Maximum length in characters, inclusive. Punctuation counts toward the length.',
      },
      example: 'max_length=20',
    },
  ],
  fields: [
    {
      title: { zh: '`encode=json`（默认）时', en: 'With `encode=json` (default)' },
      items: [
        { name: 'id', type: 'Number', desc: { zh: '句子编号。', en: 'Sentence ID.' } },
        {
          name: 'uuid',
          type: 'String',
          desc: { zh: '句子的唯一标识符（UUID）。', en: 'Unique identifier of the sentence (UUID).' },
        },
        { name: 'hitokoto', type: 'String', desc: { zh: '句子正文。', en: 'The sentence itself.' } },
        {
          name: 'type',
          type: 'String',
          desc: {
            zh: '分类的中文名，与分类表里的名称一致。',
            en: 'Category name in Chinese, as listed in the category table.',
          },
        },
        {
          name: 'type_desc',
          type: 'String',
          desc: {
            zh: '分类的英文名和中文名，中间用 ` - ` 连接，例如 `Original - 原创`。`d`、`i`、`j` 三类的值后面还附一句分类说明。',
            en: 'English and Chinese names of the category, joined by ` - `, e.g. `Original - 原创`. Categories `d`, `i` and `j` also end with a sentence describing the category.',
          },
        },
        {
          name: 'from',
          type: 'String',
          desc: { zh: '来源作品或出处的名称。', en: 'Name of the source work or origin.' },
        },
        {
          name: 'from_who',
          type: 'String | null',
          desc: {
            zh: '作者或角色名，没有时为 `null`。',
            en: 'Author or character name. `null` when there is none.',
          },
        },
        {
          name: 'creator',
          type: 'String',
          desc: { zh: '录入者的名称。', en: 'Name of the user who submitted the sentence.' },
        },
        { name: 'creator_uid', type: 'Number', desc: { zh: '录入者的 UID。', en: 'UID of the submitter.' } },
        { name: 'reviewer', type: 'Number', desc: { zh: '审核者的 ID。', en: 'ID of the reviewer.' } },
        {
          name: 'commit_from',
          type: 'String',
          desc: {
            zh: '提交来源，例如 `web`、`app`、`api`。',
            en: 'Where the sentence was submitted from, e.g. `web`, `app` or `api`.',
          },
        },
        {
          name: 'created_at',
          type: 'String',
          desc: {
            zh: '录入时间，Unix 秒级时间戳，以字符串返回。',
            en: 'Submission time as a Unix timestamp in seconds, returned as a string.',
          },
        },
        {
          name: 'length',
          type: 'Number',
          desc: {
            zh: '句子的字符数，标点也算在内。',
            en: 'Length of the sentence in characters, punctuation included.',
          },
        },
      ],
    },
  ],
  tables: [
    {
      title: { zh: '分类', en: 'Categories' },
      head: [
        { zh: 'key', en: 'Key' },
        { zh: '分类', en: 'Category' },
      ],
      rows: CATS.map(([value, zh, en]) => [value, { zh, en }]),
    },
  ],
  errors: {
    note: {
      zh: '所有响应的 HTTP 状态码都是 `200`，错误码只在 JSON 的 `code` 字段中；`OPTIONS` 预检请求返回 `204`，没有响应体。',
      en: 'Every response uses HTTP status `200`, and error codes appear only in the `code` field of the JSON body. An `OPTIONS` preflight request returns `204` with no body.',
    },
    items: [
      {
        code: '405',
        when: {
          zh: '请求方法不是 `GET`、`HEAD` 或 `OPTIONS`',
          en: 'The request method is not `GET`, `HEAD` or `OPTIONS`',
        },
        body: '{"error":"Method Not Allowed","code":405}',
      },
      {
        code: '502',
        when: { zh: '数据源拉取或解析失败', en: 'The data source could not be fetched or parsed' },
        body: '{"error":"Internal error","code":502}',
      },
    ],
  },
  notes: [
    {
      zh: '长度筛选最多尝试 10 次。如果没有符合长度的句子，会忽略长度限制，仍在分类条件内随机返回一句。',
      en: 'Length filtering tries up to 10 times. If no sentence fits, it ignores the length limits and still picks a random sentence within the category filter.',
    },
    {
      zh: '多个分类要重复传 `c`，例如 `c=a&c=b`。不支持逗号分隔，`c=a,b` 会被当作无效值忽略。',
      en: 'To pick several categories, repeat `c`, as in `c=a&c=b`. Commas are not supported: `c=a,b` is an invalid value and is ignored.',
    },
    {
      zh: '参数值不合法时会被忽略，接口不报错，仍然返回一句。',
      en: 'Invalid parameter values are ignored. The request does not fail and still returns a sentence.',
    },
    {
      zh: '每次调用都返回随机一句。响应不缓存（`Cache-Control: no-store`），并允许跨域调用。',
      en: 'Each call returns a random sentence. Responses are not cached (`Cache-Control: no-store`) and allow cross-origin requests.',
    },
  ],
  examples: [
    {
      title: { zh: '随机一句（JSON）', en: 'A random sentence (JSON)' },
      desc: {
        zh: '每次请求都是随机的，下面是一次真实的返回。',
        en: 'Every request is random. The response below is a real one.',
      },
      lang: 'url',
      code: 'https://api.furry.ist/hitokoto',
      response: `{
  "id": 6212,
  "uuid": "e4c6a54a-be51-4cdd-88ab-3df273dbaa87",
  "hitokoto": "在不同的遭遇里我发现你的瞬间，有种不可言说的温柔直觉。",
  "type": "网易云",
  "from": "保留",
  "from_who": "郭顶",
  "creator": "陨星、若芜芫",
  "creator_uid": 6317,
  "reviewer": 1044,
  "commit_from": "web",
  "created_at": "1590718236",
  "length": 27,
  "type_desc": "NCM - 网易云。主要收录网易云音乐热评。"
}`,
    },
    {
      title: { zh: '只要动画', en: 'Anime only' },
      lang: 'url',
      code: 'https://api.furry.ist/hitokoto?c=a',
    },
    {
      title: { zh: '动画或漫画', en: 'Anime or comics' },
      lang: 'url',
      code: 'https://api.furry.ist/hitokoto?c=a&c=b',
    },
    {
      title: { zh: '只返回句子', en: 'Sentence only' },
      lang: 'url',
      code: 'https://api.furry.ist/hitokoto?encode=text',
      response: '我本来不想使出这一招的',
    },
    {
      title: { zh: '诗词，长度 8 到 20 字', en: 'Poetry, 8 to 20 characters' },
      lang: 'url',
      code: 'https://api.furry.ist/hitokoto?c=i&min_length=8&max_length=20',
    },
    {
      title: { zh: '在 JavaScript 里使用', en: 'From JavaScript' },
      desc: {
        zh: '页面里要有 `id` 为 `quote` 的元素。句子是用户投稿的，用 `textContent` 写入，不用 `innerHTML`。',
        en: 'The page needs an element with `id="quote"`. Sentences are submitted by users, so set them with `textContent`, not `innerHTML`.',
      },
      lang: 'js',
      code:
        "const res = await fetch('https://api.furry.ist/hitokoto?encode=text');\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\ndocument.querySelector('#quote').textContent = await res.text();",
    },
  ],
  playground: { preview: 'hitokoto' },
};

export default hitokoto;
