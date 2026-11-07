// 站点语言：中文在根路径，英文在 /en/ 下。
export const LANGS = ['zh', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export type Text = Record<Lang, string>;

/** 给 [...lang] 路由用的 getStaticPaths 参数 */
export const langParams = [
  { params: { lang: undefined }, props: { lang: 'zh' as Lang } },
  { params: { lang: 'en' }, props: { lang: 'en' as Lang } },
];

export const htmlLang = (lang: Lang) => (lang === 'zh' ? 'zh-CN' : 'en');

/** 把与语言无关的站内路径（如 /apiIntro/）换成对应语言的地址 */
export function href(lang: Lang, path: string) {
  return lang === 'zh' ? path : `/en${path}`;
}

export const pick = (text: Text, lang: Lang) => text[lang];

const ui = {
  zh: {
    'site.title': 'FurryAPI - 福瑞内容开放接口',
    'site.description':
      'FurryAPI 提供免费的公开接口：随机兽装照片、IP 查询、一言、抖音解析，以及在线 IP 计算器。无需注册，复制地址就能用。',
    'skip': '跳到正文',
    'nav.label': '主导航',
    'nav.docs': '接口文档',
    'nav.thanks': '感谢名单',
    'nav.status': '服务状态',
    'lang.switch': 'English',
    'theme.toggle': '切换深色或浅色',
    'copy': '复制',
    'copied': '已复制',
    'copy.failed': '复制失败，请手动选择',

    'home.title': '福瑞内容的开放接口',
    'home.lead': '随机兽装照片、IP 查询、一言和抖音解析。免费，不用注册，复制地址就能用。',
    'cover.loading': '正在取一张照片',
    'cover.no': '第 {n} 号',
    'cover.large': '横图',
    'cover.box': '竖图',
    'cover.next': '换一张',
    'cover.copy': '复制接口地址',
    'cover.original': '在新标签页打开 4K 原图',
    'cover.failed': '照片没加载出来。',
    'cover.retry': '重试',
    'cover.via': '这张照片来自',

    'catalog.title': '接口',
    'catalog.all': '查看全部文档',
    'catalog.count': '共 {n} 个',

    'picks.title': '图库',
    'picks.summary': '{large} 张横图，{box} 张竖图，全部是 4K 原图。下面几张是从里面挑的。',
    'picks.open': '打开原图',

    'footer.about': '福瑞内容的开放接口。免费，不用注册。',
    'footer.apis': '接口',
    'footer.site': '站点',
    'footer.contact': '联系',
    'footer.friends': '友情链接',
    'footer.sitemap': '站点地图',
    'footer.email': '邮箱',
    'footer.contactCn': '联系页（国内）',
    'footer.contactGlobal': '联系页（海外）',

    'docs.title': '接口文档',
    'docs.lead': '所有接口都支持跨域调用，不需要密钥。地址可以直接用在网页、博客和机器人里。',
    'docs.nav': '全部接口',
    'docs.onThisPage': '本页',
    'docs.endpoint': '请求地址',
    'docs.playground': '在线试用',
    'docs.params': '参数',
    'docs.fields': '返回字段',
    'docs.errors': '错误',
    'docs.examples': '示例',
    'docs.notes': '说明',
    'docs.methods': '支持的请求方法',
    'docs.param.name': '参数',
    'docs.param.type': '类型',
    'docs.param.desc': '说明',
    'docs.param.example': '示例',
    'docs.param.required': '必填',
    'docs.param.default': '默认',
    'docs.param.path': '路径参数',
    'docs.field.name': '字段',
    'docs.error.code': '代码',
    'docs.error.when': '什么时候出现',
    'docs.error.body': '返回内容',
    'docs.response': '返回',
    'docs.hosts': '可用的地址',
    'docs.tool': '在线工具',
    'docs.openTool': '打开工具',

    'pg.send': '发送请求',
    'pg.sending': '请求中',
    'pg.url': '请求地址',
    'pg.preview': '预览',
    'pg.raw': '原始响应',
    'pg.empty': '选好参数后点“发送请求”，结果会显示在这里。',
    'pg.networkError': '请求没有发出去：{msg}。检查网络后再试一次。',
    'pg.optional': '可不填',
    'pg.any': '不限',
    'pg.presets': '试试这些',
  },
  en: {
    'site.title': 'FurryAPI - Open APIs for furry content',
    'site.description':
      'FurryAPI offers free public APIs: random fursuit photos, IP lookup, Hitokoto quotes, Douyin parsing, and an online IP calculator. No sign-up. Copy a URL and it works.',
    'skip': 'Skip to content',
    'nav.label': 'Main',
    'nav.docs': 'Docs',
    'nav.thanks': 'Thanks',
    'nav.status': 'Status',
    'lang.switch': '中文',
    'theme.toggle': 'Switch between dark and light',
    'copy': 'Copy',
    'copied': 'Copied',
    'copy.failed': 'Copy failed. Select the text instead.',

    'home.title': 'Open APIs for furry content',
    'home.lead': 'Random fursuit photos, IP lookup, Hitokoto quotes and Douyin parsing. Free, no sign-up. Copy a URL and it works.',
    'cover.loading': 'Fetching a photo',
    'cover.no': 'No. {n}',
    'cover.large': 'Landscape',
    'cover.box': 'Portrait',
    'cover.next': 'Another one',
    'cover.copy': 'Copy API URL',
    'cover.original': 'Open the 4K original in a new tab',
    'cover.failed': 'The photo didn’t load.',
    'cover.retry': 'Try again',
    'cover.via': 'This photo came from',

    'catalog.title': 'APIs',
    'catalog.all': 'All docs',
    'catalog.count': '{n} in total',

    'picks.title': 'The library',
    'picks.summary': '{large} landscape and {box} portrait photos, all 4K originals. A few picks from the collection:',
    'picks.open': 'Open original',

    'footer.about': 'Open APIs for furry content. Free, no sign-up.',
    'footer.apis': 'APIs',
    'footer.site': 'Site',
    'footer.contact': 'Contact',
    'footer.friends': 'Friends',
    'footer.sitemap': 'Sitemap',
    'footer.email': 'Email',
    'footer.contactCn': 'Contact page (China)',
    'footer.contactGlobal': 'Contact page (Global)',

    'docs.title': 'API docs',
    'docs.lead': 'Every API allows cross-origin requests and needs no key. Use the URLs directly in web pages, blogs and bots.',
    'docs.nav': 'All APIs',
    'docs.onThisPage': 'On this page',
    'docs.endpoint': 'Endpoint',
    'docs.playground': 'Try it',
    'docs.params': 'Parameters',
    'docs.fields': 'Response fields',
    'docs.errors': 'Errors',
    'docs.examples': 'Examples',
    'docs.notes': 'Notes',
    'docs.methods': 'Supported methods',
    'docs.param.name': 'Parameter',
    'docs.param.type': 'Type',
    'docs.param.desc': 'Description',
    'docs.param.example': 'Example',
    'docs.param.required': 'Required',
    'docs.param.default': 'Default',
    'docs.param.path': 'Path parameter',
    'docs.field.name': 'Field',
    'docs.error.code': 'Code',
    'docs.error.when': 'When it happens',
    'docs.error.body': 'Response',
    'docs.response': 'Response',
    'docs.hosts': 'Available hosts',
    'docs.tool': 'Online tool',
    'docs.openTool': 'Open the tool',

    'pg.send': 'Send request',
    'pg.sending': 'Sending',
    'pg.url': 'Request URL',
    'pg.preview': 'Preview',
    'pg.raw': 'Raw response',
    'pg.empty': 'Pick the parameters, then select “Send request”. The result shows up here.',
    'pg.networkError': 'The request didn’t go through: {msg}. Check your connection and try again.',
    'pg.optional': 'Optional',
    'pg.any': 'Any',
    'pg.presets': 'Try these',
  },
} satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['zh'];

/** 取界面文字，{name} 占位会被 vars 替换 */
export function t(lang: Lang, key: UiKey, vars: Record<string, string | number> = {}) {
  return ui[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** 只把指定的几条文字带到浏览器端脚本里用 */
export function uiSubset(lang: Lang, keys: UiKey[]) {
  return Object.fromEntries(keys.map((k) => [k, ui[lang][k]]));
}
