// 全站通用的小交互：记住语言、复制按钮、首页页头在顶部时透明。

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 隐私模式下可能写不进去，忽略
  }
}

/** 复制文字到剪贴板。按钮里有 [data-copy-text] 时把那段文字换成提示，否则只换读屏标签 */
export async function copyText(button: HTMLElement, text: string) {
  const textEl = button.querySelector<HTMLElement>('[data-copy-text]');
  const original = textEl?.textContent ?? '';
  const label = button.getAttribute('aria-label');
  let ok = true;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    ok = false;
  }
  const message = ok ? (button.dataset.copiedLabel ?? '已复制') : (button.dataset.failedLabel ?? '复制失败');
  button.dataset.state = ok ? 'done' : 'failed';
  if (textEl) textEl.textContent = message;
  button.setAttribute('aria-label', message);
  window.setTimeout(() => {
    if (textEl) textEl.textContent = original;
    if (label) button.setAttribute('aria-label', label);
    delete button.dataset.state;
  }, 1600);
}

export function initChrome() {
  document.querySelectorAll<HTMLAnchorElement>('[data-set-lang]').forEach((a) => {
    a.addEventListener('click', () => store('language', a.dataset.setLang!));
  });

  // 任意带 data-copy 的按钮：点击复制它的值
  document.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-copy]');
    if (button) copyText(button, button.dataset.copy!);
  });

  // 首页页头叠在照片上：在顶部时透明，往下滚才出现底色
  const header = document.querySelector<HTMLElement>('[data-header][data-overlay]');
  if (header) {
    const update = () => header.toggleAttribute('data-top', window.scrollY < 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
}
