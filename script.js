function reloadImage(elementId, apiUrl) {
  const imgElement = document.getElementById(elementId);
  imgElement.src = apiUrl + '?' + new Date().getTime();
}

// 当前语言状态
let currentLanguage = 'zh';

const translations = {
  title: {
    zh: 'FurryAPI - 福瑞内容开放API平台',
    en: 'FurryAPI - Open Furry Content API Platform'
  }
};

function setLanguage(lang) {
  currentLanguage = lang;

  // 更新标题
  const titleEl = document.getElementById('main-title');
  if (titleEl) {
    titleEl.textContent = translations.title[lang];
    titleEl.setAttribute('data-lang', lang);
  }

  // 隐藏/显示其他data-lang元素
  const zhElements = document.querySelectorAll('[data-lang="zh"]');
  const enElements = document.querySelectorAll('[data-lang="en"]');

  if (lang === 'en') {
    zhElements.forEach(el => (el.style.display = 'none'));
    enElements.forEach(el => (el.style.display = 'block'));
  } else {
    zhElements.forEach(el => (el.style.display = 'block'));
    enElements.forEach(el => (el.style.display = 'none'));
  }

  try {
    localStorage.setItem('language', lang);
  } catch (e) {}
}

function toggleLanguage() {
  setLanguage(currentLanguage === 'zh' ? 'en' : 'zh');
}

function updateThemeMeta() {
  // 可选：用于记录当前主题给无障碍/调试（不影响 UI）
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.setAttribute('data-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  updateThemeMeta();
  // 可选：记住用户选择
  try {
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  } catch (e) {}
}

// 初始化：优先读取 localStorage，其次读取系统偏好
(function initTheme() {
  let theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {}

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'light') {
    document.body.classList.remove('dark-mode');
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    }
  }

  updateThemeMeta();
})();

// ===== 语言初始化 =====
function initLanguageNow() {
  let savedLanguage = null;
  try {
    savedLanguage = localStorage.getItem('language');
  } catch (e) {}

  let languageToUse = savedLanguage;

  // 如果没有保存的偏好，则检测浏览器语言
  if (!languageToUse) {
    const browserLang = navigator.language || navigator.userLanguage;
    // 如果浏览器语言是中文，使用中文；否则默认英文
    languageToUse = browserLang.startsWith('zh') ? 'zh' : 'en';
  }

  setLanguage(languageToUse);
}

// 在DOM完全加载时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageNow);
} else {
  initLanguageNow();
}

// ===== 首页动态背景加载 =====
function loadDynamicBackground() {
  // 排除 thank 和 SwaggerDocs 页面，其他页面都加载动态背景
  const shouldLoadBg = !window.location.pathname.includes('/thank') &&
                       !window.location.pathname.includes('/SwaggerDocs');
  
  if (!shouldLoadBg) return;

  // 添加标记class
  document.body.classList.add('has-dynamic-bg');

  // 动态加载背景图片
  const bgImage = new Image();
  bgImage.crossOrigin = 'anonymous';
  
  bgImage.onload = function() {
    document.body.style.setProperty('--bg-image', `url("${bgImage.src}")`);
    const beforePseudo = document.body;
    if (beforePseudo) {
      // 使用伪元素设置背景
      const style = document.createElement('style');
      style.textContent = `
        body.has-dynamic-bg::before {
          background-image: url("${bgImage.src}");
        }
      `;
      document.head.appendChild(style);
    }
  };

  bgImage.onerror = function() {
    console.log('背景图片加载失败，使用默认背景');
  };

  // 添加时间戳防止缓存
  bgImage.src = 'https://api.furry.ist/furry-img/?t=' + new Date().getTime();
}

// 在页面加载时初始化背景
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDynamicBackground);
} else {
  loadDynamicBackground();
}
