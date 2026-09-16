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

  // ⑤ 推荐菜/价目表：横向滚动卡片 + 全屏模态（最多10道，有图显图、无图用店名首字徽章）；无 → 文本贴士回退
  function buildMenuCard(spot) {
    if (spot.menu && spot.menu.length > 0) {
      var isFood = (spot.tags || []).indexOf('food') >= 0;
      var titleKey = isFood ? 'detail.menu' : 'detail.goods';
      var list = spot.menu.slice(0, 10);
      var badgeChar = String(spot.name || '').trim().charAt(0) || '食';

      // 横向滚动预览行（含"查看全部"按钮）
      var html = '<div class="dp-card dp-menu">';
      html += '<div class="dp-menu-head"><h3 class="dp-sec-title">' + C.t(titleKey) + '</h3>';
      if (list.length > 5) html += '<button class="dp-menu-viewall" data-modal="' + ('dpMenuModal_' + (spot.menu._idx || 0)) + '">' + C.t('detail.view_all') + ' &rsaquo;</button>';
      html += '</div><div class="dp-menu-carousel">';
      for (var mi = 0; mi < list.length; mi++) {
        var it = list[mi];
        var itemText = (spot.menu_i18n && spot.menu_i18n[mi] && spot.menu_i18n[mi][C.state.lang])
          || (spot.menu_i18n && spot.menu_i18n[mi] && spot.menu_i18n[mi].ja)
          || it.item;
        var thumb = it.img
          ? '<img class="dp-dish-img" src="' + C.escapeHtml(it.img) + '" alt="' + C.escapeHtml(itemText) + '" loading="lazy" data-lightbox="' + C.escapeHtml(it.img) + '">' 
          : '<span class="dp-dish-badge">' + C.escapeHtml(badgeChar) + '</span>';
        html += '<div class="dp-dish"><div class="dp-dish-thumb">' + thumb + '</div>'
          + '<div class="dp-dish-name">' + C.escapeHtml(itemText) + '</div></div>';
      }
      html += '</div></div>';

      // 全屏菜单模态
      var modalId = 'dpMenuModal_' + (spot.menu._idx || 0);
      html += '<div class="dp-menu-modal" id="' + modalId + '" role="dialog" aria-modal="true" aria-label="' + C.escapeHtml(C.t(titleKey)) + '">';
      html += '<button class="dp-menu-modal-close" aria-label="Close">&times;</button>';
      html += '<div class="dp-menu-modal-inner"><h3 class="dp-menu-modal-title">' + C.t(titleKey) + '</h3>';
      html += '<div class="dp-menu-modal-grid">';
      for (var mi2 = 0; mi2 < spot.menu.length; mi2++) {
        var it2 = spot.menu[mi2];
        var itemText2 = (spot.menu_i18n && spot.menu_i18n[mi2] && spot.menu_i18n[mi2][C.state.lang])
          || (spot.menu_i18n && spot.menu_i18n[mi2] && spot.menu_i18n[mi2].ja)
          || it2.item;
        var thumb2 = it2.img
          ? '<img class="dp-dish-img" src="' + C.escapeHtml(it2.img) + '" alt="' + C.escapeHtml(itemText2) + '" loading="lazy" data-lightbox="' + C.escapeHtml(it2.img) + '">' 
          : '<span class="dp-dish-badge">' + C.escapeHtml(badgeChar) + '</span>';
        html += '<div class="dp-dish"><div class="dp-dish-thumb">' + thumb2 + '</div>'
          + '<div class="dp-dish-name">' + C.escapeHtml(itemText2) + '</div>'
          + '<div class="dp-dish-price">' + C.escapeHtml(it2.price) + '</div></div>';
      }
      html += '</div></div></div>';
      return html;
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
    bindMenuModal();
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


  // 菜单全屏模态（查看全部）
  function bindMenuModal() {
    var viewBtns = document.querySelectorAll('button.dp-menu-viewall');
    for (var vi = 0; vi < viewBtns.length; vi++) {
      viewBtns[vi].addEventListener('click', function() {
        var modalId = this.getAttribute('data-modal');
        var modal = document.getElementById(modalId);
        if (modal) modal.classList.add('is-open');
      });
    }
    var modals = document.querySelectorAll('.dp-menu-modal');
    for (var mi = 0; mi < modals.length; mi++) {
      var modal = modals[mi];
      modal.querySelector('.dp-menu-modal-close').addEventListener('click', function() { modal.classList.remove('is-open'); document.body.style.overflow=''; });
      modal.addEventListener('click', function(e) { if (e.target === modal) { modal.classList.remove('is-open'); document.body.style.overflow=''; } });
    }
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { var open = document.querySelector('.dp-menu-modal.is-open'); if (open) { open.classList.remove('is-open'); document.body.style.overflow=''; } } });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { C.start(renderShopPage); });
  } else {
    C.start(renderShopPage);
  }
})();
