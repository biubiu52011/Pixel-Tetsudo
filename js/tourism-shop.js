/*
 * Tourism Detail - Shop (4.3.821) 店铺独立详情页（大众点评风格 UI/UX）
 * 参考点评网站店铺页信息架构：
 *   顶部图集（点击全屏）→ 白色店名卡（人均大字）→ 商户信息卡（地址/营业时间/交通）
 *   → 介绍 → 推荐菜·价目表（菜名+点线+橙价）→ 位置地图 → AI 整理注记
 * 复用 TourismDetailCore：数据加载/语言切换/距离口径/地图/翻译；渲染完全自绘（dp- 前缀命名空间，不依赖公共 hero 框架）。
 */
(function() {
  "use strict";

  var C = window.TourismDetailCore;
  if (!C) { console.error('[TourismDetailShop] Core missing'); return; }

  // 人均标签：含价格(円/前後/〜/～)才叫"人均"；無料/実費占位类店铺用通用"费用"
  function feeLabelFor(spotFee) {
    return /[円前後〜～]/.test(spotFee) ? C.t('detail.info_fee_per_person') : C.t('detail.info_fee');
  }

  // ① 顶部图集：有图 → 大图可点开全屏；无图 → 类型渐变占位
  function buildHero(ctx) {
    var photoTag = '';
    if (ctx.spot.image) {
      photoTag = '<button class="dp-photo-tag" data-lightbox="' + C.escapeHtml(ctx.spot.image) + '">' + C.t('detail.photos') + '</button>';
    }
    var img = ctx.spot.image
      ? '<img class="dp-hero-img" src="' + C.escapeHtml(ctx.spot.image) + '" alt="' + C.escapeHtml(ctx.spotName) + '" data-lightbox="' + C.escapeHtml(ctx.spot.image) + '">'
      : '';
    return '<div class="dp-hero ' + ctx.heroClass + '">' + img + '<div class="dp-hero-shade"></div>' + photoTag + '</div>';
  }

  // ② 店名卡：店名 + 类型徽章 + 人均大字 + 距离 + 分类芯片（点评式白色卡片）
  function buildHeadCard(ctx) {
    var meta = '<span class="dp-price"><span class="dp-price-label">' + feeLabelFor(ctx.spotFee) + '</span><b>' + C.escapeHtml(ctx.spotFee) + '</b></span>'
      + '<span class="dp-dist">' + C.distValueHtml(ctx.dist) + '</span>';
    return '<div class="dp-head">'
      + '<div class="dp-head-row"><h1 class="dp-name">' + C.escapeHtml(ctx.spotName) + '</h1>' + ctx.typeBadge + '</div>'
      + '<div class="dp-meta">' + meta + '</div>'
      + (ctx.tagsHtml ? '<div class="dp-chips">' + ctx.tagsHtml + '</div>' : '')
      + '</div>';
  }

  // ③ 商户信息卡（地址 / 营业时间 / 交通距离）
  function buildInfoCard(ctx) {
    var rows = '';
    if (ctx.spotAddress) {
      rows += '<div class="dp-info-row"><span class="dp-ico">\uD83D\uDCCD</span><span class="dp-info-label">' + C.t('detail.address') + '</span><span class="dp-info-val">' + C.escapeHtml(ctx.spotAddress) + '</span></div>';
    }
    rows += '<div class="dp-info-row"><span class="dp-ico">\uD83D\uDD52</span><span class="dp-info-label">' + C.t('detail.info_hours') + '</span><span class="dp-info-val">' + C.escapeHtml(ctx.spotHours) + '</span></div>';
    if (ctx.dist && (ctx.dist.distMain || ctx.dist.distText)) {
      rows += '<div class="dp-info-row"><span class="dp-ico">\uD83D\uDE87</span><span class="dp-info-label">' + C.t('detail.distance') + '</span><span class="dp-info-val">' + C.distValueHtml(ctx.dist) + '</span></div>';
    }
    return '<div class="dp-card dp-info">' + rows + '</div>';
  }

  // ④ 介绍
  function buildAboutCard(ctx) {
    return '<div class="dp-card"><h3 class="dp-sec-title">' + C.t('detail.about') + '</h3><p class="dp-text">' + C.escapeHtml(ctx.desc) + '</p></div>';
  }

  // ⑤ 推荐菜/价目表：有 menu（[{item,price}]）→ 点评式菜名+点线+橙价；无 → 文本贴士回退
  function buildMenuCard(spot) {
    if (spot.menu && spot.menu.length > 0) {
      var isFood = (spot.tags || []).indexOf('food') >= 0;
      var titleKey = isFood ? 'detail.menu' : 'detail.goods';
      var html = '<div class="dp-card dp-menu"><h3 class="dp-sec-title">' + C.t(titleKey) + '</h3>';
      for (var mi = 0; mi < spot.menu.length; mi++) {
        var it = spot.menu[mi];
        var itemText = (spot.menu_i18n && spot.menu_i18n[mi] && spot.menu_i18n[mi][C.state.lang])
          || (spot.menu_i18n && spot.menu_i18n[mi] && spot.menu_i18n[mi].ja)
          || it.item;
        html += '<div class="dp-menu-row"><span class="dp-menu-item">' + C.escapeHtml(itemText) + '</span>'
          + '<span class="dp-menu-dots"></span>'
          + '<span class="dp-menu-price">' + C.escapeHtml(it.price) + '</span></div>';
      }
      return html + '</div>';
    }
    return '<div class="dp-card">' + C.buildTipsHtml(spot, 'detail.menu', 'menu-list') + '</div>';
  }

  // ⑥ 位置地图
  function buildMapCard(ctx) {
    return '<div class="dp-card"><h3 class="dp-sec-title">' + C.t('detail.location') + '</h3>'
      + '<div class="map-container" id="tourismMap"><div class="map-loading">' + C.t('detail.map_loading') + '</div></div></div>';
  }

  function renderShopPage(spot, stationKey) {
    var ctx = C.buildContext(spot, stationKey);
    var html = buildHero(ctx) + buildHeadCard(ctx) + buildInfoCard(ctx)
      + buildAboutCard(ctx) + buildMenuCard(spot) + buildMapCard(ctx)
      + '<div class="dp-note">' + C.escapeHtml(C.t('detail.ai_note')) + '</div>';
    var container = document.getElementById('articleContainer');
    if (!container) return;
    container.innerHTML = '<div class="article-content article-content--shop">' + html + '</div>';
    bindLightbox();
    setTimeout(function () { C.initMap(ctx.mapLat, ctx.mapLng, ctx.spotName); }, 50);
    var pageTitle = ctx.spotName + ' | ' + (ctx.dist.stationName || '') + ' | PIXEL TETSUDO';
    document.title = pageTitle;
  }

  // 图片灯箱（点评式点击放大，语言切换重渲染时复用同一 overlay）
  function bindLightbox() {
    var overlay = document.querySelector('.dp-lightbox');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'dp-lightbox';
      overlay.innerHTML = '<button class="dp-lightbox-close" aria-label="Close">&times;</button><img class="dp-lightbox-img" alt="">';
      overlay.style.display = 'none';
      document.body.appendChild(overlay);
      var imgEl = overlay.querySelector('.dp-lightbox-img');
      var closeBtn = overlay.querySelector('.dp-lightbox-close');
      function open(src) { if (!src) return; imgEl.src = src; overlay.style.display = 'flex'; }
      function close() { overlay.style.display = 'none'; imgEl.src = ''; }
      overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target === closeBtn) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
    var triggers = document.querySelectorAll('[data-lightbox]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        var imgEl = overlay.querySelector('.dp-lightbox-img');
        var src = this.getAttribute('data-lightbox');
        if (!src) return;
        imgEl.src = src;
        overlay.style.display = 'flex';
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { C.start(renderShopPage); });
  } else {
    C.start(renderShopPage);
  }
})();
