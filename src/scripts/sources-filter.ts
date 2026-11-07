// 图片来源页的筛选：输入名字或用户名（开头的 @ 可写可不写），隐藏不匹配的创作者，并更新计数和空状态。
// 名单在构建时已全部渲染，这里只切换 hidden，链接和顺序都不动；没有脚本时整张名单照常显示。
// 关键字在构建时和输入时都做 NFKC 规范化再转小写，全角字母、半角片假名、全角空格和全角 @ 都能对上。

const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const format = (n: number) => n.toLocaleString('en-US');

export function initSourcesFilter(root: HTMLElement) {
  const S = JSON.parse(root.dataset.strings ?? '{}') as Record<string, string>;
  const input = root.querySelector<HTMLInputElement>('[data-filter]')!;
  const count = root.querySelector<HTMLElement>('[data-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-empty]')!;
  const list = root.querySelector<HTMLElement>('[data-list]')!;
  const items = Array.from(root.querySelectorAll<HTMLLIElement>('li[data-q]'));
  const total = format(items.length);

  function apply() {
    // 去掉首尾空白和开头的 @，再与每位创作者的关键字比较
    const q = input.value.normalize('NFKC').trim().replace(/^@/, '').toLowerCase();
    let shown = 0;
    for (const li of items) {
      const match = !q || (li.dataset.q ?? '').includes(q);
      li.hidden = !match;
      if (match) shown++;
    }
    count.textContent = fill(S['credits.count'] ?? '', { shown: format(shown), total });
    empty.hidden = shown > 0;
    // 没有匹配时连同顶部细线一起收起
    list.hidden = shown === 0;
  }

  input.addEventListener('input', apply);
  // 后退时浏览器可能还原输入框的内容，初始化时按当前内容筛一次
  apply();
}
