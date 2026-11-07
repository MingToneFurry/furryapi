// 首屏和图片墙用的精选照片。清单在 src/data/photos.json，文件由 scripts/import-photos.mjs 从本地图库导入。
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import list from '../data/photos.json';

export type Kind = 'large' | 'box';

export interface Photo {
  kind: Kind;
  n: number;
  src: ImageMetadata;
  /** 裁切时的对焦位置，用作 object-position */
  focus: string;
}

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.webp', { eager: true });

const pad = (n: number) => String(n).padStart(8, '0');

function photo(kind: Kind, n: number, focus = '50% 40%'): Photo {
  const file = files[`../assets/photos/${kind}-${pad(n)}.webp`];
  if (!file) throw new Error(`缺少照片 ${kind}-${pad(n)}.webp，先运行 scripts/import-photos.mjs`);
  return { kind, n, src: file.default, focus };
}

export const HERO_LANDSCAPE = list.heroLandscape.map((p) => photo('large', p.n, p.focus));
export const HERO_PORTRAIT = list.heroPortrait.map((p) => photo('box', p.n, p.focus));
export const GALLERY = list.gallery.map((p) => photo(p.kind as Kind, p.n));

/** 图库里的 4K 原图地址 */
export const originalUrl = (kind: Kind, n: number) => `https://api.furry.ist/${kind}/${pad(n)}.webp`;

/** 首屏候选照片的各个尺寸，序列化给页面里的内联脚本随机挑选。首页首屏和 404 页共用，生成的文件也是同一批 */
export async function heroPool() {
  const entry = async (p: Photo, widths: number[]) => {
    const img = await getImage({ src: p.src, widths, format: 'webp', quality: 80 });
    return { n: p.n, src: img.src, srcset: img.srcSet.attribute, focus: p.focus, original: originalUrl(p.kind, p.n) };
  };
  return {
    l: await Promise.all(HERO_LANDSCAPE.map((p) => entry(p, [960, 1440, 1920, 2400]))),
    p: await Promise.all(HERO_PORTRAIT.map((p) => entry(p, [480, 720, 960, 1280]))),
  };
}

export const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];
