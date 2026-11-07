# FurryAPI

FurryAPI（<https://api.furry.ist>）是给福瑞圈准备的免费公开接口站，目前提供随机兽装照片、IP 查询、一言、抖音解析，以及一个在浏览器里运行的 IP 计算器。不需要注册，也没有密钥，复制地址就能用。

站点是双语的：中文在根路径，英文在 `/en/` 下，两种语言的页面一一对应。

## 技术栈

- Astro 7（静态输出）+ TypeScript
- Node.js 24：`.node-version` 指定 24.20.0；Astro 7 本身要求 Node.js 22.23.4 及以上
- 静态文件发布到 Cloudflare Pages

## 目录结构

```text
.
├── .node-version              Pages 使用的 Node 版本
├── astro.config.mjs           Astro 配置：站点地址、宋体裁剪
├── package.json
├── tsconfig.json
├── wrangler.jsonc             Workers 风格的资源配置（Pages 不读取）
├── fonts-src/                 宋体源文件（GB2312 字符，字重 400–600）及许可证
├── integrations/
│   └── font-subset.mjs        构建后按页面用字裁剪宋体
├── public/                    原样发布的文件
│   ├── _headers               响应头规则（只在 Cloudflare 生效）
│   ├── robots.txt
│   ├── favicon.ico
│   ├── assets/friends/        友链头像缓存（npm run friends 生成）
│   ├── scripts/domain-redirect.js
│   └── thank/name.js          感谢名单数据
├── scripts/
│   ├── generate-friends.mjs   拉取友链头像
│   └── make-serif-source.mjs  一次性：从完整宋体裁出 fonts-src/ 的源文件
└── src/
    ├── apis/                  接口登记表：每个接口一个文件，index.ts 汇总
    ├── assets/picks/          首页图库精选（WebP，由 astro:assets 处理）
    ├── components/            页头、页脚、接口目录；home/ 下是首页组件
    ├── data/friends.json      友链列表
    ├── i18n/index.ts          中英文文字，以及中英文地址的生成规则
    ├── layouts/Base.astro     页面外壳：语言、hreflang、统计脚本
    ├── lib/                   站点常量（site.ts）和格式化工具（format.ts）
    ├── pages/
    │   ├── [...lang]/index.astro   首页（中文 /，英文 /en/）
    │   └── sitemap.xml.ts          站点地图 /sitemap.xml
    ├── scripts/               浏览器端脚本，由 <script> 引入并打包
    └── styles/global.css      全站样式
```

## 常用命令

```bash
npm install        # 安装依赖（首次，或依赖变化后）
npm run dev        # 启动开发服务器
npm run build      # 构建到 dist/
npm run preview    # 预览 dist/（不会套用 _headers）
npm test           # 运行 src/ 下的 *.test.ts（Node 内置测试运行器）；目前还没有测试文件，命令会正常结束
npm run friends    # 拉取友链头像，见下文
```

## 新增接口

1. 在 `src/apis/` 下新建一个文件，可以参考 `image.ts`。接口用 `ApiDoc`，工具页用 `ToolDoc`，类型定义在 `src/apis/types.ts`。
2. 在 `src/apis/index.ts` 里 `import` 它，并把它加进 `entries` 数组。
3. 文档页地址是 `/apiIntro/<slug>/`，英文是 `/en/apiIntro/<slug>/`。首页目录、页脚和站点地图都从 `entries` 生成，不需要另外改。

`slug` 沿用旧站的地址，发布后不要改。

## 构建时的外部请求

构建首页时会请求 `https://api.furry.ist/counts.json` 取图库数量，超时 8 秒。请求失败时使用 `src/lib/site.ts` 里的备用数字（`COUNTS_FALLBACK`），构建不会因此失败。

## 宋体裁剪

标题用的宋体在构建后裁剪：`integrations/font-subset.mjs` 扫描输出页面里用宋体显示的文字，只把用到的字从 `fonts-src/` 的源字体中取出，生成 `fonts/serif-*.woff2`。脚本里动态写入的文字要列在 `astro.config.mjs` 的 `extra` 中。开发时则按 `src/` 里出现过的全部字生成字体。这一部分正在重做，细节以代码为准。源字体来自思源宋体，许可证见 `fonts-src/OFL-NotoSerifSC.txt`。

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
- 构建需要 devDependencies（字体裁剪用的 `subset-font`、`node-html-parser`，图片处理用的 `sharp` 等）。不要在 Pages 的环境变量里设置 `NODE_ENV=production`，否则 npm 会跳过它们。
- `public/_headers` 只在 Cloudflare 上生效，`npm run preview` 不会套用。其中的 detach 写法要在首次预览部署后用 `curl -sI` 核对，说明见文件内注释。
- 正式发布走 Pages，不要用 `wrangler deploy` 代替。`wrangler.jsonc` 把 `assets.directory` 设为 `dist`，但 Pages 发布不读取它，构建设置以 Pages 控制台为准。
- 站点地图由 `src/pages/sitemap.xml.ts` 生成，地址列表来自接口登记表；`public/robots.txt` 指向 `https://api.furry.ist/sitemap.xml`。

## 迁移状态

首页、接口登记表、站点地图、友链和部署配置已就绪。接口文档页（`/apiIntro/`）、感谢页（`/thank/`）和 404 页还在迁移中。在它们合入之前，页脚和导航里的这些链接没有对应页面，站点地图也会列出它们。
