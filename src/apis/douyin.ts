import type { ApiDoc } from './types';

// 成功返回的占位内容：沿用旧文档的结构，去掉 quality。数值和文字都不是真实作品的数据。
const sampleResponse = {
  ok: true,
  data: {
    type: 'video',
    title: 'example title',
    desc: 'example title',
    author: {
      name: 'author name',
      id: 123456789,
      avatar: 'https://example.com/avatar.jpg',
    },
    cover: 'https://example.com/cover.jpg',
    url: 'https://example.com/video.mp4',
    duration: 12000,
    video_backup: ['https://example.com/video.mp4'],
    images: [],
    image_variants: [],
    live_photo: [],
    music: {
      title: 'music title',
      author: 'music author',
      url: 'https://example.com/music.mp3',
      cover: 'https://example.com/music-cover.jpg',
    },
    extra: {
      aweme_id: '123456789',
      share_url: 'https://v.douyin.com/xxxxxx/',
      statistics: {
        comment_count: 1,
        digg_count: 2,
        play_count: null,
        share_count: 4,
        collect_count: 5,
      },
      raw_statistics: {},
    },
    aweme_id: '123456789',
    nickname: 'author name',
    duration_ms: 12000,
    create_time: '2024-03-10 00:00:00',
    source_url: 'https://v.douyin.com/xxxxxx/',
    statistics: {
      comment_count: 1,
      digg_count: 2,
      play_count: null,
      share_count: 4,
      collect_count: 5,
    },
    comment_count: 1,
    digg_count: 2,
    play_count: null,
    share_count: 4,
    collect_count: 5,
    video_url: 'https://example.com/video.mp4',
    image_url_list: [],
  },
};

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
      placeholder: 'https://v.douyin.com/xxxxxx/',
      desc: {
        zh: '抖音分享链接或作品链接，必须是带协议的完整地址（`https://` 或 `http://`）。只允许 `douyin.com` 与 `iesdouyin.com` 域名，`v.douyin.com` 短链也可以。需要做 URL 编码。',
        en: 'A Douyin share or post link as a full URL with `https://` or `http://`. Only `douyin.com` and `iesdouyin.com` hosts are allowed; `v.douyin.com` short links work. URL-encode it.',
      },
      example: 'url=https%3A%2F%2Fv.douyin.com%2Fxxxxxx%2F',
    },
  ],
  fields: [
    {
      items: [
        {
          name: 'ok',
          type: 'Boolean',
          desc: {
            zh: '请求是否成功。成功时为 `true`，失败时为 `false`。',
            en: 'Whether the request succeeded: `true` on success, `false` on error.',
          },
        },
        {
          name: 'data',
          type: 'Object',
          desc: { zh: '内容数据，只在 `ok` 为 `true` 时返回。', en: 'Content data. Only returned when `ok` is `true`.' },
        },
        {
          name: 'data.type',
          type: 'String',
          desc: {
            zh: '内容类型：`video`（视频）、`image`（图集）或 `live`（实况图）。',
            en: 'Content type: `video`, `image` or `live`.',
          },
        },
        {
          name: 'data.title / data.desc',
          type: 'String',
          desc: { zh: '标题或正文文案。', en: 'Title or caption text.' },
        },
        {
          name: 'data.author',
          type: 'Object',
          desc: {
            zh: '作者信息，包含 `name`、`id`、`avatar` 和 `signature`。`signature` 可能为空字符串。',
            en: 'Author details: `name`, `id`, `avatar` and `signature`. `signature` can be an empty string.',
          },
        },
        {
          name: 'data.cover',
          type: 'String | null',
          desc: {
            zh: '封面图片地址；图集内容会回退到第一张图片。',
            en: 'Cover image URL. Image posts fall back to their first image.',
          },
        },
        {
          name: 'data.url / data.video_url',
          type: 'String | null',
          desc: {
            zh: '视频主播放地址，只在 `type` 为 `video` 时返回。`video_url` 是兼容旧调用方的字段。',
            en: 'Primary video play URL, returned only when `type` is `video`. `video_url` is kept for older callers.',
          },
        },
        {
          name: 'data.video_backup',
          type: 'Array<String>',
          desc: {
            zh: '视频备选播放地址，按接口的选择顺序排列。',
            en: 'Backup video URLs, in the order the parser prefers them.',
          },
        },
        {
          name: 'data.images / data.image_url_list',
          type: 'Array<String>',
          desc: {
            zh: '图集或实况图的默认图片地址。`image_url_list` 是兼容字段。',
            en: 'Default image URLs for image and live-photo posts. `image_url_list` is a legacy alias.',
          },
        },
        {
          name: 'data.image_variants',
          type: 'Array<Object>',
          desc: {
            zh: '图片候选信息，可能包含无水印地址、水印高分辨率地址、宽和高。',
            en: 'Image candidates. Each may include a no-watermark URL, a watermarked high-resolution URL, width and height.',
          },
        },
        {
          name: 'data.live_photo',
          type: 'Array<Object>',
          desc: {
            zh: '实况图数据，每项包含 `image` 和对应的 `video`。',
            en: 'Live-photo data. Each item has an `image` and its matching `video`.',
          },
        },
        {
          name: 'data.music',
          type: 'Object',
          desc: {
            zh: '音乐信息，包含标题、作者、播放地址和封面。',
            en: 'Music details: title, author, play URL and cover.',
          },
        },
        {
          name: 'data.aweme_id',
          type: 'String',
          desc: {
            zh: '作品唯一 ID。以字符串返回，长 ID 在 JavaScript 里不会丢失精度。',
            en: 'Unique post ID. Returned as a string so long IDs stay exact in JavaScript.',
          },
        },
        {
          name: 'data.duration / data.duration_ms',
          type: 'Number',
          desc: { zh: '时长，单位为毫秒。', en: 'Duration in milliseconds.' },
        },
        {
          name: 'data.create_time',
          type: 'String | null',
          desc: {
            zh: '发布时间，格式为 `YYYY-MM-DD HH:mm:ss`。',
            en: 'Publish time, formatted as `YYYY-MM-DD HH:mm:ss`.',
          },
        },
        {
          name: 'data.source_url',
          type: 'String',
          desc: { zh: '本次请求传入的原始链接。', en: 'The original link passed in this request.' },
        },
        {
          name: 'data.statistics',
          type: 'Object',
          desc: {
            zh: '互动数据，包含 `comment_count`、`digg_count`、`play_count`、`share_count` 和 `collect_count`。',
            en: 'Interaction counts: `comment_count`, `digg_count`, `play_count`, `share_count` and `collect_count`.',
          },
        },
        {
          name: 'data.extra',
          type: 'Object',
          desc: {
            zh: '扩展信息，包含原始统计、话题、视频标签和作者扩展信息等。',
            en: 'Extra details, such as raw stats, hashtags, video tags and author extras.',
          },
        },
      ],
    },
  ],
  errors: {
    note: {
      zh: '错误时返回对应的 HTTP 状态码，响应体是 JSON：`ok` 为 `false`，`code` 为错误码，`message` 为说明。',
      en: 'Errors use real HTTP status codes. The body is JSON with `ok` set to `false`, a `code` and a `message`.',
    },
    items: [
      {
        code: 'MISSING_URL',
        when: {
          zh: '返回 HTTP 400。没有传 `url` 参数，或 `url` 为空。',
          en: 'Returns HTTP 400. The `url` parameter is missing or empty.',
        },
        body: '{"ok":false,"code":"MISSING_URL","message":"Missing query param: url"}',
      },
      {
        code: 'INVALID_URL',
        when: {
          zh: '返回 HTTP 400。`url` 不是有效的完整链接，例如 `url=x`。',
          en: 'Returns HTTP 400. `url` is not a valid full link, for example `url=x`.',
        },
        body: '{"ok":false,"code":"INVALID_URL","message":"Invalid url"}',
      },
      {
        code: 'UNSUPPORTED_HOST',
        when: {
          zh: '返回 HTTP 400。`url` 是完整链接，但域名不是抖音，例如 `url=https://example.com/`。',
          en: 'Returns HTTP 400. `url` is a full link, but its host is not Douyin, for example `url=https://example.com/`.',
        },
        body: '{"ok":false,"code":"UNSUPPORTED_HOST","message":"Only Douyin URLs are allowed"}',
      },
      {
        code: 'METHOD_NOT_ALLOWED',
        when: {
          zh: '返回 HTTP 405。使用了 GET、HEAD、OPTIONS 以外的方法，例如 POST。',
          en: 'Returns HTTP 405. The request used a method other than GET, HEAD or OPTIONS, such as POST.',
        },
        body: '{"ok":false,"code":"METHOD_NOT_ALLOWED","message":"Only GET/HEAD is supported"}',
      },
      {
        code: 'UPSTREAM_HTTP_ERROR',
        when: { zh: '抖音上游返回非成功状态。', en: 'The Douyin upstream returned a non-success status.' },
        body: '{"ok":false,"code":"UPSTREAM_HTTP_ERROR","message":"Upstream status 403"}',
      },
      {
        code: 'UPSTREAM_TIMEOUT',
        when: { zh: '请求抖音上游超时。', en: 'The request to the Douyin upstream timed out.' },
        body: '{"ok":false,"code":"UPSTREAM_TIMEOUT","message":"Upstream request timeout"}',
      },
      {
        code: 'UPSTREAM_FETCH_FAILED',
        when: { zh: '请求抖音上游失败。', en: 'The request to the Douyin upstream failed.' },
        body: '{"ok":false,"code":"UPSTREAM_FETCH_FAILED","message":"Fetch failed"}',
      },
      {
        code: 'PARSE_DATA_FAILED',
        when: {
          zh: '返回 HTTP 422。响应中未找到可支持的抖音数据。',
          en: 'Returns HTTP 422. No supported Douyin data was found in the response.',
        },
        body: '{"ok":false,"code":"PARSE_DATA_FAILED","message":"No supported Douyin data found in response"}',
      },
      {
        code: 'INTERNAL_ERROR',
        when: { zh: '服务内部错误。', en: 'Internal service error.' },
        body: '{"ok":false,"code":"INTERNAL_ERROR","message":"Unknown error"}',
      },
    ],
  },
  notes: [
    {
      zh: '接口只接受带协议的完整链接。直接传入分享口令，或者传入没有 `https://` 的链接，都会返回 `INVALID_URL`。在线试用会先从粘贴的文字里取出链接，再发送请求。',
      en: 'The API only accepts a full link with a scheme. Share text, or a link without `https://`, returns `INVALID_URL`. The online trial pulls the link out of pasted text first.',
    },
    {
      zh: '当可访问的抖音数据只暴露 `play_count: 0` 时，接口会把公开播放数返回为 `null`，原始上游统计保存在 `data.extra.raw_statistics` 中。',
      en: 'When the accessible Douyin data only exposes `play_count: 0`, the public play count is returned as `null`, and the raw upstream stats stay in `data.extra.raw_statistics`.',
    },
  ],
  examples: [
    {
      title: { zh: '解析一条分享链接', en: 'Parse a share link' },
      desc: {
        zh: '返回内容里的数值和文字都是占位内容，只用来说明字段结构。',
        en: 'The values in this response are placeholders that show the field layout only.',
      },
      lang: 'url',
      code: 'https://api.furry.ist/douyin?url=https%3A%2F%2Fv.douyin.com%2Fxxxxxx%2F',
      response: JSON.stringify(sampleResponse, null, 2),
    },
    {
      title: { zh: '在 JavaScript 里使用', en: 'From JavaScript' },
      lang: 'js',
      code: [
        "const link = 'https://v.douyin.com/xxxxxx/';",
        'const res = await fetch(`https://api.furry.ist/douyin?url=${encodeURIComponent(link)}`);',
        'const data = await res.json();',
        'if (data.ok) {',
        '  console.log(data.data.type, data.data.title);',
        '} else {',
        '  console.error(data.code, data.message);',
        '}',
      ].join('\n'),
    },
  ],
  playground: { preview: 'douyin' },
};

export default douyin;
