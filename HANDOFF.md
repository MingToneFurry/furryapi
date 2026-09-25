# 交接文档

## 当前目标

首页友情链接头像不再从对方站点实时加载，改为由脚本拉取后缓存到本站 `assets/friends/`，发布到 Cloudflare Pages 项目 `furryapi`。

## 当前状态

- 友链数据来源是 `friends.json`，`generate-friends.js` 拉取头像并重写 `index.html` 中 `<!-- friends:start -->` 与 `<!-- friends:end -->` 之间的内容。
- 头像保存为 `assets/friends/<slug>.<内容哈希>.<扩展名>`，必须提交进 git（站点无构建步骤，Pages 直接部署仓库文件）。
- 拉取失败时保留上一次成功的头像，从未成功过则使用 `assets/friends/default.svg`。
- 脚本需在国内网络下本地运行（部分友链站点屏蔽海外）；不使用 GitHub Actions 定时任务，也不改 Pages 构建命令。
- `_headers` 为 `/assets/friends/*` 增加了 CSP `sandbox`；缓存沿用全站规则，未单独设置 `Cache-Control`，避免与 `/*.png` 等规则叠加冲突。
- 正式内容承载在 Pages；不要用 `wrangler deploy` 代替 Pages 发布。

## 验收

推送后检查 `https://api.furry.ist/` 首页友链区的 `<img src>` 均指向 `/assets/friends/`，且对应图片可正常访问。

## 授权与边界

本任务在用户授权的维护环境中执行。操作范围仅限本仓库、关联 GitHub 仓库和 Cloudflare Pages 项目 `furryapi`；不处理任何非本项目资源或凭据。
