/*
 * Pixel Tetsudo - Train Icon Mapping
 * 列车车型图标映射表
 * 图标来源: trainfrontview.net (32x38px)
 */
(function() {
  "use strict";

  // Operator default icons (fallback)
  var OPERATOR_ICONS = {
    "JR-East": "../images/列车/JR東日本/山手線.png",
    "JR West": "../images/列车/JR東日本/山手線.png",
    "TokyoMetro": "../images/列车/東京メトロ/18000系.png",
    "Toei": "../images/列车/都営地下鉄/1000形.png",
    "YokohamaMunicipal": "../images/列车/都営地下鉄/1000形.png",
    "Keio": "../images/列车/京王電鉄/2000系.png",
    "Odakyu": "../images/列车/小田急電鉄/80000系.png",
    "Seibu": "../images/列车/西武鉄道/40000系.png",
    "Tobu": "../images/列车/東武鉄道/1000系.png",
    "Tokyu": "../images/列车/東急電鉄/6021系.png",
    "Keikyu": "../images/列车/京急電鉄/1000系.png",
    "Keisei": "../images/列车/京成電鉄/3900系.png",
    "Sotetsu": "../images/列车/相模鉄道/13000系.png",
    "TWR": "../images/列车/東京臨海高速鉄道/70-000形.png",
    "MIR": "../images/列车/横浜高速鉄道/Y000系.png",
    "MinatoMirai": "../images/列车/横浜高速鉄道/Y000系.png",
    "Rinkai": "../images/列车/東京臨海高速鉄道/70-000形.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/TX-1000系.png",
    "Yurikamome": "../images/列车/ゆりかもめ/7000系.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/1000形.png",
    "ShonanMonorail": "../images/列车/湘南モノレール/5000形.png",
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/2000形.png",
    "ChibaUrbanMonorail": "../images/列车/千葉都市モノレール/1000形.png",
    "TokyoMonorail": "../images/列车/東京モノレール/10000形.png",
    "NipporiToneri": "../images/列车/都営地下鉄/1000形.png"
  };

  // Specific line icons (override operator defaults)
  var LINE_ICONS = {
    // JR East specific (line-specific icons)
    "Yamanote": "../images/列车/JR東日本/山手線.png",
    "KeihinTohoku": "../images/列车/JR東日本/京浜東北線.png",
    "Saikyo": "../images/列车/JR東日本/埼京川越線.png",
    "Kawagoe": "../images/列车/JR東日本/埼京川越線.png",
    // Other JR East lines use Yamanote as generic fallback
    "ChuoRapid": "../images/列车/JR東日本/山手線.png",
    "ChuoLocal": "../images/列车/JR東日本/山手線.png",
    "Yokosuka": "../images/列车/JR東日本/山手線.png",
    "Tokaido": "../images/列车/JR東日本/山手線.png",
    "Utsunomiya": "../images/列车/JR東日本/山手線.png",
    "Takasaki": "../images/列车/JR東日本/山手線.png",
    "SobuRapid": "../images/列车/JR東日本/山手線.png",
    "JobanRapid": "../images/列车/JR東日本/山手線.png",
    "JobanLocal": "../images/列车/JR東日本/山手線.png",
    "Musashino": "../images/列车/JR東日本/山手線.png",
    "Nambu": "../images/列车/JR東日本/山手線.png",
    "Yokohama": "../images/列车/JR東日本/山手線.png",
    "Keiyo": "../images/列车/JR東日本/山手線.png",
    "Tsurumi": "../images/列车/JR東日本/山手線.png",
    "ShonanShinjuku": "../images/列车/JR東日本/山手線.png",
    "Ome": "../images/列车/JR東日本/山手線.png",
    "Itsukaichi": "../images/列车/JR東日本/山手線.png",
    // Tokyo Metro specific
    "Ginza": "../images/列车/東京メトロ/1000系.png",
    "Marunouchi": "../images/列车/東京メトロ/2000系.png",
    "Hibiya": "../images/列车/東京メトロ/13000系.png",
    "Tozai": "../images/列车/東京メトロ/15000系.png",
    "Chiyoda": "../images/列车/東京メトロ/16000系.png",
    "Yurakucho": "../images/列车/東京メトロ/17000系.png",
    "Hanzomon": "../images/列车/東京メトロ/18000系.png",
    "Namboku": "../images/列车/東京メトロ/19000系.png",
    "Fukutoshin": "../images/列车/東京メトロ/17000系.png",
    // Toei specific
    "Asakusa": "../images/列车/都営地下鉄/5300系.png",
    "Mita": "../images/列车/都営地下鉄/6300形.png",
    "Shinjuku": "../images/列车/都営地下鉄/10-000形.png",
    "Oedo": "../images/列车/都営地下鉄/12-000形.png"
  };

  function getTrainIcon(lineId, operator) {
    try {
      // Check specific line icon first
      if (LINE_ICONS[lineId]) return LINE_ICONS[lineId];
      
      // Fallback to operator default
      var opKey = operator;
      if (window.TransitConstants && typeof window.TransitConstants.normalizeOp === "function") {
        opKey = window.TransitConstants.normalizeOp(operator);
      }
      if (OPERATOR_ICONS[opKey]) return OPERATOR_ICONS[opKey];
      
      // Ultimate fallback
      return "../images/列车/JR東日本/E233系.png";
    } catch(e) {
      return "../images/列车/JR東日本/E233系.png";
    }
  }

  window.TrainIcons = {
    getTrainIcon: getTrainIcon,
    LINE_ICONS: LINE_ICONS,
    OPERATOR_ICONS: OPERATOR_ICONS
  };

  console.log("[TrainIcons] initialized with", Object.keys(LINE_ICONS).length, "line icons and", Object.keys(OPERATOR_ICONS).length, "operator defaults");
})();
