// IP 计算器页面的脚本：每张卡片读取自己的输入，调用 src/lib/ipcalc.ts 算出结果，再把文字写进结果行。
// runCalc 同时在构建时用默认值调用，所以没有脚本的时候页面上也能看到结果。
import {
  CALC_ERRORS,
  cidrToMask,
  classful,
  convertIp,
  dottedToBinHex,
  hexToIp,
  invertMask,
  maskConverter,
  maskHostCount,
  maskToCidr,
  networkNode,
  networkRange,
  requiredToMask,
  type CalcError,
} from '../lib/ipcalc';
import { num } from '../lib/format';
import type { Lang } from '../i18n';

/** 卡片里的输入，键是 data-field（如 ip、cidr、mode、value） */
export type Fields = Record<string, string>;

/** 结果行的文字，键与卡片里的 data-f 对应 */
export type Shown = Record<string, string>;

/** 计算结果：出错时只有错误码，否则是要显示的各行 */
export type Outcome = { error: CalcError } | { rows: Shown };

/** 界面文字里需要脚本替换的部分：classType 的 {type} 换成 A、B 或 C */
export interface Ctx {
  classType: string;
}

type Calc = (f: Fields, c: Ctx) => Outcome;

const slash = (bits: number) => `/${bits}`;

// 每个计算器：从输入取值，调用 ipcalc 里的函数，再把结果整理成要显示的文字
export const calcs = {
  networkRange(f: Fields): Outcome {
    const r = networkRange(f.ip ?? '', f.cidr ?? '');
    if (!r.ok) return { error: r.error };
    return {
      rows: {
        network: r.network,
        first: r.first,
        last: r.last,
        broadcast: r.broadcast,
        mask: r.mask,
        cidr: slash(r.cidr),
        usable: num(r.usable),
        total: num(r.total),
      },
    };
  },

  networkNode(f: Fields): Outcome {
    const r = networkNode(f.mask ?? '', f.ip ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { network: r.network, broadcast: r.broadcast, usable: num(r.usable), total: num(r.total) } };
  },

  requiredToMask(f: Fields): Outcome {
    const r = requiredToMask(f.required ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { cidr: slash(r.cidr), mask: r.dotted, usable: num(r.usable), total: num(r.total) } };
  },

  maskHostCount(f: Fields): Outcome {
    const r = maskHostCount(f.cidr ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { usable: num(r.usable), total: num(r.total), mask: r.dotted } };
  },

  classful(f: Fields, c: Ctx): Outcome {
    const r = classful({
      ip: f.ip ?? '',
      netType: f.netType ?? 'default',
      subnets: f.subnets ?? '',
      hosts: f.hosts ?? '',
    });
    if (!r.ok) return { error: r.error };
    return {
      rows: {
        netType: c.classType.replace('{type}', r.netType),
        mask: r.mask,
        cidr: slash(r.cidr),
        subnets: num(r.subnetCount),
        usable: num(r.usable),
        hostsTotal: num(r.total),
      },
    };
  },

  maskToCidr(f: Fields): Outcome {
    const r = maskToCidr(f.mask ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { cidr: slash(r.cidr) } };
  },

  cidrToMask(f: Fields): Outcome {
    const r = cidrToMask(f.cidr ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { dotted: r.dotted, decimal: String(r.decimal), hex: r.hex, hexOctets: r.hexOctets } };
  },

  maskConverter(f: Fields): Outcome {
    const value = f.value ?? '';
    const r = maskConverter({ dotted: f.mode === 'dotted' ? value : '', bits: f.mode === 'bits' ? value : '' });
    if (!r.ok) return { error: r.error };
    return { rows: { dotted: r.dotted, cidr: slash(r.cidr), hex: r.hex } };
  },

  invertMask(f: Fields): Outcome {
    const r = invertMask(f.mask ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { wildcard: r.wildcard } };
  },

  convertIp(f: Fields): Outcome {
    const value = f.value ?? '';
    const r = convertIp({
      dotted: f.mode === 'dotted' ? value : '',
      binary: f.mode === 'binary' ? value : '',
      hex: f.mode === 'hex' ? value : '',
      decimal: f.mode === 'decimal' ? value : '',
    });
    if (!r.ok) return { error: r.error };
    return {
      rows: { dotted: r.dotted, binary: r.binary, hex: r.hex, hexOctets: r.hexOctets, decimal: String(r.decimal) },
    };
  },

  dottedToBinHex(f: Fields): Outcome {
    const r = dottedToBinHex(f.ip ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { binary: r.binary, hex: r.hex, hexOctets: r.hexOctets } };
  },

  hexToIp(f: Fields): Outcome {
    const r = hexToIp(f.hex ?? '');
    if (!r.ok) return { error: r.error };
    return { rows: { dotted: r.dotted, binary: r.binary } };
  },
} satisfies Record<string, Calc>;

export type CalcName = keyof typeof calcs;

/** 按名字运行一个计算器；构建时和浏览器里都走这一个入口 */
export function runCalc(name: CalcName, f: Fields, c: Ctx): Outcome {
  const fn: Calc = calcs[name];
  return fn(f, c);
}

/** 切换输入格式时把当前的值换算成新格式；当前的值无效时返回 null，保留原文字 */
export function convertMode(name: CalcName, from: string, value: string, to: string): string | null {
  if (name === 'convertIp') {
    const r = convertIp({
      dotted: from === 'dotted' ? value : '',
      binary: from === 'binary' ? value : '',
      hex: from === 'hex' ? value : '',
      decimal: from === 'decimal' ? value : '',
    });
    if (!r.ok) return null;
    if (to === 'dotted') return r.dotted;
    if (to === 'binary') return r.binary;
    // 输入框里的十六进制不带 0x，与示例一致
    if (to === 'hex') return r.hex.slice(2);
    if (to === 'decimal') return String(r.decimal);
    return null;
  }
  if (name === 'maskConverter') {
    const r = maskConverter({ dotted: from === 'dotted' ? value : '', bits: from === 'bits' ? value : '' });
    if (!r.ok) return null;
    return to === 'bits' ? String(r.cidr) : r.dotted;
  }
  return null;
}

/** 页面入口：每张卡片各自监听输入，输入停下 120 毫秒后重新计算 */
export function initIpCalc(root: HTMLElement) {
  const lang: Lang = root.dataset.lang === 'en' ? 'en' : 'zh';
  const strings = JSON.parse(root.dataset.strings ?? '{}') as Record<string, string>;
  const ctx: Ctx = { classType: strings['calc.classType'] ?? '{type}' };
  root.querySelectorAll<HTMLElement>('[data-calc]').forEach((card) => initCard(card, lang, ctx));
}

function initCard(card: HTMLElement, lang: Lang, ctx: Ctx) {
  const name = card.dataset.calc as CalcName;
  const errorEl = card.querySelector<HTMLElement>('[data-error]');
  const rowsEl = card.querySelector<HTMLElement>('[data-rows]');
  const valueEl = card.querySelector<HTMLInputElement>('[data-field="value"]');
  if (!errorEl || !rowsEl) return;

  // 带格式选择的卡片（转换 IP、掩码换算）：记住当前格式，切换时换算输入框里的值
  const checked = card.querySelector<HTMLInputElement>('[data-field="mode"]:checked');
  let mode = checked?.value ?? '';

  // 换格式时同步示例和手机键盘类型：十六进制用字母键，点分和二进制用数字键
  const syncFormat = (radio: HTMLInputElement) => {
    if (!valueEl) return;
    valueEl.placeholder = radio.dataset.example ?? '';
    valueEl.setAttribute('inputmode', radio.dataset.inputmode ?? 'text');
  };
  if (checked) syncFormat(checked);

  let timer = 0;

  const read = (): Fields => {
    const fields: Fields = {};
    card.querySelectorAll<HTMLInputElement>('[data-field]').forEach((input) => {
      if (input.type !== 'radio' || input.checked) fields[input.dataset.field!] = input.value;
    });
    return fields;
  };

  const render = () => {
    const out = runCalc(name, read(), ctx);
    if ('error' in out) {
      errorEl.textContent = CALC_ERRORS[out.error][lang];
      errorEl.hidden = false;
      rowsEl.hidden = true;
      return;
    }
    errorEl.hidden = true;
    rowsEl.hidden = false;
    for (const [key, text] of Object.entries(out.rows)) {
      const code = card.querySelector<HTMLElement>(`code[data-f="${key}"]`);
      if (!code) continue;
      code.textContent = text;
      // 复制按钮和结果文字在同一个 dd 里，它的 data-copy 跟着结果走；千位分隔符只为显示，复制时去掉
      const copy = code.parentElement?.querySelector<HTMLElement>('[data-copy]');
      if (copy) copy.dataset.copy = text.replace(/,/g, '');
    }
  };

  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(render, 120);
  };

  card.addEventListener('input', schedule);
  card.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.dataset.field === 'mode') {
      if (valueEl) {
        const next = convertMode(name, mode, valueEl.value, target.value);
        if (next !== null) valueEl.value = next;
      }
      syncFormat(target);
      mode = target.value;
    }
    schedule();
  });

  render();
}
