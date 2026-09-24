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
    "JR West": "../images/列车/JR東日本/E235系山手線.png",
    "TokyoMetro": "../images/列车/東京メトロ/1000系.png",
    "Toei": "../images/列车/都営地下鉄/6300形.png", // 4.3.266：原都営浅草線.png 为电子设备占位图，1000形.png 与東武1000系重复已删，改用 6300形（三田線）
    "YokohamaMunicipal": "../images/列车/横浜市交通局/4000形.png",
    "Keio": "../images/列车/京王電鉄/2000系.png", // 4.3.277：京王.png 与 2000系.png 同一图（哈希一致），归并至 2000系.png
    "Odakyu": "../images/列车/小田急電鉄/4000系.png", // 4.3.275：小田急系統共通 4000系（千代田直通の現役主力、小田原/江ノ島/多摩 同一車輛体系）
    "Seibu": "../images/列车/西武鉄道/30000系.png", // 4.3.270：西武运营商默认 = 30000系（通勤主力）
    "Tobu": "../images/列车/東武鉄道/8000系.png", // 4.3.274：東武標準一般車
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
    // ===== JR East =====
    "Yamanote": "../images/列车/JR東日本/E235系山手線.png",
    // 4.3.271 常态化直通系统修正：
    // 京浜東北線・根岸線 = 同一系統（E233系1000番台）
    "KeihinTohoku": "../images/列车/JR東日本/E233系1000番台.png",
    // 中央線快速 ↔ 青梅線 ↔ 五日市線 = 同一系統（青梅・五日市全列車中央線快速直通，E233系0番台同型）
    "ChuoLocal": "../images/列车/JR東日本/E235系総武中央線.png",
    "ChuoSobuLocal": "../images/列车/JR東日本/E235系総武中央線.png",
    "ChuoRapid": "../images/列车/JR東日本/E233系0番台.png",
    "ChuoMain": "../images/列车/JR東日本/E233系0番台.png", // 中央本線（東京〜高尾兜底；高尾以西は 211長野 deployment）
    "Ome": "../images/列车/JR東日本/E233系青梅線.png",
    "Itsukaichi": "../images/列车/JR東日本/E233系青梅線.png",
    // 埼京線 ↔ 川越線（大宮〜川越間は埼京線車両 E233系7000番台が直通）
    "Saikyo": "../images/列车/JR東日本/E233系7000番台.png",
    "Kawagoe": "../images/列车/JR東日本/E209系3500番台.png", // 川越線自社車（高崎車両センター E209系3500番台）；埼京線直通列車は Saikyo 側が優先
    "KawagoeWest": "../images/列车/JR東日本/E209系3500番台.png", // 川越線（川越〜高麗川）単独運行区間：川越線自社車 E209系3500番台
    "ShonanShinjuku": "../images/列车/JR東日本/E233系3000番台.png", // 湘南新宿ライン：E233系3000番台
    "Yokosuka": "../images/列车/JR東日本/E235系1000番台.png",
    "SobuRapid": "../images/列车/JR東日本/E235系1000番台.png",
    "SobuMain": "../images/列车/JR東日本/E235系1000番台.png",
    "Joban": "../images/列车/JR東日本/E231系常磐LED.png", // 常磐線快速（品川〜取手）：E231系0番台（LED方向幕）が主力
    "JobanMain": "../images/列车/JR東日本/E531系.png", // 常磐線本線（取手〜仙台 中距離）：E531系が主力（4.3.480 追加）
    "JobanLocal": "../images/列车/東京メトロ/18000系.png", // 常磐各停：千代田線车辆直通担当（2026-09-08 用户指示统一 18000系）
    "JobanRapid": "../images/列车/JR東日本/E231系0番台.png", // 常磐快速線（上野〜取手）：E231系0番台主力（2021起E233系0番台增備混跑）；无manual线路默认，防兜底山手線
    "Mito": "../images/列车/JR東日本/E531系.png",
    "Nikkoku": "../images/列车/JR東日本/E131系600番台.png", // 日光線：E131系600番台
    "Gono": "../images/列车/JR東日本/HB-E220系.png", // 五能線：HB-E220系
    "Yokohama": "../images/列车/JR東日本/E233系6000番台.png", // 横浜線：E233系6000番台
    // 上野東京ライン（宇都宮・高崎 ↔ 東海道）＝同一系統 E233系湘南色；宇都宮線(Oyama) 同車
    "Tokaido": "../images/列车/JR東日本/E233系3000番台.png",
    "Takasaki": "../images/列车/JR東日本/E233系3000番台.png",
    "Musashino": "../images/列车/JR東日本/E231系0番台.png",
    "Uetsu": "../images/列车/JR東日本/701系100番台.png",
    "Ryomo": "../images/列车/JR東日本/211系湘南色.png",
    "Agatsuma": "../images/列车/JR東日本/211系湘南色.png",
    "BanetsuWest": "../images/列车/JR東日本/キハ110系.png",  // 磐越西線：非電化区間主力（キハ110系/GV-E400系；E721系仅限郡山〜会津若松電化段，不作为全线代表）
    "Senzan": "../images/列车/JR東日本/E721系.png",      // 仙山線：E721系（仙台地区）
    "TohokuMain": "../images/列车/JR東日本/E721系.png",  // 4.3.266：東北本線（仙台）= E721系（原東北線.png 同车型重复）
    "Tazawako": "../images/列车/JR東日本/701系盛岡.png", // 田沢湖線：701系盛岡
    "Yamagata": "../images/列车/JR東日本/E723系.png",    // 4.3.276：山形線 = E723系（原山形線.png 重命名入库）
    "Senseki": "../images/列车/JR東日本/E131系800番台.png",     // 仙石線：E131系800番台（原 E721系 判定修正）
    "Keiyo": "../images/列车/JR東日本/E233系5000番台.png", // 京葉線：E233系5000番台（e233ky）
    "Karasuyama": "../images/列车/JR東日本/EV-E301系.png",   // 烏山線：EV-E301系（蓄電池）
    "Kururi": "../images/列车/JR東日本/キハE130系100番台.png",     // 久留里線：キハE130系100番台
    "Suigun": "../images/列车/JR東日本/キハE130系0番台.png",       // 水郡線：キハE130系0番台
    "Uchibo": "../images/列车/JR東日本/E131系0番台.png",       // 内房線：E131系0番台（4.3.478 互换后 Uchibo=内房）
    "Hachiko": "../images/列车/JR東日本/HB-E220系.png",  // 4.3.280：八高線非電化区間 2026.3 キハ110系定期運用終了 → HB-E220系
    "Noda": "../images/列车/東武鉄道/80000系.png", // 4.3.280：野田線（アーバンパークライン）：80000系（2025.3 投入の新主力）

    // 4.3.481 图标覆盖补全：以下 23 条此前无 LINE_ICONS 键，全部 fallback 到 E235系山手線（东京通勤车图标乱入地方线）。
    // 各线车型依据 ODPT 时刻表/已知部署：地方线按实际主力车型（キハ110系/E129系/E131系等）。
    "ChuoTatsuno": "../images/列车/JR東日本/E127系0番台.png", // 中央本線辰野支線：E127系0番台（区间摆渡）
    "Joetsu": "../images/列车/JR東日本/211系湘南色.png",     // 上越線：211系湘南色（高崎〜水上段主力；E129系部署见 VEHICLE_DEPLOYMENTS）
    "Kesennuma": "../images/列车/JR東日本/キハ110系.png",    // 気仙沼線：キハ110系（BRT 化前主力）
    "NambuBranch": "../images/列车/JR東日本/E131系0番台.png", // 南武線浜川崎支線：E131系0番台（2021 投入，与南武線同型车体系）
    "Narita": "../images/列车/JR東日本/E131系0番台.png",     // 成田線：E131系0番台（房総地区共通）
    "NaritaAbikoBranch": "../images/列车/JR東日本/E131系0番台.png", // 成田線我孫子支線：E131系0番台
    "NaritaAirportBranch": "../images/列车/JR東日本/E235系1000番台.png", // 成田線空港支線：E235系1000番台（総武快速直通担当）
    "Ofunato": "../images/列车/JR東日本/キハ110系.png",      // 大船渡線：キハ110系
    "Oito": "../images/列车/JR東日本/E127系0番台.png",       // 大糸線：E127系0番台（松本〜南小谷；211長野色部署见 VEHICLE_DEPLOYMENTS）
    "OuMain": "../images/列车/JR東日本/キハ110系.png",       // 奥羽本線：キハ110系（非電化区間主力；特急は typeMatch E751/E653）
    "Shinetsu": "../images/列车/JR東日本/E129系.png",        // 信越本線：E129系（新潟段；高崎段 211湘南/長野段 211長野·E127 见 VEHICLE_DEPLOYMENTS）
    "Shinonoi": "../images/列车/JR東日本/211系長野色.png",   // 篠ノ井線：211系長野色（主力）
    "Togane": "../images/列车/JR東日本/E131系0番台.png",     // 東金線：E131系0番台（房総地区共通）
    "TsurumiOkawa": "../images/列车/JR東日本/E131系1000番台.png", // 鶴見線大川支線：E131系1000番台（鶴見線同型）
    "TsurumiUmiShibaura": "../images/列车/JR東日本/E131系1000番台.png", // 鶴見線海芝浦支線：E131系1000番台
    "Yamada": "../images/列车/JR東日本/キハ110系.png",       // 山田線：キハ110系
    "Ikebukuro": "../images/列车/西武鉄道/30000系.png",      // 西武池袋線：30000系（通勤主力，同 Seibu 默认）
    "Kiryu": "../images/列车/東武鉄道/8000系.png",           // 東武桐生線：8000系
    "Koizumi": "../images/列车/東武鉄道/8000系.png",         // 東武小泉線：8000系
    "Sano": "../images/列车/東武鉄道/8000系.png",            // 東武佐野線：8000系

    // Tokyo Metro specific
    "Ginza": "../images/列车/東京メトロ/1000系.png",
    "Marunouchi": "../images/列车/東京メトロ/2000系.png",
    "MarunouchiBranch": "../images/列车/東京メトロ/2000系.png", // 丸ノ内線支線（方南町支線）：本線と同じ2000系
    "Hibiya": "../images/列车/東京メトロ/13000系.png", // 4.3.276：实车图恢复
    "Tozai": "../images/列车/東京メトロ/15000系.png", // 東西線：15000系（原05系 重命名）
    "Chiyoda": "../images/列车/東京メトロ/16000系.png", // 千代田線本線：16000系主力（18000系は常磐直通の増備、4.3.457 図庫更新）
    "Yurakucho": "../images/列车/東京メトロ/17000系.png",
    "Hanzomon": "../images/列车/東急電鉄/2020系.png",   // 4.3.272：半蔵門線↔田園都市線 100%相互直通（同一列車：東急5000系/メトロ8000系が両線を運行）
    "Namboku": "../images/列车/東京メトロ/9000系.png",
    "Fukutoshin": "../images/列车/東京メトロ/10000系.png",
    "ChiyodaBranch": "../images/列车/東京メトロ/05系（北綾瀬）.png",  // 北綾瀬支線：05系（北綾瀬仕様）専用車（4.3.457 図庫更新）

    "Mita": "../images/列车/都営地下鉄/6300形.png",  // 4.3.276：三田線实车图恢复（原判定服务器机箱为误判）
    // Toei specific（4.3.276：都営各線实车图恢复）
    "Asakusa": "../images/列车/都営地下鉄/5500形.png",
    "Shinjuku": "../images/列车/都営地下鉄/10-300形.png",
    "Oedo": "../images/列车/都営地下鉄/12-000形.png",
    "Arakawa": "../images/列车/都営地下鉄/8500形.png", // 都電荒川線（東京さくらトラム）：都電8500形（1997年〜現役、4.3.458 都電素材に変更）

    // Tobu specific（4.3.275：用户重命名后重新判定，8枚全为实车，已按车型入库）
    "TobuSkytree": "../images/列车/東武鉄道/50000系.png",     // スカイツリーライン（伊勢崎線系）：50000系主力
    "TobuIsesaki": "../images/列车/東武鉄道/50000系.png",     // 伊勢崎線：スカイツリー系統（同一車輛）
    "TobuTojo": "../images/列车/東武鉄道/60000系.png",      // 東上系統：60000系（2023年デビュー・現主力；90000系は2026.9 デビュー直後の新車、4.3.457 図庫更新）
    "Tojo": "../images/列车/東武鉄道/50000系.png",
    "TobuNikko": "../images/列车/東武鉄道/1000系.png",       // 日光線：一般列車（1000系）
    "Tobu_Kameido": "../images/列车/東武鉄道/1000系.png",     // 4.3.277：亀戸線.png 与 東武1000系.png 同一图（哈希一致），已归并
    "Ogose": "../images/列车/東武鉄道/50090系.png",          // 越生線：東上系統（東上線全列車直通）
    "TobuUtsunomiya": "../images/列车/東武鉄道/20400系.png",     // 4.3.481：键名修正 Utsunomiya→TobuUtsunomiya（Utsunomiya 是 JR 宇都宮線 ID，東武線是 TobuUtsunomiya，错键导致東武宇都宮線 fallback 東武8000系）；20400系（已替换最后8000系）
    // Odakyu specific（4.3.275：小田急系統共通 4000系，ロマンスカー は typeMatch 優先；4.3.278：江ノ島線・多摩線 各停6両主力=3000形）
    "Odawara": "../images/列车/小田急電鉄/5000系.png", // 4.3.458：小田原線の新型 5000形（2025年デビュー・増備中；4000形 は千代田直通の既存主力）
    "OdakyuEnoshima": "../images/列车/小田急電鉄/3000形.png", // 4.3.278：江ノ島線 各停（6両）主力=3000形/1000形/8000形；4000形は10両固定で各停6両ホームに入線せず（维基#車両 2022年改正後）
    "OdakyuTama": "../images/列车/小田急電鉄/3000形.png", // 4.3.278：多摩線 日中各停6両主力=3000形（维基#車両 同江ノ島線論理）
    // 4.3.273 JR 系統補全
    "Nambu": "../images/列车/JR東日本/E233系8000番台.png",     // 南武線：E233系8000番台（図庫既有）
    "TokaidoMain": "../images/列车/JR東日本/E233系3000番台.png", // 東海道本線：上野東京ライン系統（Tokaido 同一車両）
    // 4.3.276 恢复实车图（原判定误判）
    "Sagami": "../images/列车/JR東日本/E131系500番台.png",   // 相模線
    "Tsurumi": "../images/列车/JR東日本/E131系1000番台.png",  // 鶴見線
    "Sotobo": "../images/列车/JR東日本/E131系0番台.png",   // 外房線（特急わかしお は typeMatch E257系）（4.3.478 互换后 Sotobo=外房）

    // Seibu specific（4.3.273：按运行系统分组，支线全列車直通親線 → 同一車輛）
    "SeibuShinjuku": "../images/列车/西武鉄道/30000系.png",       // 新宿系統・普通主力（40000系は特急S-TRAIN用）
    "Haijima": "../images/列车/西武鉄道/30000系.png",              // 拝島線：新宿系統（全列車新宿線直通、同一車輛）
    "Kokubunji": "../images/列车/西武鉄道/30000系.png",           // 国分寺線：新宿系統
    "SeibuTamagawa": "../images/列车/西武鉄道/101系.png", // 4.3.277：多摩川線.png 与 101系.png 同一图，归并
    "SeibuEn": "../images/列车/西武鉄道/101系（西武園線）.png",
    "Yamaguchi": "../images/列车/西武鉄道/8500系.png",
    "SeibuYamaguchi": "../images/列车/西武鉄道/8500系.png",
    "SeibuChichibu": "../images/列车/西武鉄道/4000系.png",        // 秩父線：池袋系統（池袋線直通）
    "Seibu_Sayama": "../images/列车/西武鉄道/9000系.png",         // 狭山線（球場線）：池袋系統
    "SeibuTamako": "../images/列车/西武鉄道/9000系.png",          // 多摩湖線：9000系
    "Yurakucho_Seibu": "../images/列车/西武鉄道/40050系.png",     // 西武有楽町線：池袋系統（新型）
    "SeibuToshima": "../images/列车/西武鉄道/9000系.png",         // 豊島線：池袋系統

    // Tokyu specific
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
    "TokyuToyoko": "../images/列车/東急電鉄/5050系.png",   // 4.3.269：東横線 + みなとみらい線 直通（横浜高速鉄道 Y500系 同型）
    "Toyoko": "../images/列车/東急電鉄/5050系.png",

    // Keikyu specific
    "Keikyu": "../images/列车/京急電鉄/1000系.png",
    "KeikyuMain": "../images/列车/京急電鉄/1000系.png",
    "KeikyuAirport": "../images/列车/京急電鉄/1000系.png",
    "Daishi_Keikyu": "../images/列车/京急電鉄/600形.png", // 大師線：600形（専用車）
    "KeikyuZushi": "../images/列车/京急電鉄/1000系.png",
    "KeikyuKurihama": "../images/列车/京急電鉄/1000系.png",

    // Keisei specific（4.3.457：図庫更新——京成本線系の主力を新形 80000形 に、3200形 は引退進行）
    "Keisei": "../images/列车/京成電鉄/80000形.png",
    "KeiseiMain": "../images/列车/京成電鉄/80000形.png",
    "Oshiage": "../images/列车/京成電鉄/80000形.png",
    "Kanamachi": "../images/列车/京成電鉄/80000形.png",
    "Chiba": "../images/列车/京成電鉄/80000形.png",
    "Chihara": "../images/列车/京成電鉄/80000形.png",
    "NaritaAccess": "../images/列车/京成電鉄/3900系.png", // 4.3.458：スカイアクセス線の普通列車＝3900形（スカイライナーAE形は typeMatch）
    "KeiseiChiba": "../images/列车/京成電鉄/80000形.png",
    "KeiseiChihara": "../images/列车/京成電鉄/80000形.png",
    "KeiseiKanamachi": "../images/列车/京成電鉄/80000形.png",
    "KeiseiOshiage": "../images/列车/京成電鉄/80000形.png",
    "NaritaSkyAccess": "../images/列车/京成電鉄/3900系.png", // 4.3.458：普通列車＝3900形（スカイライナーは typeMatch AE形）
    // 千葉都市モノレール・湘南モノレール（单轨新交通）
    "ChibaMonorail1": "../images/列车/千葉都市モノレール/Number_prefix_Chiba_monorail.png",
    "ChibaMonorail2": "../images/列车/千葉都市モノレール/Number_prefix_Chiba_monorail.png",
    "ShonanMonorail": "../images/列车/湘南モノレール/ShonanMonorail_logo_M.png",

    // Keio specific（4.3.278：新增车型素材 1000系=井の頭線用）
    "Inokashira": "../images/列车/京王電鉄/1000系.png",
    "KeioInokashira": "../images/列车/京王電鉄/1000系.png",
    "KeioMain": "../images/列车/京王電鉄/5000系.png",
    "Keio-Hachioji": "../images/列车/京王電鉄/5000系.png",
    "KeioTakao": "../images/列车/京王電鉄/7000系.png", // 高尾線：7000系
    "KeioZoo": "../images/列车/京王電鉄/7000系.png", // 動物園線：7000系
    "KeioKeibajo": "../images/列车/京王電鉄/7000系.png", // 競馬場線：7000系
    "KeioSagami": "../images/列车/京王電鉄/9000系.png", // 相模原線：9000系
    "KeioShin": "../images/列车/京王電鉄/9000系.png", // 京王新線：9000系

    // Sotetsu specific
    "Sotetsu": "../images/列车/相模鉄道/13000系.png",
    "SotetsuMain": "../images/列车/相模鉄道/13000系.png",
    "SotetsuIzumino": "../images/列车/相模鉄道/13000系.png",
    "SotetsuShinyokohama": "../images/列车/相模鉄道/11000系（新塗装）.png", // 4.3.458：相鉄新横浜線の主力＝11000系（新塗装）
    "SotetsuShin-Yokohama": "../images/列车/相模鉄道/11000系（新塗装）.png",

    // Yokohama Municipal
    "YokohamaMunicipal": "../images/列车/横浜市交通局/4000形.png",
    "YokohamaBlue": "../images/列车/横浜市交通局/4000形.png",
    "YokohamaGreen": "../images/列车/横浜市交通局/10000形.png",

    // Single-line operators
    "TWR": "../images/列车/東京臨海高速鉄道/71-000形.png", // 4.3.457：りんかい線現役主力 71-000形（70-000形は置換済み）
    "Rinkai": "../images/列车/東京臨海高速鉄道/71-000形.png",
    "MIR": "../images/列车/東急電鉄/5050系.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/TX-3000系.png", // 4.3.458：TX-3000系（2021年〜新型主力）
    "Yurikamome": "../images/列车/ゆりかもめ/7300系.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/1000系.png",
    "TokyoMonorail": "../images/列车/東京モノレール/10000形.png", // 4.3.457：東京モノレール現役主力 10000形（1000形は引退）
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/2000系.png",

    // ===== railway_data key 对齐 =====
    "MinatoMirai": "../images/列车/東急電鉄/5050系.png",
    "NewShuttle": "../images/列车/埼玉新都市交通/2000系.png",
    "Tadami": "../images/列车/JR東日本/GV-E400系.png",        // 4.3.481：键名修正 Tōnami→Tadami（unicode ō 变体导致只见線无键 fallback E235）；只見線 = GV-E400系
    "Echigo": "../images/列车/JR東日本/E129系.png",
    "Hakushin": "../images/列车/JR東日本/E129系.png",
    "Miyo": "../images/列车/JR東日本/E129系.png",
    "SuigunBranch": "../images/列车/JR東日本/キハE130系0番台.png",

    // ===== 4.3.279 复查修复（fallback 误判纠正）=====
    "Nippori_Toneri": "../images/列车/都営地下鉄/330形.png", // 日暮里・舎人ライナー：AGT 330形（4.3.457 図庫更新——実車図に変更）
    "TokyuSetagaya": "../images/鉄道/東急電鉄/世田谷線.png", // 世田谷線：路面電車（300系），原错误fallback到2020系
    "UtsunomiyaJR": "../images/列车/JR東日本/E233系3000番台.png", // 4.3.481：键名修正 Oyama→UtsunomiyaJR（Oyama 是车站 ID，线路 ID 是 UtsunomiyaJR，错键导致宇都宮線 fallback E235）；上野東京ライン同一車両
    "BanetsuEast": "../images/列车/JR東日本/キハ110系.png", // 磐越東線：キハ110系
    "Iiyama": "../images/列车/JR東日本/キハ110系.png", // 飯山線：キハ110系
    "Ishinomaki": "../images/列车/JR東日本/キハ110系.png", // 石巻線：キハ110系
    "Kamaishi": "../images/列车/JR東日本/キハ110系.png", // 釜石線：キハ110系
    "Kitakami": "../images/列车/JR東日本/キハ110系.png", // 北上線：キハ110系
    "Komii": "../images/列车/JR東日本/キハ110系.png", // 小海線：キハ110系
    "Kounan": "../images/列车/JR東日本/キハ110系.png", // 花輪線：キハ110系
    "Oga": "../images/列车/JR東日本/キハ110系.png", // 男鹿線：キハ110系
    "Ominato": "../images/列车/JR東日本/キハ110系.png", // 大湊線：キハ110系
    "RikutoEast": "../images/列车/JR東日本/キハ110系.png", // 陸羽東線：キハ110系
    "RikutsuWest": "../images/列车/JR東日本/キハ110系.png", // 陸羽西線：キハ110系
    "Tsugaru": "../images/列车/JR東日本/キハ110系.png", // 津軽線：キハ110系
    "Yonezawa": "../images/列车/JR東日本/キハ110系.png", // 米坂線：キハ110系
    "Hachinohe": "../images/列车/JR東日本/キハE130系500番台.png", // 八戸線：キハE130系500番台
    "Ito": "../images/列车/JR東日本/E231系1000番台.png", // 伊東線：E231系1000番台（湘南色近郊型）
    "Kashima": "../images/列车/JR東日本/E131系0番台.png", // 鹿島線：E131系0番台
    "SensekiTohoku": "../images/列车/JR東日本/HB-E210系.png", // 仙石東北ライン：HB-E210系
    "Daishi_Tobu": "../images/列车/東武鉄道/1000系.png", // 東武大師線：1000系（現役主力）

    // ===== 新幹線（2026-09-23 登録：22枚の車両アイコン + 5社ロゴ）=====
    // 各線の代表形式（最も象徴的な現行車両）を選定。
    "TohokuShinkansen": "../images/列车/JR東日本/E5系.png",       // 東北新幹線：E5系はやぶさ
    "JoetsuShinkansen": "../images/列车/JR東日本/E7系.png",        // 上越新幹線：E7系
    "HokurikuShinkansen": "../images/列车/JR東日本/E7系.png",      // 北陸新幹線：E7系（W7系と同形状）
    "YamagataShinkansen": "../images/列车/JR東日本/E8系つばさ.png", // 山形新幹線：E8系つばさ（2024年〜新型）
    "AkitaShinkansen": "../images/列车/JR東日本/E6系こまち.png",    // 秋田新幹線：E6系こまち
    "HokkaidoShinkansen": "../images/列车/JR東日本/H5系.png",      // 北海道新幹線：H5系
    "TokaidoShinkansen": "../images/列车/JR東海/N700系（東海）.png", // 東海道新幹線：N700系
    "SanyoShinkansen": "../images/列车/JR西日本/500系.png",        // 山陽新幹線：500系
    "KyushuShinkansen": "../images/列车/JR九州/800系.png",          // 九州新幹線：800系つばめ
    "NishiKyushuShinkansen": "../images/列车/JR九州/800系.png"      // 西九州新幹線：800系（かもめ）
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
  var VEHICLE_NAME_TO_ICON = {};
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
  "Arakawa": {
    "7700形 / 8500形 / 8800形 / 8900形 / 9000形": [8, 5, 10, 8, 2]
  }
};

// v4.3.1006: 线路感知裸名重定向——同名裸型号被别社抢占时（都電8800形/8900形 裸键=京成），
// 图标解析重定向到本线所属公司图标（显示名保持裸名"8800形"，杜绝"名=都電、图=京成"错配）
var LINE_ICON_NAME_REDIRECT = {
  "Arakawa": { "8800形": "都営8800形", "8900形": "都営8900形" }
};

var LINE_VEHICLE_OVERRIDES = {
    "NewShuttle": {
      "2000系": "埼玉新都市交通2000系",
      "2000系（01編成）": "埼玉新都市交通2000系（01編成）",
      "2000系（02編成）": "埼玉新都市交通2000系（02編成）",
      "2000系（03編成）": "埼玉新都市交通2000系（03編成）",
      "2000系（04編成）": "埼玉新都市交通2000系（04編成）",
      "2000系（05編成）": "埼玉新都市交通2000系（05編成）",
      "2000系（06編成）": "埼玉新都市交通2000系（06編成）",
      "2000系（07編成）": "埼玉新都市交通2000系（07編成）",
      "2020系": "2020系（2021編成）",
      "2020系（1050系は順次引退）": "2020系（2021編成）"
    },
    // v4.3.978: 裸「2000形」被埼玉新都市交通抢占（EXTRA 先到先得），按线路显式指向各社
    "Odakyu": { "2000形": "小田急電鉄2000形" },
    "OdakyuEnoshima": { "2000形": "小田急電鉄2000形" },
    "OdakyuTama": { "2000形": "小田急電鉄2000形" },
    "Odawara": { "2000形": "小田急電鉄2000形" },
    "TokyoMonorail": { "2000形": "東京モノレール2000形" },
    "SaitamaRailway": { "2000形": "埼玉高速鉄道2000形" },
    // v4.3.979: 相鉄系裸 key 被東武/メトロ抢占——按线路指向相鉄 key（素材未注册时兜底线路默认，不显示别社图标）
    "SotetsuMain": { "8000系": "相模鉄道8000系", "9000系": "相模鉄道9000系", "21000系": "相模鉄道21000系", "相鉄21000系": "相模鉄道21000系", "相鉄20000系": "相模鉄道20000系", "20000系": "相模鉄道20000系" },
    "SotetsuIzumino": { "8000系": "相模鉄道8000系", "9000系": "相模鉄道9000系", "21000系": "相模鉄道21000系", "相鉄21000系": "相模鉄道21000系", "相鉄20000系": "相模鉄道20000系", "20000系": "相模鉄道20000系" },
    "SotetsuShin-Yokohama": { "8000系": "相模鉄道8000系", "9000系": "相模鉄道9000系", "21000系": "相模鉄道21000系", "相鉄21000系": "相模鉄道21000系", "相鉄20000系": "相模鉄道20000系", "20000系": "相模鉄道20000系" },
    // v4.3.982: 裸 key 被别社抢占——按线路覆盖到各社前缀 key（无素材的 target 走锁定语义兜底线路默认）
    "KeioMain": { "7000系": "京王電鉄7000系", "8000系": "京王電鉄8000系", "9000系": "京王電鉄9000系", "5000系": "京王電鉄5000系" },
    "KeioSagami": { "7000系": "京王電鉄7000系", "8000系": "京王電鉄8000系", "9000系": "京王電鉄9000系", "5000系": "京王電鉄5000系" },
    "KeioTakao": { "7000系": "京王電鉄7000系", "8000系": "京王電鉄8000系", "9000系": "京王電鉄9000系", "5000系": "京王電鉄5000系" },
    "KeioKeibajo": { "7000系": "京王電鉄7000系", "8000系": "京王電鉄8000系", "9000系": "京王電鉄9000系", "5000系": "京王電鉄5000系" },
    "KeioShin": { "7000系": "京王電鉄7000系", "8000系": "京王電鉄8000系", "9000系": "京王電鉄9000系", "5000系": "京王電鉄5000系" },
    "KeioZoo": { "7000系": "京王電鉄7000系", "8000系": "京王電鉄8000系", "9000系": "京王電鉄9000系", "5000系": "京王電鉄5000系" },
    "KeioInokashira": { "1000系": "京王電鉄1000系" },
    "OdakyuEnoshima": { "2000形": "小田急電鉄2000形", "1000形": "小田急電鉄1000形", "8000形": "小田急電鉄8000系", "4000形": "小田急電鉄4000形", "小田急4000形": "小田急電鉄4000形", "30000形 EXEα": "小田急電鉄30000形EXEα", "60000形 MSE": "小田急電鉄60000形MSE", "70000形 GSE": "小田急電鉄70000形GSE" },
    "OdakyuTama": { "2000形": "小田急電鉄2000形", "1000形": "小田急電鉄1000形", "4000形": "小田急電鉄4000形", "小田急4000形": "小田急電鉄4000形", "30000形 EXEα": "小田急電鉄30000形EXEα", "60000形 MSE": "小田急電鉄60000形MSE", "70000形 GSE": "小田急電鉄70000形GSE" },
    "Odawara": { "2000形": "小田急電鉄2000形", "1000形": "小田急電鉄1000形", "4000形": "小田急電鉄4000形", "小田急4000形": "小田急電鉄4000形", "30000形 EXEα": "小田急電鉄30000形EXEα", "60000形 MSE": "小田急電鉄60000形MSE", "70000形 GSE": "小田急電鉄70000形GSE", "20000形": "小田急電鉄20000形", "50000形": "小田急電鉄50000形" },
    "SeibuShinjuku": { "2000系": "西武鉄道2000系", "20000系": "西武鉄道20000系", "10000系（レッドアロー）": "西武鉄道10000系" },
    "SeibuToshima": { "2000系": "西武鉄道2000系" },
    "Seibu_Sayama": { "7000系": "西武鉄道7000系" },
    "TobuSkytree": { "30000系": "東武鉄道30000系", "東武30000系": "東武鉄道30000系", "東武20000系": "東武鉄道20000系", "20000系": "東武鉄道20000系", "20050系": "東武鉄道20050系" },
    "TobuIsesaki": { "30000系": "東武鉄道30000系", "東武30000系": "東武鉄道30000系", "東武20000系": "東武鉄道20000系", "20000系": "東武鉄道20000系", "20050系": "東武鉄道20050系" },
    "Tobu_Kameido": { "10000型": "東武鉄道10000型" },
    "TokyuDenEn": { "5000系": "東急電鉄5000系", "50050系": "東急電鉄50050系", "東武30000系": "東武鉄道30000系" },
    "TokyuIkegami": { "1000系": "東急電鉄1000系" },
    "TokyuTamagawa": { "1000系": "東急電鉄1000系" },
    "TokyuToyoko": { "5000系": "東急電鉄5000系", "横浜高速Y500系": "横浜高速鉄道Y500系" },
    "TamaMonorail": { "1000系": "多摩都市モノレール1000系" },
    "TokyoMonorail": { "2000形": "東京モノレール2000形", "10000形": "東京モノレール10000形" },
    "Daishi_Keikyu": { "1500形": "京急電鉄1500形" },
    "Keisei": { "3100形": "京成電鉄3100形", "AE100形": "京成電鉄AE100形" },
    "ShonanShinjuku": { "E253系": "JR東日本E253系" },
    "UtsunomiyaJR": { "E253系": "JR東日本E253系" },
    "Shinonoi": { "383系": "JR東海383系" },
    "Tokaido": { "285系": "JR西日本285系" },
    "TokaidoMain": { "285系": "JR西日本285系" },
    // ================= v4.3.996: 同名裸型号按线路锁定（涂装/车籍区分） =================
    // 用户审查发现两类问题：①同型号未区分涂装——裸"211系/E233系/E235系/E127系/E231系"
    // 被 VEHICLE_NAME_TO_ICON 先到先得解析到固定图（211系→湘南色、E233系→0番台橙、E235系→総武中央），
    // 中央東線長野色・房総5000番台・山手線等全部错涂装；②一个型号一条线——同名裸系（7000/8000/9000/
    // 5000/1000/10000/30000系）跨社先到先得，東武/西武/東急/相鉄線显示别社车。
    // 以下按线路显式锁定（目标 key 均实证注册；无素材目标用 @S4 哨兵走线路默认兜底，绝不显示别社同名图）：
    // ---- 私铁同名跨社 ----
    "Fukutoshin": {
      "7000系": "@S4",                    // メトロ7000系現役（7101F 等少数）但无图标素材 → 线路默认（10000系）
      "9000系": "東京メトロ9000系",
      "30000系": "東武鉄道30000系",       // 副都心線直通東武30000系
      "10000系": "東京メトロ10000系",
      "17000系": "東京メトロ17000系",
      "5000系": "東急電鉄5000系"          // 東急東横直通
    },
    "Yurakucho": {
      "7000系": "@S4",
      "9000系": "東京メトロ9000系",
      "30000系": "東武鉄道30000系",
      "10000系": "東京メトロ10000系",
      "17000系": "東京メトロ17000系"
    },
    "Tojo": {
      "9000系": "東武鉄道9000系",         // 東上線：東武9000系
      "10000系": "東武鉄道10000系",       // 東武10000型（10000系）
      "10000型": "東武鉄道10000型"
    },
    "MinatoMirai": {
      "5000系": "東急電鉄5000系",         // みなとみらい線：東急5000系直通
      "5050系": "東急5050系",
      "Y500系": "横浜高速鉄道Y500系"
    },
    "Kokubunji": { "8000系": "@S4" },     // 国分寺線：西武8000系（2025投入）无素材 → 西武30000系默认
    "Ogose":      { "8000系": "@S4" },    // 越生線：西武/東武系8000系 → 线路默认
    "TokyuOimachi": { "9000系": "@S4" },  // 目黒線：東急9000系无素材 → 6020系默认
    "SeibuChichibu": { "7000系": "西武鉄道7000系" },  // 秩父線：西武7000系
    "SeibuTamako":   { "7000系": "西武鉄道7000系" },  // 多摩湖線：西武7000系
    // ---- JR 裸型号涂装 ----
    "ChuoMain":   { "211系": "211系長野色" },  // 中央東線（高尾以西）211系長野色
    "ChuoTatsuno": { "211系": "211系長野色" }, // 辰野支線 211系（中央本線系統=長野色）
    "Shinonoi":   { "211系": "211系長野色" },  // 篠ノ井線主力（LINE_ICONS 实证）
    "Ryomo":      { "E233系": "E233系3000番台" },  // 両毛線 E233系3000番台（湘南色）实证
    "Sotobo":     { "E233系": "E233系5000番台" },  // 外房線 E233系5000番台（房総直通）实证
    "Uchibo":     { "E233系": "E233系5000番台" },  // 内房線 E233系5000番台（房総直通）实证
    "Yamanote":   { "E235系": "E235系山手線" },    // 山手線 E235系（山手专用・绿）
    "Echigo":     { "E127系": "E129系" },          // 越後線 E129系主力（JR官网实证；E127系是長野地区）
    "Miyo":       { "E127系": "E129系" },          // 弥彦線 E129系主力（JR官网实证）
    "Narita":     { "E231系": "@S4" },             // 成田線 E231系（通勤快速）→ 线路默认 E131系0番台
    // 京成押上線：3000形系全系（3000/3050/3100/3200/3300/3400/3500/3600/3700形）均为京成车，
    // 裸"3000形"被小田急抢占 → 指向京成3000形资产（同系涂装统一）
    "KeiseiOshiage": {
      "3000形": "京成電鉄3000形",
      "3050形": "京成電鉄3000形",
      "3700形": "京成電鉄3000形",
      "3600形": "京成電鉄3000形",
      "3500形": "京成電鉄3000形",
      "3400形": "京成電鉄3000形"
    },
    // ============ v4.3.997: 全线路串图扫描（scan-co 实证）第二批 ============
    // 拝島線：裸"20000系/2000系"被相鉄/メトロ抢占 → 西武（30000系全局已=西武不需覆盖）
    "Haijima": { "20000系": "西武鉄道20000系", "2000系": "西武鉄道2000系" },
    // 京成本線・スカイライナー線：3000形全系（3000/3050/3400/3500/3600/3700形）被小田急3000形抢占 → 京成3000形
    "Keisei": {
      "3000形": "京成電鉄3000形",
      "3050形": "京成電鉄3000形",
      "3700形": "京成電鉄3000形",
      "3600形": "京成電鉄3000形",
      "3500形": "京成電鉄3000形",
      "3400形": "京成電鉄3000形"
    },
    "NaritaSkyAccess": {
      "3000形": "京成電鉄3000形",
      "3050形": "京成電鉄3000形",
      "3700形": "京成電鉄3000形",
      "3600形": "京成電鉄3000形",
      "3500形": "京成電鉄3000形",
      "3400形": "京成電鉄3000形"
    },
    // 東武小泉線/桐生線/佐野線：裸"10000型/10000系100xx型"被メトロ10000系抢占 → 東武
    "Koizumi": { "10000系10050型": "東武鉄道10000系" },
    "Kiryu":   { "10000型": "東武鉄道10000型" },
    "Sano":    { "10000系10000型": "東武鉄道10000系" },
    // 目黒線：裸"3000系"被小田急3000形抢占 → 東急3000系（リニューアル）资产；
    // "5080系"裸名被小田急5000系资产抢占（显示名误展"5000系"）→ @S4 哨兵保持原名+東急兜底
    "TokyuMeguro": { "3000系": "3000系（リニューアル）", "5080系": "@S4" },
    // v4.3.999: 千代田線"小田急60000系(MSE)"裸名被東武60000系抢占 → 小田急60000形资产（千代田線直通ロマンスカー）
    "Chiyoda": { "60000系": "小田急電鉄60000形MSE", "小田急60000系": "小田急電鉄60000形MSE" },
    // v4.3.1001: 常磐緩行線统一 18000系（用户指示）——manual E233系2000番台/メトロ16000系 均显示 18000系
    "JobanLocal": { "E233系2000番台": "18000系", "東京メトロ16000系": "18000系", "16000系": "18000系", "小田急4000形": "18000系", "4000形": "18000系" },
    // v4.3.1003: 都電荒川線"9000形"被全局别名"9000系"(東京メトロ車)劫持 → 保持原名+都電兜底(9000形レトロ車現役、官网实证);
    // 9000形无素材资产,图标走 LINE_ICONS 8500形(都電現役)
    "Arakawa": { "9000形": "9000形" },

    // 横浜ブルーライン：裸"3000形"被小田急3000形抢占；横浜市営3000形无资产，
    // 用同社4000形（同涂装）兜底，绝不显示别社车
    "YokohamaBlue": { "3000形": "4000形" }
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
  function resolveVehicleIcon(candidatesStr, lineId) {
    if (!candidatesStr) return null;
    var parts = String(candidatesStr).split("/");
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
          if (VEHICLE_NAME_TO_ICON[_ovt]) return VEHICLE_NAME_TO_ICON[_ovt];
          // v4.3.988: override 目标支持 alias 展开（如 相模鉄道21000系→相模鉄道13000系近似），
          // 保持锁定语义——命中别名目标仍有图则用之，否则 return null 走 S4 线路默认，
          // 绝不落回别社同名图/候选池别社车。
          var _ovAl = VEHICLE_NAME_ALIASES[_ovt];
          if (_ovAl && VEHICLE_NAME_TO_ICON[_ovAl]) return VEHICLE_NAME_TO_ICON[_ovAl];
          return null;
        }
      }
      // v4.3.1006: 线路感知裸名重定向（同名被别社抢占：都電8800/8900形 → 都営图标）
      if (lineId && LINE_ICON_NAME_REDIRECT[lineId] && LINE_ICON_NAME_REDIRECT[lineId][name]) {
        var _rd = LINE_ICON_NAME_REDIRECT[lineId][name];
        if (VEHICLE_NAME_TO_ICON[_rd]) return VEHICLE_NAME_TO_ICON[_rd];
      }
      // 1. 精确匹配
      if (VEHICLE_NAME_TO_ICON[name]) return VEHICLE_NAME_TO_ICON[name];
      // 2. 别名表
      var _al = VEHICLE_NAME_ALIASES[name];
      if (_al && VEHICLE_NAME_TO_ICON[_al]) return VEHICLE_NAME_TO_ICON[_al];
      // 3. 去掉（…）/（…）括注后重试
      var _base = name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
      if (_base !== name) {
        if (VEHICLE_NAME_TO_ICON[_base]) return VEHICLE_NAME_TO_ICON[_base];
        var _al2 = VEHICLE_NAME_ALIASES[_base];
        if (_al2 && VEHICLE_NAME_TO_ICON[_al2]) return VEHICLE_NAME_TO_ICON[_al2];
      }
    }
    return null;
  }

  window.TrainIcons = {
    getTrainIcon: getTrainIcon,
    getTrainClass: getTrainClass,
    resolveVehicleIcon: resolveVehicleIcon,
    resolveVehicleDisplayName: resolveVehicleDisplayName,
    VEHICLE_NAME_TO_ICON: VEHICLE_NAME_TO_ICON,
    VEHICLE_FLEET_WEIGHTS: VEHICLE_FLEET_WEIGHTS,
    LINE_ICONS: LINE_ICONS,
    OPERATOR_ICONS: OPERATOR_ICONS
  };

  console.debug("[TrainIcons] initialized with", Object.keys(LINE_ICONS).length, "line icons and", Object.keys(OPERATOR_ICONS).length, "operator defaults");
})();
