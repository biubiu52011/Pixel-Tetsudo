/*
 * Tourism Detail - Spot (4.3.802) 景点独立详情页
 * 专属样式：距離+ベストタイム快速条 + 営業時間/入場料/住所信息网格 + 正文 紹介→Tips→情報→地図
 */
(function() {
  "use strict";

  var C = window.TourismDetailCore;
  if (!C) { console.error('[TourismDetailSpot] Core missing'); return; }

  // 快速信息条：距離 + ベストタイム
  function buildQuickInfo(ctx) {
    var distItem = '<div class="qi-item"><div class="qi-label">' + C.t('detail.distance') + '</div><div class="qi-value">' + C.distValueHtml(ctx.dist) + '</div></div>';
    var bestItem = '<div class="qi-item"><div class="qi-label">' + C.t('detail.best_time') + '</div><div class="qi-value">' + C.escapeHtml(ctx.spotBestTime) + '</div></div>';
    return '<div class="detail-quick-info">' + distItem + bestItem + '</div>';
  }

  // 信息网格：営業時間 / 入場料 / 住所
  function buildInfoGrid(ctx) {
    var hoursRow = '<div class="info-row"><span class="info-label">' + C.t('detail.info_hours') + '</span><span class="info-value">' + C.escapeHtml(ctx.spotHours) + '</span></div>';
    var feeRow = '<div class="info-row"><span class="info-label">' + C.t('detail.info_fee') + '</span><span class="info-value">' + C.escapeHtml(ctx.spotFee) + '</span></div>';
    return '<div class="article-section"><h3 class="section-heading">' + C.t('detail.basic_info') + '</h3><div class="info-grid">'
      + hoursRow + feeRow + ctx.addressRow + '</div></div>';
  }

  function renderArticle(spot, stationKey) {
    var ctx = C.buildContext(spot, stationKey);
    var quickInfo = buildQuickInfo(ctx);
    var infoHtml = buildInfoGrid(ctx);
    var tipsHtml = C.buildTipsHtml(spot, 'detail.tips');
    var body = ctx.aboutSection + tipsHtml + infoHtml + ctx.mapSection
      + '<div class="ai-note">' + C.escapeHtml(C.t('detail.ai_note')) + '</div>';
    C.renderInto(ctx, quickInfo, body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { C.start(renderArticle); });
  } else {
    C.start(renderArticle);
  }
})();
