/*
 * Pixel Tetsudo - Canonical Site Shell
 *
 * Owns the shared site chrome contract only:
 * Header + language switcher + primary navigation + footer.
 * Page capability/CSP and business content remain page-owned.
 */
(function () {
  "use strict";

  var NAV_ITEMS = [
    { page: "home", href: "home.html", tab: "search", key: "tab.search", fallback: "路線検索" },
    { page: "realtime", href: "realtime.html", tab: "status", key: "tab.status", fallback: "運行状況" },
    { page: "trains", href: "trains.html", tab: "trains", key: "tab.trains", fallback: "列車リアルタイム" },
    { page: "history", href: "history.html", tab: "history", key: "tab.history", fallback: "検索履歴" }
  ];

  function escapeHtml(value) {
    if (window.escapeHtml) return window.escapeHtml(String(value == null ? "" : value));
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function normalizePage(page) {
    page = String(page || "").toLowerCase();
    if (page.indexOf("tourism") === 0) return "tourism";
    return ["home", "realtime", "trains", "history"].indexOf(page) >= 0 ? page : "home";
  }

  function detectPage(root) {
    var declared = (root && root.getAttribute("data-page")) || document.body.getAttribute("data-page");
    if (declared) return normalizePage(declared);
    var path = location.pathname || "";
    if (path.indexOf("tourism-") >= 0) return "tourism";
    if (path.indexOf("realtime") >= 0) return "realtime";
    if (path.indexOf("trains") >= 0) return "trains";
    if (path.indexOf("history") >= 0) return "history";
    return "home";
  }

  function headerHtml() {
    return '<header class="pixel-header" data-site-shell="header">' +
      '<div class="header-container"><div class="header-text">' +
      '<h1 class="pixel-title" data-i18n="app.title">ピクセル鉄道</h1></div>' +
      '<div class="lang-switcher-wrapper" data-site-shell="language">' +
      '<button id="langToggleBtn" class="lang-toggle-btn" title="Switch Language" aria-haspopup="listbox" aria-expanded="false" aria-label="Switch language">' +
      '<img src="../images/Language.png" alt="Language" class="lang-icon"></button>' +
      '<div id="langSwitcher" class="lang-switcher"><div class="lang-options" role="listbox" aria-label="Select language">' +
      '<button class="lang-btn active" data-lang="ja" role="option" aria-selected="true">日本語</button>' +
      '<button class="lang-btn" data-lang="zh" role="option" aria-selected="false">中文</button>' +
      '<button class="lang-btn" data-lang="ko" role="option" aria-selected="false">韓国語</button>' +
      '<button class="lang-btn" data-lang="en" role="option" aria-selected="false">English</button>' +
      '</div></div></div></div></header>';
  }

  function navHtml(page) {
    return '<nav class="pixel-tabs" data-site-shell="navigation">' + NAV_ITEMS.map(function (item) {
      var active = item.page === page ? " active" : "";
      return '<a href="' + item.href + '" class="tab-btn' + active + '" data-tab="' +
        escapeHtml(item.tab) + '" data-i18n="' + escapeHtml(item.key) + '">' +
        escapeHtml(item.fallback) + '</a>';
    }).join("") + '</nav>';
  }

  function footerHtml() {
    return '<footer class="pixel-footer" data-site-shell="footer" data-i18n="app.footer">© 2026 ピクセル鉄道</footer>';
  }

  function render(root, options) {
    if (!root) throw new Error("SiteShell root is required");
    options = options || {};
    var page = normalizePage(options.page || detectPage(root));
    root.setAttribute("data-site-shell-root", "");
    root.setAttribute("data-page", page);

    var headerMount = root.querySelector('[data-site-shell-mount="header"]');
    var navMount = root.querySelector('[data-site-shell-mount="navigation"]');
    var footerMount = root.querySelector('[data-site-shell-mount="footer"]');
    if (!headerMount || !navMount || !footerMount) {
      throw new Error("SiteShell mounts are incomplete");
    }

    headerMount.innerHTML = headerHtml();
    navMount.innerHTML = navHtml(page);
    footerMount.innerHTML = footerHtml();

    root.setAttribute("data-site-shell-ready", "true");
    document.dispatchEvent(new CustomEvent("pt:site-shell-ready", { detail: { page: page } }));
    return { page: page, root: root };
  }

  function mount(options) {
    options = options || {};
    var root = options.root || document.querySelector("[data-site-shell-root]");
    return render(root, options);
  }

  window.SiteShell = {
    mount: mount,
    render: render,
    detectPage: detectPage,
    NAV_ITEMS: NAV_ITEMS.slice()
  };
})();
