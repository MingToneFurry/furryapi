function loadDynamicBackground() {
  const shouldLoadBg = !window.location.pathname.includes('/thank');

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