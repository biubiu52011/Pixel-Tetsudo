/* trains-geometry.js: 列车页几何计算（全局） */

  /**
   * Find shared (parallel track) sections with other lines.
   * Industry standard (Tokyo Metro official map): shared sections are drawn as
   * twin parallel lines in each line's own colour.
   */
  // 真正線路共用（同一軌道を複数路線が運行）——站点重合 ≠ 共线。
  // 只有以下线对才画并行双线（industry-standard 線路共用区間）:
  //   Yurakucho x Fukutoshin : 和光市-池袋（氷川台・小竹向原含む全9駅、公式駅順、2026-09-07 データ修正）
  //   Namboku x Mita        : 目黒-白金高輪
  var _SHARED_TRACK_PAIRS = {
    'Yurakucho': ['Fukutoshin'],
    'Fukutoshin': ['Yurakucho'],
    'Namboku': ['Mita'],
    'Mita': ['Namboku']
  };
  function _findSharedSegments(line, allLines) {
    var lineId = line.id || line.lineId || line.name;
    var stLines = {};
    var lids = Object.keys(allLines);
    for (var li = 0; li < lids.length; li++) {
      var ll = allLines[lids[li]];
      if (!ll || !ll.stations) continue;
      for (var si = 0; si < ll.stations.length; si++) {
        (stLines[ll.stations[si]] = stLines[ll.stations[si]] || []).push(lids[li]);
      }
    }
    var stations = line.stations || [];
    var segs = [], cur = null;
    for (var i = 0; i < stations.length - 1; i++) {
      var la = stLines[stations[i]] || [], lb = stLines[stations[i + 1]] || [];
      var allowed = _SHARED_TRACK_PAIRS[lineId] || [];
      var shared = null;
      for (var k = 0; k < la.length; k++) {
        if (la[k] !== lineId && allowed.indexOf(la[k]) >= 0 && lb.indexOf(la[k]) >= 0) { shared = la[k]; break; }
      }
      if (shared) {
        if (cur && cur.partner === shared && cur.end === i) { cur.end = i + 1; }
        else { if (cur) segs.push(cur); cur = { partner: shared, start: i, end: i + 1 }; }
      } else { if (cur) { segs.push(cur); cur = null; } }
    }
    if (cur) segs.push(cur);
    return segs;
  }

  // v4.3.520: 支线 junction 站解析——支线站表中第一个出现在主干站表的站。
  // 支持 junction 在支线站表首位（鹤见线海芝浦/大川、成田线空港支线）或**末位**
  // （成田线我孫子支线 [我孫子…下総松崎,成田]，junction 成田在最后——旧代码只查
  // stations[0] 导致整条支线不渲染）。返回 { station, at } 或 null。
  function _branchJunctionStation(branchStations, mainStations) {
    try {
      if (!branchStations || !branchStations.length || !mainStations || !mainStations.length) return null;
      var _bm = {};
      for (var _iM = 0; _iM < mainStations.length; _iM++) _bm[mainStations[_iM]] = true;
      for (var _iB = 0; _iB < branchStations.length; _iB++) {
        if (_bm[branchStations[_iB]]) return { station: branchStations[_iB], at: _iB };
      }
      return null;
    } catch(e) { return null; }
  }

  function computeRouteGeometry(line, lineId) {
    // Check cache first
    if (_routeGeometryCache[_geomKey(lineId)] && _routeGeometryCache[_geomKey(lineId)].lineHash === _computeLineHash(line)) {
      return _routeGeometryCache[_geomKey(lineId)];
    }
    
    var stations = line.stations || [];
    var color = line.color || "#008803";
    var isLoop = line.type === "loop";
    var isSixShapedLoop = line.isSixShapedLoop === true;
    // Transfer map for interchange station icons (single source; read-only)
    var transferMap = _getTransferMap(lineId);
    // Room for boxed through-service labels at line ends: ∧ label sits ABOVE the
    // start station, ∨ label BELOW the last station.
    var thrTopPad = 0, thrBotPad = 0;
    if (stations.length > 1) {
      if (_throughDirForStation(lineId, stations[0])) thrTopPad = 26;
      if (_throughDirForStation(lineId, stations[stations.length - 1])) thrBotPad = 26;
    }
    // v4.3.847-850: 站间距标准 = 换乘图标的高 + 一点空隙（共同规则 5.4.1.5，所有画法一致）——
    // 换乘图标的高 = 行数 × 行高 ROW_H(18px/行 = ICON16+GAP2，5.4.1.11)；行数 = ⌈min(换乘数,16)÷4⌉（每行最多 4 个、行数上限 4
    // = RuntimeConfig.TRANSFER_MAX_ROWS，4×4=16 个图标上限，用户裁定 4.3.849；溢出 "+n"；
    // 行数上限若再调，同步 min 值）。一点空隙 SP_GAP=32（= ICON16 + 顶隙6 + 底距12，chip 底部与
    // 下一站圆点顶缘可见空隙 17-23px）。站间距 = 全线各站换乘图标的高最大值 + 空隙（移动/桌面统一，
    // 不再按站数分档）；环线双列 _colPitch 同式复用。
    var ROW_H = 18, SP_GAP = 32; // v4.3.857: 28→32（用户：有点近；3行留7px缝/2行9/1行11）
    var _chipPitch = function(ids) {
      var mx = ROW_H + SP_GAP;
      for (var _cp = 0; _cp < ids.length; _cp++) {
        var _txN = (transferMap[ids[_cp]] || []).filter(function(t) { return !t.through; }).length;
        var _rows = Math.ceil(Math.min(_txN, 16) / 3); // v4.3.877: 4→3（窄列 PER_ROW 降级保守值，防 chip 超高重叠）
        mx = Math.max(mx, _rows * ROW_H + SP_GAP);
      }
      return mx;
    };
    var sp = _chipPitch(stations);
    var topP = 18 + thrTopPad, botP = 16 + thrBotPad;
    // v4.3.855: 主直线**全线统一**定距（用户：要统一站间距，回退 v4.3.854 逐段）——每段 = sp（全线 max）。
    var _spRows = [];
    for (var _sr = 0; _sr < stations.length; _sr++) {
      var _txN = (transferMap[stations[_sr]] || []).filter(function(t) { return !t.through; }).length;
      _spRows.push(Math.max(1, Math.ceil(Math.min(_txN, 16) / 4)));
    }
    var _spSeg = [];
    for (var _sr2 = 0; _sr2 < stations.length; _sr2++) _spSeg.push(sp); // v4.3.855: 全线统一 sp
    var _yAt = function(i) { var y = topP; for (var _yi = 0; _yi < i && _yi < _spSeg.length; _yi++) y += _spSeg[_yi]; return y; };
    
    // Get branch lines
    var allLines = getLinesData();
    var branchLines = [];
    for (var bid in allLines) {
      if (allLines[bid].branchOf === lineId && bid !== lineId) {
        var bl = allLines[bid];
        branchLines.push({ id: bid, name: bl.name || bid, color: (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(bid)) || bl.color || color, stations: bl.stations });
      }
    }
    // v4.3.550: 双支线及以上**左右分侧**（用户："成田线现在这样可读性很差"——三条竖线全挤左侧、
    // 空港 2 站也被长支线拖成拐弯竖列）——每条支线独立画法：非 junction 站 ≤4 → 水平直线横排（h），
    // >4 → 竖列（v）；竖列支线放左、横排支线放右（全部横排时保持全左，鹤见线不回归）；
    // junction 站名在存在右支线时转圆点上方+白描边遮线（两侧都被占，renderTrainMap 实现）。
    var _branchModes = []; // 每支线 'h' 横排 / 'v' 竖列
    var _hasVCol = false;
    for (var _bmi = 0; _bmi < branchLines.length; _bmi++) {
      var _bmSt = branchLines[_bmi].stations || [];
      var _bmJ = _bmSt.length ? _branchJunctionStation(_bmSt, stations) : null;
      var _bmN = _bmJ ? (_bmSt.length - 1) : _bmSt.length;
      // 单支线保持右侧弯折（现状：丸ノ内方南町/千代田北綾瀬）——不启用横排
      var _bmode = (branchLines.length >= 2 && _bmN <= 4) ? 'h' : 'v';
      _branchModes.push(_bmode);
      if (_bmode === 'v') _hasVCol = true;
    }
    // 位置规则：竖列支线在左；横排支线在右（仅当存在竖列支线时）；全部横排（鹤见线）保持全左现状。
    var _bSide = function(_i6b) {
      if (branchLines.length < 2) return "right";
      if (_branchModes[_i6b] === 'v') return "left";
      return _hasVCol ? "right" : "left";
    };
    var _bCol = function(_i6b) { // 同侧内列序号
      var _c = 0;
      for (var _ci = 0; _ci < _i6b; _ci++) {
        if (_bSide(_ci) === _bSide(_i6b)) _c++;
      }
      return _c;
    };
    // 全横排（鹤见线）标志：兼容 _leftNeedH 与旧渲染路径
    var _branchH = (branchLines.length >= 2) && !_hasVCol;
    var _rightCols = 0, _leftCols = 0;
    for (var _ci2 = 0; _ci2 < branchLines.length; _ci2++) {
      if (_bSide(_ci2) === "left") _leftCols++; else _rightCols++;
    }
    var _branchStubL = 0, _branchMaxNameW = function(_sd6) {
      var _mx6 = 0;
      for (var _bi3 = 0; _bi3 < branchLines.length; _bi3++) {
        if (_bSide(_bi3) !== _sd6) continue;
        var _bl3 = branchLines[_bi3];
        if (!_bl3.stations) continue;
        for (var _bs3 = 0; _bs3 < _bl3.stations.length; _bs3++) {
          var _bn3 = (window.RailwayDB && window.RailwayDB.resolveStationName)
            ? (window.RailwayDB.resolveStationName(_bl3.stations[_bs3], window.currentLang) || _bl3.stations[_bs3])
            : _bl3.stations[_bs3];
          _mx6 = Math.max(_mx6, (_bn3 || "").length * 16 * 1.1);
        }
      }
      return _mx6;
    };
    if (_leftCols > 0) {
      var _mainMaxW = 0;
      for (var _mw = 0; _mw < stations.length; _mw++) {
        var _mn = (window.RailwayDB && window.RailwayDB.resolveStationName)
          ? (window.RailwayDB.resolveStationName(stations[_mw], window.currentLang) || stations[_mw])
          : stations[_mw];
        _mainMaxW = Math.max(_mainMaxW, (_mn || "").length * 16 * 1.1);
      }
      _branchStubL = _mainMaxW + 22; // 主干站名朝左偏移 12（side=dual）+ gap 10
    }
    // v4.3.553: "插线叉出去那一部分也要算站间距"——右侧支线水平叉出段（stub）≥ 标准站间距：
    // 原固定 20px 使单支线（南武線浜川崎/丸ノ内方南町/千代田北綾瀬）竖列紧贴主线，视觉像
    // 双线并行；改为 ≥ sp 后支线与主干间距 = 一个站间距，与横排/竖列"算站间距"规则统一。
    var _branchStubR = Math.max(GEOM.BRANCH_STUB, sp);
    // v4.3.516: 左侧列距动态化——列 1 竖线不穿列 0 名带（列 0 名带右缘=bx0-10，列 1 竖线=bx0-列距，需 gap ≥ 4）
    var _branchColW = _leftCols > 0 ? Math.max(GEOM.BRANCH_COL_W, _branchMaxNameW("left") + 14) : GEOM.BRANCH_COL_W;
    // v4.3.522: 横排站距 = 全支线最宽站名文本宽 + 12（"支线宽度取决于文本最多的那个"——
    // 横排时相邻站名不重叠所需的最小站距）。v4.3.550: 须在 _rightNeed 之前定义（var 提升陷阱）。
    // v4.3.551: "所有插线叉出去那一部分也要算站间距"——横排站距 = 最宽名 + 标准站间距(sp)：
    // v4.3.551: "所有插线叉出去那一部分也要算站间距"——横排站距 = 最宽名 + 标准站间距(sp)：
    // 竖列支线站距本就 = sp（算站间距），横排此前只 +12 文本 padding 未算站间距；改为 +sp 后
    // 横排站名间空隙 = sp，与主干/竖列的站间距视觉统一。
    // v4.3.607: "成田线别把机场的两个站拉得这么远"——长站名（机场第2航站楼 6字）下
    // 最宽名+sp 双倍惩罚（~195px/段）；改为 max(sp, 最宽名+12)：站距保底 = sp（仍算站间距），
    // 长站名只加文本 padding 不再叠加 sp。空港支线 195→118px/段，短站名支线（鹤见）不变。
    var _branchHSp = (_branchH || _hasVCol) ? Math.max(sp, Math.max(_branchMaxNameW("left"), _branchMaxNameW("right")) + 12) : 0;
    var _leftNeed = _leftCols > 0 ? (_branchStubL + (_leftCols - 1) * _branchColW + 10 + _branchMaxNameW("left") + 2) : 0;
    var _rightNeed = 0;
    if (_rightCols > 0) {
      if (branchLines.length >= 2) {
        // v4.3.550: 右横排支线需求 = 横排长（站数×站距）+ 站名带 + 余量
        for (var _rn = 0; _rn < branchLines.length; _rn++) {
          if (_bSide(_rn) !== "right") continue;
          var _rSt = branchLines[_rn].stations || [];
          var _rJ = _rSt.length ? _branchJunctionStation(_rSt, stations) : null;
          var _rN = _rJ ? (_rSt.length - 1) : _rSt.length;
          _rightNeed = Math.max(_rightNeed, _rN * _branchHSp + 12 + _branchMaxNameW("right") + 2);
        }
      } else {
        _rightNeed = _branchStubR + 10 + _branchMaxNameW("right") + 2; // 单支线（现状）
      }
    }
    var branchOffset = branchLines.length > 0 ? GEOM.BRANCH_COL_W * branchLines.length : 0;
    // Branch name label sits 26px above the junction station (industry-standard
    // branch annotation). Reserve headroom when the junction is the first station.
    if (branchLines.length > 0) {
      for (var _b1 = 0; _b1 < branchLines.length; _b1++) {
        if (branchLines[_b1].stations && branchLines[_b1].stations.length > 0 && stations.indexOf(branchLines[_b1].stations[0]) === 0) {
          topP += 26; break;
        }
      }
    }
    
    var svgW, svgH;
    var stationCoords = []; // Array of {x, y, side, stationId}
    var routeElements = []; // SVG elements for route lines (static layer)
    
    if (isSixShapedLoop && stations.length > 2) {
      // Six-shaped loop: "loop + tail" structure (not two loops)
      // Hikarigaoka direction = open vertical tail, Tochomae direction = closed rectangular loop
      var hikarigaokaIdx = stations.indexOf("Hikarigaoka");
      if (hikarigaokaIdx === -1) hikarigaokaIdx = Math.floor(stations.length / 3);
      
      var hikarigaokaStations = stations.slice(0, hikarigaokaIdx + 1); // [0]=Tochomae (junction)
      var loopStations = [stations[0]].concat(stations.slice(hikarigaokaIdx + 1));
      
      // ============ Size calculation ============
      // v4.3.543: 桌面画布基准固定（820）——环宽恒定（viewBox 内容密度基线，显示层 v4.3.546 容器适配）。
      // v4.3.545: 移动端画布=容器内容宽（1:1 密度基线，无横向滚动）。
      var _cw6;
      if (_isMobileView()) {
        var _mcw6 = ((typeof document !== "undefined" && document.querySelector("#trainsMapContainer")) || {}).clientWidth || 360;
        _cw6 = Math.max(_mcw6 - 16, 320);
      } else {
        _cw6 = GEOM.MAIN_BASE_W_MAX;
      }
      var _cw6Content = _cw6;
      // v4.3.483c: 缩放系数对齐山手线 loopScale（移动 1.5 / 桌面 1.6）。
      // v4.3.496: 用户裁定环线标准宽度——六形环圆环部分与山手线统一（48 基准，移动 72px/桌面 76.8px）。
      var scale6 = _isMobileView() ? 1.5 : 1.6;
      var spLoop6 = _isMobileView() ? 39 : 41.6;
      var loopRectW = _isMobileView() ? 63 : 67.2; // v4.3.881: 环宽基准 48→42 // v4.3.496: 环宽对齐山手线标准（48 基准），给光丘尾留水平空间
      // v4.3.502: 六形环环段改左右二分（双列）——环高用山手线公式（站数/2 列 × 36 基准 −80），
      // 并按各列最宽换乘 chip 高度动态放大（_colPitch6，与山手线 _colPitch 同款）。
      var loopRectH = Math.max(loopStations.length * 36 / 2 - 80, 140) * scale6;
      var _colPitch6 = function(ids) { return _chipPitch(ids); }; // v4.3.847: 复用共同规则 _chipPitch（5.4.1.5）
      var _loopN = loopStations.length;
      // v4.3.504: 支线从环左侧 1/2 处展开（参考车站实际位置——都庁前在环左半）：
      // Tochomae(junction) 在左列第 7 位（环左缘、中点偏上 0.5/14×rectH，最接近 1/2 处）；
      // 左列（顶→下）= [S32..S37, Tochomae, S11..S17]（14 站）、右列（顶→下）= [S18..S31]（14 站）。
      var _halfN = Math.ceil(_loopN / 2); // 28 → 14/14
      var _juncIdx6 = Math.floor((_halfN - 1) / 2); // Tochomae 左列索引（6 = 第 7 位）
      var _leftIds6 = [], _rightIds6 = [];
      for (var _s6 = 0; _s6 < _juncIdx6; _s6++) _leftIds6.push(loopStations[_loopN - _juncIdx6 + _s6]); // S32..S37（环段尾）
      _leftIds6.push(loopStations[0]); // Tochomae
      for (var _s6b = 0; _s6b < _halfN - 1 - _juncIdx6; _s6b++) _leftIds6.push(loopStations[1 + _s6b]); // S11..S17（环段头）
      var _rightStart = 1 + (_halfN - 1 - _juncIdx6); // 8 → S18
      for (var _s6c = 0; _s6c < _halfN; _s6c++) _rightIds6.push(loopStations[_rightStart + _s6c]); // S18..S31
      var _pitch6 = Math.max(_colPitch6(_leftIds6), _colPitch6(_rightIds6));
      // 左右列各 14 站（站距 rectH/14），与 v4.3.502 站距密度一致。
      var _needH6 = _pitch6 * (_halfN - 1);
      if (_needH6 > loopRectH) loopRectH = _needH6;
      
      var leftMargin = _isMobileView() ? 12 : 12.8;
      // v4.3.502: 双列后右列站名朝外（anchor=start），marginRight 需容纳站名——
      // 移动 92 / 桌面 84（右列站名空间 = marginRight−16 ≥ 68px，4 字站名全尺寸显示）。
      var marginRight = _isMobileView() ? 30 : 32 + (_isMobileView() ? 64 : 84);
      var marginTopBot = _isMobileView() ? 60 : 64;
      // v4.3.482: tail 列宽与直线支线同源（GEOM.BRANCH_COL_W × 本图缩放系数）。
      // 移动端容器是 1:1 硬约束，tail 列让位给环（保底 BRANCH_COL_W×1.1 ≈ 现状 105px）。
      // v4.3.514: 支线宽度取决于文本最多的那个站（用户指示）——不硬编码 105.6/88，
      // 动态扫描光丘尾列（stub 前 10 站）与左列上方站名的最大文字宽（字数×16×1.1，与
      // _pickSixLabelSide 同源）；语言切换/站名变化时 stubX 与 tailCap 自适应。
      var _sixNameW = function(_id6) {
        var _n6 = (window.RailwayDB && window.RailwayDB.resolveStationName)
          ? (window.RailwayDB.resolveStationName(_id6, window.currentLang) || _id6) : _id6;
        return (_n6 || "").length * 16 * 1.1;
      };
      var _tailWidest = 0;
      for (var _tw6 = 1; _tw6 < hikarigaokaStations.length; _tw6++)
        _tailWidest = Math.max(_tailWidest, _sixNameW(hikarigaokaStations[_tw6]));
      var _leftTopWidest = 0;
      for (var _lw6 = 0; _lw6 < _juncIdx6; _lw6++)
        _leftTopWidest = Math.max(_leftTopWidest, _sixNameW(_leftIds6[_lw6]));
      // v4.3.513: 光丘尾竖线不穿左列上方站名——桌面 tail 列扩到"竖线右侧容纳左列上方 5 字
      // 全尺寸文字带"（三区分离：光丘尾文字带|竖线|左列上方文字带|环，junctionX≥stubX+10+88+10）；
      // 移动端容器 1:1 硬约束下 tailCap 保持现状（剩余穿线站名用白色描边遮线，见 _renderStationNode）。
      var _tailCap = _isMobileView()
        ? _isMobileView() ? 144 : 153.6
        : Math.max(GEOM.BRANCH_COL_W * 1.6, 10 + _tailWidest + 10 + _leftTopWidest + 10);
      var tailAreaWidth = Math.min(_tailCap,
                                   Math.max(GEOM.BRANCH_COL_W * 1.1,
                                            _cw6Content - leftMargin - loopRectW - marginRight));
      
      var naturalW = leftMargin + tailAreaWidth + loopRectW + marginRight;
      if (_isMobileView()) {
        loopRectW = Math.max(_cw6Content - leftMargin - tailAreaWidth - marginRight, _isMobileView() ? 63 : 67.2);
      } else if (naturalW > _cw6Content) {
        loopRectW = Math.max(_cw6Content - leftMargin - tailAreaWidth - marginRight, _isMobileView() ? 63 : 67.2);
      }
      svgW = leftMargin + tailAreaWidth + loopRectW + marginRight;
      // Tail 高度先算（依赖 loopRectH），svgH 须同时容纳环（垂直居中）与向上伸出的光丘尾。
      // v4.3.504: junction 在左列第 7 位（中点偏上 0.5/14×rectH），tail 顶 = loopCy−juncOff−tailTotalHeight ≥ 边距
      var tailCount = hikarigaokaStations.length - 1;
      // v4.3.885: tail 站距 = 环线站距 / 2（支线紧凑，不撑高全图）
      var tailStep = tailCount > 0 ? (_pitch6 / 2) : 0;
      var tailTotalHeight = tailCount > 0 ? tailCount * tailStep + 32 : 0;
      var _juncOff6 = loopRectH * Math.abs(0.5 - (_juncIdx6 + 0.5) / _halfN); // 0.5/14×rectH ≈ 36px
      svgH = Math.max(loopRectH + marginTopBot * 2,
                      2 * (marginTopBot + _juncOff6 + tailTotalHeight));
      
      // ============ Geometry calculation ============
      // Loop center - derived from svg size, not independently set
      var loopCx = svgW - marginRight - loopRectW / 2;
      var loopCy = svgH / 2;
      var loopHalfW = loopRectW / 2;
      var loopHalfH = loopRectH / 2;
      
      // Junction (Tochomae) - MUST be derived from loop rectangle position formula
      // v4.3.504: 支线从环左侧 1/2 处展开（都庁前实际在环左半）——junction = 环左缘、
      // 左列第 7 位（y=loopCy−0.5/14×rectH，中点偏上 36px 取最接近）。光丘尾水平 stub 后向上。
      var junctionX = loopCx - loopHalfW;   // 环左缘 x = Tochomae x（左列站 x）
      var junctionY = loopCy - loopHalfH + ((_juncIdx6 + 0.5) / _halfN) * loopRectH; // 左列第 7 位
      
      // Stub: 从环左缘（Tochomae）水平向左到 stubX（画布左缘 + 边距 10px），再垂直向上
      // v4.3.511: 光丘尾站名改朝左（用户指令）——竖线右移，保证最宽站
      // （西新宿五丁目 6 字 ≈105.6px）全尺寸朝左时文字左缘仍 ≥ leftMargin（12/12.8px）。
      // v4.3.514: 宽度取光丘尾列实际最长站名（_tailWidest 动态），不硬编码 105.6。
      var stubX = Math.max(leftMargin + _isMobileView() ? 15 : 16, leftMargin + 10 + _tailWidest);
      var stubY = junctionY;
      
      // Tail station coordinates: first = junction (Tochomae, 环左缘 1/2 处), rest = along vertical line at stubX
      var hikarigaokaLinePts = [{ x: junctionX, y: junctionY, side: 'left', stationId: hikarigaokaStations[0] }];
      for (var i = 1; i < hikarigaokaStations.length; i++) {
        hikarigaokaLinePts.push({ 
          x: stubX, 
          y: stubY - i * tailStep, 
          side: 'left', 
          stationId: hikarigaokaStations[i] 
        });
      }
      
      // v4.3.504: 环段 27 站 + Tochomae 分左右两列（14/14）——左列（顶→下）=
      // [S32..S37（麻布十番…新宿）, Tochomae, S11..S17（新宿西口…春日）]，右列（顶→下）= [S18..S31（本郷三丁目…赤羽橋）]。
      // 站序流：Tochomae→左列下（春日）→环底→右列下（本郷三丁目）→右列上（赤羽橋）→环顶→
      // 左列上（麻布十番…新宿）→Tochomae（闭合）。
      var _leftOrder6 = [];
      for (var _lo6 = 0; _lo6 < _juncIdx6; _lo6++) _leftOrder6.push(loopStations[_loopN - _juncIdx6 + _lo6]); // S32..S37
      _leftOrder6.push(loopStations[0]); // Tochomae
      for (var _lo6b = 0; _lo6b < _halfN - 1 - _juncIdx6; _lo6b++) _leftOrder6.push(loopStations[1 + _lo6b]); // S11..S17
      var loopPts6 = [];
      for (var li6 = 0; li6 < _halfN; li6++) {
        var _tl6 = (li6 + 0.5) / _halfN;
        loopPts6.push({ x: junctionX, y: loopCy - loopHalfH + _tl6 * loopRectH, side: "left", stationId: _leftOrder6[li6] });
      }
      for (var ri6 = 0; ri6 < _halfN; ri6++) {
        var _tr6 = (ri6 + 0.5) / _halfN;
        loopPts6.push({ x: loopCx + loopHalfW, y: loopCy - loopHalfH + _tr6 * loopRectH, side: "right", stationId: loopStations[_rightStart + ri6] });
      }
      
      // Combine all station coords (tail stations first, then loop stations excluding junction)
      stationCoords = hikarigaokaLinePts.concat(loopPts6.filter(function(_pt6){ return _pt6.stationId !== stations[0]; }));
      
      // ============ Route elements for static layer ============
      // Main loop rectangle (heavier visual weight = primary)
      routeElements.push({
        type: 'rect',
        attrs: { 
          x: loopCx - loopHalfW, 
          y: loopCy - loopHalfH, 
          width: loopRectW, 
          height: loopRectH, 
          rx: 12, 
          ry: 12, 
          stroke: color, 
          'stroke-width': 5, 
          fill: 'none', 
          opacity: 1.0 
        }
      });
      
      // Stub: 从环左缘（Tochomae）水平向左的引出段（v4.3.504 恢复——支线从环左侧 1/2 处展开）
      routeElements.push({
        type: 'line',
        attrs: { 
          x1: junctionX, 
          y1: junctionY, 
          x2: stubX, 
          y2: stubY, 
          stroke: color, 
          'stroke-width': 3, 
          opacity: 0.5 
        }
      });
      
      // Tail: vertical line (lighter visual weight = secondary)
      if (hikarigaokaLinePts.length > 1) {
        var tailTopY = hikarigaokaLinePts[hikarigaokaLinePts.length - 1].y;
        routeElements.push({
          type: 'line',
          attrs: { 
            x1: stubX, 
            y1: stubY, 
            x2: stubX, 
            y2: tailTopY, 
            stroke: color, 
            'stroke-width': 4, 
            'stroke-linecap': 'round', 
            opacity: 0.4 
          }
        });
      }
      
    } else if (isLoop && stations.length > 2) {
      // Standard loop
      var loopScale = _isMobileView() ? 1.5 : 1.6;
      var loopRectH = Math.max(stations.length * 36 / 2 - 80, 140) * loopScale;
      // v4.3.495: 双列基准再缩减 50%（96→48）；svgW 派生式（rectW+150×scale）自动跟随，
      // 两侧站名空间恒 75×scale 不变。移动 rectW 72px/svgW 297px，桌面 76.8px/316.8px。
      var rectW = _isMobileView() ? 63 : 67.2, rectH = loopRectH; // v4.3.881: 环宽基准 48→42
      svgW = rectW + _isMobileView() ? 225 : 240;
      svgH = loopRectH + (_isMobileView() ? 120 : 128); // v4.3.882: 加括号
      var cx = svgW / 2, cy = svgH / 2;
      var isDoubleColumnLoop = line.isDoubleColumnLoop === true;
      var halfW = rectW / 2, halfH = rectH / 2;
      var loopPts = [];
      var i, _t;
      if (isDoubleColumnLoop) {
        // JR-official: 30 stations split 15 per column, no station at the
        // bottom center — wide open middle. Right column (top->bottom):
        // Tabata..Tokyo..Shinagawa. Left column (top->bottom): Komagome..Osaki.
        // Vertical pitch adapts to the tallest interchange chip in each column
        // (name 16 + 3px gap + chip rows + 6px margin) so nothing overlaps.
        var _rightSeq = [8,7,6,5,4,3,2,1,0,29,28,27,26,25,24];
        var _colPitch = function(ids) { return _chipPitch(ids); }; // v4.3.847: 复用共同规则 _chipPitch（5.4.1.5）
        var _rightIds = _rightSeq.map(function(si) { return stations[si]; });
        var _leftIds = [];
        for (var _li0 = 0; _li0 < 15; _li0++) _leftIds.push(stations[9 + _li0]);
        var _pitch = Math.max(_colPitch(_rightIds), _colPitch(_leftIds));
        var _needH = _pitch * (_rightSeq.length - 1); // v4.3.879: 14→动态（站数延长自动适配）
        if (_needH > loopRectH) {
          rectH = _needH;
          halfH = rectH / 2;
          svgH = rectH + (_isMobileView() ? 150 : 160); // v4.3.882: 加括号（运算符优先级 bug 修复）
          cy = svgH / 2;
        }
        for (var ri = 0; ri < _rightSeq.length; ri++) {
          var _tR = (ri + 0.5) / _rightSeq.length;
          loopPts.push({ x: cx + halfW, y: cy - halfH + _tR * rectH, side: "right", stationId: stations[_rightSeq[ri]] });
        }
        for (var li = 0; li < 15; li++) {
          var _tL = (li + 0.5) / 15;
          loopPts.push({ x: cx - halfW, y: cy - halfH + _tL * rectH, side: "left", stationId: stations[9 + li] });
        }
      } else {
        var perimeter = 2 * (rectW + rectH);
        var startOffset = rectW / 2;
        for (i = 0; i < stations.length; i++) {
          var pos = ((i / stations.length) * perimeter + startOffset) % perimeter;
          var lx, ly, side;
          if (pos < rectW) { lx = cx - halfW + pos; ly = cy - halfH; side = "top"; }
          else if (pos < rectW + rectH) { lx = cx + halfW; ly = cy - halfH + (pos - rectW); side = "right"; }
          else if (pos < 2 * rectW + rectH) { lx = cx + halfW - (pos - rectW - rectH); ly = cy + halfH; side = "bottom"; }
          else { lx = cx - halfW; ly = cy + halfH - (pos - 2 * rectW - rectH); side = "left"; }
          loopPts.push({ x: lx, y: ly, side: side, stationId: stations[i] });
        }
      }
      stationCoords = loopPts;
      
      routeElements.push({
        type: 'rect',
        attrs: { x: cx - halfW, y: cy - halfH, width: rectW, height: rectH, rx: 10, ry: 10, stroke: color, 'stroke-width': 5, fill: 'none', opacity: 1.0 }
      });
      
    } else {
      // Standard linear line: widen the canvas so left (names) and right (icons) both get used
      var isMobileView = _isMobileView();
      // v4.3.608: 桌面画布基准统一为内容基准（297，同移动端/山手线环线）——
      // 此前桌面固定 820：svg width=100% 拉到桌面容器（~1000px+）时放大 3-4x+（字 50-68px 巨大）。
      // 统一内容基准后渲染倍率由 CSS max-width 封顶（v4.3.608，桌面 ≤520px），
      // 手机（1.51x）与桌面（~1.75x）字号接近，两种尺寸均可读。
      // v4.3.543/545 历史：桌面 820 固定、移动 1:1 容器宽（均废弃）。
      var _baseW = GEOM.MOBILE_CONTENT_W;
      var _rightPad = isMobileView ? 24 : 40;
      var mainCx, svgW;
      if (branchLines.length >= 2) {
        // v4.3.516: 多支线全左直排——mainCx ≥ 左侧支线区需求（站名朝左放下），
        // 右侧仅 junction 站名朝右（岔路）+ 余量；左侧 stub 已避开主干站名带（_branchStubL）。
        var _jMaxW6 = 0;
        for (var _jb6 = 0; _jb6 < branchLines.length; _jb6++) {
          var _bl6 = branchLines[_jb6];
          var _jst6 = "";
          if (_bl6.stations && _bl6.stations.length) {
            var _jf6 = _branchJunctionStation(_bl6.stations, stations);
            _jst6 = (_jf6 && _jf6.station) || _bl6.stations[0];
          }
          var _jn6 = _jst6
            ? ((window.RailwayDB && window.RailwayDB.resolveStationName)
              ? (window.RailwayDB.resolveStationName(_jst6, window.currentLang) || _jst6)
              : _jst6)
            : "";
          _jMaxW6 = Math.max(_jMaxW6, (_jn6 || "").length * 16 * 1.1);
        }
        // v4.3.522: 横排时左需求 = 最长支线横排长 + 最宽站名 + 余量（竖列时走 _leftNeed）
        var _leftNeedH = 0;
        if (_branchH) {
          for (var _lh = 0; _lh < branchLines.length; _lh++) {
            var _lhSt = branchLines[_lh].stations || [];
            var _lhJ = _branchJunctionStation(_lhSt, stations);
            var _lhN = _lhJ ? (_lhSt.length - 1) : _lhSt.length;
            _leftNeedH = Math.max(_leftNeedH, _lhN * _branchHSp + 12 + _branchMaxNameW("left") + 2);
          }
        }
        mainCx = Math.max(_baseW / 2, (_branchH ? _leftNeedH : _leftNeed) + 20);
        // v4.3.550: 右侧需求含右横排支线（此前仅 junction 名宽）；左需求已含竖列支线
        svgW = Math.max(_baseW, mainCx + 12 + _jMaxW6 + _rightNeed + _rightPad);
      } else {
        // 单支线/无支线：主线中心固定（现状）
        mainCx = _baseW / 2;
        svgW = Math.max(_baseW, mainCx + _branchStubR + branchOffset + _rightPad);
      }
      
      // v4.3.854: 逐段定距（_yAt）替代旧「均匀 sp + _extraY 补偿」——旧补偿 min(换乘数,8) 与渲染 min(16) 不一致，已废
      for (var i = 0; i < stations.length; i++) {
        stationCoords.push({ x: mainCx, y: _yAt(i), side: 'dual', stationId: stations[i] });
      }
      // svgH must be computed AFTER stationCoords is populated (with the
      // per-station 2-row chip compensation) or the viewBox clips the line.
      svgH = (stationCoords.length ? stationCoords[stationCoords.length - 1].y : topP) + (_spSeg.length ? _spSeg[_spSeg.length - 1] : sp) + botP;
      var y1 = topP, y2 = stationCoords.length ? stationCoords[stationCoords.length - 1].y : (topP + (stations.length - 1) * sp);
      routeElements.push({
        type: 'line',
        attrs: { x1: mainCx, y1: y1, x2: mainCx, y2: y2, stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.35 }
      });
      // v4.3.409/4.3.422: 融合机制——直通运行系统延伸段几何（如横須賀線・総武快速線）
      // 延伸线接主线端点（東京站）后沿同一垂直方向、同一列继续排布（一条连续线）；
      // 列车索引 = baseIdx + 延伸线站表索引
      var fusionMap = {};
      var _extLines = _fusionExtensionLines(lineId);
      if (_extLines && _extLines.length > 0) {
        var extOffsetX = 0; // 4.3.422: 同列延伸（用户指示"为一条线"），不再另起右列
        var yBase = stationCoords.length ? stationCoords[stationCoords.length - 1].y : topP;
        var yStartRef = topP;
        for (var exi = 0; exi < _extLines.length; exi++) {
          var exl = _extLines[exi];
          var exLine = allLines[exl.lid];
          if (!exLine || !exLine.stations) continue;
          var exSt = exLine.stations;
          var exColor = (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(exl.lid)) || exLine.color || "#888";
          // 延伸站 = 去掉与主线共享的接续站（主线末站/首站）
          var extStations = exl.joinAtEnd ? exSt.slice(1) : exSt.slice(0, -1);
          if (extStations.length === 0) continue;
          var extStartY = exl.joinAtEnd ? yBase : yStartRef;
          var extBaseIdx = stationCoords.length;
          for (var exk = 0; exk < extStations.length; exk++) {
            var exY = exl.joinAtEnd ? (extStartY + (exk + 1) * sp) : (extStartY - (exk + 1) * sp);
            stationCoords.push({ x: mainCx + extOffsetX, y: exY, side: 'right', stationId: extStations[exk], fusionLineId: exl.lid });
          }
          // 连接线：主线端点 → 延伸段第一站（同列时即为垂直连续线）
          var jx = mainCx, jy = exl.joinAtEnd ? yBase : yStartRef;
          var exFirstY = exl.joinAtEnd ? (yBase + sp) : (yStartRef - sp);
          routeElements.push({ type: 'line', attrs: { x1: jx, y1: jy, x2: mainCx + extOffsetX, y2: jy, stroke: exColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 } });
          routeElements.push({ type: 'line', attrs: { x1: mainCx + extOffsetX, y1: jy, x2: mainCx + extOffsetX, y2: exFirstY, stroke: exColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 } });
          // 延伸段站内连线
          for (var exk2 = 0; exk2 < extStations.length - 1; exk2++) {
            var yA = exl.joinAtEnd ? (extStartY + (exk2 + 1) * sp) : (extStartY - (exk2 + 1) * sp);
            var yB = exl.joinAtEnd ? (extStartY + (exk2 + 2) * sp) : (extStartY - (exk2 + 2) * sp);
            routeElements.push({ type: 'line', attrs: { x1: mainCx + extOffsetX, y1: yA, x2: mainCx + extOffsetX, y2: yB, stroke: exColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.5 } });
          }
          // 延伸段标题标签
          var _exName = (window.RailwayDB && window.RailwayDB.resolveLineName) ? window.RailwayDB.resolveLineName(exl.lid, window.currentLang) || exl.lid : exl.lid;
          routeElements.push({ type: 'text', attrs: { x: mainCx + extOffsetX, y: exl.joinAtEnd ? (extStartY + (extStations.length + 1) * sp) : (extStartY - (extStations.length + 1) * sp), 'text-anchor': 'middle', 'font-size': '12', fill: exColor, 'font-weight': '600' }, text: _exName });
          fusionMap[exl.lid] = { baseIdx: extBaseIdx, joinAtEnd: exl.joinAtEnd, stationCount: extStations.length };
        }
        // svg 尺寸扩展：同列延伸只扩展高度（站名沿用主线站名区宽度）
        if (stationCoords.length) {
          var _lastY = stationCoords[stationCoords.length - 1].y;
          svgH = Math.max(svgH, _lastY + sp + botP);
          var _minY = Math.min.apply(null, stationCoords.map(function(c) { return c.y; }));
          svgH = Math.max(svgH, _minY + sp * 2 + botP);
        }
      }
      // Twin parallel line for shared sections (industry standard)
      var sharedSegs = _findSharedSegments(line, allLines);
      for (var si = 0; si < sharedSegs.length; si++) {
        var sseg = sharedSegs[si];
        var pColor = (window.LineOperationSystemsResolveColor && window.LineOperationSystemsResolveColor(sseg.partner)) || (allLines[sseg.partner] && allLines[sseg.partner].color) || "#888";
        routeElements.push({
          type: 'line',
          attrs: { x1: mainCx - 7, y1: _yAt(sseg.start), x2: mainCx - 7, y2: _yAt(sseg.end), stroke: pColor, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.55 }
        });
      }
    }
    
    // Branch geometry for realtime train placement (kept separate from main line
    // so branch trains render on their own station column, visually distanced)
    var branchGeom = null;
    if (branchLines.length > 0 && stationCoords.length > 0) {
      branchGeom = {};
      for (var bgi = 0; bgi < branchLines.length; bgi++) {
        var _br = branchLines[bgi];
        if (!_br.stations || _br.stations.length === 0) continue;
        var _jfG = _branchJunctionStation(_br.stations, stations);
        if (!_jfG) continue;
        var _jIdx = -1;
        for (var _ji2 = 0; _ji2 < stationCoords.length; _ji2++) {
          if (stationCoords[_ji2].stationId === _jfG.station) { _jIdx = _ji2; break; }
        }
        if (_jIdx < 0) continue;
        var _bx = (_bSide(bgi) === "left")
          ? (stationCoords[_jIdx].x - _branchStubL - _bCol(bgi) * _branchColW)
          : (stationCoords[_jIdx].x + _branchStubR + _bCol(bgi) * GEOM.BRANCH_COL_W);
        var _by = stationCoords[_jIdx].y;
        var _bsp = sp || 24;
        // v4.3.520: junction 在支线站表末位（我孫子支线）→ 反转站序从 junction 向下延伸
        var _gStations = (_jfG.at === _br.stations.length - 1) ? _br.stations.slice().reverse() : _br.stations;
        var _bcoords = [];
        if (_branchModes[bgi] === 'h') {
          // v4.3.522: 短支线水平直线横排——跳过 junction 站（主干已画），从 junction
          // 向侧边水平排开（站距 = 全支线最宽名 + 12）；列车定位坐标同步横排
          var _bHx0 = stationCoords[_jIdx].x, _bHy0 = stationCoords[_jIdx].y, _bHi = 0;
          for (var _bsiH = 0; _bsiH < _gStations.length; _bsiH++) {
            if (_gStations[_bsiH] === _jfG.station) continue;
            var _bHx = (_bSide(bgi) === "left")
              ? (_bHx0 - (_bHi + 1) * _branchHSp)
              : (_bHx0 + (_bHi + 1) * _branchHSp);
            _bcoords.push({ stationId: _gStations[_bsiH], x: _bHx, y: _bHy0 });
            _bHi++;
          }
        } else {
          // v4.3.553: 竖列跳过 junction 站（主干已绘）——支线独有站**第一站与 junction 同行**：
          // 用户："岔路的第一个站和出去的站在一行"——岔路第一站水平叉出、与岔路点（junction）
          // 同一水平行，再竖列向下（原 _bK=1 从 junction 下方一档开始，第一站落到主干下一站行，
          // 岔路起点视觉下沉一档）；横排支线第一站本就与 junction 同行（y=by），规则统一。
          var _bK = 0;
          for (var _bsi = 0; _bsi < _gStations.length; _bsi++) {
            if (_gStations[_bsi] === _jfG.station) continue;
            _bcoords.push({ stationId: _gStations[_bsi], x: _bx, y: _by + _bK * _bsp });
            _bK++;
          }
        }
        branchGeom[_br.id] = _bcoords;
      }
    }

    // v4.3.551: "所有插线叉出去那一部分也要算站间距"——竖列支线底部计入 svgH：
    // svgH 原只按主干 stationCoords 站间距计算（junction 靠上 + 长竖列支线时支线底部会被
    // viewBox 裁剪）；现取全部支线坐标最大 y，超过主干底时扩展画布（横排与 junction 同行
    // 不影响高度，竖列每站已按 sp 站间距排布，底部 = 站数 × sp）。
    if (branchGeom) {
      var _maxBrY = 0;
      for (var _bgKey in branchGeom) {
        if (Object.prototype.hasOwnProperty.call(branchGeom, _bgKey)) {
          var _bgArr = branchGeom[_bgKey];
          if (_bgArr && _bgArr.length) {
            var _bgLast = _bgArr[_bgArr.length - 1];
            if (_bgLast && _bgLast.y > _maxBrY) _maxBrY = _bgLast.y;
          }
        }
      }
      if (_maxBrY > 0) {
        svgH = Math.max(svgH, _maxBrY + sp + botP);
      }
    }

    // Build geometry object
    var geometry = {
      lineId: lineId,
      lineHash: _computeLineHash(line),
      stations: stations,
      stationCoords: stationCoords,
      svgW: svgW,
      svgH: svgH,
      isLoop: isLoop,
      isSixShapedLoop: isSixShapedLoop,
      isDualLoop6: isSixShapedLoop, // v4.3.502: 六形环环段左右二分（双列）——站名朝外、clamp 走通用
      sp: sp,
      color: color,
      branchLines: branchLines,
      branchOffset: branchOffset,
      branchSides: (function() { var _ba = []; for (var _bi5 = 0; _bi5 < branchLines.length; _bi5++) _ba.push(_bSide(_bi5)); return _ba; })(), // v4.3.515: 每支线分叉侧（跨函数传给 renderTrainMap）
      bCol: _bCol, // v4.3.515: 支线列序号（跨函数）
      branchStubL: _branchStubL, // v4.3.515: 左侧支线 stub（主干最宽站名+22，跨函数）
      branchStubR: _branchStubR, // v4.3.553: 右侧支线 stub（≥ 站间距，跨函数）
      branchColW: _branchColW, // v4.3.516: 左侧列距动态化（跨函数）
      branchH: _branchH, // v4.3.522: 短支线线 → 支线水平直线横排（跨函数）
      branchModes: _branchModes, // v4.3.550: 每支线画法（h 横排 / v 竖列，跨函数）
      rightBranch: _rightCols > 0 && branchLines.length >= 2, // v4.3.550: 存在右支线（junction 站名转圆点上方+白描边）
      branchHSp: _branchHSp, // v4.3.522: 横排站距（跨函数）
      branchGeom: branchGeom,
      routeElements: routeElements,
      junctionStation: isSixShapedLoop ? stations[0] : null,
      junctionX: isSixShapedLoop ? junctionX : null,
      junctionY: isSixShapedLoop ? junctionY : null, // v4.3.504: 左列第 7 位 y（站名方向/紧致 clamp 依据）
      loopRectW: isSixShapedLoop ? loopRectW : null, // v4.3.504: 环宽（左列上方站 clamp 到右列圆点前）
      fusionMap: fusionMap || null
    };
    
    // Cache it
    _routeGeometryCache[_geomKey(lineId)] = geometry;
    
    return geometry;
  }
  
  function _computeLineHash(line) {
    // Simple hash based on stations and type
    return (line.stations || []).join('|') + '|' + (line.type || '') + '|' + (line.isSixShapedLoop ? '6' : '0') + '|' + (line.isDoubleColumnLoop ? 'D' : '0');
  }
  
  function invalidateRouteGeometryCache(lineId) {
    if (lineId) {
      delete _routeGeometryCache[_geomKey(lineId)];
    } else {
      _routeGeometryCache = {};
    }
  }
  
  // === Unified station renderer (main line & branch share the same style) ===
  // v4.3.449: 主線/支線の区別は geometry（座標・side・色）のみに残し、駅・ラベル・
  // 乗換チップ・直通チップの描画はこの関数一本で統一。支線駅も主線駅と同一スタイル。

  // v4.3.510: 枝干站名侧 = 站名占用检测（用户纠正："我说的是站名"）——检测对象是
  // **站名文字带**而非空间/几何：枝干（光丘尾 10 站 + Tochomae junction）站名放某一侧时，
  // 若与主干（环）站的站名文字带重叠（该侧被主干站名占用），则放另一侧；双侧都不重叠
  // → 默认朝右（v4.3.505 岔路站名标准）。主干站名带方向按双排固定规则（左列上方朝右、
  // 左列下方朝左、右列朝右，v4.3.504）。画布边界为硬约束（放不下即占用）。
  function _pickSixLabelSide(o, geometry, svgW) {
    var x = o.x, y = o.y;
    var off = o.isJunction ? 14 : 10;
    var W = (o.labelLen || 3) * 16 * 1.1; // 当前枝干站全尺寸文字宽
    var y0 = y - 8, y1 = y + 8;
    var rightRect = [x + off, x + off + W, y0, y1];
    var leftRect = [x - off - W, x - off, y0, y1];
    var rightOccupied = false, leftOccupied = false;

    // 画布边界硬约束（放不下即占用）
    if (rightRect[1] > svgW - 2) rightOccupied = true;
    if (leftRect[0] < 0) leftOccupied = true;

    // 主干（环）站名文字带重叠检测
    var scs = geometry.stationCoords || [];
    var jx = geometry.junctionX, jy = geometry.junctionY;
    for (var i = 0; i < scs.length; i++) {
      var sc = scs[i];
      if (sc.stationId === o.stationId) continue;      // 跳过自身
      if (sc.x < jx - 0.5) continue;                   // 跳过枝干光丘尾站（环外）
      if (Math.abs(sc.x - jx) < 0.5 && sc.stationId === geometry.junctionStation) continue; // 跳过 junction 自身
      var sName = (window.RailwayDB && window.RailwayDB.resolveStationName)
        ? (window.RailwayDB.resolveStationName(sc.stationId, window.currentLang) || sc.stationId)
        : sc.stationId;
      var sW = (sName || "").length * 16 * 1.1;
      var soff = (sc.stationId === geometry.junctionStation) ? 14 : 10;
      var sRect;
      if (Math.abs(sc.x - jx) < 0.5) {
        // v4.3.511: 左列主干站统一朝左（上方由朝右改朝左，与左列下方一致）
        sRect = [sc.x - soff - sW, sc.x - soff, sc.y - 8, sc.y + 8];
      } else {
        // 右列主干站：朝右
        sRect = [sc.x + soff, sc.x + soff + sW, sc.y - 8, sc.y + 8];
      }
      if (rightRect[0] < sRect[1] && sRect[0] < rightRect[1] &&
          rightRect[2] < sRect[3] && sRect[2] < rightRect[3]) rightOccupied = true;
      if (leftRect[0] < sRect[1] && sRect[0] < leftRect[1] &&
          leftRect[2] < sRect[3] && sRect[2] < leftRect[3]) leftOccupied = true;
    }

    if (leftOccupied && !rightOccupied) return "right";
    if (rightOccupied && !leftOccupied) return "left";
    return "right"; // 双侧同况（都空/都占）→ 默认朝右
  }
