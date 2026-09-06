/*
 * Pixel Tetsudo - Train Icon Mapping
 * 列车车型图标映射表
 * 图标来源: trainfrontview.net (32x38px)
 */
(function() {
  "use strict";

  // Vehicle deployment zones: specific rolling stock only runs on listed segments
  // 211系長野色（冰蓝与青色带）部署区间（参考 trafficnews.jp/post/676306）
  var VEHICLE_DEPLOYMENTS = {
    "211Nagano": {
      routes: [
        { line: "ChuoMain", from: "Takao", to: "Shiojiri", icon: "../images/列车/JR東日本/211系長野色.png", priority: 1 },        // 中央東線：高尾〜塩尻（2026.3 改点后不进高尾以东）
        { line: "Shinonoi", from: "Shiojiri", to: "Shinonoi", icon: "../images/列车/JR東日本/211系長野色.png", priority: 2 },     // 篠ノ井線：全线（班次最密）
        { line: "Shinetsu", from: "Shinonoi", to: "Nagano", icon: "../images/列车/JR東日本/211系長野色.png", priority: 2 },       // 信越本線（長野段）：早晚通勤普通
        { line: "Oito", from: "Matsumoto", to: "Shinano-Omachi", icon: "../images/列车/JR東日本/211系長野色.png", priority: 1 },  // 大糸線：南段（少数固定班次）
        { line: "ChuoWest", from: "Shiojiri", to: "Nakatsugawa", icon: "../images/列车/JR東日本/211系長野色.png", priority: 1 },  // 中央西線：直通（线路数据待补）
        { line: "Fujikyuko", from: "Otsuki", to: "Kawaguchiko" },   // 富士急行線：直通（线路+图标待补）
        { line: "Iida", from: "Tatsuno", to: "Iida" }               // 飯田線：直通（线路+图标待补）
      ]
    },
    "E127": {
      routes: [
        { line: "Oito", from: "Matsumoto", to: "Minami-Koya", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 2 },   // 大糸線：全线（E127 核心，包揽大量普通，优先于 211）
        { line: "Shinonoi", from: "Shiojiri", to: "Shinonoi", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }, // 篠ノ井線：普通运用（班次少于 211）
        { line: "Shinetsu", from: "Shinonoi", to: "Nagano", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }, // 信越本線長野段：极少数班次
        { line: "ChuoTatsuno", from: "Okaya", to: "Shiojiri", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }  // 中央本線辰野支線：区间摆渡（替代 123 系）
      ]
    }
  };

  // Operator default icons (fallback)
  var OPERATOR_ICONS = {
    "JR-East": "../images/列车/JR東日本/E235系山手線.png",
    "JR West": "../images/列车/JR東日本/E235系山手線.png",
    "TokyoMetro": "../images/列车/東京メトロ/銀座線.png",
    "Toei": "../images/列车/都営地下鉄/都営浅草線.png",
    "YokohamaMunicipal": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "Keio": "../images/列车/京王電鉄/京王.png",
    "Odakyu": "../images/列车/小田急電鉄/小田急線.png",
    "Seibu": "../images/列车/西武鉄道/池袋線.png",
    "Tobu": "../images/列车/東武鉄道/東武各線.png",
    "Tokyu": "../images/列车/東急電鉄/田園都市線.png",
    "Keikyu": "../images/列车/京急電鉄/京急線.png",
    "Keisei": "../images/列车/京成電鉄/京成.png",
    "Sotetsu": "../images/列车/相模鉄道/相鉄.png",
    "TWR": "../images/列车/東京臨海高速鉄道/りんかい線.png",
    "MIR": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "Rinkai": "../images/列车/東京臨海高速鉄道/りんかい線.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/つくばエクスプレス.png",
    "Yurikamome": "../images/列车/ゆりかもめ/ゆりかもめ.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/多摩モノレール.png",
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/ニューシャトル.png",
    "ChibaUrbanMonorail": "../images/列车/千葉都市モノレール/千葉モノレール.png",
    "TokyoMonorail": "../images/列车/東京モノレール/東京モノレール.png",
    "NipporiToneri": "../images/列车/都営地下鉄/都営浅草線.png",
    "MinatoMirai": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
    "ShonanMonorail": "../images/鉄道/湘南モノレール/湘南モノレール江の島線.png"
  };

  // Specific line icons (override operator defaults)
  var LINE_ICONS = {
    // JR East specific
    "Yamanote": "../images/列车/JR東日本/E235系山手線.png",
    "KeihinTohoku": "../images/列车/JR東日本/E233系1000番台.png",
    "Saikyo": "../images/列车/JR東日本/E233系7000番台.png",
    "Kawagoe": "../images/列车/JR東日本/E233系7000番台.png",
    "ChuoRapid": "../images/列车/JR東日本/E233系0番台.png",
    "ChuoLocal": "../images/列车/JR東日本/E235系総武中央線.png",
    "ChuoSobuLocal": "../images/列车/JR東日本/E235系総武中央線.png",
    "ChuoMain": "../images/列车/JR東日本/E233系0番台.png",
    "Yokosuka": "../images/列车/JR東日本/E235系1000番台.png",
    "SobuRapid": "../images/列车/JR東日本/E235系1000番台.png",
    "SobuMain": "../images/列车/JR東日本/E235系1000番台.png",
    "Tokaido": "../images/列车/JR東日本/E231系近郊型.png",
    "TokaidoMain": "../images/列车/JR東日本/E231系近郊型.png",
    "Utsunomiya": "../images/列车/JR東日本/E231系近郊型.png",
    "Takasaki": "../images/列车/JR東日本/E231系近郊型.png",
    "Joban": "../images/列车/JR東日本/E531系.png",
    "JobanRapid": "../images/列车/JR東日本/E531系.png",
    "JobanLocal": "../images/列车/東京メトロ/千代田線.png",
    "Mito": "../images/列车/JR東日本/E531系.png",
    "Musashino": "../images/列车/JR東日本/武蔵野線.png",
    "Nambu": "../images/列车/JR東日本/E233系8000番台.png",
    "Yokohama": "../images/列车/JR東日本/E233系6000番台.png",
    "Keiyo": "../images/列车/JR東日本/E233系5000番台.png",
    "Tsurumi": "../images/列车/JR東日本/鶴見線.png",
    "Ome": "../images/列车/JR東日本/E233系青梅線.png",
    "Itsukaichi": "../images/列车/JR東日本/E233系0番台.png",
    "ShonanShinjuku": "../images/列车/JR東日本/E231系近郊型.png",
    "TohokuMain": "../images/列车/JR東日本/E231系近郊型.png",
    "OuMain": "../images/列车/JR東日本/E231系近郊型.png",
    "Ryomo": "../images/列车/JR東日本/E231系近郊型.png",
    "Agatsuma": "../images/列车/東武鉄道/東武各線.png",
    "BanetsuWest": "../images/列车/東武鉄道/東武各線.png",
    
    // Tokyo Metro specific
    "Ginza": "../images/列车/東京メトロ/銀座線.png",
    "Marunouchi": "../images/列车/東京メトロ/丸ノ内線.png",
    "Hibiya": "../images/列车/東京メトロ/日比谷線.png",
    "Tozai": "../images/列车/東京メトロ/東西線.png",
    "Chiyoda": "../images/列车/東京メトロ/千代田線.png",
    "Yurakucho": "../images/列车/東京メトロ/有楽町線.png",
    "Hanzomon": "../images/列车/東京メトロ/半蔵門線.png",
    "Namboku": "../images/列车/東京メトロ/南北線.png",
    "Fukutoshin": "../images/列车/東京メトロ/副都心線.png",
    "KitaAyase": "../images/列车/東京メトロ/北綾瀬支線.png",
    
    // Toei specific
    "Asakusa": "../images/列车/都営地下鉄/都営浅草線.png",
    "Mita": "../images/列车/都営地下鉄/都営三田線.png",
    "Shinjuku": "../images/列车/都営地下鉄/都営新宿線.png",
    "Oedo": "../images/列车/都営地下鉄/大江戸線.png",
    "TodenArakawa": "../images/列车/都営地下鉄/都電荒川線.png",
    "NipporiToneri": "../images/列车/都営地下鉄/都営浅草線.png",
    
    // Tobu specific
    "TobuSkytree": "../images/列车/東武鉄道/東武各線.png",
    "TobuIsesaki": "../images/列车/東武鉄道/東武各線.png",
    "TobuTojo": "../images/列车/東武鉄道/東上線.png",
    "Tojo": "../images/列车/東武鉄道/東上線.png",
    "TobuNikko": "../images/列车/東武鉄道/東武各線.png",
    "TobuNoda": "../images/列车/東武鉄道/野田線.png",
    "Tobu_Kameido": "../images/列车/東武鉄道/亀戸線.png",
    "Ogose": "../images/列车/東武鉄道/東武各線.png",
    
    // Seibu specific
    "Ikebukuro": "../images/列车/西武鉄道/池袋線.png",
    "SeibuIkebukuro": "../images/列车/西武鉄道/池袋線.png",
    "SeibuShinjuku": "../images/列车/西武鉄道/新宿線.png",
    "SeibuTamagawa": "../images/列车/西武鉄道/多摩川線.png",
    "Seibuen": "../images/列车/西武鉄道/西武園線.png",
    "Yamaguchi": "../images/列车/西武鉄道/山口線.png",
    
    // Tokyu specific
    "TokyuDenEn": "../images/列车/東急電鉄/田園都市線.png",
    "TokyuMeguro": "../images/列车/東急電鉄/目黒線.png",
    "TokyuTamagawa": "../images/列车/東急電鉄/池上多摩川線.png",
    "Denentoshi": "../images/列车/東急電鉄/田園都市線.png",
    "Oimachi": "../images/列车/東急電鉄/大井町線.png",
    "Meguro": "../images/列车/東急電鉄/目黒線.png",
    "Ikegami": "../images/列车/東急電鉄/池上多摩川線.png",
    "Tamagawa": "../images/列车/東急電鉄/池上多摩川線.png",
    "Kodomonokuni": "../images/列车/東急電鉄/こどもの国線.png",
    
    // Keio specific
    "Keio": "../images/列车/京王電鉄/京王.png",
    "KeioLine": "../images/列车/京王電鉄/京王.png",
    "KeioInokashira": "../images/列车/京王電鉄/京王.png",
    "Inokashira": "../images/列车/京王電鉄/京王.png",
    "Sagamihara": "../images/列车/京王電鉄/京王.png",
    "Takao": "../images/列车/京王電鉄/京王.png",
    
    // Odakyu specific
    "Odakyu": "../images/列车/小田急電鉄/小田急線.png",
    "Odawara": "../images/列车/小田急電鉄/小田急線.png",
    "Enoshima": "../images/列车/小田急電鉄/小田急線.png",
    "OdakyuTamagawa": "../images/列车/小田急電鉄/小田急線.png",
    
    // Keikyu specific
    "Keikyu": "../images/列车/京急電鉄/京急線.png",
    "KeikyuMain": "../images/列车/京急電鉄/京急線.png",
    "KeikyuAirport": "../images/列车/京急電鉄/京急線.png",
    "KeikyuDaishi": "../images/列车/京急電鉄/大師線.png",
    "Daishi_Keikyu": "../images/列车/京急電鉄/大師線.png",
    "KeikyuZushi": "../images/列车/京急電鉄/京急線.png",
    "KeikyuKurihama": "../images/列车/京急電鉄/京急線.png",
    
    // Keisei specific
    "Keisei": "../images/列车/京成電鉄/京成.png",
    "KeiseiMain": "../images/列车/京成電鉄/京成.png",
    "Oshiage": "../images/列车/京成電鉄/京成.png",
    "Kanamachi": "../images/列车/京成電鉄/京成.png",
    "Chiba": "../images/列车/京成電鉄/京成.png",
    "Chihara": "../images/列车/京成電鉄/京成.png",
    "NaritaAccess": "../images/列车/京成電鉄/スカイライナー.png",
    
    // Sotetsu specific
    "Sotetsu": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuMain": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuIzumino": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuShinyokohama": "../images/列车/相模鉄道/相鉄.png",
    
    // Yokohama Municipal
    "YokohamaMunicipal": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "YokohamaBlue": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "YokohamaGreen": "../images/列车/横浜市交通局/横浜市グリーンライン.png",
    
    // Single-line operators
    "TWR": "../images/列车/東京臨海高速鉄道/りんかい線.png",
    "Rinkai": "../images/列车/東京臨海高速鉄道/りんかい線.png",
    "MIR": "../images/列车/首都圏新都市鉄道/つくばエクスプレス.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/つくばエクスプレス.png",
    "Yurikamome": "../images/列车/ゆりかもめ/ゆりかもめ.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/多摩モノレール.png",
    "ChibaUrbanMonorail": "../images/列车/千葉都市モノレール/千葉モノレール.png",
    "TokyoMonorail": "../images/列车/東京モノレール/東京モノレール.png",
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/ニューシャトル.png"
  };

  function getTrainIcon(lineId, operator, trainId, stationIndex) {
    try {
      // Chuo/Sobu local: E231系500番台 + E235系0番台 并用（2025 起 E235 由山手线转用）
      if (lineId === "ChuoLocal" || lineId === "ChuoSobuLocal") {
        var n = 0;
        if (typeof trainId === "number") { n = Math.abs(trainId) % 2; }
        else if (typeof trainId === "string") { var s = 0; for (var i = 0; i < trainId.length; i++) s += trainId.charCodeAt(i); n = s % 2; }
        return n === 0
          ? "../images/列车/JR東日本/E231系総武中央線.png"
          : "../images/列车/JR東日本/E235系総武中央線.png";
      }
      // Vehicle deployment zones first (211系長野色/E127等按区间部署，priority 高者优先)
      if (typeof stationIndex === "number" && window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) {
        var sts = window.UNIFIED_LINES[lineId].stations || [];
        var bestIcon = null, bestPri = -1;
        Object.keys(VEHICLE_DEPLOYMENTS).forEach(function(vk) {
          var v = VEHICLE_DEPLOYMENTS[vk];
          v.routes.forEach(function(r) {
            if (r.line !== lineId || !r.icon) return;
            var fi = sts.indexOf(r.from);
            var ti = sts.indexOf(r.to);
            if (fi === -1 || ti === -1) return;
            var lo = Math.min(fi, ti), hi = Math.max(fi, ti);
            if (stationIndex >= lo && stationIndex <= hi) {
              var pri = r.priority || 0;
              if (pri > bestPri) { bestPri = pri; bestIcon = r.icon; }
            }
          });
        });
        if (bestIcon) return bestIcon;
      }
      // Check specific line icon first
      if (LINE_ICONS[lineId]) return LINE_ICONS[lineId];
      
      // Fallback to operator default
      var opKey = operator;
      if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === "function") {
        opKey = window.TransitConstants.normalizeOp(operator);
      }
      if (OPERATOR_ICONS[opKey]) return OPERATOR_ICONS[opKey];
      
      // Ultimate fallback
      return "../images/列车/JR東日本/E235系山手線.png";
    } catch(e) {
      return "../images/列车/JR東日本/E235系山手線.png";
    }
  }

  window.TrainIcons = {
    getTrainIcon: getTrainIcon,
    LINE_ICONS: LINE_ICONS,
    OPERATOR_ICONS: OPERATOR_ICONS
  };

  console.log("[TrainIcons] initialized with", Object.keys(LINE_ICONS).length, "line icons and", Object.keys(OPERATOR_ICONS).length, "operator defaults");
})();
