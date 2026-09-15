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
        'Minatomirai': '5050系 / 5000系 / 横浜高速Y500系',
        'TokyoMetro': '5050系 / 5000系 / 東京メトロ10000系 / 17000系',
        'Seibu': '5050系 / 5000系 / 西武6000系',
        'Tobu': '5050系 / 5000系 / 東急9000系',
      },
      'Express': {
        'default': '5050系4000番台 / 5050系 / 5000系',
        'Sotetsu': '5050系4000番台 / 相鉄10000系',
        'TokyoMetro': '5050系4000番台 / 東京メトロ17000系',
        'Seibu': '5050系4000番台 / 西武40000系',
        'Tobu': '5050系4000番台 / 東武50070系',
        'Minatomirai': '5050系4000番台 / 5050系 / 5000系 / 横浜高速Y500系',
      },
      'CommuterLimitedExpress': {
        'default': '5050系4000番台',
        'TokyoMetro': '5050系4000番台 / 東京メトロ17000系',
        'Seibu': '5050系4000番台 / 西武40000系',
        'Tobu': '5050系4000番台 / 東武50070系',
      },
      'LimitedExpress': {
        'default': '5050系4000番台',
        'TokyoMetro': '5050系4000番台 / 東京メトロ17000系',
        'Seibu': '5050系4000番台 / 西武40000系',
        'Tobu': '5050系4000番台 / 東武50070系',
      },
      'F-Liner': {
        'default': '5050系4000番台 / 東武50070系 / 西武40000系 / 東京メトロ17000系',
      },
      'S-TRAIN': {
        'default': '西武40000系 / 東武50070系',
      },
    },
    'TokyuDenEn': {
      'Local': { 'default': '5000系 / 2020系', 'TokyoMetro': '5000系 / 2020系 / 東京メトロ8000系 / 08系', 'Tobu': '5000系 / 2020系 / 東武30000系 / 50050系' },
      'Express': { 'default': '5000系 / 2020系', 'TokyoMetro': '5000系 / 2020系 / 東京メトロ8000系 / 08系', 'Tobu': '5000系 / 2020系 / 東武30000系 / 50050系' },
      'SemiExpress': { 'default': '5000系 / 2020系', 'TokyoMetro': '5000系 / 2020系 / 東京メトロ8000系 / 08系', 'Tobu': '5000系 / 2020系 / 東武30000系 / 50050系' },
    },
    'TokyuMeguro': {
      'Local': { 'default': '3000系 / 5080系 / 3020系', 'TokyoMetro': '3000系 / 5080系 / 3020系 / 東京メトロ9000系', 'Toei': '3000系 / 5080系 / 3020系 / 都営6300形 / 6500形', 'SaitamaRailway': '3000系 / 5080系 / 3020系 / 埼玉高速2000系', 'Sotetsu': '3000系 / 5080系 / 3020系 / 相鉄20000系' },
      'Express': { 'default': '3000系 / 5080系 / 3020系', 'TokyoMetro': '3000系 / 5080系 / 3020系 / 東京メトロ9000系', 'Toei': '3000系 / 5080系 / 3020系 / 都営6300形 / 6500形', 'SaitamaRailway': '3000系 / 5080系 / 3020系 / 埼玉高速2000系', 'Sotetsu': '3000系 / 5080系 / 3020系 / 相鉄20000系' },
    },

    // ================================================================
    // 東京メトロ 7 線
    // ================================================================
    'Chiyoda': {
      'Express': {
        'default': '東京メトロ16000系 / 小田急4000形',
        'Odakyu': '東京メトロ16000系 / 小田急4000形'
      },
      'LimitedExpress': {
        'default': '小田急60000系(MSE)',
        'Odakyu': '小田急60000系(MSE)'
      },
      'Local': {
        'default': '東京メトロ16000系 / 05系 / JR E233系',
        'TokyoMetro': '東京メトロ16000系 / 05系',
        'Odakyu': '東京メトロ16000系 / 小田急1000形'
      },
      'SemiExpress': {
        'default': '東京メトロ16000系 / 小田急4000形',
        'Odakyu': '東京メトロ16000系 / 小田急4000形'
      }
    },
    'Fukutoshin': {
      'CommuterExpress': {
        'default': '東京メトロ17000系 / 10000系',
        'TokyoMetro': '東京メトロ17000系 / 10000系',
        'Minatomirai': '東京メトロ17000系 / 東急5050系 / 横浜高速Y500系',
        'Tobu': '東京メトロ17000系 / 東武50070系',
        'Seibu': '東京メトロ17000系 / 西武40000系',
        'Sotetsu': '東京メトロ17000系 / 相鉄20000系（候補）'
      },
      'Express': {
        'default': '東京メトロ17000系 / 10000系',
        'TokyoMetro': '東京メトロ17000系 / 10000系',
        'Minatomirai': '東京メトロ17000系 / 東急5050系 / 横浜高速Y500系',
        'Tobu': '東京メトロ17000系 / 東武50070系',
        'Seibu': '東京メトロ17000系 / 西武40000系 / 6000系',
        'Sotetsu': '東京メトロ17000系 / 相鉄20000系（候補）'
      },
      'F-Liner': {
        'default': '東京メトロ17000系 / 東武50070系 / 西武40000系 / 横浜高速Y500系',
        'Minatomirai': '東京メトロ17000系 / 東武50070系 / 西武40000系 / 横浜高速Y500系',
        'Tobu': '東京メトロ17000系 / 東武50070系 / 西武40000系 / 横浜高速Y500系',
        'Seibu': '東京メトロ17000系 / 東武50070系 / 西武40000系 / 横浜高速Y500系'
      },
      'Local': {
        'default': '東京メトロ10000系 / 17000系 / 7000系',
        'TokyoMetro': '東京メトロ10000系 / 17000系 / 7000系',
        'Tokyu': '東京メトロ10000系 / 17000系 / 東急5050系 / 5000系',
        'Tobu': '東京メトロ10000系 / 17000系 / 7000系 / 東武50070系 / 9000系 / 30000系',
        'Seibu': '東京メトロ10000系 / 17000系 / 7000系 / 西武6000系 / 40000系',
        'Minatomirai': '東京メトロ10000系 / 17000系 / 横浜高速Y500系',
        'Sotetsu': '東京メトロ17000系 / 相鉄20000系（候補）'
      },
      'S-TRAIN': {
        'default': '西武40000系',
        'Seibu': '西武40000系',
        'Minatomirai': '西武40000系 / 横浜高速Y500系'
      }
    },
    'Hanzomon': {
      'Express': {
        'default': '東京メトロ8000系 / 08系 / 18000系 / 東武30000系 / 50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東急5000系 / 2020系',
        'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武30000系 / 50050系 / 50070系'
      },
      'Local': {
        'default': '東京メトロ8000系 / 08系 / 18000系',
        'TokyoMetro': '東京メトロ8000系 / 08系 / 18000系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東急5000系 / 2020系'
      },
      'SemiExpress': {
        'default': '東京メトロ8000系 / 08系 / 18000系 / 東武30000系 / 50050系',
        'Tokyu': '東京メトロ8000系 / 08系 / 18000系 / 東急5000系 / 2020系',
        'Tobu': '東京メトロ8000系 / 08系 / 18000系 / 東武30000系 / 50050系 / 50070系'
      }
    },
    'Hibiya': {
      'Local': {
        'default': '東京メトロ13000系',
        'TokyoMetro': '東京メトロ13000系',
        'Tobu': '東京メトロ13000系 / 東武70000系'
      },
      'TH-LINER': {
        'default': '東武70090系(TH-LINER)',
        'TokyoMetro': '東武70090系(TH-LINER)',
        'Tobu': '東武70090系(TH-LINER)'
      }
    },
    'Namboku': {
      'Express': {
        'default': '東京メトロ9000系 / 東急3000系 / 5080系 / 相鉄20000系 / 21000系',
        'Tokyu': '東京メトロ9000系 / 東急3000系 / 5080系',
        'Sotetsu': '東京メトロ9000系 / 相鉄20000系 / 21000系'
      },
      'Local': {
        'default': '東京メトロ9000系 / 東急3000系 / 5080系 / 相鉄20000系 / 21000系',
        'TokyoMetro': '東京メトロ9000系',
        'Tokyu': '東京メトロ9000系 / 東急3000系 / 5080系',
        'Sotetsu': '東京メトロ9000系 / 相鉄20000系 / 21000系',
        'SaitamaRailway': '東京メトロ9000系 / 埼玉高速2000系'
      }
    },
    'Tozai': {
      'CommuterRapid': {
        'default': '東京メトロ05系 / 05N系 / 15000系 / JR E231系',
        'TokyoMetro': '東京メトロ05系 / 05N系 / 15000系'
      },
      'Local': {
        'default': '東京メトロ05系 / 05N系 / 15000系 / JR E231系 / 東葉高速1000系',
        'TokyoMetro': '東京メトロ05系 / 05N系 / 15000系'
      },
      'Rapid': {
        'default': '東京メトロ05系 / 15000系 / JR E231系 / 東葉高速1000系',
        'TokyoMetro': '東京メトロ05系 / 15000系'
      }
    },
    'Yurakucho': {
      'Local': {
        'default': '東京メトロ10000系 / 17000系 / 7000系',
        'TokyoMetro': '東京メトロ10000系 / 17000系 / 7000系',
        'Tobu': '東京メトロ10000系 / 17000系 / 7000系 / 東武50070系 / 9000系 / 30000系',
        'Seibu': '東京メトロ10000系 / 17000系 / 7000系 / 西武6000系 / 40000系'
      },
      'Rapid': {
        'default': '東京メトロ10000系 / 17000系 / 西武6000系 / 40000系',
        'Seibu': '東京メトロ10000系 / 17000系 / 西武6000系 / 40000系'
      },
      'RapidExpress': {
        'default': '東京メトロ10000系 / 17000系 / 西武6000系 / 40000系',
        'Seibu': '東京メトロ10000系 / 17000系 / 西武6000系 / 40000系'
      },
      'S-TRAIN': {
        'default': '西武40000系',
        'TokyoMetro': '西武40000系',
        'Seibu': '西武40000系'
      },
      'SemiExpress': {
        'default': '東京メトロ10000系 / 17000系 / 西武6000系 / 40000系',
        'Seibu': '東京メトロ10000系 / 17000系 / 西武6000系 / 40000系'
      }
    },

    // ================================================================
    // 都営 3 線
    // ================================================================
    'Asakusa': {
      'Local': {
        'default': '都営5300形 / 5500形',
        'Keikyu': '都営5300形 / 5500形 / 京急1000形 / 京急1500形',
        'Keisei': '都営5300形 / 5500形 / 京成3000形 / 京成3700形',
        'Hokuso': '都営5300形 / 5500形 / 北総7500形 / 北総9100形（候補）'
      },
      'AccessExpress': {
        'default': '都営5500形 / 京成3000形',
        'Keisei': '都営5500形 / 京成3000形 / 京成3100形（候補）'
      },
      'Rapid': {
        'default': '都営5300形 / 5500形',
        'Keikyu': '都営5300形 / 5500形 / 京急1000形 / 京急1500形',
        'Shibayama': '都営5300形 / 5500形 / 京成3000形（候補）'
      },
      'AirportRapidLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keisei': '都営5500形 / 京成3000形 / 京成AE形（候補）',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形'
      },
      'RapidLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形',
        'Keisei': '都営5500形 / 京成3000形',
        'Shibayama': '都営5500形 / 京成3000形（候補）'
      },
      'LimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形',
        'Keisei': '都営5500形 / 京成3000形 / 京成3700形',
        'Hokuso': '都営5500形 / 北総7500形（候補）',
        'Shibayama': '都営5500形 / 京成3000形（候補）'
      },
      'CommuterLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形'
      },
      'Express': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形'
      }
    },
    'Mita': {
      'Local': {
        'default': '都営6300形 / 6500形',
        'Tokyu': '都営6300形 / 6500形 / 東急3000系 / 5080系 / 3020系',
        'Sotetsu': '都営6300形 / 6500形 / 相鉄21000系（候補）'
      },
      'Express': {
        'default': '都営6300形 / 6500形',
        'Tokyu': '都営6300形 / 6500形 / 東急3000系 / 5080系 / 3020系',
        'Sotetsu': '都営6300形 / 6500形 / 相鉄21000系（候補）'
      }
    },
    'Shinjuku': {
      'Local': {
        'default': '都営10-300形',
        'Keio': '都営10-300形 / 京王9000系（9030系）/ 京王5000系'
      },
      'Express': {
        'default': '都営10-300形',
        'Keio': '都営10-300形 / 京王9000系（9030系）/ 京王5000系'
      }
    },

    // ================================================================
    // 東武 3 線
    // ================================================================
    'TobuSkytree': {
      'Local': {
        'default': '東武20000系 / 20050系 / 30000系 / 50050系',
        'TokyoMetro': '東武70000系 / 20000系（日比谷線直通）'
      },
      'SectionExpress': {
        'default': '東武20000系 / 20050系 / 30000系 / 50050系'
      },
      'SemiExpress': {
        'default': '東武30000系 / 50050系',
        'Tokyu': '東武30000系 / 50050系（半蔵門線・東急田園都市線直通）'
      },
      'Express': {
        'default': '東武30000系 / 50050系',
        'Tokyu': '東武30000系 / 50050系（半蔵門線・東急田園都市線直通）'
      },
      'SectionSemiExpress': {
        'default': '東武30000系 / 50050系'
      },
      'LimitedExpress': {
        'default': '東武100系（スペーシア）/ 100系 Revaty / 250系（両毛）'
      },
      'TH-LINER': {
        'default': '東武70090系（THライナー専用・日比谷線直通）'
      }
    },
    'TobuIsesaki': {
      'Local': {
        'default': '東武20000系 / 20050系 / 30000系 / 50050系'
      },
      'Express': {
        'default': '東武30000系 / 50050系',
        'Tokyu': '東武30000系 / 50050系（半蔵門線・東急田園都市線直通）'
      },
      'SemiExpress': {
        'default': '東武30000系 / 50050系',
        'Tokyu': '東武30000系 / 50050系（半蔵門線直通）'
      },
      'SectionExpress': {
        'default': '東武20000系 / 20050系 / 30000系 / 50050系'
      },
      'SectionSemiExpress': {
        'default': '東武30000系 / 50050系'
      },
      'LimitedExpress': {
        'default': '東武100系（スペーシア）/ 100系 Revaty / 250系（両毛）'
      },
      'TH-LINER': {
        'default': '東武70090系（THライナー専用・日比谷線直通）'
      }
    },
    'Tojo': {
      'Local': {
        'default': '東武5000系 / 50070系 / 9000系 / 10000系',
        'TokyoMetro': '東武50070系 / 9000系（有楽町線直通）',
        'Minatomirai': '東武50070系 / 9000系（Fライナー・みなとみらい線直通）',
        'Tokyu': '東武50070系 / 9000系（東急東横線直通）',
        'Sotetsu': '東武50070系 / 9000系 / 相鉄21000系（候補）'
      },
      'SemiExpress': {
        'default': '東武5000系 / 10000系 / 9000系'
      },
      'Express': {
        'default': '東武5000系 / 50070系 / 9000系 / 10000系',
        'Minatomirai': '東武50070系 / 9000系（Fライナー・みなとみらい直通）',
        'Sotetsu': '東武50070系 / 9000系 / 相鉄21000系（候補）'
      },
      'RapidExpress': {
        'default': '東武5000系 / 50070系 / 9000系 / 10000系',
        'Minatomirai': '東武50070系 / 9000系（Fライナー）',
        'Sotetsu': '東武50070系 / 9000系 / 相鉄21000系（候補）'
      },
      'KawagoeLimitedExpress': {
        'default': '東武5000系 / 10000系 / 50070系（川越特急）'
      },
      'TJ-Liner': {
        'default': '東武50090系（TJライナー専用）'
      }
    },

    // ================================================================
    // 京王 2 線
    // ================================================================
    'Keio': {
      'Local': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'Rapid': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'SemiExpress': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'Express': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'KeioLiner': { 'default': '5000系' },
    },
    'KeioMain': {
      'Local': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'Rapid': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'SemiExpress': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'Express': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '8000系 / 9000系 / 7000系', 'Toei': '8000系 / 9000系 / 都営10-300形' },
      'KeioLiner': { 'default': '5000系' },
    },

    // ================================================================
    // 相鉄 3 線
    // ================================================================
    'SotetsuMain': {
      'Local': {
        'default': '80000系 / 11000系 / 9000系 / 7000系 / 10000系',
        'JR-East': '相鉄12000系 / JR E233系700番台',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / 東急5050系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形',
        'Tobu': '相鉄20000系 / 東急5050系 / 東武50070系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
        'Sotetsu': '80000系 / 11000系 / 9000系',
      },
      'Rapid': {
        'default': '80000系 / 11000系 / 9000系 / 10000系',
        'Sotetsu': '80000系 / 11000系 / 9000系',
      },
      'CommuterExpress': {
        'default': '80000系 / 11000系 / 9000系',
        'Sotetsu': '80000系 / 11000系 / 9000系',
      },
      'LimitedExpress': {
        'default': '80000系 / 11000系 / 20000系',
        'JR-East': '相鉄12000系 / JR E233系700番台',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
        'Sotetsu': '80000系 / 11000系 / 20000系',
      },
      'CommuterLimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
      },
    },
    'SotetsuIzumino': {
      'Local': {
        'default': '80000系 / 9000系 / 11000系',
        'Sotetsu': '80000系 / 9000系 / 11000系',
        'JR-East': '相鉄12000系 / JR E233系700番台',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
      },
      'Rapid': { 'default': '80000系 / 9000系 / 11000系', 'Sotetsu': '80000系 / 9000系 / 11000系' },
      'CommuterExpress': { 'default': '80000系 / 9000系 / 11000系', 'Sotetsu': '80000系 / 9000系 / 11000系' },
      'LimitedExpress': {
        'default': '80000系 / 20000系 / 21000系',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'Tobu': '相鉄20000系 / 東武50070系',
        'Sotetsu': '80000系 / 20000系 / 21000系',
      },
      'CommuterLimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
      },
    },
    'SotetsuShin-Yokohama': {
      'Local': {
        'default': '相鉄20000系 / 21000系 / 12000系',
        'Sotetsu': '相鉄20000系 / 21000系 / 12000系',
        'JR-East': '相鉄12000系 / JR E233系700番台',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系 / 3000系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
      },
      'LimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'JR-East': '相鉄12000系 / JR E233系700番台',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
        'Sotetsu': '相鉄20000系 / 21000系',
      },
      'CommuterLimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系',
        'Toei': '相鉄21000系 / 都営6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
      },
    },

    // ================================================================
    // 京急
    // ================================================================
    'Keikyu': {
      'Local': { 'default': '新1000形 / 1500形 / 600形', 'Toei': '新1000形 / 都営5300形 / 5500形 / 京成3000形' },
      'Express': { 'default': '新1000形 / 1500形 / 600形', 'Toei': '新1000形 / 都営5300形 / 5500形 / 京成3000形' },
      'Rapid': { 'default': '新1000形 / 1500形 / 600形', 'Toei': '新1000形 / 都営5500形 / 京成3000形' },
      'LimitedExpress': { 'default': '新1000形 / 1500形', 'Toei': '新1000形 / 都営5500形 / 京成3000形' },
      'RapidLimitedExpress': { 'default': '新1000形 / 1500形', 'Toei': '新1000形 / 都営5500形 / 京成3000形' },
      'AirportRapidLimitedExpress': { 'default': '新1000形', 'Toei': '新1000形 / 都営5500形 / 京成3000形' },
      'AccessExpress': { 'default': '新1000形', 'Toei': '新1000形 / 都営5500形 / 京成3000形' },
      'CommuterLimitedExpress': { 'default': '新1000形 / 1500形' },
      'MorningWing': { 'default': '2100形' },
      'EveningWing': { 'default': '2100形' },
    },

    // ================================================================
    // 小田急
    // ================================================================
    'Odawara': {
      'Local': {
        'default': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形 / JR E233系2000番台',
        'Odakyu': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
      },
      'SemiExpress': {
        'default': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
        'Odakyu': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
      },
      'Express': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
        'Odakyu': '1000形 / 3000形 / 4000形 / 5000形',
      },
      'RapidExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
        'Odakyu': '1000形 / 3000形 / 4000形 / 5000形',
      },
      'CommuterExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
      },
      'CommuterSemiExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
      },
      'LimitedExpress': {
        'default': 'ロマンスカー 10000形 / 20000形 / 30000形 / 50000形 / 60000形',
      },
    },
    'OdakyuTama': {
      'Local': {
        'default': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
        'Odakyu': '1000形 / 2000形 / 3000形 / 4000形 / 5000形',
      },
      'Express': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
      },
      'RapidExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
      },
      'CommuterExpress': {
        'default': '1000形 / 3000形 / 4000形 / 5000形',
        'TokyoMetro': '小田急4000形 / メトロ16000形',
      },
    },

    // ================================================================
    // 西武
    // ================================================================
    'Ikebukuro': {
      'Local': {
        'default': '6000系 / 30000系 / 20000系 / 10000系',
        'TokyoMetro': '西武40000系 / 6000系 / メトロ17000系 / 10000系',
        'Seibu': '6000系 / 30000系 / 20000系 / 10000系',
      },
      'SemiExpress': {
        'default': '6000系 / 30000系 / 20000系',
        'TokyoMetro': '西武40000系 / 6000系 / メトロ17000系',
      },
      'Express': {
        'default': '6000系 / 30000系 / 20000系',
        'TokyoMetro': '西武40000系 / 6000系 / メトロ17000系',
      },
      'Rapid': {
        'default': '6000系 / 30000系 / 20000系',
        'TokyoMetro': '西武40000系 / 6000系 / メトロ17000系',
      },
      'RapidExpress': {
        'default': '6000系 / 30000系 / 20000系',
        'TokyoMetro': '西武40000系 / 6000系 / メトロ17000系',
      },
      'CommuterExpress': {
        'default': '6000系 / 30000系 / 20000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'CommuterSemiExpress': {
        'default': '6000系 / 30000系 / 20000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'LimitedExpress': {
        'default': '001系(Laview) / 10000系',
      },
      'F-Liner': {
        'default': '西武40000系 / 東武50070系 / メトロ17000系 / 東急5050系4000番台',
      },
      'S-TRAIN': {
        'default': '西武40000系(デュアルシート)',
      },
    },
    'Yurakucho_Seibu': {
      'Local': {
        'default': '6000系 / 40000系',
        'TokyoMetro': '西武40000系 / 6000系 / メトロ17000系 / 10000系',
        'Seibu': '6000系 / 40000系',
      },
      'SemiExpress': {
        'default': '6000系 / 40000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'Rapid': {
        'default': '6000系 / 40000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'RapidExpress': {
        'default': '6000系 / 40000系',
        'TokyoMetro': '西武40000系 / メトロ17000系',
      },
      'F-Liner': {
        'default': '西武40000系 / 東武50070系 / メトロ17000系 / 東急5050系4000番台',
      },
    },

    // ================================================================
    // みなとみらい線
    // ================================================================
    'MinatoMirai': {
      'Local': {
        'default': 'Y500系 / 東急5050系 / 5000系',
        'Tokyu': 'Y500系 / 東急5050系 / 5000系 / 東急5050系4000番台',
        'TokyoMetro': 'Y500系 / 東急5050系 / メトロ17000系 / 東武50070系 / 西武40000系',
        'Seibu': 'Y500系 / 東急5050系 / 西武40000系',
        'Tobu': 'Y500系 / 東急5050系 / 東武50070系',
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
        'TokyoMetro': 'E231系500番台 / E231系0番台 / 東京メトロ05系 / 05N系 / 07系 / 15000系'
      },
      'LimitedExpress': { 'default': 'E353系（あずさ・かいじ）（候補）' },
    },
    'Hachiko': {
      'Local': { 'default': '209系3000番台' },
    },
    'Ito': {
      'Local': { 'default': 'E233系1000番台 / 伊豆急行8000系' },
      'LimitedExpress': { 'default': 'E257系1500番台（踊り子）' },
    },
    'Itsukaichi': {
      'Local': { 'default': 'E233系0番台' },
    },
    'Joban': {
      'Rapid': { 'default': 'E231系0番台' },
      'Local': { 'default': 'E231系0番台' },
      'SpecialRapid': { 'default': 'E231系0番台' },
      'LimitedExpress': { 'default': 'E657系（ときわ・ひたち）' },
    },
    'JobanLocal': {
      'Local': {
        'default': 'E233系2000番台',
        'TokyoMetro': 'E233系2000番台 / 東京メトロ16000系',
        'Odakyu': '東京メトロ16000系 / 小田急4000形'
      },
    },
    'Kawagoe': {
      'Local': { 'default': '209系3100番台 / E233系700番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
      'Rapid': { 'default': 'E233系700番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
      'CommuterRapid': { 'default': 'E233系700番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
    },
    'KawagoeWest': {
      'Local': { 'default': '209系3000番台' },
    },
    'Keiyo': {
      'Local': { 'default': 'E233系5000番台' },
      'Rapid': { 'default': 'E233系5000番台' },
      'LimitedExpress': { 'default': 'E257系500番台（わかしお・さざなみ）' },
    },
    'Musashino': {
      'Local': { 'default': 'E231系900番台' },
    },
    'Narita': {
      'Local': { 'default': '209系2000番台 / E231系（候補）' },
      'Rapid': { 'default': '209系2000番台 / E231系（候補）' },
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
      'Local': { 'default': 'E233系700番台' },
    },
    'Saikyo': {
      'Local': { 'default': 'E233系700番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
      'Rapid': { 'default': 'E233系700番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
      'CommuterRapid': { 'default': 'E233系700番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
    },
    'ShonanShinjuku': {
      'Local': { 'default': 'E231系1000番台 / E233系1000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'LimitedExpress': { 'default': 'E257系（日光・きぬがわ）（候補）' },
    },
    'SobuRapid': {
      'Rapid': { 'default': 'E235系1000番台' },
      'LimitedExpress': { 'default': 'E259系（成田エクスプレス） / E257系500番台（わかしお・さざなみ）' },
    },
    'Sotobo': {
      'Rapid': { 'default': 'E233系 / E235系1000番台' },
      'Local': { 'default': 'E233系 / E235系1000番台' },
      'LimitedExpress': { 'default': 'E257系500番台（わかしお）' },
    },
    'Takasaki': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': 'E257系（草津・四萬・あかぎ）（候補）' },
    },
    'Tokaido': {
      'Local': { 'default': 'E231系1000番台 / E233系1000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'LimitedExpress': { 'default': 'E257系1500番台（踊り子） / 伊豆急行8000系' },
    },
    'Uchibo': {
      'Local': { 'default': 'E233系 / E235系1000番台' },
      'Rapid': { 'default': 'E233系 / E235系1000番台' },
      'LimitedExpress': { 'default': 'E257系500番台（さざなみ）' },
    },
    'UenoTokyo': {
      'Local': { 'default': 'E231系1000番台 / E233系1000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系1000番台' },
    },
    'UtsunomiyaJR': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': 'E253系（日光・きぬがわ）（候補）' },
    },
    'Yokosuka': {
      'Local': { 'default': 'E235系1000番台' },
      'Rapid': { 'default': 'E235系1000番台' },
      'LimitedExpress': { 'default': 'E259系（成田エクスプレス）' },
    },

    // ================================================================
    // 中央本線（高尾～塩尻）
    // ================================================================
    'ChuoMain': {
      'Local': { 'default': 'E233系0番台', 'JR-East': 'E233系0番台' },
      'Rapid': { 'default': 'E233系0番台', 'JR-East': 'E233系0番台' },
      'CommuterRapid': { 'default': 'E233系0番台', 'JR-East': 'E233系0番台' },
      'ChuoSpecialRapid': { 'default': 'E233系0番台', 'JR-East': 'E233系0番台' },
      'LimitedExpress': { 'default': 'E353系(あずさ・かいじ) / E257系（候補）' },
    },

    // ================================================================
    // 京成 3 線（ODPT 时刻表数据缺失，车型基于公开资料手工补全）
    // 直通关系：Keisei⇄Asakusa(都営) / Keisei⇄KeiseiOshiage / Keisei⇄NaritaSkyAccess
    // ================================================================

    // 京成本線（京成上野～成田空港）
    'Keisei': {
      'Local': {
        'default': '京成3000形 / 3700形 / 3600形 / 3050形',
        'Toei': '京成3000形(8両) / 京成3700形（浅草線直通）'
      },
      'Rapid': {
        'default': '京成3600形 / 3700形 / 3000形',
        'Toei': '京成3000形(8両) / 京成3700形（浅草線直通）'
      },
      'LimitedExpress': {
        'default': '京成3000形 / 3700形',
        'Toei': '京成3000形(8両) / 京成3700形（浅草線直通）'
      },
      'RapidLimitedExpress': {
        'default': '京成3000形 / 3700形'
      },
      'CommuterLimitedExpress': {
        'default': '京成3000形 / 3700形'
      },
      'AccessExpress': {
        'default': '京成3100形(50番台) / 京成3000形（スカイアクセス）'
      },
      'Skyliner': {
        'default': '京成AE2代目（スカイライナー専用）'
      }
    },

    // 京成押上線（押上～青砥）
    'KeiseiOshiage': {
      'Local': {
        'default': '京成3000形 / 3700形 / 3600形',
        'Toei': '京成3000形(8両) / 京成3700形（浅草線直通）'
      },
      'Rapid': {
        'default': '京成3600形 / 3700形'
      },
      'LimitedExpress': {
        'default': '京成3000形 / 3700形',
        'Toei': '京成3000形(8両) / 京成3700形（浅草線直通）'
      },
      'AccessExpress': {
        'default': '京成3100形(50番台) / 京成3000形（スカイアクセス）'
      }
    },

    // 成田スカイアクセス線（京成高砂～成田空港）
    'NaritaSkyAccess': {
      'AccessExpress': {
        'default': '京成3100形(50番台) / 京成3000形（アクセス特急）'
      },
      'Skyliner': {
        'default': '京成AE2代目（スカイライナー専用・成田空港アクセス）'
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
      'Rapid': { 'default': '211系 / E127系100番台' },
      'LimitedExpress': { 'default': 'E353系（あずさ・かいじ）（候補）' }
    },
    'Echigo': {
      'Local': { 'default': 'E127系' }
    },
    'Gono': {
      'Local': { 'default': 'キハ40系（候補）' },
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
      'LimitedExpress': { 'default': 'E353系（あずさ）（候補）' }
    },
    'Ominato': {
      'Local': { 'default': 'キハ100系 / キハ110系' },
      'Rapid': { 'default': 'キハ100系 / キハ110系' }
    },
    'OuMain': {
      'Local': { 'default': '701系 / E721系' },
      'Rapid': { 'default': '701系 / E721系' },
      'LimitedExpress': { 'default': 'E6系（こまち）/ E3系・E8系（つばさ）（候補）' }
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
      'Local': { 'default': '115系 / E129系（候補）' },
      'Rapid': { 'default': 'E129系（候補）' },
      'LimitedExpress': { 'default': 'E653系（しらゆき）（候補）' }
    },
    'Shinonoi': {
      'Local': { 'default': '211系 / E127系100番台' },
      'Rapid': { 'default': '211系' },
      'LimitedExpress': { 'default': '383系（しなの・JR東海）/ E353系（あずさ）（候補）' }
    },
    'Suigun': {
      'Local': { 'default': 'キハE130系 / キハ110系（候補）' }
    },
    'SuigunBranch': {
      'Local': { 'default': 'キハE130系 / キハ110系（候補）' }
    },
    'Tadami': {
      'Local': { 'default': 'キハ110系 / キハ40系（候補）' }
    , 'Rapid': { 'default': 'キハ110系 / キハ40系（候補）' } },
    'Tazawako': {
      'Local': { 'default': '701系5000番台' },
      'Rapid': { 'default': '701系5000番台' },
      'LimitedExpress': { 'default': 'E6系（こまち）（候補）' }
    },
    'TohokuMain': {
      'Local': { 'default': '701系 / E721系' }
    },
    'Tsugaru': {
      'Local': { 'default': 'キハ40系' }
    },
    'Uetsu': {
      'Local': { 'default': '701系 / E721系' },
      'Rapid': { 'default': '701系 / E653系（らくらくトレイン村上）（候補）' },
      'LimitedExpress': { 'default': 'E653系（いなほ）' }
    },
    'Yamada': {
      'Local': { 'default': 'キハ110系' }
    },
    'Yamagata': {
      'Local': { 'default': '701系5500番台' },
      'Rapid': { 'default': '701系5500番台' },
      'LimitedExpress': { 'default': 'E8系 / E3系（つばさ）（候補）' }
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
      'AirportRapidLimitedExpress': { 'default': '新1000形 / 1500形 / 600形' }
    },
    'KeikyuKurihama': {
      'Local': { 'default': '新1000形 / 1500形' },
      'LimitedExpress': { 'default': '新1000形 / 2100形 / 1500形' },
      'RapidLimitedExpress': { 'default': '新1000形 / 2100形 / 1500形' },
      'EveningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' },
      'MorningWing': { 'default': '2100形 / 新1000形1890番台（Le Ciel）' }
    },
    'KeikyuZushi': {
      'Local': { 'default': '新1000形（4両編成）' },
      'Express': { 'default': '新1000形' },
      'LimitedExpress': { 'default': '新1000形 / 1500形' }
    },
    'Haijima': {
      'Local': { 'default': '20000系 / 30000系 / 2000系' },
      'SemiExpress': { 'default': '20000系 / 30000系 / 2000系' },
      'Express': { 'default': '20000系 / 30000系 / 2000系' },
      'HaijimaLiner': { 'default': '40000系（Laview）' }
    },
    'Kokubunji': {
      'Local': { 'default': '新2000系（2000系）/ 8000系（候補）' }
    },
    'SeibuChichibu': {
      'Local': { 'default': '4000系 / 7000系' },
      'LimitedExpress': { 'default': '40000系（Laview）' },
      'S-TRAIN': { 'default': '40000系（Laview）' }
    },
    'SeibuEn': {
      'Local': { 'default': '新101系（ワンマン）/ 9000系（候補）' }
    },
    'SeibuShinjuku': {
      'Local': { 'default': '2000系 / 20000系 / 30000系' },
      'Express': { 'default': '2000系 / 20000系 / 30000系' },
      'SemiExpress': { 'default': '2000系 / 20000系 / 30000系' },
      'CommuterExpress': { 'default': '2000系 / 20000系 / 30000系' },
      'RapidExpress': { 'default': '2000系 / 20000系 / 30000系' },
      'LimitedExpress': { 'default': '40000系（Laview・候補）' },
      'HaijimaLiner': { 'default': '40000系（Laview）' }
    },
    'SeibuTamagawa': {
      'Local': { 'default': '新101系（ワンマン専用塗装）/ 7000系（候補）' }
    },
    'SeibuTamako': {
      'Local': { 'default': '新101系（ワンマン）/ 7000系' }
    },
    'SeibuToshima': {
      'Local': { 'default': '新101系（ワンマン・候補）' }
    },
    'SeibuYamaguchi': {
      'Local': { 'default': '8500系（レオライナー、新型導入中）' }
    },
    'Seibu_Sayama': {
      'Local': { 'default': '7000系（2026年ワンマン化）' },
      'SemiExpress': { 'default': '7000系 / 4000系（候補）' }
    },
    'OdakyuEnoshima': {
      'Local': { 'default': '1000形 / 8000形 / 3000形' },
      'Express': { 'default': '1000形 / 4000形 / 3000形' },
      'RapidExpress': { 'default': '1000形 / 4000形' },
      'LimitedExpress': { 'default': '30000形 EXEα / 60000形 MSE / 70000形 GSE' }
    },
    'NewShuttle': {
      'Local': { 'default': '2000系 / 2020系（1050系は順次引退）' }
    },
    'TokyoMonorail': {
      'AirportRapid': { 'default': '10000形' },
      'SectionRapid': { 'default': '10000形' },
      'Local': { 'default': '10000形 / 2000形（候補）' }
    },
    'Yurikamome': {
      'Local': { 'default': '7300系 / 7500系（7000系は全廃）' }
    },
    'Hakushin': {
      'Local': { 'default': 'E129系' },
      'Rapid': { 'default': 'E129系' },
      'LimitedExpress': { 'default': 'E653系（特急いなほ）' }
    },
  };

  /**
   * 車両形式を推定する公開API。
   * destOperator は URN parts[1]（例: "Station:TokyoMetro" → "TokyoMetro"）から直接取得。
   * これにより京急 Main / 相鉄 Main のような railway 短名衝突を回避する。
   * @param {string} lineId       本地 line ID
   * @param {string} trainTypeUrn odpt:trainType URN
   * @param {string|array} destUrn destinationStation URN（先頭要素）
   * @returns {string} 車両形式文字列（空文字=不明）
   */
  function resolveVehicleType(lineId, trainTypeUrn, destUrn) {
    try {
      var cfg = MAP[lineId];
      if (!cfg) return '';
      var tshort = '';
      if (trainTypeUrn) {
        tshort = String(trainTypeUrn).split(':').pop().split('.').pop();
      }
      var tmap = cfg[tshort];
      if (!tmap) return '';
      var dgroup = '';
      var urn = Array.isArray(destUrn) ? destUrn[0] : destUrn;
      if (urn) {
        var parts = String(urn).split('.');
        // parts[1] = "Station:TokyoMetro" → operator = "TokyoMetro"
        var opPart = parts[1] || '';
        var op = opPart.split(':')[1] || opPart;
        if (op) {
          dgroup = op;
        }
        // フォールバック: operator が空またはマッチしない場合 railway 短名で LINE_GROUP
        if (!tmap[dgroup]) {
          var rw = parts[2] || '';
          dgroup = LINE_GROUP[rw] || '';
        }
      }
      return (dgroup && tmap[dgroup]) || tmap['default'] || '';
    } catch(e) { return ''; }
  }

  window.VehicleTypeMap = {
    LINE_GROUP: LINE_GROUP,
    MAP: MAP,
    resolve: resolveVehicleType
  };
})();
