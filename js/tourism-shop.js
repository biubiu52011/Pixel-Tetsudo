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

  // 菜单/价目表板块：有 menu 数据（[{item,price}]）→ 大众点评式价目表（菜名+点线+价格）；
  // 无 menu 数据时回退到文本贴士（既有数据兼容）。餐饮店标题=メニュー，非餐饮店=商品・価格帯。
  function buildMenuHtml(spot) {
    if (spot.menu && spot.menu.length > 0) {
      var isFood = (spot.tags || []).indexOf('food') >= 0;
      var titleKey = isFood ? 'detail.menu' : 'detail.goods';
      var html = '<div class="article-section">'
        + '<h3 class="section-heading">' + C.t(titleKey) + '</h3>'
        + '<ul class="tips-list menu-list menu-priced">';
      for (var mi = 0; mi < spot.menu.length; mi++) {
        var it = spot.menu[mi];
        var itemText = (spot.menu_i18n && spot.menu_i18n[mi] && spot.menu_i18n[mi][C.state.lang])
          || (spot.menu_i18n && spot.menu_i18n[mi] && spot.menu_i18n[mi].ja)
          || it.item;
        html += '<li class="menu-row"><span class="menu-item">' + C.escapeHtml(itemText) + '</span>'
          + '<span class="menu-dots"></span>'
          + '<span class="menu-price">' + C.escapeHtml(it.price) + '</span></li>';
      }
      return html + '</ul></div>';
    }
    return C.buildTipsHtml(spot, 'detail.menu', 'menu-list');
  }

  function renderArticle(spot, stationKey) {
    var ctx = C.buildContext(spot, stationKey);
    var quickInfo = buildQuickInfo(ctx);
    var infoHtml = buildInfoGrid(ctx);
    // 店铺：メニュー・おすすめ → 价目表板块（大众点评式；有 menu 数据时显示单价）
    var menuHtml = buildMenuHtml(spot);
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
