import type { ApiDoc } from './types';

// TODO(并行任务)：补全返回字段、错误、说明和示例
const douyin: ApiDoc = {
  kind: 'api',
  slug: 'douyin',
  category: 'media',
  order: 1,
  name: { zh: '抖音解析', en: 'Douyin parser' },
  summary: {
    zh: '解析抖音分享链接，返回视频、图集、作者和互动数据。',
    en: 'Turns a Douyin share link into video, images, author and stats.',
  },
  intro: {
    zh: '把抖音的分享链接或作品链接解析成结构化数据：视频地址、图集和实况图、封面、作者、音乐和互动数据。只支持国内抖音，不支持 TikTok。',
    en: 'Turns a Douyin share or post link into structured data: video URLs, image sets and live photos, cover, author, music and stats. Douyin only; TikTok is not supported.',
  },
  base: 'https://api.furry.ist/douyin',
  endpoints: [{ method: 'GET', url: 'https://api.furry.ist/douyin?url={url}', label: { zh: '主地址', en: 'Primary' } }],
  methods: { zh: '`GET`、`HEAD`、`OPTIONS`', en: '`GET`, `HEAD`, `OPTIONS`' },
  params: [
    {
      name: 'url',
      type: 'string',
      required: true,
      placeholder: 'https://v.douyin.com/DQyLiuMdIlk/',
      desc: {
        zh: '抖音分享链接或作品链接，只接受 `douyin.com` 和 `iesdouyin.com`，支持 `v.douyin.com` 短链。需要做 URL 编码。',
        en: 'A Douyin share or post link. Only `douyin.com` and `iesdouyin.com` are accepted; `v.douyin.com` short links work. URL-encode it.',
      },
      example: 'url=https%3A%2F%2Fv.douyin.com%2Fxxxxxx%2F',
    },
  ],
  examples: [
    {
      title: { zh: '解析一条分享链接', en: 'Parse a share link' },
      lang: 'url',
      code: 'https://api.furry.ist/douyin?url=https%3A%2F%2Fv.douyin.com%2Fxxxxxx%2F',
    },
  ],
  playground: {
    preview: 'douyin',
    presets: [{ label: { zh: '示例视频', en: 'Sample video' }, values: { url: 'https://v.douyin.com/DQyLiuMdIlk/' } }],
  },
};

export default douyin;
