/*
 * Tourism Detail Page
 */

(function() {
  "use strict";

  const THEME_COLORS = {
    history: { bg: "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)", accent: "#8B4513" },
    nature:   { bg: "linear-gradient(135deg, #228B22 0%, #32CD32 100%)", accent: "#228B22" },
    food:     { bg: "linear-gradient(135deg, #FF6347 0%, #FFA500 100%)", accent: "#FF6347" },
    shrine:   { bg: "linear-gradient(135deg, #DC143C 0%, #FF6B6B 100%)", accent: "#DC143C" },
    night:    { bg: "linear-gradient(135deg, #191970 0%, #4169E1 100%)", accent: "#191970" },
    seasonal: { bg: "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)", accent: "#FF69B4" },
    default:  { bg: "linear-gradient(135deg, #00a859 0%, #008847 100%)", accent: "#00a859" }
  };

  let currentStation = "Asakusa";
  let currentIndex = 0;

  const t = function(key) { return (typeof window.t === "function") ? window.t(key) : key; };

  const SPOT_DETAILS = {
    "Senso-ji Temple": {
      ja: {
        intro: "浅草寺は东京最古老的寺庙，创建于645年。传说两位兄弟在sumida河中发现了一尊观音金像。",
        highlights: [
          { text: "雷门 - 巨大的红色灯笼是浅草的象征", icon: "" },
          { text: "仲见世通 - 250米长的购物街，传统小吃云集", icon: "" },
          { text: "五重塔 - 建于1649年，高31.25米", icon: "" },
          { text: "本堂 - 信徒祈祷和点燃线香的地方", icon: "" },
          { text: "手水舍 - 进入前的净手和漱口的地方", icon: "" },
          { text: "御神签 - 在签筒前求签问吉凶", icon: "" }
        ],
        tips: "建议早上9点前到达以避开人流。寺庙庭院免费进入。",
        bestTime: "全年皆宜，新年参拜（初诣）和夏季祭典时尤其美丽。",
        hours: "6:00-17:00（本堂 6:00-16:30）",
        fee: "免费（特别展览可能收费）"
      },
      en: {
        intro: "Senso-ji is Tokyo's oldest temple, founded in 645 AD. Legend says two brothers found a golden statue of Kannon in the Sumida River.",
        highlights: [
          { text: "Kaminarimon Gate - The massive red lantern is the symbol of Asakusa", icon: "" },
          { text: "Nakamise-dori - 250m shopping street with traditional snacks", icon: "" },
          { text: "Five-story Pagoda - Built in 1649, 31.25 meters tall", icon: "" },
          { text: "Main Hall - Where prayers are offered and incense smoke rises", icon: "" },
          { text: "Chozuya - Purification fountain before entering", icon: "" },
          { text: "Omikuji Fortune Slips - Draw your fortune at the fortune slip stand", icon: "" }
        ],
        tips: "Visit early morning (before 9am) to avoid crowds. The temple grounds are free to enter.",
        bestTime: "Year-round, but especially beautiful during New Year (Hatsumode) and summer festivals.",
        hours: "6:00-17:00 (Main Hall 6:00-16:30)",
        fee: "Free (special exhibitions may have fees)"
      },
      zh: {
        intro: "浅草寺是东京最古老的寺庙，创建于645年。传说两位兄弟在墨田河中发现了一尊观音金像。",
        highlights: [
          { text: "雷门 - 巨大的红色灯笼是浅草的象征", icon: "" },
          { text: "仲见世通 - 250米长的购物街，传统小吃云集", icon: "" },
          { text: "五重塔 - 建于1649年，高31.25米", icon: "" },
          { text: "本堂 - 信徒祈祷和点燃线香的地方", icon: "" },
          { text: "手水舍 - 进入前的净手和漱口的地方", icon: "" },
          { text: "御神签 - 在签筒前求签问吉凶", icon: "" }
        ],
        tips: "建议早上9点前到达以避开人流。寺庙庭院免费进入。",
        bestTime: "全年皆宜，新年参拜（初诣）和夏季祭典时尤其美丽。",
        hours: "6:00-17:00（本堂 6:00-16:30）",
        fee: "免费（特别展览可能收费）"
      },
      ko: {
        intro: "Senso-ji is Tokyo's oldest temple, founded in 645 AD. Legend says two brothers found a golden statue of Kannon in the Sumida River.",
        highlights: [
          { text: "Kaminarimon Gate - The massive red lantern is the symbol of Asakusa", icon: "" },
          { text: "Nakamise-dori - 250m shopping street with traditional snacks", icon: "" },
          { text: "Five-story Pagoda - Built in 1649, 31.25 meters tall", icon: "" },
          { text: "Main Hall - Where prayers are offered and incense smoke rises", icon: "" },
          { text: "Chozuya - Purification fountain before entering", icon: "" },
          { text: "Omikuji Fortune Slips - Draw your fortune at the fortune slip stand", icon: "" }
        ],
        tips: "Visit early morning (before 9am) to avoid crowds. The temple grounds are free to enter.",
        bestTime: "Year-round, but especially beautiful during New Year (Hatsumode) and summer festivals.",
        hours: "6:00-17:00 (Main Hall 6:00-16:30)",
        fee: "Free (special exhibitions may have fees)"
      }
    }
  };

  function getArticleContent(spot, stationName, lang) {
    const spotKey = spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const translatedName = t("spots." + spotKey) || spot.name;
    const currentLang = lang || window.currentLang || "ja";

    const detailed = SPOT_DETAILS[spot.name];
    if (detailed && detailed[currentLang]) {
      const detail = detailed[currentLang];
      if (detail.intro) {
        return {
          intro: detail.intro,
          highlights: detail.highlights,
          tips: detail.tips,
          bestTime: detail.bestTime,
          hours: detail.hours,
          fee: detail.fee,
          image: spot.image || null
        };
      }
    }

    return {
      intro: spot.desc || t("detail.fallback_intro") + " " + stationName + t("detail.fallback_station"),
      highlights: [
        { text: t("detail.location") + ": " + (spot.dir || t("detail.near_station")), icon: spot.emoji },
        { text: t("detail.distance") + ": " + (spot.dist || t("detail.walking_distance")), icon: "" }
      ],
      tips: t("detail.fallback_tips"),
      bestTime: t("detail.fallback_best_time"),
      hours: null,
      fee: null,
      image: spot.image || null
    };
  }

  function renderArticle(spot, stationKey) {
    const container = document.getElementById("articleContainer");
    if (!container || !spot) return;

    const spots = getSpotsForStation(stationKey);
    const stationCoords = window.STATION_COORDS || {};
    const coord = stationCoords[stationKey] || null;
    const stationName = stationKey;
    const translatedName = t("spots." + spotKey) || spot.name;

    var primaryTag = (spot.tags && spot.tags[0]) || "default";
    var theme = THEME_COLORS[primaryTag] || THEME_COLORS.default;

    // Build tag badges
    var tagsHtml = "";
    if (spot.tags && spot.tags.length > 0) {
      var _labels = {all:"全部",night:"夜景",history:"历史",nature:"自然",shrine:"神社",food:"美食",seasonal:"季节"};
      tagsHtml = "<div class=\"article-tags\">" + spot.tags.map(function(tag) {
        var _cls = "tag-badge " + tag;
        var _txt = _labels[tag] || tag;
        var _q = String.fromCharCode(34);
        return "<span class=" + _q + "tag-badge " + tag + _q + ">" + _txt + "</span>";
      }).join("") + "</div>";
    }
    var highlightsHtml = (content.highlights || []).map(function(h) {
      return "<div class=\"highlight-item\"><div class=\"highlight-icon\">" + h.icon + "</div><div class=\"highlight-text\">" + h.text + "</div></div>";
    }).join("");

    var imageHtml = "";
    if (content.image) {
      imageHtml = "<div class=\"article-hero\"><img src=\"" + content.image + "\" alt=\"" + translatedName + "\" class=\"article-hero-img\"></div>";
    } else {
      imageHtml = "<div class=\"article-hero\" style=\"background: " + theme.bg + "\"><div class=\"article-hero-content\"><span class=\"hero-emoji\">" + spot.emoji + "</span></div></div>";
    }

    var infoHtml = "";
    if (content.hours || content.fee) {
      infoHtml = "<div class=\"article-info-row\">";
      if (content.hours) infoHtml += "<div class=\"article-info-item\"><span class=\"info-label\">" + t("detail.info_hours") + "</span><span class=\"info-value\">" + content.hours + "</span></div>";
      if (content.fee) infoHtml += "<div class=\"article-info-item\"><span class=\"info-label\">" + t("detail.info_fee") + "</span><span class=\"info-value\">" + content.fee + "</span></div>";
      infoHtml += "</div>";
    }

    var html = "<div class=\"article-header\">" +
      "<div class=\"article-emoji\">" + spot.emoji + "</div>" +
      "<div class=\"article-title-section\">" +
        "<h1 class=\"article-title\">" + translatedName + "</h1>" +
        "<div class=\"article-meta\">" +
          "<span class=\"article-station\">" + stationName + "</span>" +
          "<span class=\"meta-sep\">・</span>" +
          "<span class=\"article-dist\">" + (spot.dist || "") + " ・ " + (spot.dir || "") + "</span>" +
        "</div>" +
        tagsHtml +
      "</div>" +
    "</div>" +
    imageHtml +
    infoHtml +
    "<div class=\"article-body\">" +
      "<div class=\"article-section\">" +
        "<h3 class=\"section-heading\">" + t("detail.overview") + "</h3>" +
        "<p class=\"section-text\">" + content.intro + "</p>" +
      "</div>" +
      "<div class=\"article-section\">" +
        "<h3 class=\"section-heading\">" + t("detail.highlights") + "</h3>" +
        "<div class=\"highlights-grid\">" + highlightsHtml + "</div>" +
      "</div>" +
      "<div class=\"article-section\">" +
        "<div class=\"tip-box\"><span class=\"tip-icon\">💡</span><div><strong>" + t("detail.tips") + "</strong><p class=\"tip-text\">" + content.tips + "</p></div></div>" +
        "<div class=\"best-time-box\"><span class=\"best-time-icon\">🕐</span><div><strong>" + t("detail.best_time") + "</strong><p class=\"best-time-text\">" + content.bestTime + "</p></div></div>" +
      "</div>" +
      "<div class=\"article-section\">" +
        "<h3 class=\"section-heading\">" + t("detail.location") + "</h3>" +
        "<div class=\"map-info\">" +
          "<div class=\"map-direction\"><span class=\"map-icon\">📍</span><div><div class=\"map-label\">" + t("detail.direction") + "</div><div class=\"map-value\">" + (spot.dir || "Near station") + "</div></div></div>" +
          "<div class=\"map-distance\"><span class=\"map-icon\">🚶</span><div><div class=\"map-label\">" + t("detail.distance") + "</div><div class=\"map-value\">" + (spot.dist || "Walking distance") + "</div></div></div>" +
        "</div>" +
        (coord ? "<div class=\"map-container\"><iframe src=\"https://www.openstreetmap.org/export/embed.html?bbox=" + (coord[1] - 0.01) + "%2C" + (coord[0] - 0.005) + "%2C" + (coord[1] + 0.01) + "%2C" + (coord[0] + 0.005) + "&layer=mapnik&marker=" + coord[0] + "%2C" + coord[1] + "\\" style=\"width:100%;height:200px;border:0;border-radius:0;\"></iframe></div>" : "") +
      "</div>" +
    "</div>";

    container.innerHTML = "<div class=\"article-content\">" + html + "</div>";
    updateNavigation(stationKey);
    document.title = translatedName + " | PIXEL TETSUDO";
  }

  function translateSpotName(spotName) {
    const key = spotName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return t("spots." + key) || spotName;
  }

  
  function getSpotsForStation(stationKey) {
    const allSpots = window.TOURISM_DATA || {};
    const result = [];
    for (const [spotName, spot] of Object.entries(allSpots)) {
      if (spot.station === stationKey) {
        result.push(spot);
      }
    }
    return result;
  }
  function updateNavigation(stationKey) {
    const spots = getSpotsForStation(stationKey);
    if (spots.length === 0) return;

    const prevBtn = document.getElementById("prevSpotBtn");
    const nextBtn = document.getElementById("nextSpotBtn");
    const prevNameEl = document.getElementById("prevSpotName");
    const nextNameEl = document.getElementById("nextSpotName");

    if (currentIndex > 0) {
      const prevSpot = spots[currentIndex - 1];
      if (prevBtn) prevBtn.classList.remove("disabled");
      if (prevNameEl) prevNameEl.textContent = translateSpotName(prevSpot.name);
      if (prevBtn) {
        prevBtn.onclick = function() {
          currentIndex--;
          renderArticle(prevSpot, stationKey);
          window.scrollTo(0, 0);
        };
      }
    } else {
      if (prevBtn) prevBtn.classList.add("disabled");
      if (prevNameEl) prevNameEl.textContent = "";
    }

    if (currentIndex < spots.length - 1) {
      const nextSpot = spots[currentIndex + 1];
      if (nextBtn) nextBtn.classList.remove("disabled");
      if (nextNameEl) nextNameEl.textContent = translateSpotName(nextSpot.name);
      if (nextBtn) {
        nextBtn.onclick = function() {
          currentIndex++;
          renderArticle(nextSpot, stationKey);
          window.scrollTo(0, 0);
        };
      }
    } else {
      if (nextBtn) nextBtn.classList.add("disabled");
      if (nextNameEl) nextNameEl.textContent = "";
    }
  }

  function handleBack() {
    window.history.back();
  }

  function translateUI() {
    const backBtnText = document.getElementById("backBtnText");
    if (backBtnText) backBtnText.textContent = t("detail.back", "戻る");

    const prevLabel = document.getElementById("prevLabel");
    if (prevLabel) prevLabel.textContent = t("detail.prev", "前へ");

    const nextLabel = document.getElementById("nextLabel");
    if (nextLabel) nextLabel.textContent = t("detail.next", "次へ");
  }

  function init() {
    translateUI();
    const params = new URLSearchParams(window.location.search);
    const stationKey = params.get("station") || "Asakusa";
    const spotIndex = parseInt(params.get("index")) || 0;

    currentStation = stationKey;
    currentIndex = spotIndex;

    const backBtn = document.getElementById("detailBackBtn");
    if (backBtn) {
      backBtn.addEventListener("click", handleBack);
    }

    const spots = getSpotsForStation(stationKey);
    if (spots.length === 0) {
      currentStation = "Asakusa";
      const fallbackSpots = getSpotsForStation(currentStation);
      if (fallbackSpots.length > 0) {
        renderArticle(fallbackSpots[0], currentStation);
      }
      return;
    }

    renderArticle(spots[currentIndex], currentStation);

    if (typeof window.onLanguageChange === "function") {
      window.onLanguageChange(function() {
        const currentSpots = getSpotsForStation(currentStation);
        if (currentSpots.length > 0) {
          renderArticle(currentSpots[currentIndex], currentStation);
        }
      });
    }
  }

  window.TourismDetailPage = {
    init: init,
    renderArticle: renderArticle,
    setCurrentStation: function(station) {
      currentStation = station;
      currentIndex = 0;
      const spots = getSpotsForStation(station);
      if (spots.length > 0) {
        renderArticle(spots[0], station);
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();