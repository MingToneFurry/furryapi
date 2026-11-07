import type { ApiDoc } from './types';

// 1.1.1.1 的 ipapi 返回原样保留，抓取于 2026 年 11 月 7 日。
const ipapiFull = `{
  "available_db": [
    "ipapi",
    "ipinfo",
    "bilibili"
  ],
  "ipapi": {
    "ip": "1.1.1.1",
    "hostname": "one.one.one.one",
    "type": "ipv4",
    "continent_code": "OC",
    "continent_name": "Oceania",
    "country_code": "AU",
    "country_name": "Australia",
    "region_code": "VIC",
    "region_name": "Victoria",
    "city": "Research (Melbourne)",
    "zip": "3095",
    "latitude": -37.70000076293945,
    "longitude": 145.18299865722656,
    "msa": null,
    "dma": null,
    "radius": "0",
    "ip_routing_type": "fixed",
    "connection_type": "tx",
    "location": {
      "geoname_id": 2151718,
      "capital": "Canberra",
      "languages": [
        {
          "code": "en",
          "name": "English",
          "native": "English"
        }
      ],
      "country_flag": "https://assets.ipstack.com/flags/au.svg",
      "country_flag_emoji": "🇦🇺",
      "country_flag_emoji_unicode": "U+1F1E6 U+1F1FA",
      "calling_code": "61",
      "is_eu": false
    },
    "time_zone": {
      "id": "Australia/Melbourne",
      "current_time": "2026-11-08T01:01:43+11:00",
      "gmt_offset": 39600,
      "code": "AEDT",
      "is_daylight_saving": true
    },
    "currency": {
      "code": "AUD",
      "name": "Australian Dollar",
      "plural": "Australian dollars",
      "symbol": "AU$",
      "symbol_native": "$"
    },
    "connection": {
      "asn": 13335,
      "isp": "Cloudflare",
      "sld": null,
      "tld": null,
      "carrier": "cloudflare",
      "home": false,
      "organization_type": "Internet Hosting Services",
      "isic_code": "J6311",
      "naics_code": "518210"
    },
    "security": {
      "is_proxy": true,
      "proxy_type": "service",
      "is_crawler": false,
      "crawler_name": null,
      "crawler_type": null,
      "is_tor": false,
      "threat_level": "low",
      "threat_types": null,
      "proxy_last_detected": "2026-07-16",
      "proxy_level": "elite",
      "vpn_service": "ovpn",
      "anonymizer_status": "private",
      "hosting_facility": true
    }
  },
  "code": 200
}`;

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
    zh: '返回 IP 的位置、时区、运营商、ASN 和代理判断等信息。不带 `db` 时查询全部数据源并合并返回；某个数据源失败时，它的字段是错误对象，其余数据源照常返回。用 `db` 可以只查一个数据源。不带 IP 时查询的是请求者自己的地址。',
    en: 'Returns location, time zone, ISP, ASN, proxy detection and more for an IP. Without `db`, every source is queried and the results are merged. If a source fails, its field holds an error object and the other sources still return data. Use `db` to query just one source. Without an IP, it looks up the address the request came from.',
  },
  base: 'https://api.furry.ist/ipapi',
  endpoints: [
    { method: 'GET', url: 'https://api.furry.ist/ipapi', label: { zh: '查询自己', en: 'Your own IP' } },
    { method: 'GET', url: 'https://api.furry.ist/ipapi/{ip}', label: { zh: '查询指定 IP', en: 'A specific IP' } },
  ],
  methods: { zh: '`GET`、`HEAD`、`OPTIONS`', en: '`GET`, `HEAD`, `OPTIONS`' },
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
        zh: '只查一个数据源。不传时查询全部数据源并合并；失败的数据源会在自己的字段里返回错误对象。可用的值见返回里的 `available_db`。',
        en: 'Query one source only. Without it, every source is queried and the results are merged; a source that fails returns an error object in its own field. Valid values are listed in `available_db`.',
      },
      example: 'db=ipinfo',
    },
  ],
  fields: [
    {
      title: { zh: '顶层字段', en: 'Top-level fields' },
      items: [
        {
          name: 'available_db',
          type: 'Array',
          desc: {
            zh: '当前可用的数据源名称，也就是 `db` 可以填的值。',
            en: 'Names of the sources that are available now. These are the valid values for `db`.',
          },
        },
        {
          name: 'ipapi',
          type: 'Object',
          desc: {
            zh: '`ipapi` 的查询结果，字段见下面 `ipapi` 对象的说明。合并查询和 `db=ipapi` 时返回。',
            en: '`ipapi` result. Its fields are listed in the `ipapi` group below. Returned by merged queries and by `db=ipapi`.',
          },
        },
        {
          name: 'ipinfo',
          type: 'Object',
          desc: {
            zh: '`ipinfo` 的查询结果，字段见下面 `ipinfo` 对象的说明。合并查询和 `db=ipinfo` 时返回。',
            en: '`ipinfo` result. Its fields are listed in the `ipinfo` group below. Returned by merged queries and by `db=ipinfo`.',
          },
        },
        {
          name: 'bilibili',
          type: 'Object',
          desc: {
            zh: '`bilibili` 的查询结果，字段见下面 `bilibili` 对象的说明。合并查询和 `db=bilibili` 时返回。',
            en: '`bilibili` result. Its fields are listed in the `bilibili` group below. Returned by merged queries and by `db=bilibili`.',
          },
        },
        {
          name: 'code',
          type: 'Number',
          desc: {
            zh: '返回码。IP 有效时为 `200`，即使某个数据源报错也是 `200`；请求出错时是其他码，见下面的错误说明。',
            en: 'Result code. It is `200` for a valid IP, even when a source fails. Request errors use other codes; see the errors below.',
          },
        },
        {
          name: 'error',
          type: 'String',
          desc: {
            zh: '请求本身出错时的说明，如 `Method Not Allowed`。某个数据源出错时，错误写在它自己的字段里，不在这里。',
            en: 'Message for a request-level error, such as `Method Not Allowed`. A failed source puts its error in its own field, not here.',
          },
        },
      ],
    },
    {
      title: {
        zh: '`ipapi` 对象（`?db=ipapi`）：缺失的值为 `null`',
        en: 'The `ipapi` object (`?db=ipapi`): missing values are `null`',
      },
      items: [
        { name: 'ip', type: 'String', desc: { zh: '查询的 IP 地址。', en: 'The IP address that was looked up.' } },
        {
          name: 'hostname',
          type: 'String',
          desc: {
            zh: '反向解析得到的主机名。没有反向解析时等于 `ip`。',
            en: 'Hostname from reverse DNS. Equal to `ip` when there is no reverse DNS.',
          },
        },
        { name: 'type', type: 'String', desc: { zh: 'IP 版本，`ipv4` 或 `ipv6`。', en: 'IP version: `ipv4` or `ipv6`.' } },
        { name: 'continent_code', type: 'String', desc: { zh: '大洲代码，如 `AS`。', en: 'Continent code, such as `AS`.' } },
        {
          name: 'continent_name',
          type: 'String',
          desc: { zh: '大洲名称（英文），如 `Asia`。', en: 'Continent name, such as `Asia`.' },
        },
        { name: 'country_code', type: 'String', desc: { zh: '国家或地区代码，如 `US`。', en: 'Country or region code, such as `US`.' } },
        {
          name: 'country_name',
          type: 'String',
          desc: { zh: '国家或地区名称（英文），如 `United States`。', en: 'Country or region name, such as `United States`.' },
        },
        {
          name: 'region_code',
          type: 'String | null',
          desc: { zh: '省或州代码，如 `CA`；没有时为 `null`。', en: 'Province or state code, such as `CA`. `null` when unknown.' },
        },
        {
          name: 'region_name',
          type: 'String | null',
          desc: {
            zh: '省或州名称（英文），如 `California`；没有时为 `null`。',
            en: 'Province or state name, such as `California`. `null` when unknown.',
          },
        },
        { name: 'city', type: 'String | null', desc: { zh: '城市名称（英文）；没有时为 `null`。', en: 'City name. `null` when unknown.' } },
        {
          name: 'zip',
          type: 'String | null',
          desc: {
            zh: '邮政编码，字符串形式，如 `94041`；没有时为 `null`。',
            en: 'Postal code as a string, such as `94041`. `null` when unknown.',
          },
        },
        { name: 'latitude', type: 'Number', desc: { zh: '纬度。', en: 'Latitude.' } },
        { name: 'longitude', type: 'Number', desc: { zh: '经度。', en: 'Longitude.' } },
        {
          name: 'msa',
          type: 'String | null',
          desc: {
            zh: '美国大都市统计区（MSA）代码，字符串形式；没有时为 `null`。',
            en: 'US Metropolitan Statistical Area code, as a string. `null` when unknown.',
          },
        },
        {
          name: 'dma',
          type: 'String | null',
          desc: {
            zh: '美国指定市场区域（DMA）代码，字符串形式；没有时为 `null`。',
            en: 'US Designated Market Area code, as a string. `null` when unknown.',
          },
        },
        { name: 'radius', type: 'String', desc: { zh: '定位半径，字符串形式。样例中都是 `0`。', en: 'Location radius, as a string. Every sample shows `0`.' } },
        {
          name: 'ip_routing_type',
          type: 'String | null',
          desc: {
            zh: '线路类型，如 `fixed`、`mobile gateway`；没有时为 `null`。',
            en: 'Routing type, such as `fixed` or `mobile gateway`. `null` when unknown.',
          },
        },
        {
          name: 'connection_type',
          type: 'String | null',
          desc: {
            zh: '连接类型，如 `tx`、`ocx`、`mobile wireless`；没有时为 `null`。',
            en: 'Connection type, such as `tx`, `ocx` or `mobile wireless`. `null` when unknown.',
          },
        },
        { name: 'location', type: 'Object', desc: { zh: '地理位置信息，子字段列在下面。', en: 'Location details. Sub-fields are listed below.' } },
        {
          name: 'location.geoname_id',
          type: 'Number',
          desc: { zh: 'GeoNames 地名编号。', en: 'GeoNames place ID.' },
        },
        {
          name: 'location.capital',
          type: 'String',
          desc: { zh: '所在国家或地区的首都（英文），如 `Canberra`。', en: 'Capital of the country or region, such as `Canberra`.' },
        },
        {
          name: 'location.languages',
          type: 'Array',
          desc: {
            zh: '通用语言列表。每项包含 `code`（语言代码）、`name`（英文名）和 `native`（本地写法）。',
            en: 'Languages spoken. Each item has `code`, `name` (in English) and `native` (in the language itself).',
          },
        },
        {
          name: 'location.country_flag',
          type: 'String',
          desc: { zh: '国旗图片地址，SVG 格式。', en: 'URL of the flag image, in SVG format.' },
        },
        { name: 'location.country_flag_emoji', type: 'String', desc: { zh: '国旗 emoji。', en: 'Flag emoji.' } },
        {
          name: 'location.country_flag_emoji_unicode',
          type: 'String',
          desc: {
            zh: '国旗 emoji 的 Unicode 码位，如 `U+1F1E6 U+1F1FA`。',
            en: 'Unicode code points of the flag emoji, such as `U+1F1E6 U+1F1FA`.',
          },
        },
        {
          name: 'location.calling_code',
          type: 'String',
          desc: { zh: '国际区号，不带 `+`，如 `61`。', en: 'International calling code without the `+`, such as `61`.' },
        },
        { name: 'location.is_eu', type: 'Boolean', desc: { zh: '是否属于欧盟。', en: 'Whether the location is in the EU.' } },
        { name: 'time_zone', type: 'Object', desc: { zh: '时区信息，子字段列在下面。', en: 'Time zone details. Sub-fields are listed below.' } },
        {
          name: 'time_zone.id',
          type: 'String | null',
          desc: {
            zh: '时区名称，如 `Australia/Melbourne`；没有时为 `null`。',
            en: 'Time zone name, such as `Australia/Melbourne`. `null` when unknown.',
          },
        },
        {
          name: 'time_zone.current_time',
          type: 'String | null',
          desc: {
            zh: '当地当前时间，ISO 8601 格式并带时区偏移，如 `2026-11-08T00:55:04+11:00`；没有时为 `null`。',
            en: 'Current local time in ISO 8601 format with the UTC offset, such as `2026-11-08T00:55:04+11:00`. `null` when unknown.',
          },
        },
        {
          name: 'time_zone.gmt_offset',
          type: 'Number | null',
          desc: {
            zh: '与 UTC 的偏移量，单位为秒，如 `39600`（即 `+11:00`）；没有时为 `null`。',
            en: 'Offset from UTC in seconds, such as `39600` for +11:00. `null` when unknown.',
          },
        },
        {
          name: 'time_zone.code',
          type: 'String | null',
          desc: { zh: '时区缩写，如 `AEDT`；没有时为 `null`。', en: 'Time zone abbreviation, such as `AEDT`. `null` when unknown.' },
        },
        {
          name: 'time_zone.is_daylight_saving',
          type: 'Boolean | null',
          desc: { zh: '当前是否在夏令时；没有时为 `null`。', en: 'Whether daylight saving time is in effect. `null` when unknown.' },
        },
        { name: 'currency', type: 'Object', desc: { zh: '货币信息，子字段列在下面。', en: 'Currency details. Sub-fields are listed below.' } },
        { name: 'currency.code', type: 'String', desc: { zh: '货币代码，如 `AUD`。', en: 'Currency code, such as `AUD`.' } },
        {
          name: 'currency.name',
          type: 'String',
          desc: { zh: '货币名称（英文），如 `Australian Dollar`。', en: 'Currency name, such as `Australian Dollar`.' },
        },
        { name: 'currency.plural', type: 'String', desc: { zh: '货币名称的复数形式（英文）。', en: 'Plural form of the currency name.' } },
        { name: 'currency.symbol', type: 'String', desc: { zh: '货币符号，如 `AU$`。', en: 'Currency symbol, such as `AU$`.' } },
        {
          name: 'currency.symbol_native',
          type: 'String',
          desc: { zh: '本地写法的货币符号，如 `$`。', en: 'Currency symbol as written locally, such as `$`.' },
        },
        { name: 'connection', type: 'Object', desc: { zh: '网络连接信息，子字段列在下面。', en: 'Network connection details. Sub-fields are listed below.' } },
        { name: 'connection.asn', type: 'Number', desc: { zh: 'ASN 编号，如 `13335`。', en: 'ASN number, such as `13335`.' } },
        { name: 'connection.isp', type: 'String', desc: { zh: '运营商名称，如 `Cloudflare`。', en: 'ISP name, such as `Cloudflare`.' } },
        {
          name: 'connection.sld',
          type: 'String | null',
          desc: {
            zh: '二级域名的主体部分，如 `114dns`；没有时为 `null`。',
            en: 'Second-level domain label, such as `114dns`. `null` when unknown.',
          },
        },
        {
          name: 'connection.tld',
          type: 'String | null',
          desc: { zh: '顶级域名，如 `com`；没有时为 `null`。', en: 'Top-level domain, such as `com`. `null` when unknown.' },
        },
        {
          name: 'connection.carrier',
          type: 'String',
          desc: { zh: '运营商的小写标识，如 `cloudflare`。', en: 'Lowercase carrier identifier, such as `cloudflare`.' },
        },
        {
          name: 'connection.home',
          type: 'Boolean | null',
          desc: { zh: '是否为家庭宽带；没有时为 `null`。', en: 'Whether the address is a home connection. `null` when unknown.' },
        },
        {
          name: 'connection.organization_type',
          type: 'String | null',
          desc: {
            zh: '机构类型，如 `Internet Hosting Services`；没有时为 `null`。',
            en: 'Organization type, such as `Internet Hosting Services`. `null` when unknown.',
          },
        },
        {
          name: 'connection.isic_code',
          type: 'String | null',
          desc: {
            zh: '国际行业分类（ISIC）代码，如 `J6311`；没有时为 `null`。',
            en: 'ISIC industry code, such as `J6311`. `null` when unknown.',
          },
        },
        {
          name: 'connection.naics_code',
          type: 'String | null',
          desc: {
            zh: '北美行业分类（NAICS）代码，如 `518210`；没有时为 `null`。',
            en: 'NAICS industry code, such as `518210`. `null` when unknown.',
          },
        },
        { name: 'security', type: 'Object', desc: { zh: '安全与代理判断，子字段列在下面。', en: 'Security and proxy checks. Sub-fields are listed below.' } },
        { name: 'security.is_proxy', type: 'Boolean', desc: { zh: '是否为代理。', en: 'Whether the address is a proxy.' } },
        {
          name: 'security.proxy_type',
          type: 'String | null',
          desc: { zh: '代理类型，如 `service`；没有时为 `null`。', en: 'Proxy type, such as `service`. `null` when unknown.' },
        },
        { name: 'security.is_crawler', type: 'Boolean', desc: { zh: '是否为爬虫。', en: 'Whether the address is a crawler.' } },
        {
          name: 'security.crawler_name',
          type: 'String | null',
          desc: { zh: '爬虫名称；不是爬虫时为 `null`。', en: 'Crawler name. `null` when the address is not a crawler.' },
        },
        {
          name: 'security.crawler_type',
          type: 'String | null',
          desc: { zh: '爬虫类型；不是爬虫时为 `null`。', en: 'Crawler type. `null` when the address is not a crawler.' },
        },
        { name: 'security.is_tor', type: 'Boolean', desc: { zh: '是否为 Tor 出口节点。', en: 'Whether the address is a Tor exit node.' } },
        { name: 'security.threat_level', type: 'String', desc: { zh: '威胁等级，如 `low`。', en: 'Threat level, such as `low`.' } },
        {
          name: 'security.threat_types',
          type: 'Array | null',
          desc: { zh: '威胁类型列表；没有时为 `null`。', en: 'List of threat types. `null` when there are none.' },
        },
        {
          name: 'security.proxy_last_detected',
          type: 'String | null',
          desc: {
            zh: '最近一次检测到代理的日期，如 `2026-07-16`；没有时为 `null`。',
            en: 'Date the proxy was last detected, such as `2026-07-16`. `null` when unknown.',
          },
        },
        {
          name: 'security.proxy_level',
          type: 'String | null',
          desc: { zh: '代理的匿名级别，如 `elite`；没有时为 `null`。', en: 'Proxy anonymity level, such as `elite`. `null` when unknown.' },
        },
        {
          name: 'security.vpn_service',
          type: 'String | null',
          desc: { zh: 'VPN 服务类型，如 `ovpn`；没有时为 `null`。', en: 'VPN service type, such as `ovpn`. `null` when unknown.' },
        },
        {
          name: 'security.anonymizer_status',
          type: 'String | null',
          desc: { zh: '匿名服务状态，如 `private`；没有时为 `null`。', en: 'Anonymizer status, such as `private`. `null` when unknown.' },
        },
        {
          name: 'security.hosting_facility',
          type: 'Boolean',
          desc: { zh: '是否位于机房或托管服务器上。', en: 'Whether the address is in a hosting facility.' },
        },
      ],
    },
    {
      title: {
        zh: '`ipinfo` 对象（`?db=ipinfo`）：缺失的值为字符串 `-`。目前大部分字段都是 `-`，只有 `ip`、`country`、`asn` 和 `domains.ip` 有值',
        en: 'The `ipinfo` object (`?db=ipinfo`): missing values are the string `-`. Most fields are `-` right now; only `ip`, `country`, `asn` and `domains.ip` carry values.',
      },
      items: [
        { name: 'ip', type: 'String', desc: { zh: '查询的 IP 地址。', en: 'The IP address that was looked up.' } },
        {
          name: 'hostname',
          type: 'String',
          desc: { zh: '反向解析的主机名；没有数据时为 `-`。', en: 'Hostname from reverse DNS. `-` when there is no data.' },
        },
        {
          name: 'anycast',
          type: 'String',
          desc: { zh: '是否为 Anycast 地址；没有数据时为 `-`。', en: 'Whether the address is anycast. `-` when there is no data.' },
        },
        { name: 'city', type: 'String', desc: { zh: '城市；没有数据时为 `-`。', en: 'City. `-` when there is no data.' } },
        { name: 'region', type: 'String', desc: { zh: '省或州；没有数据时为 `-`。', en: 'Region or state. `-` when there is no data.' } },
        { name: 'country', type: 'String', desc: { zh: '国家或地区代码，如 `AU`。', en: 'Country code, such as `AU`.' } },
        { name: 'loc', type: 'String', desc: { zh: '坐标；没有数据时为 `-`。', en: 'Coordinates. `-` when there is no data.' } },
        { name: 'postal', type: 'String', desc: { zh: '邮政编码；没有数据时为 `-`。', en: 'Postal code. `-` when there is no data.' } },
        { name: 'timezone', type: 'String', desc: { zh: '时区；没有数据时为 `-`。', en: 'Time zone. `-` when there is no data.' } },
        { name: 'asn', type: 'Object', desc: { zh: 'ASN 信息，子字段列在下面。', en: 'ASN details. Sub-fields are listed below.' } },
        { name: 'asn.asn', type: 'String', desc: { zh: 'ASN 编号，如 `AS13335`。', en: 'ASN number, such as `AS13335`.' } },
        {
          name: 'asn.name',
          type: 'String',
          desc: { zh: '运营商名称，如 `Cloudflare, Inc.`。', en: 'Operator name, such as `Cloudflare, Inc.`.' },
        },
        { name: 'asn.domain', type: 'String', desc: { zh: '运营商域名，如 `cloudflare.com`。', en: 'Operator domain, such as `cloudflare.com`.' } },
        { name: 'asn.route', type: 'String', desc: { zh: '路由前缀；没有数据时为 `-`。', en: 'Route prefix. `-` when there is no data.' } },
        { name: 'asn.type', type: 'String', desc: { zh: '运营商类型；没有数据时为 `-`。', en: 'Operator type. `-` when there is no data.' } },
        { name: 'company', type: 'Object', desc: { zh: '公司信息，子字段列在下面。', en: 'Company details. Sub-fields are listed below.' } },
        { name: 'company.name', type: 'String', desc: { zh: '公司名称；没有数据时为 `-`。', en: 'Company name. `-` when there is no data.' } },
        { name: 'company.domain', type: 'String', desc: { zh: '公司域名；没有数据时为 `-`。', en: 'Company domain. `-` when there is no data.' } },
        { name: 'company.type', type: 'String', desc: { zh: '公司类型；没有数据时为 `-`。', en: 'Company type. `-` when there is no data.' } },
        { name: 'privacy', type: 'Object', desc: { zh: '隐私与代理相关判断，子字段列在下面。', en: 'Privacy checks. Sub-fields are listed below.' } },
        {
          name: 'privacy.vpn',
          type: 'String',
          desc: { zh: '是否为 VPN；没有数据时为 `-`。', en: 'Whether the address is a VPN. `-` when there is no data.' },
        },
        {
          name: 'privacy.proxy',
          type: 'String',
          desc: { zh: '是否为代理；没有数据时为 `-`。', en: 'Whether the address is a proxy. `-` when there is no data.' },
        },
        {
          name: 'privacy.tor',
          type: 'String',
          desc: { zh: '是否为 Tor 节点；没有数据时为 `-`。', en: 'Whether the address is a Tor node. `-` when there is no data.' },
        },
        {
          name: 'privacy.relay',
          type: 'String',
          desc: { zh: '是否为中继服务；没有数据时为 `-`。', en: 'Whether the address is a relay service. `-` when there is no data.' },
        },
        {
          name: 'privacy.hosting',
          type: 'String',
          desc: { zh: '是否为托管服务器；没有数据时为 `-`。', en: 'Whether the address is a hosting server. `-` when there is no data.' },
        },
        {
          name: 'privacy.service',
          type: 'String',
          desc: {
            zh: '所属的隐私服务名称；没有数据时为 `-`。',
            en: 'Name of the privacy service the address belongs to. `-` when there is no data.',
          },
        },
        { name: 'abuse', type: 'Object', desc: { zh: '滥用举报的联系信息，子字段列在下面。', en: 'Abuse contact details. Sub-fields are listed below.' } },
        { name: 'abuse.address', type: 'String', desc: { zh: '联系地址；没有数据时为 `-`。', en: 'Contact address. `-` when there is no data.' } },
        {
          name: 'abuse.country',
          type: 'String',
          desc: { zh: '联系方所在国家或地区；没有数据时为 `-`。', en: 'Country of the contact. `-` when there is no data.' },
        },
        { name: 'abuse.email', type: 'String', desc: { zh: '举报邮箱；没有数据时为 `-`。', en: 'Abuse email address. `-` when there is no data.' } },
        {
          name: 'abuse.name',
          type: 'String',
          desc: { zh: '联系人或机构名称；没有数据时为 `-`。', en: 'Contact or organization name. `-` when there is no data.' },
        },
        { name: 'abuse.network', type: 'String', desc: { zh: '网段；没有数据时为 `-`。', en: 'Network range. `-` when there is no data.' } },
        { name: 'abuse.phone', type: 'String', desc: { zh: '联系电话；没有数据时为 `-`。', en: 'Contact phone number. `-` when there is no data.' } },
        { name: 'domains', type: 'Object', desc: { zh: '同一 IP 上的域名信息，子字段列在下面。', en: 'Domains on the same address. Sub-fields are listed below.' } },
        { name: 'domains.ip', type: 'String', desc: { zh: '查询的 IP 地址。', en: 'The IP address that was looked up.' } },
        { name: 'domains.total', type: 'String', desc: { zh: '域名总数；没有数据时为 `-`。', en: 'Total number of domains. `-` when there is no data.' } },
        {
          name: 'domains.domains',
          type: 'Array',
          desc: { zh: '域名列表。样例中都是空数组 `[]`。', en: 'List of domain names. Every sample is an empty array (`[]`).' },
        },
      ],
    },
    {
      title: {
        zh: '`bilibili` 对象（`?db=bilibili`）：`ip`、`country` 和 `region` 总是有值，其余字段只有部分 IP 才有',
        en: 'The `bilibili` object (`?db=bilibili`): `ip`, `country` and `region` always have values; the other fields appear only for some addresses.',
      },
      items: [
        { name: 'ip', type: 'String', desc: { zh: '查询的 IP 地址。', en: 'The IP address that was looked up.' } },
        {
          name: 'country',
          type: 'String',
          desc: {
            zh: '国家或地区标签。境外 IP 常是域名，如 `GOOGLE.COM`；境内 IP 是中文名，如 `中国`。',
            en: 'Country or region label. Outside China it is often a domain, such as `GOOGLE.COM`; inside China it is a Chinese name, such as `中国`.',
          },
        },
        {
          name: 'region',
          type: 'String',
          desc: {
            zh: '省或地区标签。境外 IP 常是域名，如 `GOOGLE.COM`；境内 IP 是中文名，如 `广东`。',
            en: 'Province or region label. Outside China it is often a domain, such as `GOOGLE.COM`; inside China it is a Chinese name, such as `广东`.',
          },
        },
        {
          name: 'city',
          type: 'String',
          desc: {
            zh: '城市。境内 IP 是中文名，如 `江门`；只有部分 IP 有这一项。',
            en: 'City. Inside China it is a Chinese name, such as `江门`. Only some addresses have this field.',
          },
        },
        {
          name: 'loc',
          type: 'String',
          desc: {
            zh: '坐标，格式为 `纬度,经度`；只有部分 IP 有这一项。',
            en: 'Coordinates as `latitude,longitude`. Only some addresses have this field.',
          },
        },
        {
          name: 'company',
          type: 'Object',
          desc: {
            zh: '运营商信息，只有 `name` 一项；只有部分 IP 有这一项。',
            en: 'Operator details, holding only `name`. Only some addresses have this field.',
          },
        },
        {
          name: 'company.name',
          type: 'String',
          desc: {
            zh: '运营商名称，可能是域名，如 `level3.com`，也可能是中文名，如 `电信`。',
            en: 'Operator name. It can be a domain, such as `level3.com`, or a Chinese name, such as `电信`.',
          },
        },
      ],
    },
  ],
  errors: {
    note: {
      zh: '出错时 HTTP 状态仍是 200，请看返回里的 `code`。IP 有效时 `code` 为 200，即使某个数据源报错。',
      en: 'Errors still return HTTP 200, so read `code` in the body. A valid IP gives `code` 200 even when a source fails.',
    },
    items: [
      {
        code: '106',
        when: {
          zh: '合并查询（不带 `db`）或 `db=ipapi` 时，IP 无效。',
          en: 'Invalid IP in a merged query (no `db`) or with `db=ipapi`.',
        },
        body: '{"available_db":["ipapi","ipinfo","bilibili"],"ipapi":{"error":"The IP Address supplied is invalid.","upstream":{"code":106,"type":"invalid_ip_address","info":"The IP Address supplied is invalid."}},"ipinfo":{"error":"Upstream fetch failed"},"bilibili":{"error":"Upstream fetch failed"},"code":106}',
      },
      {
        code: '400',
        when: { zh: '`db=ipinfo` 时，IP 无效。', en: 'Invalid IP with `db=ipinfo`.' },
        body: '{"available_db":["ipapi","ipinfo","bilibili"],"ipinfo":{"error":"Lite upstream error (status: 400)"},"code":400}',
      },
      {
        code: '400',
        when: { zh: '`db=bilibili` 时，IP 无效。', en: 'Invalid IP with `db=bilibili`.' },
        body: '{"available_db":["ipapi","ipinfo","bilibili"],"bilibili":{"error":"invalid params"},"code":400}',
      },
      {
        code: '400',
        when: {
          zh: '`db` 的值不是 `ipapi`、`ipinfo` 或 `bilibili`。',
          en: 'The `db` value is not `ipapi`, `ipinfo` or `bilibili`.',
        },
        body: '{"available_db":["ipapi","ipinfo","bilibili"],"error":"Unknown db: nosuch","code":400}',
      },
      {
        code: '405',
        when: {
          zh: '请求方法不是 `GET`、`HEAD` 或 `OPTIONS`，如 `POST`、`PUT`、`DELETE`。',
          en: 'The request method is not `GET`, `HEAD` or `OPTIONS`, such as `POST`, `PUT` or `DELETE`.',
        },
        body: '{"available_db":["ipapi","ipinfo","bilibili"],"error":"Method Not Allowed","code":405}',
      },
    ],
  },
  notes: [
    {
      zh: '截至 2026 年 11 月，合并查询中 `ipinfo` 和 `bilibili` 会返回 `Upstream fetch failed`；需要这两个数据源时，请用 `db` 单独查询。',
      en: 'As of November 2026, merged queries return `Upstream fetch failed` for `ipinfo` and `bilibili`. To get data from either source, query it alone with `db`.',
    },
    {
      zh: '`OPTIONS` 是跨域预检请求，返回 204。响应都带 `Access-Control-Allow-Origin: *`，浏览器里可以直接用 `fetch` 调用。',
      en: '`OPTIONS` is the CORS preflight request and returns 204. Responses carry `Access-Control-Allow-Origin: *`, so browsers can call the API with `fetch` directly.',
    },
    {
      zh: '下面的示例返回是 2026 年 11 月 7 日抓取的快照。`current_time` 等字段会随时间变化，需要当前数据请重新查询。',
      en: 'The sample responses were captured on 7 November 2026. Values such as `current_time` change over time, so query again for current data.',
    },
  ],
  examples: [
    {
      title: { zh: '查询自己的 IP', en: 'Look up your own IP' },
      desc: { zh: '不带 IP 时，查询的是请求者自己的地址。', en: 'Without an IP, the lookup uses the address the request came from.' },
      lang: 'bash',
      code: 'curl https://api.furry.ist/ipapi',
    },
    {
      title: { zh: '只查 ipapi', en: 'Query ipapi only' },
      desc: {
        zh: '`db=ipapi` 返回位置、时区、运营商和安全信息。',
        en: '`db=ipapi` returns location, time zone, network and security data.',
      },
      lang: 'bash',
      code: 'curl "https://api.furry.ist/ipapi/8.8.8.8?db=ipapi"',
    },
    {
      title: { zh: 'IPv6 地址', en: 'IPv6 address' },
      desc: { zh: '路径里直接写 IPv6 地址即可。', en: 'Put an IPv6 address in the path the same way.' },
      lang: 'bash',
      code: 'curl "https://api.furry.ist/ipapi/2606:4700:4700::1111?db=ipapi"',
    },
    {
      title: { zh: '只查 ipinfo', en: 'Query ipinfo only' },
      desc: { zh: '大部分字段是 `-`，字段说明见上面的 `ipinfo` 部分。', en: 'Most fields are `-`. See the `ipinfo` fields above.' },
      lang: 'bash',
      code: 'curl "https://api.furry.ist/ipapi/1.1.1.1?db=ipinfo"',
    },
    {
      title: { zh: '只查 bilibili', en: 'Query bilibili only' },
      desc: {
        zh: '返回里的 `ip`、`country` 和 `region` 总是有值。',
        en: 'The response always includes `ip`, `country` and `region`.',
      },
      lang: 'url',
      code: 'https://api.furry.ist/ipapi/1.1.1.1?db=bilibili',
      response: '{"available_db":["ipapi","ipinfo","bilibili"],"bilibili":{"ip":"1.1.1.1","country":"CLOUDFLARE.COM","region":"CLOUDFLARE.COM"},"code":200}',
    },
    {
      title: { zh: '在 JavaScript 里使用', en: 'From JavaScript' },
      desc: {
        zh: '出错时 `response.ok` 仍是 `true`，要看返回里的 `code`。',
        en: 'On an error `response.ok` is still `true`, so check `code` in the body.',
      },
      lang: 'js',
      code: "const res = await fetch('https://api.furry.ist/ipapi/1.1.1.1?db=ipapi');\nconst data = await res.json();\nif (data.code !== 200) throw new Error(`Lookup failed with code ${data.code}`);\nconsole.log(data.ipapi.country_name);",
    },
    {
      title: { zh: '完整返回', en: 'Full response' },
      desc: {
        zh: '1.1.1.1 用 `db=ipapi` 查询的结果，2026 年 11 月 7 日抓取。',
        en: 'Result for 1.1.1.1 with `db=ipapi`, captured on 7 November 2026.',
      },
      lang: 'url',
      code: 'https://api.furry.ist/ipapi/1.1.1.1?db=ipapi',
      response: ipapiFull,
    },
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
