// 图片墙：点开在全站共用的灯箱里看大图，左右键切换。
// 没有脚本时每张照片仍是指向 4K 原图的普通链接，按住修饰键点击也照常在新标签页打开原图。
import { openLightbox, type LightboxItem } from './lightbox';

export function initGallery(root: HTMLElement) {
  const tiles = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-index]'));
  const items: LightboxItem[] = tiles.map((tile) => ({
    src: tile.dataset.full!,
    alt: tile.querySelector('img')?.alt,
    caption: tile.dataset.caption,
    href: tile.href,
  }));

  tiles.forEach((tile, i) =>
    tile.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      if (openLightbox(items, i, tile)) event.preventDefault();
    }),
  );

  // 照片加载完再淡入。已经加载好的（缓存命中、脚本晚到）直接显示；加载失败也显示，露出底色
  root.dataset.fade = '';
  root.querySelectorAll('img').forEach((img) => {
    const show = () => img.classList.add('is-loaded');
    if (img.complete) show();
    else {
      img.addEventListener('load', show, { once: true });
      img.addEventListener('error', show, { once: true });
    }
  });
}
