# 交接文档

## 当前目标

把 api.furry.ist 的前端改写为 Astro 7 静态站，采用站长选定的「暗场影廊」风格：近黑底、全幅照片、灰阶文字、细线分隔，只有一个香槟色点缀。中英双语，中文在根路径，英文在 `/en/`。

## 当前状态

- 代码在 `redesign` 分支，工作目录是 `F:\furryapi\furryapi-next`（主仓库 `F:\furryapi\furryapi index` 的一个 worktree）。只在本地提交，没有推送，也没有发布。
- 已完成的页面：
  - 首页：随机首屏大图（「换一张」）、接口目录、图片墙和灯箱、快速开始、图片来源。
  - 接口目录 `/apiIntro/`，四个接口的文档页（带在线试用）。
  - IP 计算器 `/apiIntro/ip-calc/`，图片来源 `/thank/`，404 页，站点地图。
- 线上仍是 `main` 分支上的旧站，Pages 构建设置没有改。
- 项目结构、照片、字体、友链等说明见 `README.md`。

## 上线前要做的事（都需要站长确认后再做）

1. 把 `redesign` 合入 `main` 并推送。
2. 修改 Pages 项目 `furryapi` 的构建设置：构建命令 `npm run build`，输出目录 `dist`。如果设置过 `NODE_VERSION`，与 `.node-version` 保持一致；不要设置 `NODE_ENV=production`。
3. 首次预览部署后用 `curl -sI` 核对 `_headers`：
   - `/_astro/*` 和 `/fonts/*` 只有一个 `Cache-Control: public, max-age=31536000, immutable`。
   - `/thank/` 和 `/thank/name.js` 是 `no-store`。
   - `/assets/friends/*` 带 `Content-Security-Policy`。
4. 正式发布后，立刻按主机名清理 `api.furry.ist` 和 `sni-api.furry.ist` 的缓存。2026-11-08 核实过：线上旧站的页面在边缘缓存里（`CF-Cache-Status: HIT`，旧 `_headers` 让页面缓存 30 天），不清理的话访客会继续看到旧页面。新站的 `_headers` 让页面每次向源站确认，之后发布就不用再清。清完用 `curl -sI https://api.furry.ist/` 看 `CF-Cache-Status` 不再是长时间的 HIT；如果仍然是，说明后台有覆盖源站缓存头的缓存规则，需要调整。
5. 主仓库的 `.git/hooks/post-commit` 还会运行已经删除的 `generate-sitemap.js`，每次提交都报 `MODULE_NOT_FOUND`，但不影响提交。站点地图现在由构建生成，确认后可以删掉这个钩子。

## 上线后在后台核对（SEO 和 GEO）

- `curl -sI https://api.furry.ist/llms.txt` 的 `Content-Type` 应带 `charset=utf-8`，否则有的客户端会把中文显示成乱码。没有的话在 `_headers` 里给 `/llms.txt`、`/llms-full.txt`、`/en/llms-full.txt` 补上。
- Cloudflare 后台的 AI 爬虫设置（屏蔽 AI 爬虫、AI Crawl Control、托管 robots.txt）会覆盖仓库里的 robots.txt。想让 AI 搜索和问答引擎读到并引用本站，就不要屏蔽它们；用 `curl https://api.furry.ist/robots.txt` 看线上实际生效的内容。
- 在 Google Search Console、Bing Webmaster Tools 和百度搜索资源平台提交 `https://api.furry.ist/sitemap.xml`（需要站长自己的账号）。

## 验收

- 中英文各页面都能打开，导航和页脚里的站内链接都有对应页面。
- 首页每次打开首屏大图不同，「换一张」可用；图片墙和在线试用的图片可以用灯箱放大。
- 文档页的在线试用，四个接口都能返回结果。
- 不存在的地址返回 404 页。

## 已知的接口问题（与前端无关）

- IP 查询的合并模式里，`ipinfo` 和 `bilibili` 总是返回 `Upstream fetch failed`，单独查询这两个源是正常的。
- 抖音解析文档里的示例链接 `https://v.douyin.com/DQyLiuMdIlk/` 现在返回 422，需要换一个有效的分享链接。

## 授权与边界

- 发布、修改 Pages 设置、使用 `.env` 里的 Cloudflare 令牌，都需要站长明确同意。
- 正式发布走 Pages，不要用 `wrangler deploy` 代替。
- 图库在独立的 `furry-img-pages` 项目里，不在这个仓库。首页用的精选照片从本地图库导入，见 `README.md`。
