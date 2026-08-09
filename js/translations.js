/*
 * Pixel Tetsudo - Translations
 */
(function() {
  "use strict";
  var translations = {
    ja: {
      "app.title": "Pixel Tetsudo",
      "app.footer": "© 2026 Pixel Tetsudo",
      "tab.search": "路線検索",
      "tab.status": "運行状況",
      "tab.realtime": "列車位置",
      "tab.history": "履歴",
      "line_map.back": "戻る",
      "line.loop": "環状線",
      "line.straight": "直線",
      "unit.car": "両"
    },
    en: {
      "app.title": "Pixel Tetsudo",
      "app.footer": "© 2026 Pixel Tetsudo",
      "tab.search": "Route Search",
      "tab.status": "Status",
      "tab.realtime": "Train Location",
      "tab.history": "History",
      "line_map.back": "Back",
      "line.loop": "Loop Line",
      "line.straight": "Straight Line",
      "unit.car": "cars"
    }
  };
  window.TRANSLATIONS = translations;
  function t(key) {
    var lang = window.currentLang || 'ja';
    var dict = translations[lang] || translations['ja'];
    return dict[key] || key;
  }
  window.t = t;
})();
