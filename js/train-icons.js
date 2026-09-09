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
        { line: "Joban", icon: "../images/列车/JR東日本/E261系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 4 },          // ひたち・ときわ（2026新型 E261系）
        { line: "Joban", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 3 },          // ひたち・ときわ（E657系 従来車）
                { line: "SobuRapid", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami", "Wakashio", "Shiosai"], priority: 3 }, // さざなみ・わかしお・しおさい
        { line: "Uchibo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami"], priority: 3 },
        { line: "Sotobo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Wakashio"], priority: 3 },
        { line: "Narita", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Shiosai"], priority: 3 },
        { line: "ChuoMain", icon: "../images/列车/JR東日本/E353系.png", typeMatch: ["Azusa", "Kaiji"], priority: 3 },           // 特急あずさ・かいじ（E353系）
        { line: "Narita", icon: "../images/列车/JR東日本/E259系.png", typeMatch: ["NaritaExpress"], priority: 3 },               // 成田エクスプレス（E259系）
        { line: "OuMain", icon: "../images/列车/JR東日本/E751系.png", typeMatch: ["Tsugaru"], priority: 3 },                  // 特急つがる（青森〜秋田）
        { line: "Uetsu", icon: "../images/列车/JR東日本/E653系.png", typeMatch: ["Inaho"], priority: 3 },                      // 特急いなほ（新潟〜秋田）
        { line: "OuMain", icon: "../images/列车/JR東日本/E653系.png", typeMatch: ["Inaho"], priority: 3 },
        { line: "Joetsu", icon: "../images/列车/JR東日本/E257系5500番台.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },       // 特急草津・四万
        { line: "Agatsuma", icon: "../images/列车/JR東日本/E257系5500番台.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },
        { line: "Shinetsu", icon: "../images/列车/JR東日本/E653系1000番台.png", typeMatch: ["Shirayuki"], priority: 3 }        // 特急しらゆき（新潟〜直江津）
      ]
    },
    "ExpTobu": {
      routes: [
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/N100系.png", typeMatch: ["SpaciaX"], priority: 3 },        // スペーシアX（N100系）
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/N100系.png", typeMatch: ["SpaciaX"], priority: 3 },
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/500系.png", typeMatch: ["SpaciaLiberty"], priority: 3 }, // スペーシア リバティ（500系）
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/500系.png", typeMatch: ["SpaciaLiberty"], priority: 3 },
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/100系.png", typeMatch: ["Kinu", "Kegon", "Nikko"], priority: 3 }, // きぬがわ・けごん（100系スペーシア）
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/100系.png", typeMatch: ["Kinu", "Kegon", "Nikko"], priority: 3 },
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/250系.png", typeMatch: ["Ryomo"], priority: 3 },                    // 特急りょうもう（250系）
        { line: "TobuIsesaki", icon: "../images/列车/東武鉄道/250系.png", typeMatch: ["Ryomo"], priority: 3 }
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
    "Keisei": "../images/列车/京成電鉄/3200形.png",
    "Sotetsu": "../images/列车/相模鉄道/13000系.png", // 4.3.277：相鉄.png 与 13000系.png 同一图，归并
    "TWR": "../images/列车/東京臨海高速鉄道/70-000形.png", // 4.3.276：实车图恢复
    "MIR": "../images/列车/東急電鉄/5050系.png",
    "Rinkai": "../images/列车/東京臨海高速鉄道/70-000形.png", // 4.3.276：实车图恢复
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/TX-2000系.png", // つくばエクスプレス：TX-2000系
    "Yurikamome": "../images/列车/ゆりかもめ/7300系.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/1000系.png", // 4.3.276：实车图恢复
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/2000形.png", // 4.3.276：AGT实车图恢复
    "TokyoMonorail": "../images/列车/東京モノレール/1000形.png", // 4.3.278：入库实车图（40×48 绿色带车头，车型待用户最终确认）
    "NipporiToneri": "../images/鉄道/都営地下鉄/日暮里・舎人ライナー.png", // 4.3.273：日暮里・舎人ライナー = AGT新交通（330形），非1000形地下鉄車
    "MinatoMirai": "../images/列车/東急電鉄/5050系.png"
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
    "Joban": "../images/列车/JR東日本/E531系.png",
    "JobanRapid": "../images/列车/JR東日本/E531系.png",
    "JobanLocal": "../images/列车/JR東日本/E231系0番台.png", // 常磐緩行線（綾瀬〜取手）自社車：松戸車両センター E231系0番台（4.3.450 訂正——千代田線直通車は Chiyoda 側 18000系）
    "Mito": "../images/列车/JR東日本/E531系.png",
    "Nikkoku": "../images/列车/JR東日本/E131系600番台.png", // 日光線：E131系600番台
    "Gono": "../images/列车/JR東日本/HB-E220系.png", // 五能線：HB-E220系
    "Yokohama": "../images/列车/JR東日本/E233系6000番台.png", // 横浜線：E233系6000番台
    // 上野東京ライン（宇都宮・高崎 ↔ 東海道）＝同一系統 E233系湘南色；宇都宮線(Oyama) 同車
    "Tokaido": "../images/列车/JR東日本/E233系湘南色.png",
    "Takasaki": "../images/列车/JR東日本/E233系湘南色.png",
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
    "Uchibo": "../images/列车/JR東日本/E131系0番台.png",       // 外房線：E131系0番台
    "Hachiko": "../images/列车/JR東日本/HB-E220系.png",  // 4.3.280：八高線非電化区間 2026.3 キハ110系定期運用終了 → HB-E220系
    "Noda": "../images/列车/東武鉄道/80000系.png", // 4.3.280：野田線（アーバンパークライン）：80000系（2025.3 投入の新主力）

    // Tokyo Metro specific
    "Ginza": "../images/列车/東京メトロ/1000系.png",
    "Marunouchi": "../images/列车/東京メトロ/2000系.png",
    "MarunouchiBranch": "../images/列车/東京メトロ/2000系.png", // 丸ノ内線支線（方南町支線）：本線と同じ2000系
    "Hibiya": "../images/列车/東京メトロ/13000系.png", // 4.3.276：实车图恢复
    "Tozai": "../images/列车/東京メトロ/15000系.png", // 東西線：15000系（原05系 重命名）
    "Chiyoda": "../images/列车/東京メトロ/18000系.png",
    "Yurakucho": "../images/列车/東京メトロ/17000系.png",
    "Hanzomon": "../images/列车/東急電鉄/2020系.png",   // 4.3.272：半蔵門線↔田園都市線 100%相互直通（同一列車：東急5000系/メトロ8000系が両線を運行）
    "Namboku": "../images/列车/東京メトロ/9000系.png",
    "Fukutoshin": "../images/列车/東京メトロ/10000系.png",
    "ChiyodaBranch": "../images/列车/東京メトロ/18000系.png",  // 北綾瀬支線：千代田線系統（18000系）

    "Mita": "../images/列车/都営地下鉄/6300形.png",  // 4.3.276：三田線实车图恢复（原判定服务器机箱为误判）
    // Toei specific（4.3.276：都営各線实车图恢复）
    "Asakusa": "../images/列车/都営地下鉄/5500形.png",
    "Shinjuku": "../images/列车/都営地下鉄/10-300形.png",
    "Oedo": "../images/列车/都営地下鉄/12-000形.png",
    "Arakawa": "../images/列车/都営地下鉄/7700形.png",

    // Tobu specific（4.3.275：用户重命名后重新判定，8枚全为实车，已按车型入库）
    "TobuSkytree": "../images/列车/東武鉄道/50000系.png",     // スカイツリーライン（伊勢崎線系）：50000系主力
    "TobuIsesaki": "../images/列车/東武鉄道/50000系.png",     // 伊勢崎線：スカイツリー系統（同一車輛）
    "TobuTojo": "../images/列车/東武鉄道/90000系.png",      // 4.3.280：東上系統：90000系（2026.9.26 デビュー予定・東上線新型；原80000系是野田線用，接线错误）
    "Tojo": "../images/列车/東武鉄道/90000系.png",
    "TobuNikko": "../images/列车/東武鉄道/1000系.png",       // 日光線：一般列車（1000系）
    "Tobu_Kameido": "../images/列车/東武鉄道/1000系.png",     // 4.3.277：亀戸線.png 与 東武1000系.png 同一图（哈希一致），已归并
    "Ogose": "../images/列车/東武鉄道/50090系.png",          // 越生線：東上系統（東上線全列車直通）
    "Utsunomiya": "../images/列车/東武鉄道/20400系.png",     // 4.3.280：東武宇都宮線：20400系（已替换最后8000系）
    // Odakyu specific（4.3.275：小田急系統共通 4000系，ロマンスカー は typeMatch 優先；4.3.278：江ノ島線・多摩線 各停6両主力=3000形）
    "Odawara": "../images/列车/小田急電鉄/4000系.png",
    "OdakyuEnoshima": "../images/列车/小田急電鉄/3000形.png", // 4.3.278：江ノ島線 各停（6両）主力=3000形/1000形/8000形；4000形は10両固定で各停6両ホームに入線せず（维基#車両 2022年改正後）
    "OdakyuTama": "../images/列车/小田急電鉄/3000形.png", // 4.3.278：多摩線 日中各停6両主力=3000形（维基#車両 同江ノ島線論理）
    // 4.3.273 JR 系統補全
    "Nambu": "../images/列车/JR東日本/E233系8000番台.png",     // 南武線：E233系8000番台（図庫既有）
    "TokaidoMain": "../images/列车/JR東日本/E233系湘南色.png", // 東海道本線：上野東京ライン系統（Tokaido 同一車両）
    // 4.3.276 恢复实车图（原判定误判）
    "Sagami": "../images/列车/JR東日本/E131系500番台.png",   // 相模線
    "Tsurumi": "../images/列车/JR東日本/E131系1000番台.png",  // 鶴見線
    "Sotobo": "../images/列车/JR東日本/E131系0番台.png",   // 内房線（特急わかしお は typeMatch E257系）

    // Seibu specific（4.3.273：按运行系统分组，支线全列車直通親線 → 同一車輛）
    "SeibuShinjuku": "../images/列车/西武鉄道/30000系.png",       // 新宿系統・普通主力（40000系は特急S-TRAIN用）
    "Hamura": "../images/列车/西武鉄道/30000系.png",              // 拝島線：新宿系統（全列車新宿線直通、同一車輛）
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

    // Keisei specific
    "Keisei": "../images/列车/京成電鉄/3200形.png",
    "KeiseiMain": "../images/列车/京成電鉄/3200形.png",
    "Oshiage": "../images/列车/京成電鉄/3200形.png",
    "Kanamachi": "../images/列车/京成電鉄/3200形.png",
    "Chiba": "../images/列车/京成電鉄/3200形.png",
    "Chihara": "../images/列车/京成電鉄/3200形.png",
    "NaritaAccess": "../images/列车/京成電鉄/AE形.png",
    "KeiseiChiba": "../images/列车/京成電鉄/3200形.png",
    "KeiseiChihara": "../images/列车/京成電鉄/3200形.png",
    "KeiseiKanamachi": "../images/列车/京成電鉄/3200形.png",
    "KeiseiOshiage": "../images/列车/京成電鉄/3200形.png",
    "NaritaSkyAccess": "../images/列车/京成電鉄/AE形.png",

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
    "SotetsuShinyokohama": "../images/列车/相模鉄道/13000系.png",
    "SotetsuShin-Yokohama": "../images/列车/相模鉄道/13000系.png",

    // Yokohama Municipal
    "YokohamaMunicipal": "../images/列车/横浜市交通局/4000形.png",
    "YokohamaBlue": "../images/列车/横浜市交通局/4000形.png",
    "YokohamaGreen": "../images/列车/横浜市交通局/10000形.png",

    // Single-line operators
    "TWR": "../images/列车/東京臨海高速鉄道/70-000形.png", // 4.3.276：实车图恢复
    "Rinkai": "../images/列车/東京臨海高速鉄道/70-000形.png",
    "MIR": "../images/列车/東急電鉄/5050系.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/TX-2000系.png", // つくばエクスプレス：TX-2000系
    "Yurikamome": "../images/列车/ゆりかもめ/7300系.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/1000系.png",
    "TokyoMonorail": "../images/列车/東京モノレール/1000形.png", // 4.3.278：入库实车图（40×48 绿色带车头，车型待用户最终确认）
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/2000形.png",

    // ===== railway_data key 对齐 =====
    "MinatoMirai": "../images/列车/東急電鉄/5050系.png",
    "NewShuttle": "../images/列车/埼玉新都市交通/2000形.png",
    "Tōnami": "../images/列车/JR東日本/GV-E400系.png",       // 4.3.266：只見線 = GV-E400系（原GV-E400系.png 为机械面板占位图）
    "Echigo": "../images/列车/JR東日本/E129系.png",
    "Hakushin": "../images/列车/JR東日本/E129系.png",
    "Miyo": "../images/列车/JR東日本/E129系.png",
    "SuigunBranch": "../images/列车/JR東日本/キハE130系0番台.png",

    // ===== 4.3.279 复查修复（fallback 误判纠正）=====
    "Nippori_Toneri": "../images/鉄道/都営地下鉄/日暮里・舎人ライナー.png", // 日暮里・舎人ライナー：AGT新交通（330形），原错误fallback到6300形
    "TokyuSetagaya": "../images/鉄道/東急電鉄/世田谷線.png", // 世田谷線：路面電車（300系），原错误fallback到2020系
    "Oyama": "../images/列车/JR東日本/E233系湘南色.png", // 宇都宮線（JR東北本線系統）：上野東京ライン同一車両
    "BanetsuEast": "../images/列车/JR東日本/キハ110系.png", // 磐越東線：キハ110系
    "Iiyama": "../images/列车/JR東日本/キハ110系.png", // 飯山線：キハ110系
    "Ishinomaki": "../images/列车/JR東日本/キハ110系.png", // 石巻線：キハ110系
    "Kamaishi": "../images/列车/JR東日本/キハ110系.png", // 釜石線：キハ110系
    "Kamiishi": "../images/列车/JR東日本/キハ110系.png", // 北上線：キハ110系
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
    "Daishi_Tobu": "../images/列车/東武鉄道/1000系.png" // 東武大師線：1000系（現役主力）
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

  function getTrainIcon(lineId, operator, trainId, stationIndex, trainType) {
    try {
      // 直通列車：車号末尾で車籍系統を判定（現在線のデフォルト車両より優先）
      if (THROUGH_SUFFIX_RULES[lineId]) {
        var _tn = String(trainId || "").split("_")[0];
        var _rules = THROUGH_SUFFIX_RULES[lineId];
        for (var _ri = 0; _ri < _rules.length; _ri++) {
          var _rule = _rules[_ri];
          if (_tn && _rule.suffix && _tn.length >= _rule.suffix.length &&
              _tn.slice(_tn.length - _rule.suffix.length) === _rule.suffix) {
            return _rule.icon;
          }
        }
      }
      // Chuo/Sobu local: E231系500番台 + E235系0番台 并用（2025 起 E235 由山手线转用）
      if (lineId === "ChuoLocal" || lineId === "ChuoSobuLocal") {
        var n = 0;
        if (typeof trainId === "number") { n = Math.abs(trainId) % 2; }
        else if (typeof trainId === "string") { var s = 0; for (var i = 0; i < trainId.length; i++) s += trainId.charCodeAt(i); n = s % 2; }
        return n === 0
          ? "../images/列车/JR東日本/E231系総武中央線.png"
          : "../images/列车/JR東日本/E235系総武中央線.png";
      }
      // Vehicle deployment zones first (211系長野色/E127/E129/特急 etc., priority 高者优先)
      if (typeof stationIndex === "number" && window.UNIFIED_LINES && window.UNIFIED_LINES[lineId]) {
        var sts = window.UNIFIED_LINES[lineId].stations || [];
        var typeName = "";
        if (trainType) {
          var tp = String(trainType).split(":");
          typeName = tp.length > 1 ? tp[tp.length - 1] : String(trainType);
        }
        var bestIcon = null, bestPri = -1;
        Object.keys(VEHICLE_DEPLOYMENTS).forEach(function(vk) {
          var v = VEHICLE_DEPLOYMENTS[vk];
          v.routes.forEach(function(r) {
            if (r.line !== lineId || !r.icon) return;
            if (r.typeMatch) {
              if (!typeName) return;
              var matched = false;
              for (var i = 0; i < r.typeMatch.length; i++) {
                if (typeName.toLowerCase().indexOf(String(r.typeMatch[i]).toLowerCase()) >= 0) { matched = true; break; }
              }
              if (!matched) return;
            }
            var lo = 0, hi = sts.length - 1;
            if (r.from && r.to) {
              var fi = sts.indexOf(r.from);
              var ti = sts.indexOf(r.to);
              if (fi === -1 || ti === -1) return;
              lo = Math.min(fi, ti); hi = Math.max(fi, ti);
            } else if (r.from) {
              var f2 = sts.indexOf(r.from);
              if (f2 === -1) return;
              lo = f2;
            } else if (r.to) {
              var t2 = sts.indexOf(r.to);
              if (t2 === -1) return;
              hi = t2;
            }
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
