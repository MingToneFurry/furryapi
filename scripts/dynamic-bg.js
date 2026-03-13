function loadDynamicBackground() {
  // 排除 thank 和 SwaggerDocs 页面，其他页面都加载动态背景
  const shouldLoadBg = !window.location.pathname.includes('/thank') &&
                       !window.location.pathname.includes('/SwaggerDocs');

  if (!shouldLoadBg) return;
  if (!document.body) return;

  if (document.body.dataset.dynamicBgLoaded === '1') return;
  document.body.dataset.dynamicBgLoaded = '1';

  document.body.classList.add('has-dynamic-bg');

  const bgUrl = 'https://api.furry.ist/furry-img/?t=' + Date.now();
  document.body.style.setProperty('--dynamic-bg-image', `url("${bgUrl}")`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDynamicBackground);
} else {
  loadDynamicBackground();
}