import type { ApiDoc } from './types';

// TODO(并行任务)：补全返回字段、说明和示例
const ip: ApiDoc = {
  kind: 'api',
  slug: 'ip-api',
  category: 'network',
  order: 1,
  name: { zh: 'IP 查询', en: 'IP lookup' },
  summary: {
    zh: '查询 IP 的位置、运营商和安全信息，三个数据源可选。',
    en: 'Location, network and security data for an IP, from three sources.',
  },
  intro: {
    zh: '返回 IP 的位置、时区、运营商、ASN 和代理判断等信息。默认同时查询 ipapi、ipinfo 和 bilibili 三个数据源并合并返回，也可以用 `db` 只查其中一个。不带 IP 时查询的是请求者自己的地址。',
    en: 'Returns location, time zone, ISP, ASN, proxy detection and more for an IP. By default it queries ipapi, ipinfo and bilibili together and merges the results; use `db` to query just one. Without an IP, it looks up the address the request came from.',
  },
  base: 'https://sni-api.furry.ist/ipapi',
  endpoints: [
    { method: 'GET', url: 'https://sni-api.furry.ist/ipapi', label: { zh: '查询自己', en: 'Your own IP' } },
    { method: 'GET', url: 'https://sni-api.furry.ist/ipapi/{ip}', label: { zh: '查询指定 IP', en: 'A specific IP' } },
  ],
  params: [
    {
      name: 'ip',
      in: 'path',
      type: 'string',
      placeholder: '1.1.1.1',
      desc: {
        zh: '要查询的 IPv4 或 IPv6 地址。不填时查询请求者自己的地址。',
        en: 'The IPv4 or IPv6 address to look up. Leave it out to look up your own address.',
      },
      example: '/ipapi/8.8.8.8',
    },
    {
      name: 'db',
      type: 'enum',
      options: [
        { value: 'ipapi', label: { zh: 'ipapi', en: 'ipapi' } },
        { value: 'ipinfo', label: { zh: 'ipinfo', en: 'ipinfo' } },
        { value: 'bilibili', label: { zh: 'bilibili', en: 'bilibili' } },
      ],
      desc: {
        zh: '只查一个数据源。不传时合并查询全部数据源，可用的值见返回里的 `available_db`。',
        en: 'Query a single source. Without it, all sources are queried and merged; valid values are listed in `available_db`.',
      },
      example: 'db=ipinfo',
    },
  ],
  examples: [
    { title: { zh: '查询自己的 IP', en: 'Look up your own IP' }, lang: 'bash', code: 'curl https://sni-api.furry.ist/ipapi' },
  ],
  playground: {
    preview: 'ip',
    presets: [
      { label: { zh: 'Cloudflare DNS', en: 'Cloudflare DNS' }, values: { ip: '1.1.1.1' } },
      { label: { zh: 'Google DNS', en: 'Google DNS' }, values: { ip: '8.8.8.8' } },
      { label: { zh: '114 DNS', en: '114 DNS' }, values: { ip: '114.114.114.114' } },
      { label: { zh: '只用 bilibili', en: 'bilibili only' }, values: { ip: '1.1.1.1', db: 'bilibili' } },
    ],
  },
};

export default ip;
