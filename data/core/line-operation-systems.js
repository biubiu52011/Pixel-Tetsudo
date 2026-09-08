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
      color: "#00ac9a",
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
      color: "#f15a22",
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
      color: "#f15a22",
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
      color: "#f2d01f",
      lineIds: ["Tsurumi","TsurumiUmiShibaura","TsurumiOkawa"],
      icon: "../images/鉄道/JR東日本/鶴見線.png",
      order: 8
    },
    {
      code: "JJ",
      nameJa: "常磐線（快速）",
      nameZh: "常磐线（快速）",
      nameEn: "Joban Line (Rapid)",
      nameKo: "",
      color: "#00b261",
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
      color: "#808080",
      lineIds: ["JobanLocal"],
      icon: "../images/鉄道/JR東日本/常磐緩行線.png",
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
      color: "#e21f26",
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
      color: "#f68b1e",
      lineIds: ["UtsunomiyaJR"],
      icon: "../images/鉄道/JR東日本/宇都宮線.png",
      order: 18
    },
    {
      code: "JY",
      nameJa: "山手線",
      nameZh: "山手线",
      nameEn: "Yamanote Line",
      nameKo: "",
      color: "#9acd32",
      lineIds: ["Yamanote"],
      icon: "../images/鉄道/JR東日本/山手線.png",
      order: 19
    },
    {
      code: "ITO",
      nameJa: "伊東線",
      nameZh: "伊东线",
      nameEn: "Ito Line",
      nameKo: "",
      color: "#f68b1e",
      lineIds: ["Ito"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 21
    },
    {
      code: "HAC",
      nameJa: "八高線",
      nameZh: "八高线",
      nameEn: "Hachiko Line",
      nameKo: "",
      color: "#808080",
      lineIds: ["Hachiko"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
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
      icon: "../images/鉄道/JR東日本/JRグループ.png",
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
      icon: "../images/鉄道/JR東日本/JRグループ.png",
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
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 25
    },
    {
      code: "SAG",
      nameJa: "相模線",
      nameZh: "相模线",
      nameEn: "Sagami Line",
      nameKo: "",
      color: "#009793",
      lineIds: ["Sagami"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
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
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 29
    },
    {
      code: "AG",
      nameJa: "吾妻線",
      nameZh: "吾妻线",
      nameEn: "Agatsuma Line",
      nameKo: "",
      color: "#0f5474",
      lineIds: ["Agatsuma"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 30
    },
    {
      code: "BNE",
      nameJa: "磐越東線",
      nameZh: "磐越东线",
      nameEn: "Banetsu East Line",
      nameKo: "",
      color: "#c71585",
      lineIds: ["BanetsuEast"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 31
    },
    {
      code: "BWE",
      nameJa: "磐越西線",
      nameZh: "磐越西线",
      nameEn: "Banetsu West Line",
      nameKo: "",
      color: "#cb7b35",
      lineIds: ["BanetsuWest"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 32
    },
    {
      code: "ECH",
      nameJa: "越後線",
      nameZh: "越后线",
      nameEn: "Echigo Line",
      nameKo: "",
      color: "#40934d",
      lineIds: ["Echigo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 33
    },
    {
      code: "GON",
      nameJa: "五能線",
      nameZh: "五能线",
      nameEn: "Gono Line",
      nameKo: "",
      color: "#0a7aab",
      lineIds: ["Gono"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 34
    },
    {
      code: "HAH",
      nameJa: "八戸線",
      nameZh: "八户线",
      nameEn: "Hachinohe Line",
      nameKo: "",
      color: "#e93920",
      lineIds: ["Hachinohe"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 35
    },
    {
      code: "HAK",
      nameJa: "白新線",
      nameZh: "白新线",
      nameEn: "Hakushin Line",
      nameKo: "",
      color: "#f38b7b",
      lineIds: ["Hakushin"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 36
    },
    {
      code: "IYA",
      nameJa: "飯山線",
      nameZh: "饭山线",
      nameEn: "Iiyama Line",
      nameKo: "",
      color: "#7bc24b",
      lineIds: ["Iiyama"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 37
    },
    {
      code: "ISH",
      nameJa: "石巻線",
      nameZh: "石卷线",
      nameEn: "Ishinomaki Line",
      nameKo: "",
      color: "#ed77a4",
      lineIds: ["Ishinomaki"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 38
    },
    {
      code: "JOE",
      nameJa: "上越線",
      nameZh: "上越线",
      nameEn: "Joetsu Line",
      nameKo: "",
      color: "#00b3e6",
      lineIds: ["Joetsu"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 39
    },
    {
      code: "KAM",
      nameJa: "釜石線",
      nameZh: "釜石线",
      nameEn: "Kamaishi Line",
      nameKo: "",
      color: "#0073bf",
      lineIds: ["Kamaishi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 40
    },
    {
      code: "KIT",
      nameJa: "北上線",
      nameZh: "北上线",
      nameEn: "Kitakami Line",
      nameKo: "",
      color: "#851a72",
      lineIds: ["Kamiishi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 41
    },
    {
      code: "KRS",
      nameJa: "烏山線",
      nameZh: "乌山线",
      nameEn: "Karasuyama Line",
      nameKo: "",
      color: "#339966",
      lineIds: ["Karasuyama"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 42
    },
    {
      code: "KAS",
      nameJa: "鹿島線",
      nameZh: "鹿岛线",
      nameEn: "Kashima Line",
      nameKo: "",
      color: "#c56e2e",
      lineIds: ["Kashima"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 43
    },
    {
      code: "KES",
      nameJa: "気仙沼線",
      nameZh: "气仙沼线",
      nameEn: "Kesennuma Line",
      nameKo: "",
      color: "#3b459b",
      lineIds: ["Kesennuma"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 44
    },
    {
      code: "KOI",
      nameJa: "小海線",
      nameZh: "小海线",
      nameEn: "Komii Line",
      nameKo: "",
      color: "#41934c",
      lineIds: ["Komii"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 45
    },
    {
      code: "KON",
      nameJa: "花輪線",
      nameZh: "花轮线",
      nameEn: "Kounan Line",
      nameKo: "",
      color: "#aa1e30",
      lineIds: ["Kounan"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 46
    },
    {
      code: "KUR",
      nameJa: "久留里線",
      nameZh: "久留里线",
      nameEn: "Kururi Line",
      nameKo: "",
      color: "#00b5ad",
      lineIds: ["Kururi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 47
    },
    {
      code: "MIT",
      nameJa: "水戸線",
      nameZh: "水户线",
      nameEn: "Mito Line",
      nameKo: "",
      color: "#3333ff",
      lineIds: ["Mito"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 48
    },
    {
      code: "MIY",
      nameJa: "弥彦線",
      nameZh: "弥彦线",
      nameEn: "Miyo Line",
      nameKo: "",
      color: "#922790",
      lineIds: ["Miyo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 49
    },
    {
      code: "OFU",
      nameJa: "大船渡線",
      nameZh: "大船渡线",
      nameEn: "Ofunato Line",
      nameKo: "",
      color: "#f18e44",
      lineIds: ["Ofunato"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 50
    },
    {
      code: "OGA",
      nameJa: "男鹿線",
      nameZh: "男鹿线",
      nameEn: "Oga Line",
      nameKo: "",
      color: "#36823e",
      lineIds: ["Oga"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 51
    },
    {
      code: "OIT",
      nameJa: "大糸線",
      nameZh: "大糸线",
      nameEn: "Oito Line",
      nameKo: "",
      color: "#9370db",
      lineIds: ["Oito"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 52
    },
    {
      code: "OMI",
      nameJa: "大湊線",
      nameZh: "大凑线",
      nameEn: "Ominato Line",
      nameKo: "",
      color: "#f1aa28",
      lineIds: ["Ominato"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 53
    },
    {
      code: "OUM",
      nameJa: "奥羽本線",
      nameZh: "奥羽本线",
      nameEn: "Ou Main Line",
      nameKo: "",
      color: "#ee7b28",
      lineIds: ["OuMain"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 54
    },
    {
      code: "RIE",
      nameJa: "陸羽東線",
      nameZh: "陆羽东线",
      nameEn: "Rikuto East Line",
      nameKo: "",
      color: "#888888",
      lineIds: ["RikutoEast"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 55
    },
    {
      code: "RIW",
      nameJa: "陸羽西線",
      nameZh: "陆羽西线",
      nameEn: "Rikuto West Line",
      nameKo: "",
      color: "#6fbf7f",
      lineIds: ["RikutsuWest"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 56
    },
    {
      code: "RYO",
      nameJa: "両毛線",
      nameZh: "两毛线",
      nameEn: "Ryomo Line",
      nameKo: "",
      color: "#ffd400",
      lineIds: ["Ryomo"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 57
    },
    {
      code: "SAN",
      nameJa: "山田線",
      nameZh: "山田线",
      nameEn: "Sanriku Line",
      nameKo: "",
      color: "#cd7a1e",
      lineIds: ["Sanriku"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 58
    },
    {
      code: "SEK",
      nameJa: "仙石線",
      nameZh: "仙石线",
      nameEn: "Senseki Line",
      nameKo: "",
      color: "#00aaee",
      lineIds: ["Senseki"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 59
    },
    {
      code: "SET",
      nameJa: "仙石東北ライン",
      nameZh: "仙石东北线",
      nameEn: "Senseki-Tohoku Line",
      nameKo: "",
      color: "#3cb371",
      lineIds: ["SensekiTohoku"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 60
    },
    {
      code: "SEZ",
      nameJa: "仙山線",
      nameZh: "仙山线",
      nameEn: "Senzan Line",
      nameKo: "",
      color: "#72bc4a",
      lineIds: ["Senzan"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 61
    },
    {
      code: "SHN",
      nameJa: "篠ノ井線",
      nameZh: "篠之井线",
      nameEn: "Shinonoi Line",
      nameKo: "",
      color: "#d56a29",
      lineIds: ["Shinonoi"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 63
    },
    {
      code: "SUI",
      nameJa: "水郡線",
      nameZh: "水郡线",
      nameEn: "Suigun Line",
      nameKo: "",
      color: "#368c44",
      lineIds: ["Suigun","SuigunBranch"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 64
    },
    {
      code: "TAD",
      nameJa: "只見線",
      nameZh: "只见线",
      nameEn: "Tadami Line",
      nameKo: "",
      color: "#008dd1",
      lineIds: ["Tadami"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 65
    },
    {
      code: "TAZ",
      nameJa: "田沢湖線",
      nameZh: "田泽湖线",
      nameEn: "Tazawako Line",
      nameKo: "",
      color: "#9d72b0",
      lineIds: ["Tazawako"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 66
    },
    {
      code: "TSU",
      nameJa: "津軽線",
      nameZh: "津轻线",
      nameEn: "Tsugaru Line",
      nameKo: "",
      color: "#15a2c4",
      lineIds: ["Tsugaru"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 67
    },
    {
      code: "UET",
      nameJa: "羽越本線",
      nameZh: "羽越本线",
      nameEn: "Uetsu Main Line",
      nameKo: "",
      color: "#16c0e9",
      lineIds: ["Uetsu"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 68
    },
    {
      code: "YAM",
      nameJa: "山形線",
      nameZh: "山形线",
      nameEn: "Yamagata Line",
      nameKo: "",
      color: "#ee7b28",
      lineIds: ["Yamagata"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 69
    },
    {
      code: "YON",
      nameJa: "米坂線",
      nameZh: "米坂线",
      nameEn: "Yonezawa Line",
      nameKo: "",
      color: "#9b7eb9",
      lineIds: ["Yonezawa"],
      icon: "../images/鉄道/JR東日本/JRグループ.png",
      order: 70
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
      lineIds: ["Noda"],
      icon: "../images/鉄道/東武鉄道/野田線.png",
      order: 1
    },
    {
      code: "TI",
      nameJa: "伊勢崎線（スカイツリーライン）",
      nameZh: "伊势崎线（晴空塔线）",
      nameEn: "Isesaki Line (Skytree Line)",
      nameKo: "",
      color: "#0f6cc3",
      lineIds: ["TobuSkytree", "TobuIsesaki"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 2
    },
    {
      code: "TJ",
      nameJa: "東上線",
      nameZh: "东上线",
      nameEn: "Tojo Line",
      nameKo: "",
      color: "#000099",
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
      color: "#ffa600",
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
      color: "#ffa600",
      lineIds: ["Nikkoku"],
      icon: "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
      order: 5
    },
    {
      code: "TU",
      nameJa: "宇都宮線",
      nameZh: "宇都宫线",
      nameEn: "Utsunomiya Line",
      nameKo: "",
      color: "#ffa600",
      lineIds: ["Utsunomiya"],
      icon: "../images/鉄道/東武鉄道/宇都宮線.png",
      order: 6
    },
    {
      code: "DTB",
      nameJa: "大師線",
      nameZh: "大师线",
      nameEn: "Daishi Line",
      nameKo: "",
      color: "#0f6cc3",
      lineIds: ["Daishi_Tobu"],
      icon: "../images/鉄道/東武鉄道/大師線.png",
      order: 7
    },
    {
      code: "TKM",
      nameJa: "亀戸線",
      nameZh: "龟户线",
      nameEn: "Kameido Line",
      nameKo: "",
      color: "#0f6cc3",
      lineIds: ["Tobu_Kameido"],
      icon: "../images/鉄道/東武鉄道/亀戸線.png",
      order: 8
    },
    {
      code: "TOG",
      nameJa: "越生線",
      nameZh: "越生线",
      nameEn: "Ogose Line",
      nameKo: "",
      color: "#000099",
      lineIds: ["Ogose"],
      icon: "../images/鉄道/東武鉄道/越生線.png",
      order: 9
    },
    {
      code: "TQZ",
      nameJa: "小泉線",
      nameZh: "小泉线",
      nameEn: "Koizumi Line",
      nameKo: "",
      color: "#ff0000",
      lineIds: ["Koizumi"],
      icon: "../images/鉄道/東武鉄道/小泉線.png",
      order: 10
    },
    {
      code: "SAN",
      nameJa: "佐野線",
      nameZh: "佐野线",
      nameEn: "Sano Line",
      nameKo: "",
      color: "#ff0000",
      lineIds: ["Sano"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 11
    },
    {
      code: "KIR",
      nameJa: "桐生線",
      nameZh: "桐生线",
      nameEn: "Kiryu Line",
      nameKo: "",
      color: "#ff0000",
      lineIds: ["Kiryu"],
      icon: "../images/鉄道/東武鉄道/伊勢崎線 佐野線 桐生線 小泉線 小泉線支線.png",
      order: 12
    }
  ],
  "SEIBU": [
    {
      code: "SI",
      nameJa: "池袋線",
      nameZh: "池袋线",
      nameEn: "Ikebukuro Line",
      nameKo: "",
      color: "#EF7A00",
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
      color: "#EF7A00",
      lineIds: ["SeibuToshima"],
      icon: "../images/鉄道/西武鉄道/西武豊島線.png",
      order: 2
    },
    {
      code: "SCH",
      nameJa: "秩父線",
      nameZh: "秩父线",
      nameEn: "Chichibu Line",
      nameKo: "",
      color: "#EF7A00",
      lineIds: ["SeibuChichibu"],
      icon: "../images/鉄道/西武鉄道/西武秩父線.png",
      order: 3
    },
    {
      code: "SYU",
      nameJa: "西武有楽町線",
      nameZh: "西武有乐町线",
      nameEn: "Seibu Yurakucho Line",
      nameKo: "",
      color: "#EF7A00",
      lineIds: ["Yurakucho_Seibu"],
      icon: "../images/鉄道/西武鉄道/西武有楽町線.png",
      order: 4
    },
    {
      code: "SSA",
      nameJa: "狭山線",
      nameZh: "狭山线",
      nameEn: "Sayama Line",
      nameKo: "",
      color: "#EF7A00",
      lineIds: ["Seibu_Sayama"],
      icon: "../images/鉄道/西武鉄道/西武狭山線.png",
      order: 5
    },
    {
      code: "SEN",
      nameJa: "西武園線",
      nameZh: "西武园线",
      nameEn: "Seibu-en Line",
      nameKo: "",
      color: "#1EAD4C",
      lineIds: ["SeibuEn"],
      icon: "../images/鉄道/西武鉄道/西武園線.png",
      order: 6
    },
    {
      code: "SK",
      nameJa: "国分寺線",
      nameZh: "国分寺线",
      nameEn: "Kokubunji Line",
      nameKo: "",
      color: "#1EAD4C",
      lineIds: ["Kokubunji"],
      icon: "../images/鉄道/西武鉄道/西武国分寺線.png",
      order: 7
    },
    {
      code: "SS",
      nameJa: "新宿線",
      nameZh: "新宿线",
      nameEn: "Shinjuku Line",
      nameKo: "",
      color: "#01A6BF",
      lineIds: ["SeibuShinjuku"],
      icon: "../images/鉄道/西武鉄道/西武新宿線.png",
      order: 8
    },
    {
      code: "SHM",
      nameJa: "拝島線",
      nameZh: "拜岛线",
      nameEn: "Haijima Line",
      nameKo: "",
      color: "#01A6BF",
      lineIds: ["Hamura"],
      icon: "../images/鉄道/西武鉄道/西武拝島線.png",
      order: 9
    },
    {
      code: "ST",
      nameJa: "多摩湖線",
      nameZh: "多摩湖线",
      nameEn: "Tamako Line",
      nameKo: "",
      color: "#F7AF0E",
      lineIds: ["SeibuTamako"],
      icon: "../images/鉄道/西武鉄道/西武多摩湖線.png",
      order: 10
    },
    {
      code: "SW",
      nameJa: "多摩川線",
      nameZh: "多摩川线",
      nameEn: "Tamagawa Line",
      nameKo: "",
      color: "#EF7A00",
      lineIds: ["SeibuTamagawa"],
      icon: "../images/鉄道/西武鉄道/西武多摩川線.png",
      order: 11
    },
    {
      code: "SY",
      nameJa: "山口線",
      nameZh: "山口线",
      nameEn: "Yamaguchi Line",
      nameKo: "",
      color: "#E83E2F",
      lineIds: ["SeibuYamaguchi"],
      icon: "../images/鉄道/西武鉄道/西武山口線.png",
      order: 12
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
      color: "#ae0378",
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
      color: "#f18c43",
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
      color: "#009cd2",
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
      color: "#ee86a7",
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
      color: "#fcc70d",
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
      color: "#0068b7",
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
      color: "#000088",
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
      color: "#dd0076",
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
      color: "#dd0076",
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
      color: "#dd0076",
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
      color: "#dd0076",
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
      color: "#dd0076",
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
      color: "#dd0076",
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
      color: "#2288cc",
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
      color: "#2288cc",
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
      color: "#2288cc",
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
      icon: "../images/鉄道/京成電鉄/京成押上線.png",
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
      icon: "../images/鉄道/京成電鉄/京成金町線.png",
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
      icon: "../images/鉄道/京成電鉄/京成千葉線.png",
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
      icon: "../images/鉄道/京成電鉄/京成千原線.png",
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
      icon: "../images/鉄道/京成電鉄/成田スカイアクセス.png",
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
      color: "#F15A22",
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
      icon: "../images/鉄道/京急電鉄/久里浜線.png",
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
      icon: "../images/鉄道/京急電鉄/逗子線.png",
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
      icon: "../images/鉄道/京急電鉄/大師線.png",
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
      icon: "../images/鉄道/相鉄/相鉄本線.png",
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
      icon: "../images/鉄道/相鉄/相鉄いずみ野線.png",
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
      icon: "../images/鉄道/相鉄/相鉄新横浜線.png",
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
      icon: "../images/鉄道/首都圏新都市鉄道/つくばエクスプレス.png",
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
      color: "#ff0000",
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
      nameKo: "타마 도시 모노레일 선",
      color: "#ff6633",
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
      icon: "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
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
      icon: "../images/鉄道/ゆりかもめ/ゆりかもめ.png",
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
      icon: "../images/鉄道/埼玉新都市交通/伊奈線.png",
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
      color: "#2843ba",
      lineIds: ["ChibaUrbanMonorail"],
      icon: "../images/鉄道/千葉都市モノレール/千葉都市モノレール1号線.png",
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
      color: "#0b70b8",
      lineIds: ["TokyoMonorail"],
      icon: "../images/鉄道/東京モノレール/東京モノレール羽田空港線.png",
      order: 1
    }
  ],
  "MIR": [
    {
      code: "MIR",
      nameJa: "湊線",
      nameZh: "凑线",
      nameEn: "Minato Line",
      nameKo: "",
      color: "#0066B3",
      lineIds: ["HitachiNakaKaimin"],
      icon: "../images/鉄道/ひたちなか海浜鉄道/湊線.png",
      order: 1
    }
  ],
  "JR_WEST": [
    {
      code: "YGH",
      nameJa: "JR山口線",
      nameZh: "JR山口线",
      nameEn: "Yamaguchi Line",
      nameKo: "",
      color: "#f37052",
      lineIds: ["JR_Yamaguchi"],
      order: 1
    }
  ],
  "IGR": [
    {
      code: "IGR",
      nameJa: "いわて銀河鉄道線",
      nameZh: "岩手银河铁道线",
      nameEn: "IGR Iwate Galaxy Railway Line",
      nameKo: "",
      color: "#03459a",
      lineIds: ["IGR"],
      order: 1
    }
  ],
  "AOIMORI": [
    {
      code: "AO",
      nameJa: "青い森鉄道線",
      nameZh: "青森铁路线",
      nameEn: "Aoimori Railway Line",
      nameKo: "",
      color: "#33cbf4",
      lineIds: ["Aoimori"],
      order: 1
    }
  ]
};

/*
 * Line color resolver — single authority for official line colors.
 * Consumers (search-ui, trains-page) MUST call this instead of reading
 * line.color from railway_data.json (which contains fabricated palette
 * values for many lines). LOS is the presentation authority for official HEX.
 */
window.LineOperationSystemsResolveColor = function(lineId) {
  if (!lineId) return null;
  var LOS = window.LineOperationSystems;
  if (!LOS) return null;
  for (var g in LOS) {
    var arr = LOS[g];
    if (!Array.isArray(arr)) continue;
    for (var i = 0; i < arr.length; i++) {
      var sys = arr[i];
      if (sys.lineIds && sys.lineIds.indexOf(lineId) !== -1) {
        return sys.color || null;
      }
    }
  }
  return null;
};
/*
 * Line icon resolver - single authority for system-card icons.
 * Consumers (search-ui, data-state) MUST call this before reading line.image,
 * matching the ResolveColor pattern. LOS owns the icon of every running system.
 */
window.LineOperationSystemsResolveIcon = function(lineId) {
  if (!lineId) return null;
  var LOS = window.LineOperationSystems;
  if (!LOS) return null;
  for (var g in LOS) {
    var arr = LOS[g];
    if (!Array.isArray(arr)) continue;
    for (var i = 0; i < arr.length; i++) {
      var sys = arr[i];
      if (sys.lineIds && sys.lineIds.indexOf(lineId) !== -1) {
        return sys.icon || null;
      }
    }
  }
  return null;
};
