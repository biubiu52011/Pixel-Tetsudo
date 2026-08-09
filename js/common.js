/*
 * Pixel Tetsudo - Common Utilities
 */
(function() {
  "use strict";

  window.escapeHtml = function(str) {
    if (!str) return '';
    if (typeof str !== 'string') return '';
    if (str.indexOf("&") < 0 && str.indexOf("<") < 0 && str.indexOf(">") < 0 && str.indexOf('"') < 0 && str.indexOf("'") < 0) return str;
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  window.getBasePath = function() {
    const path = window.location.pathname;
    return path.includes('/pages/') ? '..' : '';
  };

  window.formatTime = function(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  };
})();
