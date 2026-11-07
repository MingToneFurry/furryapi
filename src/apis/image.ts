import type { ApiDoc } from './types';

const image: ApiDoc = {
  kind: 'api',
  slug: 'image-api',
  category: 'image',
  order: 1,
  name: { zh: '随机兽装照片', en: 'Random fursuit photos' },
  summary: {
    zh: '每次请求返回一张 4K 兽装照片，横图竖图按设备挑选。',
    en: 'Every request returns a 4K fursuit photo, landscape or portrait to suit the device.',
  },
  intro: {
    zh: '每次请求随机返回一张兽装照片。地址可以直接放进 `<img>`，也可以要 JSON 自己处理。图库里的照片都是 4K 原图，格式为 WebP。',
    en: 'Each request returns a random fursuit photo. Put the URL straight into an `<img>`, or ask for JSON and handle it yourself. Every photo in the library is a 4K original in WebP.',
  },
  base: 'https://api.furry.ist/furry-img/',
  endpoints: [
    {
      method: 'GET',
      url: 'https://api.furry.ist/furry-img/',
      label: { zh: '主地址', en: 'Primary' },
    },
  ],
  methods: { zh: '`GET`、`HEAD`、`OPTIONS`', en: '`GET`, `HEAD`, `OPTIONS`' },
  params: [
    {
      name: 'format',
      type: 'enum',
      default: 'file',
      options: [
        { value: 'file', label: { zh: '图片', en: 'Image' } },
        { value: 'json', label: { zh: 'JSON', en: 'JSON' } },
      ],
      desc: {
        zh: '返回方式。`file` 直接返回图片，`json` 返回图片地址、方向和文件名。',
        en: 'What to return. `file` returns the image itself; `json` returns its URL, orientation and file name.',
      },
      example: 'format=json',
    },
    {
      name: 'mode',
      type: 'enum',
      default: 'auto',
      options: [
        { value: 'auto', label: { zh: '自动', en: 'Auto' } },
        { value: 'large', label: { zh: '横图', en: 'Landscape' } },
        { value: 'box', label: { zh: '竖图', en: 'Portrait' } },
      ],
      desc: {
        zh: '照片方向。`auto` 按访问设备挑选，手机给竖图、电脑给横图；`large` 只要横图；`box` 只要竖图。',
        en: 'Orientation. `auto` picks by device: portrait for phones, landscape for computers. `large` is landscape only; `box` is portrait only.',
      },
      example: 'mode=box',
    },
    {
      name: 'redirect',
      type: 'enum',
      default: '0',
      options: [
        { value: '0', label: { zh: '直接返回', en: 'Return directly' } },
        { value: '1', label: { zh: '302 跳转', en: '302 redirect' } },
      ],
      desc: {
        zh: '设为 `1` 时用 302 跳转到这张照片的固定地址，适合需要缓存或分享单张照片的场景；默认 `0` 直接返回内容。',
        en: 'With `1`, the response is a 302 redirect to the photo’s permanent URL, handy when you want to cache or share one photo. The default `0` returns the content directly.',
      },
      example: 'redirect=1',
    },
  ],
  fields: [
    {
      title: { zh: '`format=json` 时', en: 'With `format=json`' },
      items: [
        { name: 'url', type: 'String', desc: { zh: '这张照片的固定地址。', en: 'Permanent URL of the photo.' } },
        {
          name: 'type',
          type: 'String',
          desc: { zh: '方向：`large` 横图，`box` 竖图。', en: 'Orientation: `large` for landscape, `box` for portrait.' },
        },
        { name: 'filename', type: 'String', desc: { zh: '文件名，即照片编号。', en: 'File name, which is the photo number.' } },
      ],
    },
  ],
  examples: [
    {
      title: { zh: '放进网页', en: 'In a web page' },
      desc: { zh: '每次打开页面都是一张新照片。', en: 'A new photo every time the page loads.' },
      lang: 'html',
      code: '<img src="https://api.furry.ist/furry-img/" alt="随机兽装照片">',
    },
    {
      title: { zh: '放进 Markdown', en: 'In Markdown' },
      lang: 'markdown',
      code: '![随机兽装照片](https://api.furry.ist/furry-img/)',
    },
    {
      title: { zh: '作为横幅背景', en: 'As a banner background' },
      lang: 'css',
      code: '.banner {\n  background: url("https://api.furry.ist/furry-img/?mode=large") center / cover;\n}',
    },
    {
      title: { zh: '要 JSON', en: 'Ask for JSON' },
      lang: 'url',
      code: 'https://api.furry.ist/furry-img/?format=json',
      response: '{"url":"https://api.furry.ist/large/00000547.webp","type":"large","filename":"00000547.webp"}',
    },
    {
      title: { zh: '只要竖图', en: 'Portrait only' },
      lang: 'url',
      code: 'https://api.furry.ist/furry-img/?mode=box',
    },
    {
      title: { zh: '跳转到固定地址', en: 'Redirect to the permanent URL' },
      lang: 'url',
      code: 'https://api.furry.ist/furry-img/?redirect=1',
    },
    {
      title: { zh: '在 JavaScript 里使用', en: 'From JavaScript' },
      lang: 'js',
      code:
        "const res = await fetch('https://api.furry.ist/furry-img/?format=json&mode=large');\nconst { url, type, filename } = await res.json();\ndocument.querySelector('img').src = url;",
    },
  ],
  playground: { preview: 'image' },
};

export default image;
