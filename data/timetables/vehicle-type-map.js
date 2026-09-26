      var _lastVt = null;
/**
 * vehicle-type-map.js — 车型・等级 vehicleType overlay 查表
 *
 * 目的：对所有有直通关系的线路，按「種別 × 直通先オペレータ」推定车辆形式。
 * 数据来源：各社官网・wiki・鉄道ファン等公开资料（2026-09 時点）。
 *
 * 消费方：js/train-position-estimator.js（estimateLinePositions 内）
 *   当 tt['vehicleType'] 为空（manual 未内嵌）时，按以下顺序查表：
 *     1. trainTypeShort = odpt:trainType URN 末段
 *     2. destOperator = destinationStation URN parts[1] の operator 名
 *        例: odpt.Station:TokyoMetro.Fukutoshin.Wakoshi → 'TokyoMetro'
 *     3. MAP[lineId][trainTypeShort][destOperator] || MAP[lineId][trainTypeShort]['default'] || ''
 *
 * destOperator は ODPT URN の operator 名（parts[1] のコロン後）を直接使用。
 * これにより京急 Main / 相鉄 Main のような railway 短名衝突を回避する。
 * LINE_GROUP は operator 名が取れない古い形式 URN 用のフォールバック。
 *
 * 嵌入优先：manual 记录已内嵌 vehicleType 时直接使用，本表仅作 fallback。
 */
(function() {
  "use strict";

  // フォールバック用: railway 短名 → operator 名（古い URN 形式や特殊ケース用）
  var LINE_GROUP = {
    // 東急
    'Toyoko': 'Tokyu', 'Meguro': 'Tokyu', 'Oimachi': 'Tokyu',
    'Ikegami': 'Tokyu', 'Setagaya': 'Tokyu', 'TokyuTamagawa': 'Tokyu',
    'Kodomonokuni': 'Tokyu', 'DenEnToshi': 'Tokyu',
    // みなとみらい
    'Minatomirai': 'Minatomirai',
    // 東京メトロ
    'Chiyoda': 'TokyoMetro', 'Fukutoshin': 'TokyoMetro', 'Hanzomon': 'TokyoMetro',
    'Hibiya': 'TokyoMetro', 'Namboku': 'TokyoMetro', 'Tozai': 'TokyoMetro',
    'Yurakucho': 'TokyoMetro',
    // 都営
    'Asakusa': 'Toei', 'Mita': 'Toei', 'Shinjuku': 'Toei', 'Oedo': 'Toei',
    // 東武
    'Isesaki': 'Tobu', 'Tojo': 'Tobu', 'Nikko': 'Tobu', 'Skytree': 'Tobu',
    'TobuSkytree': 'Tobu', 'Kameido': 'Tobu', 'DobutsuKoen': 'Tobu',
    // 西武
    'Ikebukuro': 'Seibu', 'SeibuYurakucho': 'Seibu', 'SeibuChichibu': 'Seibu',
    'SeibuShinjuku': 'Seibu', 'Tamagawa': 'Seibu', 'Tamako': 'Seibu',
    'Toshima': 'Seibu', 'Yamaguchi': 'Seibu', 'Sayama': 'Seibu', 'Seibuen': 'Seibu',
    'Haijima': 'Seibu', 'Kokubunji': 'Seibu',
    // 京王
    'Keio': 'Keio', 'KeioNew': 'Keio', 'Takao': 'Keio', 'Inokashira': 'Keio',
    'Sagamihara': 'Keio', 'Keibajo': 'Keio', 'Dobutsuen': 'Keio',
    // 小田急
    'Odawara': 'Odakyu', 'Enoshima': 'Odakyu', 'Tama': 'Odakyu',
    'HakoneTozan': 'Odakyu',
    // 京急
    'Airport': 'Keikyu', 'Kurihama': 'Keikyu', 'Zushi': 'Keikyu', 'Daishi': 'Keikyu',
    // 京成
    'KeiseiMain': 'Keisei', 'Oshiage': 'Keisei', 'NaritaSkyAccess': 'Keisei',
    'Chiba': 'Keisei', 'Kanamachi': 'Keisei',
    // 北総・芝山
    'Hokuso': 'Hokuso', 'Shibayama': 'Shibayama',
    // 相鉄
    'Izumino': 'Sotetsu', 'SotetsuShinYokohama': 'Sotetsu',
    // 埼玉高速
    'SaitamaRailway': 'SaitamaRailway',
    // JR 東日本
    'Yamanote': 'JR-East', 'KeihinTohokuNegishi': 'JR-East', 'ChuoRapid': 'JR-East',
    'Chuo': 'JR-East', 'ChuoSobu': 'JR-East', 'ChuoSobuLocal': 'JR-East',
    'Sobu': 'JR-East', 'Yokosuka': 'JR-East', 'Nambu': 'JR-East',
    'SaikyoKawagoe': 'JR-East', 'Kawagoe': 'JR-East', 'ShonanShinjuku': 'JR-East',
    'Takasaki': 'JR-East', 'Utsunomiya': 'JR-East', 'JobanRapid': 'JR-East',
    'Joban': 'JR-East', 'JobanLocal': 'JR-East',
    'Tokaido': 'JR-East', 'Yokohama': 'JR-East', 'Negishi': 'JR-East',
    'Narita': 'JR-East', 'Keiyo': 'JR-East', 'Musashino': 'JR-East',
    'Rinkai': 'JR-East', 'Hachiko': 'JR-East', 'Itsukaichi': 'JR-East',
    'Ome': 'JR-East', 'Haijima': 'JR-East', 'UenoTokyo': 'JR-East',
    'Ito': 'JR-East', 'Uchibo': 'JR-East', 'Sotobo': 'JR-East',
    'TokyuShinYokohama': 'Tokyu', 'ToyoRapid': 'ToyoRapid',
    // JR-East 補完 (57 線)
    'Saikyo': 'JR-East',
    'KawagoeWest': 'JR-East',
    'ChuoMain': 'JR-East',
    'ChuoTatsuno': 'JR-East',
    'Tsurumi': 'JR-East',
    'TsurumiUmiShibaura': 'JR-East',
    'TsurumiOkawa': 'JR-East',
    'KeihinTohoku': 'JR-East',
    'NambuBranch': 'JR-East',
    'SobuRapid': 'JR-East',
    'UtsunomiyaJR': 'JR-East',
    'NaritaAbikoBranch': 'JR-East',
    'NaritaAirportBranch': 'JR-East',
    'Togane': 'JR-East',
    'Sagami': 'JR-East',
    'SobuMain': 'JR-East',
    'Agatsuma': 'JR-East',
    'BanetsuEast': 'JR-East',
    'BanetsuWest': 'JR-East',
    'Echigo': 'JR-East',
    'Gono': 'JR-East',
    'Hachinohe': 'JR-East',
    'Hakushin': 'JR-East',
    'Iiyama': 'JR-East',
    'Ishinomaki': 'JR-East',
    'Joetsu': 'JR-East',
    'Kamaishi': 'JR-East',
    'Kitakami': 'JR-East',
    'Karasuyama': 'JR-East',
    'Kashima': 'JR-East',
    'Kesennuma': 'JR-East',
    'Komii': 'JR-East',
    'Kounan': 'JR-East',
    'Kururi': 'JR-East',
    'Mito': 'JR-East',
    'Miyo': 'JR-East',
    'Ofunato': 'JR-East',
    'Oga': 'JR-East',
    'Oito': 'JR-East',
    'Ominato': 'JR-East',
    'OuMain': 'JR-East',
    'RikutoEast': 'JR-East',
    'RikutsuWest': 'JR-East',
    'Ryomo': 'JR-East',
    'Yamada': 'JR-East',
    'Senseki': 'JR-East',
    'SensekiTohoku': 'JR-East',
    'Senzan': 'JR-East',
    'Shinonoi': 'JR-East',
    'Suigun': 'JR-East',
    'SuigunBranch': 'JR-East',
    'Tadami': 'JR-East',
    'Tazawako': 'JR-East',
    'Tsugaru': 'JR-East',
    'Uetsu': 'JR-East',
    'Yamagata': 'JR-East',
    'Yonezawa': 'JR-East',
    // TokyoMetro 補完 (4 線)
    'ChiyodaBranch': 'TokyoMetro',
    'Ginza': 'TokyoMetro',
    'Marunouchi': 'TokyoMetro',
    'MarunouchiBranch': 'TokyoMetro',
    // Toei 補完 (2 線)
    'Arakawa': 'Toei',
    'Nippori_Toneri': 'Toei',
    // Tobu 補完 (10 線)
    'Noda': 'Tobu',
    'TobuIsesaki': 'Tobu',
    'TobuNikko': 'Tobu',
    'Nikkoku': 'Tobu',
    'Daishi_Tobu': 'Tobu',
    'Tobu_Kameido': 'Tobu',
    'Ogose': 'Tobu',
    'Koizumi': 'Tobu',
    'Sano': 'Tobu',
    'Kiryu': 'Tobu',
    // Seibu 補完 (7 線)
    'SeibuToshima': 'Seibu',
    'Yurakucho_Seibu': 'Seibu',
    'Seibu_Sayama': 'Seibu',
    'SeibuEn': 'Seibu',
    'SeibuTamako': 'Seibu',
    'SeibuTamagawa': 'Seibu',
    'SeibuYamaguchi': 'Seibu',
    // TOKYU 補完 (7 線)
    'TokyuDenEn': 'TOKYU',
    'TokyuToyoko': 'TOKYU',
    'TokyuOimachi': 'TOKYU',
    'TokyuMeguro': 'TOKYU',
    'TokyuIkegami': 'TOKYU',
    'TokyuSetagaya': 'TOKYU',
    'TokyuKodomonokuni': 'TOKYU',
    // YokohamaMunicipal 補完 (2 線)
    'YokohamaBlue': 'YokohamaMunicipal',
    'YokohamaGreen': 'YokohamaMunicipal',
    // Keio 補完 (7 線)
    'KeioInokashira': 'Keio',
    'KeioMain': 'Keio',
    'KeioShin': 'Keio',
    'KeioSagami': 'Keio',
    'KeioTakao': 'Keio',
    'KeioKeibajo': 'Keio',
    'KeioZoo': 'Keio',
    // Odakyu 補完 (2 線)
    'OdakyuEnoshima': 'Odakyu',
    'OdakyuTama': 'Odakyu',
    // Keisei 補完 (5 線)
    'Keisei': 'Keisei',
    'KeiseiOshiage': 'Keisei',
    'KeiseiKanamachi': 'Keisei',
    'KeiseiChiba': 'Keisei',
    'KeiseiChihara': 'Keisei',
    // Keikyu 補完 (5 線)
    'Keikyu': 'Keikyu',
    'KeikyuAirport': 'Keikyu',
    'KeikyuKurihama': 'Keikyu',
    'KeikyuZushi': 'Keikyu',
    'Daishi_Keikyu': 'Keikyu',
    // Sotetsu 補完 (3 線)
    'SotetsuMain': 'Sotetsu',
    'SotetsuIzumino': 'Sotetsu',
    'SotetsuShin-Yokohama': 'Sotetsu',
    // TsukubaExpress 補完 (1 線)
    'TsukubaExpress': 'TsukubaExpress',
    // TamaMonorail 補完 (1 線)
    'TamaMonorail': 'TamaMonorail',
    // MinatoMirai 補完 (1 線)
    'MinatoMirai': 'MinatoMirai',
    // Yurikamome 補完 (1 線)
    'Yurikamome': 'Yurikamome',
    // SaitamaNewUrbanTransit 補完 (1 線)
    'NewShuttle': 'SaitamaNewUrbanTransit',
    // TokyoMonorail 補完 (1 線)
    'TokyoMonorail': 'TokyoMonorail',
  };

  // 各線の「種別短名 → { 直通先 operator: 車両形式 }」マップ
  // 'default' キーは直通先が不明な場合のデフォルト車両。
  var MAP = {
    // ================================================================
    // 東急（参照用——manual 既に内嵌、本表はフォールバックのみ）
    // ================================================================
    'TokyuToyoko': {
      'Local': {
        'default': '5050系 / 5000系',
        'Minatomirai': '5050系 / 5000系 / 5050系4000番台 / 横浜高速鉄道Y500系',
        'TokyoMetro': '5050系 / 5000系 / 東京メトロ10000系 / 17000系',
        'Seibu': '5050系 / 5000系 / 西武6000系',
        'Tobu': '東武50070系 / 5050系 / 5000系 / 東急9000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
      },
      'Express': {
        'default': '5050系4000番台 / 5050系 / 5000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '5050系4000番台 / 東京メトロ17000系',
        'Seibu': '5050系4000番台 / 西武40000系',
        'Tobu': '5050系4000番台 / 東武50070系',
        'Minatomirai': '5050系 / 5000系 / 5050系4000番台 / 横浜高速鉄道Y500系',
      },
      'CommuterLimitedExpress': {
        'default': '5050系4000番台',
        'TokyoMetro': '5050系4000番台 / 東京メトロ17000系',
        'Seibu': '5050系4000番台 / 西武40000系',
        'Tobu': '5050系4000番台 / 東武50070系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
      },
      'LimitedExpress': {
        'default': '5050系4000番台',
        'TokyoMetro': '5050系4000番台 / 東京メトロ17000系',
        'Seibu': '5050系4000番台 / 西武40000系',
        'Tobu': '5050系4000番台 / 東武50070系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
      },
      'F-Liner': {
        'default': '5050系4000番台 / 東武50070系 / 西武40000系 / 東京メトロ17000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
      },
      'S-TRAIN': {
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'default': '西武40000系 / 東武50070系',
      },
    },
    'TokyuDenEn': {
      'Local': { 'default': '5000系 / 2020系', 'TokyoMetro': '東京メトロ8000系 / 08系 / 18000系 / 5000系 / 2020系', 'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系', 'Tokyu': '6020系（7両） / 6000系 / 5000系 / 2020系' },
      'Express': { 'default': '5000系 / 2020系', 'TokyoMetro': '東京メトロ8000系 / 08系 / 18000系 / 5000系 / 2020系', 'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系', 'Tokyu': '6020系（7両） / 6000系 / 5000系 / 2020系' },
      'SemiExpress': { 'default': '5000系 / 2020系', 'TokyoMetro': '東京メトロ8000系 / 08系 / 18000系 / 5000系 / 2020系', 'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系', 'Tokyu': '6020系（7両） / 6000系 / 5000系 / 2020系' },
    },
    'TokyuOimachi': {
      'Local': { 'default': '6020系（5両） / 9000系 / 9020系', 'TokyuDenEn': '6020系（5両） / 9000系 / 9020系 / 5000系 / 2020系' },
      'Express': { 'default': '6020系（7両） / 6000系', 'TokyuDenEn': '6020系（7両） / 6000系 / 5000系 / 2020系' },
    },
    'TobuNikko': {
      'Local': { 'default': '東武20400系 / 東武10000系 / 東武10030系 / 東武10080系' },
      'TH-LINER': { 'default': '東武70090系' },
      'Express': { 'default': '東武10000系 / 東武10030系 / 東武10080系' },
      'SemiExpress': { 'default': '東武10000系 / 東武10030系 / 東武10080系' },
      'SectionExpress': { 'default': '東武10000系 / 東武10030系 / 東武10080系' },
      'SectionSemiExpress': { 'default': '東武10000系 / 東武10030系 / 東武10080系' },
      'LimitedExpress': { 'default': '東武N100系（スペーシアX） / 東武100系（スペーシア） / 東武500系（リバティ）', 'destStation': { 'AizuTajima': '東武500系（リバティ会津）', 'Shinjuku': '東武500系（リバティ）' } },
    },
    'TokyuMeguro': {
      'Local': { 'default': '3000系 / 東急5080系 / 3020系', 'TokyoMetro': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 3020系', 'Toei': '都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系', 'SaitamaRailway': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 埼玉高速2000系', 'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急3000系 / 東急5080系 / 3020系', 'SotetsuShin-Yokohama': '相鉄20000系 / 相鉄21000系 / 東急3000系 / 東急5080系 / 3020系' },
      'Express': { 'default': '3000系 / 東急5080系 / 3020系', 'TokyoMetro': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 3020系', 'Toei': '都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系', 'SaitamaRailway': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 埼玉高速2000系', 'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急3000系 / 東急5080系 / 3020系', 'SotetsuShin-Yokohama': '相鉄20000系 / 相鉄21000系 / 東急3000系 / 東急5080系 / 3020系' },
    },

    // ================================================================
    // 東京メトロ 7 線
    // ================================================================
    'Chiyoda': {
      'Express': {
        'default': '東京メトロ16000系 / 小田急4000形',
        'Odakyu': '小田急4000形 / 東京メトロ16000系',
        'JR-East': '東京メトロ16000系 / E233系2000番台 / 小田急4000形'
      },
      'LimitedExpress': {
        'default': '小田急60000系(MSE)',
        'Odakyu': '小田急60000系(MSE)'
      },
      'Local': {
        'default': '東京メトロ16000系 / 東京メトロ05系（北綾瀬） / E233系2000番台 / 小田急4000形',
        'TokyoMetro': '東京メトロ16000系 / 05系',
        'Odakyu': '小田急4000形 / 東京メトロ16000系 / E233系2000番台',
        'JR-East': '東京メトロ16000系 / E233系2000番台 / 小田急4000形'
      },
      'SemiExpress': {
        'default': '東京メトロ16000系 / 小田急4000形',
        'Odakyu': '小田急4000形 / 東京メトロ16000系',
        'JR-East': '東京メトロ16000系 / E233系2000番台 / 小田急4000形'
      }
    },
    'Fukutoshin': {
      'CommuterExpress': {
        'default': '東京メトロ17000系 / 10000系',
        'TokyoMetro': '東京メトロ17000系 / 10000系',
        'Minatomirai': '東京メトロ17000系 / 東急5050系 / 横浜高速Y500系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Sotetsu': '東急5050系 / 相鉄20000系',
        'Tokyu': '5050系4000番台 / 東京メトロ17000系'
      },
      'Express': {
        'default': '東京メトロ17000系 / 10000系',
        'TokyoMetro': '東京メトロ17000系 / 10000系',
        'Minatomirai': '東京メトロ17000系 / 東急5050系 / 横浜高速Y500系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Sotetsu': '東急5050系 / 相鉄20000系',
        'Tokyu': '5050系4000番台 / 東京メトロ17000系'
      },
      'F-Liner': {
        'default': '5050系4000番台 / 東武50070系 / 西武40000系 / 東京メトロ17000系',
        'Minatomirai': '5050系4000番台 / 東武50070系 / 西武40000系 / 東京メトロ17000系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Tokyu': '5050系4000番台 / 東武50070系 / 西武40000系 / 東京メトロ17000系'
      },
      'Local': {
        'default': '東京メトロ10000系 / 17000系',
        'TokyoMetro': '東京メトロ10000系 / 17000系',
        'Tokyu': '5050系 / 5000系 / 東京メトロ10000系 / 17000系',
        'Tobu': '東武90000系 / 東武50070系 / 東京メトロ10000系 / 17000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Minatomirai': '東京メトロ10000系 / 17000系 / 横浜高速Y500系',
        'Sotetsu': '東急5050系 / 相鉄20000系'
      },
      'S-TRAIN': {
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'default': '西武40000系',
        'Seibu': '西武40000系',
        'Minatomirai': '西武40000系 / 横浜高速Y500系'
      }
    },
    'Hanzomon': {
      'Express': {
        'default': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 5000系 / 2020系',
        'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系'
      },
      'Local': {
        'default': '東京メトロ8000系 / 08系 / 18000系',
        'TokyoMetro': '東京メトロ8000系 / 08系 / 18000系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 5000系 / 2020系'
      },
      'SemiExpress': {
        'default': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 5000系 / 2020系',
        'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系'
      }
    },
    'Hibiya': {
      'Local': {
        'default': '東京メトロ13000系',
        'TokyoMetro': '東京メトロ13000系',
        'Tobu': '東京メトロ13000系 / 東武70000系'
      },
      'TH-LINER': {
        'default': '東武70090系',
        'TokyoMetro': '東武70090系',
        'Tobu': '東武70090系'
      }
    },
    'Namboku': {
      'Express': {
        'default': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 相鉄20000系 / 21000系',
        'Tokyu': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 3020系',
        'Sotetsu': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 相鉄20000系 / 21000系'
      },
      'Local': {
        'default': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 相鉄20000系 / 21000系',
        'TokyoMetro': '東京メトロ9000系 / 東京メトロ9000系（5次車）',
        'Tokyu': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 東急3000系 / 東急5080系 / 3020系',
        'Sotetsu': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 相鉄20000系 / 21000系',
        'SaitamaRailway': '東京メトロ9000系 / 東京メトロ9000系（5次車） / 埼玉高速2000系'
      }
    },
    'Tozai': {
      'CommuterRapid': {
        'default': '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系 / E231系800番台（東西線直通）',
        'TokyoMetro': '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系',
        'JR-East': 'E231系800番台（東西線直通） / 東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系'
      },
      'Local': {
        'default': '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系 / E231系800番台（東西線直通） / 東葉高速2000系',
        'TokyoMetro': '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系',
        'JR-East': 'E231系800番台（東西線直通） / 東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系'
      },
      'Rapid': {
        'default': '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系 / E231系800番台（東西線直通） / 東葉高速2000系',
        'TokyoMetro': '東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系',
        'JR-East': 'E231系800番台（東西線直通） / 東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系'
      }
    },
    'Yurakucho': {
      'Local': {
        'default': '東京メトロ10000系 / 17000系',
        'TokyoMetro': '東京メトロ10000系 / 17000系',
        'Tobu': '東武90000系 / 東武50070系 / 東京メトロ10000系 / 17000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系'
      },
      'Rapid': {
        'default': '東京メトロ10000系 / 17000系 / 西武6000系 / 西武40000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系'
      },
      'RapidExpress': {
        'default': '東京メトロ10000系 / 17000系 / 西武6000系 / 西武40000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系'
      },
      'S-TRAIN': {
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'default': '西武40000系',
        'TokyoMetro': '西武40000系',
        'Seibu': '西武40000系'
      },
      'SemiExpress': {
        'default': '東京メトロ10000系 / 17000系 / 西武6000系 / 西武40000系',
        'Seibu': '西武40000系 / 西武6000系 / 東京メトロ10000系 / 17000系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系'
      }
    },

    // ================================================================
    // 都営 3 線
    // ================================================================
    'Asakusa': {
      'Local': {
        'default': '都営5500形',
        'Keikyu': '都営5500形 / 新1000形 / 京急1500形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Tobu': '都営5500形 / 東武8000系',
        'Hokuso': '都営5500形 / 北総7500形 / 北総9100形'
      },
      'AccessExpress': {
        'default': '都営5500形 / 京成3000形',
        'Keisei': '京成3100形(50番台) / 京成3000形（アクセス特急）',
        'KeiseiOshiage': '京成3100形(50番台) / 京成3000形（アクセス特急）'
      },
      'Rapid': {
        'default': '都営5500形',
        'Keikyu': '都営5500形 / 新1000形 / 京急1500形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'KeiseiOshiage': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Shibayama': '都営5500形 / 京成3000形'
      },
      'AirportRapidLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形'
      },
      'RapidLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Shibayama': '都営5500形 / 京成3000形'
      },
      'LimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Hokuso': '都営5500形 / 北総7500形',
        'Shibayama': '都営5500形 / 京成3000形'
      },
      'CommuterLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 新1000形 / 1500形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'KeiseiOshiage': '京成3000形 / 京成3700形 / 3050形 / 都営5500形'
      },
      'Express': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形',
        'Keisei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'KeiseiOshiage': '京成3000形 / 京成3700形 / 3050形 / 都営5500形'
      }
    },
    'Mita': {
      'Local': {
        'default': '都営6300形 / 6500形',
        'Tokyu': '都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系',
        'Sotetsu': '相鉄21000系 / 都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系'
      },
      'Express': {
        'default': '都営6300形 / 6500形',
        'Tokyu': '都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系',
        'Sotetsu': '相鉄21000系 / 都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系'
      }
    },
    'Shinjuku': {
      'Local': {
        'default': '都営10-300形',
        'Keio': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形'
      },
      'Express': {
        'default': '都営10-300形',
        'Keio': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形'
      }
    },

    // ================================================================
    // 東武 3 線
    // ================================================================
    'TobuSkytree': {
      'Local': {
        'default': '東武8000系 / 東武50050系',
        'Toei': '東武8000系 / 都営5500形',
        'TokyoMetro': '東京メトロ13000系 / 東武70000系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系',
        'Isesaki': '東武8000系 / 東武50050系'
      },
      'SectionExpress': {
        'default': '東武8000系 / 東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'SemiExpress': {
        'default': '東武50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'Express': {
        'default': '東武50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系'
      },
      'SectionSemiExpress': {
        'default': '東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'LimitedExpress': {
        'default': '東武100系（スペーシア）/ 東武500系（リバティ）/ 東武200系（りょうもう）',
        'Nikko': '東武N100系（スペーシアX） / 東武100系（スペーシア） / 東武500系（リバティ）'
      },
      'TH-LINER': {
        'default': '東武70090系',
        'Nikko': '東武70090系'
      }
    },
    'TobuIsesaki': {
      'Local': {
        'default': '東武8000系 / 東武50050系',
        'TokyoMetro': '東京メトロ13000系 / 東武70000系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'Express': {
        'default': '東武50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'SemiExpress': {
        'default': '東武50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'SectionExpress': {
        'default': '東武8000系 / 東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'SectionSemiExpress': {
        'default': '東武50050系',
        'Hanzomon': '東京メトロ8000系 / 08系 / 18000系 / 東武50050系',
        'Hibiya': '東京メトロ13000系 / 東武70000系',
        'Nikko': '東武10000系 / 東武10030系 / 東武50050系'
      },
      'LimitedExpress': {
        'default': '東武100系（スペーシア）/ 東武500系（リバティ）/ 東武200系（りょうもう）',
        'Nikko': '東武N100系（スペーシアX） / 東武100系（スペーシア） / 東武500系（リバティ）'
      },
      'TH-LINER': {
        'default': '東武70090系',
        'Nikko': '東武70090系'
      },
      'F-Liner': {
        'default': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'Fukutoshin': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'TokyoMetro': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系'
      }
    },
    'Tojo': {
      'Local': {
        'default': '東武90000系 / 東武50000系 / 東武50030系 / 東武30000系 / 東武10000系 / 東武10030系',
        'TokyoMetro': '東武90000系 / 東武50070系 / 東京メトロ10000系 / 17000系',
        'Minatomirai': '東武90000系 / 東武50070系',
        'Tokyu': '東武50070系 / 東急5050系 / 東急5000系',
        'Sotetsu': '東武50070系 / 東急5050系'
      },
      'SemiExpress': {
        'default': '東武90000系 / 東武50000系 / 東武50030系 / 東武30000系',
        'TokyoMetro': '東武90000系 / 東武50070系 / 東京メトロ17000系 / 東京メトロ10000系'
      },
      'Express': {
        'default': '東武90000系 / 東武50000系 / 東武50030系 / 東武30000系 / 東武50090系',
        'TokyoMetro': '東武90000系 / 東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'Minatomirai': '東武90000系 / 東武50070系',
        'Sotetsu': '東武50070系 / 東急5050系'
      },
      'RapidExpress': {
        'default': '東武90000系 / 東武50000系 / 東武50030系 / 東武30000系 / 東武50090系',
        'TokyoMetro': '東武90000系 / 東武50070系 / 東京メトロ17000系 / 東京メトロ10000系',
        'Minatomirai': '東武90000系 / 東武50070系',
        'Sotetsu': '東武50070系 / 東急5050系'
      },
      'KawagoeLimitedExpress': {
        'default': '東武50090系 / 東武50070系 / 東武90000系'
      },
      'TJ-Liner': {
        'default': '東武50090系'
      }
    },

    // ================================================================
    // 京王 2 線
    // ================================================================
    'Keio': {
      'Local': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'Rapid': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'SemiExpress': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'Express': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'KeioLiner': { 'default': '京王電鉄5000系' },
    },
    'KeioMain': {
      'Local': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'Rapid': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'SemiExpress': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'Express': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'KeioLiner': { 'default': '京王電鉄5000系' },
    },

    // ================================================================
    // 相鉄 3 線
    // ================================================================
    'SotetsuMain': {
      'Local': {
        'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 10000系 / 11000系',
        'JR-East': '相鉄12000系 / JR E233系7000番台',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / 東急5050系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
      },
      'Rapid': {
        'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 10000系 / 11000系',
        'JR-East': '相鉄12000系 / 相鉄20000系 / 相鉄21000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
      },
      'CommuterExpress': {
        'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
        'JR-East': '相鉄12000系 / 相鉄20000系 / 相鉄21000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
      },
      'LimitedExpress': {
        'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
        'JR-East': '相鉄12000系 / 相鉄20000系 / 相鉄21000系',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
      },
      'CommuterLimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'JR-East': '相鉄12000系 / 相鉄20000系 / 相鉄21000系',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
      },
    },
    'SotetsuIzumino': {
      'Local': {
        'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
        'JR-East': '相鉄12000系 / JR E233系7000番台',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
      },
      'Rapid': { 'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系', 'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系' },
      'CommuterExpress': { 'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系', 'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系' },
      'LimitedExpress': {
        'default': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 12000系 / 9000系 / 11000系',
      },
      'CommuterLimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'JR-East': '相鉄12000系 / 相鉄20000系 / 相鉄21000系',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
      },
    },
    'SotetsuShin-Yokohama': {
      'Local': {
        'default': '相鉄20000系 / 21000系 / 12000系',
        'Sotetsu': '相鉄20000系 / 21000系 / 12000系',
        'JR-East': '相鉄12000系 / JR E233系7000番台',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急3000系 / 東急5080系 / 3020系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形 / 東急3000系 / 東急5080系 / 3020系',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
      },
      'LimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'JR-East': '相鉄12000系 / JR E233系7000番台',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
        'Sotetsu': '相鉄20000系 / 21000系',
      },
      'CommuterLimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'JR-East': '相鉄12000系 / 相鉄20000系 / 相鉄21000系',
        'Tokyu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '東武50070系 / 相鉄20000系 / 東急5050系',
      },
    },

    // ================================================================
    // 京急
    // ================================================================
    'Keikyu': {
      'Local': { 'default': '新1000形 / 1500形 / 600形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'Express': { 'default': '新1000形 / 1500形 / 600形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'Rapid': { 'default': '新1000形 / 1500形 / 600形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'LimitedExpress': { 'default': '新1000形 / 1500形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'RapidLimitedExpress': { 'default': '新1000形 / 1500形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'AirportRapidLimitedExpress': { 'default': '新1000形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'AccessExpress': { 'default': '新1000形', 'Toei': '都営5500形 / 新1000形 / 京急1500形 / 京成3000形' },
      'CommuterLimitedExpress': { 'default': '新1000形 / 1500形', 'Toei': '都営5500形 / 新1000形 / 1500形' },
      'MorningWing': { 'default': '2100形' },
      'EveningWing': { 'default': '2100形' },
    },

    // ================================================================
    // 小田急
    // ================================================================
    'Odawara': {
      'Local': {
        'default': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系 / JR E233系2000番台',
        'Odakyu': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
      },
      'SemiExpress': {
        'default': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
        'Odakyu': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
      },
      'Express': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
        'Odakyu': '1000形 / 3000形 / 4000形 / 5000形',
      },
      'RapidExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
        'Odakyu': '1000形 / 3000形 / 4000形 / 5000形',
      },
      'CommuterExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
      },
      'CommuterSemiExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
      },
      'LimitedExpress': {
        'default': '小田急電鉄30000形EXEα / 60000形 / 70000形',
        'TokyoMetro': '小田急60000系(MSE)',
      },
    },
    'OdakyuTama': {
      'Local': {
        'default': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
        'Odakyu': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
      },
      'Express': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
      },
      'RapidExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
      },
      'CommuterExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / 東京メトロ16000系',
      },
    },

    // ================================================================
    // 西武
    // ================================================================
    'Ikebukuro': {
      'Local': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / 西武6000系 / メトロ17000系 / 東京メトロ10000系',
        'Seibu': '西武6000系 / 西武30000系 / 西武20000系',
      },
      'SemiExpress': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / 西武6000系 / メトロ17000系',
      },
      'Express': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / 西武6000系 / メトロ17000系',
      },
      'Rapid': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / 西武6000系 / メトロ17000系',
      },
      'RapidExpress': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / 西武6000系 / メトロ17000系',
      },
      'CommuterExpress': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'CommuterSemiExpress': {
        'default': '西武6000系 / 西武30000系 / 西武20000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'LimitedExpress': {
        'default': '西武001系（ラビュー） / 西武10000系（ニューレッドアロー）',
      },
      'F-Liner': {
        'default': '西武40000系 / 東武50070系 / メトロ17000系 / 東急5050系4000番台',
      },
      'S-TRAIN': {
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'default': '西武40000系(デュアルシート)',
      },
    },
    'Yurakucho_Seibu': {
      'Local': {
        'default': '西武6000系 / 西武40000系',
        'TokyoMetro': '西武40000系 / 西武6000系 / メトロ17000系 / 東京メトロ10000系',
        'Seibu': '西武6000系 / 西武40000系',
      },
      'SemiExpress': {
        'default': '西武6000系 / 西武40000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'Rapid': {
        'default': '西武6000系 / 西武40000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'RapidExpress': {
        'default': '西武6000系 / 西武40000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'F-Liner': {
        'default': '西武40000系 / 東武50070系 / メトロ17000系 / 東急5050系4000番台',
      },
      'LimitedExpress': {
        'default': '西武40000系 / 西武6000系',
        'Seibu': '西武40000系 / 西武6000系'
      },
      'S-TRAIN': {
        'default': '西武40000系',
        'Seibu': '西武40000系'
      },
    },

    // ================================================================
    // みなとみらい線
    // ================================================================
    'MinatoMirai': {
      'Local': {
        'default': 'Y500系 / 東急5050系 / 5000系',
        'Tokyu': '5050系 / 5000系 / 5050系4000番台 / 横浜高速鉄道Y500系',
        'TokyoMetro': 'Y500系 / 東急5050系 / メトロ17000系 / 東武50070系 / 西武40000系',
        'Seibu': 'Y500系 / 東急5050系 / 西武40000系',
        'Tobu': '東武50070系 / Y500系 / 東急5050系',
      },
      'F-Liner': {
        'default': '東京メトロ17000系 / 東武50070系 / 西武40000系 / 横浜高速Y500系',
        'Tokyu': '5050系4000番台 / 東武50070系 / 西武40000系 / 東京メトロ17000系',
        'Tobu': '東武50070系 / 東京メトロ17000系 / 東京メトロ10000系'
      },
      'S-TRAIN': {
        'Sotetsu': '相鉄20000系 / 相鉄21000系 / 東急5050系 / 5050系4000番台',
        'default': '西武40000系 / 横浜高速Y500系',
        'Tokyu': '西武40000系 / 東武50070系'
      },
    },

    // ================================================================
    // JR 東日本 首都圏 24 線
    // ================================================================
    'ChuoRapid': {
      'Rapid': { 'default': 'E233系0番台' },
      'ChuoSpecialRapid': { 'default': 'E233系0番台' },
      'CommuterSpecialRapid': { 'default': 'E233系0番台' },
      'CommuterRapid': { 'default': 'E233系0番台' },
      'OmeSpecialRapid': { 'default': 'E233系0番台' },
      'SpecialRapid': { 'default': 'E233系0番台' },
    },
    'ChuoSobuLocal': {
      'Local': {
        'default': 'E231系500番台 / E231系0番台',
        'TokyoMetro': 'E231系500番台 / E231系0番台 / 東京メトロ05系 / 東京メトロ07系 / 東京メトロ15000系'
      },
      'LimitedExpress': { 'default': 'E353系（あずさ・かいじ）' },
    },
    'Hachiko': {
      'Local': { 'default': '209系3500番台' },
    },
    'Ito': {
      'Local': { 'default': 'E231系1000番台 / 伊豆急行8000系' },
      'LimitedExpress': { 'default': 'E257系2000番台 / E257系2500番台' },
    },
    'Itsukaichi': {
      'Local': { 'default': 'E233系0番台' },
    },
    'Joban': {
      'Rapid': { 'default': 'E231系0番台' },
      'Local': { 'default': 'E231系0番台' },
      'SpecialRapid': { 'default': 'E531系' },
      'LimitedExpress': { 'default': 'E657系（ときわ・ひたち）' },
    },
    'JobanLocal': {
      'Local': {
        'default': 'E233系2000番台',
        'TokyoMetro': '東京メトロ16000系 / E233系2000番台 / 小田急4000形',
        'Odakyu': '小田急4000形 / 東京メトロ16000系'
      },
    },
    'Kawagoe': {
      'Local': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系', 'TWR': 'E233系7000番台 / 71-000形 / 70-000形' },
      'Rapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系', 'TWR': 'E233系7000番台 / 71-000形 / 70-000形' },
      'CommuterRapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系', 'TWR': 'E233系7000番台 / 71-000形 / 70-000形' },
    },
    'KawagoeWest': {
      'Local': { 'default': '209系3500番台' },
    },
    'Keiyo': {
      'Local': { 'default': 'E233系5000番台' },
      'Rapid': { 'default': 'E233系5000番台' },
      'LimitedExpress': { 'default': 'E257系500番台' },
    },
    'Musashino': {
      'Local': { 'default': 'E231系0番台' },
    },
    'Narita': {
      'Local': { 'default': '209系2000番台 / E231系0番台' },
      'Rapid': { 'default': '209系2000番台 / E231系0番台' },
      'LimitedExpress': { 'default': 'E259系（成田エクスプレス）' },
    },
    'Ome': {
      'Rapid': { 'default': 'E233系0番台' },
      'Local': { 'default': 'E233系0番台' },
      'OmeSpecialRapid': { 'default': 'E233系0番台' },
      'CommuterSpecialRapid': { 'default': 'E233系0番台' },
      'CommuterRapid': { 'default': 'E233系0番台' },
      'SpecialRapid': { 'default': 'E233系0番台' },
    },
    'Rinkai': {
      'Local': { 'default': '71-000形 / 70-000形', 'JR-East': 'E233系7000番台', 'TWR': '71-000形 / 70-000形' },
      'Rapid': { 'default': '71-000形 / 70-000形', 'JR-East': 'E233系7000番台', 'TWR': '71-000形 / 70-000形' },
      'CommuterRapid': { 'default': '71-000形 / 70-000形', 'JR-East': 'E233系7000番台', 'TWR': '71-000形 / 70-000形' },
    },
    'Saikyo': {
      'Local': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系' },
      'Rapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系' },
      'CommuterRapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系' },
    },
    'ShonanShinjuku': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': '253系（日光・きぬがわ）' },
    },
    'SobuRapid': {
      'Rapid': { 'default': 'E235系1000番台' },
      'LimitedExpress': {
        'default': 'E259系（成田エクスプレス）/ E257系500番台（しおさい）',
        'destStation': {
          'NaritaAirportTerminal1': 'E259系（成田エクスプレス）',
          'NaritaAirportTerminal2': 'E259系（成田エクスプレス）',
          'Choshi': 'E257系500番台（しおさい）',
          'Sakura': 'E257系500番台（しおさい）',
          'Naruto': 'E257系500番台（しおさい）',
          'Matsumoto': 'E353系（あずさ・富士回遊）'
        }
      },
    },
    'Sotobo': {
      'Rapid': { 'default': 'E233系5000番台 / E235系1000番台' },
      'Local': { 'default': 'E233系5000番台 / E235系1000番台' },
      'LimitedExpress': { 'default': 'E257系500番台' },
    },
    'Takasaki': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': 'E257系（草津・四萬・あかぎ）' },
    },
    'Tokaido': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': {
        'default': 'E257系2000番台 / 2500番台 / 伊豆急行8000系',
        'destStation': {
          'IzukyuShimoda': 'E257系2000番台 / 2500番台（踊り子）/ 伊豆急行8000系',
          'Odawara': 'E257系2000番台 / 2500番台（湘南）',
          'Hiratsuka': 'E257系2000番台 / 2500番台（湘南）',
          'Izumoshi': '285系（サンライズ出雲）'
        }
      },
    },
    'Uchibo': {
      'Local': { 'default': 'E233系5000番台 / E235系1000番台' },
      'Rapid': { 'default': 'E233系5000番台 / E235系1000番台' },
      'LimitedExpress': { 'default': 'E257系500番台' },
    },
    'UenoTokyo': {
      'Local': {
        'default': 'E231系1000番台 / E233系3000番台',
        'destStation': {
          'Nippori': 'E231系0番台', 'Mikawashima': 'E231系0番台', 'Minamisenju': 'E231系0番台', 'KitaSenju': 'E231系0番台',
          'Ayase': 'E231系0番台', 'Kameari': 'E231系0番台', 'Kanamachi': 'E231系0番台', 'Matsudo': 'E231系0番台',
          'KitaMatsudo': 'E231系0番台', 'Mabashi': 'E231系0番台', 'ShinMatsudo': 'E231系0番台', 'Kitakogane': 'E231系0番台',
          'MinamiKashiwa': 'E231系0番台', 'Kashiwa': 'E231系0番台', 'Kitakashiwa': 'E231系0番台', 'Abiko': 'E231系0番台',
          'Tennodai': 'E231系0番台', 'Toride': 'E231系0番台'
        }
      },
      'Rapid': {
        'default': 'E231系1000番台 / E233系3000番台',
        'destStation': {
          'Nippori': 'E231系0番台', 'Mikawashima': 'E231系0番台', 'Minamisenju': 'E231系0番台', 'KitaSenju': 'E231系0番台',
          'Ayase': 'E231系0番台', 'Kameari': 'E231系0番台', 'Kanamachi': 'E231系0番台', 'Matsudo': 'E231系0番台',
          'KitaMatsudo': 'E231系0番台', 'Mabashi': 'E231系0番台', 'ShinMatsudo': 'E231系0番台', 'Kitakogane': 'E231系0番台',
          'MinamiKashiwa': 'E231系0番台', 'Kashiwa': 'E231系0番台', 'Kitakashiwa': 'E231系0番台', 'Abiko': 'E231系0番台',
          'Tennodai': 'E231系0番台', 'Toride': 'E231系0番台'
        }
      },
    },
    'UtsunomiyaJR': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': '253系（日光・きぬがわ）' },
    },
    'Yokosuka': {
      'Local': { 'default': 'E235系1000番台 / E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E235系1000番台 / E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': 'E259系（成田エクスプレス）' },
    },

    // ================================================================
    // 中央本線（高尾～塩尻）
    // ================================================================
    'ChuoMain': {
      'Local': { 'default': 'E233系0番台 / 211系', 'JR-East': 'E233系0番台 / 211系' },
      'Rapid': { 'default': 'E233系0番台 / 211系', 'JR-East': 'E233系0番台 / 211系' },
      'CommuterRapid': { 'default': 'E233系0番台', 'JR-East': 'E233系0番台' },
      'ChuoSpecialRapid': { 'default': 'E233系0番台', 'JR-East': 'E233系0番台' },
      'LimitedExpress': { 'default': 'E353系（あずさ・かいじ）' },
    },

    // ================================================================
    // 京成 3 線（ODPT 时刻表数据缺失，车型基于公开资料手工补全）
    // 直通关系：Keisei⇄Asakusa(都営) / Keisei⇄KeiseiOshiage / Keisei⇄NaritaSkyAccess
    // ================================================================

    // 京成本線（京成上野～成田空港）
    // 車両情報: 京成公式「車両紹介」(accessj/sharyou.php) + 2022/2/26 ダイヤ改正（特急・通勤特急新設）
    'Keisei': {
      'Local': {
        'default': '3000形 / 3050形 / 3700形 / 3600形 / 3500形 / 3400形',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'Rapid': {
        'default': '3000形 / 3050形 / 3700形 / 3600形',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'LimitedExpress': {
        'default': '3000形 / 3050形 / 3700形（特急）',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'RapidLimitedExpress': {
        'default': '3000形 / 3050形 / 3700形（快速特急）',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'CommuterLimitedExpress': {
        'default': '3000形 / 3050形 / 都営5500形（通勤特急）',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'AccessExpress': {
        'default': '京成3100形(50番台) / 京成3000形（アクセス特急） / 3050形（スカイアクセス）',
        'NaritaSkyAccess': '京成3100形(50番台) / 京成3000形（アクセス特急）',
        'Toei': '京成3100形(50番台) / 京成3000形（アクセス特急）',
        'Keikyu': '京急1500形 / 600形 / 京成3100形 / 3050形',
        'Hokuso': '京成3100形 / 3050形 / 北総7500形（スカイアクセス直通）'
      },
      'Skyliner': {
        'default': 'AE形（スカイライナー）'
      },
      'MorningLiner': {
        'default': 'AE100形 / AE形（ライナー車両）'
      },
      'EveningLiner': {
        'default': 'AE100形 / AE形（ライナー車両）'
      }
    },

    // 京成押上線（押上～青砥）
    'KeiseiOshiage': {
      'Local': {
        'default': '京成3000形 / 3700形 / 3600形',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形'
      },
      'Rapid': {
        'default': '京成3600形 / 3700形'
      },
      'LimitedExpress': {
        'default': '京成3000形 / 3700形',
        'Toei': '京成3000形 / 京成3700形 / 3050形 / 都営5500形'
      },
      'AccessExpress': {
        'default': '京成3100形(50番台) / 京成3000形（アクセス特急）',
        'Toei': '京成3100形(50番台) / 京成3000形（アクセス特急）'
      }
    },

    // 成田スカイアクセス線（京成高砂～成田空港）
    'NaritaSkyAccess': {
      'Local': { 'default': '京成3100形(50番台) / 京成3000形（アクセス特急）', 'Keisei': '3000形 / 3050形 / 3700形 / 3600形 / 3500形 / 3400形' },
      'Rapid': { 'default': '京成3100形(50番台) / 京成3000形（アクセス特急）', 'Keisei': '3000形 / 3050形 / 3700形 / 3600形' },
      'LimitedExpress': { 'default': '京成3100形(50番台) / 京成3000形（アクセス特急）', 'Keisei': '3000形 / 3050形 / 3700形（特急）' },
      'RapidLimitedExpress': { 'default': '京成3100形(50番台) / 京成3000形（アクセス特急）', 'Keisei': '3000形 / 3050形 / 3700形（快速特急）' },
      'CommuterLimitedExpress': { 'default': '京成3100形(50番台) / 京成3000形（アクセス特急）', 'Keisei': '3000形 / 3050形 / 都営5500形（通勤特急）' },
      'MorningLiner': { 'default': 'AE100形 / AE形（ライナー車両）' },
      'EveningLiner': { 'default': 'AE100形 / AE形（ライナー車両）' },
      'AccessExpress': {
        'default': '京成3100形(50番台) / 京成3000形（アクセス特急）',
        'Keisei': '京成3100形(50番台) / 京成3000形（アクセス特急）'
      },
      'Skyliner': {
        'default': 'AE形（スカイライナー）',
        'Keisei': 'AE形（スカイライナー）'
      }
    },

    // ================================================================
    // 無直通路線（デフォルトのみ）— 4.3.640
    // ================================================================

    // --- JR 東日本地方線 ---
    'BanetsuEast': {
      'Local': { 'default': 'キハ110系' }
    },
    'BanetsuWest': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系' }
    },
    'ChuoTatsuno': {
      'Local': { 'default': '211系 / E127系100番台' },
      'Rapid': { 'default': '211系 / E127系100番台' }
    },
    'Echigo': {
      'Local': { 'default': 'E127系' }
    },
    'Gono': {
      'Local': { 'default': 'GV-E400系' },
      'Rapid': { 'default': 'HB-E300系（リゾートしらかみ）' }
    },
    'Hachinohe': {
      'Local': { 'default': 'キハE130形500番台' }
    },
    'Iiyama': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系' }
    },
    'Ishinomaki': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系0番台（快速南三陸）' }
    },
    'Kamaishi': {
      'Local': { 'default': 'HB-E220系' },
      'Rapid': { 'default': 'HB-E220系（快速はまゆり）' }
    },
    'Karasuyama': {
      'Local': { 'default': 'EV-E301系（ACCUM）' }
    },
    'Kesennuma': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系' }
    },
    'Kitakami': {
      'Local': { 'default': 'キハ110系' }
    },
    'Komii': {
      'Local': { 'default': 'キハ110系100番台' },
      'Rapid': { 'default': 'キハ110系100番台（HIGH RAIL 1375）' }
    },
    'Kounan': {
      'Local': { 'default': 'キハ110系' }
    , 'Rapid': { 'default': 'キハ110系' } },
    'Mito': {
      'Local': { 'default': 'E501系 / E531系' }
    },
    'Miyo': {
      'Local': { 'default': 'E127系' }
    , 'Rapid': { 'default': 'E127系' } },
    'Ofunato': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系' }
    },
    'Oga': {
      'Local': { 'default': 'EV-E801系（ACCUM）' }
    },
    'Oito': {
      'Local': { 'default': 'E127系100番台' },
      'Rapid': { 'default': 'HB-E300系（リゾートビューふるさと）' },
      'LimitedExpress': { 'default': 'E353系（あずさ）' }
    },
    'Ominato': {
      'Local': { 'default': 'キハ100系 / キハ110系' },
      'Rapid': { 'default': 'キハ100系 / キハ110系' }
    },
    'OuMain': {
      'Local': { 'default': '701系 / E721系 / GV-E400系', 'Gono': 'GV-E400系 / 701系 / E721系', 'Tazawako': '701系5000番台' },
      'Rapid': { 'default': '701系 / E721系 / GV-E400系', 'Gono': 'GV-E400系 / 701系 / E721系', 'Tazawako': '701系5000番台' },
      'LimitedExpress': { 'default': 'E6系（こまち）/ E8系（つばさ）' }
    },
    'RikutoEast': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系' }
    },
    'RikutsuWest': {
      'Local': { 'default': 'キハ110系' },
      'Rapid': { 'default': 'キハ110系' }
    },
    'Ryomo': {
      'Local': { 'default': 'E231系1000番台 / E233系' },
      'Rapid': { 'default': 'E231系1000番台 / E233系' }
    },
    'Senseki': {
      'Local': { 'default': 'E131系800番台' },
      'Rapid': { 'default': 'E131系800番台' },
      'SpecialRapid': { 'default': 'E131系800番台' }
    },
    'SensekiTohoku': {
      'Local': { 'default': 'HB-E210系' },
      'Rapid': { 'default': 'HB-E210系' },
      'SpecialRapid': { 'default': 'HB-E210系' }
    },
    'Senzan': {
      'Local': { 'default': 'E721系 / 701系' },
      'Rapid': { 'default': 'E721系 / 701系' }
    },
    'Shinetsu': {
      'Local': { 'default': '211系 / E129系' },
      'Rapid': { 'default': 'E129系' },
      'LimitedExpress': { 'default': 'E653系（しらゆき）' }
    },
    'Shinonoi': {
      'Local': { 'default': '211系 / E127系100番台' },
      'Rapid': { 'default': 'E129系 / 211系' },
      'LimitedExpress': { 'default': '383系（しなの・JR東海）/ E353系（あずさ）' }
    },
    'Suigun': {
      'Local': { 'default': 'キハE130系 / キハ110系' }
    },
    'SuigunBranch': {
      'Local': { 'default': 'キハE130系 / キハ110系' }
    },
    'Tadami': {
      'Local': { 'default': 'キハ110系 / キハE120形' }
    , 'Rapid': { 'default': 'キハ110系 / キハE120形' } },
    'Tazawako': {
      'Local': { 'default': '701系5000番台' },
      'Rapid': { 'default': '701系5000番台' },
      'LimitedExpress': { 'default': 'E6系（こまち）' }
    },
    'TohokuMain': {
      'Local': { 'default': '701系 / E721系 / HB-E220系', 'Kamaishi': 'HB-E220系 / 701系 / E721系' }
    },
    'Tsugaru': {
      'Local': { 'default': 'キハ40系' }
    },
    'Uetsu': {
      'Local': { 'default': '701系 / E721系' },
      'Rapid': { 'default': '701系 / E721系' },
      'LimitedExpress': { 'default': 'E653系（いなほ）' }
    },
    'Yamada': {
      'Local': { 'default': 'キハ110系' }
    },
    'Yamagata': {
      'Local': { 'default': '701系5500番台' },
      'Rapid': { 'default': '701系5500番台' },
      'LimitedExpress': { 'default': 'E8系（つばさ）' }
    },
    'Yonezawa': {
      'Local': { 'default': 'キハ110系' }
    },

    // --- 私鉄・モノレール・新交通 ---
    'Daishi_Keikyu': {
      'Local': { 'default': '1500形 / 新1000形（4両編成）' }
    },
    'KeikyuAirport': {
      'Local': { 'default': '新1000形 / 1500形 / 600形' },
      'Express': { 'default': '新1000形 / 1500形' },
      'LimitedExpress': { 'default': '新1000形 / 1500形 / 600形' },
      'RapidLimitedExpress': { 'default': '新1000形 / 2100形 / 1500形' },
      'MorningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'EveningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'AirportRapidLimitedExpress': { 'default': '新1000形 / 1500形 / 600形' }
    },
    'KeikyuKurihama': {
      'Local': { 'default': '新1000形 / 1500形' },
      'LimitedExpress': { 'default': '新1000形 / 2100形 / 1500形' },
      'RapidLimitedExpress': { 'default': '新1000形 / 2100形 / 1500形' },
      'MorningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'EveningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'EveningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'MorningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' }
    },
    'KeikyuZushi': {
      'Local': { 'default': '新1000形（4両編成）' },
      'Express': { 'default': '新1000形' },
      'LimitedExpress': { 'default': '新1000形 / 1500形' },
      'MorningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'EveningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' }
    },
    'Haijima': {
      'Local': { 'default': '西武20000系 / 西武30000系 / 西武2000系' },
      'SemiExpress': { 'default': '西武20000系 / 西武30000系 / 西武2000系' },
      'Express': { 'default': '西武20000系 / 西武30000系 / 西武2000系' },
      'HaijimaLiner': { 'default': '西武40000系' }
    },
    'Kokubunji': {
      'Local': { 'default': '西武2000系' }
    },
    'SeibuChichibu': {
      'Local': { 'default': '西武4000系' },
      'LimitedExpress': { 'default': '西武40000系' },
      'S-TRAIN': { 'default': '西武40000系' }
    },
    'SeibuEn': {
      'Local': { 'default': '西武101系 / 西武9000系' }
    },
    'SeibuShinjuku': {
      'Local': { 'default': '西武2000系 / 西武20000系 / 西武30000系' },
      'Express': { 'default': '西武2000系 / 西武20000系 / 西武30000系' },
      'SemiExpress': { 'default': '西武2000系 / 西武20000系 / 西武30000系' },
      'CommuterExpress': { 'default': '西武2000系 / 西武20000系 / 西武30000系' },
      'RapidExpress': { 'default': '西武2000系 / 西武20000系 / 西武30000系' },
      'LimitedExpress': { 'default': '西武10000系（レッドアロー）' },
      'HaijimaLiner': { 'default': '西武40000系' }
    },
    'SeibuTamagawa': {
      'Local': { 'default': '西武101系' }
    },
    'SeibuTamako': {
      'Local': { 'default': '西武101系' }
    },
    'SeibuToshima': {
      'Local': { 'default': '西武2000系（8両編成・池袋線直通）' }
    },
    'SeibuYamaguchi': {
      'Local': { 'default': '西武8500系（レオライナー） / 西武L00系（れおけい）' }
    },
    'Seibu_Sayama': {
      'Local': { 'default': '西武4000系' },
      'SemiExpress': { 'default': '西武4000系' }
    },
    'OdakyuEnoshima': {
      'Local': { 'default': '1000形 / 8000形 / 3000形' },
      'Express': { 'default': '1000形 / 4000形 / 3000形' },
      'RapidExpress': { 'default': '1000形 / 4000形' },
      'LimitedExpress': { 'default': '30000形 EXEα / 60000形 MSE / 70000形 GSE' }
    },
    'NewShuttle': {
      'Local': { 'default': '2000系 / 2020系' }
    },
    'TokyoMonorail': {
      'AirportRapid': { 'default': '10000形' },
      'SectionRapid': { 'default': '10000形' },
      'Local': { 'default': '10000形 / 2000形' }
    },
    'Yurikamome': {
      'Local': { 'default': '7300系 / 7500系（7000系は全廃）' }
    },
    'Hakushin': {
      'Local': { 'default': 'E129系' },
      'Rapid': { 'default': 'E129系' },
      'LimitedExpress': { 'default': 'E653系（特急いなほ）' }
    },

    // ================================================================
    // 4.3.952 追加：無直通・混跑線の車両精密化（2026-09 公開資料で交叉検証）
    // 出典: 各路線 Wikipedia「使用車両」節 + 各社公式発表（2026-09 時点）
    // 混跑線は「/」で取り得る形式を列挙（種別で分離できる線は種別別に定義）
    // ================================================================

    // --- 東京メトロ・都営（無直通・単一運用） ---
    'Ginza': {
      'Local': { 'default': '東京メトロ1000系' },
    },
    'Marunouchi': {
      'Local': { 'default': '東京メトロ2000系' },
    },
    'MarunouchiBranch': {
      'Local': { 'default': '東京メトロ2000系' },
    },
    'ChiyodaBranch': {
      'Local': { 'default': '東京メトロ16000系 / 東京メトロ05系（北綾瀬）' },
    },
    'Oedo': {
      'Local': { 'default': '12-000形 / 12-600形' },
    },
    'Arakawa': {
      'Local': { 'default': '7700形 / 8500形 / 8800形 / 8900形 / 9000形' },
    },
    'Nippori_Toneri': {
      'Local': { 'default': '330形' },
    },

    // --- 東武ローカル（小泉・佐野・桐生は 10000 系系譜に統一進行中） ---
    'TobuUtsunomiya': {
      'Local': { 'default': '東武20400系' },
    },
    'Noda': {
      'Local': { 'default': '東武80000系 / 東武60000系 / 東武10030系 / 東武10050系 / 東武8000系' },
      'Express': { 'default': '東武80000系 / 東武60000系 / 東武10030系 / 東武10050系 / 東武8000系' },
      'SectionExpress': { 'default': '東武80000系 / 東武60000系 / 東武10030系 / 東武10050系 / 東武8000系' },
    },
    'Daishi_Tobu': {
      'Local': { 'default': '東武8000系 / 東武850系' },
    },
    'Kiryu': {
      'Local': { 'default': '東武800系 / 東武850系 / 東武10000系 / 東武10030系' },
      'LimitedExpress': { 'default': '東武500系（リバティりょうもう）/ 東武200系（りょうもう） / 東武250型' },
    },
    'Koizumi': {
      'Local': { 'default': '東武800系 / 東武850系 / 東武10000系 / 東武10030系' },
    },
    'Ogose': {
      'Local': { 'default': '東武8000系' },
    },
    'Sano': {
      'Local': { 'default': '東武800系 / 東武850系 / 東武10000系 / 東武10030系' },
      'LimitedExpress': { 'default': '東武500系（リバティりょうもう）' },
    },
    'Tobu_Kameido': {
      'Local': { 'default': '東武8000系 / 東武800型 / 東武850型 / 東武10030型' },
    },
    'Nikkoku': {
      'Local': { 'default': '東武20400系', 'Aizu': '6050系100番台' },
      'Rapid': { 'default': '東武20400系', 'Aizu': '6050系100番台' },
      'LimitedExpress': { 'default': 'N100系（スペーシアX）/ 100系（きぬ）/ 500系（リバティ）' },
    },

    // --- 京王（本線系統の支線群：7000系は退役進行中だが 2026-09 時点で運用中） ---
    'KeioInokashira': {
      'Local': { 'default': '1000系' },
      'Express': { 'default': '1000系' },
    },
    'KeioSagami': {
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'Rapid': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'SemiExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'Express': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'LimitedExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'KeioLiner': { 'default': '5000系' },
    },
    'KeioShin': {
      'Local': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'Rapid': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'SemiExpress': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'Express': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系', 'Toei': '京王電鉄7000系 / 京王電鉄8000系 / 京王電鉄9000系 / 京王電鉄5000系 / 都営10-300形' },
    },
    'KeioTakao': {
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'Rapid': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'SemiExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'Express': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'LimitedExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
      'KeioLiner': { 'default': '5000系' },
    },
    'KeioKeibajo': {
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
    },
    'KeioZoo': {
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系' },
    },

    // --- 横浜市営・新交通 ---
    'YokohamaBlue': {
      'Local': { 'default': '3000形 / 4000形' },
      'Rapid': { 'default': '3000形 / 4000形' },
    },
    'YokohamaGreen': {
      'Local': { 'default': '10000形' },
    },
    'TamaMonorail': {
      'Local': { 'default': '1000系' },
    },
    'TsukubaExpress': {
      'Local': { 'default': 'TX-1000系 / TX-2000系 / TX-3000系' },
      'Rapid': { 'default': 'TX-1000系 / TX-2000系 / TX-3000系' },
      'SemiRapid': { 'default': 'TX-1000系 / TX-2000系 / TX-3000系' },
      'CommuterRapid': { 'default': 'TX-1000系 / TX-2000系 / TX-3000系' },
    },

    // --- JR 東日本 首都圏（無直通・単一運用 / 混跑） ---
    'Yamanote': {
      'Local': { 'default': 'E235系0番台（山手線）' },
    },
    'KeihinTohoku': {
      'Local': { 'default': 'E233系1000番台' },
      'Rapid': { 'default': 'E233系1000番台' },
    },
    'Tsurumi': {
      'Local': { 'default': 'E131系1000番台' },
    },
    'TsurumiUmiShibaura': {
      'Local': { 'default': 'E131系1000番台' },
    },
    'TsurumiOkawa': {
      'Local': { 'default': 'E131系1000番台' },
    },
    'Nambu': {
      'Local': { 'default': 'E233系8000番台' },
      'Rapid': { 'default': 'E233系8000番台' },
    },
    'NambuBranch': {
      'Local': { 'default': 'E127系0番台' },
    },
    'Sagami': {
      'Local': { 'default': 'E131系500番台' },
    },
    'Yokohama': {
      'Local': { 'default': 'E233系6000番台' },
      'Rapid': { 'default': 'E233系6000番台' },
    },
    'Kashima': {
      'Local': { 'default': 'E131系' },
    },
    'Kururi': {
      'Local': { 'default': 'キハE130形100番台' },
    },
    'SobuMain': {
      'Local': { 'default': '209系2000番台 / 2100番台' },
      'Rapid': { 'default': 'E235系1000番台' },
      'LimitedExpress': {
        'default': 'E257系500番台（しおさい）/ E259系（成田エクスプレス）',
        'destStation': {
          'NaritaAirportTerminal1': 'E259系（成田エクスプレス）',
          'NaritaAirportTerminal2': 'E259系（成田エクスプレス）',
          'Choshi': 'E257系500番台（しおさい）',
          'Sakura': 'E257系500番台（しおさい）',
          'Naruto': 'E257系500番台（しおさい）',
          'Matsumoto': 'E353系（あずさ・富士回遊）'
        }
      },
    },
    'TokaidoMain': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': {
        'default': 'E257系2000番台 / 2500番台 / 伊豆急行8000系',
        'destStation': {
          'IzukyuShimoda': 'E257系2000番台 / 2500番台（踊り子）/ 伊豆急行8000系',
          'Odawara': 'E257系2000番台 / 2500番台（湘南）',
          'Hiratsuka': 'E257系2000番台 / 2500番台（湘南）',
          'Izumoshi': '285系（サンライズ出雲）'
        }
      },
    },
    'JobanMain': {
      'Local': { 'default': 'E531系' },
      'Rapid': { 'default': 'E531系' },
      'SpecialRapid': { 'default': 'E531系' },
      'LimitedExpress': { 'default': 'E657系（ひたち・ときわ）' },
    },
    'Togane': {
      'Local': { 'default': '209系2100番台 / E233系5000番台' },
    },
    'NaritaAbikoBranch': {
      'Local': { 'default': 'E231系0番台' },
    },
    'NaritaAirportBranch': {
      'Local': { 'default': '209系2000番台 / 2100番台' },
      'Rapid': { 'default': 'E235系1000番台' },
      'LimitedExpress': { 'default': 'E259系（成田エクスプレス）' },
    },
    'Agatsuma': {
      'LimitedExpress': { 'default': 'E257系2500番台 / 5500番台（草津・四万）' },
    },
    'Joetsu': {
      'LimitedExpress': { 'default': 'E257系2500番台 / 5500番台（草津・四万）' },
    },
  };

  // v4.3.963: LINE_ALIAS_MAP——LINE_ICONS 有条目但 MAP 没 key 的线路，
  // 查表前先把 lineId 归一化到最近的有配置的线路（同系统主线）。
  var LINE_ALIAS_MAP = {
    // 东急支线（7 线）
    "TokyuTamagawa":     "TokyuOimachi",   // 多摩川线 7000系
    "TokyuIkegami":      "TokyuOimachi",   // 池上线 7000系
    "TokyuKodomonokuni": "TokyuOimachi",   // 儿玉线 Y000系
    "TokyuSetagaya":     "TokyuOimachi",   // 世田谷线
    "Tamagawa":          "SeibuTamagawa",  // 西武多摩川线
    "Ikegami":           "TokyuOimachi",   // 池上线（无前缀别名）
    "Kodomonokuni":      "TokyuOimachi",   // 儿玉线（无前缀别名）
    "Denentoshi":        "TokyuDenEn",     // 田园都市线别名
    "Oimachi":           "TokyuOimachi",   // 大井町线（无前缀别名）
    "Meguro":            "TokyuMeguro",    // 目黑线（无前缀别名）
    "Toyoko":            "TokyuToyoko",    // 东横线（无前缀别名）
    // 京成支线（4 线）
    "KeiseiMain":        "Keisei",         // 京成本线（别名）
    "KeiseiKanamachi":   "KeiseiOshiage",  // 金町线 80000形
    "KeiseiChiba":       "KeiseiOshiage",  // 千叶线 80000形
    "KeiseiChihara":     "KeiseiOshiage",  // 千原线 80000形
    "Oshiage":           "KeiseiOshiage",  // 押上线（无前缀别名）
    "Kanamachi":         "KeiseiOshiage",  // 金町线（无前缀别名）
    "Chiba":             "KeiseiOshiage",  // 千叶线（无前缀别名）
    "Chihara":           "KeiseiOshiage",  // 千原线（无前缀别名）
    // 京急 / 相铁 / 京王 别名
    "KeikyuMain":            "Keikyu",             // 京急本线
    "Sotetsu":               "SotetsuMain",        // 相铁本线
    "SotetsuShinyokohama":   "SotetsuShin-Yokohama", // 相铁新横滨线
    "Inokashira":            "KeioInokashira",     // 井之头线
    "Keio-Hachioji":         "KeioTakao",          // 京王八王子线 → 京王高尾线
    // 其他无 MAP 配置的线路
    "ChuoLocal":           "ChuoSobuLocal",        // 中央缓行 → 中央总武缓行
    "TobuTojo":            "Tojo",                 // 东武东上线
    "Yamaguchi":           "SeibuYamaguchi",       // 西武山口线
    "NaritaAccess":        "NaritaAirportBranch",   // 成田Access → 成田机场支线
    "YokohamaMunicipal":   "YokohamaBlue",          // 横滨市电 → 横滨蓝线
  };
  // 車両形式を推定する公開API。
  // destOperator は URN parts[1]（例: "Station:TokyoMetro" → "TokyoMetro"）から直接取得。
  // これにより京急 Main / 相鉄 Main のような railway 短名衝突を回避する。
  // @param {string} lineId       本地 line ID
  // @param {string} trainTypeUrn odpt:trainType URN
  // @param {string|array} destUrn destinationStation URN（先頭要素）
  // @returns {string} 車両形式文字列（空文字=不明）
  // /
  function resolveVehicleType(lineId, trainTypeUrn, destUrn) {
    try {
      var _lid = LINE_ALIAS_MAP[lineId] || lineId;
      var cfg = MAP[_lid];
      if (!cfg) return '';
      var tshort = '';
      if (trainTypeUrn) {
        tshort = String(trainTypeUrn).split(':').pop().split('.').pop();
      }
      var _exactType = true;
      var tmap = cfg[tshort];
      if (!tmap) {
        _exactType = false;
        // v4.3.963: trainType 查不到时回落到该线路已配置的第一个有 default 的类型（通常是 Local）
        // 避免 Yamanote 只配了 Local 时查 Rapid/Express 直接 miss
        for (var _tk in cfg) { if (cfg[_tk] && cfg[_tk]['default']) { tmap = cfg[_tk]; break; } }
        if (!tmap) return '';
      }
      var dgroup = '';
      var urn = Array.isArray(destUrn) ? destUrn[0] : destUrn;
      if (urn) {
        var parts = String(urn).split('.');
        // parts[1] = "Station:TokyoMetro" → operator = "TokyoMetro"
        var opPart = parts[1] || '';
        var op = opPart.split(':')[1] || opPart;
        var rw = parts[2] || '';
        // v4.3.1020: 线路短名粒度优先——同 operator 内按线路区分车池
        // （東武スカイツリー⇄半蔵門 vs 日比谷、東武⇄日光 vs 伊勢崎、京成⇄押上 vs 空港 等）
        if (rw && tmap[rw]) { dgroup = rw; }
        else if (op && tmap[op]) { dgroup = op; }
        else if (rw && LINE_GROUP[rw]) { dgroup = LINE_GROUP[rw]; }
        else { dgroup = op || ''; }
      }
      if (tmap['destStation'] && parts) {
      var stName = parts[parts.length - 1] || '';
      var stVt = tmap['destStation'][stName];
        if (stVt) { _lastVt = { name: stVt, exact: true }; return stVt; }
    }
    var _vt = (dgroup && tmap[dgroup]) || tmap['default'] || '';
      if (_vt) { _lastVt = { name: _vt, exact: _exactType }; }
      return _vt;
    } catch(e) { if (window.console && window.console.error) window.console.error('VTM-ERR[' + lineId + ',' + trainTypeUrn + ']: ' + (e && e.message)); return ''; }
  }
  function _getLastMeta() { return _lastVt; }

  // v4.3.963: 模块级变量——resolveVehicleType 最后一次查表结果（含 exact 标志）
  var _lastVt = null;
  window.VehicleTypeMap = {
    LINE_GROUP: LINE_GROUP,
    MAP: MAP,
    resolve: resolveVehicleType,
    getLastMeta: _getLastMeta
  };

})();
