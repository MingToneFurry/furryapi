// 全站通用的小交互：深浅色切换、记住语言、复制按钮。

const root = document.documentElement;

function effectiveTheme(): 'light' | 'dark' {
  const set = root.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 隐私模式下可能写不进去，忽略
  }
}

/** 复制文字到剪贴板，并让按钮短暂显示“已复制” */
export async function copyText(button: HTMLElement, text: string) {
  const label = button.dataset.label ?? button.textContent ?? '';
  button.dataset.label = label;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = button.dataset.copiedLabel ?? '已复制';
    button.dataset.state = 'done';
  } catch {
    button.textContent = button.dataset.failedLabel ?? '复制失败';
  }
  window.setTimeout(() => {
    button.textContent = label;
    delete button.dataset.state;
  }, 1800);
}

export function initChrome() {
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      store('theme', next);
    };
    // 支持视图过渡的浏览器用一次淡入淡出切换
    if ('startViewTransition' in document && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-set-lang]').forEach((a) => {
    a.addEventListener('click', () => store('language', a.dataset.setLang!));
  });

  // 任意带 data-copy 的按钮：点击复制它的值
  document.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-copy]');
    if (button) copyText(button, button.dataset.copy!);
  });
}
