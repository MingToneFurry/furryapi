# FurryAPI 前端项目

当前站点为静态前端结构，已整理为统一的页面 / 样式 / 脚本目录。

## 当前目录结构

- `index.html`：首页
- `apiIntro/`：API 文档与工具页
	- `image-api/`：图片 API 文档
	- `ip-api/`：IP 查询 API 文档
	- `ip-calc/`：IP 计算器工具
- `thank/`：感谢名单页
- `styles/`：公共与页面级样式
- `scripts/`：公共脚本
- `functions/`：Cloudflare Functions
- `generate-sitemap.js`：生成 `sitemap.xml`

## IP API 最新说明

### 基础地址

- `https://sni-api.furry.ist/ipapi`
- `https://sni-api.furry.ist/ipapi/{ip}`

### 新增内容

- 新增数据库：`ipapi`、`bilibili`
- 现支持通过 `?db=` 指定数据库
- 默认聚合结果中会返回 `available_db`

### 当前可用数据库

- `ipapi`
- `ipinfo`
- `bilibili`

### 注意事项

- `bilibili` 当前在聚合模式下可能报错
- 目前仅在 `?db=bilibili` 时表现正常

### 示例

- `https://sni-api.furry.ist/ipapi/1.1.1.1?db=ipapi`
- `https://sni-api.furry.ist/ipapi/1.1.1.1?db=ipinfo`
- `https://sni-api.furry.ist/ipapi/1.1.1.1?db=bilibili`

## 资源组织说明

### 样式

- `styles/common.css`：全站公共样式
- `styles/home.css`：首页样式
- `styles/api-docs.css`：API 文档页样式
- `styles/thank.css`：感谢页样式

### 脚本

- `scripts/core.js`：语言、主题、通用交互
- `scripts/dynamic-bg.js`：动态背景
- `scripts/domain-redirect.js`：域名重定向

## 已移除内容

- 已下线 Swagger UI 前端入口
- 已停止维护 `SwaggerDocs/` 文档方案
