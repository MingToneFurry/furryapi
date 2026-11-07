// 图片来源名单。public/thank/name.js 里是站长在 X 上关注的创作者，图库照片都来自他们公开发布的内容。
// 那个文件是一段给浏览器用的脚本（const filteredUsers = [...]），构建时在隔离环境里执行一次取出数组。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export interface Creator {
  name: string;
  screen_name: string;
  description?: string;
}

let cache: Creator[] | undefined;

export function creators(): Creator[] {
  if (!cache) {
    const src = fs.readFileSync(path.join(process.cwd(), 'public/thank/name.js'), 'utf8');
    cache = (vm.runInNewContext(`${src}\n;filteredUsers`, {}, { timeout: 2000 }) as Creator[]).filter((c) => c.name && c.screen_name);
  }
  return cache;
}

export const profileUrl = (c: Creator) => `https://x.com/${encodeURIComponent(c.screen_name)}`;
