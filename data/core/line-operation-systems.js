/*
 * Line Operation Systems - Presentation Layer
 * DO NOT MODIFY railway_data.json
 * This file defines how lines are displayed, grouped, and ordered.
 * line_id references are canonical identifiers from railway_data.json
 *
 * v4.3.122: Split all multi-line private railway systems into individual cards
 */

/* global window */
window.LineOperationSystems = {
  "JR_EAST": [
    {
      code: "JA",
      nameJa: "埼京線・川越線",
      nameZh: "埼京线・川越线",
      nameEn: "Saikyo Line / Kawagoe Line",
      nameKo: "",
      color: "#00ac47",
      lineIds: ["Saikyo","Kawagoe"],
      icon: "../images/鉄道/JR東日本/埼京線.png",
      order: 1
    },
    {
      code: "JB",
      nameJa: "中央・総武線（各駅停車）",
      nameZh: "中央・总武线（各站停车）",
      nameEn: "Chuo-Sobu Line (Local)",
      nameKo: "",
      color: "#ffd400",
      lineIds: ["ChuoSobuLocal"],
      icon: "../images/鉄道/JR東日本/中央・総武線各駅停車.png",
      order: 2
    },
    {
      code: "JC",
      nameJa: "中央線（快速）",
      nameZh: "中央线（快速）",
      nameEn: "Chuo Line (Rapid)",
      nameKo: "",
      color: "#f15a22",
      lineIds: ["ChuoRapid"],
      icon: "../images/鉄道/JR東日本/中央快速線.png",
      order: 3
    },
    {
      code: "JC",
      nameJa: "青梅線",
      nameZh: "青梅线",
      nameEn: "Ome Line",
      nameKo: "",
      color: "#dd6935",
      lineIds: ["Ome"],
      icon: "../images/鉄道/JR東日本/青梅線.png",
      order: 4
    },
    {
      code: "JC",
      nameJa: "五日市線",
      nameZh: "五日市线",
      nameEn: "Itsukaichi Line",
      nameKo: "",
      color: "#dd6935",
      lineIds: ["Itsukaichi"],
      icon: "../images/鉄道/JR東日本/五日市線.png",
      order: 5
    },
    {
      code: "JE",
      nameJa: "京葉線",
      nameZh: "京叶线",
      nameEn: "Keiyo Line",
      nameKo: "",
      color: "#c9242f",
      lineIds: ["Keiyo"],
      icon: "../images/鉄道/JR東日本/京葉線.png",
      order: 6
    },
    {
      code: "JH",
      nameJa: "横浜線",
      nameZh: "横滨线",
      nameEn: "Yokohama Line",
      nameKo: "",
      color: "#9fc21b",
      lineIds: ["Yokohama"],
      icon: "../images/鉄道/JR東日本/横浜線.png",
      order: 7
    },
    {
      code: "JI",
      nameJa: "鶴見線",
      nameZh: "鹤见线",
      nameEn: "Tsurumi Line",
      nameKo: "",
      color: "#ffd400",
      lineIds: ["Tsurumi"],
      icon: "../images/鉄道/JR東日本/鶴見線.png",
      order: 8
    },
    {
      code: "JJ",
      nameJa: "常磐線（快速）",
      nameZh: "常磐线（快速）",
      nameEn: "Joban Line (Rapid)",
      nameKo: "",
      color: "#00a2e1",
      lineIds: ["Joban"],
      icon: "../images/鉄道/JR東日本/常磐線快速.png",
      order: 9
    },
    {
      code: "JK",
      nameJa: "京浜東北線・根岸線",
      nameZh: "京滨东北线・根岸线",
      nameEn: "Keihin-Tohoku Line / Negishi Line",
      nameKo: "",
      color: "#00b2e5",
      lineIds: ["KeihinTohoku"],
      icon: "../images/鉄道/JR東日本/京浜東北線.png",
      order: 10
    },
    {
      code: "JL",
      nameJa: "常磐線（各駅停車）",
      nameZh: "常磐线（各站停车）",
      nameEn: "Joban Line (Local)",
      nameKo: "",
      color: "#00bb83",
      lineIds: ["JobanLocal"],
      icon: "../images/鉄道/JR東日本/常盤緩行線.png",
      order: 11
    },
    {
      code: "JM",
      nameJa: "武蔵野線",
      nameZh: "武藏野线",
      nameEn: "Musashino Line",
      nameKo: "",
      color: "#f15a22",
      lineIds: ["Musashino"],
      icon: "../images/鉄道/JR東日本/武蔵野線.png",
      order: 12
    },
    {
      code: "JN",
      nameJa: "南武線",
      nameZh: "南武线",
      nameEn: "Nambu Line",
      nameKo: "",
      color: "#ffd400",
      lineIds: ["Nambu"],
      icon: "../images/鉄道/JR東日本/南武線.png",
      order: 13
    },
    {
      code: "JO",
      nameJa: "横須賀線・総武快速線",
      nameZh: "横须贺线・总武快速线",
      nameEn: "Yokosuka Line / Sobu Line (Rapid)",
      nameKo: "",
      color: "#00347a",
      lineIds: ["Yokosuka","SobuRapid"],
      icon: "../images/鉄道/JR東日本/総武線快速横須賀線.png",
      order: 14
    },
    {
      code: "JS",
      nameJa: "湘南新宿ライン",
      nameZh: "湘南新宿线",
      nameEn: "Shonan-Shinjuku Line",
      nameKo: "",
      color: "#e71112",
      lineIds: ["ShonanShinjuku"],
      icon: "../images/鉄道/JR東日本/湘南新宿ライン.png",
      order: 15
    },
    {
      code: "JT",
      nameJa: "東海道線",
      nameZh: "东海道线",
      nameEn: "Tokaido Line",
      nameKo: "",
      color: "#f68b1e",
      lineIds: ["Tokaido"],
      icon: "../images/鉄道/JR東日本/東海道線.png",
      order: 16
    },
    {
      code: "JU",
      nameJa: "高崎線",
      nameZh: "高崎线",
      nameEn: "Takasaki Line",
      nameKo: "",
      color: "#f68b1e",
      lineIds: ["Takasaki"],
      icon: "../images/鉄道/JR東日本/高崎線.png",
      order: 17
    },
    {
      code: "JU",
      nameJa: "宇都宮線",
      nameZh: "宇都宫线",
      nameEn: "Utsunomiya Line",
      nameKo: "",
      color: "#00732f",
      lineIds: ["Oyama"],
      icon: "../images/鉄道/JR東日本/宇都宮線.png",
      order: 18
    },
    {
      code: "JY",
      nameJa: "山手線",
      nameZh: "山手线",
      nameEn: "Yamanote Line",
      nameKo: "",
      color: "#99cc00",
      lineIds: ["Yamanote"],
      icon: "../images/鉄道/JR東日本/山手線.png",
      order: 19
    },
    {
      code: "CHU",
      nameJa: "中央本線",
      nameZh: "中央本线",
      nameEn: "Chuo Main Line",
      nameKo: "",
      color: "#0073bf",
      lineIds: ["ChuoMain"],
      icon: "",
      order: 20
    },
    {
      code: "ITO",
      nameJa: "伊東線",
      nameZh: "伊东线",
      nameEn: "Ito Line",
      nameKo: "",
      color: "#f68b1e",
      lineIds: ["Ito"],
      icon: "",
      order: 21
    },
    {
      code: "HAC",
      nameJa: "八高線",
      nameZh: "八高线",
      nameEn: "Hachiko Line",
      nameKo: "",
      color: "#e95411",
      lineIds: ["Hachiko"],
      icon: "",
      order: 22
    },
    {
      code: "UCH",
      nameJa: "内房線",
      nameZh: "内房线",
      nameEn: "Uchibo Line",
      nameKo: "",
      color: "#fcc60d",
      lineIds: ["Sotobo"],
      icon: "",
      order: 23
    },
    {
      code: "SOT",
      nameJa: "外房線",
      nameZh: "外房线",
      nameEn: "Sotobo Line",
      nameKo: "",
      color: "#fcc60d",
      lineIds: ["Uchibo"],
      icon: "",
      order: 24
    },
    {
      code: "NRT",
      nameJa: "成田線",
      nameZh: "成田线",
      nameEn: "Narita Line",
      nameKo: "",
      color: "#fcc60d",
      lineIds: ["Narita"],
      icon: "",
      order: 25
    },
    {
      code: "TOH",
      nameJa: "東北本線",
      nameZh: "东北本线",
      nameEn: "Tohoku Main Line",
      nameKo: "",
      color: "#00732f",
      lineIds: ["TohokuMain"],
      icon: "",
      order: 26
    },
    {
      code: "TOK",
      nameJa: "東海道本線",
      nameZh: "东海道本线",
      nameEn: "Tokaido Main Line",
      nameKo: "",
      color: "#f68b1e",
      lineIds: ["TokaidoMain"],
      icon: "",
      order: 27
    },
    {
      code: "SAG",
      nameJa: "相模線",
      nameZh: "相模线",
      nameEn: "Sagami Line",
      nameKo: "",
      color: "#00a3af",
      lineIds: ["Sagami"],
      icon: "",
      order: 28
    },
    {
      code: "SOB",
      nameJa: "総武本線",
      nameZh: "总武本线",
      nameEn: "Sobu Main Line",
      nameKo: "",
      color: "#fcc60d",
      lineIds: ["SobuMain"],
      icon: "",
      order: 29
    }
  ],
  "TOKYO_METRO": [
    {
      code: "C",
      nameJa: "千代田線",
      nameZh: "千代田线",
      nameEn: "Chiyoda Line",
      nameKo: "",
      color: "#009944",
      lineIds: ["Chiyoda"],
      icon: "../images/鉄道/東京メトロ/千代田線.png",
      order: 1
    },
    {
      code: "F",
      nameJa: "副都心線",
      nameZh: "副都心线",
      nameEn: "Fukutoshin Line",
      nameKo: "",
      color: "#9c5e31",
      lineIds: ["Fukutoshin"],
      icon: "../images/鉄道/東京メトロ/副都心線.png",
      order: 2
    },
    {
      code: "G",
      nameJa: "銀座線",
      nameZh: "银座线",
      nameEn: "Ginza Line",
      nameKo: "",
      color: "#ff9500",
      lineIds: ["Ginza"],
      icon: "../images/鉄道/東京メトロ/銀座線.png",
      order: 3
    },
    {
      code: "H",
      nameJa: "日比谷線",
      nameZh: "日比谷线",
      nameEn: "Hibiya Line",
      nameKo: "",
      color: "#b5b5ac",
      lineIds: ["Hibiya"],
      icon: "../images/鉄道/東京メトロ/日比谷線.png",
      order: 4
    },
    {
      code: "M",
      nameJa: "丸ノ内線",
      nameZh: "丸之内线",
      nameEn: "Marunouchi Line",
      nameKo: "",
      color: "#f31630",
      lineIds: ["Marunouchi"],
      icon: "../images/鉄道/東京メトロ/丸ノ内線.png",
      order: 5
    },
    {
      code: "N",
      nameJa: "南北線",
      nameZh: "南北线",
      nameEn: "Namboku Line",
      nameKo: "",
      color: "#00ac9a",
      lineIds: ["Namboku"],
      icon: "../images/鉄道/東京メトロ/南北線.png",
      order: 6
    },
    {
      code: "T",
      nameJa: "東西線",
      nameZh: "东西线",
      nameEn: "Tozai Line",
      nameKo: "",
      color: "#00a7db",
      lineIds: ["Tozai"],
      icon: "../images/鉄道/東京メトロ/東西線.png",
      order: 7
    },
    {
      code: "Y",
      nameJa: "有楽町線",
      nameZh: "有乐町线",
      nameEn: "Yurakucho Line",
      nameKo: "",
      color: "#c1a46e",
      lineIds: ["Yurakucho"],
      icon: "../images/鉄道/東京メトロ/有楽町線.png",
      order: 8
    },
    {
      code: "Z",
      nameJa: "半蔵門線",
      nameZh: "半藏门线",
      nameEn: "Hanzomon Line",
      nameKo: "",
      color: "#8f76d6",
      lineIds: ["Hanzomon"],
      icon: "../images/鉄道/東京メトロ/半蔵門線.png",
      order: 9
    }
  ],
  "TOEI": [
    {
      code: "A",
      nameJa: "浅草線",
      nameZh: "浅草线",
      nameEn: "Asakusa Line",
      nameKo: "",
      color: "#e8525b",
      lineIds: ["Asakusa"],
      icon: "../images/鉄道/都営地下鉄/都営浅草線.png",
      order: 1
    },
    {
      code: "E",
      nameJa: "大江戸線",
      nameZh: "大江户线",
      nameEn: "Oedo Line",
      nameKo: "",
      color: "#b6006a",
      lineIds: ["Oedo"],
      icon: "../images/鉄道/都営地下鉄/都営大江戸線.png",
      order: 2
    },
    {
      code: "I",
      nameJa: "三田線",
      nameZh: "三田线",
      nameEn: "Mita Line",
      nameKo: "",
      color: "#0079c2",
      lineIds: ["Mita"],
      icon: "../images/鉄道/都営地下鉄/都営三田線.png",
      order: 3
    },
    {
      code: "S",
      nameJa: "新宿線",
      nameZh: "新宿线",
      nameEn: "Shinjuku Line",
      nameKo: "",
      color: "#6cbb5a",
      lineIds: ["Shinjuku"],
      icon: "../images/鉄道/都営地下鉄/都営新宿線.png",
      order: 4
    },
    {
      code: "K",
      nameJa: "都電荒川線",
      nameZh: "都电荒川线",
      nameEn: "Toden Arakawa Line",
      nameKo: "",
      color: "#E040A0",
      lineIds: ["Arakawa"],
      icon: "../images/鉄道/都営地下鉄/都電荒川線.png",
      order: 5
    },
    {
      code: "NT",
      nameJa: "日暮里・舎人ライナー",
      nameZh: "日暮里・舍人Liner",
      nameEn: "Nippori-Toneri Liner",
      nameKo: "",
      color: "#ed6d00",
      lineIds: ["Nippori_Toneri"],
      icon: "../images/鉄道/都営地下鉄/日暮里・舎人ライナー.png",
      order: 6
    }
  ],
  "TOBU": [
    {
      code: "TD",
      nameJa: "野田線（アーバンパークライン）",
      nameZh: "野田线（都市公园线）",
      nameEn: "Noda Line (Urban Park Line)",
      nameKo: "",
      color: "#0093d0",
      lineIds: ["TobuNoda"],
      icon: "../images/鉄道/東武鉄道/野田線.png",
      order: 1
    },
    {
      code: "TI",
      nameJa: "伊勢崎線（スカイツリーライン）",
      nameZh: "伊势崎线（晴空塔线）",
      nameEn: "Isesaki Line (Skytree Line)",
      nameKo: "",
      color: "#002d62",
      lineIds: ["TobuIsesaki"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 2
    },
    {
      code: "TJ",
      nameJa: "東上線",
      nameZh: "东上线",
      nameEn: "Tojo Line",
      nameKo: "",
      color: "#002d62",
      lineIds: ["Tojo"],
      icon: "../images/鉄道/東武鉄道/東武東上線.png",
      order: 3
    },
    {
      code: "TN",
      nameJa: "日光線",
      nameZh: "日光线",
      nameEn: "Nikko Line",
      nameKo: "",
      color: "#e46c0a",
      lineIds: ["TobuNikko"],
      icon: "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
      order: 4
    },
    {
      code: "TK",
      nameJa: "鬼怒川線",
      nameZh: "鬼怒川线",
      nameEn: "Kinugawa Line",
      nameKo: "",
      color: "#e46c0a",
      lineIds: ["Nikkoku"],
      icon: "",
      order: 5
    }
  ],
  "SEIBU": [
    {
      code: "SI",
      nameJa: "池袋線",
      nameZh: "池袋线",
      nameEn: "Ikebukuro Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["Ikebukuro"],
      icon: "../images/鉄道/西武鉄道/西武池袋線.png",
      order: 1
    },
    {
      code: "STO",
      nameJa: "豊島線",
      nameZh: "丰岛线",
      nameEn: "Toshima Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["SeibuToshima"],
      icon: "",
      order: 2
    },
    {
      code: "SCH",
      nameJa: "秩父線",
      nameZh: "秩父线",
      nameEn: "Chichibu Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["SeibuChichibu"],
      icon: "",
      order: 3
    },
    {
      code: "SYU",
      nameJa: "西武有楽町線",
      nameZh: "西武有乐町线",
      nameEn: "Seibu Yurakucho Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["Yurakucho_Seibu"],
      icon: "",
      order: 4
    },
    {
      code: "SSA",
      nameJa: "狭山線",
      nameZh: "狭山线",
      nameEn: "Sayama Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["Seibu_Sayama"],
      icon: "",
      order: 5
    },
    {
      code: "SK",
      nameJa: "国分寺線",
      nameZh: "国分寺线",
      nameEn: "Kokubunji Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["Kokubunji"],
      icon: "../images/鉄道/西武鉄道/西武国分寺線.png",
      order: 6
    },
    {
      code: "SS",
      nameJa: "新宿線",
      nameZh: "新宿线",
      nameEn: "Shinjuku Line",
      nameKo: "",
      color: "#0087c5",
      lineIds: ["SeibuShinjuku"],
      icon: "../images/鉄道/西武鉄道/西武新宿線.png",
      order: 7
    },
    {
      code: "SHM",
      nameJa: "拝島線",
      nameZh: "拜岛线",
      nameEn: "Haijima Line",
      nameKo: "",
      color: "#0087c5",
      lineIds: ["Hamura"],
      icon: "",
      order: 8
    },
    {
      code: "ST",
      nameJa: "多摩湖線",
      nameZh: "多摩湖线",
      nameEn: "Tamako Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["SeibuTamako"],
      icon: "../images/鉄道/西武鉄道/西武多摩湖線.png",
      order: 9
    },
    {
      code: "SW",
      nameJa: "多摩川線",
      nameZh: "多摩川线",
      nameEn: "Tamagawa Line",
      nameKo: "",
      color: "#4da72a",
      lineIds: ["SeibuTamagawa"],
      icon: "../images/鉄道/西武鉄道/西武多摩川線.png",
      order: 10
    },
    {
      code: "SY",
      nameJa: "山口線",
      nameZh: "山口线",
      nameEn: "Yamaguchi Line",
      nameKo: "",
      color: "#ffffff",
      lineIds: ["SeibuYamaguchi"],
      icon: "../images/鉄道/西武鉄道/西武山口線.png",
      order: 11
    }
  ],
  "TOKYU": [
    {
      code: "DT",
      nameJa: "田園都市線",
      nameZh: "田园都市线",
      nameEn: "Den-en-toshi Line",
      nameKo: "",
      color: "#00a850",
      lineIds: ["TokyuDenEn"],
      icon: "../images/鉄道/東急電鉄/田園都市線.png",
      order: 1
    },
    {
      code: "TM",
      nameJa: "東急多摩川線",
      nameZh: "东急多摩川线",
      nameEn: "Tokyu Tamagawa Line",
      nameKo: "",
      color: "#7f1180",
      lineIds: ["TokyuTamagawa"],
      icon: "../images/鉄道/東急電鉄/東急多摩川線.png",
      order: 2
    },
    {
      code: "TY",
      nameJa: "東横線",
      nameZh: "东横线",
      nameEn: "Toyoko Line",
      nameKo: "",
      color: "#da0442",
      lineIds: ["TokyuToyoko"],
      icon: "../images/鉄道/東急電鉄/東横線.png",
      order: 3
    },
    {
      code: "OM",
      nameJa: "東急大井町線",
      nameZh: "东急大井町线",
      nameEn: "Tokyu Oimachi Line",
      nameKo: "",
      color: "#f39700",
      lineIds: ["TokyuOimachi"],
      icon: "../images/鉄道/東急電鉄/大井町線.png",
      order: 4
    },
    {
      code: "MG",
      nameJa: "東急目黒線",
      nameZh: "东急目黑线",
      nameEn: "Tokyu Meguro Line",
      nameKo: "",
      color: "#009b9e",
      lineIds: ["TokyuMeguro"],
      icon: "../images/鉄道/東急電鉄/目黒線.png",
      order: 5
    },
    {
      code: "IK",
      nameJa: "東急池上線",
      nameZh: "东急池上线",
      nameEn: "Tokyu Ikegami Line",
      nameKo: "",
      color: "#ee7b88",
      lineIds: ["TokyuIkegami"],
      icon: "../images/鉄道/東急電鉄/池上線.png",
      order: 6
    },
    {
      code: "SG",
      nameJa: "東急世田谷線",
      nameZh: "东急世田谷线",
      nameEn: "Tokyu Setagaya Line",
      nameKo: "",
      color: "#fccc0a",
      lineIds: ["TokyuSetagaya"],
      icon: "../images/鉄道/東急電鉄/世田谷線.png",
      order: 7
    },
    {
      code: "KD",
      nameJa: "東急こどもの国線",
      nameZh: "东急儿童国线",
      nameEn: "Tokyu Kodomonokuni Line",
      nameKo: "",
      color: "#00a850",
      lineIds: ["TokyuKodomonokuni"],
      icon: "../images/鉄道/東急電鉄/こどもの国線.png",
      order: 8
    }
  ],
  "YOKOHAMA_MUNICIPAL": [
    {
      code: "B",
      nameJa: "ブルーライン",
      nameZh: "蓝线",
      nameEn: "Blue Line",
      nameKo: "",
      color: "#00A0C7",
      lineIds: ["YokohamaBlue"],
      icon: "../images/鉄道/横浜市交通局/ブルーライン.png",
      order: 1
    },
    {
      code: "GR",
      nameJa: "グリーンライン",
      nameZh: "绿线",
      nameEn: "Green Line",
      nameKo: "",
      color: "#00A859",
      lineIds: ["YokohamaGreen"],
      icon: "../images/鉄道/横浜市交通局/グリーンライン.png",
      order: 2
    }
  ],
  "KEIO": [
    {
      code: "IN",
      nameJa: "井の頭線",
      nameZh: "井之头线",
      nameEn: "Inokashira Line",
      nameKo: "",
      color: "#00a0e9",
      lineIds: ["KeioInokashira"],
      icon: "../images/鉄道/京王電鉄/井の頭線.png",
      order: 1
    },
    {
      code: "KO",
      nameJa: "京王線",
      nameZh: "京王线",
      nameEn: "Keio Line",
      nameKo: "",
      color: "#dd057c",
      lineIds: ["KeioMain"],
      icon: "../images/鉄道/京王電鉄/京王線.png",
      order: 2
    },
    {
      code: "KSN",
      nameJa: "京王新線",
      nameZh: "京王新线",
      nameEn: "Keio New Line",
      nameKo: "",
      color: "#dd057c",
      lineIds: ["KeioShin"],
      icon: "../images/鉄道/京王電鉄/京王新線.png",
      order: 3
    },
    {
      code: "KSM",
      nameJa: "相模原線",
      nameZh: "相模原线",
      nameEn: "Sagamihara Line",
      nameKo: "",
      color: "#9C27B0",
      lineIds: ["KeioSagami"],
      icon: "../images/鉄道/京王電鉄/相模原線.png",
      order: 4
    },
    {
      code: "KTK",
      nameJa: "高尾線",
      nameZh: "高尾线",
      nameEn: "Takao Line",
      nameKo: "",
      color: "#9C27B0",
      lineIds: ["KeioTakao"],
      icon: "../images/鉄道/京王電鉄/高尾線.png",
      order: 5
    },
    {
      code: "KKB",
      nameJa: "競馬場線",
      nameZh: "竞马场线",
      nameEn: "Keibajo Line",
      nameKo: "",
      color: "#8C1C8E",
      lineIds: ["KeioKeibajo"],
      icon: "../images/鉄道/京王電鉄/競馬場線.png",
      order: 6
    },
    {
      code: "KZO",
      nameJa: "動物園線",
      nameZh: "动物园线",
      nameEn: "Dobutsuen Line",
      nameKo: "",
      color: "#8C1C8E",
      lineIds: ["KeioZoo"],
      icon: "../images/鉄道/京王電鉄/動物園線.png",
      order: 7
    }
  ],
  "ODAKYU": [
    {
      code: "OH",
      nameJa: "小田原線",
      nameZh: "小田原线",
      nameEn: "Odawara Line",
      nameKo: "",
      color: "#0067b0",
      lineIds: ["Odawara"],
      icon: "../images/鉄道/小田急電鉄/小田原線.png",
      order: 1
    },
    {
      code: "OE",
      nameJa: "江ノ島線",
      nameZh: "江之岛线",
      nameEn: "Enoshima Line",
      nameKo: "",
      color: "#0078C1",
      lineIds: ["OdakyuEnoshima"],
      icon: "../images/鉄道/小田急電鉄/江ノ島線.png",
      order: 2
    },
    {
      code: "OT",
      nameJa: "多摩線",
      nameZh: "多摩线",
      nameEn: "Tama Line",
      nameKo: "",
      color: "#8B0000",
      lineIds: ["OdakyuTama"],
      icon: "../images/鉄道/小田急電鉄/多摩線.png",
      order: 3
    }
  ],
  "KEISEI": [
    {
      code: "KS",
      nameJa: "本線",
      nameZh: "本线",
      nameEn: "Main Line",
      nameKo: "",
      color: "#0054a6",
      lineIds: ["Keisei"],
      icon: "../images/鉄道/京成電鉄/京成本線.png",
      order: 1
    },
    {
      code: "KOS",
      nameJa: "押上線",
      nameZh: "押上线",
      nameEn: "Oshiage Line",
      nameKo: "",
      color: "#0054a6",
      lineIds: ["KeiseiOshiage"],
      icon: "",
      order: 2
    },
    {
      code: "KNS",
      nameJa: "金町線",
      nameZh: "金町线",
      nameEn: "Kanamachi Line",
      nameKo: "",
      color: "#0054a6",
      lineIds: ["KeiseiKanamachi"],
      icon: "",
      order: 3
    },
    {
      code: "KCB",
      nameJa: "千葉線",
      nameZh: "千叶线",
      nameEn: "Chiba Line",
      nameKo: "",
      color: "#0054a6",
      lineIds: ["KeiseiChiba"],
      icon: "",
      order: 4
    },
    {
      code: "KCH",
      nameJa: "千原線",
      nameZh: "千原线",
      nameEn: "Chihara Line",
      nameKo: "",
      color: "#0054a6",
      lineIds: ["KeiseiChihara"],
      icon: "",
      order: 5
    },
    {
      code: "KSA",
      nameJa: "成田スカイアクセス線",
      nameZh: "成田机场Access线",
      nameEn: "Narita Sky Access Line",
      nameKo: "",
      color: "#f39800",
      lineIds: ["NaritaSkyAccess"],
      icon: "",
      order: 6
    }
  ],
  "KEIKYU": [
    {
      code: "KK",
      nameJa: "本線",
      nameZh: "本线",
      nameEn: "Main Line",
      nameKo: "",
      color: "#e60012",
      lineIds: ["Keikyu"],
      icon: "../images/鉄道/京急電鉄/京急本線.png",
      order: 1
    },
    {
      code: "KKA",
      nameJa: "空港線",
      nameZh: "机场线",
      nameEn: "Airport Line",
      nameKo: "",
      color: "#e60012",
      lineIds: ["KeikyuAirport"],
      icon: "../images/鉄道/京急電鉄/空港線.png",
      order: 2
    },
    {
      code: "KKU",
      nameJa: "久里浜線",
      nameZh: "久里滨线",
      nameEn: "Kurihama Line",
      nameKo: "",
      color: "#e60012",
      lineIds: ["KeikyuKurihama"],
      icon: "",
      order: 3
    },
    {
      code: "KKZ",
      nameJa: "逗子線",
      nameZh: "逗子线",
      nameEn: "Zushi Line",
      nameKo: "",
      color: "#e60012",
      lineIds: ["KeikyuZushi"],
      icon: "",
      order: 4
    },
    {
      code: "KKD",
      nameJa: "大師線",
      nameZh: "大师线",
      nameEn: "Daishi Line",
      nameKo: "",
      color: "#e60012",
      lineIds: ["Daishi_Keikyu"],
      icon: "",
      order: 5
    }
  ],
  "SOTETSU": [
    {
      code: "SO",
      nameJa: "本線",
      nameZh: "本线",
      nameEn: "Main Line",
      nameKo: "",
      color: "#003366",
      lineIds: ["SotetsuMain"],
      icon: "",
      order: 1
    },
    {
      code: "SIZ",
      nameJa: "いずみ野線",
      nameZh: "泉野线",
      nameEn: "Izumino Line",
      nameKo: "",
      color: "#003366",
      lineIds: ["SotetsuIzumino"],
      icon: "",
      order: 2
    },
    {
      code: "SSH",
      nameJa: "相鉄新横浜線",
      nameZh: "相铁新横滨线",
      nameEn: "Sotetsu Shin-Yokohama Line",
      nameKo: "",
      color: "#003366",
      lineIds: ["SotetsuShin-Yokohama"],
      icon: "",
      order: 3
    }
  ],
  "TSUKUBA_EXPRESS": [
    {
      code: "TX",
      nameJa: "つくばエクスプレス",
      nameZh: "筑波快线",
      nameEn: "Tsukuba Express",
      nameKo: "",
      color: "#d91e18",
      lineIds: ["TsukubaExpress"],
      icon: "",
      order: 1
    }
  ],
  "SHONAN_MONORAIL": [
    {
      code: "S",
      nameJa: "湘南モノレール江の島線",
      nameZh: "湘南单轨江之岛线",
      nameEn: "Shonan Monorail Enoshima Line",
      nameKo: "",
      color: "#0073bb",
      lineIds: ["ShonanMonorailE"],
      icon: "../images/鉄道/湘南モノレール/湘南モノレール江の島線.png",
      order: 1
    }
  ],
  "TAMA_MONORAIL": [
    {
      code: "TT",
      nameJa: "多摩モノレール線",
      nameZh: "多摩单轨线",
      nameEn: "Tama Toshi Monorail Line",
      nameKo: "",
      color: "#ff9900",
      lineIds: ["TamaMonorail"],
      icon: "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png",
      order: 1
    }
  ],
  "RINKAI": [
    {
      code: "R",
      nameJa: "りんかい線",
      nameZh: "临海线",
      nameEn: "Rinkai Line",
      nameKo: "",
      color: "#009587",
      lineIds: ["Rinkai"],
      icon: "../images/鉄道/東京臨海高速鉄道/臨海線.png",
      order: 1
    }
  ],
  "MINATO_MIRAI": [
    {
      code: "MM",
      nameJa: "みなとみらい線",
      nameZh: "港未来线",
      nameEn: "Minatomirai Line",
      nameKo: "",
      color: "#003399",
      lineIds: ["MinatoMirai"],
      icon: "",
      order: 1
    }
  ],
  "YURIKAMOME": [
    {
      code: "U",
      nameJa: "ゆりかもめ",
      nameZh: "百合鸥",
      nameEn: "Yurikamome",
      nameKo: "",
      color: "#004fa8",
      lineIds: ["Yurikamome"],
      icon: "../images/鉄道/ゆりかもせ/ゆりかもせ.png",
      order: 1
    }
  ],
  "SAITAMA_NEW_URBAN_TRANSIT": [
    {
      code: "NS",
      nameJa: "埼玉新都市交通伊奈線（ニューシャトル）",
      nameZh: "埼玉新都市交通伊奈线（新穿梭）",
      nameEn: "Saitama New Urban Transit Ina Line (New Shuttle)",
      nameKo: "",
      color: "#ea5504",
      lineIds: ["NewShuttle"],
      icon: "",
      order: 1
    }
  ],
  "CHIBA_URBAN_MONORAIL": [
    {
      code: "CM",
      nameJa: "千葉都市モノレール",
      nameZh: "千叶都市单轨电车",
      nameEn: "Chiba Urban Monorail",
      nameKo: "",
      color: "#0099cc",
      lineIds: ["ChibaUrbanMonorail"],
      icon: "",
      order: 1
    }
  ],
  "TOKYO_MONORAIL": [
    {
      code: "MO",
      nameJa: "東京モノレール羽田空港線",
      nameZh: "东京单轨电车羽田机场线",
      nameEn: "Tokyo Monorail Haneda Airport Line",
      nameKo: "",
      color: "#006fc0",
      lineIds: ["TokyoMonorail"],
      icon: "",
      order: 1
    }
  ]
};
