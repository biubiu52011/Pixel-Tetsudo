/*
 * Tourism Detail - Event (4.3.802) 活动独立详情页
 * 专属样式：開催時期优先（快速条第一槽）+ 入場料信息网格 + 正文 紹介→情報→Tips→地図
 */
(function() {
  "use strict";

  var C = window.TourismDetailCore;
  if (!C) { console.error('[TourismDetailEvent] Core missing'); return; }

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

  function renderArticle(spot, stationKey) {
    var ctx = C.buildContext(spot, stationKey);
    var quickInfo = buildQuickInfo(ctx);
    var infoHtml = buildInfoGrid(ctx);
    var tipsHtml = C.buildTipsHtml(spot, 'detail.tips');
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
