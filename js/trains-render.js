/* trains-render.js: 列车页 SVG 渲染（全局） */

  function _renderThroughChip(layer, ns, x, y, lineObj, iconSize, mobile) {
    var sz = _throughChipSize(lineObj, mobile);
    var label = sz.label;
    var w = sz.w - 2, h = sz.h;
    var lc = lineObj.color || "#555";
    var bg = document.createElementNS(ns, "rect");
    bg.setAttribute("x", x - 1);
    bg.setAttribute("y", y - 2);
    bg.setAttribute("width", w);
    bg.setAttribute("height", h);
    bg.setAttribute("rx", "3");
    bg.setAttribute("fill", _hexToRgba(lc, 0.16));
    bg.setAttribute("stroke", lc);
    bg.setAttribute("stroke-width", "1");
    layer.appendChild(bg);
    // Direction arrow drawn as an inline SVG path (vector, immune to font
    // glyph availability): up=∧ / down=∨ / middle=→, stroke in the line colour.
    var dir = lineObj.dir || "middle";
    var ay = y + (mobile ? 9 : 6);
    var _ax = x + 5;
    var arrowD = "";
    if (dir === "up") {
      arrowD = "M" + (_ax - 3) + "," + (ay + 4) + " L" + _ax + "," + (ay - 3) + " L" + (_ax + 3) + "," + (ay + 4);
    } else if (dir === "down") {
      arrowD = "M" + (_ax - 3) + "," + (ay - 3) + " L" + _ax + "," + (ay + 4) + " L" + (_ax + 3) + "," + (ay - 3);
    } else {
      // 向右 >：与向上/向下完全旋转对称（高 6px -3~+3，宽 6px -3~+3）
      arrowD = "M" + (_ax - 3) + "," + (ay - 3) + " L" + (_ax + 3) + "," + ay + " L" + (_ax - 3) + "," + (ay + 3);
    }
    var arr = document.createElementNS(ns, "path");
    arr.setAttribute("d", arrowD);
    arr.setAttribute("fill", "none");
    arr.setAttribute("stroke", lc);
    arr.setAttribute("stroke-width", mobile ? 2 : 1.8);
    arr.setAttribute("stroke-linecap", "round");
    arr.setAttribute("stroke-linejoin", "round");
    layer.appendChild(arr);
    var txt = document.createElementNS(ns, "text");
    txt.setAttribute("x", x + 12);
    txt.setAttribute("y", y + (mobile ? 12 : 9));
    txt.setAttribute("font-size", mobile ? 12 : 10);
    txt.setAttribute("fill", lc);
    txt.setAttribute("font-weight", "700");
    txt.textContent = label;
    layer.appendChild(txt);
    return w + 2; // consumed width (for flow layout advance)
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
    var circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", o.x);
    circle.setAttribute("cy", o.y);
    circle.setAttribute("r", isJunction ? "12" : "7"); // v4.3.499: 站圆点放大 ≥70%（普通 4→7 / 换乘 7→12）
    circle.setAttribute("fill", isJunction ? color : "#fff");
    circle.setAttribute("stroke", isJunction ? "#fff" : color);
    circle.setAttribute("stroke-width", isJunction ? "2.5" : "2");
    circle.setAttribute("data-station-index", o.si);
    staticLayer.appendChild(circle);

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
      var MAX_ROWS = (window.RuntimeConfig && window.RuntimeConfig.TRANSFER_MAX_ROWS) || 3; // v4.3.613: 2→3 行——JR 大站（东京/新宿）换乘超 8 条，截断致"同一套系统无法区分"
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
            // v4.3.613: 无图标线统一为色块徽章（LOS 官方色 + 路线记号）——替代灰色小字，
            // 与图片徽章同一套视觉语言（JR 换乘看板 = 色块+记号）
            var badgeTxt = (txl.name || txl.lineId || "").slice(0, 4);
            var bW = _badgeW(txl, isMobileView);
            var bH = isMobileView ? 15 : 11;
            var bRect = document.createElementNS(svgNS, "rect");
            bRect.setAttribute("x", tix);
            bRect.setAttribute("y", tiy);
            bRect.setAttribute("width", bW);
            bRect.setAttribute("height", bH);
            bRect.setAttribute("rx", "2");
            bRect.setAttribute("fill", txl.color || "#8a8a8a");
            staticLayer.appendChild(bRect);
            var bTxt = document.createElementNS(svgNS, "text");
            bTxt.setAttribute("x", tix + bW / 2);
            bTxt.setAttribute("y", tiy + bH / 2 + (isMobileView ? 3.2 : 2.2));
            bTxt.setAttribute("text-anchor", "middle");
            bTxt.setAttribute("font-size", isMobileView ? "9" : "6.5");
            bTxt.setAttribute("font-weight", "600");
            bTxt.setAttribute("fill", "#fff");
            bTxt.textContent = badgeTxt;
            staticLayer.appendChild(bTxt);
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
      var thruTotalW = 0;
      for (var tW = 0; tW < thruList.length; tW++) thruTotalW += _throughChipSize(thruList[tW], isMobileView).w;
      if (thruList.length > 1) thruTotalW += (thruList.length - 1) * 6;
      var _nrx = o.x - (isJunction ? 14 : 10);
      var _nmW = (stationName || "").length * (isMobileView ? 16 : 14);
      var _grpCx = (side === "dual" || side === "left") ? (_nrx - _nmW / 2) : o.x;
      var thruCursor = _grpCx - thruTotalW / 2;
      var _scs = o.stationCoords || [];
      for (var tI2 = 0; tI2 < thruList.length; tI2++) {
        var tt = thruList[tI2];
        var sz = _throughChipSize(tt, isMobileView);
        var lx, ly;
        if (tt.dir === "up") {
          lx = thruCursor;
          ly = o.y - sz.h - (side === "top" ? 28 : 16);
        }
        else if (tt.dir === "down") {
          var _extLast = null;
          if (geometry.fusionMap && _scs.length) {
            for (var _ei = _scs.length - 1; _ei >= 0; _ei--) {
              if (_scs[_ei].fusionLineId) { _extLast = _scs[_ei]; break; }
            }
          }
          var _scD = _extLast || { x: o.x, y: o.y };
          var _chipBot = iy0 + rows * ICON + (rows - 1) * GAP + 2;
          lx = thruCursor;
          ly = Math.max(_chipBot + 4, _scD.y + sz.h + 6);
        }
        else {
          if (anchor === "start") { lx = o.x - sz.w - 8; }
          else { lx = o.x + (isJunction ? 14 : 10) + 4; }
          ly = o.y - sz.h / 2 + tI2 * (sz.h + 4);
        }
        thruCursor += sz.w + 6;
        lx = Math.max(2, Math.min(lx, svgW - sz.w - 2));
        ly = Math.max(2, Math.min(ly, svgH - sz.h - 2));
        _renderThroughChip(staticLayer, svgNS, lx, ly, tt, ICON, isMobileView);
      }
    }
  }

  // v4.3.469: 推定データ注記——いずれかの列車が時刻表推定なら表示。
  // リアルタイム位置のみの路線には出さない。増分・全再構築の両パスから呼ばれる（冪等）。
  // v4.3.511: 位置を容器内 appendChild から「容器正下方（外部）」に修正（insertAdjacentElement afterend）——
  // 元実装は容器内末尾に置いており、v4.3.469 の設計意図（容器外・下方中央）と不一致だった。
  function updateEstimatedNote(el, positions) {
    try {
      // v4.3.517: 修复 note 重复堆积——note 插在 el 之后（afterend，兄弟节点），旧代码却只在
      // el 内部查 .tp-est-note（永远删不到），每次刷新/每趟推定列车都堆一个新条
      // （用户投诉"底部重复这么多次提示"）。改为清理 el 父级下全部旧 note 再插唯一一个。
      var _oldNotes = el.parentNode ? el.parentNode.querySelectorAll('.tp-est-note') : [];
      for (var _oi = 0; _oi < _oldNotes.length; _oi++) _oldNotes[_oi].remove();
      if (!positions || !positions.length) return;
      var anyEst = false;
      for (var _ei = 0; _ei < positions.length; _ei++) {
        if (positions[_ei] && positions[_ei].estimated === true) { anyEst = true; break; }
      }
      if (!anyEst) return;
      var note = document.createElement("div");
      note.className = "tp-est-note";
      note.textContent = t("trains.estimated_note") || "*Data calculated from timetable";
      el.insertAdjacentElement('afterend', note);
    } catch(e) { /* note is best-effort */ }
  }

  function renderTrainMap(el, line, lineId) {
    try {
      var positions = getRealtimePositions(lineId);
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
        updateEstimatedNote(el, positions);
        // Sync loading placeholder with the realtime page: hide it as soon as train
        // positions are available (the full-rebuild path re-inserts it when empty).
        if (positions.length > 0) {
          var _noDataEl = el.querySelector('.tp-no-data');
          if (_noDataEl) _noDataEl.remove();
        }
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
        _renderStationNode(staticLayer, svgNS, {
          x: sc.x, y: sc.y, stationId: stationId, isJunction: isJunction, color: color,
          si: si, side: sc.side || "right", geometry: geometry, isMobileView: isMobileView,
          svgW: svgW, svgH: svgH, transferMap: transferMap, stationCoords: stationCoords,
          rS: _rS,
          skipTx: false,
          tx: _bJ7 ? (geometry.rightBranch ? sc.x : (sc.x + 12)) : undefined, // v4.3.550: 有右支线时 junction 站名转圆点上方居中
          ty: _bJ7 ? (geometry.rightBranch ? (sc.y - 16) : sc.y) : undefined, // v4.3.549: 补漏 ty——junction 站名与圆点同行（此前漏传 ty，text y=undefined / 换乘 chip y=NaN）
          anchor: _bJ7 ? (geometry.rightBranch ? "middle" : "start") : undefined,
          paintOrder: (_bJ7 && geometry.rightBranch) ? "stroke" : undefined, // v4.3.550: 白描边遮主干竖线
          stroke: (_bJ7 && geometry.rightBranch) ? "#ffffff" : undefined,
          strokeWidth: (_bJ7 && geometry.rightBranch) ? 3 : undefined
        });
      }
      
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
            
            // Branch line（junction 行水平直 stub）
            var branchLine = document.createElementNS(svgNS, "line");
            branchLine.setAttribute("x1", stationCoords[junctionIdx].x);
            branchLine.setAttribute("y1", _connY);
            branchLine.setAttribute("x2", bx);
            branchLine.setAttribute("y2", _connY);
            branchLine.setAttribute("stroke", bColor);
            branchLine.setAttribute("stroke-width", "3");
            branchLine.setAttribute("opacity", "0.5");
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
          branchVLine.setAttribute("stroke-width", "3");
          branchVLine.setAttribute("opacity", "0.5");
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
          
          // Branch name
          var branchName = document.createElementNS(svgNS, "text");
          branchName.setAttribute("x", (_bSideNow === "left") ? (bx - 6) : (bx + 6));
          branchName.setAttribute("y", branchTop - 6);
          // v4.3.448: 支線名も主線の文字階層に合わせ 13→14px（独立簡略値のまま残さない）
          branchName.setAttribute("font-size", "14");
          branchName.setAttribute("fill", bColor);
          branchName.setAttribute("font-family", "Fusion Pixel, 'Courier New', monospace"); // v4.3.498: 支线名用像素字体（与全局一致）
          branchName.setAttribute("font-weight", "600");
          branchName.setAttribute("text-anchor", (_bSideNow === "left") ? "end" : "start"); // v4.3.515: 左侧支线名朝左
          var branchDisplayName = (window.RailwayDB && typeof window.RailwayDB.resolveLineName === "function") ? window.RailwayDB.resolveLineName(branch.id, window.currentLang) : (branch.nameJa || branch.name);
          branchName.textContent = branchDisplayName;
          staticLayer.appendChild(branchName);
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
      el.querySelector('.tp-map-wrap').appendChild(svg);

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
      updateTrainLayer(svg, positions, stationCoords, lineId, line);
      updateRunningInfo(el, positions);
      updateEstimatedNote(el, positions);
      
    } catch(e) {
      el.innerHTML = '<div class="tp-no-data">Error: ' + escapeHtml(e.message) + '</div>';
    }
  }
  
  /**
   * Update train layer using DOM diff (update existing, create new, remove missing)
   * Uses cached stationCoords - never recomputes geometry
   */
  function updateTrainLayer(svg, positions, stationCoords, lineId, line) {
    var trainLayer = svg.querySelector('.train-layer');
    if (!trainLayer) return;
    
    var svgNS = "http://www.w3.org/2000/svg";
    var isLoop = stationCoords.length > 2 && (line.type === "loop" || line.isSixShapedLoop);
    
    // Count trains per station for offset
    var stationCount = {};
    var stationIdx = {};
    for (var pi0 = 0; pi0 < positions.length; pi0++) {
      var idx0 = Math.min(positions[pi0].stationIndex || 0, stationCoords.length - 1);
      stationCount[idx0] = (stationCount[idx0] || 0) + 1;
    }
    
    var updatedIds = {};
    
    for (var pi = 0; pi < positions.length; pi++) {
      var p = positions[pi];
      // v4.3.446: 支线融合列车——画在支线站列（branchGeom）上，与主线留出距离
      var coord = null;
      if (p.fusionLineId) {
        var _bg = svg.__branchGeom || null;
        if (_bg && _bg[p.fusionLineId]) {
          var _bii = Math.min(p.stationIndex || 0, _bg[p.fusionLineId].length - 1);
          coord = _bg[p.fusionLineId][_bii];
        }
      }
      if (!coord) {
        // v4.3.409: 融合机制——延伸线（fusionLineId）列车按延伸几何 baseIdx 偏移
        var idx;
        if (p.fusionLineId) {
          var fm = _fusionBaseIdx(lineId, p.fusionLineId);
          idx = fm >= 0 ? fm + (p.stationIndex || 0) : (p.stationIndex || 0);
        } else {
          idx = p.stationIndex || 0;
        }
        idx = Math.min(idx, stationCoords.length - 1);
        coord = stationCoords[idx];
      }
      if (!coord) continue;
      
      var px = coord.x;
      var py = coord.y;
      
      // Offset multiple trains at same station
      var trainIdxAt = stationIdx[idx] || 0;
      stationIdx[idx] = trainIdxAt + 1;
      var totalAt = stationCount[idx] || 1;
      var direction = p.railDirection || '';
      var offX = 0, offY = 0;
      
      if (isLoop) {
        if (direction.indexOf('Inner') >= 0) offY = -8;
        else if (direction.indexOf('Outer') >= 0) offY = 8;
        offX = (trainIdxAt - (totalAt - 1) / 2) * 20;
      } else {
        if (direction.indexOf('Inbound') >= 0 || direction.indexOf('Inner') >= 0) offX = -10;
        else if (direction.indexOf('Outbound') >= 0 || direction.indexOf('Outer') >= 0) offX = 10;
        offX += (trainIdxAt - (totalAt - 1) / 2) * 18;
      }
      
      px += offX;
      py += offY;
      
      var trainUid = (p.trainId || ("train_" + pi)) + "_" + (p.stationIndex || 0);
      updatedIds[trainUid] = true;
      
      var existingIcon = trainLayer.querySelector('[data-train-id="' + String(trainUid).replace(/"/g, '') + '"]');
      
      if (existingIcon) {
        // Update existing icon position
        var oldX = parseFloat(existingIcon.getAttribute('x'));
        var oldY = parseFloat(existingIcon.getAttribute('y'));
        var newX = px - 7;
        var newY = py - 9;
        if (Math.abs(oldX - newX) > 0.5 || Math.abs(oldY - newY) > 0.5) {
          existingIcon.setAttribute('x', newX);
          existingIcon.setAttribute('y', newY);
        }
        // v4.3.454/455: 终点/方向标签跟随列车移动（位置随移动方向）
        var _mvDir = _trainMoveDir(p, lineId);
        var _lb = trainLayer.querySelectorAll('[data-train-label-for="' + String(trainUid).replace(/"/g, '') + '"]');
        for (var _li = 0; _li < _lb.length; _li++) {
          _lb[_li].setAttribute('x', px);
          _lb[_li].setAttribute('y', _trainLabelY(_lb[_li].getAttribute('data-label-pos'), py, _mvDir));
        }
      } else {
        // Create new train icon
        var iconSrc = (window.TrainIcons && typeof window.TrainIcons.getTrainIcon === "function") ? window.TrainIcons.getTrainIcon(p.fusionLineId || lineId, line.operator, trainUid, p.stationIndex, p.trainType) : "";
        var isEst = p.estimated === true;
        var iconCls = isEst ? "train-icon estimated" : "train-icon";
        
        if (iconSrc) {
          var newIcon = document.createElementNS(svgNS, "image");
          newIcon.setAttribute("data-train-id", String(trainUid));
          newIcon.setAttribute("x", String(px - 7));
          newIcon.setAttribute("y", String(py - 9));
          newIcon.setAttribute("width", "14");
          newIcon.setAttribute("height", "18");
          newIcon.setAttribute("href", iconSrc);
          newIcon.setAttribute("class", iconCls);
          newIcon.setAttribute("preserveAspectRatio", "xMidYMid meet");
          // v4.3.53x: 列车信息工具提示（种别/车型/行先）——车型取 manual vehicleType，无则回退 trainClass
          var _tip = [];
          if (p.trainType) {
            var _tdefs = window.TRAIN_TYPE_NAMES || {};
            var _td = _tdefs[p.trainType];
            _tip.push(_td ? (_td[window.currentLang] || _td.ja || String(p.trainType).split('.').pop()) : String(p.trainType).split('.').pop());
          }
          if (p.vehicleType) _tip.push(p.vehicleType);
          else if (p.trainClass) _tip.push(p.trainClass);
          if (p.destinationStation) _tip.push(_trainDestText(p.destinationStation));
          if (_tip.length) newIcon.setAttribute("title", _tip.join(" | "));
          // v4.3.6xx: 方向翻转——非环线 Outbound（下行）列车图标水平翻转
          // Inbound（上行）保持原方向（车头向右），Outbound（下行）车头向左
          // SVG image 翻转：translate 到中心后 scale(-1,1) 再 translate 回来
          if (!isLoop && direction.indexOf('Outbound') >= 0) {
            var centerX = px;
            var centerY = py;
            newIcon.setAttribute('transform', 'translate(' + centerX + ', ' + centerY + ') scale(-1, 1) translate(' + (-centerX) + ', ' + (-centerY) + ')');
          }
          trainLayer.appendChild(newIcon);
          appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId);
        } else {
          // Fallback: circle icon
          var newCircle = document.createElementNS(svgNS, "g");
          newCircle.setAttribute("data-train-id", String(trainUid));
          newCircle.setAttribute("class", iconCls);
          
          var outerCircle = document.createElementNS(svgNS, "circle");
          outerCircle.setAttribute("cx", px);
          outerCircle.setAttribute("cy", py);
          outerCircle.setAttribute("r", "8");
          outerCircle.setAttribute("fill", color);
          outerCircle.setAttribute("opacity", "0.9");
          newCircle.appendChild(outerCircle);
          
          var innerCircle = document.createElementNS(svgNS, "circle");
          innerCircle.setAttribute("cx", px);
          innerCircle.setAttribute("cy", py);
          innerCircle.setAttribute("r", "3");
          innerCircle.setAttribute("fill", "#fff");
          newCircle.appendChild(innerCircle);
          
          trainLayer.appendChild(newCircle);
          appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId);
        }
      }
    }
    
    // Remove icons for trains that no longer exist
    // v4.3.454: 兼容终点/方向标签（data-train-label-for 与图标同 uid 清理）
    var allIcons = trainLayer.querySelectorAll('[data-train-id], [data-train-label-for]');
    for (var ii = 0; ii < allIcons.length; ii++) {
      var tid = allIcons[ii].getAttribute('data-train-id') || allIcons[ii].getAttribute('data-train-label-for');
      if (!updatedIds[tid]) {
        allIcons[ii].parentNode.removeChild(allIcons[ii]);
      }
    }
  }

  // v4.3.454: 列车终点/方向标签——方向在上（7px #999）、终点在下（8px #666）
  // 站名解析带归一化兜底：ODPT 站 ID 无连字符（KiyosumiShirakawa）vs 项目站 ID 连字符
  // （Kiyosumi-Shirakawa）——去连字符+小写匹配项目站表后按项目 ID 解析显示名
  function _resolveStationLoose(id) {
    if (!id) return '';
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

  // v4.3.473: 方位词（Northbound/Southbound/Eastbound/Westbound）→ 站表方向映射。
  // +1 = 该方位词的列车沿站表正向行驶（方向端点在站表后部）→ ▼（标签在图标下方）
  // -1 = 沿站表反向行驶（方向端点在站表前部）→ ▲（标签在图标上方）
  // 判定依据：2026-09-10 ODPT odpt:Train 实时样本（odpt:fromStation→odpt:toStation 沿站表 index 增减，
  // 各条目样本 100% 一致）。站表方向以 railway_data.json 冻结站表为准。
  // 未列入的线路/方向保持 ▶ 兜底（不猜测方向）。
  var DIR_AXIS_MAP = {
    // ---- JR-East ----
    KeihinTohoku:   { Northbound: -1, Southbound: +1 }, // 站表 大宮→大船：北行=大宮（站表前）
    ChuoSobuLocal:  { Eastbound: +1, Westbound: -1 },   // 站表 三鷹→千葉：東行=千葉（站表后）
    Saikyo:         { Northbound: +1, Southbound: -1 }, // 站表 大崎→大宮：北行=大宮（站表后）
    Kawagoe:        { Southbound: -1 },                 // 站表 大宮→日進→西大宮→…→川越：南行=大宮方向（站表前）
    ShonanShinjuku: { Northbound: -1, Southbound: +1 }, // 站表 大宮→小田原：北行=大宮（站表前）
    // ---- Toei ----
    Asakusa:        { Northbound: +1, Southbound: -1 }, // 站表 西馬込→押上：北行=押上（站表后）
    Mita:           { Northbound: +1, Southbound: -1 }, // 站表 目黒→西高島平：北行=高島平（站表后）
    Shinjuku:       { Eastbound: +1, Westbound: -1 }    // 站表 新宿→本八幡：東行=本八幡（站表后）
  };

  function _isLoopDirName(dirName) {
    if (!dirName) return false;
    return !!LOOP_DIR_NAMES[String(dirName).split('.').pop()];
  }

  // v4.3.475: 大江户线（6字形）光丘段列车识别。
  // 站表 [0]=Tochomae（环线/光丘段枢纽）、[1..10]=光丘段（西新宿五丁目→光丘，竖直开放尾）。
  // 光丘段列车虽被 ODPT 标成 InnerLoop/OuterLoop，但没有"回り"语义——应显示真实终点（光丘/都厅前）。
  function _isOedoBranchTrain(lineId, p) {
    if (lineId !== 'Oedo' || !p) return false;
    var si = p.stationIndex || 0;
    if (si >= 1 && si <= 10) return true; // 当前位置在光丘段
    if (si === 0) {
      // 都厅前枢纽出发的车：dest=光丘 则进入光丘段；dest=都厅前 是环线折返
      var _d0 = String(p.destinationStation || '').split('.').pop();
      if (/^Hikarigaoka$/i.test(_d0)) return true;
    }
    return false;
  }

  function _trainMoveDir(p, lineId) {
    var dn = String(p.railDirection || '').split('.').pop();
    // v4.3.475: 大江户线光丘段列车先于环线判定——tail 从都厅前竖直向上延伸到光丘，
    // 屏幕方向与站表 index 相反：往光丘=屏幕上方=▲、往都厅前=屏幕下方=▼。
    // v4.3.476: 光丘段区间车（光丘始发→环线，dest 为环线站如 清澄白河/都厅前 而非光丘）——
    // 终点非光丘即沿光丘段往都厅前方向移动（光丘段只有往返两向），一律 ▼。
    if (_isOedoBranchTrain(lineId, p)) {
      var _dest = String(p.destinationStation || '').split('.').pop();
      if (/^Hikarigaoka$/i.test(_dest)) return 'up';
      return 'down';
    }
    if (/^(InnerLoop|Inner|OuterLoop|Outer)$/.test(dn)) return null;
    if (/^Inbound$/.test(dn)) return 'up';
    if (/^Outbound$/.test(dn)) return 'down';
    // v4.3.473: 方位词用线路映射表判定（未建表线路返回 null → ▶ 兜底）
    if (/^(Northbound|Southbound|Eastbound|Westbound)$/.test(dn)) {
      var axis = (DIR_AXIS_MAP[lineId] && DIR_AXIS_MAP[lineId][dn]);
      if (axis === undefined) return null;
      return axis > 0 ? 'down' : 'up';
    }
    if (!dn) return null;
    var cur = p.stationIndex || 0;
    var sts = (window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) ? (window.UNIFIED_LINES[lineId].stations || []) : [];
    var normTail = String(dn).replace(/-/g, '').toLowerCase();
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

  function appendTrainLabels(trainLayer, svgNS, trainUid, px, py, p, lineId) {
    var moveDir = _trainMoveDir(p, lineId);
    var isLoopDir = _isLoopDirName(p.railDirection);
    var dn = String(p.railDirection || '').split('.').pop();
    var lang = window.currentLang || 'ja';
    // v4.3.471: 单标签——箭头 + 方向端点站名；不再单独显示"上下行"方向词与终点。
    // 抽象方向词（Inbound/Outbound/Northbound 等无方向端点站）→ 用终点站名；环线 → 内回/外回。
    var labelText = '';
    // v4.3.475: 大江户线光丘段列车显示真实终点（光丘/都厅前），不走环线"内回/外回"标签
    if (_isOedoBranchTrain(lineId, p)) {
      labelText = _trainDestText(p.destinationStation);
    } else if (isLoopDir) {
      labelText = (LOOP_DIR_NAMES[dn] && LOOP_DIR_NAMES[dn][lang]) || (LOOP_DIR_NAMES[dn] ? LOOP_DIR_NAMES[dn].ja : '');
    } else if (/^(Inbound|Outbound|Northbound|Southbound|Eastbound|Westbound)$/.test(dn)) {
      labelText = _trainDestText(p.destinationStation);
    } else if (dn) {
      labelText = _resolveStationLoose(dn) || dn;
    }
    if (!labelText) return;
    // v4.3.53x: 东急线列车等级（种别）显示——ODPT trainType → 种别名（TRAIN_TYPE_NAMES），
    // 标签格式：方向箭头 + 种别名 + 终点站（例：▼ 特急 元町・中華街）
    if (lineId.indexOf('Tokyu') === 0 && p.trainType) {
      var _tdefs = window.TRAIN_TYPE_NAMES || {};
      var _td = _tdefs[p.trainType];
      var _tname = _td ? (_td[lang] || _td.ja) : String(p.trainType).split('.').pop();
      if (_tname && _tname !== 'unknown') labelText = _tname + ' ' + labelText;
    }
    // v4.3.6xx: 环线只显示内环/外环文字，不加箭头；普通线路用▲▼上下箭头 + 终点站名
    var dirSym = '';
    if (!isLoopDir || _isOedoBranchTrain(lineId, p)) {
      // 普通直线：Inbound=▲（往上走/往上行）、Outbound=▼（往下走/往下行）
      dirSym = moveDir === 'down' ? '▼' : (moveDir === 'up' ? '▲' : '');
    }
    var ldir = document.createElementNS(svgNS, "text");
    ldir.setAttribute("data-train-label-for", String(trainUid));
    ldir.setAttribute("data-label-pos", "dir");
    ldir.setAttribute("x", String(px));
    ldir.setAttribute("y", String(_trainLabelY('dir', py, moveDir)));
    ldir.setAttribute("text-anchor", "middle");
    ldir.setAttribute("font-size", "8");
    ldir.setAttribute("fill", "#666");
    ldir.setAttribute("class", "train-label-dir");
    ldir.textContent = dirSym + labelText;
    trainLayer.appendChild(ldir);
  }
  
  function updateRunningInfo(el, positions) {
    var runningEl = el.querySelector('.tp-running');
    if (runningEl) {
      var running = t("trains.running");
      var cntText = t("trains.train_count");
      runningEl.innerHTML = running + " (" + positions.length + " " + cntText + ")";
    }
  }
