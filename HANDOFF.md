# 交接文档

## 当前目标

api.furry.ist 的前端已改写为 Astro 7 静态站，采用站长选定的「暗场影廊」风格：近黑底、全幅照片、灰阶文字、细线分隔，只有一个香槟色点缀。中英双语，中文在根路径，英文在 `/en/`。

## 当前状态（2026-11-08 已上线）

- 新站已发布到线上：`redesign` 分支快进合入 `main`（511e19d），Pages 项目 `furryapi` 的生产部署 `6b5fe1dd` 构建成功。
- 页面：首页（随机首屏大图、接口目录、图片墙和灯箱、快速开始、图片来源）、接口目录 `/apiIntro/`、四个接口的文档页（带在线试用）、IP 计算器 `/apiIntro/ip-calc/`、图片来源 `/thank/`、中英文 404、站点地图、`/llms.txt` 和完整的 Markdown 接口文档。
- 项目结构、照片、字体、SEO 和 GEO、友链等说明见 `README.md`。

## 上线时做了什么

1. Pages 构建设置改为：构建命令 `npm run build`，输出目录 `dist`，根目录留空。项目没有设置 `NODE_VERSION`，构建按 `.node-version` 安装 Node 24.20.0，依赖用 `npm clean-install` 安装，构建镜像 v3。
2. 先推送 `redesign` 分支生成预览（`https://redesign.furryapi.pages.dev`）并逐项检查：16 个页面都是 200；`/en/` 下找不到的地址显示英文 404，其他地址显示中文 404；`/_astro/*` 和 `/fonts/*` 只有一个 `Cache-Control: public, max-age=31536000, immutable`；`/thank/` 是 `no-store`；友链头像带 CSP；`/llms.txt` 是 `text/plain; charset=utf-8`。
3. 推送 `main` 正式发布后，按主机名清理了 `api.furry.ist` 和 `sni-api.furry.ist` 的缓存（旧站页面原本在边缘缓存 30 天）。
4. 正式域名复查：页面全部是新站，404 正确，没有 `x-robots-tag`；随机图、图库数量、一言、IP 查询、抖音解析这些接口都正常。

## 需要知道的

- **以后发布**：推送到 `main` 就会自动构建发布。页面每次向源站确认是否更新，不用再清缓存。线上页面的 `Cache-Control` 实际是 `max-age=300`（Cloudflare 后台的浏览器缓存 TTL 最低 5 分钟），访客浏览器最多缓存页面 5 分钟，不影响正确性。
- **回滚**：Pages 后台 → `furryapi` → 部署记录，找到旧站最后一次生产部署（`328efc16`，提交 eeb2f87）点“回滚到此部署”即可立即恢复旧站，和现在的构建设置无关。回滚后同样要按主机名清理一次缓存。
- **本地仓库**：主仓库 `F:\furryapi\furryapi index` 的 `main` 还停在旧站（eeb2f87），需要时在那里 `git pull` 快进到新站。它的 `.git/hooks/post-commit` 还会运行已经删除的 `generate-sitemap.js`，每次提交都报 `MODULE_NOT_FOUND`（不影响提交），站点地图现在由构建生成，可以删掉这个钩子。
- `F:\furryapi\wt\` 下是开发时用的工作树，分支都已合入，可以清理（先删掉每个工作树里指向共享依赖的 `node_modules` 链接，再 `git worktree remove`）。

## 上线后还可以做的（SEO 和 GEO）

- Cloudflare 后台的 AI 爬虫设置（屏蔽 AI 爬虫、AI Crawl Control、托管 robots.txt）会覆盖仓库里的 robots.txt。想让 AI 搜索和问答引擎读到并引用本站，就不要屏蔽它们；用 `curl https://api.furry.ist/robots.txt` 看线上实际生效的内容。
- 在 Google Search Console、Bing Webmaster Tools 和百度搜索资源平台提交 `https://api.furry.ist/sitemap.xml`（需要站长自己的账号）。

## 已知的接口问题（与前端无关）

- IP 查询的合并模式里，`ipinfo` 和 `bilibili` 总是返回 `Upstream fetch failed`，单独查询这两个源是正常的。
- 抖音解析文档里的示例链接 `https://v.douyin.com/DQyLiuMdIlk/` 现在返回 422，需要换一个有效的分享链接。

## 授权与边界

- 发布、修改 Pages 设置、使用 `.env` 里的 Cloudflare 令牌，都需要站长明确同意。
- 正式发布走 Pages（推送 `main`），不要用 `wrangler deploy` 代替。
- 图库在独立的 `furry-img-pages` 项目里，不在这个仓库。首页用的精选照片从本地图库导入，见 `README.md`。
