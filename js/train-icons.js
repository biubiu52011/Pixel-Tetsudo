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
        { line: "Oito", from: "Matsumoto", to: "Minami-Koya", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 2 },   // 大糸線：全线（E127 核心，优先于 211）
        { line: "Shinonoi", from: "Shiojiri", to: "Shinonoi", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }, // 篠ノ井線：普通运用（班次少于 211）
        { line: "Shinetsu", from: "Shinonoi", to: "Nagano", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }, // 信越本線長野段：极少数班次
        { line: "ChuoTatsuno", from: "Okaya", to: "Shiojiri", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }  // 中央本線辰野支線：区间摆渡（替代 123 系）
      ]
    },
    "E129": {
      routes: [
        { line: "Shinetsu", from: "Naoetsu", to: "Niigata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },   // 信越本線（新潟段）：直江津〜長岡〜新潟
        { line: "Hakushin", from: "Niigata", to: "Shibata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },     // 白新線：全線
        { line: "Echigo", from: "Kashiwazaki-Higashi", to: "Niigata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },  // 越後線：柏崎側端〜吉田〜新潟
        { line: "Yahiko", from: "Higashi-Sanjo", to: "Yahiko", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },   // 弥彦線：全線
        { line: "Uetsu", from: "Niitsu", to: "Murakami", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },         // 羽越本線（新潟直流区間）：新津〜村上
        { line: "Joetsu", from: "Miyaike", to: "Minakami", icon: "../images/列车/JR東日本/E129系.png", priority: 1 }        // 上越線（新潟直流区間）：宮内(長岡)〜水上
      ]
    },
    // ===== 特急・観光列車（typeMatch 按 ODPT trainType 匹配；from/to 省略 = 全線）=====
    "ExpJREast": {
      routes: [
        { line: "Joban", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 3 },          // ひたち・ときわ（※E657系.png 内容待核验）
        { line: "JobanLocal", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 3 },
        { line: "SobuRapid", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami", "Wakashio", "Shiosai"], priority: 3 }, // さざなみ・わかしお・しおさい
        { line: "Uchibo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami"], priority: 3 },
        { line: "Sotobo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Wakashio"], priority: 3 },
        { line: "Narita", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Shiosai"], priority: 3 },
        { line: "OuMain", icon: "../images/列车/JR東日本/つがる.png", typeMatch: ["Tsugaru"], priority: 3 },                  // 特急つがる（青森〜秋田）
        { line: "Joetsu", icon: "../images/列车/JR東日本/草津四万.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },       // 特急草津・四万
        { line: "Agatsuma", icon: "../images/列车/JR東日本/草津四万.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 }
      ]
    },
    "ExpTobu": {
      routes: [
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/スペーシアX.png", typeMatch: ["SpaciaX"], priority: 3 },        // スペーシアX
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/スペーシアX.png", typeMatch: ["SpaciaX"], priority: 3 },
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/スペーシア リバティ.png", typeMatch: ["SpaciaLiberty"], priority: 3 }, // スペーシア リバティ
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/スペーシア リバティ.png", typeMatch: ["SpaciaLiberty"], priority: 3 },
        { line: "TobuSkytree", icon: "../images/列车/東武鉄道/日光 きぬがわ.png", typeMatch: ["Kinu", "Kegon", "Nikko"], priority: 3 }, // きぬがわ・けごん
        { line: "TobuNikko", icon: "../images/列车/東武鉄道/日光 きぬがわ.png", typeMatch: ["Kinu", "Kegon", "Nikko"], priority: 3 }
      ]
    },
    "ExpOdakyu": {
      routes: [
        { line: "Odawara", icon: "../images/列车/小田急電鉄/ロマンスカーGSE.png", typeMatch: ["SuperHakone"], priority: 3 }, // GSE（スーパーはこね）
        { line: "Odawara", icon: "../images/列车/小田急電鉄/ロマンスカーMSE.png", typeMatch: ["Hakone", "HomeWay", "MorningWay"], priority: 3 }, // MSE
        { line: "OdakyuEnoshima", icon: "../images/列车/小田急電鉄/ロマンスカーEXE.png", typeMatch: ["Enoshima", "BayResort", "HomeWay", "MorningWay"], priority: 3 } // EXE（えのしま等）
      ]
    },
    "ExpSeibu": {
      routes: [
        { line: "Ikebukuro", icon: "../images/列车/西武鉄道/西武観光特急.png", typeMatch: ["Ltrain"], priority: 2 },          // 観光特急 L-train
        { line: "SeibuChichibu", icon: "../images/列车/西武鉄道/西武観光特急.png", typeMatch: ["Ltrain"], priority: 2 }
      ]
    }
  };

  // Operator default icons (fallback)
  var OPERATOR_ICONS = {
    "JR-East": "../images/列车/JR東日本/E235系山手線.png",
    "JR West": "../images/列车/JR東日本/E235系山手線.png",
    "TokyoMetro": "../images/列车/東京メトロ/銀座線.png",
    "Toei": "../images/列车/都営地下鉄/1000形.png", // 4.3.266：原都営浅草線.png 为电子设备占位图，改用 1000形（电车）
    "YokohamaMunicipal": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "Keio": "../images/鉄道/京王電鉄/京王線.png", // 4.3.266：原京王.png 为随身听占位图，回退全局默认（京王素材待补）
    "Odakyu": "../images/鉄道/小田急電鉄/小田原線.png", // 4.3.266：原小田急線.png 为巴士占位图，回退全局默认（素材待补）
    "Seibu": "../images/鉄道/西武鉄道/西武池袋線.png", // 4.3.266：原池袋線.png 为电子设备占位图，回退全局默认（素材待补）
    "Tobu": "../images/列车/東武鉄道/東武各線.png",
    "Tokyu": "../images/列车/東急電鉄/田園都市線.png",
    "Keikyu": "../images/列车/京急電鉄/京急線.png",
    "Keisei": "../images/列车/京成電鉄/京成.png",
    "Sotetsu": "../images/列车/相模鉄道/相鉄.png",
    "TWR": "../images/鉄道/東京臨海高速鉄道/臨海線.png",
    "MIR": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
    "Rinkai": "../images/鉄道/東京臨海高速鉄道/臨海線.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/つくばエクスプレス.png",
    "Yurikamome": "../images/列车/ゆりかもめ/ゆりかもめ.png",
    "TamaMonorail": "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png",
    "SaitamaNewUrbanTransit": "../images/鉄道/埼玉新都市交通/伊奈線.png",
    "ChibaUrbanMonorail": "../images/鉄道/千葉都市モノレール/千葉都市モノレール1号線.png",
    "TokyoMonorail": "../images/鉄道/東京モノレール/東京モノレール羽田空港線.png",
    "NipporiToneri": "../images/列车/都営地下鉄/1000形.png",
    "MinatoMirai": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
    "ShonanMonorail": "../images/鉄道/湘南モノレール/湘南モノレール江の島線.png"
  };

  // Specific line icons (override operator defaults)
  var LINE_ICONS = {
    // ===== JR East =====
    "Yamanote": "../images/列车/JR東日本/E235系山手線.png",
    "ChuoLocal": "../images/列车/JR東日本/E235系総武中央線.png",
    "ChuoSobuLocal": "../images/列车/JR東日本/E235系総武中央線.png",
    "Yokosuka": "../images/列车/JR東日本/E235系1000番台.png",
    "SobuRapid": "../images/列车/JR東日本/E235系1000番台.png",
    "SobuMain": "../images/列车/JR東日本/E235系1000番台.png",
    "Joban": "../images/列车/JR東日本/E531系.png",
    "JobanRapid": "../images/列车/JR東日本/E531系.png",
    "JobanLocal": "../images/列车/東京メトロ/18000系.png", // 常磐各停：千代田線车辆直通担当
    "Mito": "../images/列车/JR東日本/E531系.png",
    "Musashino": "../images/列车/JR東日本/武蔵野線.png",
    "Uetsu": "../images/列车/JR東日本/羽越線.png",
    "Ryomo": "../images/列车/JR東日本/211系湘南色.png",
    "Agatsuma": "../images/列车/JR東日本/211系湘南色.png",
    "BanetsuWest": "../images/列车/JR東日本/E721系.png",
    "Senzan": "../images/列车/JR東日本/E721系.png",      // 仙山線：E721系（仙台地区）
    "TohokuMain": "../images/列车/JR東日本/E721系.png",  // 4.3.266：東北本線（仙台）= E721系（原東北線.png 同车型重复）
    "Yamagata": "../images/列车/JR東日本/E721系.png",    // 4.3.266：山形線 = E721系（原山形線.png 为仪表盘占位图）
    "Senseki": "../images/列车/JR東日本/E721系.png",     // 4.3.266：仙石線 = E721系（原仙石線.png 为车载终端占位图）
    "Keiyo": "../images/列车/JR東日本/E233系5000番台.png", // ※E233系5000番台.png 内容可疑（粉高铁非京葉線涂装），待用户提供正确素材
    "Karasuyama": "../images/列车/JR東日本/烏山線.png",   // 烏山線：EV-E301系（蓄電池）
    "Kururi": "../images/列车/JR東日本/久留里線.png",     // 4.3.266：久留里線 = E131系200番台（原E131系200番台.png 为空调面板占位图）
    "Suigun": "../images/列车/JR東日本/水郡線.png",       // 水郡線：キハE130系
    "Uchibo": "../images/列车/JR東日本/外房線.png",       // 4.3.266：railway_data 中 Uchibo 显示名=外房線，图标对齐显示名
    "Hachiko": "../images/列车/JR東日本/八高線.png",
    "Noda": "../images/鉄道/東武鉄道/野田線.png",

    // Tokyo Metro specific
    "Ginza": "../images/列车/東京メトロ/銀座線.png",
    "Marunouchi": "../images/列车/東京メトロ/丸ノ内線.png",
    "Hibiya": "../images/鉄道/東京メトロ/日比谷線.png",
    "Tozai": "../images/鉄道/東京メトロ/東西線.png",
    "Chiyoda": "../images/列车/東京メトロ/18000系.png",
    "Yurakucho": "../images/列车/東京メトロ/有楽町線.png",
    "Hanzomon": "../images/列车/東京メトロ/半蔵門線.png",
    "Namboku": "../images/列车/東京メトロ/南北線.png",
    "Fukutoshin": "../images/列车/東京メトロ/副都心線.png",
    "KitaAyase": "../images/列车/東京メトロ/北綾瀬支線.png",

    // Toei specific（浅草/三田/日暮里舎人 → 回退运营商默认 1000形）
    "Shinjuku": "../images/鉄道/都営地下鉄/都営新宿線.png",
    "Oedo": "../images/鉄道/都営地下鉄/都営大江戸線.png",
    "Arakawa": "../images/鉄道/都営地下鉄/都電荒川線.png",

    // Tobu specific
    "TobuSkytree": "../images/列车/東武鉄道/東武各線.png",
    "TobuIsesaki": "../images/列车/東武鉄道/東武各線.png",
    "TobuTojo": "../images/鉄道/東武鉄道/東武東上線.png",
    "Tojo": "../images/鉄道/東武鉄道/東武東上線.png",
    "TobuNikko": "../images/列车/東武鉄道/東武各線.png",
    "TobuNoda": "../images/鉄道/東武鉄道/野田線.png",
    "Tobu_Kameido": "../images/列车/東武鉄道/亀戸線.png",
    "Ogose": "../images/列车/東武鉄道/東武各線.png",
    "Utsunomiya": "../images/鉄道/東武鉄道/宇都宮線.png", // 東武宇都宮線

    // Seibu specific（池袋線 已清理，其余保留待审）
    "SeibuShinjuku": "../images/鉄道/西武鉄道/西武新宿線.png",
    "SeibuTamagawa": "../images/列车/西武鉄道/多摩川線.png",
    "SeibuEn": "../images/列车/西武鉄道/西武園線.png",
    "Yamaguchi": "../images/列车/西武鉄道/山口線.png",
    "SeibuYamaguchi": "../images/列车/西武鉄道/山口線.png",

    // Tokyu specific
    "TokyuDenEn": "../images/列车/東急電鉄/田園都市線.png",
    "TokyuMeguro": "../images/鉄道/東急電鉄/目黒線.png",
    "TokyuTamagawa": "../images/鉄道/東急電鉄/東急多摩川線.png",
    "Denentoshi": "../images/列车/東急電鉄/田園都市線.png",
    "Oimachi": "../images/鉄道/東急電鉄/大井町線.png",
    "Meguro": "../images/鉄道/東急電鉄/目黒線.png",
    "Ikegami": "../images/鉄道/東急電鉄/池上線.png",
    "Tamagawa": "../images/鉄道/東急電鉄/東急多摩川線.png",
    "Kodomonokuni": "../images/鉄道/東急電鉄/こどもの国線.png",
    "TokyuIkegami": "../images/鉄道/東急電鉄/池上線.png",
    "TokyuKodomonokuni": "../images/鉄道/東急電鉄/こどもの国線.png",
    "TokyuOimachi": "../images/鉄道/東急電鉄/大井町線.png",

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
    "KeiseiChiba": "../images/列车/京成電鉄/京成.png",
    "KeiseiChihara": "../images/列车/京成電鉄/京成.png",
    "KeiseiKanamachi": "../images/列车/京成電鉄/京成.png",
    "KeiseiOshiage": "../images/列车/京成電鉄/京成.png",
    "NaritaSkyAccess": "../images/列车/京成電鉄/スカイライナー.png",

    // Sotetsu specific
    "Sotetsu": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuMain": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuIzumino": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuShinyokohama": "../images/列车/相模鉄道/相鉄.png",
    "SotetsuShin-Yokohama": "../images/列车/相模鉄道/相鉄.png",

    // Yokohama Municipal
    "YokohamaMunicipal": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "YokohamaBlue": "../images/列车/横浜市交通局/横浜市ブルーライン.png",
    "YokohamaGreen": "../images/列车/横浜市交通局/横浜市グリーンライン.png",

    // Single-line operators
    "TWR": "../images/鉄道/東京臨海高速鉄道/臨海線.png",
    "Rinkai": "../images/鉄道/東京臨海高速鉄道/臨海線.png",
    "MIR": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/つくばエクスプレス.png",
    "Yurikamome": "../images/列车/ゆりかもめ/ゆりかもめ.png",
    "TamaMonorail": "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png",
    "ChibaUrbanMonorail": "../images/鉄道/千葉都市モノレール/千葉都市モノレール1号線.png",
    "TokyoMonorail": "../images/鉄道/東京モノレール/東京モノレール羽田空港線.png",
    "SaitamaNewUrbanTransit": "../images/鉄道/埼玉新都市交通/伊奈線.png",

    // ===== railway_data key 对齐 =====
    "MinatoMirai": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
    "NewShuttle": "../images/鉄道/埼玉新都市交通/伊奈線.png",
    "HitachiNakaKaimin": "../images/鉄道/ひたちなか海浜鉄道/湊線.png",
    "Tōnami": "../images/列车/JR東日本/只見線.png",       // 4.3.266：只見線 = GV-E400系（原GV-E400系.png 为机械面板占位图）
    "Echigo": "../images/列车/JR東日本/E129系.png",
    "Hakushin": "../images/列车/JR東日本/E129系.png",
    "Miyo": "../images/列车/JR東日本/E129系.png",
    "SuigunBranch": "../images/列车/JR東日本/水郡線.png"
  };

  function getTrainIcon(lineId, operator, trainId, stationIndex, trainType) {
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
