/*
 * Tourism Detail - Event (4.3.805) 活动独立详情页
 * 专属样式：開催時期优先（快速条第一槽）+ 入場料信息网格 + 正文 紹介→情報→歴代開催・映像→地図
 * 4.3.805: tips 板块改为"歴代開催・映像"——历届举办时间（pastEditions）+ YouTube 嵌套播放（videos）；无数据的活动回退原 tips
 */
(function() {
  "use strict";

  var C = window.TourismDetailCore;
  if (!C) { console.error('[TourismDetailEvent] Core missing'); return; }

  // i18n 对象（{ja,zh,en,ko}）按当前语言取值，ja 兜底
  function pickI18n(obj) {
    var l = window.currentLang || 'ja';
    if (obj && obj[l]) return obj[l];
    if (obj && obj.ja) return obj.ja;
    return '';
  }

  // 快速信息条：開催時期 + 距離
  function buildQuickInfo(ctx) {
    var distItem = '<div class="qi-item"><div class="qi-label">' + C.t('detail.distance') + '</div><div class="qi-value">' + C.distValueHtml(ctx.dist) + '</div></div>';
    var periodItem = '<div class="qi-item qi-period"><div class="qi-label">' + C.t('detail.period') + '</div><div class="qi-value">' + C.escapeHtml(ctx.spotBestTime) + '</div></div>';
    return '<div class="detail-quick-info">' + periodItem + distItem + '</div>';
  }

  // 信息网格：開催時期(+開催時間) / 入場料 / 住所
  function buildInfoGrid(ctx) {
    var periodRow = '<div class="info-row"><span class="info-label">' + C.t('detail.period') + '</span><span class="info-value">' + C.escapeHtml(ctx.spotBestTime) + '</span></div>';
    // 活动无固定营业时间：仅具体时间（軽トラ市・特設ブース）才显示"開催時間"行
    var extra = (ctx.spotHours && ctx.spotHours !== C.t('detail.unavailable'))
      ? '<div class="info-row"><span class="info-label">' + C.t('detail.info_hours') + '</span><span class="info-value">' + C.escapeHtml(ctx.spotHours) + '</span></div>'
      : '';
    var feeRow = '<div class="info-row"><span class="info-label">' + C.t('detail.info_fee') + '</span><span class="info-value">' + C.escapeHtml(ctx.spotFee) + '</span></div>';
    return '<div class="article-section"><h3 class="section-heading">' + C.t('detail.basic_info') + '</h3><div class="info-grid">'
      + periodRow + extra + feeRow + ctx.addressRow + '</div></div>';
  }

  // 歴代開催・映像板块：有 pastEditions/videos 时替代原 tips；都没有则回退原 tips
  function buildEditionsSection(spot) {
    var hasEditions = Array.isArray(spot.pastEditions) && spot.pastEditions.length > 0;
    var hasVideos = Array.isArray(spot.videos) && spot.videos.length > 0;
    if (!hasEditions && !hasVideos) {
      return C.buildTipsHtml(spot, 'detail.tips');
    }
    var items = '';
    if (hasEditions) {
      items += '<div class="edition-list">' + spot.pastEditions.map(function(e) {
        var label = C.t('detail.edition').replace('{n}', e.num);
        var note = pickI18n(e.note);
        return '<div class="edition-item">'
          + '<span class="edition-label">' + C.escapeHtml(label) + '</span>'
          + '<span class="edition-date">' + C.escapeHtml(String(e.date).replace(/-/g, '/')) + '</span>'
          + (note ? '<span class="edition-note">' + C.escapeHtml(note) + '</span>' : '')
          + '</div>';
      }).join('') + '</div>';
    }
    if (hasVideos) {
      items += '<div class="video-list">' + spot.videos.map(function(v) {
        var title = pickI18n(v.title);
        var embedUrl = 'https://www.youtube.com/embed/' + encodeURIComponent(v.videoId);
        return '<div class="video-item">'
          + '<div class="video-title">' + C.escapeHtml(title) + '</div>'
          + '<div class="video-frame"><iframe src="' + embedUrl + '" title="' + C.escapeHtml(title) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>'
          + '</div>';
      }).join('') + '</div>';
    }
    return '<div class="article-section"><h3 class="section-heading">' + C.t('detail.past_editions') + '</h3>' + items + '</div>';
  }

  function renderArticle(spot, stationKey) {
    var ctx = C.buildContext(spot, stationKey);
    var quickInfo = buildQuickInfo(ctx);
    var infoHtml = buildInfoGrid(ctx);
    var tipsHtml = buildEditionsSection(spot);
    var body = ctx.aboutSection + infoHtml + tipsHtml + ctx.mapSection
      + '<div class="ai-note">' + C.escapeHtml(C.t('detail.ai_note')) + '</div>';
    C.renderInto(ctx, quickInfo, body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { C.start(renderArticle); });
  } else {
    C.start(renderArticle);
  }
})();
