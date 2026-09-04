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

  // Canonical operator key normalization: LOS-style (UNDERSCORE_UPPER) <-> standard (JR-East)
  var TRANSIT_NORMALIZE = {
    "JR_EAST": "JR-East", "JR_WEST": "JR West",
    "TOKYO_METRO": "TokyoMetro", "TOEI": "Toei", "YOKOHAMA_MUNICIPAL": "YokohamaMunicipal",
    "KEIO": "Keio", "ODAKYU": "Odakyu", "SEIBU": "Seibu", "TOBU": "Tobu", "TOKYU": "Tokyu",
    "KEIKYU": "Keikyu", "KEISEI": "Keisei", "SOTETSU": "Sotetsu", "RINKAI": "Rinkai",
    "MINATO_MIRAI": "MinatoMirai", "TWR": "TWR", "MIR": "MIR",
    "TAMA_MONORAIL": "TamaMonorail", "SHONAN_MONORAIL": "ShonanMonorail",
    "YURIKAMOME": "Yurikamome", "TSUKUBA_EXPRESS": "TsukubaExpress"
  };
  window.TransitConstants = {
    OP_ORDER: [
      "JR-East", "JR West",
      "TokyoMetro", "Toei", "YokohamaMunicipal",
      "Keio", "Odakyu", "Seibu", "Tobu", "Tokyu",
      "Keikyu", "Keisei", "Sotetsu",
      "TWR", "MinatoMirai", "MIR", "Rinkai",
      "TsukubaExpress", "Yurikamome", "TamaMonorail", "ShonanMonorail"
    ],
    NORMALIZE: TRANSIT_NORMALIZE,
    OP_NAMES: {},
    // Any format ("JR-East" / "JR_EAST" / "jr east") -> standard DB/ODPT key ("JR-East")
    normalizeOp: function(op) {
      if (!op) return op;
      var key = String(op).replace(/-/g, "_").replace(/ /g, "_").toUpperCase();
      return TRANSIT_NORMALIZE[key] || op;
    },
    // Standard/any format -> LOS key ("JR-East" -> "JR_EAST")
    toLosKey: function(op) {
      if (!op) return op;
      return String(op).replace(/-/g, "_").replace(/ /g, "_").toUpperCase();
    }
  };
