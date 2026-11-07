// 文档页的在线试用：按表单拼出请求地址，发送后显示状态、耗时、预览和原始响应。
// 默认值不写进地址，地址保持最短；路径参数（如 IP 查询的 ip）拼在基础地址后面。
import { extractDouyinUrl } from '../lib/douyin-url';
import { openLightbox } from './lightbox';

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

// 接口返回的是 4K 原图，预览时走 Cloudflare 图片变换缩小。每张只用一种尺寸参数（横版 1600、竖版 1200），
// 同一张图每月只算一次转换，整个图库也在免费额度内；变换失败时退回原图
function resizedUrl(photo: { url: string; type: 'large' | 'box' }) {
  const u = new URL(photo.url);
  const width = photo.type === 'box' ? 1200 : 1600;
  return `${u.origin}/cdn-cgi/image/width=${width},quality=82,format=auto${u.pathname}`;
}

type Json = Record<string, unknown>;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

/** 把对象里的简单字段列成一张键值表，跳过空值和嵌套对象 */
function kv(data: Json, limit = 10) {
  const dl = el('dl', { className: 'kv' });
  let n = 0;
  for (const [k, v] of Object.entries(data)) {
    if (n >= limit) break;
    if (v === null || v === '' || v === '-' || typeof v === 'object') continue;
    dl.append(el('dt', {}, k), el('dd', {}, String(v)));
    n++;
  }
  return dl;
}

export function initPlayground(root: HTMLElement) {
  const S = JSON.parse(root.dataset.strings ?? '{}') as Record<string, string>;
  const base = root.dataset.base!;
  const kind = root.dataset.preview ?? '';
  const form = root.querySelector<HTMLFormElement>('[data-form]')!;
  const urlEl = root.querySelector<HTMLElement>('[data-url]')!;
  const copy = urlEl.parentElement!.querySelector<HTMLElement>('[data-copy]');
  const send = root.querySelector<HTMLButtonElement>('[data-send]')!;
  const sendLabel = root.querySelector<HTMLElement>('[data-send-label]')!;
  const state = root.querySelector<HTMLElement>('[data-state]')!;
  const empty = root.querySelector<HTMLElement>('[data-empty]')!;
  const preview = root.querySelector<HTMLElement>('[data-preview-area]')!;
  const rawWrap = root.querySelector<HTMLDetailsElement>('[data-raw-wrap]')!;
  const raw = root.querySelector<HTMLElement>('[data-raw]')!;
  let busy = false;

  function buildUrl() {
    let path = base;
    const query = new URLSearchParams();
    for (const input of Array.from(form.querySelectorAll<HTMLInputElement>('input[name]'))) {
      const { name, type } = input;
      if (type === 'radio') {
        if (input.checked && input.value !== input.dataset.default) query.append(name, input.value);
      } else if (type === 'checkbox') {
        if (input.checked) query.append(name, input.value);
      } else {
        let value = input.value.trim();
        if (!value) continue;
        if (kind === 'douyin' && name === 'url') value = extractDouyinUrl(value);
        if (input.dataset.in === 'path') path = `${path.replace(/\/$/, '')}/${encodeURIComponent(value)}`;
        else query.append(name, value);
      }
    }
    const qs = query.toString();
    return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path;
  }

  function update() {
    const url = buildUrl();
    urlEl.textContent = url;
    if (copy) copy.dataset.copy = url;
    return url;
  }

  function setState(ok: boolean, text: string) {
    state.replaceChildren(el('span', { className: ok ? 'dot' : 'dot bad' }), text);
  }

  function show(...nodes: Node[]) {
    empty.hidden = true;
    preview.hidden = nodes.length === 0;
    preview.replaceChildren(...nodes);
  }

  function showRaw(text: string | null) {
    rawWrap.hidden = text === null;
    raw.textContent = text ?? '';
  }

  /** 预览图外面包一层按钮，点开在灯箱里看大图 */
  function zoomable(img: HTMLImageElement, caption: string, href?: string) {
    const button = el('button', { type: 'button', className: 'zoom', title: S['lightbox.zoom'] }, img);
    button.setAttribute('aria-label', S['lightbox.zoom']);
    button.addEventListener('click', () =>
      openLightbox([{ src: img.currentSrc || img.src, alt: img.alt, caption, href, referrerPolicy: img.referrerPolicy }], 0, button),
    );
    return button;
  }

  function photoNodes(url: string, type: string, filename: string) {
    const n = String(parseInt(filename, 10));
    const img = el('img', { alt: '', decoding: 'async' });
    img.src = resizedUrl({ url, type: type === 'box' ? 'box' : 'large' });
    img.addEventListener('error', () => (img.src = url), { once: true });
    const link = el('a', { href: url, target: '_blank', rel: 'noopener' }, S['hero.original']);
    const label = type === 'box' ? S['hero.box'] : S['hero.large'];
    const caption = `${fill(S['hero.no'], { n })} · ${label}`;
    return [zoomable(img, caption, url), el('p', { className: 'cap' }, `${caption} · `, link)];
  }

  function renderJson(data: unknown): Node[] {
    if (!data || typeof data !== 'object') return [];
    const d = data as Json;
    if (kind === 'image' && typeof d.url === 'string') return photoNodes(d.url, String(d.type), String(d.filename ?? ''));
    if (kind === 'hitokoto' && typeof d.hitokoto === 'string') {
      const from = [d.from_who, d.from ? `「${d.from}」` : ''].filter(Boolean).join(' ');
      return [el('blockquote', {}, `『${d.hitokoto}』`), el('p', { className: 'cap' }, from ? `—— ${from}` : '')];
    }
    if (kind === 'ip') {
      const ipapi = d.ipapi as Json | undefined;
      const source = ipapi && typeof ipapi === 'object' && !('error' in ipapi) ? ipapi : d;
      return [kv(source)];
    }
    if (kind === 'douyin' && d.data && typeof d.data === 'object') {
      const x = d.data as Json;
      const nodes: Node[] = [];
      if (typeof x.cover === 'string') {
        const cover = el('img', { alt: '', decoding: 'async', referrerPolicy: 'no-referrer' });
        cover.src = x.cover;
        nodes.push(zoomable(cover, String(x.title ?? x.desc ?? ''), x.cover));
      }
      nodes.push(kv(x, 8));
      return nodes;
    }
    if ('error' in d) return [el('p', { className: 'err' }, String(d.error))];
    return [kv(d)];
  }

  async function run() {
    if (busy) return;
    busy = true;
    send.disabled = true;
    sendLabel.textContent = S['pg.sending'];
    const url = update();
    const started = performance.now();
    const ms = () => `${Math.round(performance.now() - started)} ms`;
    try {
      const format = new URLSearchParams(url.split('?')[1] ?? '').get('format');
      if (kind === 'image' && format !== 'json') {
        // 直接返回图片：交给 <img> 加载，加一个参数避免拿到浏览器缓存里的同一张
        const img = el('img', { alt: '', decoding: 'async' });
        img.src = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
        await img.decode();
        const loaded = fill(S['pg.loaded'], { size: `${img.naturalWidth}×${img.naturalHeight}` });
        setState(true, `${loaded} · ${ms()}`);
        show(zoomable(img, loaded));
        showRaw(null);
        return;
      }
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      setState(res.ok, `${res.status} · ${ms()}`);
      let data: unknown = null;
      try {
        data = JSON.parse(text);
      } catch {
        // 纯文本返回（例如一言的 encode=text）
      }
      if (data === null) {
        show(kind === 'hitokoto' ? el('blockquote', {}, `『${text}』`) : el('p', {}, text));
        showRaw(text);
      } else {
        show(...renderJson(data));
        showRaw(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setState(false, ms());
      const msg = kind === 'image' ? S['pg.imageFailed'] : fill(S['pg.networkError'], { msg: (err as Error).message });
      show(el('p', { className: 'err' }, msg));
      showRaw(null);
    } finally {
      busy = false;
      send.disabled = false;
      sendLabel.textContent = S['pg.send'];
    }
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run();
  });

  root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) =>
    button.addEventListener('click', () => {
      const values = JSON.parse(button.dataset.preset!) as Record<string, string>;
      for (const input of Array.from(form.querySelectorAll<HTMLInputElement>('input[name]'))) {
        const value = values[input.name];
        if (input.type === 'radio') input.checked = value !== undefined ? input.value === value : input.value === input.dataset.default;
        else if (input.type === 'checkbox') input.checked = value !== undefined && value.split(',').includes(input.value);
        else input.value = value ?? '';
      }
      run();
    }),
  );

  update();
}
