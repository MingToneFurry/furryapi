function reloadImage(elementId, apiUrl) {
  const imgElement = document.getElementById(elementId);
  imgElement.src = apiUrl + '?' + new Date().getTime();
}

let currentLanguage = 'zh';

const translations = {
  title: {
    zh: 'FurryAPI - 福瑞内容开放API平台',
    en: 'FurryAPI - Open Furry Content API Platform'
  }
};

function setLanguage(lang) {
  currentLanguage = lang;

  const titleEl = document.getElementById('main-title');
  if (titleEl && translations.title[lang]) {
    titleEl.textContent = translations.title[lang];
    titleEl.setAttribute('data-lang', lang);
  }

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
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.setAttribute('data-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  updateThemeMeta();
  try {
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  } catch (e) {}
}

(function initTheme() {
  let theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {}

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'light') {
    document.body.classList.remove('dark-mode');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }

  updateThemeMeta();
})();

function initLanguageNow() {
  let savedLanguage = null;
  try {
    savedLanguage = localStorage.getItem('language');
  } catch (e) {}

  let languageToUse = savedLanguage;
  if (!languageToUse) {
    const browserLang = navigator.language || navigator.userLanguage;
    languageToUse = browserLang.startsWith('zh') ? 'zh' : 'en';
  }

  setLanguage(languageToUse);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageNow);
} else {
  initLanguageNow();
}