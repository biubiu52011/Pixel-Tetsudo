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

  const TAG_EMOJI = { all: "📍", night: "🌙", history: "🏛️", nature: "🌿", shrine: "⛩️", food: "🍜", seasonal: "🌸" };

  let currentStation = "Asakusa";
  let currentIndex = 0;

  const t = function(key) { return (typeof window.t === "function") ? window.t(key) : key; };

  const SPOT_DETAILS = {
    "Senso-ji Temple": {
      ja: {
        intro: "東京最古の仏教寺院。628年創建。金色の観音菩薩像が_sumida川から見つかったという伝承があります。",
        highlights: [
          { text: "雷門 - 大門の赤い提灯は浅草の象徴", icon: "" },
          { text: "仲見世商店街 - 250mの伝統的飲食店が並ぶ参道", icon: "" },
          { text: "五重塔 - 1649年建築、高さ31.25m", icon: "" },
          { text: "本堂 - 祈りを捧げる中心の建物", icon: "" },
          { text: "手水舎 - 入場前の清めの道具", icon: "" },
          { text: "おみくじ - 運勢を占める紙片", icon: "" }
        ],
        tips: "朝早く（9時前）に訪れると混雑を避けられます。境内は無料で入れます。",
        bestTime: "通年。特に新年（初詣）や夏祭り時期が美しい。",
        hours: "6:00-17:00（本堂 6:00-16:30）",
        fee: "無料（特別展は有料あり）"
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
        intro: "东京最古老的佛教寺院，建于628年。传说两位渔民在Sumida河中发现了一尊金色观音菩萨像。",
        highlights: [
          { text: "雷门 - 大门的巨大红灯笼是浅草的象征", icon: "" },
          { text: "仲见世商店街 - 250米长的传统小吃参道", icon: "" },
          { text: "五重塔 - 1649年建造，高31.25米", icon: "" },
          { text: "本堂 - 供奉观音菩萨的主殿", icon: "" },
          { text: "手水舍 - 入场前的净手漱口处", icon: "" },
          { text: "御签 - 在签卜处抽取运势", icon: "" }
        ],
        tips: "建议早上9点前来，避开人流。寺院免费入场。",
        bestTime: "全年皆可，新年（初诣）和夏季祭典时尤为美丽。",
        hours: "6:00-17:00（本堂 6:00-16:30）",
        fee: "免费（特别展览另收费）"
      },
      ko: {
        intro: "센소지는 도쿄에서 가장 오래된 불교 사원으로, 645년에 건립되었습니다. 두 형제가 스미다 강에서 관세음보살의 금상을 발견했다는 전설이 있습니다.",
        highlights: [
          { text: "카미나리몬 - 거대한 붉은 등불은 아사쿠사의 상징입니다", icon: "" },
          { text: "나카미세 거리 - 전통 간식이 있는 250m 쇼핑 거리", icon: "" },
          { text: "오층 탑 - 1649년 건설, 높이 31.25m", icon: "" },
          { text: "본당 - 기도를 바치는 중심 건물을", icon: "" },
          { text: "초즈야 - 입장 전 정화의 분수", icon: "" },
          { text: "오미쿠지 - 운세를 점치는 종이 조각", icon: "" }
        ],
        tips: "군중을 피하려면 아침 일찍(9시 이전) 방문하세요. 사원은 무료로 입장할 수 있습니다.",
        bestTime: "연중 언제든지, 특히 설날(하츠モード)과 여름 축제 때 아름답습니다.",
        hours: "6:00-17:00 (본당 6:00-16:30)",
        fee: "무료 (특별 전시는 유료일 수 있음)"
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
        { text: t("detail.location") + ": " + (spot.dir || t("detail.near_station")), icon: "" },
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
    const coord = (stationCoords[stationKey] || null) || (window.TOURISM_DATA && window.TOURISM_DATA[stationKey] && window.TOURISM_DATA[stationKey].coord) || null;
    const stationName = stationKey;
    const spotKey = spot.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    const translatedName = t("spots." + spotKey) || spot.name;
    const content = getArticleContent(spot, stationName, window.currentLang || "ja");
    const spotEmoji = spot.emoji || TAG_EMOJI[(spot.tags && spot.tags[0]) || "default"] || "📍";

    var primaryTag = (spot.tags && spot.tags[0]) || "default";
    var theme = THEME_COLORS[primaryTag] || THEME_COLORS.default;

    // Build tag badges
    var tagsHtml = "";
    if (spot.tags && spot.tags.length > 0) {
      var _labels = {all:t("tourism.tag_all"),night:t("tourism.tag_night"),history:t("tourism.tag_history"),nature:t("tourism.tag_nature"),shrine:t("tourism.tag_shrine"),food:t("tourism.tag_food"),seasonal:t("tourism.tag_seasonal")};
      tagsHtml = "<div class="article-tags">" + spot.tags.map(function(tag) {
        var _txt = _labels[tag] || tag;
        var _q = String.fromCharCode(34);
        return "<span class=" + _q + "tag-badge " + tag + _q + ">" + _txt + "</span>";
      }).join("") + "</div>";
    }
    var highlightsHtml = (content.highlights || []).map(function(h) {
      return "<div class="highlight-item"><div class="highlight-icon">" + escapeHtml(h.icon) + "</div><div class="highlight-text">" + escapeHtml(h.text) + "</div></div>";
    }).join("");

    var imageHtml = "";
    if (content.image) {
      imageHtml = "<div class="article-hero"><img src="" + escapeHtml(content.image) + "" alt="" + escapeHtml(translatedName) + "" class="article-hero-img"></div>";
    } else {
      imageHtml = "<div class="article-hero article-hero--gradient"><div class="article-hero-content"><span class="hero-emoji">" + escapeHtml(spotEmoji) + "</span></div></div>";
    }

    var infoHtml = "";
    if (content.hours || content.fee) {
      infoHtml = "<div class="article-info-row">";
      if (content.hours) infoHtml += "<div class="article-info-item"><span class="info-label">" + t("detail.info_hours") + "</span><span class="info-value">" + escapeHtml(content.hours) + "</span></div>";
      if (content.fee) infoHtml += "<div class="article-info-item"><span class="info-label">" + t("detail.info_fee") + "</span><span class="info-value">" + escapeHtml(content.fee) + "</span></div>";
      infoHtml += "</div>";
    }

    var html = "<div class="article-header">" +
      "<div class=\"article-emoji\">" + escapeHtml(spotEmoji) + "</div>" +
      "<div class="article-title-section">" +
        "<h1 class="article-title">" + escapeHtml(translatedName) + "</h1>" +
        "<div class="article-meta">" +
          "<span class=\"article-station\">" + escapeHtml(stationName) + "</span>" +
          "<span class="meta-sep">・</span>" +
          "<span class=\"article-dist\">" + escapeHtml(spot.dist || "") + " ・ " + escapeHtml(spot.dir || "") + "</span>" +
        "</div>" +
        tagsHtml +
      "</div>" +
    "</div>" +
    imageHtml +
    infoHtml +
    "<div class="article-body">" +
      "<div class="article-section">" +
        "<h3 class="section-heading">" + t("detail.overview") + "</h3>" +
        "<p class="section-text">" + escapeHtml(content.intro) + "</p>" +
      "</div>" +
      "<div class="article-section">" +
        "<h3 class="section-heading">" + t("detail.highlights") + "</h3>" +
        "<div class="highlights-grid">" + highlightsHtml + "</div>" +
      "</div>" +
      "<div class="article-section">" +
        "<div class="tip-box"><span class="tip-icon">💡</span><div><strong>" + t("detail.tips") + "</strong><p class="tip-text">" + escapeHtml(content.tips) + "</p></div></div>" +
        "<div class="best-time-box"><span class="best-time-icon">🕐</span><div><strong>" + t("detail.best_time") + "</strong><p class="best-time-text">" + escapeHtml(content.bestTime) + "</p></div></div>" +
      "</div>" +
      "<div class="article-section">" +
        "<h3 class="section-heading">" + t("detail.location") + "</h3>" +
        "<div class="map-info">" +
          "<div class="map-direction"><span class="map-icon">📍</span><div><div class="map-label">" + t("detail.direction") + "</div><div class="map-value">" + (spot.dir || t("detail.near_station")) + "</div></div></div>" +
          "<div class="map-distance"><span class="map-icon">🚶</span><div><div class="map-label">" + t("detail.distance") + "</div><div class="map-value">" + (spot.dist || t("detail.walking_distance")) + "</div></div></div>" +
        "</div>" +
        (coord ? "<div class="map-container map-iframe-wrapper"><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=" + (coord[1] - 0.01) + "%2C" + (coord[0] - 0.005) + "%2C" + (coord[1] + 0.01) + "%2C" + (coord[0] + 0.005) + "&layer=mapnik&marker=" + coord[0] + "%2C" + coord[1] + ""></iframe></div>" : "") +
      "</div>" +
    "</div>";

    container.innerHTML = "<div class="article-content">" + html + "</div>";
    updateNavigation(stationKey);
    document.title = translatedName + " | PIXEL TETSUDO";
  }

  function translateSpotName(spotName) {
    const key = spotName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return t("spots." + key) || spotName;
  }

  function getSpotsForStation(stationKey) {
    const allData = window.TOURISM_DATA || {};
    const station = allData[stationKey];
    if (!station || !station.spots) return [];
    return station.spots;
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
    if (backBtnText) backBtnText.textContent = t("detail.back");

    const prevLabel = document.getElementById("prevLabel");
    if (prevLabel) prevLabel.textContent = t("detail.prev");

    const nextLabel = document.getElementById("nextLabel");
    if (nextLabel) nextLabel.textContent = t("detail.next");
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