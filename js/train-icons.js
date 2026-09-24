/*
 * Pixel Tetsudo - Train Icon Mapping
 * 列车车型图标映射表
 * 图标来源: trainfrontview.net (32x38px)
 *
 * 4.3.267 垃圾素材彻底移除：删除 37 张非电车占位图（鼠标/耳机/仪表盘/巴士/球衣/徽章/机器人等），
 *   断裂引用统一改指铁道路线符号（MIR 模式，如 都営→都営大江戸線符号、東武→東武東上線符号）；
 *   京王/小田急/西武 运营商默认由错误车型 E235 改为各自路线符号（真实车辆素材待补）。
 * 4.3.266 图库污染清理：移除内容错误占位图引用（大巴/仪表盘/鼠标/赛车/随身听等非电车），
 *   真实车型（E235系/E531系/E721系/211系/京急/京成/相鉄/東武/東急/東京メトロ 等）保留。
 * 车辆图按车型命名原则：一个车型图可服务多条线路（如 E129系 → 信越/白新/越後/弥彦/羽越/上越）。
 */
(function() {
  "use strict";

  // Vehicle deployment zones: specific rolling stock only runs on listed segments
  var VEHICLE_DEPLOYMENTS = {
    // 埼京線 ↔ 川越線：大宮〜川越間は埼京線車両 E233系7000番台が直通担当
    // （川越線独自区間 川越〜高麗川 は LINE_ICONS の E209系3500番台）
    "SaikyoKawagoe": {
      routes: [
        { line: "Kawagoe", from: "Omiya", to: "Kawagoe", icon: "../images/列车/JR東日本/E233系7000番台.png", priority: 2 }
      ]
    },
    // 211系湘南色（橙×绿帯、高崎車両センター）部署区间（参考 trainfrontview.net sozai-e4 高崎地区 + 用户指定 4 路线）
    "211Shonan": {
      routes: [
        { line: "Ryomo", from: "Oyama", to: "Shin-Maebashi", icon: "../images/列车/JR東日本/211系湘南色.png", priority: 1 },   // 両毛線：全線（小山〜新前橋）
        { line: "Agatsuma", from: "Shibukawa", to: "Numata", icon: "../images/列车/JR東日本/211系湘南色.png", priority: 1 },   // 吾妻線：渋川〜沼田
        { line: "Joetsu", from: "Takasaki", to: "Minakami", icon: "../images/列车/JR東日本/211系湘南色.png", priority: 1 },     // 上越線：高崎〜水上
        { line: "Shinetsu", from: "Takasaki", to: "Yokokawa", icon: "../images/列车/JR東日本/211系湘南色.png", priority: 1 }    // 信越本線：高崎〜横川
      ]
    },
    // 211系長野色（冰蓝与青色带）部署区间（参考 trafficnews.jp/post/676306）
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
        { line: "Oito", from: "Matsumoto", to: "Minami-Koya", icon: "../images/列车/JR東日本/E127系0番台.png", priority: 2 },   // 大糸線：全线（E127 核心，优先于 211）
        { line: "Shinonoi", from: "Shiojiri", to: "Shinonoi", icon: "../images/列车/JR東日本/E127系0番台.png", priority: 1 }, // 篠ノ井線：普通运用（班次少于 211）
        { line: "Shinetsu", from: "Shinonoi", to: "Nagano", icon: "../images/列车/JR東日本/E127系0番台.png", priority: 1 }, // 信越本線長野段：极少数班次
        { line: "ChuoTatsuno", from: "Okaya", to: "Shiojiri", icon: "../images/列车/JR東日本/E127系0番台.png", priority: 1 }  // 中央本線辰野支線：区间摆渡（替代 123 系）
      ]
    },
    "E129": {
      routes: [
        { line: "Shinetsu", from: "Naoetsu", to: "Niigata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },   // 信越本線（新潟段）：直江津〜長岡〜新潟
        { line: "Hakushin", from: "Niigata", to: "Shibata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },     // 白新線：全線
        { line: "Echigo", from: "Kashiwazaki-Higashi", to: "Niigata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },  // 越後線：柏崎側端〜吉田〜新潟
        { line: "Miyo", from: "Higashi-Sanjo", to: "Yahiko", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },   // 弥彦線：全線（lineId=Miyo）
        { line: "Uetsu", from: "Niitsu", to: "Murakami", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },         // 羽越本線（新潟直流区間）：新津〜村上
        { line: "Joetsu", from: "Miyaike", to: "Minakami", icon: "../images/列车/JR東日本/E129系.png", priority: 1 }        // 上越線（新潟直流区間）：宮内(長岡)〜水上
      ]
    },
    // ===== 特急・観光列車（typeMatch 按 ODPT trainType 匹配；from/to 省略 = 全線）=====
    "ExpJREast": {
      routes: [
        // v4.3.525-2: ひたち・ときわ 现行车 E657系（JR東日本官网列车页 + 2026年3月改正时刻表全部 E657 10両
        // 实证；原 4.3.480 误设 E261系 pri4 = サフィール踊り子专用车（东海道・伊东线），非常磐线——已修正）
        { line: "Joban", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 4 },          // ひたち・ときわ（E657系）
        { line: "JobanMain", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 4 },      // 常磐線本線上のひたち・ときわ（4.3.480：JobanMain 単独カード対応）
                { line: "SobuRapid", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami", "Wakashio", "Shiosai"], priority: 3 }, // さざなみ・わかしお・しおさい
        { line: "Uchibo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami"], priority: 3 },
        { line: "Sotobo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Wakashio"], priority: 3 },
        { line: "Narita", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Shiosai"], priority: 3 },
        { line: "ChuoMain", icon: "../images/列车/JR東日本/E353系.png", typeMatch: ["Azusa", "Kaiji"], priority: 3 },           // 特急あずさ・かいじ（E353系）
        // v4.3.525: 中央快速線（ChuoRapid）上特急 E353 补全——ODPT 实测 ChuoRapid 上 4 条 LimitedExpress（38M/5041M/5139M 等，dest 松本/甲府=あずさ・かいじ）此前全部 fallback E233系0番台（普通车）
        { line: "ChuoRapid", icon: "../images/列车/JR東日本/E353系.png", typeMatch: ["Azusa", "Kaiji"], priority: 3 },          // 特急あずさ・かいじ（中央快速線区間）
        { line: "Narita", icon: "../images/列车/JR東日本/E259系.png", typeMatch: ["NaritaExpress"], priority: 3 },               // 成田エクスプレス（E259系）
        { line: "OuMain", icon: "../images/列车/JR東日本/E751系.png", typeMatch: ["Tsugaru"], priority: 3 },                  // 特急つがる（青森〜秋田）
        { line: "Uetsu", icon: "../images/列车/JR東日本/E653系.png", typeMatch: ["Inaho"], priority: 3 },                      // 特急いなほ（新潟〜秋田、羽越本線のみ——奥羽本線は走らない）
        { line: "Joetsu", icon: "../images/列车/JR東日本/E257系5500番台.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },       // 特急草津・四万
        { line: "Agatsuma", icon: "../images/列车/JR東日本/E257系5500番台.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },
        { line: "Shinetsu", icon: "../images/列车/JR東日本/E653系1000番台.png", typeMatch: ["Shirayuki"], priority: 3 },        // 特急しらゆき（新潟〜直江津）
        { line: "Nikkoku", icon: "../images/列车/JR東日本/253系.png", typeMatch: ["Nikko", "Kinu"], priority: 3 }              // 特急日光・きぬがわ（253系1000番台、4.3.457 図庫更新で追加）
      ]
    },
    "ExpTobu": {
      routes: [
        // v4.3.485: ODPT 東武特急 trainType 一律 "Tobu.LimitedExpress"（スペーシアX/リバティ/けごん・きぬがわ/りょうもう を区別する具体名なし、
        // 実測：Tobu 時刻表 101 件の LimitedExpress 全て Generic）——typeMatch 具体名は発火しない。
        // 按线代表制：TobuIsesaki 上の LimitedExpress=りょうもう（250系、正確——Isesaki 線特急はりょうもうのみ）；
        // TobuSkytree/TobuNikko 上は けごん・きぬがわ が主体 → 100系（スペーシア）代表（スペーシアX/リバティは trainType で判別不能、
        // りょうもう が浅草〜東武動物公園の Skytree 線区間を走る間も 100系 表示になる既知の限界）。
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/100系（スペーシア）.png", typeMatch: ["LimitedExpress"], priority: 3 },
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/100系（スペーシア）.png", typeMatch: ["LimitedExpress"], priority: 3 },
        { line: "TobuIsesaki", icon: "../images/列车/東武鉄道/250系.png", typeMatch: ["LimitedExpress"], priority: 3 }
      ]
    },
    "ExpKeisei": {
      routes: [
        // 4.3.458：スカイライナー（AE形）は typeMatch で判定——アクセス線の普通列車は 3900系
        { line: "NaritaAccess", icon: "../images/列车/京成電鉄/AE形.png", typeMatch: ["Skyliner"], priority: 3 },
        { line: "NaritaSkyAccess", icon: "../images/列车/京成電鉄/AE形.png", typeMatch: ["Skyliner"], priority: 3 }
      ]
    },
    "ExpOdakyu": {
      routes: [
        { line: "Odawara", icon: "../images/列车/小田急電鉄/70000形.png", typeMatch: ["SuperHakone"], priority: 3 }, // GSE（スーパーはこね）
        { line: "Odawara", icon: "../images/列车/小田急電鉄/60000形.png", typeMatch: ["Hakone", "HomeWay", "MorningWay"], priority: 3 }, // MSE
        { line: "OdakyuEnoshima", icon: "../images/列车/小田急電鉄/30000形.png", typeMatch: ["Enoshima", "BayResort", "HomeWay", "MorningWay"], priority: 3 } // EXE（えのしま等）
      ]
    },
    "ExpSeibu": {
      routes: [
        { line: "Ikebukuro", icon: "../images/列车/西武鉄道/10000系.png", typeMatch: ["Ltrain"], priority: 2 },          // 観光特急 L-train
        { line: "SeibuChichibu", icon: "../images/列车/西武鉄道/10000系.png", typeMatch: ["Ltrain"], priority: 2 },
        { line: "Ikebukuro", icon: "../images/列车/西武鉄道/40000系.png", typeMatch: ["STRAIN", "S-TRAIN"], priority: 2 },      // S-TRAIN（40000系）
        { line: "SeibuShinjuku", icon: "../images/列车/西武鉄道/40000系.png", typeMatch: ["STRAIN", "S-TRAIN"], priority: 2 }
      ]
    }
  };

  // Operator default icons (fallback)
  var OPERATOR_ICONS = {
    "JR-East": "../images/列车/JR東日本/E235系山手線.png",
    "JR West": "../images/列车/JR西日本/w223.png", // 4.3.950：JR西日本現役主力通勤車（223系），原误用JR東日本E235系已修正
    "TokyoMetro": "../images/列车/東京メトロ/1000系.png",
    "Toei": "../images/列车/都営地下鉄/6300形.png", // 4.3.266：原都営浅草線.png 为电子设备占位图，1000形.png 与東武1000系重复已删，改用 6300形（三田線）
    "YokohamaMunicipal": "../images/列车/横浜市交通局/4000形.png",
    "Keio": "../images/列车/京王電鉄/2000系.png", // 4.3.277：京王.png 与 2000系.png 同一图（哈希一致），归并至 2000系.png
    "Odakyu": "../images/列车/小田急電鉄/4000系.png", // 4.3.275：小田急系統共通 4000系（千代田直通の現役主力、小田原/江ノ島/多摩 同一車輛体系）
    "Seibu": "../images/列车/西武鉄道/30000系.png", // 4.3.270：西武运营商默认 = 30000系（通勤主力）
    "Tobu": "../images/列车/東武鉄道/70000系.png", // 4.3.950：東武現役主力（晴空塔线/日光线，2017年投入），原8000系为退役老车已替换
    "Tokyu": "../images/列车/東急電鉄/2020系.png",
    "Keikyu": "../images/列车/京急電鉄/1000系.png",
    "Keisei": "../images/列车/京成電鉄/80000形.png", // 4.3.457：京成本線系主力 80000形（3200形は引退進行）
    "Sotetsu": "../images/列车/相模鉄道/13000系.png", // 4.3.277：相鉄.png 与 13000系.png 同一图，归并
    "TWR": "../images/列车/東京臨海高速鉄道/71-000形.png", // 4.3.457：りんかい線現役主力 71-000形
    "MIR": "../images/列车/東急電鉄/5050系.png",
    "Rinkai": "../images/列车/東京臨海高速鉄道/71-000形.png", // 4.3.457：りんかい線現役主力 71-000形
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/TX-3000系.png", // 4.3.458：TX-3000系（2021年〜新型主力）
    "Yurikamome": "../images/列车/ゆりかもめ/7300系.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/1000系.png", // 4.3.276：实车图恢复
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/2000系.png", // 4.3.276：AGT实车图恢复
    "TokyoMonorail": "../images/列车/東京モノレール/10000形.png", // 4.3.457：東京モノレール現役主力 10000形（1000形は引退）
    "NipporiToneri": "../images/列车/都営地下鉄/330形.png", // 4.3.457：日暮里・舎人ライナー = AGT新交通（330形），実車図に変更
    "MinatoMirai": "../images/列车/東急電鉄/5050系.png",
    "ChibaUrbanMonorail": "../images/列车/千葉都市モノレール/Number_prefix_Chiba_monorail.png", // 千葉都市モノレール（悬垂式，0形・1000形）
    "ShonanMonorail": "../images/列车/湘南モノレール/ShonanMonorail_logo_M.png", // 湘南モノレール（江の島線，5000系）
    // ===== 新幹線JR各社デフォルト（車両アイコン）=====
    "JR-Central": "../images/列车/JR東海/N700系（東海）.png", // JR東海：東海道・山陽新幹線 N700系
    "JR-West": "../images/列车/JR西日本/500系.png", // JR西日本：山陽新幹線 500系
    "JR-Kyushu": "../images/列车/JR九州/800系.png", // JR九州：九州新幹線 800系
    "JR-Hokkaido": "../images/列车/JR東日本/H5系.png" // JR北海道：北海道新幹線 H5系（画像資産はJR東日本ディレクトリに集約）
  };

  // Specific line icons (override operator defaults)
  var LINE_ICONS = {
  "Yamanote": "../images/列车/JR東日本/E235系山手線.png",
  "KeihinTohoku": "../images/列车/JR東日本/E233系1000番台.png",
  "ChuoLocal": "../images/列车/JR東日本/E235系総武中央線.png",
  "ChuoSobuLocal": "../images/列车/JR東日本/E235系総武中央線.png",
  "ChuoRapid": "../images/列车/JR東日本/E233系0番台.png",
  "ChuoMain": "../images/列车/JR東日本/E233系0番台.png",
  "Ome": "../images/列车/JR東日本/E233系青梅線.png",
  "Itsukaichi": "../images/列车/JR東日本/E233系青梅線.png",
  "Saikyo": "../images/列车/JR東日本/E233系7000番台.png",
  "Kawagoe": "../images/列车/JR東日本/E209系3500番台.png",
  "KawagoeWest": "../images/列车/JR東日本/E209系3500番台.png",
  "ShonanShinjuku": "../images/列车/JR東日本/E233系3000番台.png",
  "Yokosuka": "../images/列车/JR東日本/E235系1000番台.png",
  "SobuRapid": "../images/列车/JR東日本/E235系1000番台.png",
  "SobuMain": "../images/列车/JR東日本/E235系1000番台.png",
  "Joban": "../images/列车/JR東日本/E231系常磐LED.png",
  "JobanMain": "../images/列车/JR東日本/E531系.png",
  "JobanLocal": "../images/列车/JR東日本/E233系2000番台.png",
  "JobanRapid": "../images/列车/JR東日本/E231系0番台.png",
  "Mito": "../images/列车/JR東日本/E531系.png",
  "Nikkoku": "../images/列车/JR東日本/E131系600番台.png",
  "Gono": "../images/列车/JR東日本/HB-E220系.png",
  "Yokohama": "../images/列车/JR東日本/E233系6000番台.png",
  "Tokaido": "../images/列车/JR東日本/E233系3000番台.png",
  "Takasaki": "../images/列车/JR東日本/E233系3000番台.png",
  "Musashino": "../images/列车/JR東日本/E231系0番台.png",
  "Uetsu": "../images/列车/JR東日本/701系100番台.png",
  "Ryomo": "../images/列车/JR東日本/211系湘南色.png",
  "Agatsuma": "../images/列车/JR東日本/211系湘南色.png",
  "BanetsuWest": "../images/列车/JR東日本/キハ110系.png",
  "Senzan": "../images/列车/JR東日本/E721系.png",
  "TohokuMain": "../images/列车/JR東日本/E721系.png",
  "Tazawako": "../images/列车/JR東日本/701系盛岡.png",
  "Yamagata": "../images/列车/JR東日本/E723系.png",
  "Senseki": "../images/列车/JR東日本/E131系800番台.png",
  "Keiyo": "../images/列车/JR東日本/E233系5000番台.png",
  "Karasuyama": "../images/列车/JR東日本/EV-E301系.png",
  "Kururi": "../images/列车/JR東日本/キハE130系100番台.png",
  "Suigun": "../images/列车/JR東日本/キハE130系0番台.png",
  "Uchibo": "../images/列车/JR東日本/E131系0番台.png",
  "Hachiko": "../images/列车/JR東日本/HB-E220系.png",
  "Noda": "../images/列车/東武鉄道/80000系.png",
  "ChuoTatsuno": "../images/列车/JR東日本/E127系0番台.png",
  "Joetsu": "../images/列车/JR東日本/211系湘南色.png",
  "Kesennuma": "../images/列车/JR東日本/キハ110系.png",
  "NambuBranch": "../images/列车/JR東日本/E131系0番台.png",
  "Narita": "../images/列车/JR東日本/E131系0番台.png",
  "NaritaAbikoBranch": "../images/列车/JR東日本/E131系0番台.png",
  "NaritaAirportBranch": "../images/列车/JR東日本/E235系1000番台.png",
  "Ofunato": "../images/列车/JR東日本/キハ110系.png",
  "Oito": "../images/列车/JR東日本/E127系0番台.png",
  "OuMain": "../images/列车/JR東日本/キハ110系.png",
  "Shinetsu": "../images/列车/JR東日本/E129系.png",
  "Shinonoi": "../images/列车/JR東日本/211系長野色.png",
  "Togane": "../images/列车/JR東日本/E131系0番台.png",
  "TsurumiOkawa": "../images/列车/JR東日本/E131系1000番台.png",
  "TsurumiUmiShibaura": "../images/列车/JR東日本/E131系1000番台.png",
  "Yamada": "../images/列车/JR東日本/キハ110系.png",
  "Ikebukuro": "../images/列车/西武鉄道/30000系.png",
  "Kiryu": "../images/列车/東武鉄道/8000系.png",
  "Koizumi": "../images/列车/東武鉄道/8000系.png",
  "Sano": "../images/列车/東武鉄道/8000系.png",
  "Ginza": "../images/列车/東京メトロ/1000系.png",
  "Marunouchi": "../images/列车/東京メトロ/2000系.png",
  "MarunouchiBranch": "../images/列车/東京メトロ/2000系.png",
  "Hibiya": "../images/列车/東京メトロ/13000系.png",
  "Tozai": "../images/列车/東京メトロ/15000系.png",
  "Chiyoda": "../images/列车/東京メトロ/16000系.png",
  "Yurakucho": "../images/列车/東京メトロ/17000系.png",
  "Hanzomon": "../images/列车/東急電鉄/2020系.png",
  "Namboku": "../images/列车/東京メトロ/9000系.png",
  "Fukutoshin": "../images/列车/東京メトロ/10000系.png",
  "ChiyodaBranch": "../images/列车/東京メトロ/05系（北綾瀬）.png",
  "Mita": "../images/列车/都営地下鉄/toky6300.png",
  "Asakusa": "../images/列车/都営地下鉄/toky5500.png",
  "Shinjuku": "../images/列车/都営地下鉄/toky10300.png",
  "Oedo": "../images/列车/都営地下鉄/toky12000.png",
  "Arakawa": "../images/列车/東京さくらトラム/todn8500.png",
  "TobuSkytree": "../images/列车/東武鉄道/50000系.png",
  "TobuIsesaki": "../images/列车/東武鉄道/50000系.png",
  "TobuTojo": "../images/列车/東武鉄道/60000系.png",
  "Tojo": "../images/列车/東武鉄道/50000系.png",
  "TobuNikko": "../images/列车/東武鉄道/1000系.png",
  "Tobu_Kameido": "../images/列车/東武鉄道/1000系.png",
  "Ogose": "../images/列车/東武鉄道/50090系.png",
  "TobuUtsunomiya": "../images/列车/東武鉄道/20400系.png",
  "Odawara": "../images/列车/小田急電鉄/5000系.png",
  "OdakyuEnoshima": "../images/列车/小田急電鉄/3000形.png",
  "OdakyuTama": "../images/列车/小田急電鉄/3000形.png",
  "Nambu": "../images/列车/JR東日本/E233系8000番台.png",
  "TokaidoMain": "../images/列车/JR東日本/E233系3000番台.png",
  "Sagami": "../images/列车/JR東日本/E131系500番台.png",
  "Tsurumi": "../images/列车/JR東日本/E131系1000番台.png",
  "Sotobo": "../images/列车/JR東日本/E131系0番台.png",
  "SeibuShinjuku": "../images/列车/西武鉄道/30000系.png",
  "Haijima": "../images/列车/西武鉄道/30000系.png",
  "Kokubunji": "../images/列车/西武鉄道/30000系.png",
  "SeibuTamagawa": "../images/列车/西武鉄道/101系.png",
  "SeibuEn": "../images/列车/西武鉄道/101系（西武園線）.png",
  "Yamaguchi": "../images/列车/西武鉄道/8500系.png",
  "SeibuYamaguchi": "../images/列车/西武鉄道/8500系.png",
  "SeibuChichibu": "../images/列车/西武鉄道/4000系.png",
  "Seibu_Sayama": "../images/列车/西武鉄道/9000系.png",
  "SeibuTamako": "../images/列车/西武鉄道/9000系.png",
  "Yurakucho_Seibu": "../images/列车/西武鉄道/40050系.png",
  "SeibuToshima": "../images/列车/西武鉄道/9000系.png",
  "TokyuDenEn": "../images/列车/東急電鉄/2020系.png",
  "TokyuMeguro": "../images/列车/東急電鉄/3020系.png",
  "TokyuTamagawa": "../images/列车/東急電鉄/7000系.png",
  "Denentoshi": "../images/列车/東急電鉄/2020系.png",
  "Oimachi": "../images/列车/東急電鉄/6020系.png",
  "Meguro": "../images/列车/東急電鉄/3020系.png",
  "Ikegami": "../images/列车/東急電鉄/7000系.png",
  "Tamagawa": "../images/列车/東急電鉄/7000系.png",
  "Kodomonokuni": "../images/列车/東急電鉄/Y000系.png",
  "TokyuIkegami": "../images/列车/東急電鉄/7000系.png",
  "TokyuKodomonokuni": "../images/列车/東急電鉄/Y000系.png",
  "TokyuOimachi": "../images/列车/東急電鉄/6020系.png",
  "TokyuToyoko": "../images/列车/東急電鉄/5050系.png",
  "Toyoko": "../images/列车/東急電鉄/5050系.png",
  "Keikyu": "../images/列车/京急電鉄/1000系.png",
  "KeikyuMain": "../images/列车/京急電鉄/1000系.png",
  "KeikyuAirport": "../images/列车/京急電鉄/1000系.png",
  "Daishi_Keikyu": "../images/列车/京急電鉄/600形.png",
  "KeikyuZushi": "../images/列车/京急電鉄/1000系.png",
  "KeikyuKurihama": "../images/列车/京急電鉄/1000系.png",
  "Keisei": "../images/列车/京成電鉄/80000形.png",
  "KeiseiMain": "../images/列车/京成電鉄/80000形.png",
  "Oshiage": "../images/列车/京成電鉄/80000形.png",
  "Kanamachi": "../images/列车/京成電鉄/80000形.png",
  "Chiba": "../images/列车/京成電鉄/80000形.png",
  "Chihara": "../images/列车/京成電鉄/80000形.png",
  "NaritaAccess": "../images/列车/京成電鉄/3900系.png",
  "KeiseiChiba": "../images/列车/京成電鉄/80000形.png",
  "KeiseiChihara": "../images/列车/京成電鉄/80000形.png",
  "KeiseiKanamachi": "../images/列车/京成電鉄/80000形.png",
  "KeiseiOshiage": "../images/列车/京成電鉄/80000形.png",
  "NaritaSkyAccess": "../images/列车/京成電鉄/3900系.png",
  "ChibaMonorail1": "../images/列车/千葉都市モノレール/Number_prefix_Chiba_monorail.png",
  "ChibaMonorail2": "../images/列车/千葉都市モノレール/Number_prefix_Chiba_monorail.png",
  "ShonanMonorail": "../images/列车/湘南モノレール/ShonanMonorail_logo_M.png",
  "Inokashira": "../images/列车/京王電鉄/1000系.png",
  "KeioInokashira": "../images/列车/京王電鉄/1000系.png",
  "KeioMain": "../images/列车/京王電鉄/5000系.png",
  "Keio-Hachioji": "../images/列车/京王電鉄/5000系.png",
  "KeioTakao": "../images/列车/京王電鉄/7000系.png",
  "KeioZoo": "../images/列车/京王電鉄/7000系.png",
  "KeioKeibajo": "../images/列车/京王電鉄/7000系.png",
  "KeioSagami": "../images/列车/京王電鉄/9000系.png",
  "KeioShin": "../images/列车/京王電鉄/9000系.png",
  "Sotetsu": "../images/列车/相模鉄道/13000系.png",
  "SotetsuMain": "../images/列车/相模鉄道/13000系.png",
  "SotetsuIzumino": "../images/列车/相模鉄道/13000系.png",
  "SotetsuShinyokohama": "../images/列车/相模鉄道/11000系（新塗装）.png",
  "SotetsuShin-Yokohama": "../images/列车/相模鉄道/11000系（新塗装）.png",
  "YokohamaMunicipal": "../images/列车/横浜市交通局/4000形.png",
  "YokohamaBlue": "../images/列车/横浜市交通局/4000形.png",
  "YokohamaGreen": "../images/列车/横浜市交通局/10000形.png",
  "TWR": "../images/列车/東京臨海高速鉄道/71-000形.png",
  "Rinkai": "../images/列车/東京臨海高速鉄道/twr71000.png",
  "MIR": "../images/列车/東急電鉄/5050系.png",
  "TsukubaExpress": "../images/列车/首都圏新都市鉄道/TX-3000系.png",
  "Yurikamome": "../images/列车/ゆりかもめ/yrkm7300.png",
  "TamaMonorail": "../images/列车/多摩モノレール/mn-tma1000.png",
  "TokyoMonorail": "../images/列车/東京モノレール/mn-tky10000.png",
  "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/2000系.png",
  "MinatoMirai": "../images/列车/東急電鉄/5050系.png",
  "NewShuttle": "../images/列车/埼玉新都市交通/2000系.png",
  "Tadami": "../images/列车/JR東日本/GV-E400系.png",
  "Echigo": "../images/列车/JR東日本/E129系.png",
  "Hakushin": "../images/列车/JR東日本/E129系.png",
  "Miyo": "../images/列车/JR東日本/E129系.png",
  "SuigunBranch": "../images/列车/JR東日本/キハE130系0番台.png",
  "Nippori_Toneri": "../images/列车/都営地下鉄/toky330.png",
  "TokyuSetagaya": "../images/鉄道/東急電鉄/世田谷線.png",
  "UtsunomiyaJR": "../images/列车/JR東日本/E233系3000番台.png",
  "BanetsuEast": "../images/列车/JR東日本/キハ110系.png",
  "Iiyama": "../images/列车/JR東日本/キハ110系.png",
  "Ishinomaki": "../images/列车/JR東日本/キハ110系.png",
  "Kamaishi": "../images/列车/JR東日本/キハ110系.png",
  "Kitakami": "../images/列车/JR東日本/キハ110系.png",
  "Komii": "../images/列车/JR東日本/キハ110系.png",
  "Kounan": "../images/列车/JR東日本/キハ110系.png",
  "Oga": "../images/列车/JR東日本/キハ110系.png",
  "Ominato": "../images/列车/JR東日本/キハ110系.png",
  "RikutoEast": "../images/列车/JR東日本/キハ110系.png",
  "RikutsuWest": "../images/列车/JR東日本/キハ110系.png",
  "Tsugaru": "../images/列车/JR東日本/キハ110系.png",
  "Yonezawa": "../images/列车/JR東日本/キハ110系.png",
  "Hachinohe": "../images/列车/JR東日本/キハE130系500番台.png",
  "Ito": "../images/列车/JR東日本/E231系1000番台.png",
  "Kashima": "../images/列车/JR東日本/E131系0番台.png",
  "SensekiTohoku": "../images/列车/JR東日本/HB-E210系.png",
  "Daishi_Tobu": "../images/列车/東武鉄道/1000系.png",
  "TohokuShinkansen": "../images/列车/JR東日本/E5系.png",
  "JoetsuShinkansen": "../images/列车/JR東日本/E7系.png",
  "HokurikuShinkansen": "../images/列车/JR東日本/E7系.png",
  "YamagataShinkansen": "../images/列车/JR東日本/E8系つばさ.png",
  "AkitaShinkansen": "../images/列车/JR東日本/E6系こまち.png",
  "HokkaidoShinkansen": "../images/列车/JR東日本/H5系.png",
  "TokaidoShinkansen": "../images/列车/JR東海/N700系（東海）.png",
  "SanyoShinkansen": "../images/列车/JR西日本/500系.png",
  "KyushuShinkansen": "../images/列车/JR九州/800系.png",
  "NishiKyushuShinkansen": "../images/列车/JR九州/800系.png"
};

  // v4.3.450: 直通列車の車号規則——ODPT Train には車両形式フィールドが無いため、
  // trainNumber の末尾記号で直通車の車籍を識別する（JR 社内直通 京葉↔武蔵野 など）。
  // 例：京葉線上の E 末尾 = 武蔵野線直通（E231系0番台）、武蔵野線上の Y 末尾 = 京葉線直通（E233系5000番台）。
  var THROUGH_SUFFIX_RULES = {
    "Keiyo": [
      { suffix: "E", icon: "../images/列车/JR東日本/E231系0番台.png" }
    ],
    "Musashino": [
      { suffix: "Y", icon: "../images/列车/JR東日本/E233系5000番台.png" }
    ]
  };

  // v4.3.453: 車号プレフィックス規則——直通線の車号先頭記号が車籍系統と一致する場合に使う。
  // 半蔵門線の実測（ODPT 時刻表 994 件）: B プレフィックス 492 件の起点が全て東武側（南栗橋/久喜/
  // 東武動物公園/押上）＝東武50000系、A プレフィックス 502 件の起点が全て東急側（中央林間/長津田/
  // 二子玉川）＝東急2020系。メトロ自社・東急直通は半蔵門線既定アイコン（東急2020系）のまま。
  var THROUGH_PREFIX_RULES = {
    "Hanzomon": [
      { prefix: "B", icon: "../images/列车/東武鉄道/50000系.png" }
    ],
    // v4.3.928: 千代田線 B プレフィックス = JR 常磐線各駅停車との直通車（E233系2000番台）。
    // ODPT vehicleType 実測: "JR E233系"。小田急との直通は特急ロマンスカーのみ。
    "Chiyoda": [
      { prefix: "B", icon: "../images/列车/JR東日本/E233系2000番台.png" }
    ]
  };


  // v4.3.962: trainType+车号段规则表——把 _resolveTrainIcon 里散落的手写 if 特例收进声明式数据
  // 每条规则：{ lines, op, trainType, regex, icon }
  //   lines: 限定 lineId 数组（null = 不限）；op: 限定 operator（null = 不限）
  //   trainType: 限定 trainType 短名子串（null = 不限）；regex: 车号纯数字正则
  // 命中顺序：从上到下，第一条命中即返回（与原来 if 块顺序等价）
  var TRAIN_TYPE_ICON_RULES = [
    // v4.3.925: 千代田线直通小田急ロマンスカー（特急）——60000形MSE
    { lines: ['Chiyoda'], op: null, trainType: 'limitedexpress', regex: null,
      icon: '../images/列车/小田急電鉄/60000形.png' },
    // v4.3.525: 有料特急车号判別（仅 LimitedExpress 时生效，防止 Local 误爆）
    { lines: ['Narita','SobuRapid','Yokosuka','ShonanShinjuku'], op: null,
      trainType: 'limitedexpress', regex: /^2[02]/,
      icon: '../images/列车/JR東日本/E259系.png' },
    { lines: ['Narita','SobuRapid'], op: null,
      trainType: 'limitedexpress', regex: /^40/,
      icon: '../images/列车/JR東日本/E257系500番台.png' },
    { lines: ['ShonanShinjuku'], op: null,
      trainType: 'limitedexpress', regex: /^1[0-9]/,
      icon: '../images/列车/JR東日本/253系.png' },
    // v4.3.525: 东海道线特急（踊り子/湘南）
    { lines: ['Tokaido','ShonanShinjuku'], op: null,
      trainType: 'limitedexpress', regex: /^30[0-3]/,
      icon: '../images/列车/JR東日本/E257系2000番台.png' },
    { lines: ['Tokaido','ShonanShinjuku'], op: null,
      trainType: 'limitedexpress', regex: /^30[7-9]/,
      icon: '../images/列车/JR東日本/E257系2500番台.png' },
  ];

  // v4.3.962: 线路级车型特例（奇偶交替/尾号区分等）
  // 每条：{ lines, op, fn } —— fn(trainId, trainNumberPure) 返回 icon 或 null
  var LINE_ICON_OVERRIDES = [
    // ChuoLocal/ChuoSobuLocal: E231/E235 奇偶交替（trainId 字符码求和 mod 2）
    { lines: ['ChuoLocal','ChuoSobuLocal'], op: null, fn: function(trainId) {
      var n = 0;
      if (typeof trainId === 'number') n = Math.abs(trainId) % 2;
      else if (typeof trainId === 'string') {
        var s = 0; for (var i = 0; i < trainId.length; i++) s += trainId.charCodeAt(i);
        n = s % 2;
      }
      return n === 0
        ? '../images/列车/JR東日本/E231系総武中央線.png'
        : '../images/列车/JR東日本/E235系総武中央線.png';
    }},
    // Rinkai: JR直通 → E233系7000番台
    { lines: ['Rinkai'], op: 'JR-East', fn: function() {
      return '../images/列车/JR東日本/E233系7000番台.png';
    }},
    // v4.3.992: Rinkai TWR——運用調査(loo-ool 2026.9):自有车(70-000形 Z1-Z3/Z7 4本 +
    // 71-000形 Z11-Z14 4本)基本进 81/83/85/87/89/91 六運用,線内折返为主但也会进 JR 直通;
    // 且線内折返也有 E233系7000番台(川越車両センター,JR車 38本 圧倒多数,AI概要+JR車両ガイド:
    // りんかい線の快速/普通で営業運転)——列次号后缀(T/K/F)无法区分形式(车号无区别属实);
    // S0 manual 已标三形式多候选(E233系7000番台 / 71-000形 / 70-000形),此处仅作无依据兜底,
    // 默认 E233系7000番台(多数+ODPT標記一致)。
    { lines: ['Rinkai'], op: 'TWR', fn: function(trainId, tn) {
      return '../images/列车/JR東日本/E233系7000番台.png';
    }},
  ];

  function _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    try {
      // 直通列车：车号前缀/后缀规则（原有逻辑保留）
      var _tp = String(trainId || "").split("_");
      var _tn = _tp.length >= 2 ? _tp[_tp.length - 2] : _tp[0];
      if (THROUGH_PREFIX_RULES[lineId]) {
        var _prules = THROUGH_PREFIX_RULES[lineId];
        for (var _pi = 0; _pi < _prules.length; _pi++) {
          var _prule = _prules[_pi];
          if (_tn && _prule.prefix && _tn.length >= _prule.prefix.length &&
              _tn.slice(0, _prule.prefix.length) === _prule.prefix) {
            return _prule.icon;
          }
        }
      }
      if (THROUGH_SUFFIX_RULES[lineId]) {
        var _rules = THROUGH_SUFFIX_RULES[lineId];
        for (var _ri = 0; _ri < _rules.length; _ri++) {
          var _rule = _rules[_ri];
          if (_tn && _rule.suffix && _tn.length >= _rule.suffix.length &&
              _tn.slice(_tn.length - _rule.suffix.length) === _rule.suffix) {
            return _rule.icon;
          }
        }
      }
    // v4.3.962: trainType+车号段规则表查表（替代原手写 if 块，行为等价）
    var _tnPure = String(_tn || '').replace(/[^0-9]/g, '');
    var _ttLower = String(trainType || '').toLowerCase();
    var _ttShort = _ttLower.indexOf(':') >= 0 ? _ttLower.split(':').pop() : _ttLower;
    var _opShort = String(operator || '').replace(/^odpt\.Operator:/, '');
    // v4.3.962b: 统一 normalizeOp 调用（原两处重复，收口到一次）
    var _normOp = (window.TransitConstants && typeof window.TransitConstants.normalizeOp === 'function') ? window.TransitConstants.normalizeOp : null;
    if (_normOp) _opShort = _normOp(_opShort) || _opShort;
    for (var _ti = 0; _ti < TRAIN_TYPE_ICON_RULES.length; _ti++) {
        var _rule = TRAIN_TYPE_ICON_RULES[_ti];
        if (_rule.lines && _rule.lines.indexOf(lineId) < 0) continue;
        if (_rule.op && _rule.op !== _opShort) continue;
        if (_rule.trainType && _ttShort.indexOf(_rule.trainType) < 0) continue;
        if (_rule.regex && !_rule.regex.test(_tnPure)) continue;
        return _rule.icon;
      }
      // v4.3.962: 线路级车型特例查表（奇偶交替/尾号区分等）
      for (var _oi = 0; _oi < LINE_ICON_OVERRIDES.length; _oi++) {
        var _ovr = LINE_ICON_OVERRIDES[_oi];
        if (_ovr.lines && _ovr.lines.indexOf(lineId) < 0) continue;
        if (_ovr.op && _ovr.op !== _opShort) continue;
        var _ovIcon = _ovr.fn(trainId, _tn);
        if (_ovIcon) return _ovIcon;
      }
      // v4.3.939: 直通车(byOperator)不按当前线兜底，用车籍 operator 默认——治跨线"变身"
      // （同一趟车进不同线路视图用同一张图，不随当前显示线变）
      if (!byOperator && LINE_ICONS[lineId]) return LINE_ICONS[lineId];

      // Fallback to operator default
      var opKey = operator;
      if (_normOp) opKey = _normOp(operator);
      if (OPERATOR_ICONS[opKey]) return OPERATOR_ICONS[opKey];

      // Ultimate fallback
      return "../images/列车/JR東日本/E235系山手線.png";
    } catch(e) {
      return "../images/列车/JR東日本/E235系山手線.png";
    }
  }

  function getTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    return _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator);
  }

  // 车型判断（数据层）——复用与 getTrainIcon 完全相同的选择逻辑，返回型号名（图标文件名去扩展名）
  // Provider: TrainIcons.getTrainClass  Consumer: TrainPositionEstimator / DataFusion（position.trainClass）
  function getTrainClass(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    try {
      var icon = _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator);
      var name = String(icon || '').split('/').pop();
      name = name.replace(/\.png$/i, '');
      return name || '';
    } catch(e) { return ''; }
  }

  // v4.3.940: 车型名 → 图标路径 反查表（从现有所有图标路径自动反推，零维护）
  var VEHICLE_NAME_TO_ICON = {
  "E235系山手線": "../images/列车/JR東日本/E235系山手線.png",
  "E233系1000番台": "../images/列车/JR東日本/E233系1000番台.png",
  "E235系総武中央線": "../images/列车/JR東日本/E235系総武中央線.png",
  "E233系0番台": "../images/列车/JR東日本/E233系0番台.png",
  "E233系青梅線": "../images/列车/JR東日本/E233系青梅線.png",
  "E233系7000番台": "../images/列车/JR東日本/E233系7000番台.png",
  "E209系3500番台": "../images/列车/JR東日本/E209系3500番台.png",
  "E233系3000番台": "../images/列车/JR東日本/E233系3000番台.png",
  "E235系1000番台": "../images/列车/JR東日本/E235系1000番台.png",
  "E231系常磐LED": "../images/列车/JR東日本/E231系常磐LED.png",
  "E531系": "../images/列车/JR東日本/E531系.png",
  "E233系2000番台": "../images/列车/JR東日本/E233系2000番台.png",
  "E231系0番台": "../images/列车/JR東日本/E231系0番台.png",
  "E131系600番台": "../images/列车/JR東日本/E131系600番台.png",
  "HB-E220系": "../images/列车/JR東日本/HB-E220系.png",
  "E233系6000番台": "../images/列车/JR東日本/E233系6000番台.png",
  "701系100番台": "../images/列车/JR東日本/701系100番台.png",
  "211系湘南色": "../images/列车/JR東日本/211系湘南色.png",
  "キハ110系": "../images/列车/JR東日本/キハ110系.png",
  "E721系": "../images/列车/JR東日本/E721系.png",
  "701系盛岡": "../images/列车/JR東日本/701系盛岡.png",
  "E723系": "../images/列车/JR東日本/E723系.png",
  "E131系800番台": "../images/列车/JR東日本/E131系800番台.png",
  "E233系5000番台": "../images/列车/JR東日本/E233系5000番台.png",
  "EV-E301系": "../images/列车/JR東日本/EV-E301系.png",
  "キハE130系100番台": "../images/列车/JR東日本/キハE130系100番台.png",
  "キハE130系0番台": "../images/列车/JR東日本/キハE130系0番台.png",
  "E131系0番台": "../images/列车/JR東日本/E131系0番台.png",
  "80000系": "../images/列车/東武鉄道/80000系.png",
  "E127系0番台": "../images/列车/JR東日本/E127系0番台.png",
  "E129系": "../images/列车/JR東日本/E129系.png",
  "211系長野色": "../images/列车/JR東日本/211系長野色.png",
  "E131系1000番台": "../images/列车/JR東日本/E131系1000番台.png",
  "30000系": "../images/列车/西武鉄道/30000系.png",
  "8000系": "../images/列车/東武鉄道/8000系.png",
  "1000系": "../images/列车/多摩モノレール/mn-tma1000.png",
  "2000系": "../images/列车/東京メトロ/2000系.png",
  "13000系": "../images/列车/東京メトロ/13000系.png",
  "15000系": "../images/列车/東京メトロ/15000系.png",
  "16000系": "../images/列车/東京メトロ/16000系.png",
  "17000系": "../images/列车/東京メトロ/17000系.png",
  "2020系": "../images/列车/東急電鉄/2020系.png",
  "9000系": "../images/列车/東京メトロ/9000系.png",
  "10000系": "../images/列车/東京メトロ/10000系.png",
  "05系（北綾瀬）": "../images/列车/東京メトロ/05系（北綾瀬）.png",
  "6300形": "../images/列车/都営地下鉄/6300形.png",
  "5500形": "../images/列车/都営地下鉄/5500形.png",
  "10-300形": "../images/列车/都営地下鉄/10-300形.png",
  "12-000形": "../images/列车/都営地下鉄/12-000形.png",
  "8500形": "../images/列车/都営地下鉄/8500形.png",
  "50000系": "../images/列车/東武鉄道/50000系.png",
  "60000系": "../images/列车/東武鉄道/60000系.png",
  "50090系": "../images/列车/東武鉄道/50090系.png",
  "20400系": "../images/列车/東武鉄道/20400系.png",
  "5000系": "../images/列车/小田急電鉄/5000系.png",
  "3000形": "../images/列车/小田急電鉄/3000形.png",
  "E233系8000番台": "../images/列车/JR東日本/E233系8000番台.png",
  "E131系500番台": "../images/列车/JR東日本/E131系500番台.png",
  "101系": "../images/列车/西武鉄道/101系.png",
  "101系（西武園線）": "../images/列车/西武鉄道/101系（西武園線）.png",
  "8500系": "../images/列车/西武鉄道/8500系.png",
  "4000系": "../images/列车/西武鉄道/4000系.png",
  "40050系": "../images/列车/西武鉄道/40050系.png",
  "3020系": "../images/列车/東急電鉄/3020系.png",
  "7000系": "../images/列车/東急電鉄/7000系.png",
  "6020系": "../images/列车/東急電鉄/6020系.png",
  "Y000系": "../images/列车/東急電鉄/Y000系.png",
  "5050系": "../images/列车/東急電鉄/5050系.png",
  "600形": "../images/列车/京急電鉄/600形.png",
  "80000形": "../images/列车/京成電鉄/80000形.png",
  "3900系": "../images/列车/京成電鉄/3900系.png",
  "Number_prefix_Chiba_monorail": "../images/列车/千葉都市モノレール/Number_prefix_Chiba_monorail.png",
  "ShonanMonorail_logo_M": "../images/列车/湘南モノレール/ShonanMonorail_logo_M.png",
  "11000系（新塗装）": "../images/列车/相模鉄道/11000系（新塗装）.png",
  "4000形": "../images/列车/横浜市交通局/4000形.png",
  "10000形": "../images/列车/横浜市交通局/10000形.png",
  "71-000形": "../images/列车/東京臨海高速鉄道/twr71000.png",
  "TX-3000系": "../images/列车/首都圏新都市鉄道/tx3000.png",
  "7300系": "../images/列车/ゆりかもめ/yrkm7300.png",
  "GV-E400系": "../images/列车/JR東日本/GV-E400系.png",
  "330形": "../images/列车/都営地下鉄/330形.png",
  "キハE130系500番台": "../images/列车/JR東日本/キハE130系500番台.png",
  "E231系1000番台": "../images/列车/JR東日本/E231系1000番台.png",
  "HB-E210系": "../images/列车/JR東日本/HB-E210系.png",
  "E5系": "../images/列车/JR東日本/E5系.png",
  "E7系": "../images/列车/JR東日本/E7系.png",
  "E8系つばさ": "../images/列车/JR東日本/E8系つばさ.png",
  "E6系こまち": "../images/列车/JR東日本/E6系こまち.png",
  "H5系": "../images/列车/JR東日本/H5系.png",
  "N700系（東海）": "../images/列车/JR東海/N700系（東海）.png",
  "500系": "../images/列车/JR西日本/500系.png",
  "800系": "../images/列车/JR九州/800系.png",
  "E657系": "../images/列车/JR東日本/E657系.png",
  "E257系500番台": "../images/列车/JR東日本/E257系500番台.png",
  "E353系": "../images/列车/JR東日本/E353系.png",
  "E259系": "../images/列车/JR東日本/E259系.png",
  "E751系": "../images/列车/JR東日本/E751系.png",
  "E653系": "../images/列车/JR東日本/E653系.png",
  "E257系5500番台": "../images/列车/JR東日本/E257系5500番台.png",
  "E653系1000番台": "../images/列车/JR東日本/E653系1000番台.png",
  "253系": "../images/列车/JR東日本/253系.png",
  "100系（スペーシア）": "../images/列车/東武鉄道/100系（スペーシア）.png",
  "250系": "../images/列车/東武鉄道/250系.png",
  "AE形": "../images/列车/京成電鉄/AE形.png",
  "70000形": "../images/列车/小田急電鉄/70000形.png",
  "60000形": "../images/列车/小田急電鉄/60000形.png",
  "30000形": "../images/列车/小田急電鉄/30000形.png",
  "40000系": "../images/列车/西武鉄道/40000系.png",
  "E257系2000番台": "../images/列车/JR東日本/E257系2000番台.png",
  "E257系2500番台": "../images/列车/JR東日本/E257系2500番台.png",
  "E2系J編成": "../images/列车/JR東日本/E2系J編成.png",
  "E3系": "../images/列车/JR東日本/E3系.png",
  "E3系2000番台": "../images/列车/JR東日本/E3系2000番台.png",
  "E926系East-i": "../images/列车/JR東日本/E926系East-i.png",
  "E927系SOAR": "../images/列车/JR東日本/E927系SOAR.png",
  "923系ドクターイエロー": "../images/列车/JR東海/923系ドクターイエロー.png",
  "700系": "../images/列车/JR西日本/700系.png",
  "700系（別）": "../images/列车/JR西日本/700系（別）.png",
  "700系（イエロー）": "../images/列车/JR西日本/700系（イエロー）.png",
  "700系（ピンク）": "../images/列车/JR西日本/700系（ピンク）.png",
  "N700系": "../images/列车/JR西日本/N700系.png",
  "N700系（青）": "../images/列车/JR西日本/N700系（青）.png",
  "500系（ピンク）": "../images/列车/JR西日本/500系（ピンク）.png",
  "N700系7000番台": "../images/列车/JR九州/N700系7000番台.png",
  "1000形（別）": "../images/列车/京急電鉄/1000形（別）.png",
  "京急電鉄1000形（別）": "../images/列车/京急電鉄/1000形（別）.png",
  "京急電鉄1000系": "../images/列车/京急電鉄/1000系.png",
  "京成電鉄3000形": "../images/列车/京成電鉄/3000形.png",
  "8800形": "../images/列车/京成電鉄/8800形.png",
  "京成電鉄8800形": "../images/列车/京成電鉄/8800形.png",
  "8900形": "../images/列车/京成電鉄/8900形.png",
  "京成電鉄8900形": "../images/列车/京成電鉄/8900形.png",
  "京王電鉄1000系": "../images/列车/京王電鉄/1000系.png",
  "京王電鉄2000系": "../images/列车/京王電鉄/2000系.png",
  "京王電鉄5000系": "../images/列车/京王電鉄/5000系.png",
  "京王電鉄7000系": "../images/列车/京王電鉄/7000系.png",
  "京王電鉄8000系": "../images/列车/京王電鉄/8000系.png",
  "京王電鉄9000系": "../images/列车/京王電鉄/9000系.png",
  "9000形": "../images/列车/都営地下鉄/9000形.png",
  "都営8800形": "../images/列车/都営地下鉄/8800形.png",
  "都営8900形": "../images/列车/都営地下鉄/8900形.png",
  "2000形": "../images/列车/埼玉新都市交通/2000形.png",
  "埼玉新都市交通2000形": "../images/列车/埼玉新都市交通/2000形.png",
  "埼玉新都市交通2000系": "../images/列车/埼玉新都市交通/nstl2000.png",
  "2000系（01編成）": "../images/列车/埼玉新都市交通/2000系（01編成）.png",
  "埼玉新都市交通2000系（01編成）": "../images/列车/埼玉新都市交通/2000系（01編成）.png",
  "2000系（02編成）": "../images/列车/埼玉新都市交通/2000系（02編成）.png",
  "埼玉新都市交通2000系（02編成）": "../images/列车/埼玉新都市交通/2000系（02編成）.png",
  "2000系（03編成）": "../images/列车/埼玉新都市交通/2000系（03編成）.png",
  "埼玉新都市交通2000系（03編成）": "../images/列车/埼玉新都市交通/2000系（03編成）.png",
  "2000系（04編成）": "../images/列车/埼玉新都市交通/2000系（04編成）.png",
  "埼玉新都市交通2000系（04編成）": "../images/列车/埼玉新都市交通/2000系（04編成）.png",
  "2000系（05編成）": "../images/列车/埼玉新都市交通/2000系（05編成）.png",
  "埼玉新都市交通2000系（05編成）": "../images/列车/埼玉新都市交通/2000系（05編成）.png",
  "2000系（06編成）": "../images/列车/埼玉新都市交通/2000系（06編成）.png",
  "埼玉新都市交通2000系（06編成）": "../images/列车/埼玉新都市交通/2000系（06編成）.png",
  "2000系（07編成）": "../images/列车/埼玉新都市交通/2000系（07編成）.png",
  "埼玉新都市交通2000系（07編成）": "../images/列车/埼玉新都市交通/2000系（07編成）.png",
  "相模鉄道13000系": "../images/列车/相模鉄道/13000系.png",
  "相模鉄道11000系（新塗装）": "../images/列车/相模鉄道/11000系（新塗装）.png",
  "相模鉄道8000系": "../images/列车/相模鉄道/8000系.png",
  "相模鉄道9000系": "../images/列车/相模鉄道/9000系.png",
  "12000系": "../images/列车/相模鉄道/12000系.png",
  "相模鉄道12000系": "../images/列车/相模鉄道/sote12000.png",
  "20000系": "../images/列车/相模鉄道/20000系.png",
  "相模鉄道20000系": "../images/列车/相模鉄道/sote20000.png",
  "1000形": "../images/列车/小田急電鉄/1000形.png",
  "小田急電鉄1000形": "../images/列车/小田急電鉄/1000形.png",
  "50050系": "../images/列车/東急電鉄/50050系.png",
  "東急電鉄50050系": "../images/列车/東急電鉄/50050系.png",
  "1500形": "../images/列车/京急電鉄/1500形.png",
  "京急電鉄1500形": "../images/列车/京急電鉄/1500形.png",
  "3100形": "../images/列车/京成電鉄/3100形.png",
  "京成電鉄3100形": "../images/列车/京成電鉄/3100形.png",
  "AE100形": "../images/列车/京成電鉄/AE100形.png",
  "京成電鉄AE100形": "../images/列车/京成電鉄/AE100形.png",
  "E253系": "../images/列车/JR東日本/E253系.png",
  "JR東日本E253系": "../images/列车/JR東日本/E253系.png",
  "JR東日本E231系1000番台": "../images/列车/JR東日本/E231系1000番台.png",
  "JR東日本E233系1000番台": "../images/列车/JR東日本/E233系1000番台.png",
  "JR東日本E233系3000番台": "../images/列车/JR東日本/E233系3000番台.png",
  "383系": "../images/列车/JR東海/c383.png",
  "JR東海383系": "../images/列车/JR東海/383系.png",
  "285系": "../images/列车/JR西日本/285系.png",
  "JR西日本285系": "../images/列车/JR西日本/285系.png",
  "Y500系": "../images/列车/横浜高速鉄道/Y500系.png",
  "横浜高速鉄道Y500系": "../images/列车/横浜高速鉄道/Y500系.png",
  "小田急電鉄30000形EXEα": "../images/列车/小田急電鉄/30000形.png",
  "小田急電鉄60000形MSE": "../images/列车/小田急電鉄/60000形.png",
  "小田急電鉄70000形GSE": "../images/列车/小田急電鉄/70000形.png",
  "小田急電鉄4000形": "../images/列车/小田急電鉄/4000系.png",
  "東武鉄道10000型": "../images/列车/東武鉄道/10000系.png",
  "東武10000系": "../images/列车/東武鉄道/tob10000.png",
  "10030系（別）": "../images/列车/東武鉄道/10030系（別）.png",
  "東武10030系": "../images/列车/東武鉄道/10030系（別）.png",
  "東武30000系": "../images/列车/東武鉄道/tob30000.png",
  "東武9000系": "../images/列车/東武鉄道/tob9000.png",
  "9050系": "../images/列车/東武鉄道/9050系.png",
  "東武9050系": "../images/列车/東武鉄道/tob9050.png",
  "東武50000系": "../images/列车/東武鉄道/tob50000.png",
  "東武50050系": "../images/列车/東武鉄道/50000系.png",
  "50070系": "../images/列车/東武鉄道/50070系.png",
  "東武50070系": "../images/列车/東武鉄道/50070系.png",
  "東武50090系": "../images/列车/東武鉄道/50090系.png",
  "東武8000系": "../images/列车/東武鉄道/tob8000.png",
  "東武20400系": "../images/列车/東武鉄道/20400系.png",
  "東武100系（スペーシア）": "../images/列车/東武鉄道/100系（スペーシア）.png",
  "N100系": "../images/列车/東武鉄道/N100系.png",
  "東武N100系（スペーシアX）": "../images/列车/東武鉄道/N100系.png",
  "500系（リバティ）": "../images/列车/東武鉄道/500系（リバティ）.png",
  "東武500系（リバティ）": "../images/列车/東武鉄道/500系（リバティ）.png",
  "東武500系（リバティ会津）": "../images/列车/東武鉄道/500系（リバティ）.png",
  "東武500系（リバティりょうもう）": "../images/列车/東武鉄道/500系（リバティ）.png",
  "200系（りょうもう）": "../images/列车/東武鉄道/200系（りょうもう）.png",
  "東武200系（りょうもう）": "../images/列车/東武鉄道/200系（りょうもう）.png",
  "70000系": "../images/列车/東武鉄道/70000系.png",
  "東武70000系": "../images/列车/東武鉄道/tob70000.png",
  "70090系": "../images/列车/東武鉄道/70090系.png",
  "東武70090系": "../images/列车/東武鉄道/70090系.png",
  "東武60000系": "../images/列车/東武鉄道/tob60000.png",
  "東武80000系": "../images/列车/東武鉄道/80000系.png",
  "001系（ラビュー）": "../images/列车/西武鉄道/001系（ラビュー）.png",
  "西武001系": "../images/列车/西武鉄道/seb001.png",
  "西武10000系": "../images/列车/西武鉄道/seb10000.png",
  "西武2000系": "../images/列车/西武鉄道/seb2000.png",
  "西武20000系": "../images/列车/西武鉄道/seb20000.png",
  "西武9000系": "../images/列车/西武鉄道/seb9000.png",
  "西武30000系": "../images/列车/西武鉄道/seb30000.png",
  "西武40000系": "../images/列车/西武鉄道/40000系.png",
  "6000系": "../images/列车/西武鉄道/6000系.png",
  "西武6000系": "../images/列车/西武鉄道/seb6000.png",
  "西武101系": "../images/列车/西武鉄道/seb101.png",
  "西武4000系": "../images/列车/西武鉄道/seb4000.png",
  "西武40050系": "../images/列车/西武鉄道/40050系.png",
  "西武8500系": "../images/列车/西武鉄道/8500系.png",
  "L00系": "../images/列车/西武鉄道/L00系.png",
  "西武L00系": "../images/列车/西武鉄道/L00系.png",
  "東京メトロ1000系": "../images/列车/東京メトロ/1000系.png",
  "東京メトロ2000系": "../images/列车/東京メトロ/2000系.png",
  "東京メトロ13000系": "../images/列车/東京メトロ/13000系.png",
  "東京メトロ16000系": "../images/列车/東京メトロ/16000系.png",
  "16000系（北綾瀬）": "../images/列车/東京メトロ/16000系（北綾瀬）.png",
  "東京メトロ16000系（北綾瀬）": "../images/列车/東京メトロ/16000系（北綾瀬）.png",
  "18000系": "../images/列车/東京メトロ/18000系.png",
  "東京メトロ18000系": "../images/列车/東京メトロ/18000系.png",
  "東京メトロ9000系": "../images/列车/東京メトロ/9000系.png",
  "9000系（別）": "../images/列车/東京メトロ/9000系（別）.png",
  "東京メトロ9000系（5次車）": "../images/列车/東京メトロ/9000系（別）.png",
  "05系（リニューアル）": "../images/列车/東京メトロ/05系（リニューアル）.png",
  "東京メトロ05系": "../images/列车/東京メトロ/05系（リニューアル）.png",
  "東京メトロ05系（北綾瀬）": "../images/列车/東京メトロ/05系（北綾瀬）.png",
  "07系": "../images/列车/東京メトロ/07系.png",
  "東京メトロ07系": "../images/列车/東京メトロ/07系.png",
  "08系": "../images/列车/東京メトロ/08系.png",
  "東京メトロ08系": "../images/列车/東京メトロ/08系.png",
  "東京メトロ15000系": "../images/列车/東京メトロ/15000系.png",
  "5000系（リニューアル）": "../images/列车/東急電鉄/5000系（リニューアル）.png",
  "東急5080系": "../images/列车/東急電鉄/5000系（リニューアル）.png",
  "西武鉄道20000系": "../images/列车/西武鉄道/20000系.png",
  "東急電鉄5000系": "../images/列车/東急電鉄/5000系（リニューアル）.png",
  "1000系（別）": "../images/列车/東急電鉄/1000系（別）.png",
  "東急電鉄1000系": "../images/列车/東急電鉄/1000系（別）.png",
  "埼玉高速鉄道2000形": "../images/列车/埼玉高速鉄道/2000形.png",
  "多摩都市モノレール1000系": "../images/列车/多摩都市モノレール/1000系.png",
  "1000系（別2）": "../images/列车/多摩都市モノレール/1000系（別2）.png",
  "多摩都市モノレール1000系（別2）": "../images/列车/多摩都市モノレール/1000系（別2）.png",
  "1000系（別3）": "../images/列车/多摩都市モノレール/1000系（別3）.png",
  "多摩都市モノレール1000系（別3）": "../images/列车/多摩都市モノレール/1000系（別3）.png",
  "多摩都市モノレール1000系（別）": "../images/列车/多摩都市モノレール/1000系（別）.png",
  "小田急電鉄2000形": "../images/列车/小田急電鉄/2000形.png",
  "小田急電鉄4000系": "../images/列车/小田急電鉄/4000系.png",
  "小田急電鉄80000形": "../images/列车/小田急電鉄/80000形.png",
  "小田急電鉄8000系": "../images/列车/小田急電鉄/8000系.png",
  "東京メトロ8000系": "../images/列车/東京メトロ/8000系.png",
  "東京メトロ9000系（別）": "../images/列车/東京メトロ/9000系（別）.png",
  "東京モノレール10000形": "../images/列车/東京モノレール/mn-tky10000.png",
  "東武鉄道10000系": "../images/列车/東武鉄道/10000系.png",
  "10000系（別）": "../images/列车/東武鉄道/10000系（別）.png",
  "東武鉄道10000系（別）": "../images/列车/東武鉄道/10000系（別）.png",
  "東武鉄道1000系": "../images/列车/東武鉄道/1000系.png",
  "東武鉄道20000系": "../images/列车/東武鉄道/20000系.png",
  "東武鉄道30000系": "../images/列车/東武鉄道/30000系.png",
  "東武鉄道9000系": "../images/列车/東武鉄道/9000系.png",
  "東葉高速鉄道2000系": "../images/列车/東葉高速鉄道/2000系.png",
  "西武鉄道10000系": "../images/列车/西武鉄道/10000系.png",
  "西武鉄道2000系": "../images/列车/西武鉄道/2000系.png",
  "西武鉄道7000系": "../images/列车/西武鉄道/7000系.png",
  "西武鉄道9000系": "../images/列车/西武鉄道/9000系.png",
  "12系客車（ばんえつ物語・別）": "../images/列车/JR東日本/12系客車（ばんえつ物語・別）.png",
  "12系客車（ばんえつ物語）": "../images/列车/JR東日本/12系客車（ばんえつ物語）.png",
  "205系（南武支線）": "../images/列车/JR東日本/205系（南武支線）.png",
  "211系（両毛線）": "../images/列车/JR東日本/211系（両毛線）.png",
  "211系（甲信越）": "../images/列车/JR東日本/211系（甲信越）.png",
  "211系（長野・リニューアル）": "../images/列车/JR東日本/211系（長野・リニューアル）.png",
  "211系（長野・別）": "../images/列车/JR東日本/211系（長野・別）.png",
  "211系（首都圏）": "../images/列车/JR東日本/211系（首都圏）.png",
  "253系（日光・きぬがわ）": "../images/列车/JR東日本/253系（日光・きぬがわ）.png",
  "255系（房総特急）": "../images/列车/JR東日本/255系（房総特急）.png",
  "701系500番台（田沢湖線・別）": "../images/列车/JR東日本/701系500番台（田沢湖線・別）.png",
  "701系500番台（田沢湖線）": "../images/列车/JR東日本/701系500番台（田沢湖線）.png",
  "701系（仙台）": "../images/列车/JR東日本/701系（仙台）.png",
  "701系（奥羽・羽越）": "../images/列车/JR東日本/701系（奥羽・羽越）.png",
  "701系（山形線）": "../images/列车/JR東日本/701系（山形線）.png",
  "C57形（ばんえつ物語）": "../images/列车/JR東日本/C57形（ばんえつ物語）.png",
  "E001系（四季島）": "../images/列车/JR東日本/E001系（四季島）.png",
  "E127系（南武支線）": "../images/列车/JR東日本/E127系（南武支線）.png",
  "E131系（長野）": "../images/列车/JR東日本/E131系（長野）.png",
  "E209系（京葉線）": "../images/列车/JR東日本/E209系（京葉線）.png",
  "E209系（房総）": "../images/列车/JR東日本/E209系（房総）.png",
  "E231系1000番台（別）": "../images/列车/JR東日本/E231系1000番台（別）.png",
  "E231系800番台（東西線直通）": "../images/列车/JR東日本/E231系800番台（東西線直通）.png",
  "E231系総武中央線": "../images/列车/JR東日本/E231系総武中央線.png",
  "E233系0番台（別）": "../images/列车/JR東日本/E233系0番台（別）.png",
  "E233系2000番台（別）": "../images/列车/JR東日本/E233系2000番台（別）.png",
  "E233系5000番台（別）": "../images/列车/JR東日本/E233系5000番台（別）.png",
  "E233系青梅線（別）": "../images/列车/JR東日本/E233系青梅線（別）.png",
  "E233系（房総）": "../images/列车/JR東日本/E233系（房総）.png",
  "E261系（サフィール踊り子）": "../images/列车/JR東日本/E261系（サフィール踊り子）.png",
  "E353系（あずさ・かいじ）": "../images/列车/JR東日本/E353系（あずさ・かいじ）.png",
  "E501系（さきがけ・別）": "../images/列车/JR東日本/E501系（さきがけ・別）.png",
  "E501系（さきがけ）": "../images/列车/JR東日本/E501系（さきがけ）.png",
  "E501系（常磐線）": "../images/列车/JR東日本/E501系（常磐線）.png",
  "E531系3000番台": "../images/列车/JR東日本/E531系3000番台.png",
  "E531系（水戸線）": "../images/列车/JR東日本/E531系（水戸線）.png",
  "E531系（赤電）": "../images/列车/JR東日本/E531系（赤電）.png",
  "E653系（いなほ・別2）": "../images/列车/JR東日本/E653系（いなほ・別2）.png",
  "E653系（いなほ・別3）": "../images/列车/JR東日本/E653系（いなほ・別3）.png",
  "E653系（いなほ・別）": "../images/列车/JR東日本/E653系（いなほ・別）.png",
  "E653系（いなほ）": "../images/列车/JR東日本/E653系（いなほ）.png",
  "E653系（水戸地区・別）": "../images/列车/JR東日本/E653系（水戸地区・別）.png",
  "E653系（水戸地区）": "../images/列车/JR東日本/E653系（水戸地区）.png",
  "E655系（なごみ）": "../images/列车/JR東日本/E655系（なごみ）.png",
  "E657系（ルナ・アズール・別）": "../images/列车/JR東日本/E657系（ルナ・アズール・別）.png",
  "E657系（ルナ・アズール）": "../images/列车/JR東日本/E657系（ルナ・アズール）.png",
  "E657系（別2）": "../images/列车/JR東日本/E657系（別2）.png",
  "E657系（別3）": "../images/列车/JR東日本/E657系（別3）.png",
  "E657系（別4）": "../images/列车/JR東日本/E657系（別4）.png",
  "E657系（別5）": "../images/列车/JR東日本/E657系（別5）.png",
  "E657系（別6）": "../images/列车/JR東日本/E657系（別6）.png",
  "E657系（別）": "../images/列车/JR東日本/E657系（別）.png",
  "E721系（仙台・別）": "../images/列车/JR東日本/E721系（仙台・別）.png",
  "EV-E801系（男鹿線）": "../images/列车/JR東日本/EV-E801系（男鹿線）.png",
  "FV-E991系（HYBARI）": "../images/列车/JR東日本/FV-E991系（HYBARI）.png",
  "GV-E400系（米坂線）": "../images/列车/JR東日本/GV-E400系（米坂線）.png",
  "HB-E300系（さとの・別）": "../images/列车/JR東日本/HB-E300系（さとの・別）.png",
  "HB-E300系（さとの）": "../images/列车/JR東日本/HB-E300系（さとの）.png",
  "HB-E300系（ひなび）": "../images/列车/JR東日本/HB-E300系（ひなび）.png",
  "HB-E300系（リゾートしらかみ・橅・別）": "../images/列车/JR東日本/HB-E300系（リゾートしらかみ・橅・別）.png",
  "HB-E300系（リゾートしらかみ・橅）": "../images/列车/JR東日本/HB-E300系（リゾートしらかみ・橅）.png",
  "HB-E300系（海里）": "../images/列车/JR東日本/HB-E300系（海里）.png",
  "キハ110系（おいこっと）": "../images/列车/JR東日本/キハ110系（おいこっと）.png",
  "キハ110系（おもいで号）": "../images/列车/JR東日本/キハ110系（おもいで号）.png",
  "キハ110系（ハイレール1375）": "../images/列车/JR東日本/キハ110系（ハイレール1375）.png",
  "キハ110系（只見線）": "../images/列车/JR東日本/キハ110系（只見線）.png",
  "キハ110系（大船渡線）": "../images/列车/JR東日本/キハ110系（大船渡線）.png",
  "キハ110系（小海線）": "../images/列车/JR東日本/キハ110系（小海線）.png",
  "キハ110系（東北エモーション）": "../images/列车/JR東日本/キハ110系（東北エモーション）.png",
  "キハ110系（甲信越）": "../images/列车/JR東日本/キハ110系（甲信越）.png",
  "キハ110系（盛岡・幌付）": "../images/列车/JR東日本/キハ110系（盛岡・幌付）.png",
  "キハ110系（盛岡）": "../images/列车/JR東日本/キハ110系（盛岡）.png",
  "キハ110系（陸羽東・左沢・別）": "../images/列车/JR東日本/キハ110系（陸羽東・左沢・別）.png",
  "キハ110系（陸羽東・左沢）": "../images/列车/JR東日本/キハ110系（陸羽東・左沢）.png",
  "キハ40系（ふるさと）": "../images/列车/JR東日本/キハ40系（ふるさと）.png",
  "キハ40系（リゾートしらかみ・くまげら・別）": "../images/列车/JR東日本/キハ40系（リゾートしらかみ・くまげら・別）.png",
  "キハ40系（リゾートしらかみ・くまげら）": "../images/列车/JR東日本/キハ40系（リゾートしらかみ・くまげら）.png",
  "キハ40系（烏山線）": "../images/列车/JR東日本/キハ40系（烏山線）.png",
  "キハ40系（越乃シュクラ）": "../images/列车/JR東日本/キハ40系（越乃シュクラ）.png",
  "キハE120系（只見線・別）": "../images/列车/JR東日本/キハE120系（只見線・別）.png",
  "キハE120系（只見線）": "../images/列车/JR東日本/キハE120系（只見線）.png",
  "キハE200系（小海線）": "../images/列车/JR東日本/キハE200系（小海線）.png",
  "7500系": "../images/列车/ゆりかもめ/yrkm7500.png",
  "1000形（1300番台）": "../images/列车/京急電鉄/1000形（1300番台）.png",
  "1000形（1500番台）": "../images/列车/京急電鉄/1000形（1500番台）.png",
  "1000形（1800番台）": "../images/列车/京急電鉄/1000形（1800番台）.png",
  "2100形": "../images/列车/京急電鉄/2100形.png",
  "3000形（LED）": "../images/列车/京成電鉄/3000形（LED）.png",
  "3000形（別）": "../images/列车/京成電鉄/3000形（別）.png",
  "3150形": "../images/列车/京成電鉄/3150形.png",
  "3200形": "../images/列车/京成電鉄/3200形.png",
  "3500形": "../images/列车/京成電鉄/3500形.png",
  "3700形（LED）": "../images/列车/京成電鉄/3700形（LED）.png",
  "9100形": "../images/列车/北総鉄道/9100形.png",
  "3600形": "../images/列车/千葉ニュータウン鉄道/3600形.png",
  "2020系（2021編成）": "../images/列车/埼玉新都市交通/2020系（2021編成）.png",
  "2020系（2022編成）": "../images/列车/埼玉新都市交通/2020系（2022編成）.png",
  "2020系（2023編成）": "../images/列车/埼玉新都市交通/2020系（2023編成）.png",
  "2020系（2024編成）": "../images/列车/埼玉新都市交通/2020系（2024編成）.png",
  "2020系（2025編成）": "../images/列车/埼玉新都市交通/2020系（2025編成）.png",
  "2020系（2026編成・別）": "../images/列车/埼玉新都市交通/2020系（2026編成・別）.png",
  "2020系（2026編成）": "../images/列车/埼玉新都市交通/2020系（2026編成）.png",
  "30000形（別）": "../images/列车/小田急電鉄/30000形（別）.png",
  "8000系（別）": "../images/列车/小田急電鉄/8000系（別）.png",
  "02系": "../images/列车/東京メトロ/02系.png",
  "05系（別）": "../images/列车/東京メトロ/05系（別）.png",
  "10000系（8両）": "../images/列车/東京メトロ/10000系（8両）.png",
  "16000系（別）": "../images/列车/東京メトロ/16000系（別）.png",
  "1000形（別2）": "../images/列车/東京モノレール/1000形（別2）.png",
  "1000形（別3）": "../images/列车/東京モノレール/1000形（別3）.png",
  "1000形（別4）": "../images/列车/東京モノレール/1000形（別4）.png",
  "東京モノレール2000形": "../images/列车/東京モノレール/mn-tky2000.png",
  "70-000形": "../images/列车/東京臨海高速鉄道/twr70000.png",
  "1000系（いけたまハッピートレイン）": "../images/列车/東急電鉄/1000系（いけたまハッピートレイン）.png",
  "1000系（別4）": "../images/列车/東急電鉄/1000系（別4）.png",
  "3000系（リニューアル）": "../images/列车/東急電鉄/3000系（リニューアル）.png",
  "300系（301編成）": "../images/列车/東急電鉄/300系（301編成）.png",
  "300系（302編成）": "../images/列车/東急電鉄/300系（302編成）.png",
  "300系（303編成）": "../images/列车/東急電鉄/300系（303編成）.png",
  "300系（304編成）": "../images/列车/東急電鉄/300系（304編成）.png",
  "300系（305編成・別）": "../images/列车/東急電鉄/300系（305編成・別）.png",
  "300系（305編成）": "../images/列车/東急電鉄/300系（305編成）.png",
  "300系（306編成）": "../images/列车/東急電鉄/300系（306編成）.png",
  "300系（307編成）": "../images/列车/東急電鉄/300系（307編成）.png",
  "300系（308編成・別）": "../images/列车/東急電鉄/300系（308編成・別）.png",
  "300系（308編成）": "../images/列车/東急電鉄/300系（308編成）.png",
  "300系（309編成）": "../images/列车/東急電鉄/300系（309編成）.png",
  "300系（310編成）": "../images/列车/東急電鉄/300系（310編成）.png",
  "5000系（別）": "../images/列车/東急電鉄/5000系（別）.png",
  "Y000系（別2）": "../images/列车/東急電鉄/Y000系（別2）.png",
  "Y000系（別）": "../images/列车/東急電鉄/Y000系（別）.png",
  "10000系（別2）": "../images/列车/東武鉄道/10000系（別2）.png",
  "10000系（別3）": "../images/列车/東武鉄道/10000系（別3）.png",
  "10030系（近鉄色）": "../images/列车/東武鉄道/10030系（近鉄色）.png",
  "10050系": "../images/列车/東武鉄道/10050系.png",
  "10050系（別）": "../images/列车/東武鉄道/10050系（別）.png",
  "100系（DRCカラー）": "../images/列车/東武鉄道/100系（DRCカラー）.png",
  "100系（リニューアル）": "../images/列车/東武鉄道/100系（リニューアル）.png",
  "100系（別）": "../images/列车/東武鉄道/100系（別）.png",
  "12系客車（SL大樹）": "../images/列车/東武鉄道/12系客車（SL大樹）.png",
  "14系客車（SL大樹）": "../images/列车/東武鉄道/14系客車（SL大樹）.png",
  "200系（りょうもうラッピング）": "../images/列车/東武鉄道/200系（りょうもうラッピング）.png",
  "200系（別）": "../images/列车/東武鉄道/200系（別）.png",
  "20400系（ベリーハッピー）": "../images/列车/東武鉄道/20400系（ベリーハッピー）.png",
  "30000系（別2）": "../images/列车/東武鉄道/30000系（別2）.png",
  "30000系（別）": "../images/列车/東武鉄道/30000系（別）.png",
  "50000系（別2）": "../images/列车/東武鉄道/50000系（別2）.png",
  "50000系（別）": "../images/列车/東武鉄道/50000系（別）.png",
  "6050系": "../images/列车/東武鉄道/6050系.png",
  "634系（スカイツリートレイン）": "../images/列车/東武鉄道/634系（スカイツリートレイン）.png",
  "8000系（亀戸線）": "../images/列车/東武鉄道/8000系（亀戸線）.png",
  "90000系": "../images/列车/東武鉄道/90000系.png",
  "C11形（SL大樹ふたら）": "../images/列车/東武鉄道/C11形（SL大樹ふたら）.png",
  "C11形（SL大樹）": "../images/列车/東武鉄道/C11形（SL大樹）.png",
  "DE10形（ブルーサンダー）": "../images/列车/東武鉄道/DE10形（ブルーサンダー）.png",
  "11000系（おかいもの）": "../images/列车/相模鉄道/11000系（おかいもの）.png",
  "11000系（ほほえみ）": "../images/列车/相模鉄道/11000系（ほほえみ）.png",
  "10000系（観光特急）": "../images/列车/西武鉄道/10000系（観光特急）.png",
  "2000系（2色塗り）": "../images/列车/西武鉄道/2000系（2色塗り）.png",
  "2000系（武蔵野鉄道色）": "../images/列车/西武鉄道/2000系（武蔵野鉄道色）.png",
  "40000系（トキイロ）": "../images/列车/西武鉄道/40000系（トキイロ）.png",
  "40000系（別）": "../images/列车/西武鉄道/40000系（別）.png",
  "4000系（別）": "../images/列车/西武鉄道/4000系（別）.png",
  "40050系（ラッピング）": "../images/列车/西武鉄道/40050系（ラッピング）.png",
  "40050系（別）": "../images/列车/西武鉄道/40050系（別）.png",
  "6000系（別）": "../images/列车/西武鉄道/6000系（別）.png",
  "L00系（別）": "../images/列车/西武鉄道/L00系（別）.png",
  "10-490形": "../images/列车/都営地下鉄/10-490形.png",
  "10-520形": "../images/列车/都営地下鉄/10-520形.png",
  "12-690形": "../images/列车/都営地下鉄/12-690形.png",
  "12-700形": "../images/列车/都営地下鉄/12-700形.png",
  "320形": "../images/列车/都営地下鉄/320形.png",
  "6500形": "../images/列车/都営地下鉄/6500形.png",
  "7000形": "../images/列车/都営地下鉄/7000形.png",
  "7500形": "../images/列车/都営地下鉄/7500形.png",
  "7700形": "../images/列车/都営地下鉄/7700形.png",
  "8500形（別）": "../images/列车/都営地下鉄/8500形（別）.png",
  "8800形（別2）": "../images/列车/都営地下鉄/8800形（別2）.png",
  "8800形（別3）": "../images/列车/都営地下鉄/8800形（別3）.png",
  "8800形（別）": "../images/列车/都営地下鉄/8800形（別）.png",
  "8900形（別2）": "../images/列车/都営地下鉄/8900形（別2）.png",
  "8900形（別3）": "../images/列车/都営地下鉄/8900形（別3）.png",
  "8900形（別）": "../images/列车/都営地下鉄/8900形（別）.png",
  "花100形": "../images/列车/都営地下鉄/花100形.png",
  "TX-1000系": "../images/列车/首都圏新都市鉄道/tx1000.png",
  "TX-1000系（別）": "../images/列车/首都圏新都市鉄道/TX-1000系（別）.png",
  "TX-2000系": "../images/列车/首都圏新都市鉄道/tx2000.png",
  "TX-2000系（別2）": "../images/列车/首都圏新都市鉄道/TX-2000系（別2）.png",
  "TX-2000系（別3）": "../images/列车/首都圏新都市鉄道/TX-2000系（別3）.png",
  "TX-2000系（別）": "../images/列车/首都圏新都市鉄道/TX-2000系（別）.png",
  "313系": "../images/列车/JR東海/c313.png",
  "315系": "../images/列车/JR東海/c315.png",
  "373系": "../images/列车/JR東海/c373.png",
  "埼玉新都市交通1000系": "../images/列车/埼玉新都市交通/nstl1054.png",
  "埼玉新都市交通2020系": "../images/列车/埼玉新都市交通/nstl2021.png",
  "都電4000形": "../images/列车/東京さくらトラム/todn4000.png",
  "都電5500形": "../images/列车/東京さくらトラム/todn5500.png",
  "都電6000形": "../images/列车/東京さくらトラム/todn6000.png",
  "都電7000形": "../images/列车/東京さくらトラム/todn7000.png",
  "都電7500形": "../images/列车/東京さくらトラム/todn7500.png",
  "都電7700形": "../images/列车/東京さくらトラム/todn7700.png",
  "都電8000形": "../images/列车/東京さくらトラム/todn8000.png",
  "都電8500形": "../images/列车/東京さくらトラム/todn8500.png",
  "都電8800形": "../images/列车/東京さくらトラム/todn8800.png",
  "都電8900形": "../images/列车/東京さくらトラム/todn8900.png",
  "都電9000形": "../images/列车/東京さくらトラム/todn9000.png",
  "東京モノレール100形": "../images/列车/東京モノレール/mn-tky100.png",
  "東京モノレール500形": "../images/列车/東京モノレール/mn-tky500.png",
  "東京モノレール700形": "../images/列车/東京モノレール/mn-tky700.png",
  "東武100系": "../images/列车/東武鉄道/tob100.png",
  "東武200系": "../images/列车/東武鉄道/tob200.png",
  "東武20000系": "../images/列车/東武鉄道/tob20000.png",
  "横浜市交通局1000形": "../images/列车/横浜市交通局/yok1000.png",
  "横浜市交通局10000形": "../images/列车/横浜市交通局/yok10000.png",
  "横浜市交通局2000形": "../images/列车/横浜市交通局/yok2000.png",
  "横浜市交通局4000形": "../images/列车/横浜市交通局/yok4000.png",
  "相模鉄道10000系": "../images/列车/相模鉄道/sote10000.png",
  "相模鉄道11000系": "../images/列车/相模鉄道/sote11000.png",
  "都営10-000形": "../images/列车/都営地下鉄/toky10000.png",
  "都営10-250形": "../images/列车/都営地下鉄/toky10250.png",
  "都営10-300形": "../images/列车/都営地下鉄/toky10300.png",
  "都営10-490形": "../images/列车/都営地下鉄/toky10490.png",
  "都営10-520形": "../images/列车/都営地下鉄/toky10520.png",
  "都営12-000形": "../images/列车/都営地下鉄/toky12000.png",
  "都営12-600形": "../images/列车/都営地下鉄/toky12600.png",
  "都営12-690形": "../images/列车/都営地下鉄/toky12690.png",
  "都営12-700形": "../images/列车/都営地下鉄/toky12700.png",
  "都営300形": "../images/列车/都営地下鉄/toky300.png",
  "都営320形": "../images/列车/都営地下鉄/toky320.png",
  "都営330形": "../images/列车/都営地下鉄/toky330.png",
  "都営5000形": "../images/列车/都営地下鉄/toky5000.png",
  "都営5200形": "../images/列车/都営地下鉄/toky5200.png",
  "都営5300形": "../images/列车/都営地下鉄/toky5300.png",
  "都営5500形": "../images/列车/都営地下鉄/toky5500.png",
  "都営6000形": "../images/列车/都営地下鉄/toky6000.png",
  "都営6300形": "../images/列车/都営地下鉄/toky6300.png",
  "都営6500形": "../images/列车/都営地下鉄/toky6500.png",
  "toky6300": "../images/列车/都営地下鉄/toky6300.png",
  "toky5500": "../images/列车/都営地下鉄/toky5500.png",
  "toky10300": "../images/列车/都営地下鉄/toky10300.png",
  "toky12000": "../images/列车/都営地下鉄/toky12000.png",
  "todn8500": "../images/列车/東京さくらトラム/todn8500.png",
  "twr71000": "../images/列车/東京臨海高速鉄道/twr71000.png",
  "yrkm7300": "../images/列车/ゆりかもめ/yrkm7300.png",
  "mn-tma1000": "../images/列车/多摩モノレール/mn-tma1000.png",
  "mn-tky10000": "../images/列车/東京モノレール/mn-tky10000.png",
  "toky330": "../images/列车/都営地下鉄/toky330.png",
  "E209系": "../images/列车/JR東日本/e209bbb.png",
  "東京モノレール1000形": "../images/列车/東京モノレール/1000形（別）.png",
  "東京モノレール330形": "../images/列车/東京モノレール/mn-tky33.png",
  "東武10050系": "../images/列车/東武鉄道/tob10050.png",
  "東武90000系": "../images/列车/東武鉄道/tob90000.png",
  "横浜市交通局3000形": "../images/列车/横浜市交通局/yok3000h.png"
};
  // v4.3.973: 额外车型图标注册表——未被 LINE_ICONS/OPERATOR_ICONS/VEHICLE_DEPLOYMENTS 引用的变体资产（新干线各系变体等），
  // 一并注入反查索引，使别名/直接解析都能命中
  var EXTRA_VEHICLE_ICONS = {
    "E2系J編成": "../images/列车/JR東日本/E2系J編成.png",
    "E3系": "../images/列车/JR東日本/E3系.png",
    "E3系2000番台": "../images/列车/JR東日本/E3系2000番台.png",
    "E926系East-i": "../images/列车/JR東日本/E926系East-i.png",
    "E927系SOAR": "../images/列车/JR東日本/E927系SOAR.png",
    "923系ドクターイエロー": "../images/列车/JR東海/923系ドクターイエロー.png",
    "700系": "../images/列车/JR西日本/700系.png",
    "700系（別）": "../images/列车/JR西日本/700系（別）.png",
    "700系（イエロー）": "../images/列车/JR西日本/700系（イエロー）.png",
    "700系（ピンク）": "../images/列车/JR西日本/700系（ピンク）.png",
    "N700系": "../images/列车/JR西日本/N700系.png",
    "N700系（青）": "../images/列车/JR西日本/N700系（青）.png",
    "500系（ピンク）": "../images/列车/JR西日本/500系（ピンク）.png",
  // v4.3.975: 自动补全未引用图标资产（扫描 images/列车 生成，反推表全覆盖，别名链打通）
    "N700系7000番台": "../images/列车/JR九州/N700系7000番台.png",
    "京急電鉄1000形（別）": "../images/列车/京急電鉄/1000形（別）.png",
    "京急電鉄1000系": "../images/列车/京急電鉄/1000系.png",
    "京成電鉄3000形": "../images/列车/京成電鉄/3000形.png",
    "京成電鉄8800形": "../images/列车/京成電鉄/8800形.png",
    "京成電鉄8900形": "../images/列车/京成電鉄/8900形.png",
    "京王電鉄1000系": "../images/列车/京王電鉄/1000系.png",
    "京王電鉄2000系": "../images/列车/京王電鉄/2000系.png",
    "京王電鉄5000系": "../images/列车/京王電鉄/5000系.png",
    "京王電鉄7000系": "../images/列车/京王電鉄/7000系.png",
    "京王電鉄8000系": "../images/列车/京王電鉄/8000系.png",
    "京王電鉄9000系": "../images/列车/京王電鉄/9000系.png",
    // v4.3.1004: 都電荒川線9000形（レトロ車、9001えんじ/9002青、ダブルルーフ、官网+百科实证）专属图标
    "9000形": "../images/列车/都営地下鉄/9000形.png",
    "都営8800形": "../images/列车/都営地下鉄/8800形.png",
    "都営8900形": "../images/列车/都営地下鉄/8900形.png",
    "埼玉新都市交通2000形": "../images/列车/埼玉新都市交通/2000形.png",
    "埼玉新都市交通2000系": "../images/列车/埼玉新都市交通/2000系.png",
    "埼玉新都市交通2000系（01編成）": "../images/列车/埼玉新都市交通/2000系（01編成）.png",
    "埼玉新都市交通2000系（02編成）": "../images/列车/埼玉新都市交通/2000系（02編成）.png",
    "埼玉新都市交通2000系（03編成）": "../images/列车/埼玉新都市交通/2000系（03編成）.png",
    "埼玉新都市交通2000系（04編成）": "../images/列车/埼玉新都市交通/2000系（04編成）.png",
    "埼玉新都市交通2000系（05編成）": "../images/列车/埼玉新都市交通/2000系（05編成）.png",
    "埼玉新都市交通2000系（06編成）": "../images/列车/埼玉新都市交通/2000系（06編成）.png",
    "埼玉新都市交通2000系（07編成）": "../images/列车/埼玉新都市交通/2000系（07編成）.png",
    "相模鉄道13000系": "../images/列车/相模鉄道/13000系.png",
    "相模鉄道11000系（新塗装）": "../images/列车/相模鉄道/11000系（新塗装）.png",
    "相模鉄道8000系": "../images/列车/相模鉄道/8000系.png",
    "相模鉄道9000系": "../images/列车/相模鉄道/9000系.png",
    "相模鉄道12000系": "../images/列车/相模鉄道/12000系.png",
    "相模鉄道20000系": "../images/列车/相模鉄道/20000系.png",
    "小田急電鉄1000形": "../images/列车/小田急電鉄/1000形.png",
    "東急電鉄50050系": "../images/列车/東急電鉄/50050系.png",
    "京急電鉄1500形": "../images/列车/京急電鉄/1500形.png",
    "京成電鉄3100形": "../images/列车/京成電鉄/3100形.png",
    "京成電鉄AE100形": "../images/列车/京成電鉄/AE100形.png",
    "JR東日本E253系": "../images/列车/JR東日本/E253系.png",
    "JR東日本E231系1000番台": "../images/列车/JR東日本/E231系1000番台.png",
    "JR東日本E233系1000番台": "../images/列车/JR東日本/E233系1000番台.png",
    "JR東日本E233系3000番台": "../images/列车/JR東日本/E233系3000番台.png",
    "JR東海383系": "../images/列车/JR東海/383系.png",
    "JR西日本285系": "../images/列车/JR西日本/285系.png",
    "横浜高速鉄道Y500系": "../images/列车/横浜高速鉄道/Y500系.png",
    "小田急電鉄30000形EXEα": "../images/列车/小田急電鉄/30000形.png",
    "小田急電鉄60000形MSE": "../images/列车/小田急電鉄/60000形.png",
    "小田急電鉄70000形GSE": "../images/列车/小田急電鉄/70000形.png",
    "小田急電鉄4000形": "../images/列车/小田急電鉄/4000系.png",
    "東武鉄道10000型": "../images/列车/東武鉄道/10000系.png",
    "東武10000系": "../images/列车/東武鉄道/10000系.png",
    "東武10030系": "../images/列车/東武鉄道/10030系（別）.png",
    "東武30000系": "../images/列车/東武鉄道/30000系.png",
    "東武9000系": "../images/列车/東武鉄道/9000系.png",
    "東武9050系": "../images/列车/東武鉄道/9050系.png",
    "東武50000系": "../images/列车/東武鉄道/50000系.png",
    "東武50050系": "../images/列车/東武鉄道/50000系.png",
    "東武50070系": "../images/列车/東武鉄道/50070系.png",
    "東武50090系": "../images/列车/東武鉄道/50090系.png",
    "東武8000系": "../images/列车/東武鉄道/8000系.png",
    "東武20400系": "../images/列车/東武鉄道/20400系.png",
    "東武100系（スペーシア）": "../images/列车/東武鉄道/100系（スペーシア）.png",
    "東武N100系（スペーシアX）": "../images/列车/東武鉄道/N100系.png",
    "東武500系（リバティ）": "../images/列车/東武鉄道/500系（リバティ）.png",
    "東武500系（リバティ会津）": "../images/列车/東武鉄道/500系（リバティ）.png",
    "東武500系（リバティりょうもう）": "../images/列车/東武鉄道/500系（リバティ）.png",
    "東武200系（りょうもう）": "../images/列车/東武鉄道/200系（りょうもう）.png",
    "東武70000系": "../images/列车/東武鉄道/70000系.png",
    "東武70090系": "../images/列车/東武鉄道/70090系.png",
    "東武60000系": "../images/列车/東武鉄道/60000系.png",
    "東武80000系": "../images/列车/東武鉄道/80000系.png",
    "西武001系": "../images/列车/西武鉄道/001系（ラビュー）.png",
    "西武10000系": "../images/列车/西武鉄道/10000系.png",
    "西武2000系": "../images/列车/西武鉄道/2000系.png",
    "西武20000系": "../images/列车/西武鉄道/20000系.png",
    "西武9000系": "../images/列车/西武鉄道/9000系.png",
    "西武30000系": "../images/列车/西武鉄道/30000系.png",
    "西武40000系": "../images/列车/西武鉄道/40000系.png",
    "西武6000系": "../images/列车/西武鉄道/6000系.png",
    "西武101系": "../images/列车/西武鉄道/101系.png",
    "西武4000系": "../images/列车/西武鉄道/4000系.png",
    "西武40050系": "../images/列车/西武鉄道/40050系.png",
    "西武8500系": "../images/列车/西武鉄道/8500系.png",
    "西武L00系": "../images/列车/西武鉄道/L00系.png",
    "東京メトロ1000系": "../images/列车/東京メトロ/1000系.png",
    "東京メトロ2000系": "../images/列车/東京メトロ/2000系.png",
    "東京メトロ13000系": "../images/列车/東京メトロ/13000系.png",
    "東京メトロ16000系": "../images/列车/東京メトロ/16000系.png",
    "東京メトロ16000系（北綾瀬）": "../images/列车/東京メトロ/16000系（北綾瀬）.png",
    "東京メトロ18000系": "../images/列车/東京メトロ/18000系.png",
    "東京メトロ9000系": "../images/列车/東京メトロ/9000系.png",
    "東京メトロ9000系（5次車）": "../images/列车/東京メトロ/9000系（別）.png",
    "東京メトロ05系": "../images/列车/東京メトロ/05系（リニューアル）.png",
    "東京メトロ05系（北綾瀬）": "../images/列车/東京メトロ/05系（北綾瀬）.png",
    "東京メトロ07系": "../images/列车/東京メトロ/07系.png",
    "東京メトロ08系": "../images/列车/東京メトロ/08系.png",
    "東京メトロ15000系": "../images/列车/東京メトロ/15000系.png",
    "東急5080系": "../images/列车/東急電鉄/5000系（リニューアル）.png",
    "西武鉄道20000系": "../images/列车/西武鉄道/20000系.png",
    "東急電鉄5000系": "../images/列车/東急電鉄/5000系（リニューアル）.png",
    "東急電鉄1000系": "../images/列车/東急電鉄/1000系（別）.png",
    "埼玉高速鉄道2000形": "../images/列车/埼玉高速鉄道/2000形.png",
    "多摩都市モノレール1000系": "../images/列车/多摩都市モノレール/1000系.png",
    "多摩都市モノレール1000系（別2）": "../images/列车/多摩都市モノレール/1000系（別2）.png",
    "多摩都市モノレール1000系（別3）": "../images/列车/多摩都市モノレール/1000系（別3）.png",
    "多摩都市モノレール1000系（別）": "../images/列车/多摩都市モノレール/1000系（別）.png",
    "小田急電鉄2000形": "../images/列车/小田急電鉄/2000形.png",
    "小田急電鉄4000系": "../images/列车/小田急電鉄/4000系.png",
    "小田急電鉄80000形": "../images/列车/小田急電鉄/80000形.png",
    "小田急電鉄8000系": "../images/列车/小田急電鉄/8000系.png",
    "東京メトロ8000系": "../images/列车/東京メトロ/8000系.png",
    "東京メトロ9000系（別）": "../images/列车/東京メトロ/9000系（別）.png",
    "東京モノレール10000形": "../images/列车/東京モノレール/10000形.png",
    "東武鉄道10000系": "../images/列车/東武鉄道/10000系.png",
    "東武鉄道10000系（別）": "../images/列车/東武鉄道/10000系（別）.png",
    "東武鉄道1000系": "../images/列车/東武鉄道/1000系.png",
    "東武鉄道20000系": "../images/列车/東武鉄道/20000系.png",
    "東武鉄道30000系": "../images/列车/東武鉄道/30000系.png",
    "東武鉄道9000系": "../images/列车/東武鉄道/9000系.png",
    "東葉高速鉄道2000系": "../images/列车/東葉高速鉄道/2000系.png",
    "相模鉄道13000系": "../images/列车/相模鉄道/13000系.png",
    "西武鉄道10000系": "../images/列车/西武鉄道/10000系.png",
    "西武鉄道2000系": "../images/列车/西武鉄道/2000系.png",
    "西武鉄道7000系": "../images/列车/西武鉄道/7000系.png",
    "西武鉄道9000系": "../images/列车/西武鉄道/9000系.png",
    "12系客車（ばんえつ物語・別）": "../images/列车/JR東日本/12系客車（ばんえつ物語・別）.png",
    "12系客車（ばんえつ物語）": "../images/列车/JR東日本/12系客車（ばんえつ物語）.png",
    "205系（南武支線）": "../images/列车/JR東日本/205系（南武支線）.png",
    "211系（両毛線）": "../images/列车/JR東日本/211系（両毛線）.png",
    "211系（甲信越）": "../images/列车/JR東日本/211系（甲信越）.png",
    "211系（長野・リニューアル）": "../images/列车/JR東日本/211系（長野・リニューアル）.png",
    "211系（長野・別）": "../images/列车/JR東日本/211系（長野・別）.png",
    "211系（首都圏）": "../images/列车/JR東日本/211系（首都圏）.png",
    "253系（日光・きぬがわ）": "../images/列车/JR東日本/253系（日光・きぬがわ）.png",
    "255系（房総特急）": "../images/列车/JR東日本/255系（房総特急）.png",
    "701系500番台（田沢湖線・別）": "../images/列车/JR東日本/701系500番台（田沢湖線・別）.png",
    "701系500番台（田沢湖線）": "../images/列车/JR東日本/701系500番台（田沢湖線）.png",
    "701系（仙台）": "../images/列车/JR東日本/701系（仙台）.png",
    "701系（奥羽・羽越）": "../images/列车/JR東日本/701系（奥羽・羽越）.png",
    "701系（山形線）": "../images/列车/JR東日本/701系（山形線）.png",
    "C57形（ばんえつ物語）": "../images/列车/JR東日本/C57形（ばんえつ物語）.png",
    "E001系（四季島）": "../images/列车/JR東日本/E001系（四季島）.png",
    "E127系（南武支線）": "../images/列车/JR東日本/E127系（南武支線）.png",
    "E131系（長野）": "../images/列车/JR東日本/E131系（長野）.png",
    "E209系（京葉線）": "../images/列车/JR東日本/E209系（京葉線）.png",
    "E209系（房総）": "../images/列车/JR東日本/E209系（房総）.png",
    "E231系1000番台（別）": "../images/列车/JR東日本/E231系1000番台（別）.png",
    "E231系800番台（東西線直通）": "../images/列车/JR東日本/E231系800番台（東西線直通）.png",
    "E231系総武中央線": "../images/列车/JR東日本/E231系総武中央線.png",
    "E233系0番台（別）": "../images/列车/JR東日本/E233系0番台（別）.png",
    "E233系2000番台（別）": "../images/列车/JR東日本/E233系2000番台（別）.png",
    "E233系5000番台（別）": "../images/列车/JR東日本/E233系5000番台（別）.png",
    "E233系青梅線（別）": "../images/列车/JR東日本/E233系青梅線（別）.png",
    "E233系（房総）": "../images/列车/JR東日本/E233系（房総）.png",
    "E257系2000番台": "../images/列车/JR東日本/E257系2000番台.png",
    "E257系2500番台": "../images/列车/JR東日本/E257系2500番台.png",
    "E261系（サフィール踊り子）": "../images/列车/JR東日本/E261系（サフィール踊り子）.png",
    "E353系（あずさ・かいじ）": "../images/列车/JR東日本/E353系（あずさ・かいじ）.png",
    "E501系（さきがけ・別）": "../images/列车/JR東日本/E501系（さきがけ・別）.png",
    "E501系（さきがけ）": "../images/列车/JR東日本/E501系（さきがけ）.png",
    "E501系（常磐線）": "../images/列车/JR東日本/E501系（常磐線）.png",
    "E531系3000番台": "../images/列车/JR東日本/E531系3000番台.png",
    "E531系（水戸線）": "../images/列车/JR東日本/E531系（水戸線）.png",
    "E531系（赤電）": "../images/列车/JR東日本/E531系（赤電）.png",
    "E653系（いなほ・別2）": "../images/列车/JR東日本/E653系（いなほ・別2）.png",
    "E653系（いなほ・別3）": "../images/列车/JR東日本/E653系（いなほ・別3）.png",
    "E653系（いなほ・別）": "../images/列车/JR東日本/E653系（いなほ・別）.png",
    "E653系（いなほ）": "../images/列车/JR東日本/E653系（いなほ）.png",
    "E653系（水戸地区・別）": "../images/列车/JR東日本/E653系（水戸地区・別）.png",
    "E653系（水戸地区）": "../images/列车/JR東日本/E653系（水戸地区）.png",
    "E655系（なごみ）": "../images/列车/JR東日本/E655系（なごみ）.png",
    "E657系（ルナ・アズール・別）": "../images/列车/JR東日本/E657系（ルナ・アズール・別）.png",
    "E657系（ルナ・アズール）": "../images/列车/JR東日本/E657系（ルナ・アズール）.png",
    "E657系（別2）": "../images/列车/JR東日本/E657系（別2）.png",
    "E657系（別3）": "../images/列车/JR東日本/E657系（別3）.png",
    "E657系（別4）": "../images/列车/JR東日本/E657系（別4）.png",
    "E657系（別5）": "../images/列车/JR東日本/E657系（別5）.png",
    "E657系（別6）": "../images/列车/JR東日本/E657系（別6）.png",
    "E657系（別）": "../images/列车/JR東日本/E657系（別）.png",
    "E721系（仙台・別）": "../images/列车/JR東日本/E721系（仙台・別）.png",
    "EV-E801系（男鹿線）": "../images/列车/JR東日本/EV-E801系（男鹿線）.png",
    "FV-E991系（HYBARI）": "../images/列车/JR東日本/FV-E991系（HYBARI）.png",
    "GV-E400系（米坂線）": "../images/列车/JR東日本/GV-E400系（米坂線）.png",
    "HB-E300系（さとの・別）": "../images/列车/JR東日本/HB-E300系（さとの・別）.png",
    "HB-E300系（さとの）": "../images/列车/JR東日本/HB-E300系（さとの）.png",
    "HB-E300系（ひなび）": "../images/列车/JR東日本/HB-E300系（ひなび）.png",
    "HB-E300系（リゾートしらかみ・橅・別）": "../images/列车/JR東日本/HB-E300系（リゾートしらかみ・橅・別）.png",
    "HB-E300系（リゾートしらかみ・橅）": "../images/列车/JR東日本/HB-E300系（リゾートしらかみ・橅）.png",
    "HB-E300系（海里）": "../images/列车/JR東日本/HB-E300系（海里）.png",
    "キハ110系（おいこっと）": "../images/列车/JR東日本/キハ110系（おいこっと）.png",
    "キハ110系（おもいで号）": "../images/列车/JR東日本/キハ110系（おもいで号）.png",
    "キハ110系（ハイレール1375）": "../images/列车/JR東日本/キハ110系（ハイレール1375）.png",
    "キハ110系（只見線）": "../images/列车/JR東日本/キハ110系（只見線）.png",
    "キハ110系（大船渡線）": "../images/列车/JR東日本/キハ110系（大船渡線）.png",
    "キハ110系（小海線）": "../images/列车/JR東日本/キハ110系（小海線）.png",
    "キハ110系（東北エモーション）": "../images/列车/JR東日本/キハ110系（東北エモーション）.png",
    "キハ110系（甲信越）": "../images/列车/JR東日本/キハ110系（甲信越）.png",
    "キハ110系（盛岡・幌付）": "../images/列车/JR東日本/キハ110系（盛岡・幌付）.png",
    "キハ110系（盛岡）": "../images/列车/JR東日本/キハ110系（盛岡）.png",
    "キハ110系（陸羽東・左沢・別）": "../images/列车/JR東日本/キハ110系（陸羽東・左沢・別）.png",
    "キハ110系（陸羽東・左沢）": "../images/列车/JR東日本/キハ110系（陸羽東・左沢）.png",
    "キハ40系（ふるさと）": "../images/列车/JR東日本/キハ40系（ふるさと）.png",
    "キハ40系（リゾートしらかみ・くまげら・別）": "../images/列车/JR東日本/キハ40系（リゾートしらかみ・くまげら・別）.png",
    "キハ40系（リゾートしらかみ・くまげら）": "../images/列车/JR東日本/キハ40系（リゾートしらかみ・くまげら）.png",
    "キハ40系（烏山線）": "../images/列车/JR東日本/キハ40系（烏山線）.png",
    "キハ40系（越乃シュクラ）": "../images/列车/JR東日本/キハ40系（越乃シュクラ）.png",
    "キハE120系（只見線・別）": "../images/列车/JR東日本/キハE120系（只見線・別）.png",
    "キハE120系（只見線）": "../images/列车/JR東日本/キハE120系（只見線）.png",
    "キハE200系（小海線）": "../images/列车/JR東日本/キハE200系（小海線）.png",
    "7500系": "../images/列车/ゆりかもめ/7500系.png",
    "1000形（1300番台）": "../images/列车/京急電鉄/1000形（1300番台）.png",
    "1000形（1500番台）": "../images/列车/京急電鉄/1000形（1500番台）.png",
    "1000形（1800番台）": "../images/列车/京急電鉄/1000形（1800番台）.png",
    "1000形（別）": "../images/列车/京急電鉄/1000形（別）.png",
    "2100形": "../images/列车/京急電鉄/2100形.png",
    "3000形": "../images/列车/京成電鉄/3000形.png",
    "3000形（LED）": "../images/列车/京成電鉄/3000形（LED）.png",
    "3000形（別）": "../images/列车/京成電鉄/3000形（別）.png",
    "3150形": "../images/列车/京成電鉄/3150形.png",
    "3200形": "../images/列车/京成電鉄/3200形.png",
    "3500形": "../images/列车/京成電鉄/3500形.png",
    "3700形（LED）": "../images/列车/京成電鉄/3700形（LED）.png",
    "8800形": "../images/列车/京成電鉄/8800形.png",
    "8900形": "../images/列车/京成電鉄/8900形.png",
    "8000系": "../images/列车/京王電鉄/8000系.png",
    "9100形": "../images/列车/北総鉄道/9100形.png",
    "3600形": "../images/列车/千葉ニュータウン鉄道/3600形.png",
    "埼玉新都市交通2000形": "../images/列车/埼玉新都市交通/2000形.png",
    "2020系（2021編成）": "../images/列车/埼玉新都市交通/2020系（2021編成）.png",
    "2020系（2022編成）": "../images/列车/埼玉新都市交通/2020系（2022編成）.png",
    "2020系（2023編成）": "../images/列车/埼玉新都市交通/2020系（2023編成）.png",
    "2020系（2024編成）": "../images/列车/埼玉新都市交通/2020系（2024編成）.png",
    "2020系（2025編成）": "../images/列车/埼玉新都市交通/2020系（2025編成）.png",
    "2020系（2026編成・別）": "../images/列车/埼玉新都市交通/2020系（2026編成・別）.png",
    "2020系（2026編成）": "../images/列车/埼玉新都市交通/2020系（2026編成）.png",
    "埼玉高速鉄道2000形": "../images/列车/埼玉高速鉄道/2000形.png",
    "1000系（別2）": "../images/列车/多摩都市モノレール/1000系（別2）.png",
    "1000系（別3）": "../images/列车/多摩都市モノレール/1000系（別3）.png",
    "1000系（別）": "../images/列车/多摩都市モノレール/1000系（別）.png",
    "小田急電鉄2000形": "../images/列车/小田急電鉄/2000形.png",
    "30000形（別）": "../images/列车/小田急電鉄/30000形（別）.png",
    "80000形": "../images/列车/小田急電鉄/80000形.png",
    "8000系": "../images/列车/小田急電鉄/8000系.png",
    "8000系（別）": "../images/列车/小田急電鉄/8000系（別）.png",
    "02系": "../images/列车/東京メトロ/02系.png",
    "05系（リニューアル）": "../images/列车/東京メトロ/05系（リニューアル）.png",
    "05系（別）": "../images/列车/東京メトロ/05系（別）.png",
    "07系": "../images/列车/東京メトロ/07系.png",
    "08系": "../images/列车/東京メトロ/08系.png",
    "10000系（8両）": "../images/列车/東京メトロ/10000系（8両）.png",
    "16000系（別）": "../images/列车/東京メトロ/16000系（別）.png",
    "16000系（北綾瀬）": "../images/列车/東京メトロ/16000系（北綾瀬）.png",
    "8000系": "../images/列车/東京メトロ/8000系.png",
    "9000系（別）": "../images/列车/東京メトロ/9000系（別）.png",
    "1000形（別2）": "../images/列车/東京モノレール/1000形（別2）.png",
    "1000形（別3）": "../images/列车/東京モノレール/1000形（別3）.png",
    "1000形（別4）": "../images/列车/東京モノレール/1000形（別4）.png",
    "1000形（別）": "../images/列车/東京モノレール/1000形（別）.png",
    "東京モノレール2000形": "../images/列车/東京モノレール/2000形.png",
    "70-000形": "../images/列车/東京臨海高速鉄道/70-000形.png",
    "1000系（いけたまハッピートレイン）": "../images/列车/東急電鉄/1000系（いけたまハッピートレイン）.png",
    "1000系（別2）": "../images/列车/東急電鉄/1000系（別2）.png",
    "1000系（別3）": "../images/列车/東急電鉄/1000系（別3）.png",
    "1000系（別4）": "../images/列车/東急電鉄/1000系（別4）.png",
    "1000系（別）": "../images/列车/東急電鉄/1000系（別）.png",
    "3000系（リニューアル）": "../images/列车/東急電鉄/3000系（リニューアル）.png",
    "300系（301編成）": "../images/列车/東急電鉄/300系（301編成）.png",
    "300系（302編成）": "../images/列车/東急電鉄/300系（302編成）.png",
    "300系（303編成）": "../images/列车/東急電鉄/300系（303編成）.png",
    "300系（304編成）": "../images/列车/東急電鉄/300系（304編成）.png",
    "300系（305編成・別）": "../images/列车/東急電鉄/300系（305編成・別）.png",
    "300系（305編成）": "../images/列车/東急電鉄/300系（305編成）.png",
    "300系（306編成）": "../images/列车/東急電鉄/300系（306編成）.png",
    "300系（307編成）": "../images/列车/東急電鉄/300系（307編成）.png",
    "300系（308編成・別）": "../images/列车/東急電鉄/300系（308編成・別）.png",
    "300系（308編成）": "../images/列车/東急電鉄/300系（308編成）.png",
    "300系（309編成）": "../images/列车/東急電鉄/300系（309編成）.png",
    "300系（310編成）": "../images/列车/東急電鉄/300系（310編成）.png",
    "5000系（リニューアル）": "../images/列车/東急電鉄/5000系（リニューアル）.png",
    "5000系（別）": "../images/列车/東急電鉄/5000系（別）.png",
    "Y000系（別2）": "../images/列车/東急電鉄/Y000系（別2）.png",
    "Y000系（別）": "../images/列车/東急電鉄/Y000系（別）.png",
    "10000系": "../images/列车/東武鉄道/10000系.png",
    "10000系（別2）": "../images/列车/東武鉄道/10000系（別2）.png",
    "10000系（別3）": "../images/列车/東武鉄道/10000系（別3）.png",
    "10000系（別）": "../images/列车/東武鉄道/10000系（別）.png",
    "10030系（別）": "../images/列车/東武鉄道/10030系（別）.png",
    "10030系（近鉄色）": "../images/列车/東武鉄道/10030系（近鉄色）.png",
    "10050系": "../images/列车/東武鉄道/10050系.png",
    "10050系（別）": "../images/列车/東武鉄道/10050系（別）.png",
    "100系（DRCカラー）": "../images/列车/東武鉄道/100系（DRCカラー）.png",
    "100系（リニューアル）": "../images/列车/東武鉄道/100系（リニューアル）.png",
    "100系（別）": "../images/列车/東武鉄道/100系（別）.png",
    "12系客車（SL大樹）": "../images/列车/東武鉄道/12系客車（SL大樹）.png",
    "14系客車（SL大樹）": "../images/列车/東武鉄道/14系客車（SL大樹）.png",
    "20000系": "../images/列车/東武鉄道/20000系.png",
    "200系（りょうもうラッピング）": "../images/列车/東武鉄道/200系（りょうもうラッピング）.png",
    "200系（りょうもう）": "../images/列车/東武鉄道/200系（りょうもう）.png",
    "200系（別）": "../images/列车/東武鉄道/200系（別）.png",
    "20400系（ベリーハッピー）": "../images/列车/東武鉄道/20400系（ベリーハッピー）.png",
    "30000系": "../images/列车/東武鉄道/30000系.png",
    "30000系（別2）": "../images/列车/東武鉄道/30000系（別2）.png",
    "30000系（別）": "../images/列车/東武鉄道/30000系（別）.png",
    "50000系（別2）": "../images/列车/東武鉄道/50000系（別2）.png",
    "50000系（別）": "../images/列车/東武鉄道/50000系（別）.png",
    "50070系": "../images/列车/東武鉄道/50070系.png",
    "500系（リバティ）": "../images/列车/東武鉄道/500系（リバティ）.png",
    "6050系": "../images/列车/東武鉄道/6050系.png",
    "634系（スカイツリートレイン）": "../images/列车/東武鉄道/634系（スカイツリートレイン）.png",
    "70000系": "../images/列车/東武鉄道/70000系.png",
    "70090系": "../images/列车/東武鉄道/70090系.png",
    "8000系（亀戸線）": "../images/列车/東武鉄道/8000系（亀戸線）.png",
    "90000系": "../images/列车/東武鉄道/90000系.png",
    "9000系": "../images/列车/東武鉄道/9000系.png",
    "9000系（別）": "../images/列车/東武鉄道/9000系（別）.png",
    "9050系": "../images/列车/東武鉄道/9050系.png",
    "C11形（SL大樹ふたら）": "../images/列车/東武鉄道/C11形（SL大樹ふたら）.png",
    "C11形（SL大樹）": "../images/列车/東武鉄道/C11形（SL大樹）.png",
    "DE10形（ブルーサンダー）": "../images/列车/東武鉄道/DE10形（ブルーサンダー）.png",
    "N100系": "../images/列车/東武鉄道/N100系.png",
    "2000系": "../images/列车/東葉高速鉄道/2000系.png",
    "11000系（おかいもの）": "../images/列车/相模鉄道/11000系（おかいもの）.png",
    "11000系（ほほえみ）": "../images/列车/相模鉄道/11000系（ほほえみ）.png",
    "001系（ラビュー）": "../images/列车/西武鉄道/001系（ラビュー）.png",
    "10000系（別）": "../images/列车/西武鉄道/10000系（別）.png",
    "10000系（観光特急）": "../images/列车/西武鉄道/10000系（観光特急）.png",
    "20000系": "../images/列车/西武鉄道/20000系.png",
    "2000系": "../images/列车/西武鉄道/2000系.png",
    "2000系（2色塗り）": "../images/列车/西武鉄道/2000系（2色塗り）.png",
    "2000系（武蔵野鉄道色）": "../images/列车/西武鉄道/2000系（武蔵野鉄道色）.png",
    "40000系（トキイロ）": "../images/列车/西武鉄道/40000系（トキイロ）.png",
    "40000系（別）": "../images/列车/西武鉄道/40000系（別）.png",
    "4000系（別）": "../images/列车/西武鉄道/4000系（別）.png",
    "40050系（ラッピング）": "../images/列车/西武鉄道/40050系（ラッピング）.png",
    "40050系（別）": "../images/列车/西武鉄道/40050系（別）.png",
    "6000系": "../images/列车/西武鉄道/6000系.png",
    "6000系（別）": "../images/列车/西武鉄道/6000系（別）.png",
    "7000系": "../images/列车/西武鉄道/7000系.png",
    "L00系": "../images/列车/西武鉄道/L00系.png",
    "L00系（別）": "../images/列车/西武鉄道/L00系（別）.png",
    "10-490形": "../images/列车/都営地下鉄/10-490形.png",
    "10-520形": "../images/列车/都営地下鉄/10-520形.png",
    "12-690形": "../images/列车/都営地下鉄/12-690形.png",
    "12-700形": "../images/列车/都営地下鉄/12-700形.png",
    "320形": "../images/列车/都営地下鉄/320形.png",
    "6500形": "../images/列车/都営地下鉄/6500形.png",
    "7000形": "../images/列车/都営地下鉄/7000形.png",
    "7500形": "../images/列车/都営地下鉄/7500形.png",
    "7700形": "../images/列车/都営地下鉄/7700形.png",
    "8500形（別）": "../images/列车/都営地下鉄/8500形（別）.png",
    "8800形": "../images/列车/都営地下鉄/8800形.png",
    "8800形（別2）": "../images/列车/都営地下鉄/8800形（別2）.png",
    "8800形（別3）": "../images/列车/都営地下鉄/8800形（別3）.png",
    "8800形（別）": "../images/列车/都営地下鉄/8800形（別）.png",
    "8900形": "../images/列车/都営地下鉄/8900形.png",
    "8900形（別2）": "../images/列车/都営地下鉄/8900形（別2）.png",
    "8900形（別3）": "../images/列车/都営地下鉄/8900形（別3）.png",
    "8900形（別）": "../images/列车/都営地下鉄/8900形（別）.png",
    "花100形": "../images/列车/都営地下鉄/花100形.png",
    "TX-1000系": "../images/列车/首都圏新都市鉄道/TX-1000系.png",
    "TX-1000系（別）": "../images/列车/首都圏新都市鉄道/TX-1000系（別）.png",
    "TX-2000系": "../images/列车/首都圏新都市鉄道/TX-2000系.png",
    "TX-2000系（別2）": "../images/列车/首都圏新都市鉄道/TX-2000系（別2）.png",
    "TX-2000系（別3）": "../images/列车/首都圏新都市鉄道/TX-2000系（別3）.png",
    "TX-2000系（別）": "../images/列车/首都圏新都市鉄道/TX-2000系（別）.png",
  };
  // v4.3.975: 反推遍历改为通用递归收集——扫描所有含 icon 字段的表（LINE_ICONS/OPERATOR_ICONS/
  // VEHICLE_DEPLOYMENTS/THROUGH_PREFIX_RULES/TRAIN_TYPE_ICON_RULES/EXTRA_VEHICLE_ICONS），
  // 嵌套对象/数组里的图标路径也全部入表，不再遗漏规则表资产
  (function buildVehicleNameIndex() {
    var seen = {};
    function add(path) {
      if (!path || seen[path]) return;
      seen[path] = true;
      var name = String(path).split('/').pop().replace(/\.png$/i, '');
      if (name && !VEHICLE_NAME_TO_ICON[name]) VEHICLE_NAME_TO_ICON[name] = path;
    }
    function collectIcon(obj) {
      if (typeof obj === 'string') {
        if (/\.png$/i.test(obj) && obj.indexOf('images/列车') >= 0) add(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach(collectIcon);
      } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(function(k){
          if (k === 'icon') add(obj[k]); else collectIcon(obj[k]);
        });
      }
    }
    collectIcon(LINE_ICONS);
    collectIcon(OPERATOR_ICONS);
    collectIcon(VEHICLE_DEPLOYMENTS);
    if (typeof THROUGH_PREFIX_RULES !== 'undefined') collectIcon(THROUGH_PREFIX_RULES);
    if (typeof TRAIN_TYPE_ICON_RULES !== 'undefined') collectIcon(TRAIN_TYPE_ICON_RULES);
    // v4.3.973/975: 额外变体资产与自动补全的未引用图标资产
    // v4.3.976: EXTRA 条目 key 优先直录（公司前缀 key 解同名抢占；文件 base 名兜底入表）
    Object.keys(EXTRA_VEHICLE_ICONS).forEach(function(k){
      var _p = EXTRA_VEHICLE_ICONS[k];
      add(_p);
      var _base = String(_p).split('/').pop().replace(/\.png$/i, '');
      if (k !== _base && !VEHICLE_NAME_TO_ICON[k]) VEHICLE_NAME_TO_ICON[k] = _p;
    });
  })();

  // v4.3.940: 给车型候选字符串（"A / B / C"），返回第一个有图标的完整路径；都没图返回 null
  // v4.3.964: 车型名别名表——manual vehicleType 名与图标文件名不一致时的映射层
  // 覆盖：operator 前缀（東京メトロ05系→05系）、variant 括注（7000系（候補）→7000系）、
  //       系列变体（E231系→E231系0番台）、跨名（3050形→3050形（LED））
  // v4.3.977: 线路感知同名解抢表——同名车型被别社图标库抢占时的线路专属指向
  // （例：NewShuttle 伊奈線的 2000系/2020系 会被東京メトロ/東急同名 key 抢占，需按线路指向埼玉资产）
  // v4.3.1006: 保有数比例加权表——候选串无法精确识别时的确定性随机映射权重
// 数据来源：都営交通局官网（令和7年4月1日現在 在籍33両：7700形8/8500形5/8800形10/8900形8/9000形2）
var VEHICLE_FLEET_WEIGHTS = {
  "7700形 / 8500形 / 8800形 / 8900形 / 9000形": [8,5,10,8,2],
  // v4.3.1026: 東京臨海高速鉄道（raillab 東臨運輸区編成表 2026-09 快照）：
  // 运用中 70-000形 编成 1/2/3/7（4编成）、71-000形 编成 Z11~Z14（4编成）= 4:4
  // E233系7000番台 = 埼京線直通（operator=JR-East 已单独锁定，此低权重仅兜底未知场景）
  "E233系7000番台 / 71-000形 / 70-000形": [1,4,4]
};
// v4.3.1025: FLEET_ICON_POOLS 编成/涂装池——同车型多涂装/多编成图，按候选串稳定取图（跨线不变）
var FLEET_ICON_POOLS = {
  "E209系": ["../images/列车/JR東日本/e209bbb.png", "../images/列车/JR東日本/e209c.png", "../images/列车/JR東日本/e209hk.png", "../images/列车/JR東日本/e209jg.png", "../images/列车/JR東日本/e209jg2.png", "../images/列车/JR東日本/e209jg3.png", "../images/列车/JR東日本/e209jg4.png", "../images/列车/JR東日本/e209jy.png", "../images/列车/JR東日本/e209jy1.png", "../images/列车/JR東日本/e209kt.png", "../images/列车/JR東日本/e209kt0.png", "../images/列车/JR東日本/e209kt2.png", "../images/列车/JR東日本/e209kt3.png", "../images/列车/JR東日本/e209kt_ad.png", "../images/列车/JR東日本/e209ky.png", "../images/列车/JR東日本/e209ky1.png", "../images/列车/JR東日本/e209mu.png", "../images/列车/JR東日本/e209na.png", "../images/列车/JR東日本/e209na2.png", "../images/列车/JR東日本/e209na3.png", "../images/列车/JR東日本/e209or1.png", "../images/列车/JR東日本/e209so.png", "../images/列车/JR東日本/e209so1.png", "../images/列车/JR東日本/e209sta.png", "../images/列车/JR東日本/e209_kt.png", "../images/列车/JR東日本/e209_kt2.png"],
  "313系": ["../images/列车/JR東海/c313.png", "../images/列车/JR東海/c313bb.png", "../images/列车/JR東海/c313ce.png", "../images/列车/JR東海/c313h.png", "../images/列车/JR東海/c313hp.png", "../images/列车/JR東海/c313p.png"],
  "315系": ["../images/列车/JR東海/c315.png", "../images/列车/JR東海/c315k.png"],
  "383系": ["../images/列车/JR東海/c383.png", "../images/列车/JR東海/c383k.png", "../images/列车/JR東海/c383k_.png"],
  "7000系": ["../images/列车/東急電鉄/7000系.png", "../images/列车/ゆりかもめ/yrkm7000-1.png", "../images/列车/ゆりかもめ/yrkm7000-2.png", "../images/列车/ゆりかもめ/yrkm7000-3.png", "../images/列车/ゆりかもめ/yrkm7000-4.png"],
  "埼玉新都市交通1000系": ["../images/列车/埼玉新都市交通/nstl1054.png", "../images/列车/埼玉新都市交通/nstl1000gr.png", "../images/列车/埼玉新都市交通/nstl1000re.png", "../images/列车/埼玉新都市交通/nstl1051gr.png", "../images/列车/埼玉新都市交通/nstl1051re.png", "../images/列车/埼玉新都市交通/nstl1051rw1.png", "../images/列车/埼玉新都市交通/nstl1051wb1.png", "../images/列车/埼玉新都市交通/nstl1052nm.png", "../images/列车/埼玉新都市交通/nstl1053g.png", "../images/列车/埼玉新都市交通/nstl1053g1.png", "../images/列车/埼玉新都市交通/nstl1053ng.png", "../images/列车/埼玉新都市交通/nstl1054_1.png"],
  "埼玉新都市交通2000系": ["../images/列车/埼玉新都市交通/nstl2000.png", "../images/列车/埼玉新都市交通/nstl2002.png", "../images/列车/埼玉新都市交通/nstl2003.png", "../images/列车/埼玉新都市交通/nstl2004.png", "../images/列车/埼玉新都市交通/nstl2005.png", "../images/列车/埼玉新都市交通/nstl2006.png", "../images/列车/埼玉新都市交通/nstl2007.png"],
  "埼玉新都市交通2020系": ["../images/列车/埼玉新都市交通/nstl2026.png", "../images/列车/埼玉新都市交通/nstl2025.png", "../images/列车/埼玉新都市交通/nstl2024.png", "../images/列车/埼玉新都市交通/nstl2023.png", "../images/列车/埼玉新都市交通/nstl2022.png", "../images/列车/埼玉新都市交通/nstl2021.png", "../images/列车/埼玉新都市交通/nstl2026b.png"],
  "1000系": ["../images/列车/多摩モノレール/mn-tma1000.png", "../images/列车/多摩モノレール/mn-tma1000w.png", "../images/列车/多摩モノレール/mn-tma1016.png"],
  "都電6000形": ["../images/列车/東京さくらトラム/todn6000.png", "../images/列车/東京さくらトラム/todn6000y.png"],
  "都電7000形": ["../images/列车/東京さくらトラム/todn7000.png", "../images/列车/東京さくらトラム/todn7000n.png", "../images/列车/東京さくらトラム/todn7000y.png", "../images/列车/東京さくらトラム/todn7000yn.png", "../images/列车/東京さくらトラム/todn7001.png", "../images/列车/東京さくらトラム/todn7003.png", "../images/列车/東京さくらトラム/todn7007.png"],
  "都電7500形": ["../images/列车/東京さくらトラム/todn7500.png", "../images/列车/東京さくらトラム/todn7500y.png", "../images/列车/東京さくらトラム/todn7501.png"],
  "都電7700形": ["../images/列车/東京さくらトラム/todn7700.png", "../images/列车/東京さくらトラム/todn7701.png", "../images/列车/東京さくらトラム/todn7702.png"],
  "都電8500形": ["../images/列车/東京さくらトラム/todn8500.png", "../images/列车/東京さくらトラム/todn8500y.png"],
  "都電8800形": ["../images/列车/東京さくらトラム/todn8800.png", "../images/列车/東京さくらトラム/todn8801.png", "../images/列车/東京さくらトラム/todn8802.png", "../images/列车/東京さくらトラム/todn8803.png"],
  "都電8900形": ["../images/列车/東京さくらトラム/todn8900.png", "../images/列车/東京さくらトラム/todn8901.png", "../images/列车/東京さくらトラム/todn8902.png", "../images/列车/東京さくらトラム/todn8903.png"],
  "都電9000形": ["../images/列车/東京さくらトラム/todn9000.png", "../images/列车/東京さくらトラム/todn9002.png"],
  "東京モノレール1000形": ["../images/列车/東京モノレール/1000形（別）.png", "../images/列车/東京モノレール/mn-tky1000b.png", "../images/列车/東京モノレール/mn-tky1000o.png", "../images/列车/東京モノレール/mn-tky1000r.png", "../images/列车/東京モノレール/mn-tky1003.png", "../images/列车/東京モノレール/mn-tky1004.png"],
  "東京モノレール10000形": ["../images/列车/東京モノレール/mn-tky10000.png", "../images/列车/東京モノレール/mn-tky10000o.png"],
  "東京モノレール100形": ["../images/列车/東京モノレール/mn-tky100.png", "../images/列车/東京モノレール/mn-tky100r.png"],
  "東京モノレール2000形": ["../images/列车/東京モノレール/mn-tky2000.png", "../images/列车/東京モノレール/mn-tky2001.png"],
  "東京モノレール330形": ["../images/列车/東京モノレール/mn-tky33.png"],
  "70-000形": ["../images/列车/東京臨海高速鉄道/twr70000.png", "../images/列车/東京臨海高速鉄道/twr70001.png", "../images/列车/東京臨海高速鉄道/twr70002.png"],
  "東急電鉄1000系": ["../images/列车/東急電鉄/1000系（別）.png", "../images/列车/東急電鉄/1000系（別2）.png", "../images/列车/東急電鉄/1000系（別3）.png"],
  "東武9000系": ["../images/列车/東武鉄道/tob9000.png", "../images/列车/東武鉄道/9000系（別）.png"],
  "東武10000系": ["../images/列车/東武鉄道/tob10000.png", "../images/列车/東武鉄道/tob10000p.png", "../images/列车/東武鉄道/tob10001.png"],
  "東武10030系": ["../images/列车/東武鉄道/10030系（別）.png", "../images/列车/東武鉄道/tob10030b.png", "../images/列车/東武鉄道/tob10030kin.png", "../images/列车/東武鉄道/tob10030kinp.png", "../images/列车/東武鉄道/tob10031b.png", "../images/列车/東武鉄道/tob10032b.png", "../images/列车/東武鉄道/tob10033b.png"],
  "東武10050系": ["../images/列车/東武鉄道/tob10050.png", "../images/列车/東武鉄道/tob10050p.png", "../images/列车/東武鉄道/tob10051.png", "../images/列车/東武鉄道/tob10051p.png", "../images/列车/東武鉄道/tob10052.png"],
  "東武100系": ["../images/列车/東武鉄道/tob100.png", "../images/列车/東武鉄道/tob100drc.png", "../images/列车/東武鉄道/tob100g.png", "../images/列车/東武鉄道/tob100m.png", "../images/列车/東武鉄道/tob100o.png", "../images/列车/東武鉄道/tob100re.png", "../images/列车/東武鉄道/tob100v.png"],
  "東武20000系": ["../images/列车/東武鉄道/tob20000.png", "../images/列车/東武鉄道/tob20000b.png"],
  "東武200系": ["../images/列车/東武鉄道/tob200.png", "../images/列车/東武鉄道/tob200b.png", "../images/列车/東武鉄道/tob200bw.png", "../images/列车/東武鉄道/tob200r.png"],
  "東武30000系": ["../images/列车/東武鉄道/tob30000.png", "../images/列车/東武鉄道/tob30000f.png", "../images/列车/東武鉄道/tob30001.png"],
  "東武50000系": ["../images/列车/東武鉄道/tob50000.png", "../images/列车/東武鉄道/tob50000ll.png", "../images/列车/東武鉄道/tob50002.png"],
  "東武50050系": ["../images/列车/東武鉄道/50000系.png", "../images/列车/東武鉄道/tob50051.png", "../images/列车/東武鉄道/tob50052.png", "../images/列车/東武鉄道/tob50053.png", "../images/列车/東武鉄道/tob50054.png", "../images/列车/東武鉄道/tob50055.png", "../images/列车/東武鉄道/tob50056.png"],
  "東武50070系": ["../images/列车/東武鉄道/50070系.png", "../images/列车/東武鉄道/tob50070.png"],
  "東武50090系": ["../images/列车/東武鉄道/50090系.png", "../images/列车/東武鉄道/tob50090.png", "../images/列车/東武鉄道/tob50090kwr.png", "../images/列车/東武鉄道/tob50090kwv.png", "../images/列车/東武鉄道/tob50091.png"],
  "東武60000系": ["../images/列车/東武鉄道/tob60000.png", "../images/列车/東武鉄道/tob60000f.png", "../images/列车/東武鉄道/tob60001.png"],
  "東武70090系": ["../images/列车/東武鉄道/70090系.png", "../images/列车/東武鉄道/tob70090.png"],
  "東武8000系": ["../images/列车/東武鉄道/tob8000.png", "../images/列车/東武鉄道/tob8000-1.png", "../images/列车/東武鉄道/tob8000-1o.png", "../images/列车/東武鉄道/tob8000-2.png", "../images/列车/東武鉄道/tob8000c.png", "../images/列车/東武鉄道/tob8000o.png", "../images/列车/東武鉄道/tob8000up.png"],
  "東武80000系": ["../images/列车/東武鉄道/80000系.png", "../images/列车/東武鉄道/tob80000.png"],
  "東武90000系": ["../images/列车/東武鉄道/tob90000.png"],
  "横浜市交通局10000形": ["../images/列车/横浜市交通局/yok10000.png", "../images/列车/横浜市交通局/yok10001.png", "../images/列车/横浜市交通局/yok10002.png"],
  "横浜市交通局1000形": ["../images/列车/横浜市交通局/yok1000.png", "../images/列车/横浜市交通局/yok1000h.png", "../images/列车/横浜市交通局/yok1000jg.png"],
  "横浜市交通局2000形": ["../images/列车/横浜市交通局/yok2000.png", "../images/列车/横浜市交通局/yok2000h.png"],
  "横浜市交通局3000形": ["../images/列车/横浜市交通局/yok3000h.png", "../images/列车/横浜市交通局/yok3000n.png", "../images/列车/横浜市交通局/yok3000n2.png", "../images/列车/横浜市交通局/yok3000s.png", "../images/列车/横浜市交通局/yok3000v.png", "../images/列车/横浜市交通局/yok3001n2.png", "../images/列车/横浜市交通局/yok3001s2.png"],
  "相模鉄道10000系": ["../images/列车/相模鉄道/sote10000.png", "../images/列车/相模鉄道/sote10000b.png", "../images/列车/相模鉄道/sote10000n.png", "../images/列车/相模鉄道/sote10002.png"],
  "相模鉄道11000系": ["../images/列车/相模鉄道/sote11000.png", "../images/列车/相模鉄道/sote11000b.png"],
  "相模鉄道8000系": ["../images/列车/相模鉄道/8000系.png", "../images/列车/相模鉄道/sote8000b.png", "../images/列车/相模鉄道/sote8000n.png", "../images/列车/相模鉄道/sote8001.png", "../images/列车/相模鉄道/sote8002.png", "../images/列车/相模鉄道/sote8003.png", "../images/列车/相模鉄道/sote8005.png", "../images/列车/相模鉄道/sote8006.png", "../images/列车/相模鉄道/sote8006f.png"],
  "相模鉄道9000系": ["../images/列车/相模鉄道/9000系.png", "../images/列车/相模鉄道/sote9002l.png", "../images/列车/相模鉄道/sote9007.png"],
  "西武10000系": ["../images/列车/西武鉄道/seb10000.png", "../images/列车/西武鉄道/10000系（別）.png", "../images/列车/西武鉄道/seb10000b.png", "../images/列车/西武鉄道/seb10000r.png", "../images/列车/西武鉄道/seb10001.png", "../images/列车/西武鉄道/seb10002.png"],
  "西武101系": ["../images/列车/西武鉄道/seb101.png", "../images/列车/西武鉄道/seb101b.png", "../images/列车/西武鉄道/seb101n.png", "../images/列车/西武鉄道/seb101nbj.png", "../images/列车/西武鉄道/seb101no.png", "../images/列车/西武鉄道/seb101nr.png", "../images/列车/西武鉄道/seb101p.png", "../images/列车/西武鉄道/seb101pmo.png", "../images/列车/西武鉄道/seb101psk.png", "../images/列车/西武鉄道/seb101psk1.png", "../images/列车/西武鉄道/seb101sk.png", "../images/列车/西武鉄道/seb101tg1.png", "../images/列车/西武鉄道/seb101tg2.png", "../images/列车/西武鉄道/seb101tg3.png", "../images/列车/西武鉄道/seb101tg4.png", "../images/列车/西武鉄道/seb101w.png"],
  "西武20000系": ["../images/列车/西武鉄道/seb20000.png", "../images/列车/西武鉄道/seb20000n.png", "../images/列车/西武鉄道/seb20001.png", "../images/列车/西武鉄道/seb20002.png"],
  "西武2000系": ["../images/列车/西武鉄道/seb2000.png", "../images/列车/西武鉄道/seb2000l.png", "../images/列车/西武鉄道/seb2000o.png", "../images/列车/西武鉄道/seb2000of.png", "../images/列车/西武鉄道/seb2000p.png", "../images/列车/西武鉄道/seb2000yb.png"],
  "西武30000系": ["../images/列车/西武鉄道/seb30000.png", "../images/列车/西武鉄道/seb30000dr.png", "../images/列车/西武鉄道/seb30000ko.png", "../images/列车/西武鉄道/seb30001.png", "../images/列车/西武鉄道/seb30002.png", "../images/列车/西武鉄道/seb30003.png"],
  "西武40000系": ["../images/列车/西武鉄道/40000系.png", "../images/列车/西武鉄道/seb40000.png", "../images/列车/西武鉄道/seb40000tko.png", "../images/列车/西武鉄道/seb40000tkr.png"],
  "西武4000系": ["../images/列车/西武鉄道/seb4000.png", "../images/列车/西武鉄道/seb4000r.png"],
  "西武6000系": ["../images/列车/西武鉄道/seb6000.png", "../images/列车/西武鉄道/seb6000ll.png", "../images/列车/西武鉄道/seb6000nll.png", "../images/列车/西武鉄道/seb6000yw.png"],
  "西武9000系": ["../images/列车/西武鉄道/seb9000.png", "../images/列车/西武鉄道/seb9000r.png"],
  "都営10-000形": ["../images/列车/都営地下鉄/toky10000.png", "../images/列车/都営地下鉄/toky10000n.png", "../images/列车/都営地下鉄/toky10000p.png", "../images/列车/都営地下鉄/toky10001.png", "../images/列车/都営地下鉄/toky10001p.png", "../images/列车/都営地下鉄/toky10002.png", "../images/列车/都営地下鉄/toky10002p.png", "../images/列车/都営地下鉄/toky10003p.png"],
  "都営10-490形": ["../images/列车/都営地下鉄/toky10490.png", "../images/列车/都営地下鉄/toky10490l.png"],
  "都営10-520形": ["../images/列车/都営地下鉄/toky10520.png", "../images/列车/都営地下鉄/toky10520l.png"],
  "都営12-000形": ["../images/列车/都営地下鉄/toky12000.png", "../images/列车/都営地下鉄/toky12000o.png", "../images/列车/都営地下鉄/toky12000o1.png", "../images/列车/都営地下鉄/toky12001.png", "../images/列车/都営地下鉄/toky12002.png"],
  "都営12-600形": ["../images/列车/都営地下鉄/toky12600.png", "../images/列车/都営地下鉄/toky12601.png"],
  "都営5000形": ["../images/列车/都営地下鉄/toky5000.png", "../images/列车/都営地下鉄/toky5000o.png"],
  "都営5200形": ["../images/列车/都営地下鉄/toky5200.png", "../images/列车/都営地下鉄/toky5201.png", "../images/列车/都営地下鉄/toky5202.png"],
  "都営5300形": ["../images/列车/都営地下鉄/toky5300.png", "../images/列车/都営地下鉄/toky5300a.png", "../images/列车/都営地下鉄/toky5301.png"],
  "都営6000形": ["../images/列车/都営地下鉄/toky6000.png", "../images/列车/都営地下鉄/toky6000o.png", "../images/列车/都営地下鉄/toky6000r.png", "../images/列车/都営地下鉄/toky6001.png", "../images/列车/都営地下鉄/toky6002.png"],
  "都営6300形": ["../images/列车/都営地下鉄/toky6300.png", "../images/列车/都営地下鉄/toky6300a.png", "../images/列车/都営地下鉄/toky6300b.png"],
  "TX-1000系": ["../images/列车/首都圏新都市鉄道/tx1000.png", "../images/列车/首都圏新都市鉄道/tx1000f.png"],
  "TX-2000系": ["../images/列车/首都圏新都市鉄道/tx2000.png", "../images/列车/首都圏新都市鉄道/tx2000rf.png", "../images/列车/首都圏新都市鉄道/tx2001.png", "../images/列车/首都圏新都市鉄道/tx2005.png"],
  "373系": ["../images/列车/JR東海/c373.png"],
  "都電4000形": ["../images/列车/東京さくらトラム/todn4000.png"],
  "都電5500形": ["../images/列车/東京さくらトラム/todn5500.png"],
  "都電8000形": ["../images/列车/東京さくらトラム/todn8000.png"],
  "東京モノレール500形": ["../images/列车/東京モノレール/mn-tky500.png"],
  "東京モノレール700形": ["../images/列车/東京モノレール/mn-tky700.png"],
  "横浜市交通局4000形": ["../images/列车/横浜市交通局/yok4000.png"],
  "都営10-250形": ["../images/列车/都営地下鉄/toky10250.png"],
  "都営10-300形": ["../images/列车/都営地下鉄/toky10300.png"],
  "都営12-690形": ["../images/列车/都営地下鉄/toky12690.png"],
  "都営12-700形": ["../images/列车/都営地下鉄/toky12700.png"],
  "都営300形": ["../images/列车/都営地下鉄/toky300.png"],
  "都営320形": ["../images/列车/都営地下鉄/toky320.png"],
  "都営330形": ["../images/列车/都営地下鉄/toky330.png"],
  "都営5500形": ["../images/列车/都営地下鉄/toky5500.png"],
  "都営6500形": ["../images/列车/都営地下鉄/toky6500.png"]
};

// v4.3.1006: 线路感知裸名重定向——同名裸型号被别社抢占时（都電8800形/8900形 裸键=京成），
// 图标解析重定向到本线所属公司图标（显示名保持裸名"8800形"，杜绝"名=都電、图=京成"错配）
var LINE_ICON_NAME_REDIRECT = {
  "Arakawa": { "8800形": "都営8800形", "8900形": "都営8900形" }
};

var LINE_VEHICLE_OVERRIDES = {
  "Arakawa": {
    "4000形": "都電4000形",
    "5500形": "都電5500形",
    "6000形": "都電6000形",
    "7000形": "都電7000形",
    "7500形": "都電7500形",
    "7700形": "都電7700形",
    "8000形": "都電8000形",
    "8500形": "都電8500形",
    "8800形": "都電8800形",
    "8900形": "都電8900形",
    "9000形": "都電9000形"
  },
  "Asakusa": {
    "5300形": "都営5300形",
    "5500形": "都営5500形"
  },
  "Mita": {
    "6300形": "都営6300形",
    "6500形": "都営6500形"
  },
  "Oedo": {
    "12-000形": "都営12-000形",
    "12-600形": "都営12-600形"
  },
  "Shinjuku": {
    "10-300形": "都営10-300形"
  },
  "NewShuttle": {
    "2000系": "埼玉新都市交通2000系",
    "2020系": "埼玉新都市交通2020系"
  },
  "TokyoMonorail": {
    "100形": "東京モノレール100形",
    "330形": "東京モノレール330形",
    "500形": "東京モノレール500形",
    "700形": "東京モノレール700形",
    "1000形": "東京モノレール1000形",
    "2000形": "東京モノレール2000形",
    "10000形": "東京モノレール10000形"
  }
};

  var VEHICLE_NAME_ALIASES = {
    "1500形": "1000形（1300番台）",
    "新1000形": "1000形（1300番台）",
    "新1000形（4両編成）": "1000形（1300番台）",
    "新1000形1890番台（Le Ciel）": "1000形（1800番台）",
    "1000形": "1000形（1300番台）",
    "3050形": "3150形",
    "3400形": "3150形",
    "3100形": "3150形",
    "3700形": "3700形（LED）",
    "3700形（特急）": "3700形（LED）",
    "3700形（快速特急）": "3700形（LED）",
    "9000形": "9000系",
    "AE形（スカイライナー）": "AE形",
    "AE形（ライナー車両）": "AE形",
    "AE100形": "AE形",
    "5300形": "5500形",
    "都営5300形": "5500形",
    "都営5500形": "5500形",
    "都営5500形（通勤特急）": "5500形",
    "都営5500形（浅草線直通）": "5500形",
    "都営6300形": "6300形",
    "都営10-300形": "10-300形",
    "12-600形": "12-690形",
    "小田急4000形": "4000系",
    "小田急1000形": "1000系",
    "小田急60000系(MSE)": "60000系",
    "西武40000系": "40000系",
    "西武6000系": "6000系",
    "40000系（Laview）": "40000系",
    "001系(Laview)": "001系（ラビュー）",
    "40000系（デュアルシート）": "40000系",
    "東武20000系": "東武鉄道20000系",
    "東武30000系": "東武鉄道30000系",
    "東武50070系": "50070系",
    "東武70000系": "70000系",
    "東武70090系(TH-LINER)": "70090系",
    "東武50000系": "50000系",
    "50070系（川越特急）": "50070系",
    "10030系": "10030系（別）",
    "10030型": "10030系（別）",
    "10030型50番台": "10030系（別）",
    "10050型": "10050系",
    "10000型": "10000系",
    "10000系10050型": "10000系",
    "10000系10000型": "10000系",
    "100系（きぬ）": "100系（スペーシア）",
    "500系（リバティりょうもう）": "500系（リバティ）",
    "N100系（スペーシアX）": "N100系",
    "20400型": "20400系",
    "6050系100番台": "6050系",
    "50050系": "50000系",
    "20050系": "20000系",
    "60000形 MSE": "60000系",
    "70000形 GSE": "70000系",
    "30000形 EXEα": "小田急電鉄30000形EXEα",
    "20000形": "20000系",
    "50000形": "50000系",
    "9020系": "9000系",
    "相鉄新7000系": "7000系",
    "相鉄12000系": "相模鉄道12000系",
    "7500系（7000系は全廃）": "7500系",
    "東急5050系": "5050系",
    "5050系4000番台": "5050系",
    "東武100系（スペーシア）": "100系（スペーシア）",
    // v4.3.984: 東上線データの「東武5000系」は50000系の省略表記（旧5000型は引退済み、組合中の現役形式と整合）→ 東武50000系表示
    // v4.3.988: 直通稳定——带前缀候选全线路精确（防异地视图 override/S4 换图标）
  "相鉄20000系": "相模鉄道20000系",
  "相鉄21000系": "相模鉄道13000系",
  "相模鉄道21000系": "相模鉄道13000系",
  "のぞみ": "N700系（東海）",
  "東武5000系": "50000系",
    // v4.3.986: 公式对照——都営5300形2023年2月全廃(5500形置换,交通局ありがとう5300形),小田急10000形HiSE 2012年引退(小田急公式PDF)——2026年ダイヤに出現は旧/誤データ、現役車両表示
    "都営5300形": "5500形",
    "ロマンスカー 10000形": "小田急電鉄30000形EXEα",
    "北総9100形": "9100形",
    "東武50090系（TJライナー専用）": "50090系",
    "東武70090系（THライナー専用・日比谷線直通）": "70090系",
    "都営6500形": "6500形",
    "西武40000系(デュアルシート)": "40000系",
    "新2000系（2000系）": "西武鉄道2000系",
    "5000形": "5000系",
    "7700系": "7000系",
    "東急3000系": "3000系（リニューアル）",
    "新101系": "101系",
    "新101系（ワンマン）": "101系",
    "新101系（ワンマン専用塗装）": "101系",
    "JR E231系": "E231系800番台（東西線直通）",
    "JR E233系": "E233系2000番台",
    "JR E233系7000番台": "E233系7000番台",
    "JR E233系2000番台": "E233系2000番台",
    "京急1500形": "1000形（1500番台）",
    "京成3700形": "3700形（LED）",
    "京成3100形": "3150形",
    "東急5050系4000番台": "5050系",
    "メトロ16000形": "16000系",
    "2500番台（湘南）": "E257系2500番台",
    "2500番台（踊り子）": "E257系2500番台",
    "5500番台（草津・四万）": "E257系5500番台",
    "2100番台": "E209系（京葉線）",
    "209系2000番台": "E209系（京葉線）",
    "209系2100番台": "E209系（京葉線）",
    "E231系500番台": "E231系常磐LED",
    "E231系900番台": "E231系0番台",
    "100系 Revaty": "500系（リバティ）",
    "500系「リバティ」": "500系（リバティ）",
    "500系「リバティ会津」": "500系（リバティ）",
    "N100系「スペーシアX」": "N100系",
    "100系「スペーシア」": "100系（スペーシア）",
    "200型（りょうもう）": "200系（りょうもう）",
    "京急1000形": "京急電鉄1000系",
    "京成3000形": "京成電鉄3000形",
    "京王9000系（9030系）": "京王電鉄9000系",
    "埼玉高速2000系": "埼玉高速鉄道2000形",
    "東急5000系": "5000系",
    "2020系（1050系は順次引退）": "2020系",
    "6020系（5両）": "6020系",
    "6020系（7両）": "6020系",
    "9000系（有楽町線直通）": "9000系",
    "9000系（東急東横線直通）": "9000系",
    "9000系（Fライナー・みなとみらい線直通）": "9000系",
    "9000系（Fライナー）": "9000系",
    "9000系（Fライナー・みなとみらい直通）": "9000系",
    "7000系（候補）": "7000系",
    "7000系（2026年ワンマン化）": "7000系",
    "4000系（候補）": "4000系",
    "8500系（レオライナー、新型導入中）": "8500系",
    "3000系": "3000形",
    "300系": "300系（301編成）",
    "11000系": "11000系（新塗装）",
    "東京メトロ10000系": "10000系",
    "東京メトロ8000系": "8000系",
    "東京メトロ05系": "05系（リニューアル）",
    "東京メトロ16000系": "16000系",
    "東京メトロ17000系": "17000系",
    "東京メトロ13000系": "13000系",
    "東京メトロ9000系": "9000系",
    "メトロ17000系": "17000系",
    "メトロ10000系": "10000系",
    "05系": "05系（リニューアル）",
    "05N系": "05系（別）",
    "10000系（レッドアロー）": "10000系",
    "2000系（8両編成・池袋線直通）": "2000系",
    "20000系（日比谷線直通）": "20000系",
    "E231系": "E231系0番台",
    "E233系": "E233系0番台",
    "E235系": "E235系総武中央線",
    "E127系": "E127系0番台",
    "E127系100番台": "E127系0番台",
    "E131系": "E131系0番台",
    "E501系": "E501系（常磐線）",
    "E253系（日光・きぬがわ）": "JR東日本E253系",
    "E233系湘南色": "JR東日本E233系3000番台",
    "E257系": "E257系500番台",
    "E257系（草津・四萬・あかぎ）": "E257系500番台",
    "E257系500番台（わかしお・さざなみ）": "E257系500番台",
    "E257系500番台（しおさい）": "E257系500番台",
    "E257系500番台（わかしお）": "E257系500番台",
    "E257系500番台（さざなみ）": "E257系500番台",
    "E257系1500番台（踊り子）": "E257系2000番台",
    "E259系": "E259系",
    "E259系（成田エクスプレス）": "E259系",
    "E353系": "E353系",
    "E353系（あずさ）": "E353系",
    "E353系（あずさ・富士回遊）": "E353系",
    "E657系": "E657系",
    "E657系（ときわ・ひたち）": "E657系",
    "E657系（ひたち・ときわ）": "E657系",
    "E653系": "E653系",
    "E653系（しらゆき）": "E653系",
    "EV-E301系": "EV-E301系",
    "EV-E301系（ACCUM）": "EV-E301系",
    "EV-E801系（ACCUM）": "EV-E801系（男鹿線）",
    "HB-E300系（リゾートビューふるさと）": "HB-E300系（リゾートしらかみ・橅・別）",
    "211系": "211系湘南色",
    "701系": "701系100番台",
    "701系5000番台": "701系500番台（田沢湖線）",
    "701系5500番台": "701系500番台（田沢湖線）",
    "キハ110系": "キハ110系",
    "キハ110系100番台": "キハ110系",
    "キハ110系0番台（快速南三陸）": "キハ110系",
    "キハ110系100番台（HIGH RAIL 1375）": "キハ110系（ハイレール1375）",
    "キハE130系": "キハE130系0番台",
    "キハE130形500番台": "キハE130系500番台",
    "キハE130形100番台": "キハE130系100番台",
    "キハE120形": "キハE120系（只見線）",
    "キハ40系": "キハ40系（リゾートしらかみ・くまげら）",
    "1100系": "11000系（新塗装）",
    "Y500系": "5000系",
    "横浜高速Y500系": "5000系",
    "5080系": "5000系",
    "8000形": "8000系",
    "C57形（ばんえつ物語・別）": "C57形（ばんえつ物語）",
    "209系": "E209系（京葉線）",
    "209系3000番台": "E209系（京葉線）",
    "209系3100番台": "E209系（京葉線）",
    "250系（両毛）": "250系",
    // ===== 新幹線（v4.3.973）=====
    "E5系はやぶさ": "E5系",
    "はやぶさ": "E5系",
    "はやて": "E5系",
    "E6系": "E6系こまち",
    "こまち": "E6系こまち",
    "E7系かがやき": "E7系",
    "かがやき": "E7系",
    "とき": "E7系",
    "はくたか": "E7系",
    "あさま": "E7系",
    "つるぎ": "E7系",
    "E8系": "E8系つばさ",
    "つばさ": "E8系つばさ",
    "H5系はやぶさ": "H5系",
    "N700系": "N700系（東海）",
    "700系（こだま）": "700系",
    "700系（ひかり）": "700系",
    "923系": "923系ドクターイエロー",
    "ドクターイエロー": "923系ドクターイエロー",
    "E2系": "E2系J編成",
    "E2系（やまびこ）": "E2系J編成",
    "やまびこ": "E2系J編成",
    "E3系つばさ": "E3系",
    "E926系": "E926系East-i",
    "E927系": "E927系SOAR",
    "800系つばめ": "800系",
    "つばめ": "800系",
    "かもめ": "800系",
    "500系（こだま）": "500系",
  };

  // v4.3.987: 显示名解析——返回最终应展示的车型名（仅 alias 展开路径同步，
  // 如退役车→現役車：都営5300形→5500形、ロマンスカー 10000形→小田急電鉄30000形EXEα、
  // 東武5000系→50000系）；override 锁定/近似兜底保持原候选名（标签显示真实车型）。
  // v4.3.991: 多候选全部可解析 → 返回完整串（诚实表达不确定，如混跑"71-000形 / 70-000形"）；
  //            部分可解析 → 返回首个可解析项；单候选 → 原名/别名展开（与 4.3.987 一致）
  function resolveVehicleDisplayName(candidatesStr, lineId) {
    if (!candidatesStr) return null;
    var parts = String(candidatesStr).split("/");
    var _hits = [];
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].trim();
      if (!name) continue;
      var _hit = '';
      // v4.3.996: 显示名同步线路锁定——同名裸型号按线路展开涂装/车籍
      // （"211系"在中央東線→"211系長野色"、"E233系"在外房→"E233系5000番台"），
      // 与 resolveVehicleIcon 图标决策一致，杜绝"名=湘南色、图=長野色"错配。
      if (lineId && LINE_VEHICLE_OVERRIDES[lineId]) {
        var _ov2 = LINE_VEHICLE_OVERRIDES[lineId];
        var _ovt2 = _ov2[name];
        if (!_ovt2) {
          var _ovb2 = name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
          if (_ovb2 !== name) _ovt2 = _ov2[_ovb2];
        }
        if (_ovt2 === '@S4') { _hit = name; }       // @S4 哨兵：保持原候选名（阻止别名/反查误展，如5080系→5000系）
        else if (_ovt2) _hit = _ovt2;
      }
      if (!_hit) {
        if (VEHICLE_NAME_TO_ICON[name]) _hit = name;            // 精确命中：显示原名
        else {
          var _al = VEHICLE_NAME_ALIASES[name];                 // 别名表（仅在 override 未命中时）
          if (_al && VEHICLE_NAME_TO_ICON[_al]) _hit = _al;
          else {
            var _base = name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
            if (_base !== name) {
              if (VEHICLE_NAME_TO_ICON[_base]) _hit = _base;
              else { var _al2 = VEHICLE_NAME_ALIASES[_base]; if (_al2 && VEHICLE_NAME_TO_ICON[_al2]) _hit = _al2; }
            }
          }
        }
      }
      if (_hit && _hits.indexOf(_hit) < 0) _hits.push(_hit); // v4.3.1001: 同值去重（override 统一场景如常磐緩行 18000系 不重复显示）
    }
    if (!_hits.length) return null;
    var _nonEmpty = 0;
    for (var j = 0; j < parts.length; j++) if (parts[j].trim()) _nonEmpty++;
    if (_hits.length === _nonEmpty && _hits.length > 1) return _hits.join(" / ");
    return _hits[0];
  }

  // v4.3.964: 三层查找——精确匹配 → 别名表 → 去括注基础名匹配
  
  // v4.3.1025: 编成/涂装池命中——图标名在 FLEET_ICON_POOLS 中时按候选串稳定取图
  function _poolPickByIcon(icon, seedStr) {
    if (!icon) return null;
    for (var _pk in FLEET_ICON_POOLS) {
      var _pp = FLEET_ICON_POOLS[_pk];
      if (_pp.indexOf(icon) >= 0) {
        if (_pp.length < 2) return icon;
        var _s = String(seedStr || _pk);
        var _h = 0;
        for (var _i = 0; _i < _s.length; _i++) _h = (_h * 31 + _s.charCodeAt(_i)) >>> 0;
        return _pp[_h % _pp.length];
      }
    }
    return icon;
  }

  function resolveVehicleIcon(candidatesStr, lineId) {
    var _raw = _resolveVehicleIconBase(candidatesStr, lineId);
    return _poolPickByIcon(_raw, candidatesStr);
  }
  function _resolveVehicleIconBase(candidatesStr, lineId) {
    if (!candidatesStr) return null;
    var parts = String(candidatesStr).split("/");
    var _hits = []; // v4.3.1026: 收集全部命中 {n: 候选名, icon}，支持编成/保有权重
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].trim();
      if (!name) continue;
      // 0. 线路感知同名解抢（v4.3.977）：同名车型被别社抢占时，按线路优先取专属图标
      // v4.3.979: 覆盖为「锁定」语义——线路有该车型映射条目时，目标图标未注册则返回 null
      //           （走 S4 线路默认兜底），绝不落回别社同名图标
      if (lineId && LINE_VEHICLE_OVERRIDES[lineId]) {
        var _ov = LINE_VEHICLE_OVERRIDES[lineId];
        var _ovt = _ov[name];
        if (!_ovt) {
          var _ovb = name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
          _ovt = _ov[_ovb];
        }
        if (_ovt) {
          if (VEHICLE_NAME_TO_ICON[_ovt]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[_ovt] }); continue; }
          // v4.3.988: override 目标支持 alias 展开（如 相模鉄道21000系→相模鉄道13000系近似），
          // 保持锁定语义——命中别名目标仍有图则用之，否则 return null 走 S4 线路默认，
          // 绝不落回别社同名图/候选池别社车。
          var _ovAl = VEHICLE_NAME_ALIASES[_ovt];
          if (_ovAl && VEHICLE_NAME_TO_ICON[_ovAl]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[_ovAl] }); continue; }
          return null;
        }
      }
      // v4.3.1006: 线路感知裸名重定向（同名被别社抢占：都電8800/8900形 → 都営图标）
      if (lineId && LINE_ICON_NAME_REDIRECT[lineId] && LINE_ICON_NAME_REDIRECT[lineId][name]) {
        var _rd = LINE_ICON_NAME_REDIRECT[lineId][name];
        if (VEHICLE_NAME_TO_ICON[_rd]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[_rd] }); continue; }
      }
      // 1. 精确匹配
      if (VEHICLE_NAME_TO_ICON[name]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[name] }); continue; }
      // 2. 别名表
      var _al = VEHICLE_NAME_ALIASES[name];
      if (_al && VEHICLE_NAME_TO_ICON[_al]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[_al] }); continue; }
      // 3. 去掉（…）/（…）括注后重试
      var _base = name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
      if (_base !== name) {
        if (VEHICLE_NAME_TO_ICON[_base]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[_base] }); continue; }
        var _al2 = VEHICLE_NAME_ALIASES[_base];
        if (_al2 && VEHICLE_NAME_TO_ICON[_al2]) { _hits.push({ n: name, icon: VEHICLE_NAME_TO_ICON[_al2] }); continue; }
      }
    }
    if (!_hits.length) return null;
    // v4.3.1026: 编成/保有权重（VEHICLE_FLEET_WEIGHTS：key=候选串原文，数组按候选顺序对齐）
    var _w = VEHICLE_FLEET_WEIGHTS[candidatesStr];
    if (_w) {
      var _cum = 0, _vals = [];
      for (var k = 0; k < _hits.length; k++) {
        var _wi = 0;
        for (var n = 0; n < parts.length; n++) {
          if (parts[n].trim() === _hits[k].n) { _wi = _w[n] || 0; break; }
        }
        if (_wi > 0) { _cum += _wi; _vals.push({ hit: _hits[k], c: _cum }); }
      }
      if (_cum > 0) {
        // 30 分钟时间窗 seed：刷新稳定、时段间轮换（近似运用表分段）
        // v4.3.1026b: xorshift 散列——连续时间窗下分布均匀（31 乘法哈希对连续输入有周期偏差）
        var _seed = String(candidatesStr) + '|' + Math.floor(Date.now() / 1800000);
        var _hh = 0;
        for (var q = 0; q < _seed.length; q++) _hh = (_hh * 31 + _seed.charCodeAt(q)) >>> 0;
        var _x = _hh >>> 0;
        _x ^= (_x << 13); _x >>>= 0;
        _x ^= (_x >> 17);
        _x ^= (_x << 5); _x >>>= 0;
        var _r = _x % _cum;
        for (var v = 0; v < _vals.length; v++) if (_r < _vals[v].c) return _vals[v].hit.icon;
        return _vals[_vals.length - 1].hit.icon;
      }
    }
    return _hits[0].icon;
  }

  window.TrainIcons = {
    getTrainIcon: getTrainIcon,
    getTrainClass: getTrainClass,
    resolveVehicleIcon: resolveVehicleIcon,
    resolveVehicleDisplayName: resolveVehicleDisplayName,
    VEHICLE_NAME_TO_ICON: VEHICLE_NAME_TO_ICON,
    VEHICLE_FLEET_WEIGHTS: VEHICLE_FLEET_WEIGHTS,
    FLEET_ICON_POOLS: FLEET_ICON_POOLS,
    LINE_ICONS: LINE_ICONS,
    OPERATOR_ICONS: OPERATOR_ICONS
  };

  console.debug("[TrainIcons] initialized with", Object.keys(LINE_ICONS).length, "line icons and", Object.keys(OPERATOR_ICONS).length, "operator defaults");
})();


