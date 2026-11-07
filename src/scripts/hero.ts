// 首页首屏：「换一张」在精选照片池里轮换，新照片在另一层上显影，再替换当前这张。
// 照片池和第一张照片由 Hero.astro 里的内联脚本准备好；这里按当前是宽屏还是竖屏，从对应的池里依次取下一张，
// 每一轮打乱顺序、不重复，也不会紧接着出现刚才那张。

type Entry = { n: number; src: string; srcset: string; focus: string; original: string };
type Pool = { l: Entry[]; p: Entry[] };
type Side = keyof Pool;

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function initHero(root: HTMLElement) {
  const S = JSON.parse(root.dataset.strings ?? '{}') as Record<string, string>;
  const pool = JSON.parse(root.dataset.pool ?? '{"l":[],"p":[]}') as Pool;
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-layer]'));
  const button = root.querySelector<HTMLButtonElement>('[data-next]')!;
  const label = root.querySelector<HTMLElement>('[data-next-label]')!;
  const caption = root.querySelector<HTMLElement>('[data-caption]')!;
  const live = root.querySelector<HTMLElement>('[data-live]')!;
  const extIcon = caption.querySelector('svg');
  const narrow = matchMedia('(max-aspect-ratio: 4/5)');
  const current: Record<Side, number> = { l: Number(root.dataset.l ?? 0), p: Number(root.dataset.p ?? 0) };
  const queue: Record<Side, number[]> = { l: [], p: [] };
  let front = 0;
  let busy = false;

  function nextIndex(side: Side) {
    if (!queue[side].length) queue[side] = shuffle(pool[side].map((_, i) => i).filter((i) => i !== current[side]));
    current[side] = queue[side].shift() ?? current[side];
    return current[side];
  }

  // 首屏照片还没加载完：先藏起来，加载完再显影；已经在缓存里的就直接显示
  const first = layers[0].querySelector('img')!;
  if (!first.complete) {
    root.dataset.develop = '';
    first.addEventListener('load', () => layers[0].classList.add('developed'), { once: true });
  }

  function setCaption(item: Entry, kind: string) {
    const link = document.createElement('a');
    link.href = item.original;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = S['hero.original'];
    if (extIcon) link.append(extIcon.cloneNode(true));
    live.replaceChildren(`${fill(S['hero.no'], { n: String(item.n) })} · ${kind} · `, link);
    live.hidden = false;
    caption.dataset.swapped = '';
  }

  async function next() {
    if (busy || !pool.l.length || !pool.p.length) return;
    busy = true;
    button.disabled = true;
    // 网速慢时才显示“正在取一张”，本地照片通常一闪而过
    const slow = window.setTimeout(() => (label.textContent = S['hero.loading']), 400);
    try {
      const side: Side = narrow.matches ? 'p' : 'l';
      const item = pool[side][nextIndex(side)];
      const backIndex = front === 0 ? 1 : 0;
      const back = layers[backIndex];
      // 第一层里是带竖版备选的 <picture>，第一次换到这一层时改成普通图片
      const picture = back.querySelector('picture');
      if (picture) picture.replaceWith(Object.assign(document.createElement('img'), { decoding: 'async', alt: '' }));
      const img = back.querySelector('img')!;
      img.sizes = '100vw';
      img.srcset = item.srcset;
      img.src = item.src;
      img.style.setProperty('--focus', item.focus);
      img.style.setProperty('--focus-p', item.focus);
      await img.decode();

      const kind = side === 'p' ? S['hero.box'] : S['hero.large'];
      img.alt = fill(S['hero.alt'], { n: String(item.n), kind });
      back.classList.remove('developed');
      void back.offsetWidth;
      back.classList.add('is-front', 'developed');
      layers[front].classList.remove('is-front');
      front = backIndex;
      setCaption(item, kind);
    } catch {
      // 解码失败就保留当前这张，下次点击会换到池里的下一张
    } finally {
      window.clearTimeout(slow);
      label.textContent = S['hero.next'];
      busy = false;
      button.disabled = false;
    }
  }

  button.addEventListener('click', next);
}
