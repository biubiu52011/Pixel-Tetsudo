/* trains-render.js: 列车页 SVG 渲染（全局） */

// TrainMarker presentation state (artwork only — never vehicle identity or
// geometry). When an upstream vehicle PNG fails to load/decode, the train keeps
// its resolved identity but its single TrainMarker artwork switches to the
// generic train marker and stays there for this page session, so a known-broken
// asset is not re-requested on every poll.
var _trainArtworkFailure = {};
var _trainArtworkFailureCount = 0;
var _TRAIN_ARTWORK_FAILURE_MAX = 500;
function _rememberTrainArtworkFailure(trainUid) {
  if (!trainUid) return;
  if (!_trainArtworkFailure[String(trainUid)]) {
    _trainArtworkFailure[String(trainUid)] = true;
    _trainArtworkFailureCount++;
    if (_trainArtworkFailureCount > _TRAIN_ARTWORK_FAILURE_MAX) {
      _trainArtworkFailure = {};
      _trainArtworkFailureCount = 0;
    }
  }
}

  function _renderThroughChip(layer, ns, x, y, lineObj, iconSize, mobile) {
    var sz = _throughChipSize(lineObj, mobile);
    var label = sz.label;
    var w = sz.w, h = sz.h;
    var lc = lineObj.color || "#555";
    var chip = document.createElementNS(ns, "g");
    chip.setAttribute("transform", "translate(" + x + "," + y + ")");
    layer.appendChild(chip);
    var bg = document.createElementNS(ns, "rect");
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width", w);
    bg.setAttribute("height", h);
    bg.setAttribute("rx", "3");
    bg.setAttribute("fill", _hexToRgba(lc, 0.16));
    bg.setAttribute("stroke", lc);
    bg.setAttribute("stroke-width", "1");
    chip.appendChild(bg);
    if (lineObj.title) {
      var bgTitle = document.createElementNS(ns, "title");
      bgTitle.textContent = lineObj.title;
      bg.appendChild(bgTitle);
    }
    // v4.3.948: 直通标签箭头——up=▲朝上 / down=▼朝下 / middle=→朝右（与列车方向标签统一尺寸）
    var dir = lineObj.dir || "middle";
    var arr = document.createElementNS(ns, "path");
    arr.setAttribute("fill", lc);
    arr.setAttribute("stroke", lc);
    arr.setAttribute("stroke-width", mobile ? "3.5" : "3");
    arr.setAttribute("stroke-linejoin", "round");
    var _ax = sz.arrowX || 8;
    var _ay = h / 2;
    var _d;
    if (dir === "up") {
      // up=▲ 尖朝上
      _d = "M" + (_ax - 3.5) + " " + (_ay + 2.5) + " L " + _ax + " " + (_ay - 2.5) + " L " + (_ax + 3.5) + " " + (_ay + 2.5) + " Z";
    } else if (dir === "down") {
      // down=▼ 尖朝下
      _d = "M" + (_ax - 3.5) + " " + (_ay - 2.5) + " L " + _ax + " " + (_ay + 2.5) + " L " + (_ax + 3.5) + " " + (_ay - 2.5) + " Z";
    } else {
      // middle labels point away from the station: left-side chips use ←, right-side chips use →.
      if (lineObj._throughSide === "left") {
        _d = "M" + (_ax + 3) + "," + (_ay - 2.5) + " L" + (_ax - 3) + "," + _ay + " L" + (_ax + 3) + "," + (_ay + 2.5) + " Z";
      } else {
        _d = "M" + (_ax - 3) + "," + (_ay - 2.5) + " L" + (_ax + 3) + "," + _ay + " L" + (_ax - 3) + "," + (_ay + 2.5) + " Z";
      }
    }
    arr.setAttribute("d", _d);
    chip.appendChild(arr);
    var txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", sz.textX || 14);
    txt.setAttribute("y", h / 2);
    txt.setAttribute("font-size", sz.fontSize || (mobile ? 11 : 9));
    txt.setAttribute("fill", lc);
    txt.setAttribute("font-weight", "700");
    txt.setAttribute("dominant-baseline", "central");
    txt.textContent = label;
    chip.appendChild(txt);
    return w; // consumed width (for flow layout advance)
  }
  
  /**
   * Compute route geometry for a line - single source of truth for all station coordinates.
   * Result is cached and only recomputed when line changes.
   * @param {Object} line - Line object with stations, type, color, etc.
   * @param {string} lineId - Line ID
   * @returns {Object} Geometry object with stations, svgW, svgH, isLoop, isSixShapedLoop, etc.
   */

  function _renderStationNode(staticLayer, svgNS, o) {
    var color = o.color;
    var isJunction = !!o.isJunction;
    var isMobileView = o.isMobileView;
    var side = o.side || "right";
    var geometry = o.geometry || {};
    var svgW = o.svgW;
    var svgH = o.svgH;
    // v4.3.506: 预取站名并记录字数（供占用检测估算文字宽）
    var _sName = (o.rS || function(id){ return id; })(o.stationId) || "";
    o.labelLen = _sName.length;

    // Station circle
    if (o.sharedColor && !isJunction) {
      // v4.3.955: 共线区间站——平移到两条线中间，白底圆 + 双色外弧描边
      var _r = 7, _cx = o.x - 3, _cy = o.y; // 左移3px到双线正中间（线间距6px的一半）
      // 白底圆（无描边）
      var _bg = document.createElementNS(svgNS, "circle");
      _bg.setAttribute("cx", _cx);
      _bg.setAttribute("cy", _cy);
      _bg.setAttribute("r", _r);
      _bg.setAttribute("fill", "#fff");
      _bg.setAttribute("stroke", "none");
      _bg.setAttribute("data-station-index", o.si);
      staticLayer.appendChild(_bg);
      // 左半弧（金色=有乐町线色，和左边线一致）
      var _arcLeft = document.createElementNS(svgNS, "path");
      _arcLeft.setAttribute("d", "M " + _cx + " " + (_cy - _r) + " A " + _r + " " + _r + " 0 0 0 " + _cx + " " + (_cy + _r));
      _arcLeft.setAttribute("fill", "none");
      _arcLeft.setAttribute("stroke", o.sharedColor);
      _arcLeft.setAttribute("stroke-width", "2");
      staticLayer.appendChild(_arcLeft);
      // 右半弧（棕色=副都心线色，和右边线一致）
      var _arcRight = document.createElementNS(svgNS, "path");
      _arcRight.setAttribute("d", "M " + _cx + " " + (_cy - _r) + " A " + _r + " " + _r + " 0 0 1 " + _cx + " " + (_cy + _r));
      _arcRight.setAttribute("fill", "none");
      _arcRight.setAttribute("stroke", color);
      _arcRight.setAttribute("stroke-width", "2");
      staticLayer.appendChild(_arcRight);
    } else {
      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", o.x);
      circle.setAttribute("cy", o.y);
      // Junctions are structural reference points, not the primary visual.
      // Keep them readable but avoid the former large solid dot that competed
      // with train icons at major stations.
      circle.setAttribute("r", isJunction ? "9" : "7");
      circle.setAttribute("fill", "#fff");
      circle.setAttribute("stroke", color);
      circle.setAttribute("stroke-width", isJunction ? "3" : "2");
      circle.setAttribute("data-station-index", o.si);
      staticLayer.appendChild(circle);
    }

    // Station label position (o.tx/o.ty/o.anchor overrides win; otherwise derive from side)
    var tx, ty, anchor;
    // v4.3.500: 站名与圆点同行，垂直居中对齐（dominant-baseline central，ty=圆心）
    if (o.tx != null) { tx = o.tx; ty = o.ty; anchor = o.anchor || "start"; }
    else if (side === "top") { tx = o.x; ty = o.y - (isJunction ? 14 : 10); anchor = "middle"; }
    else if (side === "bottom") { tx = o.x; ty = o.y + (isJunction ? 19 : 15); anchor = "middle"; }
    // v4.3.509/511: 六形环双列——**主干（环站）左列统一朝左**（v4.3.511 用户指令：
    // 左列上方麻布十番〜新宿由朝右改朝左，与左列下方一致）；**枝干光丘尾站名朝左**
    // （v4.3.511 用户指令），右缘动态避让左列上方站名带（被避让站右缘左移，
    // 画布左限由 clamp 缩字兜底）；**Tochomae junction 保持岔路朝右**（v4.3.505 用户裁定）。
    else if (side === "left" && geometry.isSixShapedLoop && geometry.isDualLoop6) {
      var _sixSide, _sixTx = null;
      if (o.x < geometry.junctionX || isJunction) {
        if (isJunction) {
          // Tochomae junction：岔路站名朝右（v4.3.505 用户裁定，占用检测仅作兜底）
          _sixSide = _pickSixLabelSide(o, geometry, svgW);
        } else {
          // 光丘尾站名朝左——右缘避让左列上方站名带（文字带 y±8 重叠即避让）
          _sixSide = "left";
          _sixTx = o.x - 10;
          var _scs6 = geometry.stationCoords || [];
          if (!isMobileView) {
            for (var _b6 = 0; _b6 < _scs6.length; _b6++) {
              var _bc6 = _scs6[_b6];
              if (_bc6.stationId === o.stationId) continue;
              if (Math.abs(_bc6.x - geometry.junctionX) >= 0.5) continue; // 只看左列站
              if (!(_bc6.y < geometry.junctionY)) continue;               // 只看左列上方
              if (Math.abs(_bc6.y - o.y) >= 16) continue;                 // 文字带（±8）不重叠
              var _bn6 = (window.RailwayDB && window.RailwayDB.resolveStationName)
                ? (window.RailwayDB.resolveStationName(_bc6.stationId, window.currentLang) || _bc6.stationId)
                : _bc6.stationId;
              var _bw6 = (_bn6 || "").length * 16 * 1.1;
              var _bl6 = geometry.junctionX - 10 - _bw6;                  // 左列站名朝左的左缘
              var _lim6 = _bl6 - 4;
              if (_sixTx > _lim6) _sixTx = _lim6;
            }
          }
        }
      } else {
        // 主干环站：v4.3.846 移动端环左列改朝右进环内，桌面端保持朝左
        _sixSide = isMobileView ? "right" : "left";
      }
      tx = (_sixTx != null) ? _sixTx : ((_sixSide === "right") ? (o.x + (isJunction ? 14 : 10)) : (o.x - (isJunction ? 14 : 10)));
      ty = o.y; anchor = (_sixSide === "right") ? "start" : "end";
    }
    else if (side === "left" && geometry.isSixShapedLoop && !geometry.isDualLoop6) { tx = o.x + (isJunction ? 14 : 10); ty = o.y; anchor = "start"; }
    else if (side === "left") { tx = o.x - (isJunction ? 14 : 10); ty = o.y; anchor = "end"; }
    else if (side === "dual") { tx = o.x - (isJunction ? 16 : 12); ty = o.y; anchor = "end"; }
    else if (side === "right" && geometry.isSixShapedLoop && !geometry.isDualLoop6) { tx = o.x - (isJunction ? 14 : 10); ty = o.y; anchor = "end"; }
    else { tx = o.x + (isJunction ? 14 : 10); ty = o.y; anchor = "start"; }

    var label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", tx);
    label.setAttribute("y", ty);
    var _pcFsC = "16";
    var _pcFsJ = "16";
    var _pcFs = "16";
    var _lblCompact = (side === "top" || side === "bottom");
    label.setAttribute("font-size", _lblCompact ? (isMobileView ? "16" : _pcFsC) : (isJunction ? (isMobileView ? "16" : _pcFsJ) : (isMobileView ? "16" : _pcFs)));
    label.setAttribute("fill", isJunction ? color : "#555");
    label.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace"); // v4.3.498: 站名用像素字体（与全局一致）
    label.setAttribute("font-weight", isJunction ? "700" : "500");
    label.setAttribute("text-anchor", anchor);
    // v4.3.500: 左右侧站名垂直居中于圆点（top/bottom 保持基线在圆点上下方）
    if (side !== "top" && side !== "bottom") label.setAttribute("dominant-baseline", "central");
    // v4.3.550: junction 站名转圆点上方时白描边遮线（主干竖线从文字后方穿过）
    if (o.paintOrder) {
      label.setAttribute("paint-order", o.paintOrder);
      if (o.stroke) label.setAttribute("stroke", o.stroke);
      if (o.strokeWidth) label.setAttribute("stroke-width", o.strokeWidth);
      label.setAttribute("stroke-linejoin", "round");
    }
    // v4.3.513: 移动端容器窄（tailAreaWidth 上限 < 三区分离需求），光丘尾竖线（stubX）穿左列上方站名——
    // 白色描边遮线（线路从文字后穿过）。桌面端 tail 列已扩至三区分离（junctionX≥stubX+10+88+10），无穿线不触发。
    if (geometry.isSixShapedLoop && geometry.isDualLoop6 && isMobileView &&
        !isJunction && side === "left" &&
        Math.abs(o.x - geometry.junctionX) < 0.5 && o.y < geometry.junctionY) {
      label.setAttribute("paint-order", "stroke");
      label.setAttribute("stroke", "#ffffff");
      label.setAttribute("stroke-width", "3");
      label.setAttribute("stroke-linejoin", "round");
    }
    var _clampAvail = (side === "dual" || side === "left") ? (tx - 4) : ((side === "right") ? (svgW - 2 - tx) : 0);
    if (geometry.isSixShapedLoop) {
      if (geometry.isDualLoop6) {
        // v4.3.506/511: 双列模式——右列站走通用 clamp（svgW-2-tx）。
        // 站名朝右的 left 站（_sixSide==='right'，现仅 Tochomae junction）走窄空间 clamp：
        // - 左列上方站与 Tochomae（x==junctionX，环内）：名到右列圆点左缘前（junctionX+loopRectW−7−4−tx）
        // 光丘尾与左列上方站已改朝左（v4.3.511），走通用 left clamp（tx-4，避让后的右缘）。
        if (side === "left" && _sixSide === "right") {
          var _rDotL6 = geometry.junctionX + (geometry.loopRectW || 72) - 7;
          _clampAvail = o.x < geometry.junctionX
            ? (isMobileView ? Math.max(40, Math.floor(tx - 4)) : Math.max(40, Math.floor(geometry.junctionX - tx - 4)))
            : Math.max(40, Math.floor(_rDotL6 - 4 - tx));
        }
      } else if (geometry.junctionX === null || o.x >= geometry.junctionX) {
        // Loop stations: name area = half the loop width (shared by both sides)
        var _sc6 = isMobileView ? 1.5 : 1.3;
        var _m6r = isMobileView ? 66 : (20 * _sc6 + 12);
        var _tw6 = 70 * _sc6;
        var _lm6 = 8 * _sc6;
        var _loopW6 = svgW - _lm6 - _tw6 - _m6r;
        _clampAvail = Math.max(40, Math.floor(_loopW6 / 2) - 10);
      } else if (side === "left") {
        // v4.3.482: Tail stations (光丘方向) name flows RIGHT from stubX toward
        // the loop's left edge. The generic branch above wrongly used tx-4
        // (space to the left, ~31px) which crushed every tail label to 40px.
        _clampAvail = Math.max(40, Math.floor(geometry.junctionX - tx - 4));
      }
    }
    if (_clampAvail > 0) label.setAttribute("data-clamp-avail", String(Math.max(40, Math.round(_clampAvail))));

    // Station name
    var stationName = _sName;
    var nameTspan = document.createElementNS(svgNS, "tspan");
    nameTspan.textContent = stationName;
    label.appendChild(nameTspan);
    staticLayer.appendChild(label);

    // Interchange line icons (grouped in a rounded background chip below the label)
    if (o.skipTx) return;
    var transferMap = o.transferMap || {};
    var txLines = transferMap[o.stationId] || [];
    if (txLines.length > 0) {
      var isCompact = (side === "top" || side === "bottom");
      var ICON = 16; // v4.3.497: 换乘图标统一 16px（与站名字号一致，用户尝试）
      var GAP = 2;
      var PER_ROW = 4;
      var MAX_ROWS = (window.RuntimeConfig && window.RuntimeConfig.TRANSFER_MAX_ROWS) || 4; // v4.3.613: 2→3 行——JR 大站（东京/新宿）换乘超 8 条，截断致"同一套系统无法区分"
      var maxShow = PER_ROW * MAX_ROWS;
      var nonThru = txLines.filter(function(t) { return !t.through; });
      // v4.3.613 系统级去重：同一运营系统只显示一个徽章——
      // ①同 icon（视觉身份）：横须贺·总武快速同 JO、東海道線 JT 与干线本名
      //   TokaidoMain 同 icon → 合并；②无 icon 时按 LOS 系统键（高崎/宇都宮
      //   icon 不同 → 保留为两条独立线）
      var seenIcon = {};
      nonThru = nonThru.filter(function(t) {
        var key = t.image ? ("I:" + t.image) : (_losGroupKey(t) || ("L:" + t.lineId));
        if (seenIcon[key]) return false;
        seenIcon[key] = true;
        return true;
      });
      // v4.3.613 JR 东系统内换乘排前（行业惯例：JR 线一组、私铁/地铁另排）——
      // 同记号系列（JK-JY）连续可辨，跨公司换乘不插队
      nonThru.sort(function(a, b) {
        var aj = a.operator === "JR-East" ? 0 : 1;
        var bj = b.operator === "JR-East" ? 0 : 1;
        return aj - bj;
      });
      var shown = nonThru.slice(0, maxShow);
      var rows = Math.ceil(shown.length / PER_ROW);
      var _rowWAt = function(r) {
        var acc = 0;
        var from = r * PER_ROW, to = Math.min((r + 1) * PER_ROW, shown.length);
        for (var k = from; k < to; k++) {
          var it = shown[k];
          acc += (it.image ? ICON : _badgeW(it, isMobileView)) + GAP;
        }
        return acc > 0 ? acc - GAP : 0;
      };
      var maxRowW = 0;
      for (var rw_ = 0; rw_ < rows; rw_++) maxRowW = Math.max(maxRowW, _rowWAt(rw_));
      var rowW = rows > 0 ? _rowWAt(rows - 1) : 0;
      var moreText = nonThru.length > maxShow ? "+" + (nonThru.length - maxShow) : "";
      var totalW = maxRowW + (moreText ? 12 : 0);
      var ix0, iy0;
      // v4.3.550: junction 站名在圆点上方（anchor=middle）时，换乘 chip 仍放圆点下方（ty 已上移，不能再用 ty+9/14）
      // 判据用 anchor==="middle"（junction top 模式唯一入口；普通站不传 o.anchor）
      var _jTopMode = (o.tx != null && o.anchor === "middle" && o.y != null);
      iy0 = _jTopMode ? (o.y + 14) : ((side === "top") ? (o.y + 14) : (ty + (isJunction ? 14 : 9))); // v4.3.500: chip 在站名下方，避让圆点底缘（+2px）
      if (iy0 < 2) iy0 = 2;
      // v4.3.501 对齐规则（用户规定）：换乘图标块必须有一边与站名文字侧边对齐——
      // 站名在圆点右侧（anchor=start）→ chip 左缘=文字左缘；站名在左侧（anchor=end）→
      // chip 右缘=文字右缘；顶底站名（anchor=middle）→ chip 居中于文字。
      if (anchor === "end") { ix0 = tx - totalW; }
      else if (anchor === "start") { ix0 = tx; }
      else { ix0 = tx - totalW / 2; }
      if ((side === "left" || side === "dual") && ix0 < 2) {
        PER_ROW = 3;
        shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
        rows = Math.ceil(shown.length / PER_ROW);
        maxRowW = 0;
        for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
        moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
        totalW = maxRowW + (moreText ? 12 : 0);
        ix0 = tx - totalW;
        if (ix0 < 2) {
          PER_ROW = 2;
          shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
          rows = Math.ceil(shown.length / PER_ROW);
          maxRowW = 0;
          for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
          moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
          totalW = maxRowW + (moreText ? 12 : 0);
          ix0 = tx - totalW;
        }
        if (ix0 < 2) ix0 = 2;
      }
      if ((side === "right" || side === "dual") && ix0 + totalW > svgW - 2) {
        PER_ROW = 3;
        shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
        rows = Math.ceil(shown.length / PER_ROW);
        maxRowW = 0;
        for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
        moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
        totalW = maxRowW + (moreText ? 12 : 0);
        ix0 = tx;
        if (ix0 + totalW > svgW - 2) {
          PER_ROW = 2;
          shown = nonThru.slice(0, PER_ROW * MAX_ROWS);
          rows = Math.ceil(shown.length / PER_ROW);
          maxRowW = 0;
          for (var rw_2 = 0; rw_2 < rows; rw_2++) maxRowW = Math.max(maxRowW, _rowWAt(rw_2));
          moreText = nonThru.length > PER_ROW * MAX_ROWS ? "+" + (nonThru.length - PER_ROW * MAX_ROWS) : "";
          totalW = maxRowW + (moreText ? 12 : 0);
          ix0 = tx;
        }
        if (ix0 + totalW > svgW - 2) ix0 = svgW - 2 - totalW;
      }
      var bgH = 0;
      for (var r_ = 0; r_ < rows; r_++) {
        var _rowImg = false;
        for (var c_ = r_ * PER_ROW; c_ < Math.min((r_ + 1) * PER_ROW, shown.length); c_++) {
          if (shown[c_].image) { _rowImg = true; break; }
        }
        bgH += (_rowImg ? ICON + 2 : 15);
      }
      if (rows > 1) bgH += (rows - 1) * GAP;
      var bg = document.createElementNS(svgNS, "rect");
      bg.setAttribute("x", ix0 - 1);
      bg.setAttribute("y", iy0 - 1);
      bg.setAttribute("width", totalW + 2);
      bg.setAttribute("height", bgH);
      bg.setAttribute("rx", "3");
      bg.setAttribute("fill", "rgba(255,255,255,0.72)");
      staticLayer.appendChild(bg);
      {
        var _rowCur = null;
        for (var ti2 = 0; ti2 < shown.length; ti2++) {
          var txl = shown[ti2];
          var row = Math.floor(ti2 / PER_ROW);
          var col = ti2 % PER_ROW;
          if (col === 0) _rowCur = ix0;
          var tix = _rowCur;
          var tiy = iy0 + row * (ICON + GAP);
          if (txl.image) {
            var tImg = document.createElementNS(svgNS, "image");
            tImg.setAttribute("href", txl.image);
            tImg.setAttribute("xlink:href", txl.image);
            tImg.setAttribute("x", tix);
            tImg.setAttribute("y", tiy);
            tImg.setAttribute("width", ICON);
            tImg.setAttribute("height", ICON);
            tImg.setAttribute("opacity", "0.95");
            var tTitle = document.createElementNS(svgNS, "title");
            tTitle.textContent = _throughBadgeText(txl);
            tImg.appendChild(tTitle);
            staticLayer.appendChild(tImg);
          } else {
            // v4.3.944: 单行 badge——异名/站外信息放旁边小字，不撑高线路图
            var _toName = txl.toStation ? (window.RailwayDB && window.RailwayDB.resolveStationName ? window.RailwayDB.resolveStationName(txl.toStation, window.currentLang) : txl.toStation) : "";

            var _lineName = (txl.name || txl.lineId || "").slice(0, 4);
            var bW = _badgeW(txl, isMobileView);
            var bH = isMobileView ? 15 : 11;
            var bRect = document.createElementNS(svgNS, "rect");
            bRect.setAttribute("x", tix);
            bRect.setAttribute("y", tiy);
            bRect.setAttribute("width", bW);
            bRect.setAttribute("height", bH);
            bRect.setAttribute("rx", "2");
            bRect.setAttribute("fill", txl.color || (window.TrainsColors ? window.TrainsColors.LABEL_FALLBACK : "#8a8a8a"));
            staticLayer.appendChild(bRect);
            var bTxt = document.createElementNS(svgNS, "text");
            bTxt.setAttribute("x", tix + bW / 2);
            bTxt.setAttribute("y", tiy + bH / 2 + (isMobileView ? 3.2 : 2.2));
            bTxt.setAttribute("text-anchor", "middle");
            bTxt.setAttribute("font-size", isMobileView ? "9" : "6.5");
            bTxt.setAttribute("font-weight", "600");
            bTxt.setAttribute("fill", "#fff");
            bTxt.textContent = _lineName;
            staticLayer.appendChild(bTxt);

            // 异名换乘/站外步行：badge 旁边小字（右侧，不撑高）
            var _sideTxt = _toName;
            if (_sideTxt) {
              var sTxt = document.createElementNS(svgNS, "text");
              sTxt.setAttribute("x", tix + bW + 3);
              sTxt.setAttribute("y", tiy + bH / 2 + (isMobileView ? 3 : 2));
              sTxt.setAttribute("font-size", isMobileView ? "7" : "5");
              sTxt.setAttribute("font-weight", "500");
              sTxt.setAttribute("fill", "#333");
              sTxt.textContent = _sideTxt;
              staticLayer.appendChild(sTxt);
            }
          }
          _rowCur += (txl.image ? ICON : _badgeW(txl, isMobileView)) + GAP;
        }
      }
      if (moreText) {
        var more = document.createElementNS(svgNS, "text");
        var moreX = ix0 + rowW + GAP;
        var moreY = iy0 + 8;
        more.setAttribute("x", moreX);
        more.setAttribute("y", moreY);
        more.setAttribute("font-size", "7");
        more.setAttribute("fill", "#777");
        more.textContent = moreText;
        staticLayer.appendChild(more);
      }

      // Through-service boxed labels anchored to the station in the through direction
      var thruList = [];
      for (var tI = 0; tI < txLines.length; tI++) {
        if (txLines[tI] && txLines[tI].through) thruList.push(txLines[tI]);
      }
      thruList = _normalizeThroughChipList(thruList);
      var _scs = o.stationCoords || [];
      var _chipGap = 6;
      var _middleGap = 4;
      var _laneGapMiddle = isMobileView ? 24 : 20;
      var _renderChipAt = function(item, x0, y0) {
        var s0 = _throughChipSize(item, isMobileView);
        var lx0 = Math.max(2, Math.min(x0, svgW - s0.w - 2));
        var ly0 = Math.max(2, Math.min(y0, svgH - s0.h - 2));
        item._throughSide = lx0 < o.x ? "left" : "right";
        _renderThroughChip(staticLayer, svgNS, lx0, ly0, item, ICON, isMobileView);
      };
      // Endpoint through chips: horizontal row centred on the endpoint dot.
      // Middle through chips remain vertical in the side lane below.
      var _layoutEndpoint = function(dir, baseY) {
        var list = thruList.filter(function(x) { return x && x.dir === dir; });
        if (!list.length) return;
        var totalW = 0;
        var maxH = 0;
        var sizes = [];
        for (var li = 0; li < list.length; li++) {
          sizes[li] = _throughChipSize(list[li], isMobileView);
          totalW += sizes[li].w;
          maxH = Math.max(maxH, sizes[li].h);
        }
        totalW += (list.length - 1) * _chipGap;
        var cx = o.x - totalW / 2;
        for (var lj = 0; lj < list.length; lj++) {
          _renderChipAt(list[lj], cx, baseY + (maxH - sizes[lj].h) / 2);
          cx += sizes[lj].w + _chipGap;
        }
      };
      _layoutEndpoint("up", o.y - 16 - (isMobileView ? 26 : 22));
      var _chipBot = iy0 + rows * ICON + (rows - 1) * GAP + 2;
      _layoutEndpoint("down", Math.max(_chipBot + 4, o.y + 8));

      var _middleList = thruList.filter(function(x) {
        return x && x.dir !== "up" && x.dir !== "down";
      });
      if (_middleList.length) {
        var _middleSizes = [];
        var _middleH = 0;
        for (var mi = 0; mi < _middleList.length; mi++) {
          _middleSizes[mi] = _throughChipSize(_middleList[mi], isMobileView);
          _middleH += _middleSizes[mi].h;
        }
        _middleH += (_middleList.length - 1) * _middleGap;
        var _middleY = o.y - _middleH / 2;
        var _middleLeftLane = anchor === "start";
        for (var mj = 0; mj < _middleList.length; mj++) {
          var _ms = _middleSizes[mj];
          var _mx = _middleLeftLane ? (o.x - _ms.w - _laneGapMiddle) : (o.x + _laneGapMiddle);
          _renderChipAt(_middleList[mj], _mx, _middleY);
          _middleY += _ms.h + _middleGap;
        }
      }
    }
  }

  function _isRealtimePositionFresh(p) {
    if (!p || p.positionSource !== "realtime-api") return true;
    var now = Date.now();
    if (p.sourceValidUntil) {
      var validUntil = Date.parse(p.sourceValidUntil);
      return !isNaN(validUntil) && validUntil >= now;
    }
    if (!p.sourceUpdatedAt) return true;
    var updatedAt = Date.parse(p.sourceUpdatedAt);
    if (isNaN(updatedAt)) return false;
    var frequency = Number(p.sourceFrequency);
    var maxAgeMs = isFinite(frequency) && frequency > 0
      ? Math.max(60000, Math.min(frequency * 1000 * 4, 5 * 60 * 1000))
      : 2 * 60 * 1000;
    return (now - updatedAt) <= maxAgeMs;
  }

  function _filterExpiredRealtimePositions(positions) {
    return (positions || []).filter(_isRealtimePositionFresh);
  }

  function _formatSourceTime(value) {
    if (!value) return "";
    var d = new Date(value);
    if (isNaN(d.getTime())) return "";
    try {
      return d.toLocaleTimeString(window.currentLang || "ja", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch(e) {
      return d.toLocaleTimeString();
    }
  }

  // v4.3.469: 推定データ注記——いずれかの列車が時刻表推定なら表示。
  // リアルタイム位置のみの路線には出さない。増分・全再構築の両パスから呼ばれる（冪等）。
  // v4.3.511: 位置を容器内 appendChild から「容器正下方（外部）」に修正（insertAdjacentElement afterend）——
  // 元実装は容器内末尾に置いており、v4.3.469 の設計意図（容器外・下方中央）と不一致だった。
  function updateEstimatedNote(el, positions) {
    try {
      var _oldNotes = el.parentNode ? el.parentNode.querySelectorAll('.tp-est-note') : [];
      for (var _oi = 0; _oi < _oldNotes.length; _oi++) _oldNotes[_oi].remove();
      positions = positions || [];
      var _op = window.ODPTClient && window.ODPTClient.LINE_TO_OPERATOR && window.ODPTClient.LINE_TO_OPERATOR[el.getAttribute("data-line-id") || ""];
      var _request = _op && window.ODPT_POSITION_REQUEST_STATUS && window.ODPT_POSITION_REQUEST_STATUS[_op];
      var _lineId = el.getAttribute("data-line-id") || "";
      var _linePolicy = window.RuntimeConfig && window.RuntimeConfig.REALTIME_POSITION_POLICY;
      var _lineMode = _linePolicy && _linePolicy.lines && _linePolicy.lines[_lineId] && _linePolicy.lines[_lineId].mode;
      // Operator status is relevant only to lines explicitly configured for
      // realtime position coverage; never infer per-line coverage from a shared operator response.
      if (_lineMode !== "FULL" && _lineMode !== "COARSE") _request = null;
      var expiredRealtime = positions.some(function(p) {
        return p && p.positionSource === "realtime-api" && !_isRealtimePositionFresh(p);
      });
      var visiblePositions = _filterExpiredRealtimePositions(positions);
      var anyEst = false;
      var anyRealtime = false;
      var latestRealtimeAt = "";
      var latestRealtimeMs = 0;
      for (var _ei = 0; _ei < visiblePositions.length; _ei++) {
        var _p = visiblePositions[_ei];
        var _rank = _trainPositionRank(_p);
        if (_rank === 0) {
          anyRealtime = true;
          if (_p.sourceUpdatedAt) {
            var _ms = Date.parse(_p.sourceUpdatedAt);
            if (!isNaN(_ms) && _ms > latestRealtimeMs) {
              latestRealtimeMs = _ms;
              latestRealtimeAt = _p.sourceUpdatedAt;
            }
          }
        } else if (_rank === 1 || _rank === 2) {
          anyEst = true;
        }
      }
      var parts = [];
      // A successful operator response may contain other railways but no
      // records for this specific line. Do not label it as an operator outage.
      var _lineResponseMissing = _request && _request.state === "ok" && !anyRealtime && !expiredRealtime &&
        !positions.some(function(p) { return p && p.positionSource === "realtime-api"; });
      if (_request && (_request.state === "error" || _request.state === "loading" || _request.state === "empty") && !anyRealtime) {
        var _statusLang = String(window.currentLang || "ja").toLowerCase();
        var _messages = {
          error: ["ODPTの位置情報を取得できません", "ODPT 实时位置获取失败", "ODPT 위치 정보를 가져오지 못했습니다", "ODPT position request failed"],
          loading: ["ODPTの位置情報を取得中", "正在获取 ODPT 实时位置", "ODPT 위치 정보 불러오는 중", "Loading ODPT positions"],
          empty: ["ODPTから位置情報が返されていません", "ODPT 未返回位置数据", "ODPT 위치 데이터가 반환되지 않았습니다", "ODPT returned no position data"]
        };
        var _li = _statusLang.indexOf("zh") === 0 ? 1 : _statusLang.indexOf("ko") === 0 ? 2 : _statusLang.indexOf("en") === 0 ? 3 : 0;
        parts.push(_messages[_request.state][_li]);
      }
      if (_lineResponseMissing) {
        var _missingLang = String(window.currentLang || "ja").toLowerCase();
        parts.push(_missingLang.indexOf("zh") === 0 ? "该线路暂无 ODPT 实时位置记录" :
          _missingLang.indexOf("ko") === 0 ? "이 노선의 ODPT 실시간 위치 기록이 없습니다" :
          _missingLang.indexOf("en") === 0 ? "No ODPT realtime position records for this line" :
          "この路線のODPTリアルタイム位置情報はありません");
      }
      if (expiredRealtime) {
        var _expiredText = t("trains.realtime_expired_note");
        if (!_expiredText || _expiredText === "trains.realtime_expired_note") {
          var _statusLang = String(window.currentLang || "ja").toLowerCase();
          _expiredText = _statusLang.indexOf("zh") === 0 ? "ODPT 实时位置已过期" :
            _statusLang.indexOf("ko") === 0 ? "ODPT 실시간 위치 정보가 만료되었습니다" :
            _statusLang.indexOf("en") === 0 ? "ODPT realtime position expired" :
            "ODPTのリアルタイム位置情報が期限切れです";
        }
        parts.push(_expiredText);
      }
      if (anyRealtime && latestRealtimeAt) {
        parts.push("ODPT " + _formatSourceTime(latestRealtimeAt));
      }
      if (anyEst) {
        parts.push(anyRealtime
          ? (t("trains.estimated_mixed_note") || "*Only supplemental non-realtime positions are estimated")
          : (t("trains.estimated_note") || "*Data calculated from timetable"));
      }
      if (!parts.length) return;
      var note = document.createElement("div");
      note.className = "tp-est-note";
      note.setAttribute("role", "status");
      note.setAttribute("aria-live", "polite");
      note.textContent = parts.join(" · ");
      el.insertAdjacentElement('afterend', note);
    } catch(e) { /* note is best-effort */ }
  }

  function _trainPositionRank(p) {
    if (!p) return 3;
    if (p.positionSource === "realtime-api") return 0;
    if (p.positionSource === "train-timetable") return 1;
    if (p.positionSource === "station-timetable") return 2;
    return p.estimated === true ? 1 : 3; // Unknown provenance is neither live nor timetable.
  }

  function _sortTrainPositionsBySource(positions) {
    return (positions || []).slice().sort(function(a, b) {
      var ar = _trainPositionRank(a);
      var br = _trainPositionRank(b);
      if (ar !== br) return ar - br;
      var ai = a && a.stationIndex != null ? a.stationIndex : 9999;
      var bi = b && b.stationIndex != null ? b.stationIndex : 9999;
      if (ai !== bi) return ai - bi;
      return String((a && (a.trainNumber || a.trainId)) || "").localeCompare(String((b && (b.trainNumber || b.trainId)) || ""));
    });
  }

  function renderTrainMap(el, line, lineId) {
    try {
      el.setAttribute("data-line-id", lineId);
      // ODPT dynamic data outside dct:valid must not remain visible as realtime.
      var positions = _sortTrainPositionsBySource(_filterExpiredRealtimePositions(getRealtimePositions(lineId)));
      var _lang = window.currentLang || "ja";
      var _rS = (window.RailwayDB && window.RailwayDB.resolveStationName) ? function(id){ return window.RailwayDB.resolveStationName(id, _lang) || id; } : function(id){ return id; };
      
      // Get route geometry from cache (single source of truth for coordinates)
      var geometry = computeRouteGeometry(line, lineId);
      var stationCoords = geometry.stationCoords;
      var svgW = geometry.svgW;
      var svgH = geometry.svgH;
      var isMobileView = _isMobileView();
      var color = geometry.color;
      
      // Check if we need full rebuild (line changed) or just train layer update.
      // Language is part of the static layer identity: switching language must
      // trigger a full rebuild (station names / interchange titles are i18n).
      var existingSvg = el.querySelector('svg');
      var isSameLine = existingSvg && existingSvg.getAttribute('data-line-id') === lineId
        && existingSvg.getAttribute('data-lang') === _lang;
      
      if (isSameLine) {
        // === Incremental update: only update train layer using cached geometry ===
        updateTrainLayer(existingSvg, positions, stationCoords, lineId, line);
        updateRunningInfo(el, positions);
        updateEstimatedNote(el, getRealtimePositions(lineId));
        // Sync loading placeholder with the realtime page: hide it as soon as train
        // positions are available (the full-rebuild path re-inserts it when empty).
        var _noDataEl = el.querySelector('.tp-no-data');
        if (positions.length > 0 && _noDataEl) _noDataEl.remove();
        // Do not resurrect a generic "no data" overlay when all API records
        // are expired: updateEstimatedNote() reports that specific source state.
        return;
      }
      
      // === Full rebuild: create new SVG with separated layers ===
      var svgNS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("xmlns", svgNS);
      svg.setAttribute("viewBox", "0 0 " + svgW + " " + svgH);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      // v4.3.541-545: 像素 ×倍数部署（拓展后尺寸）——图超出容器需横向滚动，体验差。
      // v4.3.546: 显示层改容器适配——svg width=100%，viewBox 按比例缩放完整显示，
      // 整图可见、无横向滚动；viewBox 逻辑尺寸（_baseW/_cw6）仍决定内容密度基线。
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.setAttribute("data-line-id", lineId);
      svg.setAttribute("data-lang", _lang);
      // Branch geometry for train placement (branch trains render on branch column)
      svg.__branchGeom = geometry.branchGeom || null;
      svg.__geometry = geometry;
      
      // Background
      var bgRect = document.createElementNS(svgNS, "rect");
      bgRect.setAttribute("width", svgW);
      bgRect.setAttribute("height", svgH);
      bgRect.setAttribute("fill", "var(--bg)");
      bgRect.setAttribute("rx", "8");
      svg.appendChild(bgRect);
      
      // === Static layer: route lines, stations, labels (only built once per line) ===
      var staticLayer = document.createElementNS(svgNS, "g");
      staticLayer.setAttribute("class", "static-layer");
      
      // Transfer map for interchange station icons (interchange lines on this line)
      var transferMap = _getTransferMap(lineId);
      
      // Add route elements (lines/rects/polylines)
      for (var re = 0; re < geometry.routeElements.length; re++) {
        var routeEl = geometry.routeElements[re];
        var svgEl = document.createElementNS(svgNS, routeEl.type);
        for (var attr in routeEl.attrs) {
          if (routeEl.attrs.hasOwnProperty(attr)) {
            svgEl.setAttribute(attr, routeEl.attrs[attr]);
          }
        }
        if (routeEl.text) svgEl.textContent = routeEl.text;
        staticLayer.appendChild(svgEl);
      }
      
      // Add station circles and labels（主線駅も支線駅も _renderStationNode で統一描画）
      // v4.3.516: 支线 junction 站（岔路起点=各支线与主干的接续站）站名朝右（Tochomae 先例）——
      // 多支线全左直排时左侧水平 stub 不穿 junction 站名带；单支线（右侧）junction 保持朝左（现状）
      // v4.3.520: junction 不再限定 stations[0]——我孫子支线 junction 成田在站表末位也命中
      var _isBranchJunction = function(_sid7) {
        if (!geometry.branchLines || geometry.branchLines.length < 2) return false;
        for (var _bj7 = 0; _bj7 < geometry.branchLines.length; _bj7++) {
          var _bl7 = geometry.branchLines[_bj7];
          if (_bl7.stations && _bl7.stations.indexOf(_sid7) >= 0) return true;
        }
        return false;
      };
      for (var si = 0; si < stationCoords.length; si++) {
        var sc = stationCoords[si];
        var stationId = sc.stationId;
        var isJunction = geometry.junctionStation && stationId === geometry.junctionStation;
        var _bJ7 = _isBranchJunction(stationId);
        // v4.3.956: 共线区间站画双色半圆 + v4.3.960: 自动判断共线线
        var _sharedColor = '';
        if (window.SharedTrackPairs && window.SharedTrackPairs.isSharedStation && window.SharedTrackPairs.isSharedStation(lineId, stationId)) {
          var _allL = (window.RailwayDB && window.RailwayDB.getAllLines) ? window.RailwayDB.getAllLines() : null;
          var _partners = window.SharedTrackPairs.getSharedLines(lineId) || [];
          if (_allL && _partners.length > 0) {
            _sharedColor = _allL[_partners[0]].color || '';
          }
        }
        _renderStationNode(staticLayer, svgNS, {
          x: sc.x, y: sc.y, stationId: stationId, isJunction: isJunction,
          color: geometry.stationDisplayColor ? geometry.stationDisplayColor(stationId) : color,
          si: si, side: sc.side || "right", geometry: geometry, isMobileView: isMobileView,
          svgW: svgW, svgH: svgH, transferMap: transferMap, stationCoords: stationCoords,
          rS: _rS,
          sharedColor: _sharedColor,
          skipTx: false,
          tx: _bJ7 ? (geometry.rightBranch ? sc.x : (sc.x + 12)) : undefined, // v4.3.550: 有右支线时 junction 站名转圆点上方居中
          ty: _bJ7 ? (geometry.rightBranch ? (sc.y - 16) : sc.y) : undefined, // v4.3.549: 补漏 ty——junction 站名与圆点同行（此前漏传 ty，text y=undefined / 换乘 chip y=NaN）
          anchor: _bJ7 ? (geometry.rightBranch ? "middle" : "start") : undefined,
          paintOrder: (_bJ7 && geometry.rightBranch) ? "stroke" : undefined, // v4.3.550: 白描边遮主干竖线
          stroke: (_bJ7 && geometry.rightBranch) ? "#ffffff" : undefined,
          strokeWidth: (_bJ7 && geometry.rightBranch) ? 3 : undefined
        });
      }
      
      // v4.3.938: 竖列支线名标签移至 HTML 层图注（不撑宽 viewBox，保持全线路密度统一）
      var _branchNoteItems = [];
      // Add branch lines (if any) - supports both loop and linear lines
      for (var bi = 0; bi < geometry.branchLines.length; bi++) {
        var branch = geometry.branchLines[bi];
        var bColor = branch.color || color;
        // Find junction station: first station of branch that exists in main line
        // v4.3.520: 支持 junction 在支线站表任意位置（我孫子支线 junction 成田在末位）
        var junctionIdx = -1;
        var _jAt = 0;
        if (branch.stations && branch.stations.length > 0 && stationCoords.length > 0) {
          var _mainIds7 = [];
          for (var _mI7 = 0; _mI7 < stationCoords.length; _mI7++) _mainIds7.push(stationCoords[_mI7].stationId);
          var _jFind7 = _branchJunctionStation(branch.stations, _mainIds7);
          if (_jFind7) {
            for (var _ji = 0; _ji < stationCoords.length; _ji++) {
              if (stationCoords[_ji].stationId === _jFind7.station) {
                junctionIdx = _ji;
                break;
              }
            }
            _jAt = _jFind7.at;
          }
        }
        if (junctionIdx >= 0 && stationCoords.length > junctionIdx) {
          // v4.3.516: 多支线全左直排（用户："要么两条直线在左边或者右边别再有拐弯"）——
          // 全部支线同一侧、junction 行水平直 stub（无下移拐弯）；单支线保持右（现状）
          // 派生值经 geometry 跨函数传递（computeRouteGeometry → renderTrainMap）
          var _bSideNow = (geometry.branchSides && geometry.branchSides[bi]) ? geometry.branchSides[bi] : "right";
          var _bColNow = (geometry.bCol) ? geometry.bCol(bi) : 0;
          var _stubL6 = geometry.branchStubL || 0;
          var _stubR6 = geometry.branchStubR || GEOM.BRANCH_STUB; // v4.3.553: 右侧 stub ≥ 站间距
          var _colW6 = geometry.branchColW || GEOM.BRANCH_COL_W;
          if (geometry.branchModes && geometry.branchModes[bi] === 'h') {
            // v4.3.522: 短支线线 → 支线水平直线横排（用户："两条直线别再有拐弯"）：
            // junction 圆点直接一条水平直线延伸到最后一站（无 stub、无竖列、无拐弯）；
            // 支线站横排（跳过 junction 站，主干已画），站名朝侧边、与圆点同行。
            var _bHSt = [];
            var _rStationsH = (_jAt === branch.stations.length - 1) ? branch.stations.slice().reverse() : branch.stations;
            for (var bhi2 = 0; bhi2 < _rStationsH.length; bhi2++) {
              if (_rStationsH[bhi2] === _jFind7.station) continue;
              _bHSt.push(_rStationsH[bhi2]);
            }
            var _bHsp = geometry.branchHSp || 65;
            var _bHX0 = stationCoords[junctionIdx].x;
            var _bHY0 = stationCoords[junctionIdx].y;
            var _bHxLast = (_bSideNow === "left")
              ? (_bHX0 - _bHSt.length * _bHsp)
              : (_bHX0 + _bHSt.length * _bHsp);
            // 水平直线：junction → 最后一站
            var bHLine = document.createElementNS(svgNS, "line");
            bHLine.setAttribute("x1", _bHX0); bHLine.setAttribute("y1", _bHY0);
            bHLine.setAttribute("x2", _bHxLast); bHLine.setAttribute("y2", _bHY0);
            bHLine.setAttribute("stroke", bColor);
            bHLine.setAttribute("stroke-width", "3");
            bHLine.setAttribute("opacity", "0.5");
            staticLayer.appendChild(bHLine);
            // 支线站横排
            for (var bsiH = 0; bsiH < _bHSt.length; bsiH++) {
              var _bHx = (_bSideNow === "left")
                ? (_bHX0 - (bsiH + 1) * _bHsp)
                : (_bHX0 + (bsiH + 1) * _bHsp);
              var _bTxH = (_bSideNow === "left") ? (_bHx - 10) : (_bHx + 10);
              _renderStationNode(staticLayer, svgNS, {
                x: _bHx, y: _bHY0, stationId: _bHSt[bsiH], isJunction: false, color: bColor,
                si: bsiH, side: _bSideNow, geometry: geometry, isMobileView: isMobileView,
                svgW: svgW, svgH: svgH, transferMap: transferMap, stationCoords: stationCoords,
                rS: _rS,
                tx: _bTxH, ty: _bHY0, anchor: (_bSideNow === "left") ? "end" : "start",
                skipTx: false
              });
            }
            // 支线名：放远端上方（朝侧边，不挡 junction 区）
            var bHName = document.createElementNS(svgNS, "text");
            bHName.setAttribute("x", (_bSideNow === "left") ? (_bHxLast - 6) : (_bHxLast + 6));
            bHName.setAttribute("y", _bHY0 - 24);
            bHName.setAttribute("font-size", "14");
            bHName.setAttribute("fill", bColor);
            bHName.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace");
            bHName.setAttribute("font-weight", "600");
            bHName.setAttribute("text-anchor", (_bSideNow === "left") ? "end" : "start");
            bHName.textContent = (window.RailwayDB && typeof window.RailwayDB.resolveLineName === "function") ? window.RailwayDB.resolveLineName(branch.id, window.currentLang) : (branch.nameJa || branch.name);
            staticLayer.appendChild(bHName);
          } else {
            // ---- 竖列（现状：水平直 stub + 垂直列）----
            var bx = (_bSideNow === "left")
              ? (stationCoords[junctionIdx].x - _stubL6 - _bColNow * _colW6)
              : (stationCoords[junctionIdx].x + _stubR6 + _bColNow * GEOM.BRANCH_COL_W);
            var by = stationCoords[junctionIdx].y;
            var branchTop = by - 20;
            // v4.3.516: junction 行水平直 stub（不拐弯）；左侧穿 junction 站名带问题由
            // junction 站名朝右解决（_isBranchJunction，见主干站渲染）
            var _connY = by;
            
            // Branch line（junction 行水平直 stub，拐角圆角）
            var branchLine = document.createElementNS(svgNS, "path");
            var _brx = stationCoords[junctionIdx].x;
            var _bry = _connY;
            var _brx2 = bx;
            var _bry2 = _connY;
            var _brR = 8; // 圆角半径
            // L 形：从 junction 水平→拐角→垂直（向下）
            var _brDir = (bx > stationCoords[junctionIdx].x) ? 1 : -1; // 右/左
            var _brSign = (bx > stationCoords[junctionIdx].x) ? 1 : -1;
            branchLine.setAttribute("d",
              "M " + _brx + " " + _bry +
              " L " + (_brx2 - _brR * _brDir) + " " + _bry +
              " Q " + _brx2 + " " + _bry + " " + _brx2 + " " + (_bry + _brR) +
              " L " + _brx2 + " " + _bry2);
            branchLine.setAttribute("stroke", bColor);
            branchLine.setAttribute("stroke-width", "5");
            branchLine.setAttribute("fill", "none");
            branchLine.setAttribute("opacity", "0.6");
            staticLayer.appendChild(branchLine);
            
            // Branch vertical line
            var branchSp = geometry.sp || 24;
          var branchVLine = document.createElementNS(svgNS, "line");
          branchVLine.setAttribute("x1", bx);
          branchVLine.setAttribute("y1", _connY);
          branchVLine.setAttribute("x2", bx);
          // v4.3.554: 竖线只画到最后一个支线站（原 branchTop+站数×sp 从 junction 上一档起、
          // 含 junction 全站计数——4.3.548 跳过 junction、4.3.554 第一站同行后竖线多出
          // 2×sp-20px 空段：丸ノ内方南町 308→462 多 96px 空线）——精确计数独有站，
          // 终点 = 最后一站 y = junction 行 + (独有站数-1)×sp
          var _vOwn = 0;
          if (branch.stations) {
            for (var _vi7 = 0; _vi7 < branch.stations.length; _vi7++) {
              if (branch.stations[_vi7] !== _jFind7.station) _vOwn++;
            }
          }
          branchVLine.setAttribute("y2", _connY + Math.max(0, _vOwn - 1) * branchSp);
          branchVLine.setAttribute("stroke", bColor);
          branchVLine.setAttribute("stroke-width", "5");
          branchVLine.setAttribute("opacity", "0.6");
          staticLayer.appendChild(branchVLine);
          
          // Branch stations（主線と同じ _renderStationNode で統一描画——スタイルは完全に同一）
          if (branch.stations) {
            var _bTx = (_bSideNow === "left") ? (bx - 10) : (bx + 10);
            var _bAnchor = (_bSideNow === "left") ? "end" : "start";
            // v4.3.520: junction 在支线站表末位（我孫子支线）→ 反转站序从 junction 向下延伸
            // v4.3.548: 竖列跳过 junction 站（主干已绘）——支线只画独有站，junction 不重复
            // v4.3.553: 第一站与 junction 同行（用户："岔路的第一个站和出去的站在一行"）——
            // 岔路第一站水平叉出与岔路点同行，再竖列向下（原 _bK2=1 起于 junction 下方一档）
            var _rStations = (_jAt === branch.stations.length - 1) ? branch.stations.slice().reverse() : branch.stations;
            var _bK2 = 0;
            for (var bsi = 0; bsi < _rStations.length; bsi++) {
              if (_rStations[bsi] === _jFind7.station) continue;
              var bsy = by + _bK2 * branchSp;
              _renderStationNode(staticLayer, svgNS, {
                x: bx, y: bsy, stationId: _rStations[bsi], isJunction: false, color: bColor,
                si: bsi, side: _bSideNow, geometry: geometry, isMobileView: isMobileView,
                svgW: svgW, svgH: svgH, transferMap: transferMap, stationCoords: stationCoords,
                rS: _rS,
                tx: _bTx, ty: bsy, anchor: _bAnchor, // v4.3.500: 支线站名避让 r=7 圆点 + 垂直居中（左侧支线镜像朝左）
                skipTx: false
              });
              _bK2++;
            }
          }
          
          // v4.3.942: 竖列支线名放回 SVG 层，显示在支线远端旁边（短名，去掉主线名前缀）
          var _fullName = (window.RailwayDB && typeof window.RailwayDB.resolveLineName === "function") ? window.RailwayDB.resolveLineName(branch.id, window.currentLang) : (branch.nameJa || branch.name);
          // 提取括号里的短名：丸ノ内線（方南町支線）→ 方南町支線
          var _shortName = _fullName;
          var _m = _fullName.match(/[（(](.+?)[）)]/);
          if (_m) _shortName = _m[1];
          var _bNameEl = document.createElementNS(svgNS, "text");
          _bNameEl.setAttribute("x", bx);
          _bNameEl.setAttribute("y", _connY + Math.max(0, _vOwn - 1) * branchSp + 18);
          _bNameEl.setAttribute("text-anchor", "middle");
          _bNameEl.setAttribute("font-size", "10");
          _bNameEl.setAttribute("fill", bColor);
          _bNameEl.setAttribute("font-weight", "600");
          _bNameEl.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace");
          _bNameEl.textContent = _shortName;
          staticLayer.appendChild(_bNameEl);
          } // v4.3.522: else（竖列现状）闭合
        }
      }
      
      svg.appendChild(staticLayer);

    // === Train layer ===
      var trainLayer = document.createElementNS(svgNS, "g");
      trainLayer.setAttribute("class", "train-layer");
      svg.appendChild(trainLayer);
      
      // Replace content
      // v4.3.469: 容器内に"時刻表で推定中"等の提示を出さない——推定データはページ読込と
      // 一緒に初期化し、容器内はリアルタイムと同じ見た目に。データ出所の注記は容器外
      // （tp-est-note、下・中央）に置く。
      el.innerHTML = '<div class="tp-map-wrap"></div>';
      var _mapWrap = el.querySelector('.tp-map-wrap');
      // v4.3.938: 竖列支线名 HTML 图注（SVG 上方，线色着色，多条以 · 分隔）
      if (_branchNoteItems.length) {
        var _bnEl = document.createElement('div');
        _bnEl.setAttribute('class', 'branch-note');
        for (var _nbI = 0; _nbI < _branchNoteItems.length; _nbI++) {
          var _spEl = document.createElement('span');
          _spEl.style.color = _branchNoteItems[_nbI].color;
          _spEl.textContent = _branchNoteItems[_nbI].name;
          _bnEl.appendChild(_spEl);
          if (_nbI < _branchNoteItems.length - 1) _bnEl.appendChild(document.createTextNode(' · '));
        }
        _mapWrap.appendChild(_bnEl);
      }
      _mapWrap.appendChild(svg);

      // v4.3.539: 线路图放大 150% 后初始视图居中裁切——视口中心对准图中心，
      // 左右两侧对称溢出，用户可向两端滚动查看（scrollLeft 全程可达，无 flex 溢出不可达问题）。
      requestAnimationFrame(function () {
        try {
          var _scW = el.scrollWidth, _ccW = el.clientWidth;
          if (_scW > _ccW) el.scrollLeft = Math.round((_scW - _ccW) / 2);
        } catch (_e) { /* best-effort centering */ }
      });
      
      // Clamp over-long station names into available width (industry practice:
      // shrink, never clip). Runs after mount so getBBox is accurate.
      try {
        var _clampTexts = staticLayer.querySelectorAll("text[data-clamp-avail]");
        for (var _cI = 0; _cI < _clampTexts.length; _cI++) {
          var _ct = _clampTexts[_cI];
          var _av = parseFloat(_ct.getAttribute("data-clamp-avail"));
          var _f = parseFloat(_ct.getAttribute("font-size"));
          var _t = _ct.textContent || "";
          var _cjkN = (_t.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
          var _othN = _t.length - _cjkN;
          var _estW = (_cjkN * 1.1 + _othN * 0.55) * _f;
          var _bb = _ct.getBBox();
          // Trust getBBox only when it agrees with the estimate; otherwise the
          // font was not loaded and the measured width is unreliable.
          var _useW = (_bb.width > 0 && Math.abs(_bb.width - _estW) < _estW * 0.5) ? _bb.width : _estW;
          if (_useW > _av) {
            // v4.3.504: 下限 12→10——六形环左列上方站名（环段尾，朝环内）在 58px 环内窄空间
            // 需 10px 才能完整放下（5 字=55px，恰好贴右列圆点左缘不重叠）。
            // v4.3.511: 左列上方已改朝左（不再走该窄空间）；下限 10px 仍对光丘尾避让后
            // 与左列站名带重叠的站有效（落合南長崎 5 字≈11.5px）。
            var _nf = Math.max(10, _f * _av / _useW);
            _ct.setAttribute("font-size", String(Math.round(_nf * 10) / 10));
          }
        }
      } catch (e2) { /* clamp is a best-effort readability guard */ }
      
      // Now populate train layer
      updateTrainLayer(svg, positions, stationCoords, lineId, line, geometry);
      updateRunningInfo(el, positions);
      updateEstimatedNote(el, getRealtimePositions(lineId));
      
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
    }
  }
  
  /**
   * Update train layer using DOM diff (update existing, create new, remove missing)
   * Uses cached stationCoords - never recomputes geometry
   */
  // v4.3.950: 环线沿曲线移动——根据周长位置 pos 算 x/y 坐标（矩形周长）
  function _loopPosToXY(pos, rect) {
    var cx = rect.cx, cy = rect.cy, halfW = rect.halfW, halfH = rect.halfH;
    var rectW = rect.rectW, rectH = rect.rectH, perimeter = rect.perimeter;
    var p = ((pos % perimeter) + perimeter) % perimeter;
    var lx, ly;
    if (p < rectW) { lx = cx - halfW + p; ly = cy - halfH; }
    else if (p < rectW + rectH) { lx = cx + halfW; ly = cy - halfH + (p - rectW); }
    else if (p < 2 * rectW + rectH) { lx = cx + halfW - (p - rectW - rectH); ly = cy + halfH; }
    else { lx = cx - halfW; ly = cy + halfH - (p - 2 * rectW - rectH); }
    return { x: lx, y: ly };
  }

  function _setTrainIconPosition(icon, px, py, p, lineId, isLoop) {
    if (!icon) return;
    var x = px - 7;
    var y = py - 9;
    var tag = String(icon.tagName || '').toLowerCase();
    if (tag === 'image') {
      icon.setAttribute('x', String(x));
      icon.setAttribute('y', String(y));
      var direction = p.railDirection || '';
      if (!isLoop && direction.indexOf('Outbound') >= 0) {
        icon.setAttribute('transform', 'translate(' + px + ', ' + py + ') scale(-1, 1) translate(' + (-px) + ', ' + (-py) + ')');
      } else {
        icon.removeAttribute('transform');
      }
      return;
    }
    if (tag === 'g') {
      icon.setAttribute('transform', 'translate(' + px + ',' + py + ')');
    }
  }

  function _removeTrainLabels(trainLayer, trainUid) {
    var labels = trainLayer.querySelectorAll('[data-train-label-for="' + String(trainUid).replace(/"/g, '') + '"]');
    for (var i = 0; i < labels.length; i++) labels[i].parentNode.removeChild(labels[i]);
  }

  function _trainMarkerSpec(p, trainUid) {
    // Vehicle identity and artwork are resolved upstream. The renderer consumes
    // that projection only; it never re-arbitrates evidence source or confidence.
    // TrainMarker artwork is exactly one of two states:
    //   vehicle = EXACT identity + valid upstream vehicle artwork (PNG)
    //   generic = UNKNOWN / NARROWED / no reliable artwork / PNG load failure
    var iconSrc = p && p.vehicleResolvedUpstream === true ? (p.vehicleIconPath || "") : "";
    var artworkFailed = trainUid && _trainArtworkFailure[String(trainUid)] === true;
    return {
      kind: iconSrc && !artworkFailed ? "vehicle" : "generic",
      iconSrc: iconSrc && !artworkFailed ? iconSrc : "",
      className: p && p.estimated === true ? "train-icon estimated" : "train-icon"
    };
  }

  function _trainMarkerTitle(p) {
    var tip = [];
    if (p && p.trainType) {
      var defs = window.TRAIN_TYPE_NAMES || {};
      var def = defs[p.trainType];
      var typeText = def ? (def[window.currentLang] || def.ja) : "";
      if (typeText) tip.push(typeText);
    }
    if (p && p.vehicleType) tip.push(p.vehicleType);
    else if (p && p.trainClass) tip.push(p.trainClass);
    if (p && p.destinationStation) tip.push(_trainDestText(p.destinationStation));
    return tip.join(" | ");
  }

  // Generic train marker: a lightweight SVG primitive train, sized to the same
  // 14x18 visual scale as the vehicle PNG marker. It expresses "a train is
  // confirmed here, but its vehicle cannot be reliably determined" without
  // claiming a concrete vehicle identity. No external image asset is used.
  function _createGenericTrainMarker(svgNS, className, color) {
    var g = document.createElementNS(svgNS, "g");
    var c = color || "#666666";
    // Roof
    var roof = document.createElementNS(svgNS, "rect");
    roof.setAttribute("x", "-6.5");
    roof.setAttribute("y", "-8.5");
    roof.setAttribute("width", "13");
    roof.setAttribute("height", "2.5");
    roof.setAttribute("rx", "1");
    roof.setAttribute("fill", "#ffffff");
    roof.setAttribute("opacity", "0.9");
    g.appendChild(roof);
    // Cab body
    var body = document.createElementNS(svgNS, "rect");
    body.setAttribute("x", "-7");
    body.setAttribute("y", "-6");
    body.setAttribute("width", "14");
    body.setAttribute("height", "8");
    body.setAttribute("rx", "1.5");
    body.setAttribute("fill", c);
    body.setAttribute("stroke", "rgba(0,0,0,0.35)");
    body.setAttribute("stroke-width", "0.6");
    g.appendChild(body);
    // Windshield band
    var wind = document.createElementNS(svgNS, "rect");
    wind.setAttribute("x", "-5.5");
    wind.setAttribute("y", "-4.5");
    wind.setAttribute("width", "11");
    wind.setAttribute("height", "3");
    wind.setAttribute("rx", "0.5");
    wind.setAttribute("fill", "#eaf2fb");
    g.appendChild(wind);
    // Windshield divider
    var divider = document.createElementNS(svgNS, "rect");
    divider.setAttribute("x", "-0.5");
    divider.setAttribute("y", "-4.5");
    divider.setAttribute("width", "1");
    divider.setAttribute("height", "3");
    divider.setAttribute("fill", c);
    g.appendChild(divider);
    // Headlights
    var hl1 = document.createElementNS(svgNS, "circle");
    hl1.setAttribute("cx", "-4.2");
    hl1.setAttribute("cy", "-5.4");
    hl1.setAttribute("r", "1.1");
    hl1.setAttribute("fill", "#ffffff");
    g.appendChild(hl1);
    var hl2 = document.createElementNS(svgNS, "circle");
    hl2.setAttribute("cx", "4.2");
    hl2.setAttribute("cy", "-5.4");
    hl2.setAttribute("r", "1.1");
    hl2.setAttribute("fill", "#ffffff");
    g.appendChild(hl2);
    // Underframe skirt
    var skirt = document.createElementNS(svgNS, "rect");
    skirt.setAttribute("x", "-7");
    skirt.setAttribute("y", "2");
    skirt.setAttribute("width", "14");
    skirt.setAttribute("height", "2.6");
    skirt.setAttribute("rx", "0.5");
    skirt.setAttribute("fill", "rgba(0,0,0,0.2)");
    g.appendChild(skirt);
    // Wheels
    var wl = document.createElementNS(svgNS, "circle");
    wl.setAttribute("cx", "-4");
    wl.setAttribute("cy", "6.4");
    wl.setAttribute("r", "1.7");
    wl.setAttribute("fill", "#2b2f36");
    g.appendChild(wl);
    var wr = document.createElementNS(svgNS, "circle");
    wr.setAttribute("cx", "4");
    wr.setAttribute("cy", "6.4");
    wr.setAttribute("r", "1.7");
    wr.setAttribute("fill", "#2b2f36");
    g.appendChild(wr);
    g.setAttribute("class", className || "train-icon");
    return g;
  }

  // In-place TrainMarker artwork swap: vehicle PNG -> generic train marker.
  // The marker root is replaced so the DOM keeps exactly one primary marker for
  // this train id. Geometry, stacking slot, label ownership and lifecycle state
  // are inherited; only the artwork changes.
  function _swapTrainMarkerToGeneric(trainLayer, svgNS, marker, trainUid) {
    if (!marker || marker._artworkSwapped) return;
    marker._artworkSwapped = true;
    if (marker._moveRaf) {
      cancelAnimationFrame(marker._moveRaf);
      marker._moveRaf = 0;
    }
    var className = marker.getAttribute("class") || "train-icon";
    var color = marker._displayColor || null;
    var g = _createGenericTrainMarker(svgNS, className, color);
    g.setAttribute("data-train-id", String(trainUid));
    g.setAttribute("data-marker-kind", "generic");
    var titleText = marker.getAttribute("title") || "";
    if (titleText) g.setAttribute("title", titleText);
    // Carry display state so continuity and the stacking slot survive the swap.
    g._displayX = marker._displayX;
    g._displayY = marker._displayY;
    g._displayLineId = marker._displayLineId;
    g._displayStationIdx = marker._displayStationIdx;
    g._displayNextStationIdx = marker._displayNextStationIdx;
    g._displayRoutePos = marker._displayRoutePos;
    var px = Number(g._displayX);
    var py = Number(g._displayY);
    if (!isFinite(px)) px = 0;
    if (!isFinite(py)) py = 0;
    _setTrainIconPosition(g, px, py, null, g._displayLineId || "", false);
    if (marker.parentNode) marker.parentNode.replaceChild(g, marker);
  }

  function _createTrainMarker(trainLayer, svgNS, trainUid, spec, px, py, p, lineId, isLoop, color, loc) {
    var marker;
    var titleText = _trainMarkerTitle(p);
    if (spec.kind === "vehicle") {
      marker = document.createElementNS(svgNS, "image");
      marker.setAttribute("width", "14");
      marker.setAttribute("height", "18");
      marker.setAttribute("href", spec.iconSrc);
      marker.setAttribute("preserveAspectRatio", "xMidYMid meet");
      if (titleText) marker.setAttribute("title", titleText);
      marker._displayColor = color;
      // PNG load/decode failure must switch this single marker to generic
      // artwork in place: same train id, same geometry slot, same labels.
      // The image error only changes artwork; it never creates a second marker.
      marker.addEventListener("error", function () {
        if (!trainLayer || !trainLayer.isConnected) return;
        var uid = marker.getAttribute("data-train-id") || "";
        if (!uid || marker._artworkSwapped) return;
        _rememberTrainArtworkFailure(uid);
        _swapTrainMarkerToGeneric(trainLayer, svgNS, marker, uid);
      });
    } else {
      marker = _createGenericTrainMarker(svgNS, spec.className, color);
      if (titleText) marker.setAttribute("title", titleText);
    }
    marker.setAttribute("data-train-id", String(trainUid));
    marker.setAttribute("data-marker-kind", spec.kind);
    marker.setAttribute("class", spec.className);
    _setTrainIconPosition(marker, px, py, p, lineId, isLoop);
    marker._displayX = px;
    marker._displayY = py;
    marker._displayLineId = lineId;
    if (loc && loc.idx != null && isFinite(Number(loc.idx))) marker._displayStationIdx = Number(loc.idx);
    if (loc && loc.nextIdx != null && isFinite(Number(loc.nextIdx))) marker._displayNextStationIdx = Number(loc.nextIdx);
    if (loc && loc.routePos != null && isFinite(Number(loc.routePos))) marker._displayRoutePos = Number(loc.routePos);
    trainLayer.appendChild(marker);
    return marker;
  }

  function updateTrainLayer(svg, positions, stationCoords, lineId, line, geometry) {
    var trainLayer = svg.querySelector('.train-layer');
    if (!trainLayer) return;
    positions = _sortTrainPositionsBySource(positions);
    geometry = geometry || svg.__geometry || { branchGeom: svg.__branchGeom || null };
    // Incremental train-layer rendering needs the line colour too. Previously the
    // neutral-circle fallback referenced an undefined `color`, so any train whose
    // vehicle icon could not be resolved aborted rendering for that line.
    var color = geometry.color || line.color || (window.TrainsColors ? window.TrainsColors.LINE_FALLBACK : "#008803");
    
    var svgNS = "http://www.w3.org/2000/svg";
    var isLoop = stationCoords.length > 2 &&
      (line.type === "loop" || line.isDoubleColumnLoop === true || line.isSixShapedLoop === true);
    
    // Multi-track / terminal stations may legitimately contain several trains.
    // Never discard official realtime rows merely because they share a station.
    // Keep a small cap only for lower-confidence estimated rows so timetable
    // noise cannot create an unbounded pile at one station.
    var _ESTIMATED_STATION_MAX = 4;
    var _estimatedCount = {};
    var _filtered = [];
    for (var _ep = 0; _ep < positions.length; _ep++) {
      var _epPos = positions[_ep];
      if (_trainPositionRank(_epPos) === 0) {
        _filtered.push(_epPos);
        continue;
      }
      var _epRawIdx = _epPos && _epPos.stationIndex != null ? Number(_epPos.stationIndex) : NaN;
      // Estimated rows obey the same fail-closed position contract as realtime
      // rows. Do not bucket missing/invalid evidence into station 0; otherwise
      // the pre-layout pile limiter itself recreates the Tokyo/first-station pile.
      if (!isFinite(_epRawIdx) || _epRawIdx < 0 || _epRawIdx >= stationCoords.length) continue;
      var _epIdx = _epRawIdx;
      var _stationBucket = (_epPos.fusionLineId ? (_epPos.fusionRole || "fusion") + ":" + _epPos.fusionLineId + ":" : "main:") + _epIdx;
      _estimatedCount[_stationBucket] = (_estimatedCount[_stationBucket] || 0) + 1;
      if (_estimatedCount[_stationBucket] <= _ESTIMATED_STATION_MAX) _filtered.push(_epPos);
    }
    positions = _filtered;
    var layout = (window.TrainTrackLayout && window.TrainTrackLayout.resolveAll)
      ? window.TrainTrackLayout.resolveAll(positions, stationCoords, geometry, lineId, {
          getDisplayMoveDir: _trainMoveDir,
          fusionBaseIdx: _fusionBaseIdx,
          laneGap: isLoop ? 9 : 11,
          stackGap: isLoop ? 7 : 8
        })
      : null;
    
    var _adjacentGaps = [];
    for (var _sgi = 1; _sgi < stationCoords.length; _sgi++) {
      var _sga = stationCoords[_sgi - 1], _sgb = stationCoords[_sgi];
      if (!_sga || !_sgb) continue;
      var _sgdx = _sgb.x - _sga.x, _sgdy = _sgb.y - _sga.y;
      var _gap = Math.sqrt(_sgdx * _sgdx + _sgdy * _sgdy);
      if (isFinite(_gap) && _gap > 0) _adjacentGaps.push(_gap);
    }
    _adjacentGaps.sort(function(a,b){ return a-b; });
    var _medianStationGap = _adjacentGaps.length ? _adjacentGaps[Math.floor(_adjacentGaps.length / 2)] : 40;
    var _snapDistance = Math.max(80, _medianStationGap * 2.5);

    var updatedIds = {};
    var markerById = {};
    var _existingMarkers = trainLayer.querySelectorAll('[data-train-id]');
    for (var _emi = 0; _emi < _existingMarkers.length; _emi++) {
      var _existingMarker = _existingMarkers[_emi];
      var _existingUid = _existingMarker.getAttribute('data-train-id') || "";
      if (!_existingUid) continue;
      if (!markerById[_existingUid]) markerById[_existingUid] = _existingMarker;
      else {
        if (_existingMarker._moveRaf) cancelAnimationFrame(_existingMarker._moveRaf);
        if (_existingMarker.parentNode) _existingMarker.parentNode.removeChild(_existingMarker);
      }
    }
    
    for (var pi = 0; pi < positions.length; pi++) {
      var p = positions[pi];
      var loc = layout ? layout[pi] : null;
      // TrainTrackLayout is the sole geometry authority. If position evidence
      // cannot produce a valid layout result, omit the marker rather than
      // reconstructing coordinates independently in the renderer.
      if (!loc) continue;
      var idx = loc.idx;
      var direction = p.railDirection || '';
      var px = loc.x;
      var py = loc.y;
      
      // Stable physical-service identity: confirmed running chain first.
      // Do not include stationIndex; doing so recreates the DOM node at every
      // station/boundary and breaks continuity even when the chain is known.
      // DOM identity must use a source object or confirmed physical running chain.
      // trainNumber is evidence for bounded same-line bridging, not a globally
      // stable object id: reusing it here can create a second marker when a
      // realtime source object later upgrades to a canonical runningChainId.
      var trainUid = p.runningChainId || p.trainId || p.sourceTrainId || p.timetableObjectId || "";
      // Array order and bare train number are not persistent train identity.
      // Without a stable source/chain key, do not attach animation state.
      if (!trainUid) continue;
      updatedIds[trainUid] = true;
      
      var markerSpec = _trainMarkerSpec(p, trainUid);
      var existingIcon = markerById[String(trainUid)] || null;
      if (existingIcon && existingIcon.getAttribute("data-marker-kind") !== markerSpec.kind) {
        if (existingIcon._moveRaf) cancelAnimationFrame(existingIcon._moveRaf);
        if (existingIcon.parentNode) existingIcon.parentNode.removeChild(existingIcon);
        delete markerById[String(trainUid)];
        existingIcon = null;
      }
      
      if (existingIcon) {
        // Update existing icon position.
        // TrainTrackLayout owns target geometry; this marker owns interpolation.
        // There is exactly one animation authority: per-marker requestAnimationFrame.
        if (existingIcon._moveRaf) {
          cancelAnimationFrame(existingIcon._moveRaf);
          existingIcon._moveRaf = 0;
        }
        var _startX = Number(existingIcon._displayX);
        var _startY = Number(existingIcon._displayY);
        if (!isFinite(_startX) || !isFinite(_startY)) {
          var _tag = String(existingIcon.tagName || '').toLowerCase();
          if (_tag === 'image') {
            var _ix = parseFloat(existingIcon.getAttribute('x'));
            var _iy = parseFloat(existingIcon.getAttribute('y'));
            if (isFinite(_ix) && isFinite(_iy)) {
              _startX = _ix + 7;
              _startY = _iy + 9;
            }
          }
        }
        var _targetX = px;
        var _targetY = py;
        var _loopRect = isLoop ? stationCoords._loopRect : null;
        var _targetRoutePos = loc && loc.routePos != null ? Number(loc.routePos) : NaN;
        var _startRoutePos = Number(existingIcon._displayRoutePos);
        var _useLoopRoute = !!(_loopRect && isFinite(_targetRoutePos) && isFinite(_startRoutePos));
        var _routeDiff = 0;
        if (_useLoopRoute) {
          var _perimeter = Number(_loopRect.perimeter) || 0;
          _routeDiff = _targetRoutePos - _startRoutePos;
          if (_perimeter > 0) {
            var _loopDirName = String(p && p.railDirection || "").split(/[:.]/).pop();
            if (/^(InnerLoop|Inner)$/.test(_loopDirName)) {
              // TrainTrackLayout maps InnerLoop to decreasing station/route order.
              while (_routeDiff > 0) _routeDiff -= _perimeter;
            } else if (/^(OuterLoop|Outer)$/.test(_loopDirName)) {
              while (_routeDiff < 0) _routeDiff += _perimeter;
            } else if (Math.abs(_routeDiff) > _perimeter / 2) {
              _routeDiff += _routeDiff > 0 ? -_perimeter : _perimeter;
            }
          }
        }
        var _dx = _targetX - _startX;
        var _dy = _targetY - _startY;
        var _distance = _useLoopRoute ? Math.abs(_routeDiff) : Math.sqrt(_dx * _dx + _dy * _dy);
        var _hasDisplayPos = isFinite(_startX) && isFinite(_startY);
        var _sameLine = !existingIcon._displayLineId || existingIcon._displayLineId === lineId;
        var _targetIdx = loc && loc.idx != null ? Number(loc.idx) : NaN;
        var _targetNextIdx = loc && loc.nextIdx != null ? Number(loc.nextIdx) : NaN;
        var _previousIdx = Number(existingIcon._displayStationIdx);
        var _previousNextIdx = Number(existingIcon._displayNextStationIdx);
        var _indexContinuous = true;
        if (_sameLine && isFinite(_targetIdx) && isFinite(_previousIdx)) {
          var _idxDiff = Math.abs(_targetIdx - _previousIdx);
          if (isLoop && stationCoords.length > 1) {
            _idxDiff = Math.min(_idxDiff, stationCoords.length - _idxDiff);
          }
          _indexContinuous = _idxDiff <= 1;
          if (_indexContinuous && isFinite(_targetNextIdx) && isFinite(_previousNextIdx)) {
            var _sameSegment = _targetIdx === _previousIdx && _targetNextIdx === _previousNextIdx;
            var _advancedSegment = _targetIdx === _previousNextIdx;
            _indexContinuous = _sameSegment || _advancedSegment;
          }
        }
        // Snap threshold is line geometry, not per-train state. It is computed
        // once for this render pass and shared by every marker.
        var _shouldSnap = !_hasDisplayPos || !_sameLine || !_indexContinuous || !isFinite(_distance) || _distance > _snapDistance;

        if (_shouldSnap || _distance <= 0.5) {
          _setTrainIconPosition(existingIcon, _targetX, _targetY, p, lineId, isLoop);
          existingIcon._displayX = _targetX;
          existingIcon._displayY = _targetY;
          existingIcon._displayLineId = lineId;
          if (isFinite(_targetIdx)) existingIcon._displayStationIdx = _targetIdx;
          if (isFinite(_targetNextIdx)) existingIcon._displayNextStationIdx = _targetNextIdx;
          if (isFinite(_targetRoutePos)) existingIcon._displayRoutePos = _targetRoutePos;
          _syncTrainLabels(trainLayer, svgNS, trainUid, _targetX, _targetY, p, lineId);
        } else {
          var _icon = existingIcon;
          // Keep movement responsive to the actual displacement. Do not stretch
          // every update to a fixed 14 seconds.
          var _animDur = Math.max(350, Math.min(3000, Math.round(_distance * 35)));
          var _animStart = performance.now();
          _syncTrainLabels(trainLayer, svgNS, trainUid, _startX, _startY, p, lineId);
          function _animFrame(now) {
            var _t = Math.min(1, (now - _animStart) / _animDur);
            // Smoothstep: no overshoot, deterministic endpoint.
            var _ease = _t * _t * (3 - 2 * _t);
            var _curX, _curY;
            if (_useLoopRoute) {
              var _curRoutePos = _startRoutePos + _routeDiff * _ease;
              var _routeXY = _loopPosToXY(_curRoutePos, _loopRect);
              _curX = _routeXY.x;
              _curY = _routeXY.y;
              _icon._displayRoutePos = _curRoutePos;
            } else {
              _curX = _startX + _dx * _ease;
              _curY = _startY + _dy * _ease;
            }
            _icon._displayX = _curX;
            _icon._displayY = _curY;
            _icon._displayLineId = lineId;
            _setTrainIconPosition(_icon, _curX, _curY, p, lineId, isLoop);
            _moveTrainLabels(trainLayer, trainUid, _curX, _curY, p, lineId);
            if (_t < 1) {
              _icon._moveRaf = requestAnimationFrame(_animFrame);
            } else {
              _icon._displayX = _targetX;
              _icon._displayY = _targetY;
              if (isFinite(_targetIdx)) _icon._displayStationIdx = _targetIdx;
              if (isFinite(_targetRoutePos)) _icon._displayRoutePos = _targetRoutePos;
              _icon._moveRaf = 0;
            }
          }
          existingIcon._moveRaf = requestAnimationFrame(_animFrame);
        }
      } else {
        existingIcon = _createTrainMarker(trainLayer, svgNS, trainUid, markerSpec, px, py, p, lineId, isLoop, color, loc);
        markerById[String(trainUid)] = existingIcon;
        _syncTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId);
      }
    }
    
    // Remove icons for trains that no longer exist
    // v4.3.454: 兼容终点/方向标签（data-train-label-for 与图标同 uid 清理）
    // v4.3.xxxx: 移除前取消该 marker 仍在运行的动画帧，避免孤悬 RAF 空转
    var allIcons = trainLayer.querySelectorAll('[data-train-id], [data-train-label-for]');
    for (var ii = 0; ii < allIcons.length; ii++) {
      var tid = allIcons[ii].getAttribute('data-train-id') || allIcons[ii].getAttribute('data-train-label-for');
      if (!updatedIds[tid]) {
        if (allIcons[ii]._moveRaf) cancelAnimationFrame(allIcons[ii]._moveRaf);
        allIcons[ii].parentNode.removeChild(allIcons[ii]);
      }
    }
  }

  // v4.3.454: 列车终点/方向标签——方向在上（7px #999）、终点在下（8px #666）
  // 站名解析带归一化兜底：ODPT 站 ID 无连字符（KiyosumiShirakawa）vs 项目站 ID 连字符
  // （Kiyosumi-Shirakawa）——去连字符+小写匹配项目站表后按项目 ID 解析显示名
  function _resolveStationLoose(id) {
    if (!id) return '';
    // v4.3.918: 去掉 ODPT 前缀（odpt.Station:TokyoMetro.YoyogiUehara → YoyogiUehara）
    // 站表 key 不带 TokyoMetro./Toei./JR-East. 前缀，直接查会 miss
    var cleanId = String(id).split(':').pop().split('.').pop();
    if (cleanId && cleanId !== id) id = cleanId;
    // v4.3.902: ODPT 站别名映射（荒川线 Minowabashi→Sannomi_Bashi）
    var _odptAlias = {
      'Toei.Minowabashi': 'Sannomi_Bashi',
      'Toei.Waseda': 'Waseda'
    };
    if (_odptAlias[id]) id = _odptAlias[id];
    var db = window.RailwayDB;
    var direct = (db && db.resolveStationName) ? db.resolveStationName(id, window.currentLang) : id;
    if (direct && direct !== id) return direct;
    var norm = String(id).replace(/-/g, '').toLowerCase();
    var hit = '';
    if (db && typeof db.getStations === 'function') {
      try {
        var sts = db.getStations();
        for (var k in sts) {
          if (String(k).replace(/-/g, '').toLowerCase() === norm) { hit = k; break; }
        }
      } catch(e) {}
    }
    if (!hit && window.UNIFIED_LINES) {
      for (var lid in window.UNIFIED_LINES) {
        var arr = (window.UNIFIED_LINES[lid] || {}).stations || [];
        for (var i = 0; i < arr.length; i++) {
          if (String(arr[i]).replace(/-/g, '').toLowerCase() === norm) { hit = arr[i]; break; }
        }
        if (hit) break;
      }
    }
    if (hit && db && db.resolveStationName) {
      var name = db.resolveStationName(hit, window.currentLang);
      if (name && name !== hit) return name;
    }
    return direct;
  }

  function _trainDestText(destStation) {
    if (!destStation) return '';
    return _resolveStationLoose(destStation) || destStation;
  }

  // v4.3.455: 列车方向标签朝移动方向——方向端点站名在站表中位于当前位置下方＝向下▼（标签在图标下方）、
  // 上方＝向上▲（标签在图标上方）；Inbound/Outbound 按往起点/终点判断；环线 InnerLoop/OuterLoop 等无上下概念返回 null
  // 环线方向词：内回り/外回り（按语言本地化）
  var LOOP_DIR_NAMES = {
    InnerLoop: { ja: "内回り", zh: "内环", en: "Inner", ko: "내선" },
    OuterLoop: { ja: "外回り", zh: "外环", en: "Outer", ko: "외선" },
    Inner: { ja: "内回り", zh: "内环", en: "Inner", ko: "내선" },
    Outer: { ja: "外回り", zh: "外环", en: "Outer", ko: "외선" }
  };

  // v4.3.962: 线路级显示特例表——把光丘段/北绫濑/东急种别等分散的 if 特例收进一张表
  // 字段含义：
  //   branchTrain: { startIdx, endIdx, destRegex } —— 分支段列车识别（Oedo 光丘段）
  //   branchDir:   { upDest, downDest }          —— 分支段方向判定（up=往光丘, down=往都厅前）
  //   branchStation: { regex, dir }              —— 支线站名特判（Chiyoda KitaAyase → down）
  //   showTrainType: true                   —— 显示列车等级种别名（东急线）
  //   dirAxis: { dirName: ±1 }             —— 方位词→站表方向映射（v4.3.962b：原 DIR_AXIS_MAP 收口）
  var LINE_DISPLAY_OVERRIDES = {
    // 大江户线光丘段：站表 [1..10] 为光丘段，枢纽 [0]=Tochomae
    Oedo: {
      branchTrain: { startIdx: 1, endIdx: 10, destRegex: /^Hikarigaoka$/i },
      branchDir: { upDest: /^Hikarigaoka$/i, downDest: null }
    },
    // 千代田线北绫濑支线：KitaAyase 不在主线站表，单独判定
    Chiyoda: {
      branchStation: { regex: /^KitaAyase$/i, dir: 'down' }
    },
    // 东急线：显示列车等级种别名（TRAIN_TYPE_NAMES）
    Tokyu: { showTrainType: true } // 前缀匹配——所有 lineId 以 'Tokyu' 开头的线路
    ,
    // ---- v4.3.962b: 方位词→站表方向映射（原 DIR_AXIS_MAP 收口，判定依据 2026-09-10 ODPT 实时样本）----
    // +1 = 该方位词的列车沿站表正向行驶 → ▼；-1 = 反向 → ▲
    KeihinTohoku:   { dirAxis: { Northbound: -1, Southbound: +1 } },
    ChuoSobuLocal:  { dirAxis: { Eastbound: +1, Westbound: -1 } },
    Saikyo:         { dirAxis: { Northbound: +1, Southbound: -1 } },
    Kawagoe:        { dirAxis: { Southbound: -1 } },
    ShonanShinjuku: { dirAxis: { Northbound: -1, Southbound: +1 } },
    Joban:          { dirAxis: { Northbound: +1, Southbound: -1 } },
    Asakusa:        { dirAxis: { Northbound: +1, Southbound: -1 } },
    Mita:           { dirAxis: { Northbound: +1, Southbound: -1 } },
    Shinjuku:       { dirAxis: { Eastbound: +1, Westbound: -1 } },
    Arakawa:        { dirAxis: { Northbound: +1, Southbound: -1 } }
  };
  function _getLineOverride(lineId) {
    if (!LINE_DISPLAY_OVERRIDES[lineId]) {
      // 前缀匹配（如 Tokyu → TokyuToyoko/TokyuMeguro 等）
      for (var k in LINE_DISPLAY_OVERRIDES) {
        if (lineId.indexOf(k) === 0 && LINE_DISPLAY_OVERRIDES[k].showTrainType) return LINE_DISPLAY_OVERRIDES[k];
      }
      return null;
    }
    return LINE_DISPLAY_OVERRIDES[lineId];
  }

  function _isLoopDirName(dirName) {
    if (!dirName) return false;
    return !!LOOP_DIR_NAMES[String(dirName).split('.').pop()];
  }

  // v4.3.475: 大江户线（6字形）光丘段列车识别。
  // 站表 [0]=Tochomae（环线/光丘段枢纽）、[1..10]=光丘段（西新宿五丁目→光丘，竖直开放尾）。
  // 光丘段列车虽被 ODPT 标成 InnerLoop/OuterLoop，但没有"回り"语义——应显示真实终点（光丘/都厅前）。
  function _isOedoBranchTrain(lineId, p) {
    if (!p) return false;
    var _ov = _getLineOverride(lineId);
    if (!_ov || !_ov.branchTrain) return false;
    var si = p.stationIndex != null ? Number(p.stationIndex) : NaN;
    var bt = _ov.branchTrain;
    if (si >= bt.startIdx && si <= bt.endIdx) return true;
    if (si === 0) {
      var _d0 = String(p.destinationStation || '').split('.').pop();
      if (bt.destRegex && bt.destRegex.test(_d0)) return true;
    }
    return false;
  }

  function _trainMoveDir(p, lineId) {
    var dn = String(p.railDirection || '').split(/[:.]/).pop(); // v4.3.934: 同时拆冒号和点号（odpt:RailDirection:Waseda 和 TokyoMetro.YoyogiUehara 两种格式）
    // v4.3.475: 大江户线光丘段列车先于环线判定——tail 从都厅前竖直向上延伸到光丘，
    // 屏幕方向与站表 index 相反：往光丘=屏幕上方=▲、往都厅前=屏幕下方=▼。
    // v4.3.476: 光丘段区间车（光丘始发→环线，dest 为环线站如 清澄白河/都厅前 而非光丘）——
    // 终点非光丘即沿光丘段往都厅前方向移动（光丘段只有往返两向），一律 ▼。
    if (_isOedoBranchTrain(lineId, p)) {
      var _ovDir = _getLineOverride(lineId);
      var _dest2 = String(p.destinationStation || '').split('.').pop();
      if (_ovDir && _ovDir.branchDir && _ovDir.branchDir.upDest && _ovDir.branchDir.upDest.test(_dest2)) return 'up';
      return 'down';
    }
    // v4.3.962: 支线站名特判（Chiyoda KitaAyase → down）
    var _ovKita = _getLineOverride(lineId);
    if (_ovKita && _ovKita.branchStation) {
      var _bsReg = _ovKita.branchStation.regex;
      if (_bsReg && _bsReg.test(dn)) return _ovKita.branchStation.dir;
    }
    if (/^(InnerLoop|Inner|OuterLoop|Outer)$/.test(dn)) return null;
    // v4.3.938: 统一性——不论方位词是抽象词(Inbound/Northbound…)还是站名，优先用「终点站在本线站表中的
    // index」自动推方向：终点在当前站之后(站表 index 更大)=往站表后方开=down，否则 up。新线自动正确，
    // 不再依赖手工 DIR_AXIS_MAP 收录。终点不在本线站表(直通他线终点/无终点)时不命中，回落下方原判定。
    var _dnDest = String(p.destinationStation || '').split('.').pop();
    if (_dnDest) {
      var _curD = p.stationIndex != null ? Number(p.stationIndex) : NaN;
      if (!isFinite(_curD) || _curD < 0) return null;
      var _stsD = (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) ? (window.UNIFIED_LINES[lineId].stations || []) : [];
      var _destN = _dnDest.replace(/-/g, '').toLowerCase();
      for (var _ddi = 0; _ddi < _stsD.length; _ddi++) {
        if (String(_stsD[_ddi]).replace(/-/g, '').toLowerCase() === _destN) {
          return _ddi > _curD ? 'down' : (_ddi < _curD ? 'up' : null);
        }
      }
    }
    if (/^Inbound$/.test(dn)) return 'up';
    if (/^Outbound$/.test(dn)) return 'down';
    // v4.3.473: 方位词用线路映射表判定（未建表线路返回 null → ▶ 兜底）
    if (/^(Northbound|Southbound|Eastbound|Westbound)$/.test(dn)) {
      var _ovDirAxis = _getLineOverride(lineId);
      var axis = (_ovDirAxis && _ovDirAxis.dirAxis && _ovDirAxis.dirAxis[dn]);
      if (axis === undefined) return null;
      return axis > 0 ? 'down' : 'up';
    }
    if (!dn) return null;
    var cur = p.stationIndex != null ? Number(p.stationIndex) : NaN;
    if (!isFinite(cur) || cur < 0) return null;
    var sts = (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) ? (window.UNIFIED_LINES[lineId].stations || []) : [];
    // v4.3.900: 荒川线 ODPT 站名词典映射（Minowabashi=三ノ輪橋=Sannomi_Bashi）
    var _aliasMap = { 'toei.minowabashi': 'sannomi_bashi', 'toei.waseda': 'waseda' };
    var normTail = String(dn).replace(/-/g, '').toLowerCase();
    if (_aliasMap[normTail]) normTail = _aliasMap[normTail];
    for (var _di = 0; _di < sts.length; _di++) {
      if (String(sts[_di]).replace(/-/g, '').toLowerCase() === normTail) {
        return _di > cur ? 'down' : 'up';
      }
    }
    return null;
  }

  // 方向/终点标签的垂直位置：dir='down' 时方向▼在图标下、终点下移一行；否则方向▲/▶在上、终点在下
  function _trainLabelY(labelPos, py, moveDir) {
    if (labelPos === 'dir') return moveDir === 'down' ? py + 17 : py - 14;
    return moveDir === 'down' ? py + 28 : py + 25;
  }

  function _trainLabelSignature(p, lineId) {
    return [
      lineId || "",
      window.currentLang || "ja",
      p && p.railDirection || "",
      p && p.destinationStation || "",
      p && p.trainType || ""
    ].join("|");
  }

  function appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId) {
    var moveDir = _trainMoveDir(p, lineId);
    var isLoopDir = _isLoopDirName(p.railDirection);
    var dn = String(p.railDirection || '').split(/[:.]/).pop(); // v4.3.934: 同时拆冒号和点号（odpt:RailDirection:Waseda 和 TokyoMetro.YoyogiUehara 两种格式）
    var lang = window.currentLang || 'ja';
    // v4.3.471: 单标签——箭头 + 方向端点站名；不再单独显示"上下行"方向词与终点。
    // 抽象方向词（Inbound/Outbound/Northbound 等无方向端点站）→ 用终点站名；环线 → 内回/外回。
    var labelText = '';
    // v4.3.475: 大江户线光丘段列车显示真实终点（光丘/都厅前），不走环线"内回/外回"标签
    if (_isOedoBranchTrain(lineId, p)) {
      labelText = _trainDestText(p.destinationStation);
    } else if (isLoopDir) {
      // Loop direction is the passenger-facing service label. destinationStation
      // may only describe a timetable turnback/data boundary and must not override
      // an authoritative InnerLoop/OuterLoop direction.
      labelText = (LOOP_DIR_NAMES[dn] && LOOP_DIR_NAMES[dn][lang]) || (LOOP_DIR_NAMES[dn] ? LOOP_DIR_NAMES[dn].ja : '');
    } else if (/^(Inbound|Outbound|Northbound|Southbound|Eastbound|Westbound)$/.test(dn)) {
      labelText = _trainDestText(p.destinationStation);
    } else if (p.destinationStation) {
      // v4.3.930: 优先显示实际终点站（成城学园前/向丘游园/我孫子/取手等），而非方向名（代代木上原/北绫濑）
      labelText = _trainDestText(p.destinationStation);
    } else if (dn) {
      labelText = _resolveStationLoose(dn) || dn;
    }
    if (!labelText) return;
    // v4.3.53x: 东急线列车等级（种别）显示——ODPT trainType → 种别名（TRAIN_TYPE_NAMES），
    // 标签格式：方向箭头 + 种别名 + 终点站（例：▼ 特急 元町・中華街）
    var _ovShow = _getLineOverride(lineId);
    if (_ovShow && _ovShow.showTrainType && p.trainType) {
      var _tdefs = window.TRAIN_TYPE_NAMES || {};
      var _td = _tdefs[p.trainType];
      // v4.3.963: 种别名表查不到时不露罗马字——直接跳过，只显示行先
      var _tname = _td ? (_td[lang] || _td.ja) : '';
      if (_tname && _tname !== 'unknown') labelText = _tname + ' ' + labelText;
    }
    // v4.3.933: 环线只显示内环/外环文字，不加箭头；普通线路用 SVG path 画三角 + 终点站名
    // （▲▼ 字符在 SVG text 里不显示——字体不支持，改用 path 画）
    var dirSym = '';
    if (!isLoopDir || _isOedoBranchTrain(lineId, p)) {
      dirSym = moveDir === 'down' ? 'down' : (moveDir === 'up' ? 'up' : '');
    }
    // v4.3.960: 方向箭头+终点站为一个整体，列车图标对标这个整体的中央（X 居中）
    var _labelY = _trainLabelY('dir', py, moveDir);
    var labelGroup = document.createElementNS(svgNS, "g");
    labelGroup.setAttribute("data-train-label-for", String(trainUid));
    labelGroup.setAttribute("data-label-pos", "dir");
    labelGroup.setAttribute("data-dir-sym", dirSym || "");
    labelGroup.setAttribute("data-label-signature", _trainLabelSignature(p, lineId));
    // 三角在 g 坐标系 (0, labelY)
    if (dirSym) {
      var tri = document.createElementNS(svgNS, "path");
      var triY = _labelY - 3;
      var triX = 0;
      var _tay = triY + 1.5;
      tri.setAttribute("fill", "#666");
      tri.setAttribute("stroke", "#666");
      tri.setAttribute("stroke-width", _isMobileView() ? "3.5" : "3");
      tri.setAttribute("stroke-linejoin", "round");
      var triD = dirSym === 'down'
        ? 'M ' + (triX - 3.5) + ' ' + (_tay - 2.5) + ' L ' + triX + ' ' + (_tay + 2.5) + ' L ' + (triX + 3.5) + ' ' + (_tay - 2.5) + ' Z'
        : 'M ' + (triX - 3.5) + ' ' + (_tay + 2.5) + ' L ' + triX + ' ' + (_tay - 2.5) + ' L ' + (triX + 3.5) + ' ' + (_tay + 2.5) + ' Z';
      tri.setAttribute("d", triD);
      tri.setAttribute("class", "train-label-tri");
      labelGroup.appendChild(tri);
    }
    // 文字在 g 坐标系 (8, labelY)
    var ldir = document.createElementNS(svgNS, "text");
    ldir.setAttribute("x", "8");
    ldir.setAttribute("y", String(_labelY));
    ldir.setAttribute("text-anchor", "start");
    ldir.setAttribute("font-size", "8");
    ldir.setAttribute("fill", "#666");
    ldir.setAttribute("class", "train-label-dir");
    ldir.textContent = labelText;
    labelGroup.appendChild(ldir);
    // append 后用 getBBox 居中在 px
    trainLayer.appendChild(labelGroup);
    try {
      var _bbox = labelGroup.getBBox();
      var _offsetX = px - (_bbox.x + _bbox.width / 2);
      labelGroup.setAttribute("transform", "translate(" + _offsetX + ",0)");
      // Cache the centering baseline (label geometry is static; only px/py move),
      // so per-frame label sync is pure attribute update, never remove+recreate.
      labelGroup.setAttribute("data-base-offset", String(-(_bbox.x + _bbox.width / 2)));
    } catch(_e) {}
  }

  // Move an already-created train label to (px,py) without rebuilding the DOM.
  // Used by the per-frame animation loop so the label tracks the carriage.
  function _moveTrainLabels(trainLayer, trainUid, px, py, p, lineId) {
    var label = trainLayer.querySelector('[data-train-label-for="' + String(trainUid).replace(/"/g, '') + '"]');
    if (!label) return;
    var moveDir = _trainMoveDir(p, lineId);
    var _labelY = _trainLabelY('dir', py, moveDir);
    var tri = label.querySelector('.train-label-tri');
    if (tri) {
      var dirSym = label.getAttribute('data-dir-sym') || '';
      var _tay = _labelY - 3 + 1.5;
      tri.setAttribute('d', dirSym === 'down'
        ? 'M ' + (-3.5) + ' ' + (_tay - 2.5) + ' L 0 ' + (_tay + 2.5) + ' L 3.5 ' + (_tay - 2.5) + ' Z'
        : 'M ' + (-3.5) + ' ' + (_tay + 2.5) + ' L 0 ' + (_tay - 2.5) + ' L 3.5 ' + (_tay + 2.5) + ' Z');
    }
    var txt = label.querySelector('.train-label-dir');
    if (txt) txt.setAttribute('y', String(_labelY));
    var _base = parseFloat(label.getAttribute('data-base-offset') || '0');
    if (!isFinite(_base)) _base = 0;
    label.setAttribute('transform', 'translate(' + (px + _base) + ',0)');
  }

  // Keep label content synchronized with the current service segment while
  // preserving cheap move-only updates during animation frames.
  function _syncTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId) {
    var existing = trainLayer.querySelector('[data-train-label-for="' + String(trainUid).replace(/"/g, '') + '"]');
    var signature = _trainLabelSignature(p, lineId);
    if (existing && existing.getAttribute("data-label-signature") !== signature) {
      existing.parentNode.removeChild(existing);
      existing = null;
    }
    if (existing) _moveTrainLabels(trainLayer, trainUid, px, py, p, lineId);
    else appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId);
  }
  
  function updateRunningInfo(el, positions) {
    var runningEl = el.querySelector('.tp-running');
    if (runningEl) {
      var running = t("trains.running");
      var cntText = t("trains.train_count");
      runningEl.innerHTML = running + " (" + positions.length + " " + cntText + ")";
    }
  }
