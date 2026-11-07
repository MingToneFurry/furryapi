# FurryAPI

FurryAPI（<https://api.furry.ist>）是给福瑞圈准备的免费公开接口站，目前提供随机兽装照片、IP 查询、一言、抖音解析，以及一个在浏览器里运行的 IP 计算器。不需要注册，也没有密钥，复制地址就能用。

站点是双语的：中文在根路径，英文在 `/en/` 下，两种语言的页面一一对应。

## 技术栈

- Astro 7（静态输出）+ TypeScript，浏览器端只有少量原生脚本
- Node.js 24：`.node-version` 指定 24.20.0；Astro 7 本身要求 Node.js 22.23.4 及以上
- 字体：英文用 Inter（`@fontsource-variable/inter`）；中文标题用思源黑体、代码用 JetBrains Mono，两者自托管并在构建时裁剪
- 静态文件发布到 Cloudflare Pages

## 目录结构

```text
.
├── .node-version              Pages 使用的 Node 版本
├── astro.config.mjs           Astro 配置：站点地址、字体裁剪
├── package.json
├── tsconfig.json
├── wrangler.jsonc             Workers 风格的资源配置（Pages 不读取）
├── fonts-src/                 字体源文件及许可证：思源黑体（GB2312 字符，字重 400–700）、JetBrains Mono
├── integrations/
│   └── font-subset.mjs        构建后按页面用字裁剪字体
├── public/                    原样发布的文件
│   ├── _headers               响应头规则（只在 Cloudflare 生效）
│   ├── robots.txt
│   ├── favicon.ico
│   ├── assets/friends/        友链头像缓存（npm run friends 生成）
│   ├── scripts/domain-redirect.js
│   └── thank/name.js          图片来源名单（X 创作者）
├── scripts/
│   ├── generate-friends.mjs   拉取友链头像
│   ├── import-photos.mjs      从本地图库导入精选照片到 src/assets/photos/
│   └── make-sans-source.mjs   一次性：从完整思源黑体裁出 fonts-src/ 的源文件
└── src/
    ├── apis/                  接口登记表：每个接口一个文件，index.ts 汇总
    ├── assets/photos/         首屏和图片墙用的精选照片（WebP，由 astro:assets 生成各个尺寸）
    ├── components/            页头、页脚、灯箱、接口目录；home/ 是首页组件，docs/ 是文档页组件
    ├── data/                  photos.json 精选照片清单，friends.json 友链列表
    ├── i18n/index.ts          中英文文字，以及中英文地址的生成规则
    ├── layouts/Base.astro     页面外壳：语言、hreflang、字体、统计脚本
    ├── lib/                   站点常量、字体、照片、图片来源名单、IP 计算、抖音链接解析等
    ├── pages/
    │   ├── [...lang]/index.astro            首页（中文 /，英文 /en/）
    │   ├── [...lang]/apiIntro/index.astro   接口目录
    │   ├── [...lang]/apiIntro/[slug]/       每个接口的文档页，带在线试用
    │   ├── [...lang]/apiIntro/ip-calc/      IP 计算器
    │   ├── [...lang]/thank/                 图片来源
    │   ├── 404.astro、en/404.astro          中文和英文的 404 页
    │   └── sitemap.xml.ts                   站点地图 /sitemap.xml
    ├── scripts/               浏览器端脚本，由 <script> 引入并打包
    └── styles/global.css      全站样式和设计变量
```

## 常用命令

```bash
npm install        # 安装依赖（首次，或依赖变化后）
npm run dev        # 启动开发服务器
npm run build      # 构建到 dist/
npm run preview    # 预览 dist/（不会套用 _headers）
npm test           # 运行 src/ 下的 *.test.ts（Node 内置测试运行器）
npm run friends    # 拉取友链头像，见下文
```

## 新增接口

1. 在 `src/apis/` 下新建一个文件，可以参考 `image.ts`。接口用 `ApiDoc`，工具页用 `ToolDoc`，类型定义在 `src/apis/types.ts`。
2. 在 `src/apis/index.ts` 里 `import` 它，并把它加进 `entries` 数组。
3. 文档页地址是 `/apiIntro/<slug>/`，英文是 `/en/apiIntro/<slug>/`。首页目录、文档侧栏、页脚和站点地图都从 `entries` 生成，不需要另外改。
4. 文档页右侧的在线试用按参数自动生成表单。要显示图片、文字等预览，在 `playground.preview` 里指定类型，预览写在 `src/scripts/playground.ts`。

`slug` 沿用旧站的地址，发布后不要改。

## 构建时的外部请求

构建首页时会请求 `https://api.furry.ist/counts.json` 取图库数量，超时 8 秒。请求失败时使用 `src/lib/site.ts` 里的备用数字（`COUNTS_FALLBACK`），构建不会因此失败。

## 照片

首屏大图和图片墙只用 `src/data/photos.json` 里挑出来的照片：

- `heroLandscape`、`heroPortrait`：首屏候选，宽屏用横版，竖屏用竖版。每次打开页面随机选一张，「换一张」在同一组里轮换。`focus` 是裁切时保留的位置（`object-position`）。
- `gallery`：图片墙，点开是灯箱，链接指向线上原图。

照片文件不从线上下载，而是从本地图库（`furry-img-pages` 项目的 `public/`）缩小后复制：

```bash
node scripts/import-photos.mjs <图库 public 目录>
```

改了 `photos.json` 之后运行一次，并提交 `src/assets/photos/` 里的变化。脚本会删掉清单里已经没有的照片。

## 图片来源

图库里的照片都是站长在 X 上关注的创作者公开发布的作品。名单在 `public/thank/name.js`（`const filteredUsers = [...]`），构建时由 `src/lib/sources.ts` 读取，生成 `/thank/` 页面和首页的图片来源一节。名单更新后需要重新构建发布。

## 字体

- 中文标题（`h1`、`h2`、`h3` 和带 `data-display` 的元素）用思源黑体。构建后 `integrations/font-subset.mjs` 收集这些元素里出现过的汉字，只把它们裁进字体；脚本动态写入的文字要加到 `astro.config.mjs` 里这份字体的 `text`。
- 代码和数字用 JetBrains Mono，保留固定的字符集（ASCII 和少量符号，见 `astro.config.mjs` 的 `MONO_TEXT`）。
- 生成的文件是 `dist/fonts/<id>.<内容哈希>.woff2`。`@font-face` 直接写在每个页面的 `<head>` 里，地址先写成占位符 `__FONT_URL_<id>__`，构建后替换成带哈希的地址（见 `src/lib/fonts.ts`）。字体内容变了地址就会变，可以长期缓存。
- 开发时按 `src/` 里出现过的全部字符生成一份较大的字体，开发服务器在 `/fonts/<id>.dev.woff2` 提供。
- 源字体许可证见 `fonts-src/OFL-NotoSansSC.txt` 和 `fonts-src/OFL-JetBrainsMono.txt`。

## 友链头像

友链数据在 `src/data/friends.json`。头像不从对方站点实时加载，而是由脚本拉取到 `public/assets/friends/`，文件名为 `<slug>.<内容哈希>.<扩展名>`，构建时页脚按 slug 找到它。拉取失败时保留上一次的头像，从未成功过则用 `default.svg` 占位。

```bash
npm run friends
```

- 部分友链站点屏蔽海外访问，请在国内网络环境下运行。
- 需要代理时（Node 24 起支持）：
  - bash：`NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7890 npm run friends`
  - PowerShell：`$env:NODE_USE_ENV_PROXY='1'; $env:HTTPS_PROXY='http://127.0.0.1:7890'; npm run friends`
- 脚本结束时会输出每个友链的状态表：`kept-old` 表示沿用了旧头像，`placeholder` 表示用了占位图。
- 运行后，把 `public/assets/friends/` 里的变化一起提交。
- 对方站点完全拉不到时：先在该友链条目里写 `"avatarFile": "文件名"`，再把图片放进 `public/assets/friends/` 并运行脚本。顺序反过来的话，脚本会把未登记的文件当作多余文件删掉。

## 部署

站点发布到 Cloudflare Pages。旧站没有构建步骤，改用 Astro 后，Pages 项目的构建设置要改成：

- 构建命令：`npm run build`
- 构建输出目录：`dist`

其它要点：

- Node 版本由根目录的 `.node-version` 决定。若 Pages 项目里设置过 `NODE_VERSION`，请与它保持一致（文档没有说明两者的优先级）。
- 构建需要 devDependencies（字体裁剪用的 `subset-font`、`node-html-parser`，图片处理用的 `sharp`）。不要在 Pages 的环境变量里设置 `NODE_ENV=production`，否则 npm 会跳过它们。
- `public/_headers` 只在 Cloudflare 上生效，`npm run preview` 不会套用。其中的 detach 写法要在首次预览部署后用 `curl -sI` 核对，说明见文件内注释。
- 正式发布走 Pages，不要用 `wrangler deploy` 代替。`wrangler.jsonc` 把 `assets.directory` 设为 `dist`，但 Pages 发布不读取它，构建设置以 Pages 控制台为准。
- 站点地图由 `src/pages/sitemap.xml.ts` 生成，地址列表来自接口登记表；`public/robots.txt` 指向 `https://api.furry.ist/sitemap.xml`。
- 404 页有两份：`src/pages/404.astro` 生成 `dist/404.html`（中文），`src/pages/en/404.astro` 生成 `dist/en/404.html`（英文）。Pages 找不到页面时用离请求路径最近的 404.html，所以 `/en/` 下的地址会显示英文版。这依赖 `astro.config.mjs` 里的 `build.format: 'preserve'`，改成别的格式会把英文版生成为 `en/404/index.html`。
