# 交接文档

## 当前目标

从 `/thank` 感谢名单中移除 `@treeyupail` 和 `@linmo245712`，并发布到 Cloudflare Pages 项目 `furryapi`。

## 当前状态

- 名单来源是 `thank/name.js`，由 `thank/index.html` 加载。
- 两条记录已删除，名单总数为 782；`treeyupail` 和 `linmo245712` 均为 0 命中。
- Git 已推送到 `main`：`e50fabd517aa5f4fc6e5a379d0c1e2e8e88a5685`。
- Cloudflare Pages 项目 `furryapi` 已生产部署：`c3123e66-07f1-47bc-bda9-197271ed200c`。正式内容承载在 Pages；不要用 `wrangler deploy` 代替 Pages 发布。
- `/thank/` 与 `thank/name.js` 使用 `no-store`，页面引用带版本参数，避免名单更新复用旧缓存。
- 已在 `furryapi.pages.dev` 和 `api.furry.ist` 的无参数与随机 query 请求复核：均返回新 SHA-256 `84c9519834ad52fde2138c5b1c961e834f5e9641773d4d176a7c1245092b5d4e`。

## 验收

后续变更后分别检查 `https://furryapi.pages.dev/thank/name.js` 和 `https://api.furry.ist/thank/name.js` 的随机 query 响应：两个目标标识均为 0 次命中，名单为 782 条。

## 授权与边界

本任务在用户授权的维护环境中执行。操作范围仅限本仓库、关联 GitHub 仓库和 Cloudflare Pages 项目 `furryapi`；不处理任何非本项目资源或凭据。
