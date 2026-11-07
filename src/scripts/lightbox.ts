// 全站共用的灯箱。openLightbox(列表, 序号) 打开；多张时可以左右切换，Esc 或点空白处关闭，关闭后焦点回到原来的位置。
// 灯箱的标记在 components/Lightbox.astro，由 Base 布局放进每个页面。

export interface LightboxItem {
  src: string;
  alt?: string;
  caption?: string;
  /** 「打开原图」的链接；没有就不显示 */
  href?: string;
  /** 抖音封面这类有防盗链的图片要用 no-referrer */
  referrerPolicy?: string;
}

let dialog: HTMLDialogElement | null = null;
let items: LightboxItem[] = [];
let index = 0;
let returnFocus: HTMLElement | null = null;

function show(i: number) {
  if (!dialog) return;
  index = (i + items.length) % items.length;
  const item = items[index];
  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const orig = dialog.querySelector<HTMLAnchorElement>('[data-lb-orig]')!;
  img.referrerPolicy = (item.referrerPolicy ?? '') as ReferrerPolicy;
  img.src = item.src;
  img.alt = item.alt ?? '';
  dialog.querySelector<HTMLElement>('[data-lb-cap]')!.textContent = item.caption ?? '';
  orig.hidden = !item.href;
  if (item.href) orig.href = item.href;
  const single = items.length < 2;
  dialog.querySelector<HTMLElement>('[data-lb-prev]')!.hidden = single;
  dialog.querySelector<HTMLElement>('[data-lb-next]')!.hidden = single;
}

/** 打开灯箱；页面里没有灯箱时返回 false，调用方可以退回普通链接 */
export function openLightbox(list: LightboxItem[], start = 0, from?: HTMLElement | null) {
  if (!dialog || !list.length) return false;
  items = list;
  returnFocus = from ?? (document.activeElement as HTMLElement | null);
  show(start);
  dialog.showModal();
  return true;
}

export function initLightbox() {
  dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  if (!dialog) return;
  dialog.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lb-next]')!.addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-lb-close]')!.addEventListener('click', () => dialog!.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog!.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (items.length < 2) return;
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => {
    returnFocus?.focus({ preventScroll: true });
    // 关闭后清掉图片，免得下次打开先闪一下上一张
    dialog!.querySelector<HTMLImageElement>('[data-lb-img]')!.removeAttribute('src');
  });
}
