// 站点常量：外部链接、联系方式、统计脚本。

export const SITE_ORIGIN = 'https://api.furry.ist';
export const IMAGE_API = 'https://api.furry.ist/furry-img/';
export const STATUS_URL = 'https://stats.uptimerobot.com/6zqrufirxf';
export const EMAIL = 'furryimg@furry.ist';
export const CONTACT_CN = 'https://contact-furry-img.rth1.xyz/';
export const CONTACT_GLOBAL = 'https://contact-furryimg.pages.dev/';
export const ICP = { text: '萌ICP备 20245680号', url: 'https://icp.gov.moe/?keyword=20245680' };

/** 站长 QQ 头像，沿用旧站的网站图标 */
export const FAVICON = (spec: number) => `https://q.qlogo.cn/headimg_dl?dst_uin=2244347713&spec=${spec}`;

/** 只允许这些域名打开本站，其他域名会被 domain-redirect.js 跳回主域名 */
export const ALLOWED_HOSTS = 'sni-api.furry.ist,api.furry.ist,web.archive.org,localhost,127.0.0.1,*.furryapi.pages.dev';

export const UMAMI_ID = 'c46be53b-8c5c-4ad9-82d2-f39177a9b4a6';
export const MXANA_ID = 'c2-BeHTXiGx';

/** 图库数量，构建时从接口读取，失败时用这里的值 */
export const COUNTS_FALLBACK = { large: 1221, box: 2457 };

export async function getCounts(): Promise<{ large: number; box: number }> {
  try {
    const res = await fetch(`${SITE_ORIGIN}/counts.json`, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (Number.isInteger(data.large) && Number.isInteger(data.box)) return { large: data.large, box: data.box };
  } catch {
    // 构建环境连不上接口时使用备用数字
  }
  return COUNTS_FALLBACK;
}
