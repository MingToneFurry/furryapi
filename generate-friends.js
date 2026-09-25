// 拉取 friends.json 中的友链头像到本站 assets/friends/，并重写 index.html 的友链区块。
// 用法：node generate-friends.js（Node 18+，无依赖）
// 需要代理时（Node 24+）：NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7890 node generate-friends.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname);
const FRIENDS_JSON = path.join(ROOT, 'friends.json');
const AVATAR_DIR = path.join(ROOT, 'assets', 'friends');
const AVATAR_URL_PREFIX = '/assets/friends/';
const DEFAULT_AVATAR = 'default.svg';
const INDEX_HTML = path.join(ROOT, 'index.html');
const MARK_START = '<!-- friends:start -->';
const MARK_END = '<!-- friends:end -->';

const TIMEOUT_MS = 15000;
const RETRIES = 1;
const MAX_BYTES = 2 * 1024 * 1024;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

// 按文件内容判断类型，不信任源 URL 后缀和 Content-Type
function sniffExt(buf) {
  const hex = buf.subarray(0, 12).toString('hex');
  if (hex.startsWith('89504e470d0a1a0a')) return 'png';
  if (hex.startsWith('ffd8ff')) return 'jpg';
  if (hex.startsWith('47494638')) return 'gif';
  if (hex.startsWith('52494646') && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  if (hex.startsWith('00000100')) return 'ico';
  if (buf.subarray(4, 12).toString() === 'ftypavif') return 'avif';
  const head = buf.subarray(0, 512).toString('utf8').replace(/^﻿/, '').trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) return 'svg';
  return null;
}

async function fetchOnce(url, referer) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
      'Referer': referer,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const len = Number(res.headers.get('content-length') || 0);
  if (len > MAX_BYTES) throw new Error(`文件过大 ${len} bytes`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error(`文件过大 ${buf.length} bytes`);
  const ext = sniffExt(buf);
  if (!ext) throw new Error(`不是图片（Content-Type: ${res.headers.get('content-type')}）`);
  return { buf, ext };
}

async function fetchAvatar(url, referer) {
  let lastErr;
  for (let i = 0; i <= RETRIES; i++) {
    try {
      return await fetchOnce(url, referer);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

function existingFiles(slug) {
  return fs.readdirSync(AVATAR_DIR).filter(f => f.startsWith(`${slug}.`));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function processFriend(friend) {
  const old = existingFiles(friend.slug);

  // 对方站点完全拉不到时，可手动把图放进 assets/friends/ 并在 friends.json 里写 avatarFile（文件名）
  if (friend.avatarFile) {
    return { file: friend.avatarFile, status: 'manual' };
  }

  try {
    const { buf, ext } = await fetchAvatar(friend.avatar, friend.url);
    const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
    const file = `${friend.slug}.${hash}.${ext}`;
    fs.writeFileSync(path.join(AVATAR_DIR, file), buf);
    old.filter(f => f !== file).forEach(f => fs.unlinkSync(path.join(AVATAR_DIR, f)));
    return { file, status: old.includes(file) ? 'unchanged' : 'updated' };
  } catch (err) {
    // 拉取失败时保留上一次成功的文件；从未成功过则用占位图
    if (old.length > 0) return { file: old[0], status: 'kept-old', error: err.message };
    return { file: DEFAULT_AVATAR, status: 'placeholder', error: err.message };
  }
}

function renderLinks(friends, results, eol) {
  return friends.map((f, i) => [
    `          <a href="${escapeHtml(f.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(f.title || f.name)}">`,
    `            <img loading="lazy" src="${AVATAR_URL_PREFIX}${escapeHtml(results[i].file)}" alt="${escapeHtml(f.name)}">`,
    `            ${escapeHtml(f.name)}`,
    `          </a>`,
  ].join('\n')).join('\n');
}

async function main() {
  const friends = JSON.parse(fs.readFileSync(FRIENDS_JSON, 'utf8'));
  const slugs = new Set();
  for (const f of friends) {
    if (!/^[a-z0-9-]+$/.test(f.slug || '')) throw new Error(`slug 只能包含小写字母、数字和 -：${JSON.stringify(f.slug)}`);
    if (f.slug === 'default') throw new Error('slug 不能为 default（与占位图冲突）');
    if (slugs.has(f.slug)) throw new Error(`slug 重复：${f.slug}`);
    slugs.add(f.slug);
  }
  fs.mkdirSync(AVATAR_DIR, { recursive: true });

  const results = await Promise.all(friends.map(processFriend));

  // 删除已不在 friends.json 中的友链头像
  const keep = new Set([DEFAULT_AVATAR, ...results.map(r => r.file)]);
  fs.readdirSync(AVATAR_DIR)
    .filter(f => !keep.has(f))
    .forEach(f => fs.unlinkSync(path.join(AVATAR_DIR, f)));

  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  const start = html.indexOf(MARK_START);
  const end = html.indexOf(MARK_END);
  if (start === -1 || end === -1 || end < start) throw new Error(`index.html 中缺少 ${MARK_START} / ${MARK_END} 标记`);
  const next = `${html.slice(0, start + MARK_START.length)}\n${renderLinks(friends, results)}\n          ${html.slice(end)}`;
  fs.writeFileSync(INDEX_HTML, next);

  console.table(friends.map((f, i) => ({ slug: f.slug, status: results[i].status, file: results[i].file, error: results[i].error || '' })));
  console.log('index.html 友链区块已更新');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
