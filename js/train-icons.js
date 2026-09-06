/*
 * Pixel Tetsudo - Train Icon Mapping
 * 列车车型图标映射表
 * 图标来源: trainfrontview.net (32x38px)
 */
(function() {
  "use strict";

  // Vehicle deployment zones: specific rolling stock only runs on listed segments
  var VEHICLE_DEPLOYMENTS = {
    // 211系湘南色（橙×绿帯、高崎車両センター）部署区间（参考 trainfrontview.net sozai-e4 高崎地区 + 用户指定 4 路线）
    // 両毛線・吾妻線は 211 系湘南色が全普通列車を担当；上越線・信越本線は高崎側区間のみ
    "211Shonan": {
      routes: [
        { line: "Ryomo", from: "Oyama", to: "Shin-Maebashi", icon: "../images/列车/JR東日本/211系湘南色.png", priority: 1 },   // 両毛線：全線（小山〜新前橋）
        { line: "Agatsuma", from: "Shibukawa", to: "Numata", icon: "../images/列车/JR東日本/211系湘南色.png", priority: 1 },   // 吾妻線：渋川〜沼田（数据内站点）
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
        { line: "Oito", from: "Matsumoto", to: "Minami-Koya", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 2 },   // 大糸線：全线（E127 核心，包揽大量普通，优先于 211）
        { line: "Shinonoi", from: "Shiojiri", to: "Shinonoi", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }, // 篠ノ井線：普通运用（班次少于 211）
        { line: "Shinetsu", from: "Shinonoi", to: "Nagano", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }, // 信越本線長野段：极少数班次
        { line: "ChuoTatsuno", from: "Okaya", to: "Shiojiri", icon: "../images/列车/JR東日本/E127系100番台.png", priority: 1 }  // 中央本線辰野支線：区间摆渡（替代 123 系）
      ]
    },
    "E129": {
      routes: [
        { line: "Shinetsu", from: "Naoetsu", to: "Niigata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },   // 信越本線（新潟段）：直江津〜長岡〜新潟，新潟地区主力
        { line: "Hakushin", from: "Niigata", to: "Shibata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },     // 白新線：全線
        { line: "Echigo", from: "Kashiwazaki-Higashi", to: "Niigata", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },  // 越後線：柏崎側端〜吉田〜新潟（数据柏崎侧站ID为Kashiwazaki-Higashi）
        { line: "Yahiko", from: "Higashi-Sanjo", to: "Yahiko", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },   // 弥彦線：全線
        { line: "Uetsu", from: "Niitsu", to: "Murakami", icon: "../images/列车/JR東日本/E129系.png", priority: 1 },         // 羽越本線（新潟直流区間）：新津〜村上
        { line: "Joetsu", from: "Miyaike", to: "Minakami", icon: "../images/列车/JR東日本/E129系.png", priority: 1 }        // 上越線（新潟直流区間）：宮内(長岡)〜水上
      ]
    },
    // ===== 特急・観光列車（typeMatch 按 ODPT trainType 匹配；from/to 省略 = 全線）=====
    "ExpJREast": {
      routes: [
        { line: "Joban", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 3 },          // ひたち・ときわ（常磐線特急）
        { line: "JobanLocal", icon: "../images/列车/JR東日本/E657系.png", typeMatch: ["Hitachi", "Tokiwa"], priority: 3 },
        { line: "ChuoRapid", icon: "../images/列车/JR東日本/E353系.png", typeMatch: ["Azusa", "Kaiji"], priority: 3 },        // あずさ・かいじ（中央線特急）
        { line: "ChuoMain", icon: "../images/列车/JR東日本/E353系.png", typeMatch: ["Azusa", "Kaiji"], priority: 3 },
        { line: "SobuRapid", icon: "../images/列车/JR東日本/E259系.png", typeMatch: ["NaritaExpress"], priority: 3 },        // 成田エクスプレス
        { line: "Narita", icon: "../images/列车/JR東日本/E259系.png", typeMatch: ["NaritaExpress"], priority: 3 },
        { line: "Tokaido", icon: "../images/列车/JR東日本/E261系.png", typeMatch: ["SaphirOdoriko"], priority: 3 },           // サフィール踊り子
        { line: "Ito", icon: "../images/列车/JR東日本/E261系.png", typeMatch: ["SaphirOdoriko"], priority: 3 },
        { line: "SobuRapid", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami", "Wakashio", "Shiosai"], priority: 3 }, // さざなみ・わかしお・しおさい
        { line: "Uchibo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Sazanami"], priority: 3 },
        { line: "Sotobo", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Wakashio"], priority: 3 },
        { line: "Narita", icon: "../images/列车/JR東日本/E257系500番台.png", typeMatch: ["Shiosai"], priority: 3 },
        { line: "Uetsu", icon: "../images/列车/JR東日本/いなほ.png", typeMatch: ["Inaho"], priority: 3 },                     // 特急いなほ（新潟〜秋田）
        { line: "Hakushin", icon: "../images/列车/JR東日本/いなほ.png", typeMatch: ["Inaho"], priority: 3 },
        { line: "OuMain", icon: "../images/列车/JR東日本/つがる.png", typeMatch: ["Tsugaru"], priority: 3 },                  // 特急つがる（青森〜秋田）
        { line: "Shinetsu", icon: "../images/列车/JR東日本/しらゆき.png", typeMatch: ["Shirayuki"], priority: 3 },            // 特急しらゆき（新潟〜直江津）
        { line: "Joetsu", icon: "../images/列车/JR東日本/草津四万.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },       // 特急草津・四万
        { line: "Agatsuma", icon: "../images/列车/JR東日本/草津四万.png", typeMatch: ["Kusatsu", "Shima"], priority: 3 },
        { line: "Oga", icon: "../images/列车/JR東日本/さきがけ.png", typeMatch: ["Sakigake"], priority: 3 }                   // 快速さきがけ（男鹿線）
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
        { line: "OdakyuEnoshima", icon: "../images/列车/小田急電鉄/ロマンスカーEXE.png", typeMatch: ["Enoshima", "BayResort", "HomeWay", "MorningWay"], priority: 3 }, // EXE（えのしま等）
        { line: "Odawara", icon: "../images/列车/小田急電鉄/80000系.png", typeMatch: ["Hakone"], priority: 2 },              // 80000系（新はこね）
        { line: "Odawara", icon: "../images/列车/小田急電鉄/ロマンスカー.png", typeMatch: ["SuperHakone", "Hakone", "Enoshima", "HomeWay", "MorningWay", "BayResort"], priority: 1 },
        { line: "OdakyuEnoshima", icon: "../images/列车/小田急電鉄/ロマンスカー.png", typeMatch: ["SuperHakone", "Hakone", "Enoshima", "HomeWay", "MorningWay", "BayResort"], priority: 1 },
        { line: "OdakyuTama", icon: "../images/列车/小田急電鉄/ロマンスカー.png", typeMatch: ["SuperHakone", "Hakone", "Enoshima", "HomeWay", "MorningWay", "BayResort"], priority: 1 }
      ]
    },
    "ExpSeibu": {
      routes: [
        { line: "Ikebukuro", icon: "../images/列车/西武鉄道/40000系.png", typeMatch: ["Chichibu", "Musashi"], priority: 3 }, // 特急ちちぶ・むさし（40000系）
        { line: "SeibuChichibu", icon: "../images/列车/西武鉄道/40000系.png", typeMatch: ["Chichibu", "Musashi"], priority: 3 },
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
    "MIR": "../images/鉄道/横浜高速鉄道/みなとみらい線.png", // 修正：MIR=みなとみらい線（原误用TX/ブルーライン）
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
    "Oyama": "../images/列车/JR東日本/E231系近郊型.png", // JR宇都宮線（railway_data key=Oyama，原误挂在 Utsunomiya 名下）
    "Utsunomiya": "../images/列车/東武鉄道/東武宇都宮線.png", // 東武宇都宮線（修复语义冲突：railway_data 的 Utsunomiya 是東武线路）
    "Takasaki": "../images/列车/JR東日本/E231系近郊型.png",
    "Joban": "../images/列车/JR東日本/E531系.png",
    "JobanRapid": "../images/列车/JR東日本/E531系.png",
    "JobanLocal": "../images/列车/東京メトロ/18000系.png", // 常磐各停：千代田線车辆直通担当
    "Mito": "../images/列车/JR東日本/E531系.png",
    "Musashino": "../images/列车/JR東日本/武蔵野線.png",
    "Nambu": "../images/列车/JR東日本/E233系8000番台.png",
    "Yokohama": "../images/列车/JR東日本/E233系6000番台.png",
    "Tsurumi": "../images/列车/JR東日本/鶴見線.png",
    "Ome": "../images/列车/JR東日本/E233系青梅線.png",
    "Itsukaichi": "../images/列车/JR東日本/E233系0番台.png",
    "ShonanShinjuku": "../images/列车/JR東日本/E231系近郊型.png",
    "TohokuMain": "../images/列车/JR東日本/東北線.png",
    "Yamagata": "../images/列车/JR東日本/山形線.png",
    "Uetsu": "../images/列车/JR東日本/羽越線.png",
    "OuMain": "../images/列车/JR東日本/E231系近郊型.png",
    "Ryomo": "../images/列车/JR東日本/211系湘南色.png",
    "Agatsuma": "../images/列车/JR東日本/211系湘南色.png",
    "BanetsuWest": "../images/列车/JR東日本/E721系.png", // 修正：磐越西線（郡山〜喜多方）为JR路线，主力E721系（原误用東武各線）
    "Keiyo": "../images/列车/JR東日本/E233系5000番台.png", // 京葉線：E233系5000番台（原2000番台为常磐緩行線车辆，误指）
    "Karasuyama": "../images/列车/JR東日本/烏山線.png",
    "Kururi": "../images/列车/JR東日本/E131系200番台.png", // 久留里線：E131系200番台（现役主力）
    "Sagami": "../images/列车/JR東日本/相模線.png",
    "Senseki": "../images/列车/JR東日本/仙石線.png",
    "Sotobo": "../images/列车/JR東日本/外房線.png",   // 修正：外房線（此前误指内房線）
    "Suigun": "../images/列车/JR東日本/水郡線.png",
    "Uchibo": "../images/列车/JR東日本/内房線.png",   // 修正：内房線（此前误指外房線）
    "Hachiko": "../images/列车/JR東日本/八高線.png",
    "Noda": "../images/列车/東武鉄道/野田線.png",
    
    // Tokyo Metro specific
    "Ginza": "../images/列车/東京メトロ/銀座線.png",
    "Marunouchi": "../images/列车/東京メトロ/丸ノ内線.png",
    "Hibiya": "../images/列车/東京メトロ/日比谷線.png",
    "Tozai": "../images/列车/東京メトロ/東西線.png",
    "Chiyoda": "../images/列车/東京メトロ/18000系.png",
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
    "Arakawa": "../images/列车/都営地下鉄/都電荒川線.png",
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
    "SeibuEn": "../images/列车/西武鉄道/西武園線.png",
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
    "KeioMain": "../images/列车/京王電鉄/2000系.png", // 京王線：新型2000系（2026-01-31 デビュー）
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
    "MIR": "../images/鉄道/横浜高速鉄道/みなとみらい線.png", // 修正：MIR=みなとみらい線（原误指つくばエクスプレス）
    "TsukubaExpress": "../images/列车/首都圏新都市鉄道/つくばエクスプレス.png",
    "Yurikamome": "../images/列车/ゆりかもめ/ゆりかもめ.png",
    "TamaMonorail": "../images/列车/多摩都市モノレール/多摩モノレール.png",
    "ChibaUrbanMonorail": "../images/列车/千葉都市モノレール/千葉モノレール.png",
    "TokyoMonorail": "../images/列车/東京モノレール/東京モノレール.png",
    "SaitamaNewUrbanTransit": "../images/列车/埼玉新都市交通/ニューシャトル.png",

    // ===== railway_data key 对齐（4.3.265）：UNIFIED_LINES 线路 key 直查，避免 fallback 到运营商标识 =====
    "MinatoMirai": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",            // = MIR（借用线路符号，无车辆图）
    "Nippori_Toneri": "../images/列车/都営地下鉄/都営浅草線.png",               // = NipporiToneri（占位）
    "SotetsuShin-Yokohama": "../images/列车/相模鉄道/相鉄.png",                 // = SotetsuShinyokohama
    "NewShuttle": "../images/列车/埼玉新都市交通/ニューシャトル.png",            // = SaitamaNewUrbanTransit
    "HitachiNakaKaimin": "../images/鉄道/ひたちなか海浜鉄道/湊線.png",           // ひたちなか海浜鉄道湊線（借用线路符号；operator 字段 MIR 为数据遗留）
    "TokyuIkegami": "../images/列车/東急電鉄/池上多摩川線.png",                  // = Ikegami
    "TokyuKodomonokuni": "../images/列车/東急電鉄/こどもの国線.png",             // = Kodomonokuni
    "TokyuOimachi": "../images/列车/東急電鉄/大井町線.png",                      // = Oimachi
    "KeioKeibajo": "../images/列车/京王電鉄/京王.png",                           // = Keio
    "KeioSagami": "../images/列车/京王電鉄/京王.png",
    "KeioShin": "../images/列车/京王電鉄/京王.png",
    "KeioTakao": "../images/列车/京王電鉄/京王.png",
    "KeioZoo": "../images/列车/京王電鉄/京王.png",
    "OdakyuEnoshima": "../images/列车/小田急電鉄/小田急線.png",                  // = Odakyu
    "OdakyuTama": "../images/列车/小田急電鉄/小田急線.png",
    "KeiseiChiba": "../images/列车/京成電鉄/京成.png",                           // = Chiba
    "KeiseiChihara": "../images/列车/京成電鉄/京成.png",                         // = Chihara
    "KeiseiKanamachi": "../images/列车/京成電鉄/京成.png",                       // = Kanamachi
    "KeiseiOshiage": "../images/列车/京成電鉄/京成.png",                         // = Oshiage
    "NaritaSkyAccess": "../images/列车/京成電鉄/スカイライナー.png",              // = NaritaAccess
    "SeibuYamaguchi": "../images/列车/西武鉄道/山口線.png",                       // = Yamaguchi
    "SuigunBranch": "../images/列车/JR東日本/水郡線.png",                        // 水郡線支線（同本线车辆）
    "Tōnami": "../images/列车/JR東日本/GV-E400系.png",                           // 只見線：GV-E400系気動車
    "Echigo": "../images/列车/JR東日本/E129系.png",                              // 越後線：E129系（新潟車両センター）
    "Hakushin": "../images/列车/JR東日本/E129系.png",                            // 白新線：E129系
    "Miyo": "../images/列车/JR東日本/E129系.png",                                // 弥彦線：E129系
    "Senzan": "../images/列车/JR東日本/E721系.png"                               // 仙山線：E721系（仙台地区）
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
        // 特急等按列車種別（trainType）匹配；URI 形式 odpt.TrainType:JR-East.Hitachi → Hitachi
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
            // 特急/種別条件：typeMatch 指定がある場合は trainType の typeName で部分一致（大小写不敏感）
            if (r.typeMatch) {
              if (!typeName) return;
              var matched = false;
              for (var i = 0; i < r.typeMatch.length; i++) {
                if (typeName.toLowerCase().indexOf(String(r.typeMatch[i]).toLowerCase()) >= 0) { matched = true; break; }
              }
              if (!matched) return;
            }
            // 区间条件：from/to 省略 = 全线；省略其一 = 单侧无界
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
