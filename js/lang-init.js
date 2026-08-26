/*
 * i18n Language Init
 */

(function() {
    "use strict";

    var STORAGE_KEY = "i18n_lang";
    var SUPPORTED = ["ja", "zh", "ko", "en"];
    var DEFAULT_LANG = "en";

    // Public API for other scripts
    var listeners = [];
    // Idempotent: preserve existing listeners when redefined
    if (typeof window.onLanguageChange !== 'function') {
        window.onLanguageChange = function(callback) { listeners.push(callback); };
    }
    window.triggerLanguageChange = function() {
        listeners.forEach(function(cb) { cb(); });
    };

    var currentIndex = -1;

    function applyLang(lang) {
        if (typeof window.t !== "function") return false;
        window.currentLang = lang;
        updateSwitcherUI(lang);
        updateTranslations();
        _updatePageTitle();
        triggerLanguageChange();
        return true;
    }

    function updateSwitcherUI(lang) {
        document.querySelectorAll(".lang-btn").forEach(function(btn) {
            var isActive = btn.getAttribute("data-lang") === lang;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        currentIndex = Array.from(document.querySelectorAll(".lang-btn"))
            .findIndex(function(btn) { return btn.getAttribute("data-lang") === lang; });
    }

    function updateTranslations() {
        if (typeof window.t !== "function") return;
        document.querySelectorAll("[data-i18n]").forEach(function(el) {
            var key = el.getAttribute("data-i18n");
            var translated = window.t(key, el.textContent);
            if (translated !== el.textContent) el.textContent = translated;
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el) {
            var key = el.getAttribute("data-i18n-placeholder");
            var translated = window.t(key, el.placeholder);
            if (translated !== el.placeholder) el.placeholder = translated;
        });
    }


    // Update page title dynamically
    var _pageTitleMap = {
      ja: { home: '路線検索 | PIXEL TETSUDO', tourism: '観光詳細 - PIXEL TETSUDO', trains: '列車時刻 - PIXEL TETSUDO', realtime: '運行状況 - PIXEL TETSUDO', history: '履歴 - PIXEL TETSUDO' },
      en: { home: 'Route Search | PIXEL TETSUDO', tourism: 'Tourism Detail - PIXEL TETSUDO', trains: 'Train Times - PIXEL TETSUDO', realtime: 'Realtime Status - PIXEL TETSUDO', history: 'History - PIXEL TETSUDO' },
      zh: { home: '路线搜索 | PIXEL TETSUDO', tourism: '景点详情 - PIXEL TETSUDO', trains: '列车时刻 - PIXEL TETSUDO', realtime: '运行状态 - PIXEL TETSUDO', history: '历史记录 - PIXEL TETSUDO' },
      ko: { home: '경로 검색 | PIXEL TETSUDO', tourism: '관광 상세 - PIXEL TETSUDO', trains: '열차 시간 - PIXEL TETSUDO', realtime: '운행 상태 - PIXEL TETSUDO', history: '검색 기록 - PIXEL TETSUDO' }
    };
    var _pageDescMap = {
      ja: { home: 'JR・私鉄・地下鉄の路線検索と運行状況、東京の観光スポット案内', tourism: '東京の観光スポット詳細 - Pixel Tetsudo', trains: 'JR・私鉄の列車時刻表 - Pixel Tetsudo', realtime: '電車の実時間運行状況 - Pixel Tetsudo', history: '検索履歴 - Pixel Tetsudo' },
      en: { home: 'JR, Private & Subway Route Search and Realtime Status, Tokyo Tourism', tourism: 'Tokyo Tourism Spot Details - Pixel Tetsudo', trains: 'Train Times for JR & Private Lines - Pixel Tetsudo', realtime: 'Realtime Train Status - Pixel Tetsudo', history: 'Search History - Pixel Tetsudo' },
      zh: { home: 'JR、私铁、地铁路线搜索与运行状态，东京观光景点指南', tourism: '东京观光景点详情 - Pixel Tetsudo', trains: 'JR与私铁列车时刻表 - Pixel Tetsudo', realtime: '列车实时运行状态 - Pixel Tetsudo', history: '搜索历史 - Pixel Tetsudo' },
      ko: { home: 'JR·사철·지하철 노선 검색 및 운행 상황, 도쿄 관광 명소 안내', tourism: '도쿄 관광지 상세 - Pixel Tetsudo', trains: 'JR·사철 열차 시간표 - Pixel Tetsudo', realtime: '열차 실시간 운행 상태 - Pixel Tetsudo', history: '검색 기록 - Pixel Tetsudo' }
    };
    function _updatePageTitle() {
      if (!window.currentLang) return;
      var hash = location.hash || '';
      var pathname = location.pathname || '';
      var page = 'home';
      if (pathname.indexOf('tourism') !== -1 || hash.indexOf('tourism') !== -1) page = 'tourism';
      else if (pathname.indexOf('trains') !== -1 || hash.indexOf('trains') !== -1) page = 'trains';
      else if (pathname.indexOf('realtime') !== -1 || hash.indexOf('realtime') !== -1) page = 'realtime';
      else if (pathname.indexOf('history') !== -1 || hash.indexOf('history') !== -1) page = 'history';
      var map = (_pageTitleMap[window.currentLang] || _pageTitleMap.ja);
      document.title = map[page] || map.home;
      // Update pixel-title H1 element
      var titleEl = document.querySelector('.pixel-title');
      if (titleEl && typeof window.t === 'function') {
        titleEl.textContent = window.t('app.title');
      }
      // Update meta description
      var descMap = (_pageDescMap[window.currentLang] || _pageDescMap.ja);
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', descMap[page] || descMap.home);
      // Update html lang attribute
      var htmlEl = document.querySelector('html');
      if (htmlEl) htmlEl.setAttribute('lang', window.currentLang);
    }

    function openSwitcher() {
        var sw = document.getElementById("langSwitcher");
        if (sw) sw.classList.add("expanded");
        var btn = document.getElementById("langToggleBtn");
        if (btn) btn.setAttribute("aria-expanded", "true");
        var opts = document.querySelectorAll(".lang-btn");
        if (opts.length > 0 && currentIndex >= 0) {
            opts[currentIndex].focus();
        } else if (opts.length > 0) {
            opts[0].focus();
        }
    }

    function closeSwitcher() {
        var sw = document.getElementById("langSwitcher");
        if (sw) sw.classList.remove("expanded");
        var btn = document.getElementById("langToggleBtn");
        if (btn) btn.setAttribute("aria-expanded", "false");
        btn.focus();
    }

    function selectLanguage(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return;
        applyLang(lang);
        localStorage.setItem(STORAGE_KEY, lang);
        closeSwitcher();
    }

    function init() {
        var toggleBtn = document.getElementById("langToggleBtn");
        var switcher = document.getElementById("langSwitcher");
        if (!toggleBtn || !switcher) return;

        // ARIA attributes
        toggleBtn.setAttribute("aria-haspopup", "listbox");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.setAttribute("aria-label", "Switch language");
        switcher.setAttribute("role", "listbox");
        switcher.setAttribute("aria-label", "Select language");

        // Toggle click
        toggleBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            var isExpanded = switcher.classList.contains("expanded");
            isExpanded ? closeSwitcher() : openSwitcher();
        });

        // Close on outside click (skip search inputs to avoid focus theft)
        document.addEventListener("click", function(e) {
            var target = e.target;
            var isSearchInput = target && (
                target.id === "searchFrom" || target.id === "searchTo" ||
                target.closest(".input-group") || target.closest(".suggestions")
            );
            if (!isSearchInput && !toggleBtn.contains(e.target) && !switcher.contains(e.target)) {
                closeSwitcher();
            }
        });

        // Language option clicks - using event delegation
        switcher.addEventListener("click", function(e) {
            var btn = e.target.closest(".lang-btn");
            if (btn) {
                selectLanguage(btn.getAttribute("data-lang"));
            } else {
                closeSwitcher();
            }
        });

        // Keyboard navigation
        document.addEventListener("keydown", function(e) {
            if (!switcher.classList.contains("expanded")) return;

            var opts = Array.from(document.querySelectorAll(".lang-btn"));
            if (opts.length === 0) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    currentIndex = (currentIndex + 1) % opts.length;
                    opts[currentIndex].focus();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    currentIndex = (currentIndex - 1 + opts.length) % opts.length;
                    opts[currentIndex].focus();
                    break;
                case "Home":
                    e.preventDefault();
                    currentIndex = 0;
                    opts[0].focus();
                    break;
                case "End":
                    e.preventDefault();
                    currentIndex = opts.length - 1;
                    opts[currentIndex].focus();
                    break;
                case "Escape":
                    e.preventDefault();
                    closeSwitcher();
                    break;
                case "Enter":
                case " ":
                    if (document.activeElement.classList.contains("lang-btn")) {
                        e.preventDefault();
                        selectLanguage(document.activeElement.getAttribute("data-lang"));
                    }
                    break;
            }
        });

        // Add data-code attributes
        document.querySelectorAll(".lang-btn").forEach(function(btn) {
            var lang = btn.getAttribute("data-lang");
            btn.setAttribute("data-code", lang.toUpperCase());
        });

        // Apply saved language
        var savedLang = localStorage.getItem(STORAGE_KEY);
        var currentLang = SUPPORTED.indexOf(savedLang) !== -1 ? savedLang : DEFAULT_LANG;
        window.currentLang = currentLang;
        updateSwitcherUI(currentLang);
        updateTranslations();
        _updatePageTitle();
    }

    // Move switcher outside header to avoid stacking-context clipping
    var swWrapper = document.querySelector(".lang-switcher-wrapper");
    var hdr = document.querySelector(".pixel-header");
    if (swWrapper && hdr && hdr.contains(swWrapper)) {
        document.body.appendChild(swWrapper);
        swWrapper.classList.add("is-fixed");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
