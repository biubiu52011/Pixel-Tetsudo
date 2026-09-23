/*
 * Pixel Tetsudo - Train Vehicle Resolver（专用合成脚本）
 * v4.3.962
 *
 * 由 .work/build-train-vehicle-resolver.js 自动生成——数据来源：
 *   js/train-icons.js（LINE_ICONS / OPERATOR_ICONS / VEHICLE_DEPLOYMENTS /
 *     THROUGH_PREFIX_RULES / THROUGH_SUFFIX_RULES / TRAIN_TYPE_ICON_RULES /
 *     LINE_ICON_OVERRIDES / 图标规则）
 *   data/timetables/vehicle-type-map.js（LINE_GROUP / MAP / 查表）
 * 重新生成：node .work/build-train-vehicle-resolver.js
 *
 * 特性：
 *   - 自包含：不依赖浏览器全局（UNIFIED_LINES / TransitConstants 可选增强），
 *     数据与算法全部内联，可直接被 Node require 或浏览器 <script> 加载。
 *   - 双环境：浏览器挂 window.TrainVehicleResolver；Node 支持 module.exports。
 *   - CLI：node train-vehicle-resolver.js --resolve "lineId,trainNumber,trainTypeURN,destURN[,operator]"
 *   - 判定原则（不猜）：车型名 S0-S3 实证优先；无实证时仅采用人工核验的图标推定名
 *     （S4，source='icons', confidence='low'，排除 E235系山手线 乱入非山手线）；
 *     图标始终有值（S0-S3 候选 -> 图标库，无候选 -> S4 图标规则兜底）。
 *
 * 数据源（可信度从高到低）：
 *   S0 manual 内嵌 vehicleType（时刻表直带，ODPT 官方/人工核验）
 *   S1 odpt 实时 vehicleType（ODPT Train 字段，接口可用时接入）
 *   S2 车号->车型候选累积表（registerVehicle 注册，按车号跨线去重）
 *   S3 VehicleTypeMap 静态查表（种别 x 直通先 operator）
 *   S4 图标规则（线路/运营商/车号规则/部署区间——仅图标，不宣称车型）
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TrainVehicleResolver = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // ============================================================
  // 数据：图标规则（来自 train-icons.js）
  // ============================================================

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
  }

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
    "MinatoMirai": "../images/列车/東急電鉄/5050系.png"
  }

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
    "Tojo": "../images/列车/東武鉄道/60000系.png",
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
    "TokaidoMain": "../images/列车/JR東日本/E233系湘南色.png", // 東海道本線：上野東京ライン系統（Tokaido 同一車両）
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
    "UtsunomiyaJR": "../images/列车/JR東日本/E233系湘南色.png", // 4.3.481：键名修正 Oyama→UtsunomiyaJR（Oyama 是车站 ID，线路 ID 是 UtsunomiyaJR，错键导致宇都宮線 fallback E235）；上野東京ライン同一車両
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
    "Daishi_Tobu": "../images/列车/東武鉄道/1000系.png" // 東武大師線：1000系（現役主力）
  }

var THROUGH_SUFFIX_RULES = {
    "Keiyo": [
      { suffix: "E", icon: "../images/列车/JR東日本/E231系0番台.png" }
    ],
    "Musashino": [
      { suffix: "Y", icon: "../images/列车/JR東日本/E233系5000番台.png" }
    ]
  }

var THROUGH_PREFIX_RULES = {
    "Hanzomon": [
      { prefix: "B", icon: "../images/列车/東武鉄道/50000系.png" }
    ],
    // v4.3.928: 千代田線 B プレフィックス = JR 常磐線各駅停車との直通車（E233系2000番台）。
    // ODPT vehicleType 実測: "JR E233系"。小田急との直通は特急ロマンスカーのみ。
    "Chiyoda": [
      { prefix: "B", icon: "../images/列车/JR東日本/E233系2000番台.png" }
    ]
  }

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
  ]

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
    // Rinkai: TWR 自有车按运用号后两位（71/73/81 → 71-000形，其他 → 70-000形）
    { lines: ['Rinkai'], op: 'TWR', fn: function(trainId, tn) {
      var _tnNum = String(tn || '').replace(/[^0-9]/g, '');
      var lastTwo = _tnNum.length >= 2 ? parseInt(_tnNum.slice(-2)) : 0;
      return [71, 73, 81].indexOf(lastTwo) >= 0
        ? '../images/列车/東京臨海高速鉄道/71-000形.png'
        : '../images/列车/東京臨海高速鉄道/70-000形.png';
    }},
  ]

  var VEHICLE_NAME_TO_ICON = {};
  (function buildVehicleNameIndex() {
    var seen = {};
    function add(path) {
      if (!path || seen[path]) return;
      seen[path] = true;
      var name = String(path).split('/').pop().replace(/\.png$/i, '');
      if (name && !VEHICLE_NAME_TO_ICON[name]) VEHICLE_NAME_TO_ICON[name] = path;
    }
    Object.keys(LINE_ICONS).forEach(function(k){ add(LINE_ICONS[k]); });
    Object.keys(OPERATOR_ICONS).forEach(function(k){ add(OPERATOR_ICONS[k]); });
    Object.keys(VEHICLE_DEPLOYMENTS).forEach(function(vk){
      VEHICLE_DEPLOYMENTS[vk].routes.forEach(function(r){ if (r.icon) add(r.icon); });
    });
  })();

  // ============================================================
  // 数据：VehicleTypeMap 查表（来自 vehicle-type-map.js）
  // ============================================================

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
  }

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
  }

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
    'TokyuOimachi': {
      'Local': { 'default': '6020系（5両） / 9000系 / 9020系', 'TokyuDenEn': '6020系（5両） / 9000系 / 9020系 / 5000系 / 2020系' },
      'Express': { 'default': '6020系（7両） / 6000系', 'TokyuDenEn': '6020系（7両） / 6000系 / 5000系 / 2020系' },
    },
    'TobuNikko': {
      'Local': { 'default': '東武50000系 / 50050系 / 10000型 / 10030型 / 10050型' },
      'Express': { 'default': '東武50000系 / 50050系 / 10000型 / 10030型 / 10050型' },
      'SemiExpress': { 'default': '東武50000系 / 50050系 / 10000型 / 10030型 / 10050型' },
      'SectionExpress': { 'default': '東武50000系 / 50050系 / 10000型 / 10030型 / 10050型' },
      'SectionSemiExpress': { 'default': '東武50000系 / 50050系 / 10000型 / 10030型 / 10050型' },
      'LimitedExpress': { 'default': 'N100系「スペーシアX」 / 100系「スペーシア」 / 500系「リバティ」', 'destStation': { 'AizuTajima': '500系「リバティ会津」', 'Shinjuku': '500系「リバティ」' } },
    },
    'TokyuMeguro': {
      'Local': { 'default': '3000系 / 5080系 / 3020系', 'TokyoMetro': '3000系 / 5080系 / 3020系 / 東京メトロ9000系', 'Toei': '3000系 / 5080系 / 3020系 / 都営6300形 / 6500形', 'SaitamaRailway': '3000系 / 5080系 / 3020系 / 埼玉高速2000系', 'Sotetsu': '3000系 / 5080系 / 3020系 / 相鉄20000系', 'SotetsuShin-Yokohama': '3000系 / 5080系 / 3020系 / 相鉄20000系' },
      'Express': { 'default': '3000系 / 5080系 / 3020系', 'TokyoMetro': '3000系 / 5080系 / 3020系 / 東京メトロ9000系', 'Toei': '3000系 / 5080系 / 3020系 / 都営6300形 / 6500形', 'SaitamaRailway': '3000系 / 5080系 / 3020系 / 埼玉高速2000系', 'Sotetsu': '3000系 / 5080系 / 3020系 / 相鉄20000系', 'SotetsuShin-Yokohama': '3000系 / 5080系 / 3020系 / 相鉄20000系' },
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
        'Sotetsu': '東急5050系 / 相鉄20000系'
      },
      'Express': {
        'default': '東京メトロ17000系 / 10000系',
        'TokyoMetro': '東京メトロ17000系 / 10000系',
        'Minatomirai': '東京メトロ17000系 / 東急5050系 / 横浜高速Y500系',
        'Tobu': '東京メトロ17000系 / 東武50070系',
        'Seibu': '東京メトロ17000系 / 西武40000系 / 6000系',
        'Sotetsu': '東急5050系 / 相鉄20000系'
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
        'Sotetsu': '東急5050系 / 相鉄20000系'
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
        'Hokuso': '都営5500形 / 北総7500形 / 北総9100形'
      },
      'AccessExpress': {
        'default': '都営5500形 / 京成3000形',
        'Keisei': '都営5500形 / 京成3000形 / 京成3100形'
      },
      'Rapid': {
        'default': '都営5300形 / 5500形',
        'Keikyu': '都営5300形 / 5500形 / 京急1000形 / 京急1500形',
        'Shibayama': '都営5500形 / 京成3000形'
      },
      'AirportRapidLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keisei': '都営5500形 / 京成3000形 / 京成3100形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形'
      },
      'RapidLimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形',
        'Keisei': '都営5500形 / 京成3000形',
        'Shibayama': '都営5500形 / 京成3000形'
      },
      'LimitedExpress': {
        'default': '都営5500形 / 京急1000形',
        'Keikyu': '都営5500形 / 京急1000形 / 京急1500形',
        'Keisei': '都営5500形 / 京成3000形 / 京成3700形',
        'Hokuso': '都営5500形 / 北総7500形',
        'Shibayama': '都営5500形 / 京成3000形'
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
        'Sotetsu': '東急3000系 / 5080系 / 3020系 / 相鉄21000系'
      },
      'Express': {
        'default': '都営6300形 / 6500形',
        'Tokyu': '都営6300形 / 6500形 / 東急3000系 / 5080系 / 3020系',
        'Sotetsu': '東急3000系 / 5080系 / 3020系 / 相鉄21000系'
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
        'Sotetsu': '東急5050系'
      },
      'SemiExpress': {
        'default': '東武5000系 / 10000系 / 9000系'
      },
      'Express': {
        'default': '東武5000系 / 50070系 / 9000系 / 10000系',
        'Minatomirai': '東武50070系 / 9000系（Fライナー・みなとみらい直通）',
        'Sotetsu': '東急5050系'
      },
      'RapidExpress': {
        'default': '東武5000系 / 50070系 / 9000系 / 10000系',
        'Minatomirai': '東武50070系 / 9000系（Fライナー）',
        'Sotetsu': '東急5050系'
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
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'Rapid': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'SemiExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'Express': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'KeioLiner': { 'default': '5000系' },
    },
    'KeioMain': {
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'Rapid': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'SemiExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'Express': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'KeioLiner': { 'default': '5000系' },
    },

    // ================================================================
    // 相鉄 3 線
    // ================================================================
    'SotetsuMain': {
      'Local': {
        'default': '80000系 / 11000系 / 9000系 / 7000系 / 10000系',
        'JR-East': '相鉄12000系 / JR E233系7000番台',
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
        'JR-East': '相鉄12000系 / JR E233系7000番台',
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
        'JR-East': '相鉄12000系 / JR E233系7000番台',
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
        'JR-East': '相鉄12000系 / JR E233系7000番台',
        'Tokyu': '相鉄20000系 / 21000系 / 東急5050系 / 3000系',
        'TokyoMetro': '相鉄20000系 / 21000系 / メトロ17000系 / 9000系',
        'Toei': '相鉄21000系 / 都営6300形 / 6500形',
        'Tobu': '相鉄20000系 / 東武50070系',
        'SaitamaRailway': '相鉄21000系 / 埼玉高速2000系',
      },
      'LimitedExpress': {
        'default': '相鉄20000系 / 21000系',
        'JR-East': '相鉄12000系 / JR E233系7000番台',
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
      'LimitedExpress': { 'default': 'E353系（あずさ・かいじ）' },
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
      'Local': { 'default': '209系3100番台 / E233系7000番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系', 'TWR': 'E233系7000番台 / 70-000形' },
      'Rapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系', 'TWR': 'E233系7000番台 / 70-000形' },
      'CommuterRapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系', 'TWR': 'E233系7000番台 / 70-000形' },
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
      'Local': { 'default': '209系2000番台 / E231系' },
      'Rapid': { 'default': '209系2000番台 / E231系' },
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
      'Local': { 'default': '70-000形', 'JR-East': 'E233系7000番台' },
      'Rapid': { 'default': '70-000形', 'JR-East': 'E233系7000番台' },
      'CommuterRapid': { 'default': '70-000形', 'JR-East': 'E233系7000番台' },
    },
    'Saikyo': {
      'Local': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
      'Rapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
      'CommuterRapid': { 'default': 'E233系7000番台', 'Sotetsu': '相鉄12000系 / 相鉄新7000系' },
    },
    'ShonanShinjuku': {
      'Local': { 'default': 'E231系1000番台 / E233系1000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'LimitedExpress': { 'default': 'E253系（日光・きぬがわ）' },
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
      'Rapid': { 'default': 'E233系 / E235系1000番台' },
      'Local': { 'default': 'E233系 / E235系1000番台' },
      'LimitedExpress': { 'default': 'E257系500番台（わかしお）' },
    },
    'Takasaki': {
      'Local': { 'default': 'E231系1000番台 / E233系3000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系3000番台' },
      'LimitedExpress': { 'default': 'E257系（草津・四萬・あかぎ）' },
    },
    'Tokaido': {
      'Local': { 'default': 'E231系1000番台 / E233系1000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系1000番台' },
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
      'LimitedExpress': { 'default': 'E253系（日光・きぬがわ）' },
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
      'Local': { 'default': '211系 / E233系0番台', 'JR-East': '211系 / E233系0番台' },
      'Rapid': { 'default': '211系 / E233系0番台', 'JR-East': '211系 / E233系0番台' },
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
        'Toei': '京成3000形 / 3050形 / 都営5500形（浅草線直通）',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'Rapid': {
        'default': '3000形 / 3050形 / 3700形 / 3600形',
        'Toei': '京成3000形 / 3050形 / 都営5500形（浅草線直通）',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'LimitedExpress': {
        'default': '3000形 / 3050形 / 3700形（特急）',
        'Toei': '京成3000形 / 3050形 / 都営5500形（浅草線直通）',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'RapidLimitedExpress': {
        'default': '3000形 / 3050形 / 3700形（快速特急）',
        'Toei': '京成3000形 / 3050形 / 都営5500形（浅草線直通）',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'CommuterLimitedExpress': {
        'default': '3000形 / 3050形 / 都営5500形（通勤特急）',
        'Toei': '京成3000形 / 3050形 / 都営5500形（浅草線直通）',
        'Keikyu': '京急1500形 / 600形 / 都営5500形 / 京成3000形'
      },
      'AccessExpress': {
        'default': '3100形 / 3050形（スカイアクセス）',
        'Toei': '京成3100形 / 3050形 / 都営5500形',
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
      'Local': { 'default': '701系 / E721系' },
      'Rapid': { 'default': '701系 / E721系' },
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
      'Rapid': { 'default': '211系' },
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
      'Local': { 'default': '701系 / E721系' }
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
      'Local': { 'default': '新2000系（2000系）/ 8000系' }
    },
    'SeibuChichibu': {
      'Local': { 'default': '4000系 / 7000系' },
      'LimitedExpress': { 'default': '40000系（Laview）' },
      'S-TRAIN': { 'default': '40000系（Laview）' }
    },
    'SeibuEn': {
      'Local': { 'default': '新101系 / 9000系' }
    },
    'SeibuShinjuku': {
      'Local': { 'default': '2000系 / 20000系 / 30000系' },
      'Express': { 'default': '2000系 / 20000系 / 30000系' },
      'SemiExpress': { 'default': '2000系 / 20000系 / 30000系' },
      'CommuterExpress': { 'default': '2000系 / 20000系 / 30000系' },
      'RapidExpress': { 'default': '2000系 / 20000系 / 30000系' },
      'LimitedExpress': { 'default': '10000系（レッドアロー）' },
      'HaijimaLiner': { 'default': '40000系（Laview）' }
    },
    'SeibuTamagawa': {
      'Local': { 'default': '新101系（ワンマン専用塗装）/ 7000系（候補）' }
    },
    'SeibuTamako': {
      'Local': { 'default': '新101系（ワンマン）/ 7000系' }
    },
    'SeibuToshima': {
      'Local': { 'default': '2000系（8両編成・池袋線直通）' }
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
      'Local': { 'default': '1000系' },
    },
    'Marunouchi': {
      'Local': { 'default': '2000系' },
    },
    'MarunouchiBranch': {
      'Local': { 'default': '2000系' },
    },
    'ChiyodaBranch': {
      'Local': { 'default': '16000系 / 05系' },
    },
    'Oedo': {
      'Local': { 'default': '12-000形 / 12-600形' },
    },
    'Arakawa': {
      'Local': { 'default': '7700形 / 8800形 / 8900形 / 9000形' },
    },
    'Nippori_Toneri': {
      'Local': { 'default': '330形' },
    },

    // --- 東武ローカル（小泉・佐野・桐生は 10000 系系譜に統一進行中） ---
    'TobuUtsunomiya': {
      'Local': { 'default': '20400型' },
    },
    'Noda': {
      'Local': { 'default': '8000系 / 10030系 / 60000系 / 80000系' },
      'Express': { 'default': '8000系 / 10030系 / 60000系 / 80000系' },
      'SectionExpress': { 'default': '8000系 / 10030系 / 60000系 / 80000系' },
    },
    'Daishi_Tobu': {
      'Local': { 'default': '8000系' },
    },
    'Kiryu': {
      'Local': { 'default': '10000型 / 10030型50番台' },
      'LimitedExpress': { 'default': '500系（リバティりょうもう）/ 200型（りょうもう）' },
    },
    'Koizumi': {
      'Local': { 'default': '10000系10050型' },
    },
    'Ogose': {
      'Local': { 'default': '8000系' },
    },
    'Sano': {
      'Local': { 'default': '10000系10000型 / 10050型' },
      'LimitedExpress': { 'default': '500系（リバティりょうもう）' },
    },
    'Tobu_Kameido': {
      'Local': { 'default': '10000型 / 10030型' },
    },
    'Nikkoku': {
      'Local': { 'default': '20400型', 'Aizu': '6050系100番台' },
      'Rapid': { 'default': '20400型', 'Aizu': '6050系100番台' },
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
      'Local': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'Rapid': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'SemiExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'Express': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
      'LimitedExpress': { 'default': '7000系 / 8000系 / 9000系 / 5000系', 'Toei': '7000系 / 8000系 / 9000系 / 5000系 / 都営10-300形' },
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
      'Local': { 'default': 'E235系' },
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
      'Local': { 'default': 'E231系1000番台 / E233系1000番台' },
      'Rapid': { 'default': 'E231系1000番台 / E233系1000番台' },
      'SpecialRapid': { 'default': 'E231系1000番台 / E233系1000番台' },
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
  }

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
        if (op) {
          dgroup = op;
        }
        // フォールバック: operator が空またはマッチしない場合 railway 短名で LINE_GROUP
        if (!tmap[dgroup]) {
          var rw = parts[2] || '';
          dgroup = LINE_GROUP[rw] || '';
        }
      }
      if (tmap['destStation'] && parts) {
      var stName = parts[parts.length - 1] || '';
      var stVt = tmap['destStation'][stName];
        if (stVt) { _lastVt = { name: stVt, exact: true }; return stVt; }
    }
    var _vt = (dgroup && tmap[dgroup]) || tmap['default'] || '';
      if (_vt) { _lastVt = { name: _vt, exact: _exactType }; }
      return _vt;
    } catch(e) { return ''; }
  }

  var _lastVt = null;
  function _getLastMeta() { return _lastVt; }
  function getLastMeta() { return _getLastMeta(); }


  // ============================================================
  // 算法：S4 图标规则——逐字内联 train-icons.js 的 _resolveTrainIcon
  // Node 环境调用前 patch window.UNIFIED_LINES shim（部署区间规则需站表；stations 由 ctx 传入）
  // ============================================================
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

function getTrainClass(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    try {
      var icon = _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator);
      var name = String(icon || '').split('/').pop();
      name = name.replace(/\.png$/i, '');
      return name || '';
    } catch(e) { return ''; }
  }


// v4.3.964: 车型名别名表（同步自 train-icons.js VEHICLE_NAME_ALIASES）
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
    "東武20000系": "20000系",
    "東武30000系": "30000系",
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
    "30000形 EXEα": "30000系",
    "20000形": "20000系",
    "50000形": "50000系",
    "9020系": "9000系",
    "相鉄20000系": "20000系",
    "相鉄新7000系": "7000系",
    "相鉄12000系": "13000系",
    "7500系（7000系は全廃）": "7500系",
    "東急5050系": "5050系",
    "5050系4000番台": "5050系",
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
    "E253系（日光・きぬがわ）": "E259系",
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
  };


function resolveVehicleIcon(candidatesStr) {
    if (!candidatesStr) return null;
    var parts = String(candidatesStr).split("/");
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].trim();
      if (!name) continue;
      if (VEHICLE_NAME_TO_ICON[name]) return VEHICLE_NAME_TO_ICON[name];
      var _al = VEHICLE_NAME_ALIASES[name];
      if (_al && VEHICLE_NAME_TO_ICON[_al]) return VEHICLE_NAME_TO_ICON[_al];
      var _base = name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").trim();
      if (_base !== name) {
        if (VEHICLE_NAME_TO_ICON[_base]) return VEHICLE_NAME_TO_ICON[_base];
        var _al2 = VEHICLE_NAME_ALIASES[_base];
        if (_al2 && VEHICLE_NAME_TO_ICON[_al2]) return VEHICLE_NAME_TO_ICON[_al2];
      }
    }
    return null;
  }   return null;
  }

  // 适配层：resolver 暴露的 API 是 resolveTrainIconByRules(lineId, operator, trainId, stationIndex, trainType, byOperator, stations)
  // 而 _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator) 内部用 window.UNIFIED_LINES[lineId].stations
  // Node 环境调用前 patch window.UNIFIED_LINES shim（部署区间规则需站表；stations 由 ctx 传入）
  function resolveTrainIconByRules(lineId, operator, trainId, stationIndex, trainType, byOperator, stations) {
    if (stations && typeof window !== 'undefined') {
      var had = window.UNIFIED_LINES && window.UNIFIED_LINES[lineId];
      if (!had) {
        if (!window.UNIFIED_LINES) window.UNIFIED_LINES = {};
        window.UNIFIED_LINES[lineId] = { stations: stations };
      }
    }
    var _r = _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator);
    return _r || '../images/列车/JR東日本/E235系山手線.png';
  }

  // S2 车号 -> 车型候选 累积表
  // ============================================================
  var TRAIN_NO_VEHICLE = {};

  function registerVehicle(trainNumber, vehicleTypeStr) {
    if (!trainNumber || !vehicleTypeStr) return;
    var exist = TRAIN_NO_VEHICLE[trainNumber] || (TRAIN_NO_VEHICLE[trainNumber] = []);
    String(vehicleTypeStr).split('/').forEach(function(s) {
      var c = s.trim();
      if (c && exist.indexOf(c) < 0) exist.push(c);
    });
  }

  function getCandidates(trainNumber) {
    if (!trainNumber) return [];
    var key = String(trainNumber);
    if (TRAIN_NO_VEHICLE[key]) return TRAIN_NO_VEHICLE[key];
    if (key.indexOf('_') >= 0) {
      var parts = key.split('_');
      for (var i = parts.length - 1; i >= 1; i--) {
        var cand = parts.slice(i).join('_');
        if (TRAIN_NO_VEHICLE[cand]) return TRAIN_NO_VEHICLE[cand];
      }
    }
    return [];
  }

  // ============================================================
  // 主判定：聚合 S0-S4 -> 交叉验证 -> 决策
  // ============================================================
  function splitCandidates(str) {
    var out = [];
    if (!str) return out;
    String(str).split('/').forEach(function(s) {
      var c = s.trim();
      if (c && out.indexOf(c) < 0) out.push(c);
    });
    return out;
  }

  function resolveIconForName(name) {
    if (!name) return '';
    var candidates = String(name).split('/');
    for (var i = 0; i < candidates.length; i++) {
      var hit = VEHICLE_NAME_TO_ICON[candidates[i]];
      if (hit) return hit;
    }
    return '';
  }

  /**
   * 统一判定。
   * @param {Object} ctx
   *   lineId          本地线路 ID（必填）
   *   operator        车籍运营商纯名（如 JR-East / TWR / Tokyu）
   *   trainNumber     纯车号
   *   stationIndex    当前站 index（number，可选——部署区间需要）
   *   trainType       odpt:trainType URN 或短名
   *   destinationStation 终点站 URN（数组或字符串）
   *   vehicleTypeManual  S0：时刻表内嵌 vehicleType
   *   odptVehicleType    S1：ODPT 实时 vehicleType（预留）
   *   stations        线路站表数组（可选——部署区间规则需要）
   *   byOperator      直通车按车籍（跳过线路默认）
   *   trainId         完整 trainId（用于图标规则車号解析；缺省用 trainNumber_站点）
   * @returns {{name:string, candidates:string[], source:string, confidence:string, iconPath:string, vehicleTypeStr:string}}
   */
  function resolve(ctx) {
    ctx = ctx || {};
    var lineId = ctx.lineId || '';
    var operator = String(ctx.operator || '').replace(/^odpt\./, '');
    var trainNumber = ctx.trainNumber || '';
    var trainType = ctx.trainType || '';
    var dest = ctx.destinationStation || '';
    var stationIndex = (typeof ctx.stationIndex === 'number') ? ctx.stationIndex : undefined;

    var pool = {};
    var orderArr = [];
    function addFrom(str, src) {
      splitCandidates(str).forEach(function(c) {
        var rec = pool[c];
        if (!rec) {
          rec = pool[c] = { sources: [], count: 0 };
          orderArr.push(c);
        }
        if (rec.sources.indexOf(src) < 0) rec.sources.push(src);
        rec.count++;
      });
    }

    addFrom(ctx.vehicleTypeManual, 'manual');
    addFrom(ctx.odptVehicleType, 'odpt');
    getCandidates(trainNumber).forEach(function(c) {
      var rec = pool[c];
      if (!rec) {
        rec = pool[c] = { sources: [], count: 0 };
        orderArr.push(c);
      }
      if (rec.sources.indexOf('trainNo') < 0) rec.sources.push('trainNo');
      rec.count++;
    });
    var mapStr = '';
    try { mapStr = resolveVehicleType(lineId, trainType, dest); } catch(e) {}
    addFrom(mapStr, 'map');
      var _mapMeta = (typeof getLastMeta === 'function') ? getLastMeta() : null;

    var order = ['manual', 'odpt', 'trainNo', 'map'];
    var chosen = '';
    var chosenSrc = '';
    for (var oi = 0; oi < order.length; oi++) {
      var srcName = order[oi];
      var found = null;
      Object.keys(pool).forEach(function(c) {
        if (!found && pool[c].sources.indexOf(srcName) >= 0) found = c;
      });
      if (found) { chosen = found; chosenSrc = srcName; break; }
    }

    var confidence = 'none';
    var crossCount = chosen && pool[chosen] ? pool[chosen].count : 0;
    if (chosenSrc === 'manual' || chosenSrc === 'odpt') confidence = 'high';
    else if (chosenSrc === 'trainNo') confidence = crossCount >= 2 ? 'high' : 'medium';
      else if (chosenSrc === 'map') confidence = (_mapMeta && _mapMeta.exact === false) ? 'low' : 'medium';
    else if (chosenSrc === 'icons') confidence = 'low';

    var iconPath = chosen ? resolveIconForName(chosen) : '';
    if (!iconPath) {
      var trainId = ctx.trainId || ((trainNumber || '') + '_' + (stationIndex || 0));
      iconPath = resolveTrainIconByRules(lineId, operator, trainId, stationIndex, trainType, !!ctx.byOperator, ctx.stations) || '';
    }

    // 推定名兜底（S4）：S0-S3 无依据时，用图标规则命中的图标文件名作为推定车型——
    // LINE_ICONS/部署区间/运营商图标均为人工按 ODPT 时刻表与部署核验的线路主力车型，
    // 非模型臆测（source='icons', confidence='low'）。唯一排除项：终极兜底 E235系山手线
    // 不得用于非山手线（避免"东京通勤车乱入地方线"旧病复发）。
    if (!chosen && iconPath) {
      var _iconName = String(iconPath).split('/').pop().replace(/\.png$/i, '');
      if (_iconName && !(_iconName === 'E235系山手線' && lineId !== 'Yamanote')) {
        chosen = _iconName;
        chosenSrc = 'icons';
        confidence = 'low';
      }
    }

    return {
      name: chosen,
      candidates: orderArr,
      sources: chosen ? (pool[chosen] ? pool[chosen].sources.slice() : (chosenSrc ? [chosenSrc] : [])) : [],
      source: chosenSrc,
      confidence: confidence,
      iconPath: iconPath,
      vehicleTypeStr: orderArr.join(' / ')
    };
  }

  function getName(ctx) { return resolve(ctx).name; }
  function getIconPath(ctx) { return resolve(ctx).iconPath; }

  // ============================================================
  // CLI
  // ============================================================
  function cli(argv) {
    var args = argv.slice(2);
    if (args[0] === '--resolve' && args[1]) {
      var parts = String(args[1]).split(',');
      var r = resolve({
        lineId: parts[0] || '',
        trainNumber: parts[1] || '',
        trainType: parts[2] || '',
        destinationStation: parts[3] || '',
        operator: parts[4] || ''
      });
      console.log(JSON.stringify(r, null, 2));
      return;
    }
    if (args[0] === '--register' && args[1] && args[2]) {
      registerVehicle(args[1], args[2]);
      console.log('registered:', args[1], '->', getCandidates(args[1]).join(' / '));
      return;
    }
    console.log('Pixel Tetsudo TrainVehicleResolver v4.3.962');
    console.log('用法:');
    console.log('  node train-vehicle-resolver.js --resolve "lineId,trainNumber,trainTypeURN,destURN[,operator]"');
    console.log('  node train-vehicle-resolver.js --register "车号" "车型候选"');
  }

  return {
    version: '4.3.962',
    resolve: resolve,
    getName: getName,
    getIconPath: getIconPath,
    registerVehicle: registerVehicle,
    getCandidates: getCandidates,
    resolveTrainIconByRules: resolveTrainIconByRules,
    resolveVehicleType: resolveVehicleType,
    VEHICLE_NAME_TO_ICON: VEHICLE_NAME_TO_ICON,
    LINE_ICONS: LINE_ICONS,
    OPERATOR_ICONS: OPERATOR_ICONS,
    VEHICLE_DEPLOYMENTS: VEHICLE_DEPLOYMENTS,
    TRAIN_TYPE_ICON_RULES: TRAIN_TYPE_ICON_RULES,
    LINE_ICON_OVERRIDES: LINE_ICON_OVERRIDES,
    MAP: MAP,
    LINE_ALIAS_MAP: LINE_ALIAS_MAP,
    _table: function() { return TRAIN_NO_VEHICLE; },
    cli: cli
  };
});

// 直接运行（node train-vehicle-resolver.js --resolve ...）时执行 CLI
if (typeof module === 'object' && module.exports && typeof require === 'function' && require.main === module) {
  module.exports.cli(process.argv);
}
