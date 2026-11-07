// 首页封面：调用随机照片接口拿到一张照片，缩放后叠在两层 <img> 之间淡入切换。
// 缩放走 Cloudflare 图片变换（/cdn-cgi/image/），每张照片只用一种尺寸参数；变换失败时退回原图。

type Photo = { url: string; type: 'large' | 'box'; filename: string };

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

export function resizedUrl(photo: Photo) {
  const u = new URL(photo.url);
  const width = photo.type === 'box' ? 1200 : 1600;
  return `${u.origin}/cdn-cgi/image/width=${width},quality=82,format=auto${u.pathname}`;
}

async function show(img: HTMLImageElement, src: string) {
  img.src = src;
  await img.decode();
}

export function initCover(root: HTMLElement) {
  const S = JSON.parse(root.dataset.strings ?? '{}') as Record<string, string>;
  const api = root.dataset.api!;
  const layers = Array.from(root.querySelectorAll<HTMLImageElement>('[data-layer]'));
  const link = root.querySelector<HTMLAnchorElement>('[data-cover-link]')!;
  const no = root.querySelector<HTMLElement>('[data-cover-no]')!;
  const kind = root.querySelector<HTMLElement>('[data-cover-kind]')!;
  const source = root.querySelector<HTMLElement>('[data-cover-source]')!;
  const status = root.querySelector<HTMLElement>('[data-cover-status]')!;
  const next = root.querySelector<HTMLButtonElement>('[data-cover-next]')!;
  const portrait = matchMedia('(orientation: portrait)');
  let front = -1;
  let busy = false;

  async function load() {
    if (busy) return;
    busy = true;
    next.disabled = true;
    if (front < 0) root.dataset.state = 'loading';
    try {
      const mode = portrait.matches ? 'box' : 'large';
      const request = `${api}?mode=${mode}`;
      const res = await fetch(`${api}?format=json&mode=${mode}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const photo = (await res.json()) as Photo;

      const back = layers[front === 0 ? 1 : 0];
      try {
        await show(back, resizedUrl(photo));
      } catch {
        await show(back, photo.url);
      }

      const n = String(parseInt(photo.filename, 10));
      const label = photo.type === 'box' ? S['cover.box'] : S['cover.large'];
      back.alt = `${fill(S['cover.no'], { n })} ${label}`;
      back.classList.add('is-front');
      if (front >= 0) layers[front].classList.remove('is-front');
      front = layers.indexOf(back);

      no.textContent = fill(S['cover.no'], { n });
      kind.textContent = label;
      source.textContent = request;
      link.href = photo.url;
      root.dataset.state = 'ready';
    } catch {
      if (front < 0) {
        root.dataset.state = 'error';
        status.textContent = S['cover.failed'];
      }
    } finally {
      busy = false;
      next.disabled = false;
    }
  }

  next.addEventListener('click', load);
  load();
}
