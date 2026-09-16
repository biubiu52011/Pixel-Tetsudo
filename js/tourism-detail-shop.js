/*
 * Tourism Detail - Shop (4.3.802) 店铺独立详情页
 * 专属样式：人均优先（快速条第一槽大字强调）+ メニュー・おすすめ板块 + 正文 紹介→情報→メニュー→地図
 */
(function() {
  "use strict";

  var C = window.TourismDetailCore;
  if (!C) { console.error('[TourismDetailShop] Core missing'); return; }

  // 人均标签：含价格(円/前後/〜/～)才叫"人均"；無料/実費占位类店铺用通用"费用"
  function feeLabelFor(spotFee) {
    return /[円前後〜～]/.test(spotFee) ? C.t('detail.info_fee_per_person') : C.t('detail.info_fee');
  }

  // 快速信息条：人均 + 距離
  function buildQuickInfo(ctx) {
    var distItem = '<div class="qi-item"><div class="qi-label">' + C.t('detail.distance') + '</div><div class="qi-value">' + C.distValueHtml(ctx.dist) + '</div></div>';
    var priceItem = '<div class="qi-item qi-price"><div class="qi-label">' + feeLabelFor(ctx.spotFee) + '</div><div class="qi-value">' + C.escapeHtml(ctx.spotFee) + '</div></div>';
    return '<div class="detail-quick-info">' + priceItem + distItem + '</div>';
  }

  // 信息网格：営業時間 / 人均 / 住所
  function buildInfoGrid(ctx) {
    var hoursRow = '<div class="info-row"><span class="info-label">' + C.t('detail.info_hours') + '</span><span class="info-value">' + C.escapeHtml(ctx.spotHours) + '</span></div>';
    var feeRow = '<div class="info-row"><span class="info-label">' + feeLabelFor(ctx.spotFee) + '</span><span class="info-value">' + C.escapeHtml(ctx.spotFee) + '</span></div>';
    return '<div class="article-section"><h3 class="section-heading">' + C.t('detail.basic_info') + '</h3><div class="info-grid">'
      + hoursRow + feeRow + ctx.addressRow + '</div></div>';
  }

  function renderArticle(spot, stationKey) {
    var ctx = C.buildContext(spot, stationKey);
    var quickInfo = buildQuickInfo(ctx);
    var infoHtml = buildInfoGrid(ctx);
    // 店铺：メニュー・おすすめ 板块（大众点评式，沿用真实采集数据）
    var menuHtml = C.buildTipsHtml(spot, 'detail.menu', 'menu-list');
    var body = ctx.aboutSection + infoHtml + menuHtml + ctx.mapSection
      + '<div class="ai-note">' + C.escapeHtml(C.t('detail.ai_note')) + '</div>';
    C.renderInto(ctx, quickInfo, body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { C.start(renderArticle); });
  } else {
    C.start(renderArticle);
  }
})();
