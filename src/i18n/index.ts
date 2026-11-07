// 站点语言：中文在根路径，英文在 /en/ 下。
export const LANGS = ['zh', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export type Text = Record<Lang, string>;

/** 给 [...lang] 路由用的 getStaticPaths 参数。每次返回新对象：Astro 构建时会改动传进去的参数对象，多个页面共用同一份会出错 */
export const langParams = () => [
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
    'nav.apis': '接口',
    'nav.docs': '接口文档',
    'nav.gallery': '图库',
    'nav.sources': '图片来源',
    'nav.status': '服务状态',
    'lang.switch': 'English',
    'copy': '复制',
    'copied': '已复制',
    'copy.failed': '复制失败，请手动选择',

    'hero.title1': '兽装摄影，',
    'hero.title2': '随取随用。',
    'hero.lead1': '免费开放的兽圈接口，不用注册，复制地址就能用。',
    'hero.lead2': '{total} 张 4K 兽装照片，还有 IP 查询、一言和抖音解析。',
    'hero.next': '换一张',
    'hero.loading': '正在取一张',
    'hero.docs': '接口文档',
    'hero.copy': '复制接口地址',
    'hero.no': 'No.{n}',
    'hero.large': '横版',
    'hero.box': '竖版',
    'hero.original': '原图',
    'hero.alt': '兽装照片 No.{n}，{kind}',
    'hero.altFirst': '图库里的一张兽装照片',
    'hero.failed': '这次没取到，再点一次试试。',

    'apis.eyebrow': '接口',
    'apis.title': '{n} 个接口，全部免费',
    'apis.lead': '都支持跨域调用，不需要密钥。地址可以直接用在网页、博客和机器人里。',
    'apis.tool': '在浏览器里运行',
    'apis.all': '查看全部文档',

    'gallery.eyebrow': '图库',
    'gallery.title': '{total} 张 4K 兽装摄影',
    'gallery.lead': '横版 {large} 张，竖版 {box} 张。随机接口每次从里面取一张，下面是其中几张。',
    'gallery.open': '打开原图',
    'gallery.close': '关闭',
    'gallery.prev': '上一张',
    'gallery.next': '下一张',
    'lightbox.label': '大图',
    'lightbox.zoom': '点开看大图',

    'quick.eyebrow': '用法',
    'quick.title': '一行代码就能用',
    'quick.lead': '把地址放进 `<img>`、Markdown 或 CSS，每次加载都是一张新照片；想自己处理就请求 JSON。',
    'quick.docs': '完整文档',

    'sources.eyebrow': '图片来源',
    'sources.title': '照片来自 {n} 位 X 创作者',
    'sources.lead': '图库里的照片都是这些创作者在 X 上公开发布的作品。谢谢他们。',
    'sources.all': '查看全部 {n} 位',

    'footer.about': '免费开放的兽圈接口。不用注册，复制地址就能用。',
    'footer.apis': '接口',
    'footer.site': '站点',
    'footer.contact': '联系',
    'footer.friends': '友情链接',
    'footer.sitemap': '站点地图',
    'footer.email': '邮箱',
    'footer.contactCn': '联系页（国内）',
    'footer.contactGlobal': '联系页（海外）',
    'footer.photoRights': '照片版权归各自的创作者所有',

    'nf.title': '这里什么都没有',
    'nf.lead': '这个地址可能写错了，或者页面已经搬走了。',
    'nf.home': '回到首页',
    'nf.docs': '查看接口文档',

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
    'docs.param.multiple': '可重复',
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
    'pg.omit': '不填',
    'pg.loaded': '已加载 {size}',
    'pg.imageFailed': '图片没加载出来，再试一次。',
    'pg.status': '状态',
    'pg.time': '耗时',
  },
  en: {
    'site.title': 'FurryAPI - Open APIs for furry content',
    'site.description':
      'FurryAPI offers free public APIs: random fursuit photos, IP lookup, Hitokoto quotes, Douyin parsing, and an online IP calculator. No sign-up. Copy a URL and it works.',
    'skip': 'Skip to content',
    'nav.label': 'Main',
    'nav.apis': 'APIs',
    'nav.docs': 'Docs',
    'nav.gallery': 'Gallery',
    'nav.sources': 'Photo credits',
    'nav.status': 'Status',
    'lang.switch': '中文',
    'copy': 'Copy',
    'copied': 'Copied',
    'copy.failed': 'Copy failed. Select the text instead.',

    'hero.title1': 'Fursuit photography,',
    'hero.title2': 'one request away.',
    'hero.lead1': 'Free, open APIs for the furry community. No sign-up, no keys.',
    'hero.lead2': '{total} fursuit photos in 4K, plus IP lookup, Hitokoto quotes and Douyin parsing.',
    'hero.next': 'Another one',
    'hero.loading': 'Fetching',
    'hero.docs': 'API docs',
    'hero.copy': 'Copy API URL',
    'hero.no': 'No.{n}',
    'hero.large': 'Landscape',
    'hero.box': 'Portrait',
    'hero.original': 'Original',
    'hero.alt': 'Fursuit photo No.{n}, {kind}',
    'hero.altFirst': 'A fursuit photo from the library',
    'hero.failed': 'That one didn’t load. Try again.',

    'apis.eyebrow': 'APIs',
    'apis.title': '{n} APIs, all free',
    'apis.lead': 'All of them allow cross-origin requests and need no key. Use the URLs directly in web pages, blogs and bots.',
    'apis.tool': 'Runs in your browser',
    'apis.all': 'All docs',

    'gallery.eyebrow': 'Library',
    'gallery.title': '{total} fursuit photos in 4K',
    'gallery.lead': '{large} landscape and {box} portrait. The random API serves one of them per request. Here are a few.',
    'gallery.open': 'Open original',
    'gallery.close': 'Close',
    'gallery.prev': 'Previous',
    'gallery.next': 'Next',
    'lightbox.label': 'Image viewer',
    'lightbox.zoom': 'View larger',

    'quick.eyebrow': 'Usage',
    'quick.title': 'One line is enough',
    'quick.lead': 'Put the URL in an `<img>`, Markdown or CSS and every load brings a new photo. Ask for JSON when you want to handle it yourself.',
    'quick.docs': 'Full docs',

    'sources.eyebrow': 'Photo credits',
    'sources.title': 'Photos by {n} creators on X',
    'sources.lead': 'Every photo in the library was published publicly on X by these creators. Thank you.',
    'sources.all': 'See all {n}',

    'footer.about': 'Free, open APIs for the furry community. No sign-up. Copy a URL and it works.',
    'footer.apis': 'APIs',
    'footer.site': 'Site',
    'footer.contact': 'Contact',
    'footer.friends': 'Friends',
    'footer.sitemap': 'Sitemap',
    'footer.email': 'Email',
    'footer.contactCn': 'Contact page (China)',
    'footer.contactGlobal': 'Contact page (Global)',
    'footer.photoRights': 'Photos © their respective creators',

    'nf.title': 'Nothing here.',
    'nf.lead': 'The address may be mistyped, or the page has moved.',
    'nf.home': 'Back to the homepage',
    'nf.docs': 'API docs',

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
    'docs.param.multiple': 'Repeatable',
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
    'pg.omit': 'Not set',
    'pg.loaded': 'Loaded {size}',
    'pg.imageFailed': 'The image didn’t load. Try again.',
    'pg.status': 'Status',
    'pg.time': 'Time',
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
