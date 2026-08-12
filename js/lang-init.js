/*
 * 语言初始化脚本
 */

(function() {
    "use strict";

    var STORAGE_KEY = "i18n_lang";
    var SUPPORTED = ["ja", "zh", "ko", "en"];
    var DEFAULT_LANG = "ja";

    // Public API for other scripts
    var listeners = [];
    window.onLanguageChange = function(callback) { listeners.push(callback); };
    window.triggerLanguageChange = function() {
        listeners.forEach(function(cb) { cb(); });
    };

    var currentIndex = -1;

    function applyLang(lang) {
        if (typeof window.t !== "function") return false;
        window.currentLang = lang;
        updateSwitcherUI(lang);
        updateTranslations();
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

        // Close on outside click
        document.addEventListener("click", function(e) {
            if (!toggleBtn.contains(e.target) && !switcher.contains(e.target)) {
                closeSwitcher();
            }
        });

        // Language option clicks - using event delegation
        switcher.addEventListener("click", function(e) {
            var btn = e.target.closest(".lang-btn");
            if (btn) {
                selectLanguage(btn.getAttribute("data-lang"));
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
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();