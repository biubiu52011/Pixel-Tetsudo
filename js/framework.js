/**
 * framework.js v4.3.908
 * 统一框架层：header / nav / footer / 语言切换
 * 各页面只写 <div id="app"><main>...</main></div>，框架由本 JS 注入
 */
(function() {
  'use strict';

  var CURRENT_PAGE = document.body.dataset.page || 'home';
  var BASE = (typeof window.getBasePath === 'function' && window.getBasePath()) || '..';

  var NAV_ITEMS = [
    { href: 'home.html', tab: 'search',   i18n: 'tab.search',   label: '路線検索' },
    { href: 'realtime.html', tab: 'status', i18n: 'tab.status',  label: '運行状況' },
    { href: 'trains.html', tab: 'trains',  i18n: 'tab.trains',  label: '列車リアルタイム' },
    { href: 'history.html', tab: 'history', i18n: 'tab.history', label: '履歴' }
  ];

  var LANGS = [
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' }
  ];

  function renderHeader() {
    var activeLang = (window.RuntimeConfig && window.RuntimeConfig.DEFAULT_LANG) || 'ja';
    var langBtns = LANGS.map(function(l) {
      return '<button class="lang-btn' + (l.code === activeLang ? ' active' : '') +
        '" data-lang="' + l.code + '" role="option" aria-selected="' + (l.code === activeLang) + '">' + l.label + '</button>';
    }).join('');

    return '' +
      '<header class="pixel-header">' +
      '<div class="header-container">' +
      '<div class="header-text">' +
      '<h1 class="pixel-title" data-i18n="app.title">Pixel Tetsudo</h1>' +
      '</div>' +
      '<div class="lang-switcher-wrapper">' +
      '<button id="langToggleBtn" class="lang-toggle-btn" title="Switch Language" aria-haspopup="listbox" aria-expanded="false" aria-label="Switch language">' +
      '<img src="' + BASE + '/images/Language.png" alt="Language" class="lang-icon">' +
      '</button>' +
      '<div id="langSwitcher" class="lang-switcher">' +
      '<div class="lang-options" role="listbox" aria-label="Select language">' +
      langBtns +
      '</div></div></div></div></header>';
  }

  function renderNav() {
    var items = NAV_ITEMS.map(function(item) {
      var cls = 'tab-btn' + (item.tab === CURRENT_PAGE ? ' active' : '');
      return '<a href="' + item.href + '" class="' + cls + '" data-tab="' + item.tab + '" data-i18n="' + item.i18n + '">' + item.label + '</a>';
    }).join('');
    return '<nav class="pixel-tabs">' + items + '</nav>';
  }

  function renderFooter() {
    return '<footer class="pixel-footer" data-i18n="app.footer">© 2026 Pixel Tetsudo</footer>';
  }

  function injectFramework() {
    var app = document.getElementById('app');
    if (!app) return;

    var main = app.querySelector('main') || app.firstElementChild;

    // 插入 header + nav 在 main 之前
    app.insertAdjacentHTML('afterbegin', renderHeader() + renderNav());

    // 插入 footer 在 main 之后
    app.insertAdjacentHTML('beforeend', renderFooter());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFramework);
  } else {
    injectFramework();
  }

  window.PixelFramework = {
    inject: injectFramework,
    version: '4.3.908'
  };
})();
