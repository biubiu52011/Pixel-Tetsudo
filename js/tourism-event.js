/*
 * Tourism Detail - Event (4.3.807) 活动独立详情页
 * 专属样式：開催時期优先（快速条第一槽）+ 入場料信息网格 + 正文 紹介→情報→歴代開催・映像→地図
 * 4.3.805: tips 板块改为"歴代開催・映像"——历届举办时间（pastEditions）+ YouTube 嵌套播放（videos）；无数据的活动回退原 tips
 * 4.3.806: 新增"次回開催"高亮条（nextDate）
 * 4.3.807: 次回開催行加"カレンダーに追加"——生成 .ics 下载（nextDateTime 结构化日期；未定日期的活动不显示按钮）
 */
(function() {
  "use strict";

  var C = window.TourismDetailCore;
  if (!C) { console.error('[TourismDetailEvent] Core missing'); return; }

  // 当前渲染的活动（供日历下载委托使用）
  var currentSpot = null;

  // i18n 对象（{ja,zh,en,ko}）按当前语言取值，ja 兜底
  function pickI18n(obj) {
    var l = window.currentLang || 'ja';
    if (obj && obj[l]) return obj[l];
    if (obj && obj.ja) return obj.ja;
    return '';
  }

  // UTC 日期加天数 → YYYYMMDD（全天事件 DTEND 需结束日+1）
  function addDaysUTC(isoDate, n) {
    var d = new Date(isoDate + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }

  // 生成 .ics 文本（支持多 VEVENT 与 RRULE 重复规则）
  function buildIcs(spot) {
    var summary = pickI18n(spot.name_i18n) || spot.name || '';
    var desc = (spot.desc_i18n && spot.desc_i18n[window.currentLang || 'ja']) || spot.desc || '';
    var esc = function(v) {
      return String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    };
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PixelTetsudo//Adachi Tourism//JA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    var base = 'pixeltetsudo-' + String(spot.name).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-');
    (spot.nextDateTime || []).forEach(function(ev, i) {
      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + base + '-' + ev.start + '-' + i + '@pixeltetsudo');
      lines.push('DTSTAMP:' + stamp);
      if (ev.allDay) {
        lines.push('DTSTART;VALUE=DATE:' + ev.start.replace(/-/g, ''));
        lines.push('DTEND;VALUE=DATE:' + addDaysUTC(ev.end, 1).replace(/-/g, ''));
      } else {
        lines.push('DTSTART:' + String(ev.start).replace(/[-:]/g, ''));
        lines.push('DTEND:' + String(ev.end).replace(/[-:]/g, ''));
      }
      if (ev.rrule) lines.push('RRULE:' + ev.rrule);
      lines.push('SUMMARY:' + esc(summary));
      if (desc) lines.push('DESCRIPTION:' + esc(desc));
      if (spot.address) lines.push('LOCATION:' + esc(spot.address));
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  // 触发 .ics 下载
  function downloadIcs(spot) {
    var content = buildIcs(spot);
    var blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var first = (spot.nextDateTime && spot.nextDateTime[0]) ? spot.nextDateTime[0].start : 'schedule';
    a.href = url;
    a.download = (spot.name || 'event') + '_' + first + '.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  }

  // 点击委托：日历添加按钮
  function bindCalendarDownload() {
    var container = document.getElementById('articleContainer');
    if (!container || container.getAttribute('data-cal-bind')) return;
    container.setAttribute('data-cal-bind', '1');
    container.addEventListener('click', function(e) {
      var btn = e.target.closest ? e.target.closest('.btn-add-calendar') : null;
      if (btn && currentSpot) downloadIcs(currentSpot);
    });
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
    if (spot.nextDate) {
      var calBtn = (Array.isArray(spot.nextDateTime) && spot.nextDateTime.length > 0)
        ? '<button type="button" class="btn-add-calendar">' + C.escapeHtml(C.t('detail.add_calendar')) + '</button>'
        : '';
      items += '<div class="edition-next">'
        + '<span class="edition-next-label">' + C.t('detail.next_edition') + '</span>'
        + '<span class="edition-next-date">' + C.escapeHtml(pickI18n(spot.nextDate)) + '</span>'
        + calBtn
        + '</div>';
    }
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
    currentSpot = spot;
    var ctx = C.buildContext(spot, stationKey);
    var quickInfo = buildQuickInfo(ctx);
    var infoHtml = buildInfoGrid(ctx);
    var tipsHtml = buildEditionsSection(spot);
    var body = ctx.aboutSection + infoHtml + tipsHtml + ctx.mapSection
      + '<div class="ai-note">' + C.escapeHtml(C.t('detail.ai_note')) + '</div>';
    C.renderInto(ctx, quickInfo, body);
  }

  bindCalendarDownload();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { bindCalendarDownload(); C.start(renderArticle); });
  } else {
    bindCalendarDownload();
    C.start(renderArticle);
  }
})();
