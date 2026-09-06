import sys
path = 'js/search-ui.js'
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
start = s.find('renderResults: function(result, t) {')
end_marker = s.find('    _setFromSourceHint:', start)
new_func = '''renderResults: function(result, t) {
      if (!this.resultsDiv) return;
      var lang = window.currentLang || \ ja\;
      var dur = result.durationMin || 0;
      var transfers = 0;
      var segs = result.routeSegments || result.lineInfo || [];
      for (var i = 0; i < segs.length; i++) { if (segs[i].type === \transfer\) transfers++; }
      var html = '<div class=\search-result journey-card\>';
      html += '<div class=\journey-header\>';
      html += '<span class=\journey-duration\>' + dur + ' ' + t('search.min_unit') + '</span>';
      if (transfers > 0) { html += '<span class=\journey-transfers\>' + transfers + ' ' + t('search_result.transfer_count') + '</span>'; }
      html += '</div>';
      var origin = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(result.path[0], lang) : (result.path[0] || '');
      var dest = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(result.path[result.path.length - 1], lang) : (result.path[result.path.length - 1] || '');
      html += '<div class=\journey-route-line\>';
      html += '<span class=\journey-origin\>' + window.escapeHtml(origin) + '</span>';
      html += '<span class=\journey-arrow\>&gt;</span>';
      html += '<span class=\journey-dest\>' + window.escapeHtml(dest) + '</span>';
      html += '</div>';
      if (segs.length > 0) {
        html += '<div class=\journey-segments\>';
        for (var i = 0; i < segs.length; i++) {
          var seg = segs[i];
          if (seg.type === \transfer\) {
            var txSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.station, lang) : (seg.station || '');
            html += '<div class=\journey-transfer\>';
            html += '<span class=\journey-transfer-icon\>' + String.fromCharCode(0x21bb) + '</span>';
            html += '<span class=\journey-transfer-station\>' + window.escapeHtml(txSt) + '</span>';
            html += '<span class=\journey-transfer-text\>' + t('search_result.transfer') + '</span>';
            html += '</div>';
          } else {
            var lineId = seg.lineId || null;
            var lineName = lineId ? (window.RailwayDB && window.RailwayDB.resolveLineName ? window.RailwayDB.resolveLineName(lineId, window.currentLang) : null) : null;
            var lineColor = (window.RailwayDB && window.RailwayDB.getLine(lineId)) ? (window.RailwayDB.getLine(lineId).color || null) : null;
            var fromSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.fromStation, lang) : (seg.fromStation || '');
            var toSt = window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(seg.toStation, lang) : (seg.toStation || '');
            html += '<div class=\journey-seg\' + (lineColor ? ' style=\border-left-color: + window.escapeHtml(lineColor) + \' : '') + '>';
            html += '<span class=\journey-seg-name\>' + window.escapeHtml(lineName || '') + '</span>';
            html += '<span class=\journey-seg-route\>' + window.escapeHtml(fromSt) + ' &rarr; ' + window.escapeHtml(toSt) + '</span>';
            if (seg.duration != null) { html += '<span class=\journey-seg-duration\>' + seg.duration + ' ' + t('search.min_unit') + '</span>'; }
            if (lineId && window.DATA_FUSION) {
              var delayInfo = window.DATA_FUSION.getDelayInfo(lineId);
              if (delayInfo) {
                var status = delayInfo.status || 'no_data';
                var meta = (window.DataState && window.DataState.STATUS_META) ? window.DataState.STATUS_META[status] : null;
                var icon = meta ? meta.icon : String.fromCharCode(0x25cc);
                var label = t('status.' + status) || status;
                html += '<span class=\route-status-badge  + status +  \>' + icon + ' ' + window.escapeHtml(label) + '</span>';
              }
            }
            html += '</div>';
          }
        }
        html += '</div>';
      }
      html += '</div>';
      var destStation = result.path[result.path.length - 1];
      var spotsHtml = '';
      if (destStation) { spotsHtml = this.renderNearbySpots(destStation, t); }
      this.resultsDiv.innerHTML = html;
      if (spotsHtml) { this.resultsDiv.insertAdjacentHTML('beforeend', spotsHtml); }
    },


    _setFromSourceHint'''; s = s[:start] + new_func + s[end_marker + len('    _setFromSourceHint:'):]
with open(path, 'w', encoding='utf-8', newline='') as f: f.write(s)
print('done, length:', len(s))
